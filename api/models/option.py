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

class Option(models.Model):
    slug = models.CharField(max_length=100)
    data = models.CharField(max_length=100, default="")
    userId = models.CharField(max_length=100, null=True)

class OptionSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    data = serializers.CharField(max_length=100)
    userId = serializers.CharField(max_length=100)

    
    class Meta:
        model = Option
        fields = ('id', 'slug', 'value', 'userId')
