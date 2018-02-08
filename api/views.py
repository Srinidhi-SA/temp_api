# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import random

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from api.datasets.helper import add_ui_metadata_to_metadata
from api.datasets.serializers import DatasetSerializer
from api.exceptions import creation_failed_exception, update_failed_exception, retrieve_failed_exception
from api.pagination import CustomPagination
from api.query_filtering import get_listed_data
from api.utils import \
    convert_to_string, \
    InsightSerializer, \
    TrainerSerlializer, \
    ScoreSerlializer, \
    InsightListSerializers, \
    TrainerListSerializer, \
    ScoreListSerializer, \
    RoboSerializer, \
    RoboListSerializer, \
    StockDatasetListSerializer, \
    StockDatasetSerializer, \
    AppListSerializers, \
    AppSerializer
from models import Insight, Dataset, Job, Trainer, Score, Robo, SaveData, StockDataset, CustomApps
from api.tasks import clean_up_on_delete


class SignalView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Insight.objects.filter(
            created_by=self.request.user,
            deleted=False,
            # analysis_done=True
            status__in=['SUCCESS','INPROGRESS']
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

        # try:
        data = request.data
        data = convert_to_string(data)
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = InsightSerializer(data=data)
        if serializer.is_valid():
            signal_object = serializer.save()
            signal_object.create(advanced_settings=data.get('advanced_settings', {}))
            return Response(serializer.data)

        return creation_failed_exception(serializer.errors)
        # except Exception as error:
        #     creation_failed_exception(error)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)

        try:
            instance = self.get_object_from_all()
            if 'deleted' in data:
                if data['deleted'] == True:
                    print 'let us delete'
                    clean_up_on_delete.delay(instance.slug, Insight.__name__)
                    return JsonResponse({'message':'Deleted'})
        except:
            return update_failed_exception("File Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=InsightListSerializers
        )

    def retrieve(self, request, *args, **kwargs):
        # return get_retrieve_data(self)
        try:
            instance = self.get_object_from_all()
        except:
            return retrieve_failed_exception("File Doesn't exist.")

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

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
        # try:
        data = request.data
        data = convert_to_string(data)
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = TrainerSerlializer(data=data)
        if serializer.is_valid():
            trainer_object = serializer.save()
            trainer_object.create()
            return Response(serializer.data)

        return creation_failed_exception(serializer.errors)
        # except Exception as error:
        #     creation_failed_exception(error)

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

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=TrainerListSerializer
        )

    def retrieve(self, request, *args, **kwargs):
        # return get_retrieve_data(self)
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = TrainerSerlializer(instance=instance)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def comparision(self, request, *args, **kwargs):

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = TrainerSerlializer(instance=instance)
        trainer_data = serializer.data
        t_d_c = trainer_data['config']['config']['COLUMN_SETTINGS']['variableSelection']
        uidColArray= [x["name"] for x in t_d_c if x["uidCol"] == True]



        score_datatset_slug = request.GET.get('score_datatset_slug')
        try:
            dataset_instance = Dataset.objects.get(slug=score_datatset_slug)
        except:
            return creation_failed_exception("File Doesn't exist.")

        if dataset_instance is None:
            return creation_failed_exception("File Doesn't exist.")

        dataset_serializer = DatasetSerializer(instance=dataset_instance)
        object_details = dataset_serializer.data
        original_meta_data_from_scripts = object_details['meta_data']
        if original_meta_data_from_scripts is None:
            uiMetaData = None
        if original_meta_data_from_scripts == {}:
            uiMetaData = None
        else:
            uiMetaData = add_ui_metadata_to_metadata(original_meta_data_from_scripts)

        object_details['meta_data'] = {
            "scriptMetaData": original_meta_data_from_scripts,
            "uiMetaData": uiMetaData
        }

        d_d_c = uiMetaData['varibaleSelectionArray']

        t_d_c_s = set([item['name'] for item in t_d_c if item["targetColumn"] != True])
        d_d_c_s = set([item['name'] for item in d_d_c]).union(set(uidColArray))

        proceedFlag = d_d_c_s.issuperset(t_d_c_s)

        if proceedFlag != True:
            missing = t_d_c_s.difference(d_d_c_s)
            extra = d_d_c_s.difference(t_d_c_s)
            message = "These are the missing Columns {0}".format(missing)
            if len(extra) > 0:
                message += "and these are the new columns {0}".format(extra)
        else:
            extra = d_d_c_s.difference(t_d_c_s)
            if len(extra) > 0:
                message = "These are the new columns {0}".format(extra)
            else:
                message = ""


        return JsonResponse({
            'proceed': proceedFlag,
            'message': message
        })


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
        # try:
        data = request.data
        data = convert_to_string(data)
        data['trainer'] = Trainer.objects.filter(slug=data['trainer'])
        data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        data['app_id'] = int(json.loads(data['config'])['app_id'])
        serializer = ScoreSerlializer(data=data)
        if serializer.is_valid():
            score_object = serializer.save()
            score_object.create()
            return Response(serializer.data)

        return creation_failed_exception(serializer.errors)
        # except Exception as error:
        #     creation_failed_exception(error)

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

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=ScoreListSerializer
        )

    def retrieve(self, request, *args, **kwargs):
        # return get_retrieve_data(self)
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
        base_file_path = settings.SCORES_SCRIPTS_FOLDER
        download_path = base_file_path + instance.slug + '/data.csv'
        # save_file_to = instance.get_local_file_path()
        #
        # from api.lib.fab_helper import get_file
        #
        # get_file(
        #     from_file=download_path,
        #     to_dir=save_file_to
        # )
        #
        # filepath = save_file_to
        filepath = download_path

        from django.http import HttpResponse
        import os
        download_csv = request.query_params.get('download_csv', None)
        count = request.query_params.get('count', 100)
        try:
            count = int(count)
        except:
            count = 100
        if download_path is not None:
            with open(filepath, 'rb') as f:

                if download_csv is None:
                    response = HttpResponse(f.read(), content_type='application/csv')
                    response['Content-Disposition'] = 'inline; filename=' + os.path.basename(instance.name)
                    return response
                else:
                    csv_text = f.read()
                    csv_list = csv_text.split('\n')
                    return JsonResponse({
                        'Message': 'Success',
                        'csv_data': csv_list[:count]
                    })
        else:
            return JsonResponse({'result': 'failed to download'})


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

        try:
            data = request.data
            data = convert_to_string(data)
            files = request.FILES
            name = data.get('name', "robo" + "_" + str(random.randint(1000000, 10000000)))
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
                dataset['datasource_type'] = 'fileUpload'
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
            return creation_failed_exception(serializer.errors)
        except Exception as error:
            creation_failed_exception(error)

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
        # return get_retrieve_data(self)
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = RoboSerializer(instance=instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=RoboListSerializer
        )


from api.models import Audioset
from api.utils import AudiosetSerializer, AudioListSerializer


class StockDatasetView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = StockDataset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
        )
        return queryset

    def get_object_from_all(self):
        return StockDataset.objects.get(slug=self.kwargs.get('slug'))

    serializer_class = StockDatasetSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('deleted', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):

        data = request.data
        config = data.get('config')
        stock_symbol = config.get('stock_symbols')
        stock_values = [item.get('value') for item in stock_symbol if item.get('value') != ""]
        new_data = {}
        new_data['stock_symbols'] = (", ").join(stock_values)
        new_data['name'] = config.get('name')
        new_data['input_file'] = None
        new_data['created_by'] = request.user.id

        serializer = StockDatasetSerializer(data=new_data)
        if serializer.is_valid():
            stock_object = serializer.save()
            stock_object.create()
            return Response(serializer.data)
        return creation_failed_exception(serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = StockDatasetSerializer(instance=instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=StockDatasetListSerializer
        )

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
    def create_stats(self, request, slug=None):
        data = request.data

        fake = request.GET.get('fake', None)

        new_data = {}
        if 'input_file' in data:
            new_data['input_file'] = request.FILES.get('input_file')
        else:
            new_data['input_file'] = None

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = self.serializer_class(instance=instance, data=new_data, partial=True)
        if serializer.is_valid():
            stock_instance = serializer.save()
            # stock_instance.stats(file=new_data['input_file'])
            if fake is None:
                stock_instance.fake_call_mlscripts()
            else:
                stock_instance.call_mlscripts()
            return Response(serializer.data)

        serializer = StockDatasetSerializer(instance=instance)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def read_stats(self, request, slug=None):

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = StockDatasetSerializer(instance=instance)
        return Response(serializer.data)

    """
    historic data
    data from bluemix -- natural language understanding
    """


class AudiosetView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Audioset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            analysis_done=True
        )
        return queryset

    def get_object_from_all(self):
        return Audioset.objects.get(slug=self.kwargs.get('slug'))

    serializer_class = AudiosetSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'datasource_type', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):

        try:
            data = request.data
            data = convert_to_string(data)

            if 'input_file' in data:
                data['input_file'] = request.FILES.get('input_file')
                data['datasource_type'] = 'fileUpload'
                if data['input_file'] is None:
                    data['name'] = data.get('name', data.get('datasource_type', "H") + "_" + str(
                        random.randint(1000000, 10000000)))
                else:
                    data['name'] = data.get('name', data['input_file'].name)
            elif 'datasource_details' in data:
                data['input_file'] = None
                if "Dataset Name" in data['datasource_details']:
                    data['name'] = data['datasource_details']['Dataset Name']
                else:
                    data['name'] = data.get('name', data.get('datasource_type', "H") + "_" + str(
                        random.randint(1000000, 10000000)))

            # question: why to use user.id when it can take, id, pk, object.
            # answer: I tried. Sighhh but it gave this error "Incorrect type. Expected pk value, received User."
            data['created_by'] = request.user.id
            try:
                serializer = AudiosetSerializer(data=data)
                if serializer.is_valid():
                    audioset_object = serializer.save()
                    audioset_object.create()
                    return Response(serializer.data)
            except Exception as err:
                return creation_failed_exception(err)
            return creation_failed_exception(serializer.errors)
        except Exception as error:
            creation_failed_exception(error)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("File Doesn't exist.")

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        serializer = AudiosetSerializer(instance=instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=AudioListSerializer
        )

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


class AppView(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = CustomApps.objects.filter(
            #created_by=self.request.user,
            status="Active"
        )

        # tagsRq = self.request.query_params.get('tag', None)
        # if tagsRq is not None:
        #     queryset = queryset.filter(tags__icontains=tagsRq)
        return queryset

    def get_serializer_class(self):
        return AppSerializer

    def get_object_from_all(self):
        return CustomApps.objects.get(slug=self.kwargs.get('slug'))

    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('name', 'tags')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):

        try:
            data = request.data
            data = convert_to_string(data)
            # data['dataset'] = Dataset.objects.filter(slug=data['dataset'])
            data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
            serializer = AppSerializer(data=data)
            if serializer.is_valid():
                app_obj = serializer.save()
                app_obj.create()
                return Response(serializer.data)

            return creation_failed_exception(serializer.errors)
        except Exception as error:
            creation_failed_exception(error)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)

        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("App Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=AppListSerializers
        )

    def retrieve(self, request, *args, **kwargs):
        # return get_retrieve_data(self)
        try:
            instance = self.get_object_from_all()
        except:
            return creation_failed_exception("App Doesn't exist.")

        if instance is None:
            return creation_failed_exception("App Doesn't exist.")

        serializer = AppSerializer(instance=instance)
        return Response(serializer.data)


def get_datasource_config_list(request):
    return JsonResponse(settings.DATA_SOURCES_CONFIG)


def get_config(request, slug=None):
    job = Job.objects.get(slug=slug)
    if not job:
        return JsonResponse({'result': 'Failed'})
    return JsonResponse(json.loads(job.config))


from django.views.decorators.csrf import csrf_exempt
from api import tasks


