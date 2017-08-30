# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import random

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from django.http import Http404

from api.exceptions import creation_failed_exception, update_failed_exception
from api.models import Dataset
from api.pagination import CustomPagination
from helper import convert_to_string
from serializers import DatasetSerializer, DataListSerializer

# Create your views here.


class DatasetView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Dataset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
        )
        return queryset

    def get_object_from_all(self):
        return Dataset.objects.get(slug=self.kwargs.get('slug'))

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
            data['name'] = data.get('name', data['input_file'].name)

        # question: why to use user.id when it can take, id, pk, object.
        # answer: I tried. Sighhh but it gave this error "Incorrect type. Expected pk value, received User."
        data['created_by'] = request.user.id
        serializer = DatasetSerializer(data=data)
        if serializer.is_valid():
            dataset_object = serializer.save()
            dataset_object.create()
            return Response(serializer.data)

        return creation_failed_exception(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        # instance = self.get_object()

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

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

    @list_route(methods=['get'])
    def all(self, request):
        query_set = self.get_queryset()
        serializer = DataListSerializer(query_set, many=True)
        return Response({
            "data": serializer.data
        })

    def list(self, request, *args, **kwargs):
        if 'page' in request.query_params:
            if request.query_params.get('page') == 'all':
                query_set = self.get_queryset()

                if 'name' in request.query_params:
                    name = request.query_params.get('name')
                    query_set = query_set.filter(name__contains=name)

                serializer = DataListSerializer(query_set, many=True)
                return Response({
                    "data": serializer.data
                })

        page_class = self.pagination_class()
        query_set = self.get_queryset()

        if 'name' in request.query_params:
            name = request.query_params.get('name')
            query_set = query_set.filter(name__contains=name)

        page = page_class.paginate_queryset(
            queryset=query_set,
            request=request
        )

        serializer = DataListSerializer(page, many=True)
        return page_class.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = DatasetSerializer(instance=instance)
        return Response(serializer.data)