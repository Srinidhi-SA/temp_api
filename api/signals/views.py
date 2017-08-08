# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse

# import python defaults
import json

# import django defaults

# import rest_framework
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination

# import helper


# import models
from models import Signals
from api.datasets.models import Datasets

# import serializers
from serializers import SignalSerializer

# import views

# create views here

class CustomPagination(PageNumberPagination):
    def get_paginated_response(self, data):
        self.total_page_size = len(data)
        return Response({

            'items_in_this': self.page.paginator.count,
            'results': data
        })


class SignalView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Signals.objects.filter(
            created_by=self.request.user
        )
        return queryset

    def get_serializer_class(self):
        return SignalSerializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend, )
    filter_fields = ('bookmarked', 'deleted', 'type', 'name', 'status', 'analysis_done')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        data['dataset'] = Datasets.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = SignalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        '''
        Comparing with the previous implementation:-
            This update method can cover set_column_data, set_measure, set_dimension
        :param request:
        :param args:
        :param kwargs: {'slug': 'signal-123-asdwqeasd'}
        :return:
        '''
        import pdb;pdb.set_trace()
        data = request.data
        serializer = self.get_serializer_class()
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    @detail_route(methods=['post'])
    def run_master(self, request, slug=None):
        pass

    @detail_route(methods=['get'])
    def get_config(self, request, slug=None):
        dataset = self.get_object()
        return Response(dataset.get_config())

    @detail_route(methods=['post'])
    def set_config(self, request, slug=None):
        dataset = self.get_object()
        data = request.data
        if 'config' in data:
            dataset.config = json.dumps(data['config'])
            dataset.save()
            return Response(dataset.config)
        return Response(dataset.create_configuration())




def get_datasource_config_list(request):
    return JsonResponse(settings.DATA_SOURCES_CONFIG)