@csrf_exempt
def set_result(request, slug=None):
    job = Job.objects.get(slug=slug)

    if not job:
        return JsonResponse({'result': 'Failed'})
    results = request.body
    tasks.save_results_to_job.delay(
        slug,
        results
    )
    if "status=failed" in request.body:
        results = {'error_message': 'Failed'}
        results = tasks.write_into_databases.delay(
            job_type=job.job_type,
            object_slug=job.object_id,
            results=results
        )
    else:
        results = tasks.write_into_databases.delay(
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
    if job_type in ["metadata", "subSetting"]:
        dataset_object = Dataset.objects.get(slug=object_slug)

        if "error_message" in results:
            dataset_object.status = "FAILED"
            dataset_object.save()
            return results

        columnData = results['columnData']
        for data in columnData:
            # data["chartData"] = helper.find_chart_data_and_replace_with_chart_data(data["chartData"])
            card_data = data["chartData"]
            if 'dataType' in card_data and card_data['dataType'] == 'c3Chart':
                chart_data = card_data['data']
                final_chart_data = helper.decode_and_convert_chart_raw_data(chart_data, object_slug=object_slug)
                data["chartData"] = chart_changes_in_metadata_chart(final_chart_data)
                data["chartData"]["table_c3"] = []

        results['columnData'] = columnData
        # results['possibleAnalysis'] = settings.ANALYSIS_FOR_TARGET_VARIABLE
        da = []
        for d in results.get('sampleData'):
            da.append(map(str, d))
        results['sampleData'] = da
        # results["modified"] = False

        dataset_object.meta_data = json.dumps(results)
        dataset_object.analysis_done = True
        dataset_object.save()
        return results
    elif job_type == "master":
        insight_object = Insight.objects.get(slug=object_slug)

        if "error_message" in results:
            insight_object.status = "FAILED"
            insight_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        insight_object.data = json.dumps(results)
        insight_object.analysis_done = True
        insight_object.status = 'SUCCESS'
        insight_object.save()
        return results
    elif job_type == "model":
        trainer_object = Trainer.objects.get(slug=object_slug)

        if "error_message" in results:
            trainer_object.status = "FAILED"
            trainer_object.save()
            return results

        results['model_summary'] = add_slugs(results['model_summary'], object_slug=object_slug)
        trainer_object.data = json.dumps(results)
        trainer_object.analysis_done = True
        trainer_object.save()
        return results
    elif job_type == 'score':
        score_object = Score.objects.get(slug=object_slug)

        if "error_message" in results:
            score_object.status = "FAILED"
            score_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        score_object.data = json.dumps(results)
        score_object.analysis_done = True
        score_object.save()
        return results
    elif job_type == 'robo':
        robo_object = Robo.objects.get(slug=object_slug)

        if "error_message" in results:
            robo_object.status = "FAILED"
            robo_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        robo_object.data = json.dumps(results)
        robo_object.robo_analysis_done = True
        robo_object.save()
        return results
    elif job_type == 'stockAdvisor':
        stock_objects = StockDataset.objects.get(slug=object_slug)
        results = add_slugs(results, object_slug=object_slug)
        stock_objects.data = json.dumps(results)
        stock_objects.analysis_done = True
        stock_objects.status = 'SUCCESS'
        stock_objects.save()
        return results
    else:
        print "No where to write"


def chart_changes_in_metadata_chart(chart_data):
    from api import helper
    chart_data = helper.remove_tooltip_format_from_chart_data(chart_data)
    chart_data = helper.remove_chart_height_from_chart_data(chart_data)
    chart_data = helper.remove_padding_from_chart_data(chart_data)
    chart_data = helper.add_side_padding_to_chart_data(chart_data)

    chart_data = helper.remove_subchart_from_chart_data(chart_data)
    # chart_data = helper.remove_legend_from_chart_data(chart_data)
    chart_data = helper.remove_grid_from_chart_data(chart_data)
    chart_data = helper.remove_xdata_from_chart_data(chart_data)
    chart_data = helper.remove_chart_height_from_x_chart_data(chart_data)
    chart_data = helper.keep_bar_width_in_ratio(chart_data)
    chart_data = helper.limit_chart_data_length(chart_data, limit=10)
    return chart_data


def add_slugs(results, object_slug=""):
    from api import helper
    listOfNodes = results.get('listOfNodes', [])
    listOfCards = results.get('listOfCards', [])

    name = results['name']
    results['slug'] = helper.get_slug(name)

    if len(listOfCards) > 0:
        for loC in listOfCards:
            add_slugs(loC, object_slug=object_slug)
            if loC['cardType'] == 'normal':
                convert_chart_data_to_beautiful_things(loC['cardData'], object_slug=object_slug)

    if len(listOfNodes) > 0:
        for loN in listOfNodes:
            add_slugs(loN, object_slug=object_slug)

    return results


def convert_chart_data_to_beautiful_things(data, object_slug=""):
    from api import helper
    for card in data:
        if card["dataType"] == "c3Chart":
            chart_raw_data = card["data"]
            # function
            try:
                card["data"] = helper.decode_and_convert_chart_raw_data(chart_raw_data, object_slug=object_slug)
            except Exception as e:
                print e
                card["data"] = {}


def home(request):
    host = request.get_host()

    APP_BASE_URL = ""
    protocol = "http"
    if request.is_secure():
        protocol = "https"

    SCORES_BASE_URL = "http://{}:8001/".format(settings.HDFS.get("host", "ec2-34-205-203-38.compute-1.amazonaws.com"))
    APP_BASE_URL = "{}://{}".format(protocol, host)

    context = {"UI_VERSION": settings.UI_VERSION, "APP_BASE_URL": APP_BASE_URL, "SCORES_BASE_URL": SCORES_BASE_URL, "STATIC_URL" : settings.STATIC_URL}

    return render(request, 'home.html', context)


@api_view(['GET'])
def get_info(request):
    user = request.user
    from api.helper import convert_to_humanize
    def get_all_info_related_to_user(user):
        # things = ['dataset', 'insight', 'trainer', 'score', 'robo', 'audioset']
        things = ['dataset', 'insight', 'trainer', 'score']
        all_data = []
        for t in things:
            all_data.append(get_all_objects(user, t))
        return all_data

    def get_all_objects(user, type):
        from api.models import Dataset, Insight, Trainer, Score, Robo
        t = {
            'dataset': Dataset,
            'insight': Insight,
            'trainer': Trainer,
            'score': Score,
            'robo': Robo,
            'audioset': Audioset
        }
        display = {
            'dataset': 'Data Sets Uploaded',
            'insight': 'Signals Created',
            'trainer': 'Models Created',
            'score': 'Scores Created',
            'robo': 'Robo Created',
            'audioset': 'Audioset Created'
        }

        all_objects = t[type].objects.filter(
            created_by=user,
            analysis_done=True
        )

        return {
            'count': len(all_objects),
            'displayName': display[type]
        }

    def get_total_size(user):
        from api.models import Dataset
        all_dataset = Dataset.objects.filter(created_by=user)
        size = 0
        for dataset in all_dataset:
            try:
                size += dataset.input_file.size
            except Exception as err:
                pass

        return size

    def get_size_pie_chart(size):
        from api.helper import \
            convert_to_GB

        in_GB = convert_to_GB(size)
        chart_data = {
            'data': {
                'columns': [
                    ['Used (in GB)', in_GB],
                    ['Available (in GB)', 5 - in_GB],
                ],
                'type': 'pie',
            },
            # 'legend': {
            #     'position': 'right'
            # },
            'size': {
                'height': 225
            },
            'color': {
                "pattern": ['#0fc4b5', '#005662', '#148071', '#6cba86', '#bcf3a2']
            }
        }
        return chart_data

    def get_html_template():
        '''
        Maximum File Upload Limit: 5 GB
        Maximum Column Limit : 50
        :return:
        '''

        return """<p> Maximum File Upload Limit: <b>5 GB</b></p> <p>Maximum Column Limit : <b>50</b></p>"""

    used_data_size = get_total_size(user)

    # get recent activity
    def get_recent_activity():
        from auditlog.models import LogEntry
        logs = LogEntry.objects.filter(actor=user.id).order_by('-timestamp')[:30]
        # logCount = LogEntry.objects.exclude(change_message="No fields changed.").order_by('-action_time')[:20].count()

        recent_activity = []
        for obj in logs:
            log_user = str(obj.actor)
            log_changed_message = obj.changes.replace("\"", "").replace("{", "").replace("}", "").replace(": [","->[").replace(":", "").replace("\\","")
            log_content_type = obj.content_type.model
            if log_content_type == "insight":
                log_content_type = "signal"
            if log_content_type == "trainer":
                log_content_type = "model"
            if user.username==log_user:
                 # if obj.content_type.model!='user' and obj.content_type.model!='permission':
                changes_json = json.loads(obj.changes)
                choicesDict = dict(LogEntry.Action.choices)
                #check for status success to reduce update count
                if obj.action==1:
                    if "status" in changes_json:
                        if changes_json["status"][1]=="SUCCESS":
                            message_in_ui = log_content_type+" "+obj.object_repr.split(":")[0]+str(choicesDict[obj.action])+"d"
                            recent_activity.append(
                                        {"changes": str(log_changed_message),
                                         "action_time": obj.timestamp,
                                         "message_on_ui": message_in_ui,
                                         "action":choicesDict[obj.action],
                                         "content_type":log_content_type,
                                         "user": log_user})
                else:
                    message_in_ui = log_content_type + " " + obj.object_repr.split(":")[0] + str(
                        choicesDict[obj.action]) + "d"
                    recent_activity.append(
                        {"changes": str(log_changed_message),
                         "action_time": obj.timestamp,
                         "message_on_ui": message_in_ui,
                         "action": choicesDict[obj.action],
                         "content_type": log_content_type,
                         "user": log_user})

        return recent_activity

    return JsonResponse({
        'info': get_all_info_related_to_user(user),
        'used_size': convert_to_humanize(used_data_size),
        'chart_c3': get_size_pie_chart(used_data_size),
        'comment': get_html_template(),
        'recent_activity': get_recent_activity()
    })


dummy_robo_data = {
    "listOfNodes": [],
    "listOfCards": [
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<b>mAdvisor</b> has analysed your investment portfolio over the <b>last 6 months</b>. Please find the insights from our analysis in the next section."
                },
                {
                    "dataType": "html",
                    "data": "<div className='row xs-mt-50'><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>1.39M</span><br /><small>Total Net Investments</small></h2></div><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>1.48M</span><br /><small>Current Market Value</small></h2></div><div className='col-md-4 col-xs-12'><h2 className='text-center'><span>13.81%</span><br /><small>Compounded Annual Growth</small></h2></div></div>"
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Overview",
            "slug": "overview-b288eodae7"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>Portfolio snapshot</h4>"
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "pie": {
                                "label": {
                                    "format": None
                                }
                            },
                            "padding": {
                                "top": 40
                            },
                            "data": {
                                "x": None,
                                "type": "pie",
                                "columns": [
                                    [
                                        "Cash",
                                        7
                                    ],
                                    [
                                        "Debt",
                                        28
                                    ],
                                    [
                                        "Equity",
                                        65
                                    ]
                                ]
                            },
                            "legend": {
                                "show": True
                            },
                            "size": {
                                "height": 340
                            }
                        },
                        "table_c3": [
                            [
                                "Cash",
                                7
                            ],
                            [
                                "Debt",
                                28
                            ],
                            [
                                "Equity",
                                65
                            ]
                        ]
                    }
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "point": None,
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "padding": {
                                "top": 40
                            },
                            "grid": {
                                "y": {
                                    "show": True
                                },
                                "x": {
                                    "show": True
                                }
                            },
                            "subchart": None,
                            "data": {
                                "x": "name",
                                "axes": {
                                    "value": "y"
                                },
                                "type": "bar",
                                "columns": [
                                    [
                                        "name",
                                        "Liquid",
                                        "Large Cap",
                                        "Ultra Short Term",
                                        "Multi Cap"
                                    ],
                                    [
                                        "value",
                                        97235,
                                        406779,
                                        414203,
                                        565693
                                    ]
                                ]
                            },
                            "legend": {
                                "show": False
                            },
                            "size": {
                                "height": 340
                            },
                            "bar": {
                                "width": 40
                            },
                            "tooltip": {
                                "format": {
                                    "title": ".2s"
                                },
                                "show": True
                            },
                            "axis": {
                                "y": {
                                    "tick": {
                                        "count": 7,
                                        "multiline": True,
                                        "outer": False,
                                        "format": ".2s"
                                    },
                                    "label": {
                                        "text": "",
                                        "position": "outer-middle"
                                    }
                                },
                                "x": {
                                    "tick": {
                                        "rotate": -45,
                                        "multiline": False,
                                        "fit": False,
                                        "format": ".2s"
                                    },
                                    "type": "category",
                                    "label": {
                                        "text": "",
                                        "position": "outer-center"
                                    },
                                    "extent": None,
                                    "height": 90
                                }
                            }
                        },
                        "yformat": ".2s",
                        "table_c3": [
                            [
                                "name",
                                "Liquid",
                                "Large Cap",
                                "Ultra Short Term",
                                "Multi Cap"
                            ],
                            [
                                "value",
                                97235,
                                406779,
                                414203,
                                565693
                            ]
                        ],
                        "xdata": [
                            "Liquid",
                            "Large Cap",
                            "Ultra Short Term",
                            "Multi Cap"
                        ]
                    }
                },
                {
                    "dataType": "html",
                    "data": "The portfolio has a <b>very high exposure to equity</b>, as it has almost <b>two-thirds</b> 66.0% of the total investment.And it is diversified across <b>Large Cap</b> and <b>Multi Cap</b>, with INR 406779 and INR 565693 respectively."
                },
                {
                    "dataType": "html",
                    "data": "The portfolio has very <b>little</b> exposure to <b>debt</b> instruments.The debt portion of the portfolio accounts for about <b>28.0%</b> of the total investment.And, the entire debt portfolio is solely focused on <b>Ultra Short Term</b>"
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Portfolio Snapshot",
            "slug": "portfolio-snapshot-wg757ucj2s"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>How is your portfolio performing ?</h4>"
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "point": None,
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "padding": {
                                "top": 40
                            },
                            "grid": {
                                "y": {
                                    "show": True
                                },
                                "x": {
                                    "show": True
                                }
                            },
                            "subchart": {
                                "show": True
                            },
                            "data": {
                                "x": "date",
                                "axes": {
                                    "scaled_total": "y"
                                },
                                "type": "line",
                                "columns": [
                                    [
                                        "date",
                                        "2016-06-01",
                                        "2016-06-02",
                                        "2016-06-03",
                                        "2016-06-06",
                                        "2016-06-07",
                                        "2016-06-08",
                                        "2016-06-09",
                                        "2016-06-13",
                                        "2016-06-14",
                                        "2016-06-15",
                                        "2016-06-16",
                                        "2016-06-17",
                                        "2016-06-20",
                                        "2016-06-21",
                                        "2016-06-22",
                                        "2016-06-23",
                                        "2016-06-24",
                                        "2016-06-27",
                                        "2016-06-28",
                                        "2016-06-29",
                                        "2016-06-30",
                                        "2016-07-01",
                                        "2016-07-04",
                                        "2016-07-05",
                                        "2016-07-07",
                                        "2016-07-08",
                                        "2016-07-11",
                                        "2016-07-12",
                                        "2016-07-13",
                                        "2016-07-14",
                                        "2016-07-15",
                                        "2016-07-18",
                                        "2016-07-19",
                                        "2016-07-20",
                                        "2016-07-21",
                                        "2016-07-22",
                                        "2016-07-25",
                                        "2016-07-26",
                                        "2016-07-27",
                                        "2016-07-28",
                                        "2016-07-29",
                                        "2016-08-01",
                                        "2016-08-03",
                                        "2016-08-04",
                                        "2016-08-05",
                                        "2016-08-08",
                                        "2016-08-09",
                                        "2016-08-10",
                                        "2016-08-11",
                                        "2016-08-12",
                                        "2016-08-16",
                                        "2016-08-17",
                                        "2016-08-18",
                                        "2016-08-19",
                                        "2016-08-22",
                                        "2016-08-23",
                                        "2016-08-24",
                                        "2016-08-25",
                                        "2016-08-30",
                                        "2016-08-31",
                                        "2016-09-01",
                                        "2016-09-02",
                                        "2016-09-06",
                                        "2016-09-07",
                                        "2016-09-08",
                                        "2016-09-09",
                                        "2016-09-12",
                                        "2016-09-16",
                                        "2016-09-19",
                                        "2016-09-20",
                                        "2016-09-21",
                                        "2016-09-22",
                                        "2016-09-23",
                                        "2016-09-26",
                                        "2016-09-27",
                                        "2016-09-28",
                                        "2016-09-30",
                                        "2016-10-03",
                                        "2016-10-04",
                                        "2016-10-05",
                                        "2016-10-06",
                                        "2016-10-07",
                                        "2016-10-10",
                                        "2016-10-13",
                                        "2016-10-14",
                                        "2016-10-19",
                                        "2016-10-20",
                                        "2016-10-21",
                                        "2016-10-24",
                                        "2016-10-25",
                                        "2016-10-26",
                                        "2016-10-27",
                                        "2016-10-28",
                                        "2016-11-01",
                                        "2016-11-02",
                                        "2016-11-03",
                                        "2016-11-04",
                                        "2016-11-07",
                                        "2016-11-08",
                                        "2016-11-09",
                                        "2016-11-10",
                                        "2016-11-11",
                                        "2016-11-17",
                                        "2016-11-18",
                                        "2016-11-23",
                                        "2016-11-24",
                                        "2016-11-25",
                                        "2016-11-28",
                                        "2016-11-29"
                                    ],
                                    [
                                        "scaled_total",
                                        100,
                                        100.75,
                                        101.63,
                                        102.14,
                                        102.6,
                                        102.22,
                                        102.34,
                                        102.08,
                                        103.8,
                                        104.44,
                                        104.44,
                                        104.89,
                                        104.52,
                                        104.23,
                                        104.39,
                                        104.86,
                                        104.16,
                                        104.49,
                                        105.5,
                                        105.08,
                                        105.26,
                                        105.9,
                                        105.37,
                                        105.22,
                                        105.14,
                                        104.16,
                                        104.23,
                                        105.49,
                                        105.85,
                                        105.54,
                                        104.48,
                                        104.77,
                                        105.79,
                                        105.48,
                                        105.27,
                                        105.68,
                                        105.51,
                                        105.2,
                                        105.24,
                                        105.49,
                                        104.72,
                                        104.53,
                                        104.94,
                                        106.47,
                                        106.84,
                                        106.76,
                                        107.14,
                                        108.67,
                                        108.48,
                                        108.9,
                                        108.04,
                                        106.51,
                                        106.59,
                                        106.74,
                                        107.4,
                                        107.53,
                                        107.17,
                                        107.13,
                                        108.05,
                                        107.69,
                                        106.39,
                                        106.14,
                                        106.36,
                                        104.77,
                                        104.89,
                                        106.21,
                                        106.52,
                                        106.13,
                                        105.73,
                                        105.58,
                                        105.63,
                                        104.15,
                                        104.24,
                                        103.77,
                                        105.57,
                                        105.34,
                                        105.83,
                                        105.65,
                                        105.99,
                                        105.69,
                                        104.81,
                                        105.1,
                                        105.19,
                                        104.98,
                                        103.78,
                                        103.45,
                                        102.91,
                                        103.54,
                                        103.99,
                                        102.81,
                                        103.72,
                                        101.29,
                                        99.53,
                                        99.52,
                                        99.27,
                                        99.03,
                                        97.68,
                                        98.34,
                                        98.63,
                                        97.94,
                                        99.49,
                                        99.6,
                                        99.76,
                                        100.64,
                                        100.35,
                                        99.22,
                                        99.65,
                                        99.81,
                                        99.25
                                    ],
                                    [
                                        "sensex",
                                        100,
                                        100.81,
                                        101.79,
                                        102.34,
                                        102.84,
                                        102.42,
                                        102.55,
                                        102.27,
                                        104.16,
                                        104.84,
                                        104.87,
                                        105.34,
                                        104.95,
                                        104.61,
                                        104.76,
                                        105.25,
                                        104.47,
                                        104.82,
                                        105.92,
                                        105.47,
                                        105.65,
                                        106.35,
                                        105.76,
                                        105.57,
                                        105.49,
                                        104.42,
                                        104.49,
                                        105.86,
                                        106.25,
                                        105.88,
                                        104.71,
                                        105.03,
                                        106.14,
                                        105.81,
                                        105.58,
                                        106.03,
                                        105.85,
                                        105.51,
                                        105.53,
                                        105.79,
                                        104.94,
                                        104.74,
                                        105.2,
                                        106.86,
                                        107.27,
                                        107.16,
                                        107.57,
                                        109.25,
                                        109.05,
                                        109.5,
                                        108.57,
                                        106.9,
                                        106.97,
                                        107.12,
                                        107.82,
                                        107.95,
                                        107.53,
                                        107.48,
                                        108.48,
                                        108.08,
                                        106.67,
                                        106.41,
                                        106.67,
                                        104.91,
                                        105.06,
                                        106.48,
                                        106.82,
                                        106.4,
                                        105.96,
                                        105.79,
                                        105.87,
                                        104.22,
                                        104.33,
                                        103.79,
                                        105.75,
                                        105.5,
                                        106.05,
                                        105.85,
                                        106.24,
                                        105.91,
                                        104.95,
                                        105.25,
                                        105.34,
                                        105.1,
                                        103.78,
                                        103.41,
                                        102.83,
                                        103.52,
                                        104.02,
                                        102.74,
                                        103.74,
                                        101.11,
                                        99.17,
                                        99.15,
                                        98.88,
                                        98.59,
                                        97.14,
                                        97.87,
                                        98.22,
                                        97.5,
                                        99.21,
                                        99.34,
                                        99.51,
                                        100.48,
                                        100.13,
                                        98.89,
                                        99.34,
                                        99.5,
                                        98.92
                                    ]
                                ]
                            },
                            "legend": {
                                "show": True
                            },
                            "size": {
                                "height": 490
                            },
                            "bar": {
                                "width": {
                                    "ratio": 0.5
                                }
                            },
                            "tooltip": {
                                "format": {
                                    "title": ".2s"
                                },
                                "show": True
                            },
                            "axis": {
                                "y": {
                                    "tick": {
                                        "count": 7,
                                        "multiline": True,
                                        "outer": False,
                                        "format": ".2s"
                                    },
                                    "label": {
                                        "text": "",
                                        "position": "outer-middle"
                                    }
                                },
                                "x": {
                                    "tick": {
                                        "rotate": -45,
                                        "multiline": False,
                                        "fit": False,
                                        "format": ".2s"
                                    },
                                    "type": "category",
                                    "label": {
                                        "text": "",
                                        "position": "outer-center"
                                    },
                                    "extent": [
                                        0,
                                        10
                                    ],
                                    "height": 90
                                }
                            }
                        },
                        "yformat": ".2s",
                        "table_c3": [
                            [
                                "date",
                                "2016-06-01",
                                "2016-06-02",
                                "2016-06-03",
                                "2016-06-06",
                                "2016-06-07",
                                "2016-06-08",
                                "2016-06-09",
                                "2016-06-13",
                                "2016-06-14",
                                "2016-06-15",
                                "2016-06-16",
                                "2016-06-17",
                                "2016-06-20",
                                "2016-06-21",
                                "2016-06-22",
                                "2016-06-23",
                                "2016-06-24",
                                "2016-06-27",
                                "2016-06-28",
                                "2016-06-29",
                                "2016-06-30",
                                "2016-07-01",
                                "2016-07-04",
                                "2016-07-05",
                                "2016-07-07",
                                "2016-07-08",
                                "2016-07-11",
                                "2016-07-12",
                                "2016-07-13",
                                "2016-07-14",
                                "2016-07-15",
                                "2016-07-18",
                                "2016-07-19",
                                "2016-07-20",
                                "2016-07-21",
                                "2016-07-22",
                                "2016-07-25",
                                "2016-07-26",
                                "2016-07-27",
                                "2016-07-28",
                                "2016-07-29",
                                "2016-08-01",
                                "2016-08-03",
                                "2016-08-04",
                                "2016-08-05",
                                "2016-08-08",
                                "2016-08-09",
                                "2016-08-10",
                                "2016-08-11",
                                "2016-08-12",
                                "2016-08-16",
                                "2016-08-17",
                                "2016-08-18",
                                "2016-08-19",
                                "2016-08-22",
                                "2016-08-23",
                                "2016-08-24",
                                "2016-08-25",
                                "2016-08-30",
                                "2016-08-31",
                                "2016-09-01",
                                "2016-09-02",
                                "2016-09-06",
                                "2016-09-07",
                                "2016-09-08",
                                "2016-09-09",
                                "2016-09-12",
                                "2016-09-16",
                                "2016-09-19",
                                "2016-09-20",
                                "2016-09-21",
                                "2016-09-22",
                                "2016-09-23",
                                "2016-09-26",
                                "2016-09-27",
                                "2016-09-28",
                                "2016-09-30",
                                "2016-10-03",
                                "2016-10-04",
                                "2016-10-05",
                                "2016-10-06",
                                "2016-10-07",
                                "2016-10-10",
                                "2016-10-13",
                                "2016-10-14",
                                "2016-10-19",
                                "2016-10-20",
                                "2016-10-21",
                                "2016-10-24",
                                "2016-10-25",
                                "2016-10-26",
                                "2016-10-27",
                                "2016-10-28",
                                "2016-11-01",
                                "2016-11-02",
                                "2016-11-03",
                                "2016-11-04",
                                "2016-11-07",
                                "2016-11-08",
                                "2016-11-09",
                                "2016-11-10",
                                "2016-11-11",
                                "2016-11-17",
                                "2016-11-18",
                                "2016-11-23",
                                "2016-11-24",
                                "2016-11-25",
                                "2016-11-28",
                                "2016-11-29"
                            ],
                            [
                                "scaled_total",
                                100,
                                100.75,
                                101.63,
                                102.14,
                                102.6,
                                102.22,
                                102.34,
                                102.08,
                                103.8,
                                104.44,
                                104.44,
                                104.89,
                                104.52,
                                104.23,
                                104.39,
                                104.86,
                                104.16,
                                104.49,
                                105.5,
                                105.08,
                                105.26,
                                105.9,
                                105.37,
                                105.22,
                                105.14,
                                104.16,
                                104.23,
                                105.49,
                                105.85,
                                105.54,
                                104.48,
                                104.77,
                                105.79,
                                105.48,
                                105.27,
                                105.68,
                                105.51,
                                105.2,
                                105.24,
                                105.49,
                                104.72,
                                104.53,
                                104.94,
                                106.47,
                                106.84,
                                106.76,
                                107.14,
                                108.67,
                                108.48,
                                108.9,
                                108.04,
                                106.51,
                                106.59,
                                106.74,
                                107.4,
                                107.53,
                                107.17,
                                107.13,
                                108.05,
                                107.69,
                                106.39,
                                106.14,
                                106.36,
                                104.77,
                                104.89,
                                106.21,
                                106.52,
                                106.13,
                                105.73,
                                105.58,
                                105.63,
                                104.15,
                                104.24,
                                103.77,
                                105.57,
                                105.34,
                                105.83,
                                105.65,
                                105.99,
                                105.69,
                                104.81,
                                105.1,
                                105.19,
                                104.98,
                                103.78,
                                103.45,
                                102.91,
                                103.54,
                                103.99,
                                102.81,
                                103.72,
                                101.29,
                                99.53,
                                99.52,
                                99.27,
                                99.03,
                                97.68,
                                98.34,
                                98.63,
                                97.94,
                                99.49,
                                99.6,
                                99.76,
                                100.64,
                                100.35,
                                99.22,
                                99.65,
                                99.81,
                                99.25
                            ],
                            [
                                "sensex",
                                100,
                                100.81,
                                101.79,
                                102.34,
                                102.84,
                                102.42,
                                102.55,
                                102.27,
                                104.16,
                                104.84,
                                104.87,
                                105.34,
                                104.95,
                                104.61,
                                104.76,
                                105.25,
                                104.47,
                                104.82,
                                105.92,
                                105.47,
                                105.65,
                                106.35,
                                105.76,
                                105.57,
                                105.49,
                                104.42,
                                104.49,
                                105.86,
                                106.25,
                                105.88,
                                104.71,
                                105.03,
                                106.14,
                                105.81,
                                105.58,
                                106.03,
                                105.85,
                                105.51,
                                105.53,
                                105.79,
                                104.94,
                                104.74,
                                105.2,
                                106.86,
                                107.27,
                                107.16,
                                107.57,
                                109.25,
                                109.05,
                                109.5,
                                108.57,
                                106.9,
                                106.97,
                                107.12,
                                107.82,
                                107.95,
                                107.53,
                                107.48,
                                108.48,
                                108.08,
                                106.67,
                                106.41,
                                106.67,
                                104.91,
                                105.06,
                                106.48,
                                106.82,
                                106.4,
                                105.96,
                                105.79,
                                105.87,
                                104.22,
                                104.33,
                                103.79,
                                105.75,
                                105.5,
                                106.05,
                                105.85,
                                106.24,
                                105.91,
                                104.95,
                                105.25,
                                105.34,
                                105.1,
                                103.78,
                                103.41,
                                102.83,
                                103.52,
                                104.02,
                                102.74,
                                103.74,
                                101.11,
                                99.17,
                                99.15,
                                98.88,
                                98.59,
                                97.14,
                                97.87,
                                98.22,
                                97.5,
                                99.21,
                                99.34,
                                99.51,
                                100.48,
                                100.13,
                                98.89,
                                99.34,
                                99.5,
                                98.92
                            ]
                        ],
                        "xdata": [
                            "2016-06-01",
                            "2016-06-02",
                            "2016-06-03",
                            "2016-06-06",
                            "2016-06-07",
                            "2016-06-08",
                            "2016-06-09",
                            "2016-06-13",
                            "2016-06-14",
                            "2016-06-15",
                            "2016-06-16",
                            "2016-06-17",
                            "2016-06-20",
                            "2016-06-21",
                            "2016-06-22",
                            "2016-06-23",
                            "2016-06-24",
                            "2016-06-27",
                            "2016-06-28",
                            "2016-06-29",
                            "2016-06-30",
                            "2016-07-01",
                            "2016-07-04",
                            "2016-07-05",
                            "2016-07-07",
                            "2016-07-08",
                            "2016-07-11",
                            "2016-07-12",
                            "2016-07-13",
                            "2016-07-14",
                            "2016-07-15",
                            "2016-07-18",
                            "2016-07-19",
                            "2016-07-20",
                            "2016-07-21",
                            "2016-07-22",
                            "2016-07-25",
                            "2016-07-26",
                            "2016-07-27",
                            "2016-07-28",
                            "2016-07-29",
                            "2016-08-01",
                            "2016-08-03",
                            "2016-08-04",
                            "2016-08-05",
                            "2016-08-08",
                            "2016-08-09",
                            "2016-08-10",
                            "2016-08-11",
                            "2016-08-12",
                            "2016-08-16",
                            "2016-08-17",
                            "2016-08-18",
                            "2016-08-19",
                            "2016-08-22",
                            "2016-08-23",
                            "2016-08-24",
                            "2016-08-25",
                            "2016-08-30",
                            "2016-08-31",
                            "2016-09-01",
                            "2016-09-02",
                            "2016-09-06",
                            "2016-09-07",
                            "2016-09-08",
                            "2016-09-09",
                            "2016-09-12",
                            "2016-09-16",
                            "2016-09-19",
                            "2016-09-20",
                            "2016-09-21",
                            "2016-09-22",
                            "2016-09-23",
                            "2016-09-26",
                            "2016-09-27",
                            "2016-09-28",
                            "2016-09-30",
                            "2016-10-03",
                            "2016-10-04",
                            "2016-10-05",
                            "2016-10-06",
                            "2016-10-07",
                            "2016-10-10",
                            "2016-10-13",
                            "2016-10-14",
                            "2016-10-19",
                            "2016-10-20",
                            "2016-10-21",
                            "2016-10-24",
                            "2016-10-25",
                            "2016-10-26",
                            "2016-10-27",
                            "2016-10-28",
                            "2016-11-01",
                            "2016-11-02",
                            "2016-11-03",
                            "2016-11-04",
                            "2016-11-07",
                            "2016-11-08",
                            "2016-11-09",
                            "2016-11-10",
                            "2016-11-11",
                            "2016-11-17",
                            "2016-11-18",
                            "2016-11-23",
                            "2016-11-24",
                            "2016-11-25",
                            "2016-11-28",
                            "2016-11-29"
                        ]
                    }
                },
                {
                    "dataType": "html",
                    "data": "The portfolio, with the <b>total investment</b> of INR <b>1388090</b>, is now worth INR <b>1483910</b> This indicates a <b>moderate growth</b> of <b>1.07%</b> over the last 6 months. "
                },
                {
                    "dataType": "html",
                    "data": "The portfolio <b>shrunk significantly</b> between <b>Sep and Nov</b>, and remained <b>relatively flat</b> since then. It has <b>outperformed</b> the benchmark index sensex, with most of the gain made during Jun and Aug. "
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Portfolio Performance",
            "slug": "portfolio-performance-a7twt6s2pk"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>What is driving your protfolio growth ?</h4>"
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "point": None,
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "padding": {
                                "top": 40
                            },
                            "grid": {
                                "y": {
                                    "show": True
                                },
                                "x": {
                                    "show": True
                                }
                            },
                            "subchart": None,
                            "data": {
                                "x": "date",
                                "axes": {
                                    "IDFC - Cash Fund Reg (G)": "y"
                                },
                                "type": "line",
                                "columns": [
                                    [
                                        "IDFC - Cash Fund Reg (G)",
                                        100,
                                        100.02,
                                        100.04,
                                        100.06,
                                        100.08,
                                        100.14,
                                        100.16,
                                        100.18,
                                        100.2,
                                        100.22,
                                        100.28,
                                        100.3,
                                        100.32,
                                        100.35,
                                        100.37,
                                        100.43,
                                        100.45,
                                        100.49,
                                        100.51,
                                        100.57,
                                        100.59,
                                        100.61,
                                        100.63,
                                        100.65,
                                        100.71,
                                        100.73,
                                        100.75,
                                        100.77,
                                        100.79,
                                        100.85,
                                        100.87,
                                        100.89,
                                        100.9,
                                        100.93,
                                        100.99,
                                        101.02,
                                        101.04,
                                        101.06,
                                        101.12,
                                        101.14,
                                        101.16,
                                        101.18,
                                        101.2,
                                        101.27,
                                        101.3,
                                        101.31,
                                        101.33,
                                        101.39,
                                        101.41,
                                        101.43,
                                        101.45,
                                        101.54,
                                        101.56,
                                        101.6,
                                        101.68,
                                        101.69,
                                        101.71,
                                        101.73,
                                        101.79,
                                        101.86,
                                        101.92,
                                        101.94,
                                        101.95,
                                        101.98,
                                        101.99,
                                        102.05,
                                        102.07,
                                        102.09,
                                        102.1,
                                        102.13,
                                        102.18,
                                        102.21,
                                        102.23,
                                        102.24,
                                        102.26,
                                        102.32,
                                        102.37,
                                        102.39,
                                        102.48,
                                        102.5,
                                        102.52,
                                        102.57,
                                        102.6,
                                        102.61,
                                        102.63,
                                        102.65,
                                        102.72,
                                        102.75,
                                        102.76,
                                        102.78,
                                        102.84,
                                        102.86,
                                        102.88,
                                        102.9,
                                        102.92,
                                        103,
                                        103.01,
                                        103.04,
                                        103.06,
                                        103.11,
                                        103.13,
                                        103.15,
                                        103.18,
                                        103.19,
                                        103.24,
                                        103.26,
                                        103.28,
                                        103.3,
                                        103.31
                                    ],
                                    [
                                        "S&P BSE Sensex 30",
                                        100,
                                        100.81,
                                        101.79,
                                        102.34,
                                        102.84,
                                        102.42,
                                        102.55,
                                        102.27,
                                        104.16,
                                        104.84,
                                        104.87,
                                        105.34,
                                        104.95,
                                        104.61,
                                        104.76,
                                        105.25,
                                        104.47,
                                        104.82,
                                        105.92,
                                        105.47,
                                        105.65,
                                        106.35,
                                        105.76,
                                        105.57,
                                        105.49,
                                        104.42,
                                        104.49,
                                        105.86,
                                        106.25,
                                        105.88,
                                        104.71,
                                        105.03,
                                        106.14,
                                        105.81,
                                        105.58,
                                        106.03,
                                        105.85,
                                        105.51,
                                        105.53,
                                        105.79,
                                        104.94,
                                        104.74,
                                        105.2,
                                        106.86,
                                        107.27,
                                        107.16,
                                        107.57,
                                        109.25,
                                        109.05,
                                        109.5,
                                        108.57,
                                        106.9,
                                        106.97,
                                        107.12,
                                        107.82,
                                        107.95,
                                        107.53,
                                        107.48,
                                        108.48,
                                        108.08,
                                        106.67,
                                        106.41,
                                        106.67,
                                        104.91,
                                        105.06,
                                        106.48,
                                        106.82,
                                        106.4,
                                        105.96,
                                        105.79,
                                        105.87,
                                        104.22,
                                        104.33,
                                        103.79,
                                        105.75,
                                        105.5,
                                        106.05,
                                        105.85,
                                        106.24,
                                        105.91,
                                        104.95,
                                        105.25,
                                        105.34,
                                        105.1,
                                        103.78,
                                        103.41,
                                        102.83,
                                        103.52,
                                        104.02,
                                        102.74,
                                        103.74,
                                        101.11,
                                        99.17,
                                        99.15,
                                        98.88,
                                        98.59,
                                        97.14,
                                        97.87,
                                        98.22,
                                        97.5,
                                        99.21,
                                        99.34,
                                        99.51,
                                        100.48,
                                        100.13,
                                        98.89,
                                        99.34,
                                        99.5,
                                        98.92
                                    ],
                                    [
                                        "Franklin - India Bluechip Fund (G)",
                                        100,
                                        99.1,
                                        99.02,
                                        100.11,
                                        99.34,
                                        99.64,
                                        100.38,
                                        100.33,
                                        100.36,
                                        101.23,
                                        99.53,
                                        99.48,
                                        99.56,
                                        100.49,
                                        101.78,
                                        102.46,
                                        102.98,
                                        102.52,
                                        102.46,
                                        102.38,
                                        104.05,
                                        104.6,
                                        104.4,
                                        105.01,
                                        104.98,
                                        104.51,
                                        104.68,
                                        105.23,
                                        104.98,
                                        105.14,
                                        106.13,
                                        105.66,
                                        105.69,
                                        105.94,
                                        105.53,
                                        105.34,
                                        104.65,
                                        104.9,
                                        106.65,
                                        106.98,
                                        106.59,
                                        105.14,
                                        105.06,
                                        105.64,
                                        105.39,
                                        105.44,
                                        106.29,
                                        106.35,
                                        105.85,
                                        105.99,
                                        106.1,
                                        105.58,
                                        106.84,
                                        107.41,
                                        106.98,
                                        107.41,
                                        108.97,
                                        108.78,
                                        109.06,
                                        108.15,
                                        106.29,
                                        106.65,
                                        107.09,
                                        106.79,
                                        106.65,
                                        107.69,
                                        107.39,
                                        106.35,
                                        106.1,
                                        106.7,
                                        104.79,
                                        105.42,
                                        106.4,
                                        107.09,
                                        106.84,
                                        106.54,
                                        106.51,
                                        106.48,
                                        105.14,
                                        105.55,
                                        106.13,
                                        106.51,
                                        106.7,
                                        106.79,
                                        106.84,
                                        106.02,
                                        105.61,
                                        106.1,
                                        105.91,
                                        104.49,
                                        104.02,
                                        103.26,
                                        104.02,
                                        104.79,
                                        104.16,
                                        105.55,
                                        102.98,
                                        100.88,
                                        100.47,
                                        100.71,
                                        98.74,
                                        99.48,
                                        99.75,
                                        99.04,
                                        100.49,
                                        100.66,
                                        101.07,
                                        102,
                                        101.34
                                    ],
                                    [
                                        "Birla SL - Frontline Equity Fund Reg (G)",
                                        100,
                                        100.12,
                                        99.59,
                                        98.67,
                                        98.78,
                                        99.88,
                                        99.13,
                                        99.36,
                                        100,
                                        99.83,
                                        99.71,
                                        100.46,
                                        98.43,
                                        98.72,
                                        99.07,
                                        100.12,
                                        101.33,
                                        102.15,
                                        102.73,
                                        102.26,
                                        102.09,
                                        102.03,
                                        103.54,
                                        104.12,
                                        103.89,
                                        104.41,
                                        104.35,
                                        104,
                                        104.18,
                                        105.05,
                                        104.47,
                                        104.99,
                                        106.21,
                                        105.86,
                                        106.27,
                                        106.91,
                                        107.02,
                                        107.25,
                                        106.09,
                                        106.44,
                                        108.01,
                                        108.82,
                                        108.36,
                                        107.02,
                                        106.91,
                                        107.78,
                                        107.6,
                                        107.54,
                                        108.24,
                                        108.36,
                                        107.89,
                                        107.66,
                                        108.13,
                                        107.54,
                                        109.23,
                                        109.87,
                                        109.81,
                                        110.21,
                                        111.78,
                                        111.67,
                                        112.07,
                                        111.26,
                                        109.29,
                                        109.92,
                                        110.16,
                                        109.92,
                                        109.92,
                                        111.14,
                                        110.8,
                                        109.81,
                                        109.75,
                                        110.16,
                                        107.78,
                                        108.65,
                                        110.45,
                                        110.8,
                                        110.74,
                                        110.39,
                                        110.45,
                                        110.45,
                                        108.88,
                                        109.23,
                                        109.92,
                                        110.27,
                                        110.45,
                                        110.74,
                                        110.68,
                                        109.69,
                                        109.17,
                                        109.87,
                                        109.75,
                                        108.18,
                                        107.54,
                                        106.67,
                                        107.78,
                                        108.13,
                                        106.67,
                                        108.13,
                                        105.11,
                                        101.97,
                                        101.86,
                                        100.87,
                                        101.33,
                                        100.35,
                                        101.97,
                                        102.09,
                                        103.42,
                                        102.84,
                                        101.57
                                    ],
                                    [
                                        "IDFC - Premier Equity Fund Reg (G)",
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        104.38,
                                        105.05,
                                        102.12,
                                        97.74,
                                        98.01,
                                        96.55,
                                        97.08,
                                        96.68,
                                        97.48,
                                        98.01,
                                        98.94,
                                        100,
                                        97.61
                                    ],
                                    [
                                        "date",
                                        "2016-06-01",
                                        "2016-06-02",
                                        "2016-06-03",
                                        "2016-06-06",
                                        "2016-06-07",
                                        "2016-06-08",
                                        "2016-06-09",
                                        "2016-06-13",
                                        "2016-06-14",
                                        "2016-06-15",
                                        "2016-06-16",
                                        "2016-06-17",
                                        "2016-06-20",
                                        "2016-06-21",
                                        "2016-06-22",
                                        "2016-06-23",
                                        "2016-06-24",
                                        "2016-06-27",
                                        "2016-06-28",
                                        "2016-06-29",
                                        "2016-06-30",
                                        "2016-07-01",
                                        "2016-07-04",
                                        "2016-07-05",
                                        "2016-07-07",
                                        "2016-07-08",
                                        "2016-07-11",
                                        "2016-07-12",
                                        "2016-07-13",
                                        "2016-07-14",
                                        "2016-07-15",
                                        "2016-07-18",
                                        "2016-07-19",
                                        "2016-07-20",
                                        "2016-07-21",
                                        "2016-07-22",
                                        "2016-07-25",
                                        "2016-07-26",
                                        "2016-07-27",
                                        "2016-07-28",
                                        "2016-07-29",
                                        "2016-08-01",
                                        "2016-08-03",
                                        "2016-08-04",
                                        "2016-08-05",
                                        "2016-08-08",
                                        "2016-08-09",
                                        "2016-08-10",
                                        "2016-08-11",
                                        "2016-08-12",
                                        "2016-08-16",
                                        "2016-08-17",
                                        "2016-08-18",
                                        "2016-08-19",
                                        "2016-08-22",
                                        "2016-08-23",
                                        "2016-08-24",
                                        "2016-08-25",
                                        "2016-08-30",
                                        "2016-08-31",
                                        "2016-09-01",
                                        "2016-09-02",
                                        "2016-09-06",
                                        "2016-09-07",
                                        "2016-09-08",
                                        "2016-09-09",
                                        "2016-09-12",
                                        "2016-09-16",
                                        "2016-09-19",
                                        "2016-09-20",
                                        "2016-09-21",
                                        "2016-09-22",
                                        "2016-09-23",
                                        "2016-09-26",
                                        "2016-09-27",
                                        "2016-09-28",
                                        "2016-09-30",
                                        "2016-10-03",
                                        "2016-10-04",
                                        "2016-10-05",
                                        "2016-10-06",
                                        "2016-10-07",
                                        "2016-10-10",
                                        "2016-10-13",
                                        "2016-10-14",
                                        "2016-10-19",
                                        "2016-10-20",
                                        "2016-10-21",
                                        "2016-10-24",
                                        "2016-10-25",
                                        "2016-10-26",
                                        "2016-10-27",
                                        "2016-10-28",
                                        "2016-11-01",
                                        "2016-11-02",
                                        "2016-11-03",
                                        "2016-11-04",
                                        "2016-11-07",
                                        "2016-11-08",
                                        "2016-11-09",
                                        "2016-11-10",
                                        "2016-11-11",
                                        "2016-11-17",
                                        "2016-11-18",
                                        "2016-11-23",
                                        "2016-11-24",
                                        "2016-11-25",
                                        "2016-11-28",
                                        "2016-11-29"
                                    ],
                                    [
                                        "Franklin - India High Growth Companies Fund (G)",
                                        100,
                                        100.69,
                                        100.34,
                                        100.34,
                                        101.72,
                                        102.07,
                                        101.72,
                                        99.66,
                                        100,
                                        101.38,
                                        100.69,
                                        101.38,
                                        101.72,
                                        101.72,
                                        101.38,
                                        102.41,
                                        100.34,
                                        101.03,
                                        101.03,
                                        102.07,
                                        103.45,
                                        104.14,
                                        105.17,
                                        104.83,
                                        104.48,
                                        103.79,
                                        105.52,
                                        106.55,
                                        106.21,
                                        107.24,
                                        107.59,
                                        106.9,
                                        107.24,
                                        107.24,
                                        106.55,
                                        106.9,
                                        107.93,
                                        107.59,
                                        107.93,
                                        107.93,
                                        107.24,
                                        106.9,
                                        105.86,
                                        105.86,
                                        107.93,
                                        107.93,
                                        107.93,
                                        106.21,
                                        106.21,
                                        107.24,
                                        107.59,
                                        107.93,
                                        108.97,
                                        109.66,
                                        108.97,
                                        109.31,
                                        109.31,
                                        108.62,
                                        110,
                                        110.34,
                                        110,
                                        110.69,
                                        112.76,
                                        113.1,
                                        113.1,
                                        112.07,
                                        109.66,
                                        111.03,
                                        111.38,
                                        110.69,
                                        110.34,
                                        111.72,
                                        111.38,
                                        110,
                                        109.66,
                                        110.69,
                                        109.31,
                                        110.69,
                                        111.72,
                                        111.72,
                                        111.38,
                                        111.38,
                                        111.03,
                                        108.97,
                                        109.66,
                                        111.03,
                                        112.41,
                                        112.41,
                                        112.76,
                                        113.45,
                                        111.72,
                                        111.72,
                                        112.07,
                                        112.07,
                                        110.34,
                                        109.31,
                                        108.62,
                                        110,
                                        111.03,
                                        109.66,
                                        112.07,
                                        108.97,
                                        106.21,
                                        106.55,
                                        105.17,
                                        104.48,
                                        105.52,
                                        105.52,
                                        106.21
                                    ],
                                    [
                                        "Franklin - India Ultra Short Bond Super Ins (G)",
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.48,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        100.97,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.45,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        101.93,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.42,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        102.9,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.38,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        103.86,
                                        104.35,
                                        104.35,
                                        104.35,
                                        104.35,
                                        104.35,
                                        104.35,
                                        104.83,
                                        104.83,
                                        104.83,
                                        104.83,
                                        104.83,
                                        104.83,
                                        104.83,
                                        104.83
                                    ]
                                ]
                            },
                            "legend": {
                                "show": True
                            },
                            "size": {
                                "height": 340
                            },
                            "bar": {
                                "width": {
                                    "ratio": 0.5
                                }
                            },
                            "tooltip": {
                                "format": {
                                    "title": ".2s"
                                },
                                "show": True
                            },
                            "axis": {
                                "y": {
                                    "tick": {
                                        "count": 7,
                                        "multiline": True,
                                        "outer": False,
                                        "format": ".2s"
                                    },
                                    "label": {
                                        "text": "",
                                        "position": "outer-middle"
                                    }
                                },
                                "x": {
                                    "tick": {
                                        "rotate": -45,
                                        "multiline": False,
                                        "fit": False,
                                        "format": ".2s"
                                    },
                                    "type": "category",
                                    "label": {
                                        "text": "",
                                        "position": "outer-center"
                                    },
                                    "extent": None,
                                    "height": 90
                                }
                            }
                        },
                        "yformat": ".2s",
                        "table_c3": [
                            [
                                "IDFC - Cash Fund Reg (G)",
                                100,
                                100.02,
                                100.04,
                                100.06,
                                100.08,
                                100.14,
                                100.16,
                                100.18,
                                100.2,
                                100.22,
                                100.28,
                                100.3,
                                100.32,
                                100.35,
                                100.37,
                                100.43,
                                100.45,
                                100.49,
                                100.51,
                                100.57,
                                100.59,
                                100.61,
                                100.63,
                                100.65,
                                100.71,
                                100.73,
                                100.75,
                                100.77,
                                100.79,
                                100.85,
                                100.87,
                                100.89,
                                100.9,
                                100.93,
                                100.99,
                                101.02,
                                101.04,
                                101.06,
                                101.12,
                                101.14,
                                101.16,
                                101.18,
                                101.2,
                                101.27,
                                101.3,
                                101.31,
                                101.33,
                                101.39,
                                101.41,
                                101.43,
                                101.45,
                                101.54,
                                101.56,
                                101.6,
                                101.68,
                                101.69,
                                101.71,
                                101.73,
                                101.79,
                                101.86,
                                101.92,
                                101.94,
                                101.95,
                                101.98,
                                101.99,
                                102.05,
                                102.07,
                                102.09,
                                102.1,
                                102.13,
                                102.18,
                                102.21,
                                102.23,
                                102.24,
                                102.26,
                                102.32,
                                102.37,
                                102.39,
                                102.48,
                                102.5,
                                102.52,
                                102.57,
                                102.6,
                                102.61,
                                102.63,
                                102.65,
                                102.72,
                                102.75,
                                102.76,
                                102.78,
                                102.84,
                                102.86,
                                102.88,
                                102.9,
                                102.92,
                                103,
                                103.01,
                                103.04,
                                103.06,
                                103.11,
                                103.13,
                                103.15,
                                103.18,
                                103.19,
                                103.24,
                                103.26,
                                103.28,
                                103.3,
                                103.31
                            ],
                            [
                                "S&P BSE Sensex 30",
                                100,
                                100.81,
                                101.79,
                                102.34,
                                102.84,
                                102.42,
                                102.55,
                                102.27,
                                104.16,
                                104.84,
                                104.87,
                                105.34,
                                104.95,
                                104.61,
                                104.76,
                                105.25,
                                104.47,
                                104.82,
                                105.92,
                                105.47,
                                105.65,
                                106.35,
                                105.76,
                                105.57,
                                105.49,
                                104.42,
                                104.49,
                                105.86,
                                106.25,
                                105.88,
                                104.71,
                                105.03,
                                106.14,
                                105.81,
                                105.58,
                                106.03,
                                105.85,
                                105.51,
                                105.53,
                                105.79,
                                104.94,
                                104.74,
                                105.2,
                                106.86,
                                107.27,
                                107.16,
                                107.57,
                                109.25,
                                109.05,
                                109.5,
                                108.57,
                                106.9,
                                106.97,
                                107.12,
                                107.82,
                                107.95,
                                107.53,
                                107.48,
                                108.48,
                                108.08,
                                106.67,
                                106.41,
                                106.67,
                                104.91,
                                105.06,
                                106.48,
                                106.82,
                                106.4,
                                105.96,
                                105.79,
                                105.87,
                                104.22,
                                104.33,
                                103.79,
                                105.75,
                                105.5,
                                106.05,
                                105.85,
                                106.24,
                                105.91,
                                104.95,
                                105.25,
                                105.34,
                                105.1,
                                103.78,
                                103.41,
                                102.83,
                                103.52,
                                104.02,
                                102.74,
                                103.74,
                                101.11,
                                99.17,
                                99.15,
                                98.88,
                                98.59,
                                97.14,
                                97.87,
                                98.22,
                                97.5,
                                99.21,
                                99.34,
                                99.51,
                                100.48,
                                100.13,
                                98.89,
                                99.34,
                                99.5,
                                98.92
                            ],
                            [
                                "Franklin - India Bluechip Fund (G)",
                                100,
                                99.1,
                                99.02,
                                100.11,
                                99.34,
                                99.64,
                                100.38,
                                100.33,
                                100.36,
                                101.23,
                                99.53,
                                99.48,
                                99.56,
                                100.49,
                                101.78,
                                102.46,
                                102.98,
                                102.52,
                                102.46,
                                102.38,
                                104.05,
                                104.6,
                                104.4,
                                105.01,
                                104.98,
                                104.51,
                                104.68,
                                105.23,
                                104.98,
                                105.14,
                                106.13,
                                105.66,
                                105.69,
                                105.94,
                                105.53,
                                105.34,
                                104.65,
                                104.9,
                                106.65,
                                106.98,
                                106.59,
                                105.14,
                                105.06,
                                105.64,
                                105.39,
                                105.44,
                                106.29,
                                106.35,
                                105.85,
                                105.99,
                                106.1,
                                105.58,
                                106.84,
                                107.41,
                                106.98,
                                107.41,
                                108.97,
                                108.78,
                                109.06,
                                108.15,
                                106.29,
                                106.65,
                                107.09,
                                106.79,
                                106.65,
                                107.69,
                                107.39,
                                106.35,
                                106.1,
                                106.7,
                                104.79,
                                105.42,
                                106.4,
                                107.09,
                                106.84,
                                106.54,
                                106.51,
                                106.48,
                                105.14,
                                105.55,
                                106.13,
                                106.51,
                                106.7,
                                106.79,
                                106.84,
                                106.02,
                                105.61,
                                106.1,
                                105.91,
                                104.49,
                                104.02,
                                103.26,
                                104.02,
                                104.79,
                                104.16,
                                105.55,
                                102.98,
                                100.88,
                                100.47,
                                100.71,
                                98.74,
                                99.48,
                                99.75,
                                99.04,
                                100.49,
                                100.66,
                                101.07,
                                102,
                                101.34
                            ],
                            [
                                "Birla SL - Frontline Equity Fund Reg (G)",
                                100,
                                100.12,
                                99.59,
                                98.67,
                                98.78,
                                99.88,
                                99.13,
                                99.36,
                                100,
                                99.83,
                                99.71,
                                100.46,
                                98.43,
                                98.72,
                                99.07,
                                100.12,
                                101.33,
                                102.15,
                                102.73,
                                102.26,
                                102.09,
                                102.03,
                                103.54,
                                104.12,
                                103.89,
                                104.41,
                                104.35,
                                104,
                                104.18,
                                105.05,
                                104.47,
                                104.99,
                                106.21,
                                105.86,
                                106.27,
                                106.91,
                                107.02,
                                107.25,
                                106.09,
                                106.44,
                                108.01,
                                108.82,
                                108.36,
                                107.02,
                                106.91,
                                107.78,
                                107.6,
                                107.54,
                                108.24,
                                108.36,
                                107.89,
                                107.66,
                                108.13,
                                107.54,
                                109.23,
                                109.87,
                                109.81,
                                110.21,
                                111.78,
                                111.67,
                                112.07,
                                111.26,
                                109.29,
                                109.92,
                                110.16,
                                109.92,
                                109.92,
                                111.14,
                                110.8,
                                109.81,
                                109.75,
                                110.16,
                                107.78,
                                108.65,
                                110.45,
                                110.8,
                                110.74,
                                110.39,
                                110.45,
                                110.45,
                                108.88,
                                109.23,
                                109.92,
                                110.27,
                                110.45,
                                110.74,
                                110.68,
                                109.69,
                                109.17,
                                109.87,
                                109.75,
                                108.18,
                                107.54,
                                106.67,
                                107.78,
                                108.13,
                                106.67,
                                108.13,
                                105.11,
                                101.97,
                                101.86,
                                100.87,
                                101.33,
                                100.35,
                                101.97,
                                102.09,
                                103.42,
                                102.84,
                                101.57
                            ],
                            [
                                "IDFC - Premier Equity Fund Reg (G)",
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                104.38,
                                105.05,
                                102.12,
                                97.74,
                                98.01,
                                96.55,
                                97.08,
                                96.68,
                                97.48,
                                98.01,
                                98.94,
                                100,
                                97.61
                            ],
                            [
                                "date",
                                "2016-06-01",
                                "2016-06-02",
                                "2016-06-03",
                                "2016-06-06",
                                "2016-06-07",
                                "2016-06-08",
                                "2016-06-09",
                                "2016-06-13",
                                "2016-06-14",
                                "2016-06-15",
                                "2016-06-16",
                                "2016-06-17",
                                "2016-06-20",
                                "2016-06-21",
                                "2016-06-22",
                                "2016-06-23",
                                "2016-06-24",
                                "2016-06-27",
                                "2016-06-28",
                                "2016-06-29",
                                "2016-06-30",
                                "2016-07-01",
                                "2016-07-04",
                                "2016-07-05",
                                "2016-07-07",
                                "2016-07-08",
                                "2016-07-11",
                                "2016-07-12",
                                "2016-07-13",
                                "2016-07-14",
                                "2016-07-15",
                                "2016-07-18",
                                "2016-07-19",
                                "2016-07-20",
                                "2016-07-21",
                                "2016-07-22",
                                "2016-07-25",
                                "2016-07-26",
                                "2016-07-27",
                                "2016-07-28",
                                "2016-07-29",
                                "2016-08-01",
                                "2016-08-03",
                                "2016-08-04",
                                "2016-08-05",
                                "2016-08-08",
                                "2016-08-09",
                                "2016-08-10",
                                "2016-08-11",
                                "2016-08-12",
                                "2016-08-16",
                                "2016-08-17",
                                "2016-08-18",
                                "2016-08-19",
                                "2016-08-22",
                                "2016-08-23",
                                "2016-08-24",
                                "2016-08-25",
                                "2016-08-30",
                                "2016-08-31",
                                "2016-09-01",
                                "2016-09-02",
                                "2016-09-06",
                                "2016-09-07",
                                "2016-09-08",
                                "2016-09-09",
                                "2016-09-12",
                                "2016-09-16",
                                "2016-09-19",
                                "2016-09-20",
                                "2016-09-21",
                                "2016-09-22",
                                "2016-09-23",
                                "2016-09-26",
                                "2016-09-27",
                                "2016-09-28",
                                "2016-09-30",
                                "2016-10-03",
                                "2016-10-04",
                                "2016-10-05",
                                "2016-10-06",
                                "2016-10-07",
                                "2016-10-10",
                                "2016-10-13",
                                "2016-10-14",
                                "2016-10-19",
                                "2016-10-20",
                                "2016-10-21",
                                "2016-10-24",
                                "2016-10-25",
                                "2016-10-26",
                                "2016-10-27",
                                "2016-10-28",
                                "2016-11-01",
                                "2016-11-02",
                                "2016-11-03",
                                "2016-11-04",
                                "2016-11-07",
                                "2016-11-08",
                                "2016-11-09",
                                "2016-11-10",
                                "2016-11-11",
                                "2016-11-17",
                                "2016-11-18",
                                "2016-11-23",
                                "2016-11-24",
                                "2016-11-25",
                                "2016-11-28",
                                "2016-11-29"
                            ],
                            [
                                "Franklin - India High Growth Companies Fund (G)",
                                100,
                                100.69,
                                100.34,
                                100.34,
                                101.72,
                                102.07,
                                101.72,
                                99.66,
                                100,
                                101.38,
                                100.69,
                                101.38,
                                101.72,
                                101.72,
                                101.38,
                                102.41,
                                100.34,
                                101.03,
                                101.03,
                                102.07,
                                103.45,
                                104.14,
                                105.17,
                                104.83,
                                104.48,
                                103.79,
                                105.52,
                                106.55,
                                106.21,
                                107.24,
                                107.59,
                                106.9,
                                107.24,
                                107.24,
                                106.55,
                                106.9,
                                107.93,
                                107.59,
                                107.93,
                                107.93,
                                107.24,
                                106.9,
                                105.86,
                                105.86,
                                107.93,
                                107.93,
                                107.93,
                                106.21,
                                106.21,
                                107.24,
                                107.59,
                                107.93,
                                108.97,
                                109.66,
                                108.97,
                                109.31,
                                109.31,
                                108.62,
                                110,
                                110.34,
                                110,
                                110.69,
                                112.76,
                                113.1,
                                113.1,
                                112.07,
                                109.66,
                                111.03,
                                111.38,
                                110.69,
                                110.34,
                                111.72,
                                111.38,
                                110,
                                109.66,
                                110.69,
                                109.31,
                                110.69,
                                111.72,
                                111.72,
                                111.38,
                                111.38,
                                111.03,
                                108.97,
                                109.66,
                                111.03,
                                112.41,
                                112.41,
                                112.76,
                                113.45,
                                111.72,
                                111.72,
                                112.07,
                                112.07,
                                110.34,
                                109.31,
                                108.62,
                                110,
                                111.03,
                                109.66,
                                112.07,
                                108.97,
                                106.21,
                                106.55,
                                105.17,
                                104.48,
                                105.52,
                                105.52,
                                106.21
                            ],
                            [
                                "Franklin - India Ultra Short Bond Super Ins (G)",
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.48,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                100.97,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.45,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                101.93,
                                102.42,
                                102.42,
                                102.42,
                                102.42,
                                102.42,
                                102.42,
                                102.42,
                                102.42,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                102.9,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.38,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                103.86,
                                104.35,
                                104.35,
                                104.35,
                                104.35,
                                104.35,
                                104.35,
                                104.83,
                                104.83,
                                104.83,
                                104.83,
                                104.83,
                                104.83,
                                104.83,
                                104.83
                            ]
                        ],
                        "xdata": [
                            "2016-06-01",
                            "2016-06-02",
                            "2016-06-03",
                            "2016-06-06",
                            "2016-06-07",
                            "2016-06-08",
                            "2016-06-09",
                            "2016-06-13",
                            "2016-06-14",
                            "2016-06-15",
                            "2016-06-16",
                            "2016-06-17",
                            "2016-06-20",
                            "2016-06-21",
                            "2016-06-22",
                            "2016-06-23",
                            "2016-06-24",
                            "2016-06-27",
                            "2016-06-28",
                            "2016-06-29",
                            "2016-06-30",
                            "2016-07-01",
                            "2016-07-04",
                            "2016-07-05",
                            "2016-07-07",
                            "2016-07-08",
                            "2016-07-11",
                            "2016-07-12",
                            "2016-07-13",
                            "2016-07-14",
                            "2016-07-15",
                            "2016-07-18",
                            "2016-07-19",
                            "2016-07-20",
                            "2016-07-21",
                            "2016-07-22",
                            "2016-07-25",
                            "2016-07-26",
                            "2016-07-27",
                            "2016-07-28",
                            "2016-07-29",
                            "2016-08-01",
                            "2016-08-03",
                            "2016-08-04",
                            "2016-08-05",
                            "2016-08-08",
                            "2016-08-09",
                            "2016-08-10",
                            "2016-08-11",
                            "2016-08-12",
                            "2016-08-16",
                            "2016-08-17",
                            "2016-08-18",
                            "2016-08-19",
                            "2016-08-22",
                            "2016-08-23",
                            "2016-08-24",
                            "2016-08-25",
                            "2016-08-30",
                            "2016-08-31",
                            "2016-09-01",
                            "2016-09-02",
                            "2016-09-06",
                            "2016-09-07",
                            "2016-09-08",
                            "2016-09-09",
                            "2016-09-12",
                            "2016-09-16",
                            "2016-09-19",
                            "2016-09-20",
                            "2016-09-21",
                            "2016-09-22",
                            "2016-09-23",
                            "2016-09-26",
                            "2016-09-27",
                            "2016-09-28",
                            "2016-09-30",
                            "2016-10-03",
                            "2016-10-04",
                            "2016-10-05",
                            "2016-10-06",
                            "2016-10-07",
                            "2016-10-10",
                            "2016-10-13",
                            "2016-10-14",
                            "2016-10-19",
                            "2016-10-20",
                            "2016-10-21",
                            "2016-10-24",
                            "2016-10-25",
                            "2016-10-26",
                            "2016-10-27",
                            "2016-10-28",
                            "2016-11-01",
                            "2016-11-02",
                            "2016-11-03",
                            "2016-11-04",
                            "2016-11-07",
                            "2016-11-08",
                            "2016-11-09",
                            "2016-11-10",
                            "2016-11-11",
                            "2016-11-17",
                            "2016-11-18",
                            "2016-11-23",
                            "2016-11-24",
                            "2016-11-25",
                            "2016-11-28",
                            "2016-11-29"
                        ]
                    }
                },
                {
                    "dataType": "html",
                    "data": "You have been investing in 6 mutual funds (1 Debt,1 Cash,4 Equity).4 have grown over the last 6 months while remaining 1 has shrunken"
                },
                {
                    "dataType": "html",
                    "data": "<u><b>Outperformers</b></u>"
                },
                {
                    "dataType": "html",
                    "data": "The most significant among them is <b>IDFC - Premier Equity Fund Reg (G)</b> from Equity portfolio, which has grown by 5.05% during the 6 month period, resulting in CAGR of 10.1%. and the next best fund is IDFC - Cash Fund Reg (G) and it has grown by 0.02% during the 6 month period, resulting in CAGR of 0.04% ."
                },
                {
                    "dataType": "html",
                    "data": "<u><b>Underperformers</b></u>"
                },
                {
                    "dataType": "html",
                    "data": "<b>Franklin - India Bluechip Fund (G) and Franklin - India Ultra Short Bond Super Ins (G)</b> Funds have been under-performing over the last 6 month, growing just around -0.9% and 0.0%."
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Portfolio Growth",
            "slug": "portfolio-growth-xuh8tzrfnz"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>What is the effect of targeted sector allocation?</h4>"
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "padding": {
                                "top": 40
                            },
                            "donut": {
                                "label": {
                                    "format": None
                                }
                            },
                            "data": {
                                "x": None,
                                "type": "donut",
                                "columns": [
                                    [
                                        "Telecom",
                                        2
                                    ],
                                    [
                                        "Metals",
                                        5
                                    ],
                                    [
                                        "Construction",
                                        5
                                    ],
                                    [
                                        "Automobile",
                                        6
                                    ],
                                    [
                                        "Technology",
                                        6
                                    ],
                                    [
                                        "Healthcare",
                                        12
                                    ],
                                    [
                                        "Oil & Gas",
                                        13
                                    ],
                                    [
                                        "Financial Services",
                                        22
                                    ],
                                    [
                                        "FMCG",
                                        28
                                    ]
                                ]
                            },
                            "legend": {
                                "show": True
                            },
                            "size": {
                                "height": 340
                            }
                        },
                        "table_c3": [
                            [
                                "Telecom",
                                2
                            ],
                            [
                                "Metals",
                                5
                            ],
                            [
                                "Construction",
                                5
                            ],
                            [
                                "Automobile",
                                6
                            ],
                            [
                                "Technology",
                                6
                            ],
                            [
                                "Healthcare",
                                12
                            ],
                            [
                                "Oil & Gas",
                                13
                            ],
                            [
                                "Financial Services",
                                22
                            ],
                            [
                                "FMCG",
                                28
                            ]
                        ]
                    }
                },
                {
                    "dataType": "html",
                    "data": "Influence of sectors on portfolio growth"
                },
                {
                    "dataType": "html",
                    "data": "The portfolio seems to be well diversified as investments have been made in a wide range of sectors. However, the investments in equity market seem to <b>depend heavily upon couple of sectors</b>, as Financial Services and FMCG accounts for more than <b>half</b> 50.0% of the equity allocation."
                },
                {
                    "dataType": "html",
                    "data": "The table below displays the sector allocation of all equity funds and how each sector has performed over the last 6 months. The key sectors that the portfolio is betting on, have done <b>relatively well</b> (Financial Services and FMCG have grown by  22.0% and 28.0% respectively)."
                },
                {
                    "dataType": "table",
                    "data": {
                        "tableData": [
                            [
                                "",
                                "allocation",
                                "return"
                            ],
                            [
                                "Telecom",
                                2,
                                39
                            ],
                            [
                                "Metals",
                                5,
                                -33
                            ],
                            [
                                "Construction",
                                5,
                                63
                            ],
                            [
                                "Automobile",
                                6,
                                25
                            ],
                            [
                                "Technology",
                                6,
                                25
                            ],
                            [
                                "Healthcare",
                                12,
                                56
                            ],
                            [
                                "Oil & Gas",
                                13,
                                4
                            ],
                            [
                                "Financial Services",
                                22,
                                5
                            ],
                            [
                                "FMCG",
                                28,
                                25
                            ]
                        ],
                        "tableType": "heatMap"
                    }
                },
                {
                    "dataType": "html",
                    "data": "It is also very important to note that the existing portfolio <b>does not have adequate exposure</b> to other well-performing sectors.<b>Healthcare and Oil & Gas</b> has <b>grown remarkably</b>, producing return of over 13.0%. But the portfolio allocation (12.0% on Healthcare) limits scope for leveraging the booming sector."
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Sector Allocation",
            "slug": "sector-allocation-ohyv1ywxy6"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>How is the portfolio projected to perform</h4>"
                },
                {
                    "dataType": "html",
                    "data": "<b>Telecom, Financial Services and Technology</b> are expected to <b>outperform</b> the overall market, whereas <b>Automobile,Oil & Gas and Metals</b> are very likely to <b>remain stable</b>, On the other hand, <b>Consumer Durables,Construction and FMCG</b> seems to <b>underperform</b> compared to other sectors. The chart below displays the sector allocation of the current portfolio, mapped with projected outlook for the sectors."
                },
                {
                    "dataType": "c3Chart",
                    "data": {
                        "chart_c3": {
                            "point": {
                                "r": 10
                            },
                            "color": {
                                "pattern": [
                                    "#0fc4b5",
                                    "#005662",
                                    "#148071",
                                    "#6cba86",
                                    "#bcf3a2"
                                ]
                            },
                            "padding": {
                                "top": 40
                            },
                            "grid": {
                                "y": {
                                    "show": True
                                },
                                "x": {
                                    "show": True
                                }
                            },
                            "subchart": None,
                            "data": {
                                "x": None,
                                "axes": {
                                    "value": "y"
                                },
                                "type": "bar",
                                "columns": [
                                    [
                                        "data1_x",
                                        "Telecom",
                                        "Metals"
                                    ],
                                    [
                                        "data1",
                                        2,
                                        5
                                    ],
                                    [
                                        "data3_x",
                                        "Healthcare",
                                        "Oil & Gas",
                                        "Financial Services",
                                        "FMCG"
                                    ],
                                    [
                                        "data3",
                                        12,
                                        13,
                                        22,
                                        28
                                    ],
                                    [
                                        "data2_x",
                                        "Construction",
                                        "Automobile",
                                        "Technology"
                                    ],
                                    [
                                        "data2",
                                        5,
                                        6,
                                        6
                                    ]
                                ],
                                "xs": {
                                    "data1": "data1_x",
                                    "data3": "data3_x",
                                    "data2": "data2_x"
                                }
                            },
                            "legend": {
                                "show": True
                            },
                            "size": {
                                "height": 340
                            },
                            "bar": {
                                "width": {
                                    "ratio": 0.5
                                }
                            },
                            "tooltip": {
                                "show": True
                            },
                            "axis": {
                                "y": {
                                    "tick": {
                                        "count": 7,
                                        "multiline": True,
                                        "outer": False,
                                        "format": ".2s"
                                    },
                                    "label": {
                                        "text": "",
                                        "position": "outer-middle"
                                    }
                                },
                                "x": {
                                    "tick": {
                                        "rotate": -45,
                                        "multiline": False,
                                        "fit": False
                                    },
                                    "type": "category",
                                    "label": {
                                        "text": "",
                                        "position": "outer-center"
                                    },
                                    "extent": None,
                                    "height": 90
                                }
                            }
                        },
                        "yformat": ".2s",
                        "table_c3": [
                            [
                                "data1_x",
                                "Telecom",
                                "Metals"
                            ],
                            [
                                "data1",
                                2,
                                5
                            ],
                            [
                                "data3_x",
                                "Healthcare",
                                "Oil & Gas",
                                "Financial Services",
                                "FMCG"
                            ],
                            [
                                "data3",
                                12,
                                13,
                                22,
                                28
                            ],
                            [
                                "data2_x",
                                "Construction",
                                "Automobile",
                                "Technology"
                            ],
                            [
                                "data2",
                                5,
                                6,
                                6
                            ]
                        ]
                    }
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Portfolio Projection",
            "slug": "portfolio-projection-a57gpus6n9"
        },
        {
            "cardData": [
                {
                    "dataType": "html",
                    "data": "<h4>Our recommendations to maximize your wealth</h4>"
                },
                {
                    "dataType": "html",
                    "data": "Based on analysis of your portfolio composition, performance of various funds, and the projected outlook, mAdvisor recommends the following."
                },
                {
                    "dataType": "html",
                    "data": "<ul><li><b>Reallocate investments</b> from some of the low-performing assets such as Franklin - India Ultra Short Bond Super Ins (G): Our suggestion is that you can maximize returns by investing more in other existing equity funds.</li><li>Invest in funds that are going to outperform, <b>Technology and Telecom</b> equity funds. Our suggestion is that you consider investing in ICICI Prudential Large Cap Fund, top performer in Technology, which has an annual return of 25.4%.</li><li><b>Consider investing in Tax Saver</b> equity funds that would help you manage taxes more effectively and save more money.</li></ul>"
                }
            ],
            "cardType": "normal",
            "cardWidth": 100,
            "name": "Recommendation",
            "slug": "recomendation-riyxg0d5sy"
        }
    ],
    "name": "Portfolio Analysis",
    "slug": "portfolio-analysis-lkdzu1oaql"
}


