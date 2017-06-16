from django.db import models
import os
import json
import ConfigParser
from subprocess import call
from django.conf import settings
from rest_framework import serializers
from api.models.trainer import Trainer
from api.models.dataset import Dataset
from api.lib import hadoop
from api.lib.fab_helper import create_score_extended_folder, \
    map_model_name_with_folder, \
    read_remote, \
    remote_mkdir_for_score_story
from api.views.joblog import submit_masterjob
from api.helper import generate_nested_list_from_nested_dict

EMR_INFO = settings.EMR
emr_home_path = EMR_INFO.get('home_path')


def check_blank_object(object):
    keys = object.keys()
    if len(keys) > 0:
        return False
    else:
        return True

class Score(models.Model):

    name = models.CharField(max_length=300, null=True)
    trainer = models.ForeignKey(Trainer, null=False)
    dataset = models.ForeignKey(Dataset, null=False)
    userId = models.CharField(max_length=100, null=True)
    details = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    model_data = models.TextField(default="{}")
    analysis_done = models.CharField(max_length=100, default="FALSE")
    app_id = models.CharField(max_length=10, default="0")

    score_folders = [
        "Results",
        "Summary"
    ]

    score_story_folders = [
        "narratives",
        "results"
    ]

    score_story_sub_folders = [
        "FreqDimension",
        "ChiSquare"
    ]

    @classmethod
    def make(cls, details, userId):

        print "make--->"
        print details
        obj = cls(userId=userId)
        obj.name = details.get("name")
        obj.trainer_id = details.get("trainer_id")
        obj.dataset_id = details.get("dataset_id")
        obj.details = json.dumps(details)
        obj.set_app_id(details.get("app_id"))

        obj.save()

        # create local folder for score and config
        print "create local folder for score and config"
        obj.setup_local_storage_folder()

        # create folder structure at EMR and also for story in score
        print "create folder structure at EMR"
        obj.setup_emr_storage_folder()

        # read model summary data
        print "set model_data to model summary. It will be used while create config for score and score response"
        obj.set_model_summary_data()


        print "config_creation"
        # obj.create_configuration_file()
        obj.create_configuration_file()

        # copy config from local to hadoop
        obj.run_save_config()

        # call script
        obj.run_master()

        obj.analysis_done = 'TRUE'
        obj.save()

        return obj

    def local_base_directory(instance):
        return "uploads/score/{0}".format(instance.id)

    def get_config_filename(self):
        return str(self.trainer_id) + "_model_" + str(self.id) + "_score_" + "config.cfg"

    def get_local_config_folder(self):
        return self.local_base_directory()

    def get_local_config_file(self):
        return self.local_base_directory() + '/' + self.get_config_filename()

    def get_hadoop_config_folder(self):
        return "{0}/configs/scores/".format(emr_home_path)

    def get_hadoop_config_file(self):
        configpath = self.get_hadoop_config_folder() + self.get_config_filename()
        return configpath

    def setup_local_storage_folder(self):
        dir = self.local_base_directory()
        print("looking for " + dir)
        if not os.path.exists(dir):
            os.makedirs(dir)
        else:
            print("you are already there")

    def base_emr_storage_folder(self):
        return "{0}/scores/{1}".format(emr_home_path, str(self.id))

    def hadoop_score_storage_name(self):
        return self.score_folders

    def setup_hadoop_storage_folder(self):
        score_folders = self.hadoop_score_storage_name()

        for s_f in score_folders:
            dir_name = "{0}/{1}".format(
                self.base_hadoop_storage_folder(),
                s_f
            )
            hadoop.hadoop_mkdir(dir_name)

    def setup_emr_storage_folder(self):
        create_score_extended_folder(self.id)
        remote_mkdir_for_score_story(self.id)

    def set_model_summary_data(self):
        details = self.get_details()
        model_name = details['model_name']
        self.model_data = json.dumps(self.read_models_summary(model_name=model_name))

    def run_save_config(self):
        call([
            "sh", "api/lib/run_save_config.sh",
            settings.HDFS['host'],
            settings.BASE_DIR + "/" + self.get_local_config_file(),
            "scores/" + self.get_config_filename()
        ])

    def get_details(self):
        import json
        details = json.loads(self.details)
        return details

    def get_folder_name(self, model_name):
        return map_model_name_with_folder[model_name]

    def create_configuration_file(self):

        details = self.get_details()
        print details
        model_name = details['model_name']
        model_summary = json.loads(self.model_data)["modelSummary"]
        self.model_column_data = self.trainer.get_column_data()

        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")

        config.set('FILE_SETTINGS', 'InputFile', hadoop.hadoop_get_full_url(self.dataset.get_input_file_storage_path()))
        config.set('FILE_SETTINGS',
                   'ModelPath',
                   self.trainer.get_emr_model_storage_folder() + "/" + self.get_folder_name(model_name) + "/TrainedModels/model.pkl"
                   )
        config.set('FILE_SETTINGS', 'ScorePath', self.base_emr_storage_folder())
        config.set('FILE_SETTINGS', 'FolderName', ", ".join(self.score_folders + self.score_story_folders))
        if "trained_model_features" in model_summary.keys():
            config.set('FILE_SETTINGS', 'ModelFeatures', model_summary["trained_model_features"])

        config.add_section("COLUMN_SETTINGS")

        config.set('COLUMN_SETTINGS', 'analysis_type', "Scoring")
        config.set('COLUMN_SETTINGS', 'result_column', self.model_column_data["result_column"])
        config.set('COLUMN_SETTINGS', 'polarity', "positive")
        config.set('COLUMN_SETTINGS', 'consider_columns', self.model_column_data["compare_with"])
        config.set('COLUMN_SETTINGS', 'consider_columns_type', self.model_column_data["compare_type"])

        if self.model_column_data.has_key('date'):
            config.set('COLUMN_SETTINGS', 'date_columns', self.model_column_data['date'])

        if (self.model_column_data.has_key('date_format')):
            config.set('COLUMN_SETTINGS', 'date_format', self.model_column_data['date_format'])

        # ignore_column_suggestions
        if (self.model_column_data.has_key('ignore_column_suggestions')):
            # config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', self.model_column_data['ignore_column_suggestions'])
            config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', "")

        # utf8_column_suggestions
        if (self.model_column_data.has_key('utf8_columns')):
            config.set('COLUMN_SETTINGS', 'utf8_columns', self.model_column_data['utf8_columns'])

        # MEASURE_FILTER
        if (self.model_column_data.has_key('MEASURE_FILTER')):
            config.set('COLUMN_SETTINGS', 'measure_column_filter', self.model_column_data['MEASURE_FILTER'])

        # DIMENSION_FILTER
        if (self.model_column_data.has_key('DIMENSION_FILTER')):
            config.set('COLUMN_SETTINGS', 'dimension_column_filter', self.model_column_data['DIMENSION_FILTER'])

        # measure_suggetions_json_data
        if (self.model_column_data.has_key('measure_suggetions_json_data')):
            config.set('COLUMN_SETTINGS', 'measure_suggestions', self.model_column_data['measure_suggetions_json_data'])

        config.set('COLUMN_SETTINGS', 'app_id', self.app_id)

        with open(self.get_local_config_file(), 'wb') as file:
            config.write(file)
        # print "Take a look at: {}".format(self.get_local_config_file())
        # hadoop.hadoop_put(self.get_local_config_file(), self.get_hadoop_config_file())

    def get_dimension_name_from_model(self):
        model_column_data = self.trainer.get_column_data()
        return model_column_data['result_column']

    def read_score_details(self):
        return {
            "header": "Score Data Preview",
            "heading": "mAdvisor has run the model on the given data set to predict {0}. Here is the overview of the prediction :".format(self.get_dimension_name_from_model()),
            "data": self.dummy_score_data(),
            "story_data": self.get_score_story_data()
        }

    def run_master(self):
        configpath = self.get_hadoop_config_file()
        print "configpath---------------------"
        print configpath
        submit_masterjob(configpath, None)

    def change_name(self, name):
        self.name = name
        self.save()

    def dummy_score_data(self):
        a = self.read_data_from_emr()
        model_data = json.loads(self.model_data)
        feature_importance = model_data["modelSummary"]["feature_importance"]
        feature_data = []
        for key in feature_importance.keys():
            feature_data.append([key,round(feature_importance[key],2)])

        feature_data = sorted(feature_data, key=lambda x: x[1], reverse=True)

        feature_as_array = [["Feature","Value"]]
        feature_as_array += feature_data[:5]
        # a["scoreSummary"]["feature_importance"] = feature_as_array
        a["scoreSummary"]["feature_importance"] = feature_importance_dummy_data
        a["scoreSummary"]["feature_importance_heading"] = "The top {0} features are:".format(str(len(a["scoreSummary"]["feature_importance"])-1))
        a["scoreSummary"]["prediction_split"] = score_results_prediction_split
        return a["scoreSummary"]

    def read_data_from_emr(self):
        base_dir = self.base_emr_storage_folder()
        file_path = base_dir + "/Summary/summary.json"
        data = read_remote(file_path)
        data = json.loads(data)

        a1 = data["scoreSummary"]["prediction_split"]
        data["scoreSummary"]["prediction_split"] = generate_nested_list_from_nested_dict(a1)
        return data

    def read_score_story_details_from_emr(self):
        path = self.base_emr_storage_folder()
        for s_s_f in self.score_story_folders:
            for s_s_s_f in self.score_story_sub_folders:
                file_path = "{0}/{1}/{2}".format(path,s_s_f, s_s_s_f)
        pass

    def get_score_story_data(self):
        freq = self.get_frequency_results()
        chi = self.get_chi_results()
        dimension_name = self.get_dimension_name_from_model()
        freq["narratives"]["analysis"][1] = chi["narratives_raw"]["narratives"][dimension_name]["summary"][0]
        return {"get_frequency_results": freq,
                "get_chi_results": chi
                }

    def get_frequency_results(self):

        result_path = self.base_emr_storage_folder() + "/results/FreqDimension/data.json"
        dimension_name = self.get_dimension_name_from_model()

        try:
            results_data = json.loads(read_remote(result_path))
        except Exception as error:
            print error
            return {}
        results = []
        if not check_blank_object(results_data):
            if 'frequency_table' in results_data.keys() and dimension_name is not None:
                table = json.loads(results_data['frequency_table'])[dimension_name]
                result = zip(table[dimension_name].values(), table['count'].values())
                narratives_path = self.base_emr_storage_folder() + "/narratives/FreqDimension/data.json"

                try:
                    narratives_path_result = json.loads(read_remote(narratives_path))
                except Exception as error:
                    narratives_path_result = {}

                return {
                    'raw_data': result,
                    'narratives': narratives_path_result
                }
            else:
                return {}
        else:
            return {}

    def get_chi_results(self):
        result_path = self.base_emr_storage_folder() + "/results/ChiSquare/data.json"
        narratives_path = self.base_emr_storage_folder() + "/narratives/ChiSquare/data.json"

        try:
            narratives_data = json.loads(read_remote(narratives_path))
        except Exception as error:
            print error
            return {}

        # dimension_name = "predicted_class"
        dimension_name = self.get_dimension_name_from_model()

        narratives = []
        print "self.dimension : ", dimension_name
        if not check_blank_object(narratives_data):
            if "narratives" in narratives_data.keys() and dimension_name is not None:
                list = narratives_data["narratives"][dimension_name]
                for key, value in list.iteritems():
                    if type(value) == dict:
                        value['dimension'] = key
                        narratives.append(value)

                # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
                def order(item):
                    return -item['effect_size']

                narratives = sorted(narratives, key=order)

                result = {}
                try:
                    result = json.loads(read_remote(result_path))
                except Exception as error:
                    print error

                return {
                    'result': result,
                    'narratives': narratives,
                    'narratives_raw': narratives_data
                }
        return {}

    def read_models_summary(self, model_name):
        out = {}
        model_base_path = self.trainer.get_emr_model_storage_folder()
        # out["result_column"] = self.model_column_data["result_column"]

        folder_name = map_model_name_with_folder[model_name]
        final_model_summary_path = model_base_path + "/{0}/ModelSummary/summary.json".format(folder_name)
        data = read_remote(final_model_summary_path)
        return json.loads(data)

    def set_app_id(self, app_id):
        print "setting-->app", app_id
        self.app_id = app_id

    def get_app_id(self, app_id):
        return app_id

class ScoreSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    # trainer = serializers.ReadOnlyField()
    user_id = serializers.ReadOnlyField()
    # dataset = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()

    class Meta:
        model = Score
        field = ('id', 'name', 'created_at', 'user_id')

score_results_prediction_split = [
            ['Range', '>25%','>75%','>80%','>85%','>90%','>95%'],
            ['Loss', 30, 200, 200, 400, 150, 250],
            ['Won', 130, 100, 100, 200, 150, 50],

        ]

feature_importance_dummy_data = [
    ["Name", "AGE_CATEGORY", "AMOUNT_PAID_NOVEMBER", "STATUS", "BILL_AMOUNT_NOVEMBER", "EDUCATION", "BILL_AMOUNT_DECEMBER", "AMOUNT_PAID_DECEMBER", "STATE", "OCCUPATION", "MARRIAGE"],
    ["Value", 0.007058221371135741, 0.0028883097720690254, 0.0026129957425838064, 0.0021655785195103493, 0.0012144740424919747, 0.0011479622477891692, 0.0009416868976334556, 0.0008169380994169005, 0.00045068569038685796, 0.00012034484007067192]
    ]
