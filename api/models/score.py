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
from api.models.jobserver import submit_masterjob
from api.helper import generate_nested_list_from_nested_dict


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

    score_folders = [
        "Results",
        "Summary"
    ]

    score_story_folders = [
        "Frequecy",
        "Chisquare"
    ]

    score_story_sub_folders = [
        "Narratives",
        "Results"
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

        # create folder structure at EMR and also for story in score
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

    def base_emr_storage_folder(self):
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
        remote_mkdir_for_score_story(self.id)

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
        config.set('FILE_SETTINGS', 'FolderName', ", ".join(self.score_folders + self.score_story_folders))

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
            "data": self.dummy_score_data(),
            "story_data": dummy_data_for_story()
            # "story_data": self.get_score_story_data()
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

    def read_score_story_details_from_emr(self):
        path = self.base_emr_storage_folder()
        for s_s_f in self.score_story_folders:
            for s_s_s_f in self.score_story_sub_folders:
                file_path = "{0}/{1}/{2}".format(path,s_s_f, s_s_s_f)
        pass

    def get_score_story_data(self):
        freq = self.get_frequency_results()
        chi = self.get_chi_results()

        return {"get_frequency_results": freq,
                "get_chi_results": chi
                }

    def get_frequency_results(self):
        # result_path = self.storage_dimension_output_dir() + "/frequency-result.json";
        result_path = self.base_emr_storage_folder() + "/Frequency/results/result.json"
        dimesion_name = "STATUS"
        # dimesion_name = "predicted_class"
        # you might want to replace it with get_details.get('')

        try:
            results_data = json.loads(read_remote(result_path))
        except Exception as error:
            print error
            return {}
        results = []
        if not check_blank_object(results_data):
            if 'frequency_table' in results_data.keys() and dimesion_name is not None:
                table = json.loads(results_data['frequency_table'])[dimesion_name]
                result = zip(table[dimesion_name].values(), table['count'].values())
                # narratives_path = self.storage_dimension_output_dir() + "/frequency-narratives.json";
                narratives_path = self.base_emr_storage_folder() + "/Frequency/narratives/narrative.json"

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
        # result_path = self.storage_dimension_output_dir() + "/chi-result.json";
        # narratives_path = self.storage_dimension_output_dir() + "/chi-narratives.json";
        result_path = self.base_emr_storage_folder() + "/Chisquare/results/result.json"
        narratives_path = self.base_emr_storage_folder() + "/Chisquare/narratives/narrative.json"

        try:
            narratives_data = json.loads(read_remote(narratives_path))
        except Exception as error:
            print error
            return {}

        # dimension_name = "predicted_class"
        dimension_name = "STATUS"
        narratives = []
        print "self.dimension : ", dimension_name
        if not check_blank_object(narratives_data):
            if "narratives" in narratives_data.keys() and dimension_name is not None:
                print narratives_data["narratives"]
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


def dummy_data_for_story():

    return {
  "get_tree_results": [
    [
      "Root",
      ""
    ],
    [
      "CREDIT_BALANCE <= 6900.0",
      "Root"
    ],
    [
      "PAYMENT_NOVEMBER in (After 3 Months)",
      "CREDIT_BALANCE <= 6900.0"
    ],
    [
      "SEX in (Male)",
      "PAYMENT_NOVEMBER in (After 3 Months)"
    ],
    [
      "Predict: Churn",
      "SEX in (Male)"
    ],
    [
      "SEX not in (Male)",
      "PAYMENT_NOVEMBER in (After 3 Months)"
    ],
    [
      "Predict: Active",
      "SEX not in (Male)"
    ],
    [
      "PAYMENT_NOVEMBER not in (After 3 Months)",
      "CREDIT_BALANCE <= 6900.0"
    ],
    [
      "PAYMENT_DECEMBER in (After 3 Months)",
      "PAYMENT_NOVEMBER not in (After 3 Months)"
    ],
    [
      "Predict: Churn",
      "PAYMENT_DECEMBER in (After 3 Months)"
    ],
    [
      "PAYMENT_DECEMBER not in (After 3 Months)",
      "PAYMENT_NOVEMBER not in (After 3 Months)"
    ],
    [
      "Predict: Active",
      "PAYMENT_DECEMBER not in (After 3 Months)"
    ],
    [
      "CREDIT_BALANCE > 6900.0",
      "Root"
    ],
    [
      "AGE_CATEGORY in (Above 50)",
      "CREDIT_BALANCE > 6900.0"
    ],
    [
      "SEX in (Male)",
      "AGE_CATEGORY in (Above 50)"
    ],
    [
      "Predict: Churn",
      "SEX in (Male)"
    ],
    [
      "SEX not in (Male)",
      "AGE_CATEGORY in (Above 50)"
    ],
    [
      "Predict: Active",
      "SEX not in (Male)"
    ],
    [
      "AGE_CATEGORY not in (Above 50)",
      "CREDIT_BALANCE > 6900.0"
    ],
    [
      "AMOUNT_PAID_NOVEMBER in ($1000 to $5000,$5000 to $10000)",
      "AGE_CATEGORY not in (Above 50)"
    ],
    [
      "Predict: Active",
      "AMOUNT_PAID_NOVEMBER in ($1000 to $5000,$5000 to $10000)"
    ],
    [
      "AMOUNT_PAID_NOVEMBER not in ($1000 to $5000,$5000 to $10000)",
      "AGE_CATEGORY not in (Above 50)"
    ],
    [
      "Predict: Active",
      "AMOUNT_PAID_NOVEMBER not in ($1000 to $5000,$5000 to $10000)"
    ]
  ],
  "get_frequency_results": {
    "raw_data": [
      [
        "Active",
        563
      ],
      [
        "Churn",
        186
      ]
    ],
    "narratives": {
      "count": {
        "smallest": [
          " Churn is the smallest with 186 observations",
          "25.0%"
        ],
        "largest": [
          " Active is the largest with 563 observations",
          "75.0%"
        ]
      },
      "subheader": "",
      "analysis": [
        " The STATUS variable has only two observation, i.e. Active and Churn. Active is the <b>largest</b> with 563 observations, whereas Churn is the <b>smallest</b> STATUS with just 186 observations.",
        ""
      ],
      "summary": [
        "mAdvisor has analyzed the dataset and it contains<b> 17</b> variables and <b>749</b> observations. Of these <b>6</b> variables are omitted, since these are not fit for the analysis.The consolidated dataset has 1 measure and 10 dimensions. Please click next to find the insights from our distribution analysis of <b>status</b> factoring the other variables"
      ],
      "header": "STATUS Performance Report",
      "vartype": {
        "Time Dimension": 0,
        "Measures": 1,
        "Dimensions": 10
      },
      "frequency_dict": {
        "STATUS": {
          "STATUS": {
            "0": "Churn",
            "1": "Active"
          },
          "count": {
            "0": 186,
            "1": 563
          }
        }
      }
    }
  },
  "get_chi_results": {
    "narratives_raw": {
      "narratives": {
        "STATUS": {
          "PAYMENT_DECEMBER": {
            "table": {
              "table": [
                [
                  0.53,
                  99.47
                ],
                [
                  2.69,
                  97.31
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "effect_size": 0.06405481691806182,
            "sub_heading": "Relationship between PAYMENT_DECEMBER and STATUS",
            "analysis": {
              "analysis2": " There is an association between STATUS and PAYMENT_DECEMBER and the distribution of PAYMENT_DECEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of PAYMENT_DECEMBER within STATUS reveals how interesting some of their relationships are. ",
              "analysis1": " Within Due Date accounts for <b>more than half</b> (98.94%) of the total observations, whereas After 3 Months has just 1.07% of the total. Being the largest segment, <b>Within Due Date in Active</b> has about 560.0 observations, covering 74.77% of total. On the other hand, Within Due Date in Churn represents just 24.17% of the total observations. ",
              "title2": "Relationship between PAYMENT_DECEMBER and STATUS",
              "title1": "Concentration of PAYMENT_DECEMBER"
            },
            "dimension": "PAYMENT_DECEMBER"
          },
          "AMOUNT_PAID_NOVEMBER": {
            "table": {
              "table": [
                [
                  3.55,
                  0.18,
                  96.27
                ],
                [
                  0,
                  0,
                  100
                ]
              ],
              "column_two_values": [
                "$1000 to $5000",
                "$5000 to $10000",
                "Less than $1000"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "effect_size": 0.06902894478351777,
            "sub_heading": "Relationship between AMOUNT_PAID_NOVEMBER and STATUS",
            "analysis": {
              "analysis2": " There is an association between STATUS and AMOUNT_PAID_NOVEMBER and the distribution of AMOUNT_PAID_NOVEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of AMOUNT_PAID_NOVEMBER within STATUS reveals how interesting some of their relationships are. Active seems to be relatively <b>less diversified</b>, with 100.0% of the total observations coming from Less than $1000 alone. On the other hand, Active is found to be relatively <b>spread across</b> all AMOUNT_PAID_NOVEMBER. ",
              "analysis1": " Less than $1000 accounts for <b>more than half</b> (97.19%) of the total observations, whereas $5000 to $10000 has just 0.13% of the total. Being the largest segment, <b>Less than $1000 in Active</b> has about 542.0 observations, covering 72.36% of total. On the other hand, $5000 to $10000 in Churn represents just 0.0% of the total observations. ",
              "title2": "Relationship between AMOUNT_PAID_NOVEMBER and STATUS",
              "title1": "Concentration of AMOUNT_PAID_NOVEMBER"
            },
            "dimension": "AMOUNT_PAID_NOVEMBER"
          },
          "summary": [
            " There are <b>10 variables</b> and <b>three of them</b> (PAYMENT_NOVEMBER, and AMOUNT_PAID_NOVEMBER) have <b>significant association</b> with STATUS. They display intriguing variation in distribution across STATUS. ",
            " The chart above displays the <b>strength of relationship</b> between STATUS and those three key variables, as measured by effect size. Let us take a deeper look at all three of them. "
          ],
          "heading": "STATUS Performance Analysis",
          "PAYMENT_NOVEMBER": {
            "table": {
              "table": [
                [
                  0.71,
                  99.29
                ],
                [
                  3.23,
                  96.77
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "effect_size": 0.06695266740612,
            "sub_heading": "Relationship between PAYMENT_NOVEMBER and STATUS",
            "analysis": {
              "analysis2": " There is an association between STATUS and PAYMENT_NOVEMBER and the distribution of PAYMENT_NOVEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of PAYMENT_NOVEMBER within STATUS reveals how interesting some of their relationships are. ",
              "analysis1": " Within Due Date accounts for <b>more than half</b> (98.66%) of the total observations, whereas After 3 Months has just 1.33% of the total. Being the largest segment, <b>Within Due Date in Active</b> has about 559.0 observations, covering 74.63% of total. On the other hand, Within Due Date in Churn represents just 24.03% of the total observations. ",
              "title2": "Relationship between PAYMENT_NOVEMBER and STATUS",
              "title1": "Concentration of PAYMENT_NOVEMBER"
            },
            "dimension": "PAYMENT_NOVEMBER"
          },
          "sub_heading": "Relationship with other variables"
        }
      }
    },
    "narratives": [
      {
        "table": {
          "table": [
            [
              3.55,
              0.18,
              96.27
            ],
            [
              0,
              0,
              100
            ]
          ],
          "column_two_values": [
            "$1000 to $5000",
            "$5000 to $10000",
            "Less than $1000"
          ],
          "column_one_values": [
            "Active",
            "Churn"
          ]
        },
        "effect_size": 0.06902894478351777,
        "sub_heading": "Relationship between AMOUNT_PAID_NOVEMBER and STATUS",
        "analysis": {
          "analysis2": " There is an association between STATUS and AMOUNT_PAID_NOVEMBER and the distribution of AMOUNT_PAID_NOVEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of AMOUNT_PAID_NOVEMBER within STATUS reveals how interesting some of their relationships are. Active seems to be relatively <b>less diversified</b>, with 100.0% of the total observations coming from Less than $1000 alone. On the other hand, Active is found to be relatively <b>spread across</b> all AMOUNT_PAID_NOVEMBER. ",
          "analysis1": " Less than $1000 accounts for <b>more than half</b> (97.19%) of the total observations, whereas $5000 to $10000 has just 0.13% of the total. Being the largest segment, <b>Less than $1000 in Active</b> has about 542.0 observations, covering 72.36% of total. On the other hand, $5000 to $10000 in Churn represents just 0.0% of the total observations. ",
          "title2": "Relationship between AMOUNT_PAID_NOVEMBER and STATUS",
          "title1": "Concentration of AMOUNT_PAID_NOVEMBER"
        },
        "dimension": "AMOUNT_PAID_NOVEMBER"
      },
      {
        "table": {
          "table": [
            [
              0.71,
              99.29
            ],
            [
              3.23,
              96.77
            ]
          ],
          "column_two_values": [
            "After 3 Months",
            "Within Due Date"
          ],
          "column_one_values": [
            "Active",
            "Churn"
          ]
        },
        "effect_size": 0.06695266740612,
        "sub_heading": "Relationship between PAYMENT_NOVEMBER and STATUS",
        "analysis": {
          "analysis2": " There is an association between STATUS and PAYMENT_NOVEMBER and the distribution of PAYMENT_NOVEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of PAYMENT_NOVEMBER within STATUS reveals how interesting some of their relationships are. ",
          "analysis1": " Within Due Date accounts for <b>more than half</b> (98.66%) of the total observations, whereas After 3 Months has just 1.33% of the total. Being the largest segment, <b>Within Due Date in Active</b> has about 559.0 observations, covering 74.63% of total. On the other hand, Within Due Date in Churn represents just 24.03% of the total observations. ",
          "title2": "Relationship between PAYMENT_NOVEMBER and STATUS",
          "title1": "Concentration of PAYMENT_NOVEMBER"
        },
        "dimension": "PAYMENT_NOVEMBER"
      },
      {
        "table": {
          "table": [
            [
              0.53,
              99.47
            ],
            [
              2.69,
              97.31
            ]
          ],
          "column_two_values": [
            "After 3 Months",
            "Within Due Date"
          ],
          "column_one_values": [
            "Active",
            "Churn"
          ]
        },
        "effect_size": 0.06405481691806182,
        "sub_heading": "Relationship between PAYMENT_DECEMBER and STATUS",
        "analysis": {
          "analysis2": " There is an association between STATUS and PAYMENT_DECEMBER and the distribution of PAYMENT_DECEMBER seems to be <b>significantly different</b> across STATUS. Looking at the distribution of PAYMENT_DECEMBER within STATUS reveals how interesting some of their relationships are. ",
          "analysis1": " Within Due Date accounts for <b>more than half</b> (98.94%) of the total observations, whereas After 3 Months has just 1.07% of the total. Being the largest segment, <b>Within Due Date in Active</b> has about 560.0 observations, covering 74.77% of total. On the other hand, Within Due Date in Churn represents just 24.17% of the total observations. ",
          "title2": "Relationship between PAYMENT_DECEMBER and STATUS",
          "title1": "Concentration of PAYMENT_DECEMBER"
        },
        "dimension": "PAYMENT_DECEMBER"
      }
    ],
    "result": {
      "dimensions": [
        "SEX",
        "EDUCATION",
        "MARRIAGE",
        "AGE_CATEGORY",
        "PAYMENT_DECEMBER",
        "PAYMENT_NOVEMBER",
        "AMOUNT_PAID_DECEMBER",
        "AMOUNT_PAID_NOVEMBER",
        "OCCUPATION",
        "CREDIT_BALANCE"
      ],
      "results": {
        "STATUS": {
          "AGE_CATEGORY": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 1.0815414646857597,
            "pv": 0.7815318120250703,
            "contingency_table": {
              "table": [
                [
                  209,
                  203,
                  105,
                  46
                ],
                [
                  67,
                  71,
                  30,
                  18
                ]
              ],
              "column_two_values": [
                "21-30",
                "31-40",
                "41-50",
                "Above 50"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 3,
            "percentage_table": {
              "table": [
                [
                  27.903871829105473,
                  27.102803738317757,
                  14.018691588785046,
                  6.141522029372497
                ],
                [
                  8.945260347129507,
                  9.479305740987984,
                  4.005340453938585,
                  2.403204272363151
                ]
              ],
              "column_two_values": [
                "21-30",
                "31-40",
                "41-50",
                "Above 50"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.0268698771276122,
            "method": "pearson"
          },
          "AMOUNT_PAID_DECEMBER": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 0.9268042897052416,
            "pv": 0.6291395763867409,
            "contingency_table": {
              "table": [
                [
                  16,
                  2,
                  545
                ],
                [
                  4,
                  0,
                  182
                ]
              ],
              "column_two_values": [
                "$1000 to $5000",
                "$5000 to $10000",
                "Less than $1000"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 2,
            "percentage_table": {
              "table": [
                [
                  2.1361815754339117,
                  0.26702269692923897,
                  72.76368491321762
                ],
                [
                  0.5340453938584779,
                  0,
                  24.299065420560748
                ]
              ],
              "column_two_values": [
                "$1000 to $5000",
                "$5000 to $10000",
                "Less than $1000"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.02487356935396895,
            "method": "pearson"
          },
          "PAYMENT_NOVEMBER": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 6.715024189846197,
            "pv": 0.00956039941314113,
            "contingency_table": {
              "table": [
                [
                  4,
                  559
                ],
                [
                  6,
                  180
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 1,
            "percentage_table": {
              "table": [
                [
                  0.5340453938584779,
                  74.6328437917223
                ],
                [
                  0.8010680907877169,
                  24.03204272363151
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.06695266740612,
            "method": "pearson"
          },
          "CREDIT_BALANCE": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 8.67183096203804,
            "pv": 0.06984652025458993,
            "splits": [
              300,
              4500,
              8700,
              12900,
              17100,
              21300
            ],
            "contingency_table": {
              "table": [
                [
                  277,
                  184,
                  75,
                  20,
                  7
                ],
                [
                  111,
                  51,
                  21,
                  3,
                  0
                ]
              ],
              "column_two_values": [
                "0.0",
                "1.0",
                "2.0",
                "3.0",
                "4.0"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 4,
            "percentage_table": {
              "table": [
                [
                  36.9826435246996,
                  24.566088117489986,
                  10.013351134846461,
                  2.67022696929239,
                  0.9345794392523364
                ],
                [
                  14.819759679572764,
                  6.809078771695594,
                  2.803738317757009,
                  0.40053404539385845,
                  0
                ]
              ],
              "column_two_values": [
                "0.0",
                "1.0",
                "2.0",
                "3.0",
                "4.0"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.07608507887223806,
            "method": "pearson"
          },
          "AMOUNT_PAID_NOVEMBER": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 7.1379628364530685,
            "pv": 0.028184547330609044,
            "contingency_table": {
              "table": [
                [
                  20,
                  1,
                  542
                ],
                [
                  0,
                  0,
                  186
                ]
              ],
              "column_two_values": [
                "$1000 to $5000",
                "$5000 to $10000",
                "Less than $1000"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 2,
            "percentage_table": {
              "table": [
                [
                  2.67022696929239,
                  0.13351134846461948,
                  72.36315086782376
                ],
                [
                  0,
                  0,
                  24.833110814419225
                ]
              ],
              "column_two_values": [
                "$1000 to $5000",
                "$5000 to $10000",
                "Less than $1000"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.06902894478351777,
            "method": "pearson"
          },
          "SEX": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 2.527983016617877,
            "pv": 0.11184309752786781,
            "contingency_table": {
              "table": [
                [
                  337,
                  226
                ],
                [
                  99,
                  87
                ]
              ],
              "column_two_values": [
                "Female",
                "Male"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 1,
            "percentage_table": {
              "table": [
                [
                  44.99332443257677,
                  30.173564753004005
                ],
                [
                  13.21762349799733,
                  11.615487316421897
                ]
              ],
              "column_two_values": [
                "Female",
                "Male"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.04108006946466312,
            "method": "pearson"
          },
          "PAYMENT_DECEMBER": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 6.1463233164688145,
            "pv": 0.0131685588645305,
            "contingency_table": {
              "table": [
                [
                  3,
                  560
                ],
                [
                  5,
                  181
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 1,
            "percentage_table": {
              "table": [
                [
                  0.40053404539385845,
                  74.76635514018692
                ],
                [
                  0.6675567423230975,
                  24.16555407209613
                ]
              ],
              "column_two_values": [
                "After 3 Months",
                "Within Due Date"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.06405481691806182,
            "method": "pearson"
          },
          "MARRIAGE": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 1.567466115960455,
            "pv": 0.4566979452249861,
            "contingency_table": {
              "table": [
                [
                  231,
                  6,
                  326
                ],
                [
                  86,
                  2,
                  98
                ]
              ],
              "column_two_values": [
                "Married",
                "Others",
                "Single"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 2,
            "percentage_table": {
              "table": [
                [
                  30.8411214953271,
                  0.8010680907877169,
                  43.524699599465954
                ],
                [
                  11.481975967957275,
                  0.26702269692923897,
                  13.08411214953271
                ]
              ],
              "column_two_values": [
                "Married",
                "Others",
                "Single"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.03234768266927942,
            "method": "pearson"
          },
          "EDUCATION": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 2.65941757839395,
            "pv": 0.44716796293188565,
            "contingency_table": {
              "table": [
                [
                  211,
                  81,
                  7,
                  264
                ],
                [
                  71,
                  30,
                  0,
                  85
                ]
              ],
              "column_two_values": [
                "Graduate School",
                "High School",
                "Others",
                "University"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 3,
            "percentage_table": {
              "table": [
                [
                  28.17089452603471,
                  10.814419225634179,
                  0.9345794392523364,
                  35.24699599465955
                ],
                [
                  9.479305740987984,
                  4.005340453938585,
                  0,
                  11.348464619492656
                ]
              ],
              "column_two_values": [
                "Graduate School",
                "High School",
                "Others",
                "University"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.04213445306527006,
            "method": "pearson"
          },
          "OCCUPATION": {
            "nh": "the occurrence of the outcomes is statistically independent.",
            "stat": 0.10140462653257272,
            "pv": 0.750150494433007,
            "contingency_table": {
              "table": [
                [
                  283,
                  280
                ],
                [
                  96,
                  90
                ]
              ],
              "column_two_values": [
                "Business",
                "Salaried"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "dof": 1,
            "percentage_table": {
              "table": [
                [
                  37.78371161548731,
                  37.38317757009346
                ],
                [
                  12.81708945260347,
                  12.016021361815755
                ]
              ],
              "column_two_values": [
                "Business",
                "Salaried"
              ],
              "column_one_values": [
                "Active",
                "Churn"
              ]
            },
            "cramers_v": 0.008227596377106414,
            "method": "pearson"
          }
        }
      }
    }
  },
  "get_tree_narratives": {
    "subheader": "The <b>decision tree diagram</b> helps us identify the key variables that explains categorization of STATUS.And, it showcases the <b>key variable</b> and how it influences classification of observations into specific STATUS.",
    "success_percent": {
      "Active": [
        60,
        73.55072463768116,
        78.57142857142857,
        100,
        83.87096774193549
      ],
      "Churn": [
        100,
        75,
        75
      ]
    },
    "succesful_predictions": {
      "Active": [
        3,
        406,
        11,
        11,
        130
      ],
      "Churn": [
        4,
        3,
        3
      ]
    },
    "condensedTable": {
      "Active": [
        "If the value of CREDIT_BALANCE is less than or equal to 6900.0, the PAYMENT_NOVEMBER falls among (After 3 Months), the SEX does not fall in (Male), then the STATUS is most likely to fall under Active",
        "If the value of CREDIT_BALANCE is less than or equal to 6900.0, the PAYMENT_DECEMBER does not fall in (After 3 Months), the PAYMENT_NOVEMBER does not fall in (After 3 Months), then the STATUS is most likely to fall under Active",
        "If the value of CREDIT_BALANCE is greater than 6900.0, the AGE_CATEGORY falls among (Above 50), the SEX does not fall in (Male), then the STATUS is most likely to fall under Active",
        "If the value of CREDIT_BALANCE is greater than 6900.0, the AGE_CATEGORY does not fall in (Above 50), the AMOUNT_PAID_NOVEMBER falls among ($1000 to $5000,$5000 to $10000), then the STATUS is most likely to fall under Active",
        "If the value of CREDIT_BALANCE is greater than 6900.0, the AGE_CATEGORY does not fall in (Above 50), the AMOUNT_PAID_NOVEMBER does not fall in ($1000 to $5000,$5000 to $10000), then the STATUS is most likely to fall under Active"
      ],
      "Churn": [
        "If the value of CREDIT_BALANCE is less than or equal to 6900.0, the PAYMENT_NOVEMBER falls among (After 3 Months), the SEX falls among (Male), then the STATUS is most likely to fall under Churn",
        "If the value of CREDIT_BALANCE is less than or equal to 6900.0, the PAYMENT_DECEMBER falls among (After 3 Months), the PAYMENT_NOVEMBER does not fall in (After 3 Months), then the STATUS is most likely to fall under Churn",
        "If the value of CREDIT_BALANCE is greater than 6900.0, the AGE_CATEGORY falls among (Above 50), the SEX falls among (Male), then the STATUS is most likely to fall under Churn"
      ]
    },
    "total_predictions": {
      "Active": [
        5,
        552,
        14,
        11,
        155
      ],
      "Churn": [
        4,
        4,
        4
      ]
    },
    "new_table": {
      "Active": {
        "rules": [
          "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER in (After 3 Months),SEX not in (Male)",
          "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER not in (After 3 Months),PAYMENT_DECEMBER not in (After 3 Months)",
          "CREDIT_BALANCE > 6900.0,AGE_CATEGORY in (Above 50),SEX not in (Male)",
          "CREDIT_BALANCE > 6900.0,AGE_CATEGORY not in (Above 50),AMOUNT_PAID_NOVEMBER in ($1000 to $5000,$5000 to $10000)",
          "CREDIT_BALANCE > 6900.0,AGE_CATEGORY not in (Above 50),AMOUNT_PAID_NOVEMBER not in ($1000 to $5000,$5000 to $10000)"
        ],
        "probability": [
          60,
          73.55,
          78.57,
          100,
          83.87
        ]
      },
      "Churn": {
        "rules": [
          "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER in (After 3 Months),SEX in (Male)",
          "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER not in (After 3 Months),PAYMENT_DECEMBER in (After 3 Months)",
          "CREDIT_BALANCE > 6900.0,AGE_CATEGORY in (Above 50),SEX in (Male)"
        ],
        "probability": [
          100,
          75,
          75
        ]
      }
    },
    "dropdownValues": [
      "Active",
      "Churn"
    ],
    "table": {
      "Active": [
        "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER in (After 3 Months),SEX not in (Male)",
        "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER not in (After 3 Months),PAYMENT_DECEMBER not in (After 3 Months)",
        "CREDIT_BALANCE > 6900.0,AGE_CATEGORY in (Above 50),SEX not in (Male)",
        "CREDIT_BALANCE > 6900.0,AGE_CATEGORY not in (Above 50),AMOUNT_PAID_NOVEMBER in ($1000 to $5000,$5000 to $10000)",
        "CREDIT_BALANCE > 6900.0,AGE_CATEGORY not in (Above 50),AMOUNT_PAID_NOVEMBER not in ($1000 to $5000,$5000 to $10000)"
      ],
      "Churn": [
        "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER in (After 3 Months),SEX in (Male)",
        "CREDIT_BALANCE <= 6900.0,PAYMENT_NOVEMBER not in (After 3 Months),PAYMENT_DECEMBER in (After 3 Months)",
        "CREDIT_BALANCE > 6900.0,AGE_CATEGORY in (Above 50),SEX in (Male)"
      ]
    },
    "dropdownComment": "Please select any STATUS category from the drop down below to view it's most significant decision rules.These rules capture sets of observations that are most likely to be from the chosen STATUS."
  },
  "get_tree_results_raw": {
    "tree": {
      "children": [
        {
          "name": "CREDIT_BALANCE <= 6900.0",
          "children": [
            {
              "name": "PAYMENT_NOVEMBER in (After 3 Months)",
              "children": [
                {
                  "name": "SEX in (Male)",
                  "children": [
                    {
                      "name": "Predict: Churn"
                    }
                  ]
                },
                {
                  "name": "SEX not in (Male)",
                  "children": [
                    {
                      "name": "Predict: Active"
                    }
                  ]
                }
              ]
            },
            {
              "name": "PAYMENT_NOVEMBER not in (After 3 Months)",
              "children": [
                {
                  "name": "PAYMENT_DECEMBER in (After 3 Months)",
                  "children": [
                    {
                      "name": "Predict: Churn"
                    }
                  ]
                },
                {
                  "name": "PAYMENT_DECEMBER not in (After 3 Months)",
                  "children": [
                    {
                      "name": "Predict: Active"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "CREDIT_BALANCE > 6900.0",
          "children": [
            {
              "name": "AGE_CATEGORY in (Above 50)",
              "children": [
                {
                  "name": "SEX in (Male)",
                  "children": [
                    {
                      "name": "Predict: Churn"
                    }
                  ]
                },
                {
                  "name": "SEX not in (Male)",
                  "children": [
                    {
                      "name": "Predict: Active"
                    }
                  ]
                }
              ]
            },
            {
              "name": "AGE_CATEGORY not in (Above 50)",
              "children": [
                {
                  "name": "AMOUNT_PAID_NOVEMBER in ($1000 to $5000,$5000 to $10000)",
                  "children": [
                    {
                      "name": "Predict: Active"
                    }
                  ]
                },
                {
                  "name": "AMOUNT_PAID_NOVEMBER not in ($1000 to $5000,$5000 to $10000)",
                  "children": [
                    {
                      "name": "Predict: Active"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "name": "Root"
    }
  }
}