@csrf_exempt
def get_chart_or_small_data(request, slug=None):
    data_object = SaveData.objects.get(slug=slug)
    if data_object is None:
        return Response({'Message': 'Failed'})

    csv_data = data_object.get_data()
    csv_data = map(list, zip(*csv_data))
    from django.http import HttpResponse
    import csv
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="{0}.csv"'.format(slug)
    writer = csv.writer(response)
    for row in csv_data:
        writer.writerow(row)

    return response


@api_view(['GET'])
def get_job_kill(request, slug=None):

    job_object = Job.objects.filter(object_id=slug).first()
    original_object = job_object.get_original_object()
    if original_object is None:
        return JsonResponse({
            'message': 'Unable to Delete.'
        })

    original_object.deleted = True
    original_object.save()
    if job_object.kill() is True:
        return JsonResponse({
            'message': 'killed. and Deleted'
        })
    else:
        return JsonResponse({
            'message': 'Unable to kill.'
        })


@api_view(['GET'])
def get_job_refreshed(request, slug=None):

    job_object = Job.objects.filter(object_id=slug).first()
    job_object.update_status()
    return JsonResponse({
        'message': 'refreshed'
    })

@api_view(['GET'])
def get_job_restarted(request, slug=None):

    job_object = Job.objects.filter(object_id=slug).first()
    job_object.start()
    return JsonResponse({
        'message': 'started'
    })


