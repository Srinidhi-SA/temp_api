# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# import python default
import random
import json
import csv

# import django defaults

# import rest_framework
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

# import helper
from helper import convert_to_string
from api.pagination import CustomPagination
from api.exceptions import creation_failed_exception, update_failed_exception

# import models
from api.models import Dataset

# import serializers
from serializers import DatasetSerializer
from api.user_helper import UserSerializer

# import views
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.


class DatasetView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Dataset.objects.filter(
            created_by=self.request.user
        )
        return queryset

    serializer_class = DatasetSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'db_type', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        data['input_file'] =  request.FILES.get('input_file')
        if data['input_file'] is None:
            data['name'] = data.get('name', data.get('db_type', "H") + "_"+ str(random.randint(1000000,10000000)))
        else:
            data['name'] = data['input_file'].name

        # question: why to use user.id when it can take, id, pk, object.
        # answer: I tried. Sighhh but it gave this error "Incorrect type. Expected pk value, received User."
        data['created_by'] = request.user.id
        serializer = DatasetSerializer(data=data)
        if serializer.is_valid():
            dataset_object = serializer.save()

            if dataset_object.input_file.name is not None:
                dataset_object.preview = dataset_object.set_preview_data()
                dataset_object.save()
            return Response(serializer.data)

        return creation_failed_exception(serializer.errors)


    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()

        # question: do we need update method in views/ as well as in serializers?
        # answer: Yes. LoL
        serializer = self.serializer_class(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return update_failed_exception(serializer.errors)

    @detail_route(methods=['put'])
    def set_meta(self, request, slug=None):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    @detail_route(methods=['get'])
    def get_meta(self, request, slug=None):
        user = request.user
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance)
        return Response({
            'meta_data': serializer.data.get('meta_data'),
        })

    @detail_route(methods=['get'])
    def get_config(self, request, slug=None):
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance)
        return Response(serializer.data.get('db_details'))





