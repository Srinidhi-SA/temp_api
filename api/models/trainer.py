from django.db import models
from rest_framework import serializers
from api.models.dataset import Dataset
from api.lib import hadoop

import ConfigParser

def trainer_base_directory(instance):
    return "uploads/trainer/{0}".format(instance.id)

def trainer_config_file_path(instance, filename):
    return trainer_base_directory(instance) + "/{0}".format(filename)


class Trainer(models.Model):

    name = models.CharField(max_length=300, null=True)
    input_file = models.FileField(upload_to=trainer_config_file_path, null=True, blank=True)
    dataset = models.ForeignKey(Dataset, null=False)
    userId = models.CharField(max_length=100, null=True)
    details = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    @classmethod
    def make(cls, details, userId):

        # create trainer object
        obj = cls(userId=userId)
        obj.dataset_id = details.get('dataset_id')
        obj.details = details.get('details')

        # save it to database
        obj.save()

        # if, setup storage folders

        # create configuration
        obj.create_configuration_file()

        return obj

    def config_file_name(self):
        return str(self.id) + "config.cfg"

    def get_hadoop_config_path(self):
        configpath = "/home/hadoop/configs/models" + self.config_file_name
        return configpath

    def get_local_config_path(self):
        return trainer_config_file_path(self, self.config_file_name())

    def create_configuration_file(self):
        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")

        config.set('FILE_SETTINGS', 'InputFile', hadoop.hadoop_get_full_url(self.dataset.get_input_file_storage_path()))
        config.set('COLUMN_SETTINGS', 'consider_columns_type', self.compare_type)

        with open(self.config_file_path, 'wb') as file:
            config.write(file)
        print "Take a look at: {}".format(self.config_file_path)
        hadoop.hadoop_put(self.get_local_config_path(), self.get_hadoop_config_path())

    def get_config_details(self):
        pass

    def set_measure(self):
        pass

    def set_dimension(self):
        pass

    def read_trainer_details(self):
        pass


class TrainerSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    dataset = serializers.ReadOnlyField()
    user_id = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()

    #
    # class Meta:
    #     model = Trainer
    #     field = ('id', 'name', 'created_at', 'user_id')