@csrf_exempt
def set_messages(request, slug=None):

    if slug is None:
        return JsonResponse({"message": "Failed"})

    from api.models import get_slug_from_message_url
    job_slug = get_slug_from_message_url(slug)
    job = Job.objects.get(slug=job_slug)

    if not job:
        return JsonResponse({'result': 'No job exist.'})

    emptyBin = request.GET.get('emptyBin', None)
    if emptyBin is True or emptyBin == 'True':
        job.reset_message()

    return_data = request.GET.get('data', None)
    data = request.body
    data = json.loads(data)
    from api.redis_access import AccessFeedbackMessage
    ac = AccessFeedbackMessage()
    data = ac.append_using_key(slug, data)

    job.message_log = json.dumps(data)
    job.save()

    if return_data is None:
        return JsonResponse({'message': "Success"})
    elif return_data is False:
        return JsonResponse({'message': "Success"})
    elif return_data is True:
        JsonResponse({'message': data})


@csrf_exempt
def set_pmml(request, slug=None):
    '''

    :param request:
    :param slug: It is Job Slug
    :return:
    '''
    if slug is None:
        return JsonResponse({"message": "Failed"})
    data = request.body
    data = json.loads(data)
    from api.redis_access import AccessFeedbackMessage
    from helper import generate_pmml_name
    ac = AccessFeedbackMessage()
    key_pmml_name = generate_pmml_name(slug)
    data = ac.append_using_key(key_pmml_name, data)

    return JsonResponse({'message': data})


