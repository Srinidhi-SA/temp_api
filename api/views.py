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
    RoboSerializer, \
    RoboListSerializer
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

    def get_object_from_all(self):
        return Insight.objects.get(slug=self.kwargs.get('slug'))

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

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

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
            instance = self.get_object_from_all()
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


    def get_object_from_all(self):
        return Trainer.objects.get(slug=self.kwargs.get('slug'))

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
        # instance = self.get_object()
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):
        app_id = int(request.query_params.get('app_id', 1))
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
            instance = self.get_object_from_all()
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

    def get_object_from_all(self):
        return Score.objects.get(slug=self.kwargs.get('slug'))

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
        # instance = self.get_object()

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

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
            instance = self.get_object_from_all()
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
            da.append(map(str, d))
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
    elif job_type == 'robo':
        robo_object = Robo.objects.get(slug=object_slug)
        results = add_slugs(results)
        robo_object.data = json.dumps(results)
        robo_object.robo_analysis_done = True
        robo_object.save()
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

    def get_object_from_all(self):
        return Robo.objects.get(slug=self.kwargs.get('slug'))

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'name')
    pagination_class = CustomPagination

    dataset_name_mapping = {
        "customer_file": "customer_dataset",
        "historical_file": "historical_dataset",
        "market_file": "market_dataset"
    }

    # TODO: config missing
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
            robo_object = serializer.save()
            robo_object.create()
            robo_object.data = json.dumps(dummy_robo_data)
            robo_object.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)
        # instance = self.get_object()
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = RoboSerializer(instance=instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):

        if 'page' in request.query_params:
            if request.query_params.get('page') == 'all':
                query_set = self.get_queryset()

                if 'name' in request.query_params:
                    name = request.query_params.get('name')
                    query_set = query_set.filter(name__contains=name)

                serializer = RoboListSerializer(query_set, many=True)
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

        serializer = RoboListSerializer(page, many=True)
        return page_class.get_paginated_response(serializer.data)

