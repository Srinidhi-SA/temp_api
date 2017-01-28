from django.db import models
from rest_framework import serializers
from api.lib import hadoop, reader
import os
import ConfigParser
import csv
import itertools
from subprocess import call
from django.conf import settings

def robo_base_directory(instance):
    return "uploads/robos/{0}".format(instance.id)

def robo_input_file_directory_path(instance, filename):
    return robo_base_directory(instance) + "/{0}".format(filename)

class Robo(models.Model):
    customer_file = models.FileField(upload_to=robo_input_file_directory_path, null=True, blank=True)
    historical_file = models.FileField(upload_to=robo_input_file_directory_path, null=True, blank=True)
    market_file = models.FileField(upload_to=robo_input_file_directory_path, null=True, blank=True)
    name = models.CharField(max_length=100, null=True)

    def base_storage_dir(self):
        return "/robos/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    @classmethod
    def make(cls, customer_file, historical_file, market_file):
        obj = cls()
        obj.save()
        obj.customer_file = customer_file
        obj.historical_file = historical_file
        obj.market_file = market_file
        obj.save()
        obj.setup()
        obj.run_portfolio()
        return obj

    @property
    def customer_filename(self):
        if self.customer_file == None:
            return  ""
        return os.path.basename(self.customer_file.path)

    @property
    def historical_filename(self):
        if self.historical_file == None:
            return ""
        return os.path.basename(self.historical_file.path)

    @property
    def market_filename(self):
        if self.market_file == None:
            return ""
        return os.path.basename(self.market_file.path)

    def setup(self):
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())
        self.send_input_files_to_storage()

    def send_input_files_to_storage(self):
        for path in [self.customer_file.path, self.historical_file.path, self.market_file.path]:
            hadoop.hadoop_put(path, self.storage_input_dir() + "/")

    def get_input_file_storage_path(self, file):
        return "{0}/{1}".format(self.storage_input_dir(), os.path.basename(file.name))

    def get_preview(self):
        return {
            'customer_file': reader.get_preview_data(self.customer_file.path),
            'historical_file': reader.get_preview_data(self.historical_file.path),
            'market_file': reader.get_preview_data(self.market_file.path)
        }

    def run_portfolio(self):
        print("Running portofolio for the robo")
        call([
            "sh", "api/lib/run_portfolio.sh",
            settings.HDFS['host'],
            self.get_input_file_storage_path(self.customer_file),
            self.get_input_file_storage_path(self.historical_file),
            self.get_input_file_storage_path(self.market_file),
            self.storage_output_dir()
        ])
        # self.mark_dimension_as_done()

    def get_results(self):
        result_path = self.storage_output_dir() +  "/portfolio-result.json"
        narratives_path = self.storage_output_dir() +  "/portfolio-narratives.json"
        return {
            'result': hadoop.hadoop_read_output_file(result_path),
            'narratives': hadoop.hadoop_read_output_file(narratives_path)
        }

class RoboSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    customer_name = serializers.ReadOnlyField(source="customer_filename")
    historical_filename = serializers.ReadOnlyField()
    market_filename = serializers.ReadOnlyField()