@csrf_exempt
def get_pmml(request, slug=None, algoname='algo'):

    from api.redis_access import AccessFeedbackMessage
    from helper import generate_pmml_name
    ac = AccessFeedbackMessage()
    job_object = Job.objects.filter(object_id=slug).first()
    job_slug = job_object.slug
    key_pmml_name = generate_pmml_name(job_slug)
    data = ac.get_using_key(key_pmml_name)
    if data is None:
        sample_xml =  "<mydocument has=\"an attribute\">\n  <and>\n    <many>elements</many>\n    <many>more elements</many>\n  </and>\n  <plus a=\"complex\">\n    element as well\n  </plus>\n</mydocument>"
        return return_xml_data(sample_xml, algoname)
    xml_data = data[-1].get(algoname)
    return return_xml_data(xml_data, algoname)


@csrf_exempt
def set_job_reporting(request, slug=None, report_name=None):
    job = Job.objects.get(slug=slug)

    if not job:
        return JsonResponse({'result': 'Failed'})
    new_error = request.body
    error_log = json.loads(job.error_report)
    json_formatted_new_error = None
    if isinstance(new_error, str) or isinstance(new_error, unicode):
        json_formatted_new_error = json.loads(new_error)
    elif isinstance(new_error, dict):
        json_formatted_new_error = new_error

    if json_formatted_new_error is None:
        pass
    else:
        if report_name in error_log:
            error_log[report_name].append(json_formatted_new_error)
        else:
            error_log[report_name] = [json_formatted_new_error]

        job.error_report = json.dumps(error_log)
        job.save()

    return JsonResponse({'messgae':'error reported.'})

