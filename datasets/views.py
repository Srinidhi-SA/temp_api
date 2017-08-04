# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# import python default

# import django defaults

# import rest_framework
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route, list_route

# import helper

# import models
from models import Datasets

# import serializers
from serializers import DatasetSerializer

# import views

# Create your views here.


class DatasetView(viewsets.ModelViewSet):

    queryset = Datasets.objects.all()
    serializer_class = DatasetSerializer

    def get_object(self):
        pass

    def create(self, request, *args, **kwargs):
        data = request.data
        data['input_file'] = request.FILES.get('input_file')
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = DatasetSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):
        queryset = Datasets.objects.filter(
            created_by=request.user,
            deleted=False
        )
        return Response(DatasetSerializer(queryset, many=True).data)

    @detail_route(methods=['post'])
    def set_meta(self, request, slug=None):
        pass

    @detail_route(methods=['get'])
    def get_meta(self, request, slug=None):
        pass

    @detail_route(methods=['get'])
    def get_data(self, request, slug=None):
        pass

    @detail_route(methods=['get'])
    def get_config(self, request, slug=None):
        pass