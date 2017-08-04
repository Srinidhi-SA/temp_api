# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# import python defaults

# import django defaults

# import rest_framework
from rest_framework import serializers

# import helper

# import models
from models import Datasets
# import serializers

# import views

class DatasetSerializer(serializers.Serializer):

    class Meta:
        model=Datasets
        exclude=('input_file', 'id')