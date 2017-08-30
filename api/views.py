# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import random

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from api.pagination import CustomPagination
from api.exceptions import creation_failed_exception, update_failed_exception
from api.utils import \
    convert_to_string, \
    InsightSerializer, \
    TrainerSerlializer, \
    ScoreSerlializer, \
    InsightListSerializers, \
    TrainerListSerializer, \
    ScoreListSerializer, \
    RoboSerializer
from models import Insight, Dataset, Job, Trainer, Score, Robo


class SignalView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Insight.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
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
            signal_object = serializer.save()
            signal_object.create()
            return Response(serializer.data)

        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):

        if 'page' in request.query_params:
            if request.query_params.get('page') == 'all':
                query_set = self.get_queryset()

                if 'name' in request.query_params:
                    name = request.query_params.get('name')
                    query_set = query_set.filter(name__contains=name)

                serializer = InsightListSerializers(query_set, many=True)
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

        serializer = InsightListSerializers(page, many=True)
        return page_class.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):

        try:
            instance = Insight.objects.get(slug=kwargs.get('slug'))
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = InsightSerializer(instance=instance)
        return Response(serializer.data)


class TrainerView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Trainer.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
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
            trainer_object = serializer.save()
            trainer_object.create()
            return Response(serializer.data)

        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):
        app_id = int(kwargs.get('app_id', 1))
        if 'page' in request.query_params:
            if request.query_params.get('page') == 'all':
                query_set = self.get_queryset()

                if 'name' in request.query_params:
                    name = request.query_params.get('name')
                    query_set = query_set.filter(name__contains=name)

                serializer = TrainerListSerializer(query_set, many=True)
                return Response({
                    "data": serializer.data
                })
        query_set = self.get_queryset()

        if 'name' in request.query_params:
            name = request.query_params.get('name')
            query_set = query_set.filter(name__contains=name)

        query_set = query_set.filter(app_id=app_id)
        page_class = self.pagination_class()

        page = page_class.paginate_queryset(
            queryset=query_set,
            request=request
        )

        serializer = TrainerListSerializer(page, many=True)
        return page_class.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):

        try:
            instance = Trainer.objects.get(slug=kwargs.get('slug'))
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = TrainerSerlializer(instance=instance)
        return Response(serializer.data)


