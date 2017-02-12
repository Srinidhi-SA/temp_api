from django.db import models
from rest_framework import serializers
from api.lib import hadoop
import os
import ConfigParser
import csv
import itertools
from subprocess import call
from django.conf import settings

def dataset_base_directory(instance):
    return "uploads/datasets/{0}".format(instance.id)

def dataset_input_file_directory_path(instance, filename):
    print("yes, I am in here")
    return dataset_base_directory(instance) + "/{0}".format(filename)

class Dataset(models.Model):
    input_file = models.FileField(upload_to=dataset_input_file_directory_path, null=True, blank=True)
    name = models.CharField(max_length=100, null=True)
    filename_meta = "meta.json"

    def base_storage_dir(self):
        return "/datasets/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    @property
    def input_filename(self):
        return os.path.basename(self.input_file.name)

    @property
    def output_file_meta_path(self):
        return self.storage_output_dir() + '/' + self.filename_meta

    @classmethod
    def make(cls, input_file):
        print(input_file)
        obj = cls()
        obj.save()
        obj.input_file = input_file
        obj.save()
        obj.setup()
        obj.run_meta()
        return obj

    def setup(self):
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())
        self.send_input_file_to_storage()

    @property
    def safe_name(self):
        return self.name if self.name else self.input_filename

    def send_input_file_to_storage(self):
        hadoop.hadoop_put(self.input_file.path, self.storage_input_dir() + "/")

    def get_input_file_storage_path(self):
        return "{0}/{1}".format(self.storage_input_dir(), self.input_filename)

    def run_meta(self):
        print("Running meta script")
        call(["sh", "api/lib/run_meta.sh", settings.HDFS['host'], self.get_input_file_storage_path(), self.output_file_meta_path])

    def get_meta(self):
        path = self.storage_output_dir() + "/" + self.filename_meta
        result = hadoop.hadoop_read_output_file(path)
        print(result)
        result_columns = result['columns']

        data = {}
        columns = []
        data['count'] = {'rows': result['total_rows'], 'cols': result['total_columns'], 'dimensions': len(result_columns['dimension_columns'])}

        for key, value in result_columns['dimension_columns'].iteritems() :
            columns.append({'name': key, 'data_type': 'dimension', 'data_format': '', 'no_of_nulls': value['num_nulls']})

        for key, value in result_columns['measure_columns'].iteritems() :
            columns.append({'name': key, 'data_type': 'measure', 'data_format': '', 'no_of_nulls': value['num_nulls']})

        for key, value in result_columns['time_dimension_columns'].iteritems() :
            columns.append({'name': key, 'data_type': 'time', 'data_format': '', 'no_of_nulls': value['num_nulls']})

        data['columns'] = columns
        data['measures'] = result_columns['measure_columns'].keys()
        data['dimensions'] = result_columns['dimension_columns'].keys()

        return data


    def get_preview_data(self):
        items = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=',')
            for row in itertools.islice(rows, 20):
                items.append(row)
        return items


class DatasetSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField(source="safe_name")
