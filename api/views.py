# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.conf import settings
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from api.pagination import CustomPagination
from api.utils import convert_to_string, InsightSerializer, TrainerSerlializer
from models import Insight, Dataset, Job, Trainer


class SignalView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Insight.objects.filter(
            created_by=self.request.user
        )
        return queryset

    def get_serializer_class(self):
        return InsightSerializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'type', 'name', 'status', 'analysis_done')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = InsightSerializer(data=data)
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
        data = request.data
        data = convert_to_string(data)
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
        return Response(dataset.generate_config())


class TrainerView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Trainer.objects.filter(
            created_by=self.request.user
        )
        return queryset

    def get_serializer_class(self):
        return TrainerSerlializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'name', "app_id")
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = TrainerSerlializer(data=data)
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
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


def get_datasource_config_list(request):
    return JsonResponse(settings.DATA_SOURCES_CONFIG)


def get_config(request, slug=None):
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result':'Failed'})
    return JsonResponse(json.loads(job.config))


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def set_result(request, slug=None):
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result':'Failed'})
    job.results = request.body
    job.save()
    return JsonResponse({'result':'Success'})
