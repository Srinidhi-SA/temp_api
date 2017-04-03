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
# import hadoopy

def errand_base_directory(instance):
    return "uploads/errands/{0}".format(instance.id)

def errand_input_file_directory_path(instance, filename):
    return errand_base_directory(instance) + "/{0}".format(filename)

class Errand(models.Model):
    slug = models.CharField(max_length=100)
    input_file = models.FileField(upload_to=errand_input_file_directory_path, null=True, blank=True)
    dimension = models.CharField(max_length=300, null=True)
    measure = models.CharField(max_length=100, null=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    dataset = models.ForeignKey(Dataset, null=True)
    name = models.CharField(max_length=300, null=True)
    compare_with = models.CharField(max_length=300, default="")
    compare_type = models.CharField(max_length=100, null=True)
    column_data_raw = models.TextField(default="{}")
    userId = models.CharField(max_length=100, null=True)

    # CLASS METHODS
    @classmethod
    def make(cls, data):
        obj = cls(slug=data.get('slug'))
        obj.dataset_id = data.get('dataset_id')
        obj.userId = data.get('userId')
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
        call(["sh", "api/lib/run_dist.sh", settings.HDFS['host'], self.dataset.get_input_file_storage_path(), self.storage_measure_output_dir(), self.measure])
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
        self.run_save_config()
        call([
            "sh", "api/lib/run_master.sh",
            settings.HDFS['host'],
            "/home/hadoop/configs/" + self.config_file_path_hadoop
        ])

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
        return hadoop.hadoop_read_output_file(result_dir)

    def get_narratives(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        # dir = self.storage_measure_output_dir() + "/narratives.json"
        dir = self.storage_output_dir() + "/narratives/DescrStats"
        return hadoop.hadoop_read_output_file(dir)


    def get_dimension_results(self):
        # path = self.storage_measure_output_dir() + "/dimensions-narratives.json"
        path = self.storage_output_dir() + "/narratives/OneWayAnova"
        narratives = hadoop.hadoop_read_output_file(path)
        items = narratives['narratives'][self.measure]
        dimensions_data = {}
        dimensions_data['summary'] = items['summary']
        dimensions_data['narratives'] = []

        for key, value in items['narratives'].iteritems():
            dimensions_data['narratives'].append(value)

        # RESULTS
        # path = self.storage_measure_output_dir() + "/dimensions-result.json"
        path = self.storage_output_dir() + "/results/OneWayAnova"
        result = hadoop.hadoop_read_output_file(path)
        result_data = []
        items = result["results"][self.measure]
        for key, value in items.iteritems():
            result_data.append([key, value["effect_size"]])
        dimensions_data['raw_data'] = result_data

        # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
        def order(item):
            return -item[1]
        dimensions_data['raw_data'] = sorted(dimensions_data['raw_data'], key = order)

        return dimensions_data

    def get_reg_results(self):
        data = {}
        # path = self.storage_measure_output_dir() + "/reg-narratives.json"
        path = self.storage_output_dir() + "/narratives/Regression"
        narratives = hadoop.hadoop_read_output_file(path)
        # print narratives.keys()
        data['summary'] = narratives['summary']
        # data['analysis'] = narratives['analysis']
        data['narratives'] = narratives

        # path = self.storage_measure_output_dir() + "/reg-result.json"
        path = self.storage_output_dir() + "/results/Regression"
        result = hadoop.hadoop_read_output_file(path)

        data['raw_data'] = []
        for key, value in result['stats']['coefficients'].iteritems():
            data['raw_data'].append([key, round(value['coefficient'], 1)])

        # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
        def order(item):
            return item[1]
        data['raw_data'] = sorted(data['raw_data'], key = order)
        return data

    def get_frequency_results(self):
        # result_path = self.storage_dimension_output_dir() + "/frequency-result.json";
        result_path = self.storage_output_dir() + "/results/FreqDimension"
        results_data = hadoop.hadoop_read_output_file(result_path);
        results = []
        table = json.loads(results_data['frequency_table'])[self.dimension]
        result = zip(table[self.dimension].values(), table['count'].values())
        # narratives_path = self.storage_dimension_output_dir() + "/frequency-narratives.json";
        narratives_path = self.storage_output_dir() + "/narratives/FreqDimension"

        return {
            'raw_data': result,
            'narratives': hadoop.hadoop_read_output_file(narratives_path)
        }

    def get_tree_results_raw(self):
        # result_path = self.storage_dimension_output_dir() + "/tree-result.json";
        result_path = self.storage_output_dir() + "/results/DecisionTree"
        data = hadoop.hadoop_read_output_file(result_path);
        data['tree']['children'] = json.loads(data['tree']['children'])
        return data

    def get_tree_results(self):
        # result_path = self.storage_dimension_output_dir() + "/tree-result.json";
        result_path = self.storage_output_dir() + "/results/DecisionTree"
        tree = hadoop.hadoop_read_output_file(result_path)['tree'];
        bucket = [["Root", ""]]
        self._get_tree_results_node(bucket, tree['name'], json.loads(tree['children']))
        return bucket

    def _get_tree_results_node(self, bucket, parent, children):
        for child in children:
            print(len(bucket))
            bucket.append([child['name'], parent])
            if 'children' in child:
                self._get_tree_results_node(bucket, child['name'], child['children'])

    def get_tree_narratives(self):
        # path = self.storage_dimension_output_dir() + "/tree-narratives.json"
        path = self.storage_output_dir() + "/narratives/DecisionTree"
        return hadoop.hadoop_read_output_file(path)

    def get_chi_results(self):
        # result_path = self.storage_dimension_output_dir() + "/chi-result.json";
        # narratives_path = self.storage_dimension_output_dir() + "/chi-narratives.json";
        result_path = self.storage_output_dir() + "/results/ChiSquare"
        narratives_path = self.storage_output_dir() + "/narratives/ChiSquare"
        narratives_data = hadoop.hadoop_read_output_file(narratives_path);
        narratives = []
        list = narratives_data["narratives"][self.dimension]
        for key, value in list.iteritems():
            if type(value) == dict:
                value['dimension'] = key
                narratives.append(value)

        # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
        def order(item):
            return -item['effect_size']
        narratives = sorted(narratives, key = order)

        return {
            'result': hadoop.hadoop_read_output_file(result_path),
            'narratives': narratives,
            'narratives_raw': narratives_data
        }

    def create_configuration_file(self):
        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")
        config.add_section("COLUMN_SETTINGS")
        config.add_section("FILTER_SETTINGS")

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

        column_data = self.get_column_data()
        if column_data.has_key('date'):
            config.set('COLUMN_SETTINGS', 'date_columns', column_data['date'])

        if(column_data.has_key('date_format')):
            config.set('COLUMN_SETTINGS', 'date_format', column_data['date_format'])

        with open(self.config_file_path, 'wb') as file:
            config.write(file)
        print "Take a look at: {}".format(self.config_file_path)
        hadoop.hadoop_put(self.config_file_path, self.storage_input_dir())

    def option_dict_to_string(self, option_dict):
        options_with_yes = []
        for key in option_dict:
            if option_dict[key] == 'yes':
                options_with_yes.append(key)
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


class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()
    is_archived = serializers.BooleanField()
    measure = serializers.CharField(max_length=100)
    name = serializers.ReadOnlyField()
    dimension = serializers.ReadOnlyField()
    dataset_id = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()

    class Meta:
        model = Errand
        fields = ('id', 'slug', 'input_file_path')
