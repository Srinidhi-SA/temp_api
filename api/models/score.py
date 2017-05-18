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
    read_remote
from api.models.jobserver import submit_masterjob
from api.helper import generate_nested_list_from_nested_dict


class Score(models.Model):

    name = models.CharField(max_length=300, null=True)
    trainer = models.ForeignKey(Trainer, null=False)
    dataset = models.ForeignKey(Dataset, null=False)
    userId = models.CharField(max_length=100, null=True)
    details = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    score_folders = [
        "Results",
        "Summary"
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

        obj.save()

        # create local folder for score and config
        print "create local folder for score and config"
        obj.setup_local_storage_folder()

        # create folder structure at EMR
        print "create folder structure at EMR"
        obj.setup_emr_storage_folder()

        print "config_creation"
        # obj.create_configuration_file()
        obj.create_configuration_file()

        # copy config from local to hadoop
        obj.run_save_config()

        # call script
        obj.run_master()

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
        return "/home/hadoop/configs/scores/"

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

    def     base_emr_storage_folder(self):
        return "/home/hadoop/scores/{0}".format(str(self.id))

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

        self.model_column_data = self.trainer.get_column_data()


        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")

        config.set('FILE_SETTINGS', 'InputFile', hadoop.hadoop_get_full_url(self.dataset.get_input_file_storage_path()))
        config.set('FILE_SETTINGS',
                   'ModelPath',
                   self.trainer.get_emr_model_storage_folder() + "/" + self.get_folder_name(model_name) + "/TrainedModels/model.pkl"
                   )
        config.set('FILE_SETTINGS', 'ScorePath', self.base_emr_storage_folder())
        config.set('FILE_SETTINGS', 'FolderName', ", ".join(self.score_folders))

        config.add_section("COLUMN_SETTINGS")

        config.set('COLUMN_SETTINGS', 'analysis_type', "Scoring")
        config.set('COLUMN_SETTINGS', 'result_column', self.model_column_data["result_column"])
        config.set('COLUMN_SETTINGS', 'polarity', "positive")
        config.set('COLUMN_SETTINGS', 'consider_columns', "")
        config.set('COLUMN_SETTINGS', 'consider_columns_type', "ab")

        # settings from master table, option.get_option_for_this_user

        # config.set('FILE_SETTINGS', 'script_to_run', "")
        #
        # if column_data.has_key('date'):
        #     config.set('COLUMN_SETTINGS', 'date_columns', column_data['date'])
        #
        # if (column_data.has_key('date_format')):
        #     config.set('COLUMN_SETTINGS', 'date_format', column_data['date_format'])
        #
        # # ignore_column_suggestions
        # if (column_data.has_key('ignore_column_suggestions')):
        #     config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', column_data['ignore_column_suggestions'])
        #
        # # utf8_column_suggestions
        # if (column_data.has_key('utf8_columns')):
        #     config.set('COLUMN_SETTINGS', 'utf8_columns', column_data['utf8_columns'])
        #
        # # MEASURE_FILTER
        # if (column_data.has_key('MEASURE_FILTER')):
        #     config.set('COLUMN_SETTINGS', 'measure_column_filter', column_data['MEASURE_FILTER'])
        #
        # # DIMENSION_FILTER
        # if (column_data.has_key('DIMENSION_FILTER')):
        #     config.set('COLUMN_SETTINGS', 'dimension_column_filter', column_data['DIMENSION_FILTER'])
        #
        # # measure_suggetions_json_data
        # if (column_data.has_key('measure_suggetions_json_data')):
        #     config.set('COLUMN_SETTINGS', 'measure_suggestions', column_data['measure_suggetions_json_data'])


        with open(self.get_local_config_file(), 'wb') as file:
            config.write(file)
        # print "Take a look at: {}".format(self.get_local_config_file())
        # hadoop.hadoop_put(self.get_local_config_file(), self.get_hadoop_config_file())

    def read_score_details(self):
        return {
            "header": "Scoring Summary",
            "heading": "mAdvisor has run the model on the given data set to predict <Variable Name>. Here is the overview of the prediction",
            "data": self.dummy_score_data()
        }

    def run_master(self):
        configpath = self.get_hadoop_config_file()
        print "configpath---------------------"
        print configpath
        submit_masterjob(configpath)

    def change_name(self, name):
        self.name = name
        self.save()

    def dummy_score_data(self):
        # a = {"scoreSummary": {"prediction_split": {"More than 75.0%": {"setosa": 29, "versicolor": 21, "virginica": 19}, "More than 25.0%": {"virginica": 35, "versicolor": 33, "setosa": 32}, "More than 50.0%": {"virginica": 35, "versicolor": 32, "setosa": 32}, "More than 90.0%": {"setosa": 29, "versicolor": 16, "virginica": 11}}, "result_column": "species"}}
        # a1 = a["scoreSummary"]["prediction_split"]
        # a["scoreSummary"]["prediction_split"] = generate_nested_list_from_nested_dict(a1)
        # a["scoreSummary"]["feature_importance"] = {
        #   "sepal_width": 0.29721206994990945,
        #   "petal_width": 0.15061213442056393,
        #   "sepal_length": 0.39390335702957757,
        #   "petal_length": 0.15827243859994908
        # }

        a = self.read_data_from_emr()
        model_data = self.read_models_summary()
        feature_importance = model_data["modelSummary"]["feature_importance"]

        feature_as_array = [["Feature","Value"]]
        for f in feature_importance:
            feature_as_array.append([f,feature_importance[f]])
        a["scoreSummary"]["feature_importance"] = feature_as_array
        a["scoreSummary"]["feature_importance_heading"] = "The top {0} features are:".format(str(len(a["scoreSummary"]["feature_importance"])-1))

        return a["scoreSummary"]

    def read_data_from_emr(self):
        base_dir = self.base_emr_storage_folder()
        file_path = base_dir + "/Summary/summary.json"
        data = read_remote(file_path)
        data = json.loads(data)
        print data
        print type(data)
        print type(data["scoreSummary"])
        print data["scoreSummary"]

        a1 = data["scoreSummary"]["prediction_split"]
        data["scoreSummary"]["prediction_split"] = generate_nested_list_from_nested_dict(a1)
        return data

    def read_models_summary(self):
        out = {}
        model_base_path = self.trainer.get_emr_model_storage_folder()
        # out["result_column"] = self.model_column_data["result_column"]
        details = self.get_details()
        model_name = details['model_name']
        folder_name = map_model_name_with_folder[model_name]
        final_model_summary_path = model_base_path + "/{0}/ModelSummary/summary.json".format(folder_name)
        data = read_remote(final_model_summary_path)
        return json.loads(data)




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