dummy_robo_data = {
"name":"DSDS",
"slug":"FFFFFF",
"listOfNodes":[],
"listOfCards":[
  {
    "cardType":"normal",
    "name": "Dora Howard",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "data":"<b>mAdvisor</b> has analysed your investment portfolio over the <b>last 6 months</b>. Please find the insights from our analysis in the next section.",
        "dataType":"html"
      },
      {
        "dataType":"html",
        "data":"<div className='row xs-mt-50'><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>1.39M</span><br /><small>Total Net Investments</small></h2></div><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>1.48M</span><br /><small>Current Market Value</small></h2></div><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>13.81%</span><br /><small>Compounded Annual Growth</small></h2></div></div>"
      }
    ]
  },
  {
    "cardType":"normal",
    "name": "Dwayne Willis",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>Portfolio snapshot</h4>"
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":[
            {"name":"Cash","value":7},
            {"name":"Debt","value":28},
            {"name":"Equity","value":65}
          ],
          "axes":{"x":"name", "y":"value"},
          "label_text":{},
          "legend":{},
          "chart_type":"pie",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":False
        }
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":[
            {"name":"Liquid","value":97235},
            {"name":"Large Cap","value":406779},
            {"name":"Ultra Short Term","value":414203},
            {"name":"Multi Cap","value":565693}
          ],
          "axes":{"x":"name", "y":"value"},
          "label_text":{},
          "legend":{},
          "chart_type":"bar",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":False
        }
      },
      {
        "dataType":"html",
        "data":"The portfolio has a <b>very high exposure to equity</b>, as it has almost <b>two-thirds</b> 66.0% of the total investment.And it is diversified across <b>Large Cap</b> and <b>Multi Cap</b>, with INR 406779 and INR 565693 respectively."
      },
      {
        "dataType":"html",
        "data":"The portfolio has very <b>little</b> exposure to <b>debt</b> instruments.The debt portion of the portfolio accounts for about <b>28.0%</b> of the total investment.And, the entire debt portfolio is solely focused on <b>Ultra Short Term</b>"
      }
    ]
  },
  {
    "cardType":"normal",
    "name": "Henrietta Robbins",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>How is your portfolio performing ?</h4>"
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":[
             {"date": "2016-06-01", "scaled_total": 100, "sensex": 100},
             {"date": "2016-06-02", "scaled_total": 100.75, "sensex": 100.81},
             {"date": "2016-06-03", "scaled_total": 101.63, "sensex": 101.79},
             {"date": "2016-06-06", "scaled_total": 102.14, "sensex": 102.34},
             {"date": "2016-06-07", "scaled_total": 102.6, "sensex": 102.84},
             {"date": "2016-06-08", "scaled_total": 102.22, "sensex": 102.42},
             {"date": "2016-06-09", "scaled_total": 102.34, "sensex": 102.55},
             {"date": "2016-06-13", "scaled_total": 102.08, "sensex": 102.27},
             {"date": "2016-06-14", "scaled_total": 103.8, "sensex": 104.16},
             {"date": "2016-06-15", "scaled_total": 104.44, "sensex": 104.84},
             {"date": "2016-06-16", "scaled_total": 104.44, "sensex": 104.87},
             {"date": "2016-06-17", "scaled_total": 104.89, "sensex": 105.34},
             {"date": "2016-06-20", "scaled_total": 104.52, "sensex": 104.95},
             {"date": "2016-06-21", "scaled_total": 104.23, "sensex": 104.61},
             {"date": "2016-06-22", "scaled_total": 104.39, "sensex": 104.76},
             {"date": "2016-06-23", "scaled_total": 104.86, "sensex": 105.25},
             {"date": "2016-06-24", "scaled_total": 104.16, "sensex": 104.47},
             {"date": "2016-06-27", "scaled_total": 104.49, "sensex": 104.82},
             {"date": "2016-06-28", "scaled_total": 105.5, "sensex": 105.92},
             {"date": "2016-06-29", "scaled_total": 105.08, "sensex": 105.47},
             {"date": "2016-06-30", "scaled_total": 105.26, "sensex": 105.65},
             {"date": "2016-07-01", "scaled_total": 105.9, "sensex": 106.35},
             {"date": "2016-07-04", "scaled_total": 105.37, "sensex": 105.76},
             {"date": "2016-07-05", "scaled_total": 105.22, "sensex": 105.57},
             {"date": "2016-07-07", "scaled_total": 105.14, "sensex": 105.49},
             {"date": "2016-07-08", "scaled_total": 104.16, "sensex": 104.42},
             {"date": "2016-07-11", "scaled_total": 104.23, "sensex": 104.49},
             {"date": "2016-07-12", "scaled_total": 105.49, "sensex": 105.86},
             {"date": "2016-07-13", "scaled_total": 105.85, "sensex": 106.25},
             {"date": "2016-07-14", "scaled_total": 105.54, "sensex": 105.88},
             {"date": "2016-07-15", "scaled_total": 104.48, "sensex": 104.71},
             {"date": "2016-07-18", "scaled_total": 104.77, "sensex": 105.03},
             {"date": "2016-07-19", "scaled_total": 105.79, "sensex": 106.14},
             {"date": "2016-07-20", "scaled_total": 105.48, "sensex": 105.81},
             {"date": "2016-07-21", "scaled_total": 105.27, "sensex": 105.58},
             {"date": "2016-07-22", "scaled_total": 105.68, "sensex": 106.03},
             {"date": "2016-07-25", "scaled_total": 105.51, "sensex": 105.85},
             {"date": "2016-07-26", "scaled_total": 105.2, "sensex": 105.51},
             {"date": "2016-07-27", "scaled_total": 105.24, "sensex": 105.53},
             {"date": "2016-07-28", "scaled_total": 105.49, "sensex": 105.79},
             {"date": "2016-07-29", "scaled_total": 104.72, "sensex": 104.94},
             {"date": "2016-08-01", "scaled_total": 104.53, "sensex": 104.74},
             {"date": "2016-08-03", "scaled_total": 104.94, "sensex": 105.2},
             {"date": "2016-08-04", "scaled_total": 106.47, "sensex": 106.86},
             {"date": "2016-08-05", "scaled_total": 106.84, "sensex": 107.27},
             {"date": "2016-08-08", "scaled_total": 106.76, "sensex": 107.16},
             {"date": "2016-08-09", "scaled_total": 107.14, "sensex": 107.57},
             {"date": "2016-08-10", "scaled_total": 108.67, "sensex": 109.25},
             {"date": "2016-08-11", "scaled_total": 108.48, "sensex": 109.05},
             {"date": "2016-08-12", "scaled_total": 108.9, "sensex": 109.5},
             {"date": "2016-08-16", "scaled_total": 108.04, "sensex": 108.57},
             {"date": "2016-08-17", "scaled_total": 106.51, "sensex": 106.9},
             {"date": "2016-08-18", "scaled_total": 106.59, "sensex": 106.97},
             {"date": "2016-08-19", "scaled_total": 106.74, "sensex": 107.12},
             {"date": "2016-08-22", "scaled_total": 107.4, "sensex": 107.82},
             {"date": "2016-08-23", "scaled_total": 107.53, "sensex": 107.95},
             {"date": "2016-08-24", "scaled_total": 107.17, "sensex": 107.53},
             {"date": "2016-08-25", "scaled_total": 107.13, "sensex": 107.48},
             {"date": "2016-08-30", "scaled_total": 108.05, "sensex": 108.48},
             {"date": "2016-08-31", "scaled_total": 107.69, "sensex": 108.08},
             {"date": "2016-09-01", "scaled_total": 106.39, "sensex": 106.67},
             {"date": "2016-09-02", "scaled_total": 106.14, "sensex": 106.41},
             {"date": "2016-09-06", "scaled_total": 106.36, "sensex": 106.67},
             {"date": "2016-09-07", "scaled_total": 104.77, "sensex": 104.91},
             {"date": "2016-09-08", "scaled_total": 104.89, "sensex": 105.06},
             {"date": "2016-09-09", "scaled_total": 106.21, "sensex": 106.48},
             {"date": "2016-09-12", "scaled_total": 106.52, "sensex": 106.82},
             {"date": "2016-09-16", "scaled_total": 106.13, "sensex": 106.4},
             {"date": "2016-09-19", "scaled_total": 105.73, "sensex": 105.96},
             {"date": "2016-09-20", "scaled_total": 105.58, "sensex": 105.79},
             {"date": "2016-09-21", "scaled_total": 105.63, "sensex": 105.87},
             {"date": "2016-09-22", "scaled_total": 104.15, "sensex": 104.22},
             {"date": "2016-09-23", "scaled_total": 104.24, "sensex": 104.33},
             {"date": "2016-09-26", "scaled_total": 103.77, "sensex": 103.79},
             {"date": "2016-09-27", "scaled_total": 105.57, "sensex": 105.75},
             {"date": "2016-09-28", "scaled_total": 105.34, "sensex": 105.5},
             {"date": "2016-09-30", "scaled_total": 105.83, "sensex": 106.05},
             {"date": "2016-10-03", "scaled_total": 105.65, "sensex": 105.85},
             {"date": "2016-10-04", "scaled_total": 105.99, "sensex": 106.24},
             {"date": "2016-10-05", "scaled_total": 105.69, "sensex": 105.91},
             {"date": "2016-10-06", "scaled_total": 104.81, "sensex": 104.95},
             {"date": "2016-10-07", "scaled_total": 105.1, "sensex": 105.25},
             {"date": "2016-10-10", "scaled_total": 105.19, "sensex": 105.34},
             {"date": "2016-10-13", "scaled_total": 104.98, "sensex": 105.1},
             {"date": "2016-10-14", "scaled_total": 103.78, "sensex": 103.78},
             {"date": "2016-10-19", "scaled_total": 103.45, "sensex": 103.41},
             {"date": "2016-10-20", "scaled_total": 102.91, "sensex": 102.83},
             {"date": "2016-10-21", "scaled_total": 103.54, "sensex": 103.52},
             {"date": "2016-10-24", "scaled_total": 103.99, "sensex": 104.02},
             {"date": "2016-10-25", "scaled_total": 102.81, "sensex": 102.74},
             {"date": "2016-10-26", "scaled_total": 103.72, "sensex": 103.74},
             {"date": "2016-10-27", "scaled_total": 101.29, "sensex": 101.11},
             {"date": "2016-10-28", "scaled_total": 99.53, "sensex": 99.17},
             {"date": "2016-11-01", "scaled_total": 99.52, "sensex": 99.15},
             {"date": "2016-11-02", "scaled_total": 99.27, "sensex": 98.88},
             {"date": "2016-11-03", "scaled_total": 99.03, "sensex": 98.59},
             {"date": "2016-11-04", "scaled_total": 97.68, "sensex": 97.14},
             {"date": "2016-11-07", "scaled_total": 98.34, "sensex": 97.87},
             {"date": "2016-11-08", "scaled_total": 98.63, "sensex": 98.22},
             {"date": "2016-11-09", "scaled_total": 97.94, "sensex": 97.5},
             {"date": "2016-11-10", "scaled_total": 99.49, "sensex": 99.21},
             {"date": "2016-11-11", "scaled_total": 99.6, "sensex": 99.34},
             {"date": "2016-11-17", "scaled_total": 99.76, "sensex": 99.51},
             {"date": "2016-11-18", "scaled_total": 100.64, "sensex": 100.48},
             {"date": "2016-11-23", "scaled_total": 100.35, "sensex": 100.13},
             {"date": "2016-11-24", "scaled_total": 99.22, "sensex": 98.89},
             {"date": "2016-11-25", "scaled_total": 99.65, "sensex": 99.34},
             {"date": "2016-11-28", "scaled_total": 99.81, "sensex": 99.5},
             {"date": "2016-11-29", "scaled_total": 99.25, "sensex": 98.92}
            ],
          "axes":{"x":"date", "y":"scaled_total"},
          "label_text":{},
          "legend":{},
          "chart_type":"line",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":True
        }
      },
      {
        "dataType":"html",
        "data":"The portfolio, with the <b>total investment</b> of INR <b>1388090</b>, is now worth INR <b>1483910</b> This indicates a <b>moderate growth</b> of <b>1.07%</b> over the last 6 months. "
      },
      {
        "dataType":"html",
        "data":"The portfolio <b>shrunk significantly</b> between <b>Sep and Nov</b>, and remained <b>relatively flat</b> since then. It has <b>outperformed</b> the benchmark index sensex, with most of the gain made during Jun and Aug. "
      }
    ]
  },
  {
    "cardType":"normal",
    "name": "Desiree Smith",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>What is driving your protfolio growth ?</h4>"
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":[
             {"Birla SL - Frontline Equity Fund Reg (G)": 100,
              "Franklin - India Bluechip Fund (G)": 100,
              "Franklin - India High Growth Companies Fund (G)": 100,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 100,
              "date": "2016-06-01"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100.12,
              "Franklin - India Bluechip Fund (G)": 99.1,
              "Franklin - India High Growth Companies Fund (G)": 100.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.02,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 100.81,
              "date": "2016-06-02"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.59,
              "Franklin - India Bluechip Fund (G)": 99.02,
              "Franklin - India High Growth Companies Fund (G)": 100.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.04,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 101.79,
              "date": "2016-06-03"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 98.67,
              "Franklin - India Bluechip Fund (G)": 100.11,
              "Franklin - India High Growth Companies Fund (G)": 100.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.06,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 102.34,
              "date": "2016-06-06"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 98.78,
              "Franklin - India Bluechip Fund (G)": 99.34,
              "Franklin - India High Growth Companies Fund (G)": 101.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.08,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 102.84,
              "date": "2016-06-07"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.88,
              "Franklin - India Bluechip Fund (G)": 99.64,
              "Franklin - India High Growth Companies Fund (G)": 102.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.14,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 102.42,
              "date": "2016-06-08"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.13,
              "Franklin - India Bluechip Fund (G)": 100.38,
              "Franklin - India High Growth Companies Fund (G)": 101.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.16,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 102.55,
              "date": "2016-06-09"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.36,
              "Franklin - India Bluechip Fund (G)": 100.33,
              "Franklin - India High Growth Companies Fund (G)": 99.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.18,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 102.27,
              "date": "2016-06-13"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100,
              "Franklin - India Bluechip Fund (G)": 100.36,
              "Franklin - India High Growth Companies Fund (G)": 100,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.2,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 104.16,
              "date": "2016-06-14"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.83,
              "Franklin - India Bluechip Fund (G)": 101.23,
              "Franklin - India High Growth Companies Fund (G)": 101.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.22,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 104.84,
              "date": "2016-06-15"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.71,
              "Franklin - India Bluechip Fund (G)": 99.53,
              "Franklin - India High Growth Companies Fund (G)": 100.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100,
              "IDFC - Cash Fund Reg (G)": 100.28,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 104.87,
              "date": "2016-06-16"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100.46,
              "Franklin - India Bluechip Fund (G)": 99.48,
              "Franklin - India High Growth Companies Fund (G)": 101.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.3,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 105.34,
              "date": "2016-06-17"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 98.43,
              "Franklin - India Bluechip Fund (G)": 99.56,
              "Franklin - India High Growth Companies Fund (G)": 101.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.32,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 104.95,
              "date": "2016-06-20"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 98.72,
              "Franklin - India Bluechip Fund (G)": 100.49,
              "Franklin - India High Growth Companies Fund (G)": 101.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.35,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 104.61,
              "date": "2016-06-21"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 99.07,
              "Franklin - India Bluechip Fund (G)": 101.78,
              "Franklin - India High Growth Companies Fund (G)": 101.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.37,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 104.76,
              "date": "2016-06-22"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100.12,
              "Franklin - India Bluechip Fund (G)": 102.46,
              "Franklin - India High Growth Companies Fund (G)": 102.41,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.43,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 105.25,
              "date": "2016-06-23"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.33,
              "Franklin - India Bluechip Fund (G)": 102.98,
              "Franklin - India High Growth Companies Fund (G)": 100.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.45,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 104.47,
              "date": "2016-06-24"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.15,
              "Franklin - India Bluechip Fund (G)": 102.52,
              "Franklin - India High Growth Companies Fund (G)": 101.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.49,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 104.82,
              "date": "2016-06-27"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.73,
              "Franklin - India Bluechip Fund (G)": 102.46,
              "Franklin - India High Growth Companies Fund (G)": 101.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.51,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 105.92,
              "date": "2016-06-28"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.26,
              "Franklin - India Bluechip Fund (G)": 102.38,
              "Franklin - India High Growth Companies Fund (G)": 102.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.57,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 105.47,
              "date": "2016-06-29"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.09,
              "Franklin - India Bluechip Fund (G)": 104.05,
              "Franklin - India High Growth Companies Fund (G)": 103.45,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.59,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 105.65,
              "date": "2016-06-30"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.03,
              "Franklin - India Bluechip Fund (G)": 104.6,
              "Franklin - India High Growth Companies Fund (G)": 104.14,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.48,
              "IDFC - Cash Fund Reg (G)": 100.61,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 106.35,
              "date": "2016-07-01"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 103.54,
              "Franklin - India Bluechip Fund (G)": 104.4,
              "Franklin - India High Growth Companies Fund (G)": 105.17,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.63,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 105.76,
              "date": "2016-07-04"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.12,
              "Franklin - India Bluechip Fund (G)": 105.01,
              "Franklin - India High Growth Companies Fund (G)": 104.83,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.65,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 105.57,
              "date": "2016-07-05"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 103.89,
              "Franklin - India Bluechip Fund (G)": 104.98,
              "Franklin - India High Growth Companies Fund (G)": 104.48,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.71,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 105.49,
              "date": "2016-07-07"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.41,
              "Franklin - India Bluechip Fund (G)": 104.51,
              "Franklin - India High Growth Companies Fund (G)": 103.79,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.73,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 104.42,
              "date": "2016-07-08"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.35,
              "Franklin - India Bluechip Fund (G)": 104.68,
              "Franklin - India High Growth Companies Fund (G)": 105.52,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.75,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 104.49,
              "date": "2016-07-11"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104,
              "Franklin - India Bluechip Fund (G)": 105.23,
              "Franklin - India High Growth Companies Fund (G)": 106.55,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.77,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 105.86,
              "date": "2016-07-12"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.18,
              "Franklin - India Bluechip Fund (G)": 104.98,
              "Franklin - India High Growth Companies Fund (G)": 106.21,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.79,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 106.25,
              "date": "2016-07-13"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 105.05,
              "Franklin - India Bluechip Fund (G)": 105.14,
              "Franklin - India High Growth Companies Fund (G)": 107.24,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.85,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 105.88,
              "date": "2016-07-14"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.47,
              "Franklin - India Bluechip Fund (G)": 106.13,
              "Franklin - India High Growth Companies Fund (G)": 107.59,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.87,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 104.71,
              "date": "2016-07-15"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 104.99,
              "Franklin - India Bluechip Fund (G)": 105.66,
              "Franklin - India High Growth Companies Fund (G)": 106.9,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.89,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 105.03,
              "date": "2016-07-18"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.21,
              "Franklin - India Bluechip Fund (G)": 105.69,
              "Franklin - India High Growth Companies Fund (G)": 107.24,
              "Franklin - India Ultra Short Bond Super Ins (G)": 100.97,
              "IDFC - Cash Fund Reg (G)": 100.9,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 106.14,
              "date": "2016-07-19"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 105.86,
              "Franklin - India Bluechip Fund (G)": 105.94,
              "Franklin - India High Growth Companies Fund (G)": 107.24,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 100.93,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 105.81,
              "date": "2016-07-20"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.27,
              "Franklin - India Bluechip Fund (G)": 105.53,
              "Franklin - India High Growth Companies Fund (G)": 106.55,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 100.99,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 105.58,
              "date": "2016-07-21"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.91,
              "Franklin - India Bluechip Fund (G)": 105.34,
              "Franklin - India High Growth Companies Fund (G)": 106.9,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.02,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 106.03,
              "date": "2016-07-22"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.02,
              "Franklin - India Bluechip Fund (G)": 104.65,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.04,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 105.85,
              "date": "2016-07-25"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.25,
              "Franklin - India Bluechip Fund (G)": 104.9,
              "Franklin - India High Growth Companies Fund (G)": 107.59,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.06,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 105.51,
              "date": "2016-07-26"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.09,
              "Franklin - India Bluechip Fund (G)": 106.65,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.12,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 105.53,
              "date": "2016-07-27"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.44,
              "Franklin - India Bluechip Fund (G)": 106.98,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.14,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 105.79,
              "date": "2016-07-28"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.01,
              "Franklin - India Bluechip Fund (G)": 106.59,
              "Franklin - India High Growth Companies Fund (G)": 107.24,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.16,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 104.94,
              "date": "2016-07-29"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.82,
              "Franklin - India Bluechip Fund (G)": 105.14,
              "Franklin - India High Growth Companies Fund (G)": 106.9,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.18,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 104.74,
              "date": "2016-08-01"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.36,
              "Franklin - India Bluechip Fund (G)": 105.06,
              "Franklin - India High Growth Companies Fund (G)": 105.86,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.45,
              "IDFC - Cash Fund Reg (G)": 101.2,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 105.2,
              "date": "2016-08-03"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.02,
              "Franklin - India Bluechip Fund (G)": 105.64,
              "Franklin - India High Growth Companies Fund (G)": 105.86,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.27,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 106.86,
              "date": "2016-08-04"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.91,
              "Franklin - India Bluechip Fund (G)": 105.39,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.3,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 107.27,
              "date": "2016-08-05"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.78,
              "Franklin - India Bluechip Fund (G)": 105.44,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.31,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 107.16,
              "date": "2016-08-08"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.6,
              "Franklin - India Bluechip Fund (G)": 106.29,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.33,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 107.57,
              "date": "2016-08-09"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.54,
              "Franklin - India Bluechip Fund (G)": 106.35,
              "Franklin - India High Growth Companies Fund (G)": 106.21,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.39,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 109.25,
              "date": "2016-08-10"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.24,
              "Franklin - India Bluechip Fund (G)": 105.85,
              "Franklin - India High Growth Companies Fund (G)": 106.21,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.41,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 109.05,
              "date": "2016-08-11"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.36,
              "Franklin - India Bluechip Fund (G)": 105.99,
              "Franklin - India High Growth Companies Fund (G)": 107.24,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.43,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 109.5,
              "date": "2016-08-12"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.89,
              "Franklin - India Bluechip Fund (G)": 106.1,
              "Franklin - India High Growth Companies Fund (G)": 107.59,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.45,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 108.57,
              "date": "2016-08-16"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.66,
              "Franklin - India Bluechip Fund (G)": 105.58,
              "Franklin - India High Growth Companies Fund (G)": 107.93,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.54,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 106.9,
              "date": "2016-08-17"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.13,
              "Franklin - India Bluechip Fund (G)": 106.84,
              "Franklin - India High Growth Companies Fund (G)": 108.97,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.56,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 106.97,
              "date": "2016-08-18"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.54,
              "Franklin - India Bluechip Fund (G)": 107.41,
              "Franklin - India High Growth Companies Fund (G)": 109.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 101.93,
              "IDFC - Cash Fund Reg (G)": 101.6,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 107.12,
              "date": "2016-08-19"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.23,
              "Franklin - India Bluechip Fund (G)": 106.98,
              "Franklin - India High Growth Companies Fund (G)": 108.97,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.68,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 107.82,
              "date": "2016-08-22"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.87,
              "Franklin - India Bluechip Fund (G)": 107.41,
              "Franklin - India High Growth Companies Fund (G)": 109.31,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.69,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 107.95,
              "date": "2016-08-23"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.81,
              "Franklin - India Bluechip Fund (G)": 108.97,
              "Franklin - India High Growth Companies Fund (G)": 109.31,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.71,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 107.53,
              "date": "2016-08-24"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.21,
              "Franklin - India Bluechip Fund (G)": 108.78,
              "Franklin - India High Growth Companies Fund (G)": 108.62,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.73,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 107.48,
              "date": "2016-08-25"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 111.78,
              "Franklin - India Bluechip Fund (G)": 109.06,
              "Franklin - India High Growth Companies Fund (G)": 110,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.79,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 108.48,
              "date": "2016-08-30"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 111.67,
              "Franklin - India Bluechip Fund (G)": 108.15,
              "Franklin - India High Growth Companies Fund (G)": 110.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.86,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 108.08,
              "date": "2016-08-31"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 112.07,
              "Franklin - India Bluechip Fund (G)": 106.29,
              "Franklin - India High Growth Companies Fund (G)": 110,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.92,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 106.67,
              "date": "2016-09-01"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 111.26,
              "Franklin - India Bluechip Fund (G)": 106.65,
              "Franklin - India High Growth Companies Fund (G)": 110.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.42,
              "IDFC - Cash Fund Reg (G)": 101.94,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 106.41,
              "date": "2016-09-02"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.29,
              "Franklin - India Bluechip Fund (G)": 107.09,
              "Franklin - India High Growth Companies Fund (G)": 112.76,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 101.95,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 106.67,
              "date": "2016-09-06"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.92,
              "Franklin - India Bluechip Fund (G)": 106.79,
              "Franklin - India High Growth Companies Fund (G)": 113.1,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 101.98,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 104.91,
              "date": "2016-09-07"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.16,
              "Franklin - India Bluechip Fund (G)": 106.65,
              "Franklin - India High Growth Companies Fund (G)": 113.1,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 101.99,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 105.06,
              "date": "2016-09-08"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.92,
              "Franklin - India Bluechip Fund (G)": 107.69,
              "Franklin - India High Growth Companies Fund (G)": 112.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.05,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 106.48,
              "date": "2016-09-09"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.92,
              "Franklin - India Bluechip Fund (G)": 107.39,
              "Franklin - India High Growth Companies Fund (G)": 109.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.07,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 106.82,
              "date": "2016-09-12"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 111.14,
              "Franklin - India Bluechip Fund (G)": 106.35,
              "Franklin - India High Growth Companies Fund (G)": 111.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.09,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 106.4,
              "date": "2016-09-16"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.8,
              "Franklin - India Bluechip Fund (G)": 106.1,
              "Franklin - India High Growth Companies Fund (G)": 111.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.1,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 105.96,
              "date": "2016-09-19"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.81,
              "Franklin - India Bluechip Fund (G)": 106.7,
              "Franklin - India High Growth Companies Fund (G)": 110.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.13,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 105.79,
              "date": "2016-09-20"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.75,
              "Franklin - India Bluechip Fund (G)": 104.79,
              "Franklin - India High Growth Companies Fund (G)": 110.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.18,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 105.87,
              "date": "2016-09-21"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.16,
              "Franklin - India Bluechip Fund (G)": 105.42,
              "Franklin - India High Growth Companies Fund (G)": 111.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.21,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 104.22,
              "date": "2016-09-22"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.78,
              "Franklin - India Bluechip Fund (G)": 106.4,
              "Franklin - India High Growth Companies Fund (G)": 111.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 102.9,
              "IDFC - Cash Fund Reg (G)": 102.23,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 104.33,
              "date": "2016-09-23"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.65,
              "Franklin - India Bluechip Fund (G)": 107.09,
              "Franklin - India High Growth Companies Fund (G)": 110,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.24,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 103.79,
              "date": "2016-09-26"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.45,
              "Franklin - India Bluechip Fund (G)": 106.84,
              "Franklin - India High Growth Companies Fund (G)": 109.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.26,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 105.75,
              "date": "2016-09-27"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.8,
              "Franklin - India Bluechip Fund (G)": 106.54,
              "Franklin - India High Growth Companies Fund (G)": 110.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.32,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 105.5,
              "date": "2016-09-28"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.74,
              "Franklin - India Bluechip Fund (G)": 106.51,
              "Franklin - India High Growth Companies Fund (G)": 109.31,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.37,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 106.05,
              "date": "2016-09-30"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.39,
              "Franklin - India Bluechip Fund (G)": 106.48,
              "Franklin - India High Growth Companies Fund (G)": 110.69,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.39,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 105.85,
              "date": "2016-10-03"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.45,
              "Franklin - India Bluechip Fund (G)": 105.14,
              "Franklin - India High Growth Companies Fund (G)": 111.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.48,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 106.24,
              "date": "2016-10-04"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.45,
              "Franklin - India Bluechip Fund (G)": 105.55,
              "Franklin - India High Growth Companies Fund (G)": 111.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.5,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 105.91,
              "date": "2016-10-05"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.88,
              "Franklin - India Bluechip Fund (G)": 106.13,
              "Franklin - India High Growth Companies Fund (G)": 111.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.52,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 104.95,
              "date": "2016-10-06"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.23,
              "Franklin - India Bluechip Fund (G)": 106.51,
              "Franklin - India High Growth Companies Fund (G)": 111.38,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.57,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 105.25,
              "date": "2016-10-07"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.92,
              "Franklin - India Bluechip Fund (G)": 106.7,
              "Franklin - India High Growth Companies Fund (G)": 111.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.38,
              "IDFC - Cash Fund Reg (G)": 102.6,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 105.34,
              "date": "2016-10-10"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.27,
              "Franklin - India Bluechip Fund (G)": 106.79,
              "Franklin - India High Growth Companies Fund (G)": 108.97,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.61,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 105.1,
              "date": "2016-10-13"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.45,
              "Franklin - India Bluechip Fund (G)": 106.84,
              "Franklin - India High Growth Companies Fund (G)": 109.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.63,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 103.78,
              "date": "2016-10-14"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.74,
              "Franklin - India Bluechip Fund (G)": 106.02,
              "Franklin - India High Growth Companies Fund (G)": 111.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.65,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 103.41,
              "date": "2016-10-19"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 110.68,
              "Franklin - India Bluechip Fund (G)": 105.61,
              "Franklin - India High Growth Companies Fund (G)": 112.41,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.72,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 102.83,
              "date": "2016-10-20"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.69,
              "Franklin - India Bluechip Fund (G)": 106.1,
              "Franklin - India High Growth Companies Fund (G)": 112.41,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.75,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 103.52,
              "date": "2016-10-21"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.17,
              "Franklin - India Bluechip Fund (G)": 105.91,
              "Franklin - India High Growth Companies Fund (G)": 112.76,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.76,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 104.02,
              "date": "2016-10-24"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.87,
              "Franklin - India Bluechip Fund (G)": 104.49,
              "Franklin - India High Growth Companies Fund (G)": 113.45,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.78,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 102.74,
              "date": "2016-10-25"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 109.75,
              "Franklin - India Bluechip Fund (G)": 104.02,
              "Franklin - India High Growth Companies Fund (G)": 111.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.84,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 103.74,
              "date": "2016-10-26"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.18,
              "Franklin - India Bluechip Fund (G)": 103.26,
              "Franklin - India High Growth Companies Fund (G)": 111.72,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.86,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 101.11,
              "date": "2016-10-27"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.54,
              "Franklin - India Bluechip Fund (G)": 104.02,
              "Franklin - India High Growth Companies Fund (G)": 112.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.88,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 99.17,
              "date": "2016-10-28"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.67,
              "Franklin - India Bluechip Fund (G)": 104.79,
              "Franklin - India High Growth Companies Fund (G)": 112.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.9,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 99.15,
              "date": "2016-11-01"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 107.78,
              "Franklin - India Bluechip Fund (G)": 104.16,
              "Franklin - India High Growth Companies Fund (G)": 110.34,
              "Franklin - India Ultra Short Bond Super Ins (G)": 103.86,
              "IDFC - Cash Fund Reg (G)": 102.92,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 98.88,
              "date": "2016-11-02"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.13,
              "Franklin - India Bluechip Fund (G)": 105.55,
              "Franklin - India High Growth Companies Fund (G)": 109.31,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 98.59,
              "date": "2016-11-03"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 106.67,
              "Franklin - India Bluechip Fund (G)": 102.98,
              "Franklin - India High Growth Companies Fund (G)": 108.62,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103.01,
              "IDFC - Premier Equity Fund Reg (G)": 104.38,
              "S&P BSE Sensex 30": 97.14,
              "date": "2016-11-04"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 108.13,
              "Franklin - India Bluechip Fund (G)": 100.88,
              "Franklin - India High Growth Companies Fund (G)": 110,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103.04,
              "IDFC - Premier Equity Fund Reg (G)": 105.05,
              "S&P BSE Sensex 30": 97.87,
              "date": "2016-11-07"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 105.11,
              "Franklin - India Bluechip Fund (G)": 100.47,
              "Franklin - India High Growth Companies Fund (G)": 111.03,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103.06,
              "IDFC - Premier Equity Fund Reg (G)": 102.12,
              "S&P BSE Sensex 30": 98.22,
              "date": "2016-11-08"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.97,
              "Franklin - India Bluechip Fund (G)": 100.71,
              "Franklin - India High Growth Companies Fund (G)": 109.66,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103.11,
              "IDFC - Premier Equity Fund Reg (G)": 97.74,
              "S&P BSE Sensex 30": 97.5,
              "date": "2016-11-09"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.86,
              "Franklin - India Bluechip Fund (G)": 98.74,
              "Franklin - India High Growth Companies Fund (G)": 112.07,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.35,
              "IDFC - Cash Fund Reg (G)": 103.13,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 99.21,
              "date": "2016-11-10"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100.87,
              "Franklin - India Bluechip Fund (G)": 99.48,
              "Franklin - India High Growth Companies Fund (G)": 108.97,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.15,
              "IDFC - Premier Equity Fund Reg (G)": 96.55,
              "S&P BSE Sensex 30": 99.34,
              "date": "2016-11-11"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.33,
              "Franklin - India Bluechip Fund (G)": 99.75,
              "Franklin - India High Growth Companies Fund (G)": 106.21,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.18,
              "IDFC - Premier Equity Fund Reg (G)": 97.08,
              "S&P BSE Sensex 30": 99.51,
              "date": "2016-11-17"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 100.35,
              "Franklin - India Bluechip Fund (G)": 99.04,
              "Franklin - India High Growth Companies Fund (G)": 106.55,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.19,
              "IDFC - Premier Equity Fund Reg (G)": 96.68,
              "S&P BSE Sensex 30": 100.48,
              "date": "2016-11-18"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.97,
              "Franklin - India Bluechip Fund (G)": 100.49,
              "Franklin - India High Growth Companies Fund (G)": 105.17,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.24,
              "IDFC - Premier Equity Fund Reg (G)": 97.48,
              "S&P BSE Sensex 30": 100.13,
              "date": "2016-11-23"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.09,
              "Franklin - India Bluechip Fund (G)": 100.66,
              "Franklin - India High Growth Companies Fund (G)": 104.48,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.26,
              "IDFC - Premier Equity Fund Reg (G)": 98.01,
              "S&P BSE Sensex 30": 98.89,
              "date": "2016-11-24"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 103.42,
              "Franklin - India Bluechip Fund (G)": 101.07,
              "Franklin - India High Growth Companies Fund (G)": 105.52,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.28,
              "IDFC - Premier Equity Fund Reg (G)": 98.94,
              "S&P BSE Sensex 30": 99.34,
              "date": "2016-11-25"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 102.84,
              "Franklin - India Bluechip Fund (G)": 102,
              "Franklin - India High Growth Companies Fund (G)": 105.52,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.3,
              "IDFC - Premier Equity Fund Reg (G)": 100,
              "S&P BSE Sensex 30": 99.5,
              "date": "2016-11-28"},
             {"Birla SL - Frontline Equity Fund Reg (G)": 101.57,
              "Franklin - India Bluechip Fund (G)": 101.34,
              "Franklin - India High Growth Companies Fund (G)": 106.21,
              "Franklin - India Ultra Short Bond Super Ins (G)": 104.83,
              "IDFC - Cash Fund Reg (G)": 103.31,
              "IDFC - Premier Equity Fund Reg (G)": 97.61,
              "S&P BSE Sensex 30": 98.92,
              "date": "2016-11-29"}
            ],
          "axes":{"x":"date", "y":"IDFC - Cash Fund Reg (G)"},
          "label_text":{},
          "legend":{},
          "chart_type":"line",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":False
        }
      },
      {
        "data":"You have been investing in 6 mutual funds (1 Debt,1 Cash,4 Equity).4 have grown over the last 6 months while remaining 1 has shrunken",
        "dataType":"html"
      },
      {
        "dataType":"html",
        "data":"<u><b>Outperformers</b></u>"
      },
      {
        "dataType":"html",
        "data":"The most significant among them is <b>IDFC - Premier Equity Fund Reg (G)</b> from Equity portfolio, which has grown by 5.05% during the 6 month period, resulting in CAGR of 10.1%. and the next best fund is IDFC - Cash Fund Reg (G) and it has grown by 0.02% during the 6 month period, resulting in CAGR of 0.04% ."
      },
      {
        "dataType":"html",
        "data":"<u><b>Underperformers</b></u>"
      },
      {
        "dataType":"html",
        "data":"<b>Franklin - India Bluechip Fund (G) and Franklin - India Ultra Short Bond Super Ins (G)</b> Funds have been under-performing over the last 6 month, growing just around -0.9% and 0.0%."
      }

    ]
  },
  {
    "cardType":"normal",
    "name": "Iris Mack",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>What is the effect of targeted sector allocation?</h4>"
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":[
             {"name": "Telecom", "value": 2},
             {"name": "Metals", "value": 5},
             {"name": "Construction", "value": 5},
             {"name": "Automobile", "value": 6},
             {"name": "Technology", "value": 6},
             {"name": "Healthcare", "value": 12},
             {"name": "Oil & Gas", "value": 13},
             {"name": "Financial Services", "value": 22},
             {"name": "FMCG", "value": 28}
          ],
          "axes":{"x":"name", "y":"value"},
          "label_text":{},
          "legend":{},
          "chart_type":"donut",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":False
        }
      },
      {
        "dataType":"html",
        "data":"Influence of sectors on portfolio growth"
      },
      {
        "dataType":"html",
        "data":"The portfolio seems to be well diversified as investments have been made in a wide range of sectors. However, the investments in equity market seem to <b>depend heavily upon couple of sectors</b>, as Financial Services and FMCG accounts for more than <b>half</b> 50.0% of the equity allocation."
      },
      {
        "dataType":"html",
        "data":"The table below displays the sector allocation of all equity funds and how each sector has performed over the last 6 months. The key sectors that the portfolio is betting on, have done <b>relatively well</b> (Financial Services and FMCG have grown by  22.0% and 28.0% respectively)."
      },
      {
        "dataType":"table",
        "data":{
          "tableData":[
             ["", "allocation", "return"],
             ["Telecom", 2, 39],
             ["Metals", 5, -33],
             ["Construction", 5, 63],
             ["Automobile", 6, 25],
             ["Technology", 6, 25],
             ["Healthcare", 12, 56],
             ["Oil & Gas", 13, 4],
             ["Financial Services", 22, 5],
             ["FMCG", 28, 25]
           ],
          "tableType":"heatMap"
        }
      },
      {
        "dataType":"html",
        "data":"It is also very important to note that the existing portfolio <b>does not have adequate exposure</b> to other well-performing sectors.<b>Healthcare and Oil & Gas</b> has <b>grown remarkably</b>, producing return of over 13.0%. But the portfolio allocation (12.0% on Healthcare) limits scope for leveraging the booming sector."
      }

    ]
  },
  {
    "cardType":"normal",
    "name": "Bryan Gordon",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>How is the portfolio projected to perform</h4>"
      },
      {
        "dataType":"html",
        "data":"<b>Telecom, Financial Services and Technology</b> are expected to <b>outperform</b> the overall market, whereas <b>Automobile,Oil & Gas and Metals</b> are very likely to <b>remain stable</b>, On the other hand, <b>Consumer Durables,Construction and FMCG</b> seems to <b>underperform</b> compared to other sectors. The chart below displays the sector allocation of the current portfolio, mapped with projected outlook for the sectors."
      },
      {
        "dataType":"c3Chart",
        "data":{
          "data":{
          	"data1": [
          		{"name": "Telecom", "value": 2},
            	{"name": "Metals", "value": 5}
          	],
          	"data2": [
          		{"name": "Construction", "value": 5},
            	{"name": "Automobile", "value": 6},
            	{"name": "Technology", "value": 6}
          	],
          	"data3": [
          		{"name": "Healthcare", "value": 12},
                {"name": "Oil & Gas", "value": 13},
            	{"name": "Financial Services", "value": 22},
            	{"name": "FMCG", "value": 28}
          	]
			},
          "axes":{"x":"name","y":"value"},
          "label_text":{},
          "legend":{},
          "chart_type":"scatter_bar",
          "types":{},
          "axisRotation":False,
          "yAxisNumberFormat":".2s",
          "y2AxisNumberFormat":"",
          "subchart":False
        }
      }
    ]
  },
  {
    "cardType":"normal",
    "name": "Matt Sims",
    "slug":"sda",
    "cardWidth":100,
    "cardData":[
      {
        "dataType":"html",
        "data":"<h4>Our recommendations to maximize your wealth</h4>"
      },
      {
        "dataType":"html",
        "data":"Based on analysis of your portfolio composition, performance of various funds, and the projected outlook, mAdvisor recommends the following."
      },
      {
        "dataType":"html",
        "data":"<ul><li><b>Reallocate investments</b> from some of the low-performing assets such as Franklin - India Ultra Short Bond Super Ins (G): Our suggestion is that you can maximize returns by investing more in other existing equity funds.</li><li>Invest in funds that are going to outperform, <b>Technology and Telecom</b> equity funds. Our suggestion is that you consider investing in ICICI Prudential Large Cap Fund, top performer in Technology, which has an annual return of 25.4%.</li><li><b>Consider investing in Tax Saver</b> equity funds that would help you manage taxes more effectively and save more money.</li></ul>"
      }

    ]
  }
]
}