@csrf_exempt
def get_job_report(request, slug=None):
    job = Job.objects.get(slug=slug)

    if not job:
        return JsonResponse({'result': 'Failed'})

    error_log = json.loads(job.error_report)

    return JsonResponse({'report': error_log})



@csrf_exempt
def get_stockdatasetfiles(request, slug=None):
    # if slug is None:
    #     return JsonResponse({"message": "Failed"})
    stockDataType = request.GET.get('stockDataType')
    stockName = request.GET.get('stockName')

    return return_json_data(stockDataType, stockName, slug)


def return_json_data(stockDataType, stockName, slug):
    import os
    base_path = os.path.dirname(os.path.dirname(__file__))
    base_path = base_path + "/scripts/data/{0}/".format(slug)
    matching = {
        "bluemix": stockDataType + "_" + stockName + ".json",
        "historical": stockDataType + "_" + stockName + ".json",
        "concepts": "old_concepts.json"
    }

    if stockDataType in ["bluemix", "historical"]:
        path = base_path + matching[stockDataType]
    else:
        path = base_path + "/scripts/data/" + matching[stockDataType]
    temp_path = base_path + matching[stockDataType]

    from django.http import HttpResponse

    file_content = open(path).read()
    response = HttpResponse(file_content, content_type='application/json')
    response['Content-Disposition'] = 'attachment; filename="{0}.json"'.format(path)

    return response


