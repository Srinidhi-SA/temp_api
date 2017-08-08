# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# import python default

# import django defaults

# import rest_framework
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

# import helper
from helper import convert_to_string
from api.pagination import CustomPagination

# import models
from models import Datasets

# import serializers
from serializers import DatasetSerializer

# import views
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.


class DatasetView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Datasets.objects.filter(
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
        data['input_file'] = request.FILES.get('input_file')

        # question: why to use user.id when it can take, id, pk, object.
        # answer: I tried. Sighhh but it gave this error "Incorrect type. Expected pk value, received User."
        data['created_by'] = request.user.id
        serializer = DatasetSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

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
        return Response(serializer.errors)

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
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance)
        return Response(serializer.data.get('meta_data'))

    @detail_route(methods=['get'])
    def get_config(self, request, slug=None):
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance)
        return Response(serializer.data.get('db_details'))