class ScoreView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Score.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
        )
        return queryset

    def get_serializer_class(self):
        return ScoreSerlializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        data['trainer'] = Trainer.objects.filter(slug=data['trainer'])
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = ScoreSerlializer(data=data)
        if serializer.is_valid():
            score_object = serializer.save()
            score_object.create()
            return Response(serializer.data)

        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):

        if 'page' in request.query_params:
            if request.query_params.get('page') == 'all':
                query_set = self.get_queryset()

                if 'name' in request.query_params:
                    name = request.query_params.get('name')
                    query_set = query_set.filter(name__contains=name)

                serializer = ScoreListSerializer(query_set, many=True)
                return Response({
                    "data": serializer.data
                })

        query_set = self.get_queryset()

        if 'name' in request.query_params:
            name = request.query_params.get('name')
            query_set = query_set.filter(name__contains=name)

        page_class = self.pagination_class()

        page = page_class.paginate_queryset(
            queryset=query_set,
            request=request
        )

        serializer = ScoreListSerializer(page, many=True)
        return page_class.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):

        try:
            instance = Score.objects.get(slug=kwargs.get('slug'))
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = ScoreSerlializer(instance=instance)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def download(self, request, slug=None):
        instance = self.get_object()
        from django.conf import settings
        hadoop_base_file_path = settings.mAdvisorScores

        download_path = hadoop_base_file_path + instance.slug + '/data.csv'
        save_file_to = instance.get_local_file_path()

        from api.lib.fab_helper import get_file

        get_file(
            from_file=download_path,
            to_dir=save_file_to
        )

        filepath = save_file_to

        from django.http import HttpResponse
        import os

        if download_path is not None:
            with open(filepath, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/csv')
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(filepath)
                return response
        else:
            return JsonResponse({'result': 'failed to download'})


def get_datasource_config_list(request):
    return JsonResponse(settings.DATA_SOURCES_CONFIG)


def get_config(request, slug=None):
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result': 'Failed'})
    return JsonResponse(json.loads(job.config))


from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def set_result(request, slug=None):
    print "Welcome to API."
    print "So you wanna write."
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result': 'Failed'})
    results = request.body
    if isinstance(results, str) or isinstance(results, unicode):
        job.results = results
    elif isinstance(results, dict):
        results = json.dumps(results)
        job.results = results

    print "data----------->"
    print request.body
    job.save()
    print "Data has been saved to job table."
    results = write_into_databases(
        job_type=job.job_type,
        object_slug=job.object_id,
        results=json.loads(results)
    )
    return JsonResponse({'result': "success"})
    

@csrf_exempt
def use_set_result(request, slug=None):
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result': 'Failed'})

    results = job.results

    results = write_into_databases(
        job_type=job.job_type,
        object_slug=job.object_id,
        results=json.loads(results)
    )

    return JsonResponse({'result': results})


def write_into_databases(job_type, object_slug, results):
    from api import helper
    import json
    if job_type == "metadata":
        dataset_object = Dataset.objects.get(slug=object_slug)
        columnData = results['columnData']
        for data in columnData:
            data["chartData"] = helper.find_chart_data_and_replace_with_chart_data(data["chartData"])
        results['columnData'] = columnData
        results['possibleAnalysis'] = settings.ANALYSIS_FOR_TARGET_VARIABLE
        da = []
        for d in results.get('sampleData'):
            da.append(map(str, results.get('sampleData')[3]))
        results['sampleData'] = da
        dataset_object.meta_data = json.dumps(results)
        dataset_object.analysis_done = True
        dataset_object.save()
        return results
    elif job_type == "master":
        insight_object = Insight.objects.get(slug=object_slug)
        results = add_slugs(results)
        insight_object.data = json.dumps(results)
        insight_object.analysis_done = True
        insight_object.save()
        return results
    elif job_type == "model":
        trainer_object = Trainer.objects.get(slug=object_slug)
        results['model_summary'] = add_slugs(results['model_summary'])
        trainer_object.data = json.dumps(results)
        trainer_object.analysis_done = True
        trainer_object.save()
        return results
    elif job_type == 'score':
        score_object = Score.objects.get(slug=object_slug)
        results = add_slugs(results)
        score_object.data = json.dumps(results)
        score_object.analysis_done = True
        score_object.save()
        return results
    print "written to the database."


@csrf_exempt
def random_test_api(request):
    import json
    print "Welcome to Random Test API."
    data = json.loads(request.body)
    data = add_slugs(data)

    return JsonResponse({"data": data})


def add_slugs(results):
    from api import helper
    listOfNodes = results.get('listOfNodes', [])
    listOfCards = results.get('listOfCards', [])

    name = results['name']
    results['slug'] = helper.get_slug(name)

    if len(listOfCards) > 0:
        for loC in listOfCards:
            add_slugs(loC)
            if loC['cardType'] == 'normal':
                convert_chart_data_to_beautiful_things(loC['cardData'])

    if len(listOfNodes) > 0:
        for loN in listOfNodes:
            add_slugs(loN)

    return results


def convert_chart_data_to_beautiful_things(data):
    from api import helper
    for card in data:
        if card["dataType"] == "c3Chart":
            chart_raw_data = card["data"]
            # function
            try:
                card["data"] = helper.decode_and_convert_chart_raw_data(chart_raw_data)
            except Exception as e:
                print "Error in Cards"
                print e
                card["data"] = {}


def home(request):

    context = {"UI_VERSION":settings.UI_VERSION}
    return render(request, 'home.html', context)


class RoboView(viewsets.ModelViewSet):
    def get_queryset(self):
        query_set = Robo.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
        )
        return query_set

    def get_serializer_class(self):
        return RoboSerializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'name')
    pagination_class = CustomPagination

    dataset_name_mapping = {
        "customer_file": "customer_dataset",
        "historical_file": "historical_dataset",
        "market_file": "market_dataset"
    }

    def create(self, request, *args, **kwargs):

        data =request.data
        data = convert_to_string(data)
        files = request.FILES
        name = data.get('name', "robo" + "_"+ str(random.randint(1000000,10000000)))
        real_data = {
            'name': name,
            'created_by': request.user.id
        }

        for file in files:
            dataset = dict()
            input_file = files[file]
            dataset['input_file'] = input_file
            dataset['name'] = input_file.name
            dataset['created_by'] = request.user.id
            from api.datasets.serializers import DatasetSerializer
            serializer = DatasetSerializer(data=dataset)
            if serializer.is_valid():
                dataset_object = serializer.save()
                dataset_object.create()
                real_data[self.dataset_name_mapping[file]] = dataset_object.id
        serializer = RoboSerializer(data=real_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = Robo.objects.get(slug=kwargs.get('slug'))
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = RoboSerializer(instance=instance)
        return Response(serializer.data)