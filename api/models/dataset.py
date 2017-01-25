from django.db import models
from rest_framework import serializers
from api.lib import hadoop
import os
import ConfigParser
import csv
import itertools
from subprocess import call

def dataset_base_directory(instance):
    return "uploads/datasets/{0}".format(instance.id)

def dataset_input_file_directory_path(instance, filename):
    return dataset_base_directory(instance) + "/{0}".format(filename)

class Dataset(models.Model):
    input_file = models.FileField(upload_to=dataset_input_file_directory_path, null=True, blank=True)
    name = models.CharField(max_length=100, null=True)

    def base_storage_dir(self):
        return "/datasets/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    @property
    def input_filename(self):
        return os.path.basename(self.input_file.name)

    @classmethod
    def make(cls, input_file):
        obj = cls()
        obj.save()
        obj.input_file = input_file
        obj.setup()
        obj.save()
        return obj

    def setup(self):
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())


class DatasetSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField(source="input_filename")
