# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from api.pagination import CustomPagination
from api.utils import convert_to_string, InsightSerializer, TrainerSerlializer, ScoreSerlializer
from models import Insight, Dataset, Job, Trainer, Score


class SignalView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Insight.objects.filter(
            created_by=self.request.user,
            deleted=False
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
            created_by=self.request.user,
            deleted=False
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

# TODO: add score download,
# TODO: get place from scripts, check if you have file already, if yes return file else download file from theat place
# TODO: and keep in some place and pass it to
class ScoreView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Score.objects.filter(
            created_by=self.request.user,
            deleted=False
        )
        return queryset

    def get_serializer_class(self):
        return ScoreSerlializer

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        # import pdb;pdb.set_trace()
        data = request.data
        data = convert_to_string(data)
        data['trainer'] = Trainer.objects.filter(slug=data['trainer'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = ScoreSerlializer(data=data)
        if serializer.is_valid():
            score_object = serializer.save()
            score_object.create()
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
    if isinstance(results, str or unicode):
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
        results = add_slugs(results)
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
    # import pdb;pdb.set_trace()
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
    context = {}
    return render(request, 'home.html', context)
