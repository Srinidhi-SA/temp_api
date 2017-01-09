from django.db import models
from rest_framework import serializers
from api.lib import hadoop
import os
import ConfigParser
import csv
import itertools
from subprocess import call
# import hadoopy

def errand_base_directory(instance):
    return "uploads/errands/{0}".format(instance.id)

def errand_input_file_directory_path(instance, filename):
    return errand_base_directory(instance) + "/{0}".format(filename)

class Errand(models.Model):
    slug = models.CharField(max_length=100)
    input_file = models.FileField(upload_to=errand_input_file_directory_path, null=True, blank=True)
    dimensions = models.CharField(max_length=300, null=True)
    measure = models.CharField(max_length=100, null=True)

    # CLASS METHODS
    @classmethod
    def make(cls, data, input_file):
        obj = cls(slug=data.get('slug'))
        obj.save()
        obj.input_file = input_file
        obj.save()
        hadoop.hadoop_r()
        obj.setup_storage_folders()
        obj.send_input_file_to_storage()
        # obj.run_dist()
        return obj

    # INSTANCE METHODS
    def base_storage_dir(self):
        return "/errands/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    def setup_storage_folders(self):
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())

    def send_input_file_to_storage(self):
        hadoop.hadoop_put(self.input_file.path, self.storage_input_dir() + "/")

    def get_input_file_storage_path(self):
        return "{0}/{1}".format(self.storage_input_dir(), os.path.basename(self.input_file.name))

    def get_output_file_path(self, name=""):
        return self.storage_output_dir() + "/" + name

    def update_configration_file(self):
        config = ConfigParser.RawConfigParser()
        config.add_section("data")
        config.set('data', 'ERRAND_ID', self.id)
        config.set('data', 'ERRAND_SLUG', self.slug)

        config.add_section("storage")
        config.set('storage', 'INPUT_FILE', self.get_input_file_storage_path())
        config.set('storage', 'OUTPUT_DIR', "{0}{1}".format(hadoop.hadoop_hdfs_url(), self.storage_output_dir()))

        config.add_section('hooks')
        config.set('hooks', 'progress', "http://api.example.com/api/errands/status/update")
        config.set('hooks', 'complete', "http://api.example.com/api/errands/status/complete")
        config.set('hooks', 'failed', "http://api.example.com/api/errands/status/failed")

        config_file_path = errand_base_directory(self) + "/config.cfg"
        with open(config_file_path, 'wb') as file:
            config.write(file)
        print "Take a look at: {}".format(config_file_path)

    def get_preview_data(self):
        items = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=',')
            for row in itertools.islice(rows, 20):
                items.append(row)
        return items

    def get_columns(self):
        preview = self.get_preview_data()
        return preview[0]

    def set_dimensions(self, list):
        self.dimensions = ','.join([str(x) for x in list])
        self.save()

    def set_measure(self, string):
        self.measure = string
        self.save()

    # RUNS THE SCRIPTS
    def run_dist(self):
        print("Running distrubutions scripts")
        call(["sh", "api/lib/run_dist.sh", self.get_input_file_storage_path(), self.storage_output_dir()])

    def get_result(self):
        if self.measure is None :
            raise Exception("Measure is not set")

        result_dir = self.storage_output_dir() + "/result.json"
        list = hadoop.hadoop_ls(result_dir)
        for item in list:
            if item['length'] > 0:
                filled_part = result_dir + "/" + item['pathSuffix']
                print("Found at: " + filled_part)
                data = hadoop.hadoop_read_file(filled_part)
                return data['measures'][self.measure]
        return {}

    def get_narratives(self):
        if self.measure is None :
            raise Exception("Measure is not set")
        dir = self.storage_output_dir() + "/narratives.json"
        list = hadoop.hadoop_ls(dir)
        for item in list:
            if item['length'] > 0:
                filled_part = dir + "/" + item['pathSuffix']
                print("Found at: " + filled_part)
                data = hadoop.hadoop_read_file(filled_part)
                return data['measures'][self.measure]
        return {}

    def get_dimension_results(self):
        path = self.storage_output_dir() + "/dimensions-narratives.json"
        narratives = hadoop.hadoop_read_output_file(path)
        print "=============="
        items = narratives['narratives'][self.measure]
        dimensions_data = {}
        dimensions_data['summary'] = items['summary']
        dimensions_data['narratives'] = []

        for key, value in items['narratives'].iteritems():
            dimensions_data['narratives'].append(value)

        # RESULTS
        path = self.storage_output_dir() + "/dimensions-result.json"
        result = hadoop.hadoop_read_output_file(path)
        result_data = []
        items = result["results"][self.measure]
        for key, value in items.iteritems():
            result_data.append([key, value["effect_size"]])
        dimensions_data['raw_data'] = result_data
        return dimensions_data

    def get_reg_results(self):
        data = {}
        path = self.storage_output_dir() + "/reg-narratives.json"
        narratives = hadoop.hadoop_read_output_file(path)
        data['summary'] = narratives['narratives'][self.measure]['summary']
        data['analysis'] = narratives['narratives'][self.measure]['analysis']

        path = self.storage_output_dir() + "/reg-result.json"
        result = hadoop.hadoop_read_output_file(path)
        data['raw_data'] = []
        for key, value in result['results'][self.measure]['stats']['coefficients'].iteritems():
            data['raw_data'].append([key, value['coefficient']])

        # ORDERS IT SO THAT THE ITEM[1] IS WHAT IS USED
        def order(item):
            return item[1]
        data['raw_data'] = sorted(data['raw_data'], key = order)
        return data

class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()

    class Meta:
        model = Errand
        fields = ('id', 'slug')
