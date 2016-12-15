from django.db import models
from rest_framework import serializers
from api.lib import hadoop
import os
import ConfigParser

def errand_base_directory(instance):
    return "uploads/errands/{0}".format(instance.id)

def errand_input_file_directory_path(instance, filename):
    return errand_base_directory(instance) + "/{0}".format(filename)
    # return "uploads/errands/{0}/{1}".format(instance.id, filename)

class Errand(models.Model):
    slug = models.CharField(max_length=100)
    input_file = models.FileField(upload_to=errand_input_file_directory_path, null=True, blank=True)

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
        return "{0}{1}{2}".format(hadoop.hadoop_hdfs_url(self), self.storage_input_dir(), os.path.basename(self.input_file.name))

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

class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()

    class Meta:
        model = Errand
        fields = ('id', 'slug')
