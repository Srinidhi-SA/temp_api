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

    # CLASS METHODS
    @classmethod
    def make(cls, data):
        obj = cls(slug=data.get('slug'))
        obj.dataset_id = data.get('dataset_id')
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
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())

    def send_input_file_to_storage(self):
        hadoop.hadoop_put(self.input_file.path, self.storage_input_dir() + "/")

    def get_input_file_storage_path(self):
        return "{0}/{1}".format(self.storage_input_dir(), os.path.basename(self.input_file.name))

    def get_output_file_path(self, name=""):
        return self.storage_output_dir() + "/" + name

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

    # RUNS THE SCRIPTS
    def run_dist(self, force = False):
        if (force is False) and self.is_measure_setup():
            print ("Not running the scripts as this measure is already setup")
            return

        print("Running distrubutions scripts")
        call(["sh", "api/lib/run_dist.sh", settings.HDFS['host'], self.dataset.get_input_file_storage_path(), self.storage_measure_output_dir(), self.measure])
        self.mark_as_done()

    def run_dimension(self, force = True):
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

    # THIS INDICTATES THAT THE PROCESSING IS COMPLETE
    def mark_as_done(self):
        return hadoop.hadoop_hdfs().create_file(self.storage_measure_output_dir() + "/_DONE", "")

    def mark_dimension_as_done(self):
        return hadoop.hadoop_hdfs().create_file(self.storage_dimension_output_dir() + "/_DONE", "")

    def get_result(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        result_dir = self.storage_measure_output_dir() + "/result.json"
        return hadoop.hadoop_read_output_file(result_dir)

    def get_narratives(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        dir = self.storage_measure_output_dir() + "/narratives.json"
        return hadoop.hadoop_read_output_file(dir)


    def get_dimension_results(self):
        path = self.storage_measure_output_dir() + "/dimensions-narratives.json"
        narratives = hadoop.hadoop_read_output_file(path)
        items = narratives['narratives'][self.measure]
        dimensions_data = {}
        dimensions_data['summary'] = items['summary']
        dimensions_data['narratives'] = []

        for key, value in items['narratives'].iteritems():
            dimensions_data['narratives'].append(value)

        # RESULTS
        path = self.storage_measure_output_dir() + "/dimensions-result.json"
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
        path = self.storage_measure_output_dir() + "/reg-narratives.json"
        narratives = hadoop.hadoop_read_output_file(path)
        data['summary'] = narratives['summary']
        data['analysis'] = narratives['analysis']

        path = self.storage_measure_output_dir() + "/reg-result.json"
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
        result_path = self.storage_dimension_output_dir() + "/frequency-result.json";
        results_data = hadoop.hadoop_read_output_file(result_path);
        results = []
        table = json.loads(results_data['frequency_table'])[self.dimension]
        result = zip(table[self.dimension].values(), table['count'].values())
        narratives_path = self.storage_dimension_output_dir() + "/frequency-narratives.json";
        return {
            'raw_data': result,
            'narratives': hadoop.hadoop_read_output_file(narratives_path)
        }

class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()
    is_archived = serializers.BooleanField()
    measure = serializers.CharField(max_length=100)
    dataset_id = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()

    class Meta:
        model = Errand
        fields = ('id', 'slug', 'input_file_path')