def return_xml_data(xml_data_str, algoname):

    from django.http import HttpResponse

    file_content = xml_data_str
    response = HttpResponse(file_content, content_type='application/xml')
    response['Content-Disposition'] = 'attachment; filename="{0}.xml"'.format(algoname)

    return response


@csrf_exempt
def get_concepts_to_show_in_ui(request):
    return JsonResponse(settings.CONCEPTS)


from api.helper import auth_for_ml


@csrf_exempt
@auth_for_ml
def get_metadata_for_mlscripts(request, slug=None):
    ds = Dataset.objects.filter(slug=slug).first()
    if ds == None:
        return JsonResponse({'Message': 'Failed. No such dataset.'})

    if ds.analysis_done == False:
        return JsonResponse({'Message': 'Failed. No analysis of this dataset'})

    from api.datasets.serializers import DatasetSerializer
    ds_serializer = DatasetSerializer(instance=ds)
    meta_data = ds_serializer.data.get('meta_data')
    return JsonResponse({
        "metaData": meta_data.get('metaData'),
        'columnData': meta_data.get('columnData'),
        'headers': meta_data.get('headers')

    })


@csrf_exempt
def get_score_data_and_return_top_n(request):
    url = request.GET['url']
    download_csv = request.GET['download_csv']

    from django.conf import settings
    base_file_path = settings.SCORES_SCRIPTS_FOLDER
    download_path = base_file_path + url + '/data.csv'
    from django.http import HttpResponse
    import os

    instance = Score.objects.get(slug=url)

    with open(download_path, 'rb') as fp:

        if download_csv == 'true':
            response = HttpResponse(fp.read(), content_type='application/csv')
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(instance.name) + '.csv'
            return response
        else:
            count = request.GET['count']
            if count is None:
                count = 100
            try:
                if int(count) < 10:
                    count = 100
                else:
                    count = int(count)
            except:
                count = 100

            csv_text = fp.read()
            csv_list = csv_text.split('\n')
            return JsonResponse({
                'Message': 'Success',
                'csv_data': csv_list[:count]
            })


@api_view(['GET'])
def get_recent_activity(request):
    user = request.user
    from django.contrib.admin.models import LogEntry

    logs = LogEntry.objects.order_by('-action_time')
    # logCount = LogEntry.objects.exclude(change_message="No fields changed.").order_by('-action_time')[:20].count()
    recent_activity = []
    for obj in logs:
        log_user = str(obj.user)
        recent_activity.append(
            {"message": obj.change_message,"action_time":obj.action_time,"repr":obj.object_repr,"content_type":obj.content_type.model,"content_type_app_label":obj.content_type.app_label,"user":log_user})

    return JsonResponse({
        "recent_activity": recent_activity

    })


@api_view(['GET'])
def delete_and_keep_only_ten_from_all_models(request):
    from api.models import SaveAnyData
    from auditlog.models import LogEntry

    model_list = [Dataset, Insight, Trainer, Score, Job, SaveData, SaveAnyData, LogEntry]

    for model_item in model_list:
        model_item.objects.all().delete()

    return JsonResponse({
        'ok': 'ok'

    })