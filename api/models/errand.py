from django.db import models
from rest_framework import serializers
from api.lib import hadoop
import os, json
import ConfigParser
import csv
import itertools
from subprocess import call
from api.models.dataset import Dataset
from django.conf import settings
from api.views.option import get_option_for_this_user
from api.models.jobserver import submit_masterjob
# import hadoopy

name_map = {
    'measure_dimension_stest': "Measure vs. Dimension",
    'dimension_dimension_stest':'Dimension vs. Dimension',
    'measure_measure_impact':'Measure vs. Measure',
    'prediction_check':'Predictive modeling',
    'desc_analysis':'Descriptive analysis',
}

def errand_base_directory(instance):
    return "uploads/errands/{0}".format(instance.id)

def errand_input_file_directory_path(instance, filename):
    return errand_base_directory(instance) + "/{0}".format(filename)

def check_blank_object(object):
    keys = object.keys()
    if len(keys) > 0:
        return False
    else:
        return True

class Errand(models.Model):
    slug = models.CharField(max_length=100)
    input_file = models.FileField(upload_to=errand_input_file_directory_path, null=True, blank=True)
    dimension = models.CharField(max_length=300, null=True)
    measure = models.CharField(max_length=100, null=True)
    is_archived = models.CharField(max_length=100, default="FALSE")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    dataset = models.ForeignKey(Dataset, null=True)
    name = models.CharField(max_length=300, null=True)
    compare_with = models.CharField(max_length=300, default="")
    compare_type = models.CharField(max_length=100, null=True)
    column_data_raw = models.TextField(default="{}")
    userId = models.CharField(max_length=100, null=True)
    analysis_done = models.CharField(max_length=100, default="FALSE")

    # CLASS METHODS
    @classmethod
    def make(cls, data, userId):
        obj = cls(slug=data.get('slug'))
        obj.dataset_id = data.get('dataset_id')
        obj.userId = userId
        obj.name = data.get('name')

        # comp
        # obj.userId = '1'
        obj.save()
        obj.setup_storage_folders()
        return obj

    # INSTANCE METHODS
    def base_storage_dir(self):
        return "/errands/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    def storage_measure_output_dir(self):
        return self.storage_output_dir() + "/" + self.measure

    def storage_dimension_output_dir(self):
        return self.storage_output_dir() + "/" + self.dimension

    def setup_storage_folders(self):
        dir = "uploads"  + self.base_storage_dir()
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())
        print("looking for " + dir)
        if not os.path.exists(dir):
            os.makedirs(dir)
        else:
            print("you are already there")

    def send_input_file_to_storage(self):
        hadoop.hadoop_put(self.input_file.path, self.storage_input_dir() + "/")

    def get_input_file_storage_path(self):
        return "{0}/{1}".format(self.storage_input_dir(), os.path.basename(self.input_file.name))

    def get_output_file_path(self, name=""):
        return self.storage_output_dir() + "/" + name

    @property
    def config_file_path(self):
        return errand_base_directory(self) + "/config.cfg"

    @property
    def config_file_path_hadoop(self):
        return str(self.id) + "config.cfg"

    def get_columns(self):
        preview = self.get_preview_data()
        return preview[0]

    def set_dimension(self, string):
        self.dimension = string
        self.save()
        if hadoop.hadoop_exists(self.storage_dimension_output_dir()) is not True:
            hadoop.hadoop_mkdir(self.storage_dimension_output_dir())

    def set_measure(self, string):
        self.measure = string
        self.save()
        if hadoop.hadoop_exists(self.storage_measure_output_dir()) is not True:
            hadoop.hadoop_mkdir(self.storage_measure_output_dir())

    def is_measure_setup(self):
        path = self.storage_measure_output_dir() + "/_DONE"
        return hadoop.hadoop_exists(path)

    def is_dimension_done(self):
        path = self.storage_dimension_output_dir() + "/_DONE"
        return hadoop.hadoop_exists(path)

    def set_column_data(self, data):
        print "Saving: " + json.dumps(data)
        self.column_data_raw = json.dumps(data)
        self.save()

    def get_column_data(self):
        return json.loads(self.column_data_raw)

    # RUNS THE SCRIPTS
    def run_dist(self, force = False):
        if (force is False) and self.is_measure_setup():
            print ("Not running the scripts as this measure is already setup")
            return

        print("Running distrubutions scripts")
        call(["sh", "api/lib/run_dist.sh",
              settings.HDFS['host'],
              self.dataset.get_input_file_storage_path(),
              self.storage_measure_output_dir(),
              self.measure])
        self.mark_as_done()

    def run_dimension(self, force = False):
        if (force is False) and self.is_dimension_done():
            print ("Not running the scripts as this measure is already setup")
            return

        print("Running dimensions scripts")
        call([
            "sh", "api/lib/run_dimension.sh",
            settings.HDFS['host'],
            self.dataset.get_input_file_storage_path(),
            self.storage_dimension_output_dir(),
            self.dimension
        ])
        self.mark_dimension_as_done()

    def run_master(self):
        self.create_configuration_file()
        #print("Running master script")
        self.run_save_config()
        '''call([
            "sh", "api/lib/run_master.sh",
            settings.HDFS['host'],
            "/home/hadoop/configs/" + self.config_file_path_hadoop
        ])'''

        print ("Running jobserver master script")
        configpath = "/home/hadoop/configs/" + self.config_file_path_hadoop
        print "configpath:{0}".format(configpath)
        submit_masterjob(configpath)


    def run_save_config(self):
        call([
            "sh", "api/lib/run_save_config.sh",
            settings.HDFS['host'],
            settings.BASE_DIR + "/" + self.config_file_path,
            self.config_file_path_hadoop
        ])

    # THIS INDICTATES THAT THE PROCESSING IS COMPLETE
    def mark_as_done(self):
        return hadoop.hadoop_hdfs().create_file(self.storage_measure_output_dir() + "/_DONE", "")

    def mark_dimension_as_done(self):
        return hadoop.hadoop_hdfs().create_file(self.storage_dimension_output_dir() + "/_DONE", "")

    def get_result(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        # result_dir = self.storage_measure_output_dir() + "/result.json"
        result_dir  = self.storage_output_dir() + "/results/DescrStats"
        try:
            output = hadoop.hadoop_read_output_file(result_dir)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(output):
            return output
        else:
            return {}

    def get_narratives(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        # dir = self.storage_measure_output_dir() + "/narratives.json"
        dir = self.storage_output_dir() + "/narratives/DescrStats"
        try:
            output = hadoop.hadoop_read_output_file(dir)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(output):
            return output
        else:
            return {}

    def get_dimension_results(self):
        # path = self.storage_measure_output_dir() + "/dimensions-narratives.json"
        path = self.storage_output_dir() + "/narratives/OneWayAnova"


        try:
            narratives = hadoop.hadoop_read_output_file(path)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(narratives):
            if self.measure in narratives['narratives'].keys():
                items = narratives['narratives'][self.measure]
                dimensions_data = {}
                dimensions_data['summary'] = items['summary']
                dimensions_data['narratives'] = []

                for key, value in items['narratives'].iteritems():
                    dimensions_data['narratives'].append(value)

                # RESULTS
                # path = self.storage_measure_output_dir() + "/dimensions-result.json"
                path = self.storage_output_dir() + "/results/OneWayAnova"

                try:
                    hadoop_result = hadoop.hadoop_read_output_file(path)
                    result = json.loads(hadoop_result["RESULT"])
                    result_data = []
                    items = result["results"][self.measure]
                    for key, value in items.iteritems():
                        result_data.append([key, value["effect_size"]])
                    dimensions_data['raw_data'] = result_data

                    # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
                    def order(item):
                        return -item[1]
                    dimensions_data['raw_data'] = sorted(dimensions_data['raw_data'], key = order)
                except Exception as error:
                    print error
                    dimensions_data['raw_data'] = {}

                return dimensions_data
            else:
                return {}
        else:
            return {}

    def get_reg_results(self):
        data = {}
        # path = self.storage_measure_output_dir() + "/reg-narratives.json"
        path = self.storage_output_dir() + "/narratives/Regression"
        try:
            narratives = hadoop.hadoop_read_output_file(path)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(narratives):
            # print narratives.keys()
            if "summary" in narratives.keys():
                data['summary'] = narratives['summary']
                # data['analysis'] = narratives['analysis']
                data['narratives'] = narratives
            else:
                data['summary'] = {}
                data['narratives'] = narratives

        else:
            data = {}

        # path = self.storage_measure_output_dir() + "/reg-result.json"
        path = self.storage_output_dir() + "/results/Regression"

        try:
            result = hadoop.hadoop_read_output_file(path)
            if not check_blank_object(result):
                data['raw_data'] = []
                if "stats" in result.keys():
                    for key, value in result['stats']['coefficients'].iteritems():
                        data['raw_data'].append([key, round(value['coefficient'], 1)])

                    # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
                    def order(item):
                        return item[1]

                    data['raw_data'] = sorted(data['raw_data'], key=order)
                else:
                    data.pop('raw_data', None)
        except Exception as error:
            print error
            return data

        return data


    def get_frequency_results(self):
        # result_path = self.storage_dimension_output_dir() + "/frequency-result.json";
        result_path = self.storage_output_dir() + "/results/FreqDimension"

        try:
            results_data = hadoop.hadoop_read_output_file(result_path)
        except Exception as error:
            print error
            return {}
        results = []
        if not check_blank_object(results_data):
            if 'frequency_table' in results_data.keys() and self.dimension is not None:
                table = json.loads(results_data['frequency_table'])[self.dimension]
                result = zip(table[self.dimension].values(), table['count'].values())
                # narratives_path = self.storage_dimension_output_dir() + "/frequency-narratives.json";
                narratives_path = self.storage_output_dir() + "/narratives/FreqDimension"

                try:
                    narratives_path_result = hadoop.hadoop_read_output_file(narratives_path)
                except Exception as error:
                    narratives_path_result={}
                    
                return {
                    'raw_data': result,
                    'narratives': narratives_path_result
                }
            else:
                return{}
        else:
            return {}

    def get_tree_results_raw(self):
        # result_path = self.storage_dimension_output_dir() + "/tree-result.json";
        result_path = self.storage_output_dir() + "/results/DecisionTree"
        try:
            data = hadoop.hadoop_read_output_file(result_path)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(data):
            if 'tree' in data.keys():
                data['tree']['children'] = json.loads(data['tree']['children'])
                return data
            else:
                return {}
        else:
            return {}

    def get_tree_results(self):
        # result_path = self.storage_dimension_output_dir() + "/tree-result.json";
        result_path = self.storage_output_dir() + "/results/DecisionTree"
        try:
            tree = hadoop.hadoop_read_output_file(result_path)['tree']
        except Exception as error:
            print error
            return {}
        bucket = [["Root", ""]]

        if not check_blank_object(tree):
            if 'name' in tree.keys() and 'children' in tree.keys():
                self._get_tree_results_node(bucket, tree['name'], json.loads(tree['children']))
                return bucket
            else:
                return {}
        else:
            return {}

    def _get_tree_results_node(self, bucket, parent, children):
        for child in children:
            print(len(bucket))
            bucket.append([child['name'], parent])
            if 'children' in child:
                self._get_tree_results_node(bucket, child['name'], child['children'])

    def get_tree_narratives(self):
        # path = self.storage_dimension_output_dir() + "/tree-narratives.json"
        path = self.storage_output_dir() + "/narratives/DecisionTree"
        try:
            output = hadoop.hadoop_read_output_file(path)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(output):
            return output
        return {}

    def get_chi_results(self):
        # result_path = self.storage_dimension_output_dir() + "/chi-result.json";
        # narratives_path = self.storage_dimension_output_dir() + "/chi-narratives.json";
        result_path = self.storage_output_dir() + "/results/ChiSquare"
        narratives_path = self.storage_output_dir() + "/narratives/ChiSquare"

        try:
            narratives_data = hadoop.hadoop_read_output_file(narratives_path)
        except Exception as error:
            print error
            return {}

        narratives = []
        print "self.dimension : ", self.dimension
        if not check_blank_object(narratives_data):
            if "narratives" in narratives_data.keys() and self.dimension is not None:
                print narratives_data["narratives"]
                list = narratives_data["narratives"][self.dimension]
                for key, value in list.iteritems():
                    if type(value) == dict:
                        value['dimension'] = key
                        narratives.append(value)

                # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
                def order(item):
                    return -item['effect_size']
                narratives = sorted(narratives, key = order)

                result = {}
                try:
                    result = hadoop.hadoop_read_output_file(result_path)
                except Exception as error:
                    print error

                return {
                    'result': result,
                    'narratives': narratives,
                    'narratives_raw': narratives_data
                }
        return {}

    def create_configuration_file(self):
        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")
        config.add_section("COLUMN_SETTINGS")
        config.add_section("FILTER_SETTINGS")
        config.add_section("META_DATA")

        config.set('FILE_SETTINGS', 'InputFile', hadoop.hadoop_get_full_url(self.dataset.get_input_file_storage_path()))
        config.set('FILE_SETTINGS', 'result_file', hadoop.hadoop_get_full_url(self.storage_output_dir() + "/results/"))
        config.set('FILE_SETTINGS', 'narratives_file', hadoop.hadoop_get_full_url(self.storage_output_dir() + "/narratives/"))
        config.set('FILE_SETTINGS', 'monitor_api', 'http://52.77.216.14/api/errand/1/log_status')

        # settings from master table, option.get_option_for_this_user
        option_dict = get_option_for_this_user(self.userId)
        print option_dict
        config.set('FILE_SETTINGS', 'script_to_run', self.option_dict_to_string(option_dict))

        if self.measure != None:
            config.set('COLUMN_SETTINGS', 'result_column', self.measure)
            config.set('COLUMN_SETTINGS', 'analysis_type', "Measure")
        else:
            config.set('COLUMN_SETTINGS', 'analysis_type', "Dimension")
            config.set('COLUMN_SETTINGS', 'result_column', self.dimension)

        config.set('COLUMN_SETTINGS', 'polarity', "positive")
        config.set('COLUMN_SETTINGS', 'consider_columns', self.compare_with)
        config.set('COLUMN_SETTINGS', 'consider_columns_type', self.compare_type)
        # config.set('COLUMN_SETTINGS', 'ignore_columns', "DATE_JOIN")  ---> see below ignore_column_suggestions

        column_data = self.get_column_data()
        if column_data.has_key('date'):
            config.set('COLUMN_SETTINGS', 'date_columns', column_data['date'])

        if(column_data.has_key('date_format')):
            config.set('COLUMN_SETTINGS', 'date_format', column_data['date_format'])

        # ignore_column_suggestions
        if(column_data.has_key('ignore_column_suggestions')):
            config.set('COLUMN_SETTINGS', 'ignore_column_suggestions', column_data['ignore_column_suggestions'])

        # utf8_column_suggestions
        if (column_data.has_key('utf8_columns')):
            config.set('COLUMN_SETTINGS', 'utf8_columns', column_data['utf8_columns'])

        # MEASURE_FILTER
        if(column_data.has_key('MEASURE_FILTER')):
            config.set('COLUMN_SETTINGS', 'measure_column_filter', column_data['MEASURE_FILTER'])

        # DIMENSION_FILTER
        if(column_data.has_key('DIMENSION_FILTER')):
            config.set('COLUMN_SETTINGS', 'dimension_column_filter', column_data['DIMENSION_FILTER'])

        # measure_suggetions_json_data
        if(column_data.has_key('measure_suggetions_json_data')):
            config.set('COLUMN_SETTINGS', 'measure_suggestions', column_data['measure_suggetions_json_data'])

        # path = self.get_meta_json_path()
        # config.set("META_DATA", 'path', path)

        with open(self.config_file_path, 'wb') as file:
            config.write(file)
        print "Take a look at: {}".format(self.config_file_path)
        hadoop.hadoop_put(self.config_file_path, self.storage_input_dir())

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

    def read_config_file(self):
        details = {}
        config = ConfigParser.RawConfigParser()
        config.read(self.config_file_path)
        section_name = "FILE_SETTINGS"
        setting_name = "script_to_run"
        print config.__dict__
        analysis_list = config.get(section_name, setting_name)

        details['analysis_list'] = analysis_list.split(', ')
        return details

    def get_meta_json_path(self):
        path = self.dataset.output_file_meta_path
        return path

    def get_trend_analysis(self):
        narratives_path = self.storage_output_dir() + "/narratives/Trend"

        try:
            narratives_data = hadoop.hadoop_read_output_file(narratives_path)
        except Exception as error:
            print error
            return {}

        if not check_blank_object(narratives_data):
            data = narratives_data
            return data
        else:
            return {}

    def add_subsetting_to_column_data(self, main_data):

        data = self.column_data_raw
        data['MEASURE_FILTER'] = main_data['MEASURE_FILTER']
        data['DIMENSION_FILTER'] = main_data['DIMENSION_FILTER']
        self.save()


class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()
    is_archived = serializers.CharField()
    measure = serializers.CharField(max_length=100)
    name = serializers.ReadOnlyField()
    dimension = serializers.ReadOnlyField()
    dataset_id = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()
    userId = serializers.ReadOnlyField()
    analysis_done = serializers.CharField()

    class Meta:
        model = Errand
        fields = ('id', 'slug', 'input_file_path')
