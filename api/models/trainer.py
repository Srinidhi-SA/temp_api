from django.db import models
import os
from subprocess import call
import json
from django.conf import settings
from rest_framework import serializers
from api.models.dataset import Dataset
from api.lib import hadoop
from api.views.option import get_option_for_this_user
from api.lib.fab_helper import create_model_instance_extended_folder, \
    read_remote
from api.models.jobserver import submit_masterjob
from api.helper import generate_nested_list_from_nested_dict

import ConfigParser

name_map = {
    'measure_dimension_stest': "Measure vs. Dimension",
    'dimension_dimension_stest': 'Dimension vs. Dimension',
    'measure_measure_impact': 'Measure vs. Measure',
    'prediction_check': 'Predictive modeling',
    'desc_analysis': 'Descriptive analysis',
}


def local_base_directory(instance):
    return "uploads/trainer/{0}".format(str(instance.id))


def local_config_file_path(instance, filename):
    return local_base_directory(instance) + "/{0}".format(filename)


class Trainer(models.Model):

    name = models.CharField(max_length=300, null=True)
    input_file = models.FileField(upload_to=local_config_file_path, null=True, blank=True)
    dataset = models.ForeignKey(Dataset, null=False)
    userId = models.CharField(max_length=100, null=True)
    details = models.TextField(default="{}")
    column_data_raw = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    analysis_done = models.CharField(max_length=100, default="FALSE")
    app_id = models.CharField(max_length=10, default="0")

    model_names = [
        "RandomForest",
        "XGBoost",
        "LogisticRegression"
    ]

    inner_folders = [
        "TrainedModels",
        "ModelSummary"
    ]

    @classmethod
    def make(cls, details, userId):

        # create trainer object
        obj = cls(userId=userId)
        obj.dataset_id = details.get('dataset_id')
        obj.details = details.get('details', "{}")
        obj.name = details.get('name')
        obj.set_app_id(details.get('app_id'))

        # save it to database
        obj.save()

        # if, setup local storage folders
        obj.setup_local_storage_folder()

        return obj

    def setup_and_call(self, req_details):

        self.add_more_to_column_data(req_details=req_details)

        # create configuration
        self.create_configuration_file()

        # copy to EMR local
        self.run_save_config()

        # create model folder structure on hadoop
        self.set_emr_storage_folder()

        # call script
        self.run_master()

    def setup_local_storage_folder(self):
        dir = local_base_directory(self)
        print("looking for " + dir)
        if not os.path.exists(dir):
            os.makedirs(dir)
        else:
            print("you are already there")

    def base_hadoop_storage_folder(self):
        return "/models/{0}".format(str(self.id))

    def hadoop_model_storage_name(self):
        return self.model_names, self.inner_folders

    def set_hadoop_storage_folder(self):
        model_names, inner_folders = self.hadoop_model_storage_name()

        for m_n in model_names:
            dir_name = "{0}/{1}".format(
                self.base_hadoop_storage_folder(),
                m_n
            )
            hadoop.hadoop_mkdir(dir_name)
            for i_f in inner_folders:
                dir_name = "{0}/{1}/{2}".format(
                    self.base_hadoop_storage_folder(),
                    m_n,
                    i_f
                )
                hadoop.hadoop_mkdir(dir_name)

    def set_emr_storage_folder(self):
        create_model_instance_extended_folder(self.id)

    def get_emr_model_storage_folder(self):
        return "/home/hadoop/models/{0}".format(str(self.id))

    def config_file_name(self):
        return str(self.id) + "_model_" + "config.cfg"

    def get_emr_model_config_path(self):
        configpath = "/home/hadoop/configs/models/" + self.config_file_name()
        return configpath

    def get_local_config_path(self):
        return local_config_file_path(self, self.config_file_name())

    def run_save_config(self):
        call([
            "sh", "api/lib/run_save_config.sh",
            settings.HDFS['host'],
            settings.BASE_DIR + "/" + self.get_local_config_path(),
            "models/" + self.config_file_name()
        ])

    def run_master(self):
        configpath = self.get_emr_model_config_path()
        status = submit_masterjob(configpath)

    def create_configuration_file(self):

        details = self.get_column_data()

        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")

        config.set('FILE_SETTINGS', 'InputFile', hadoop.hadoop_get_full_url(self.dataset.get_input_file_storage_path()))
        config.set('FILE_SETTINGS', 'ModelPath', self.get_emr_model_storage_folder())
        config.set('FILE_SETTINGS', 'ModelName', ", ".join(self.model_names))
        config.set('FILE_SETTINGS', 'FolderName', ", ".join(self.inner_folders))
        config.set('FILE_SETTINGS', 'train_test_split', details["train_value"])

        # Un-necessary
        # config.set('FILE_SETTINGS', 'narratives_file', "")
        # config.set('FILE_SETTINGS', 'result_file', "")
        # config.set('FILE_SETTINGS', 'monitor_api', "")

        config.add_section("COLUMN_SETTINGS")

        config.set('COLUMN_SETTINGS', 'polarity', "positive")
        config.set('COLUMN_SETTINGS', 'consider_columns', details["compare_with"])
        config.set('COLUMN_SETTINGS', 'consider_columns_type', details["compare_type"])
        config.set('COLUMN_SETTINGS', 'analysis_type', "Prediction")
        config.set('COLUMN_SETTINGS', 'result_column', details['result_column'])

        # settings from master table, option.get_option_for_this_user
        option_dict = get_option_for_this_user(self.userId)
        config.set('FILE_SETTINGS', 'script_to_run', self.option_dict_to_string(option_dict))

        # add scripts to run to errand database also
        self.add_scripts_to_run_to_column_data(self.option_dict_to_string(option_dict))

        column_data = self.get_column_data()
        if column_data.has_key('date'):
            config.set('COLUMN_SETTINGS', 'date_columns', column_data['date'])

        if (column_data.has_key('date_format')):
            config.set('COLUMN_SETTINGS', 'date_format', column_data['date_format'])

        # ignore_column_suggestions
        if (column_data.has_key('ignore_column_suggestions')):
            # config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', column_data['ignore_column_suggestions'])
            config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', "")

        # utf8_column_suggestions
        if (column_data.has_key('utf8_columns')):
            config.set('COLUMN_SETTINGS', 'utf8_columns', column_data['utf8_columns'])

        # MEASURE_FILTER
        if (column_data.has_key('MEASURE_FILTER')):
            config.set('COLUMN_SETTINGS', 'measure_column_filter', column_data['MEASURE_FILTER'])

        # DIMENSION_FILTER
        if (column_data.has_key('DIMENSION_FILTER')):
            config.set('COLUMN_SETTINGS', 'dimension_column_filter', column_data['DIMENSION_FILTER'])

        # measure_suggetions_json_data
        if (column_data.has_key('measure_suggetions_json_data')):
            config.set('COLUMN_SETTINGS', 'measure_suggestions', column_data['measure_suggetions_json_data'])

        config.set('COLUMN_SETTINGS', 'app_id', self.app_id)

        with open(self.get_local_config_path(), 'wb') as file:
            config.write(file)
        print "Take a look at: {}".format(self.get_local_config_path())
        # hadoop.hadoop_put(self.get_local_config_path(), self.get_emr_model_config_path())

    def set_column_data(self, data):
        print "Saving: " + json.dumps(data)
        self.column_data_raw = json.dumps(data)
        self.save()

    def get_column_data(self):
        return json.loads(self.column_data_raw)

    def add_more_to_column_data(self, req_details):

        data = self.get_column_data()
        data['compare_with'] = req_details['compare_with']
        data['compare_type'] = req_details['compare_type']
        data['train_value'] = req_details['train_value']

        if req_details.has_key('dimension'):
            data['result_column'] = req_details['dimension']
        elif req_details.has_key('measure'):
            data['result_column'] = req_details['measure']
        self.set_column_data(data)
        self.save()

    def add_scripts_to_run_to_column_data(self, scripts_to_run):
        data = self.get_column_data()
        data["scripts_to_run"] = scripts_to_run
        self.set_column_data(data)
        self.save()

    def option_dict_to_string(self, option_dict):
        options_with_yes = []
        options_string = ''
        for key in option_dict:
            if option_dict[key] == 'yes' and name_map.get(key, None):
                options_with_yes.append(name_map.get(key))
            options_string = ", ".join(options_with_yes)

        # if nothing selected in option put everything
        if options_string == '':
            for key in name_map:
                options_with_yes.append(name_map.get(key))
            options_string = ", ".join(options_with_yes)

        return options_string

    def get_details(self):
        return json.loads(self.details)

    def read_trainer_details(self):

        column_data = self.get_column_data()

        if 'result_column' in column_data:
            c_d = column_data['result_column']
        else:
            c_d = ""

        best, data, feature, comparision, model_dropdown, dougnut, final_data = self.resolve_result_like_boss()
        return {
            "header": "Model Summary",
            "data": final_data,
            "best": best,
            "feature": feature,
            "heading": """mAdvisor has built 201 models using 3 algorithms
                    (Random Forest, XGBoost and Logistic Regression) to predict
                    {0} and has come up with the following results:
                    """.format(c_d),
            "model_dropdown": model_dropdown,
            "dougnut": dougnut,
            "key_takeaways": "Based on the results from all the three algorithms, {0} has the highest accuracy.".format(best['Best Accuracy'])
        }

    def resolve_results(self):
        data = [
            {
                'model_precision': 0.59,
                'validation_method': 'Cross Validation',
                'test_sample_prediction': {'yes': 80, 'No': 20},
                'model_accuracy': 0.8928571428571429,
                'algorithm_name': 'Random Forest',
                'feature_importance': {'sepal_width': 0.3491542218465295,
                                       'petal_width': 0.030715983363042199,
                                       'sepal_length': 0.55892951928246037,
                                       'petal_length': 0.061200275507967826},
                'precision_recall_statsyyg': {'0':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                },
                                           '1':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                }

                                           },
                'precision_recall_stats': [
                    ['Year', 'Sales', 'Expenses'],
                    ['2014', 1000, 400],
                    ['2015', 1170, 460],
                    ['2016', 660, 1120],
                    ['2017', 1030, 540]
                ],
                'model_recall': 0.55,
                'total_rules': 3400,
                'independent_variables': 10,
                'total_trees': 100,
                'confusion_matrix': {"0":{"0":15,"1":3},"1":{"0":0,"1":10}},
                'target_variable': 'SALES',
                'runtime_in_seconds': 0.79
            },
            {
                'model_precision': 0.57,
                'validation_method': 'Cross Validation',
                'test_sample_prediction': {'yes': 80, 'No': 20},
                'model_accuracy': 0.8928571428571429,
                'algorithm_name': 'XGBooost',
                'feature_importance': {'sepal_width': 0.3491542218465295,
                                       'petal_width': 0.030715983363042199,
                                       'sepal_length': 0.55892951928246037,
                                       'petal_length': 0.061200275507967826},
                'precision_recall_statsyyg': {'0':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                },
                                           '1':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                }
                                           },
                'precision_recall_stats': [
                    ['Year', 'Sales', 'Expenses'],
                    ['2014', 1000, 400],
                    ['2015', 1170, 460],
                    ['2016', 660, 1120],
                    ['2017', 1030, 540]
                ],
                'model_recall': 0.59,
                'total_rules': 34000,
                'independent_variables': 11,
                'total_trees': 101,
                'confusion_matrix': {"0":{"0":15,"1":3},"1":{"0":0,"1":10}},
                'target_variable': 'SALES',
                'runtime_in_seconds': 0.69
            },
            {
                'model_precision': 0.69,
                'validation_method': 'Cross Validation',
                'test_sample_prediction': {'yes': 80, 'No': 20},
                'model_accuracy': 0.89238571428571429,
                'algorithm_name': 'Logistic',
                'feature_importance': {'sepal_width': 0.3491542218465295,
                                       'petal_width': 0.030715983363042199,
                                       'sepal_length': 0.55892951928246037,
                                       'petal_length': 0.061200275507967826},
                'precision_recall_statsyyg': {'0':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                },
                                           '1':
                                               {'recall': 1.0,
                                                'counts': {'fp': 3, 'tn': 15, 'fn': 0, 'tp': 10},
                                                'precision': 0.77
                                                }
                                           },
                'precision_recall_stats':[
                                                     ['Year', 'Sales', 'Expenses'],
                                                     ['2014', 1000, 400],
                                                     ['2015', 1170, 460],
                                                     ['2016', 660, 1120],
                                                     ['2017', 1030, 540]
                                                   ],
                'model_recall': 0.553,
                'total_rules': 34030,
                'independent_variables': 103,
                'total_trees': 300,
                'confusion_matrix': {"0":{"0":15,"1":3},"1":{"0":0,"1":10}},
                'target_variable': 'SALES',
                'runtime_in_seconds': 0.379
            }
        ]

        return data

    def resolve_result_like_boss(self):
        # data = self.resolve_results()
        data = self.read_data_from_emr()

        if data == []:
            return {}, [], [], {}, [], {}, []

        model_summary = dict()
        list_of_key_to_check_for_max = {
            'model_recall': "Best Recall",
            'model_precision': "Best Precision",
            'model_accuracy': "Best Accuracy"
        }

        list_of_key_to_check_for_min = {
            'runtime_in_seconds': "Best Runtime"
        }

        for list_key in list_of_key_to_check_for_max:
            model_summary[list_of_key_to_check_for_max[list_key]] = self.get_max(list_key, data)[1]

        for list_key in list_of_key_to_check_for_min:
            model_summary[list_of_key_to_check_for_min[list_key]] = self.get_min(list_key, data)[1]

        return model_summary, \
               data, \
               self.get_random_forest_feature_details(data), \
               self.get_comparision_data_reverse(data), self.get_algonames(data), self.get_dougnut_data(data), \
               self.changes_feature_importance_foreach_data(data)

    def get_max(self,key_name, data):

        first_data = data[0]


        max_value = first_data[key_name]
        algo_name = first_data['algorithm_name']

        for d in data[1:]:


            if isinstance(d, unicode) or isinstance(d, str):
                d = json.loads(d)


            if max_value < d[key_name]:
                max_value = d[key_name]
                algo_name = d['algorithm_name']

        return max_value, algo_name

    def get_min(self, key_name, data):

        first_data = data[0]

        min_value = first_data[key_name]
        algo_name = first_data['algorithm_name']

        for d in data[1:]:

            if isinstance(d, unicode) or isinstance(d, str):
                d = json.loads(d)

            if min_value < d[key_name]:
                min_value = d[key_name]
                algo_name = d['algorithm_name']

        return min_value, algo_name

    def get_random_forest_feature_details(self, data):
        random_forst_data = None
        for d in data:
            if d['algorithm_name'] == "Random Forest":
                random_forst_data = d
                break

        petal_info = random_forst_data['feature_importance']
        feature = [["Name","Importance"]]
        feature_data = []
        for key in petal_info.keys():
            feature_data.append([key,round(petal_info[key],2)])

        feature_data = sorted(feature_data,key = lambda x:x[1], reverse = True)
        feature = feature + feature_data[:5]
        hard_coded = [
                                                      ['Probability', 'Active'],
                                                      ['>90%',  23],
                                                      ['>75%',  13],
                                                      ['>50%',  157],
                                                      ['>25%',  196],
                                                      ['<25%',  100]
                                                    ]

        return feature

    def get_feature_importance(self, data):

        petal_info = data['feature_importance']
        feature = [["Name","Importance"]]
        for key in petal_info.keys():
            feature.append([key,round(petal_info[key],2)])

        return feature

    def changes_feature_importance_foreach_data(self, data):

        same_data = self.get_random_forest_feature_details(data)
        for d in data:
            d['feature_importance'] = same_data

        data = self.set_precision_recall_for_each_data(data)

        for d in data:
            d["model_accuracy"] = d["model_accuracy"]*100
        return data

    def get_comparision_data(self, data):

        comparision = dict()

        key_names = {
            'Accuracy': "model_accuracy",
            'Precision': "model_precision",
            'Recall': "model_recall"
        }

        for k in key_names:
            # comparision[key_names[k]] =
            small_details = dict()

            for d in data:
                small_details[d['algorithm_name']] = d[key_names[k]] * 100
            comparision[k] = small_details


        return comparision

    def get_comparision_data_reverse(self, data):
        comparision = dict()

        key_names = {
            'Accuracy': "model_accuracy",
            'Precision': "model_precision",
            'Recall': "model_recall"
        }


        for d in data:
            small_details = dict()
            if isinstance(d, unicode) or isinstance(d, str):
                d = json.loads(d)

            for k in key_names:

                small_details[k] = float(d[key_names[k]]) * 100
            comparision[d['algorithm_name']] = small_details

        return comparision

    def get_comparision_data_reverse_without_percent(self, data):
        comparision = dict()

        key_names = {
            'Accuracy': "model_accuracy",
            'Precision': "model_precision",
            'Recall': "model_recall"
        }


        for d in data:
            small_details = dict()
            if isinstance(d, unicode) or isinstance(d, str):
                d = json.loads(d)

            for k in key_names:

                small_details[k] = float(d[key_names[k]])
            comparision[d['algorithm_name']] = small_details

        return comparision

    def get_dougnut_data(self, data):

        comparision = dict()

        key_names = {
            'Accuracy': "model_accuracy",
            'Precision': "model_precision",
            'Recall': "model_recall"
        }
        names = []
        for k in key_names:

            # comparision[key_names[k]] =
            small_details = []

            for d in data:
                small_details.append(d[key_names[k]] * 100)
            comparision[k] = small_details

        for d in data:
            names.append(d['algorithm_name'])
        comparision["names"] = names

        return comparision


    def get_algonames(self,data):
        # comp = self.get_comparision_data_reverse_without_percent(data)
        comp = self.get_comparision_data_reverse(data)
        algo_performance = []
        for key in comp.keys():
            algo_performance.append([key,comp[key]["Accuracy"]])

        sorted_algo_list = sorted(algo_performance,key=lambda x:x[1],reverse=True)
        new_list = [x[0] + "-" + str(round(x[1], 2)) for x in sorted_algo_list]
        return new_list

    def set_precision_recall_for_each_data(self, data):

        for d in data:
            d["precision_recall_stats"] = self.format_precision_recall_data(d["precision_recall_stats"])

        return data


    def format_precision_recall_data(self, precision_data):
        new_precision_data = {}

        for key in precision_data:
            k = precision_data[key]
            k.pop("counts")
            new_precision_data[key] = k
        new_precision_data = generate_nested_list_from_nested_dict(new_precision_data)

        return new_precision_data

    def read_data_from_emr(self):
        base_dir_paths = self.get_emr_model_storage_folder()
        model_names = self.model_names
        inner_folder = self.inner_folders
        all_files = []
        for m_n in model_names:
            ext = "/{0}/{1}/summary.json".format(m_n,"ModelSummary")
            all_files.append(base_dir_paths + ext)

        data = []
        for f in all_files:
            data_str = read_remote(f)
            if data_str != "":
                data.append(json.loads(data_str))

        main_data = []
        for d in data:
            d = d.get("modelSummary", {})
            if isinstance(d, unicode) or isinstance(d, str):
                d = json.loads(d)
            main_data.append(d)

        return main_data

    def set_app_id(self, app_id):
        self.app_id = app_id

    def get_app_id(self, app_id):
        return app_id


class TrainerSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    # dataset = serializers.ReadOnlyField()
    userId = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()
    dataset_id = serializers.ReadOnlyField()
    app_id = serializers.ReadOnlyField()


    class Meta:
        model = Trainer
        field = ('id', 'name', 'created_at', 'userId')
