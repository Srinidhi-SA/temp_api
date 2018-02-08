# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import random
import json

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import Http404, JsonResponse

from django.views.decorators.csrf import csrf_exempt

from api.exceptions import creation_failed_exception, update_failed_exception, retrieve_failed_exception
from api.models import Dataset
from api.pagination import CustomPagination
from helper import convert_to_string
from serializers import DatasetSerializer, DataListSerializer, DataNameListSerializer
from api.query_filtering import get_listed_data, get_retrieve_data
from helper import add_transformation_setting_to_ui_metadata, add_ui_metadata_to_metadata
from helper import convert_metadata_according_to_transformation_setting
from helper import get_advanced_setting
from api.tasks import clean_up_on_delete

# Create your views here.


class DatasetView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Dataset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            status__in=['SUCCESS', 'INPROGRESS']
        )
        return queryset

    def get_object_from_all(self):
        return Dataset.objects.get(slug=self.kwargs.get('slug'))

    serializer_class = DatasetSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('bookmarked', 'deleted', 'datasource_type', 'name')
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):

        try:
            data = request.data
            data = convert_to_string(data)

            if 'input_file' in data:
                data['input_file'] =  request.FILES.get('input_file')
                data['datasource_type'] = 'fileUpload'
                if data['input_file'] is None:
                    data['name'] = data.get('name', data.get('datasource_type', "H") + "_"+ str(random.randint(1000000,10000000)))
                else:
                    data['name'] = data.get('name', data['input_file'].name)
            elif 'datasource_details' in data:
                data['input_file'] = None
                if "datasetname" in data['datasource_details']:
                    datasource_details = json.loads(data['datasource_details'])
                    data['name'] = datasource_details['datasetname']
                else:
                    data['name'] = data.get('name', data.get('datasource_type', "H") + "_" + str(random.randint(1000000, 10000000)))

            # question: why to use user.id when it can take, id, pk, object.
            # answer: I tried. Sighhh but it gave this error "Incorrect type. Expected pk value, received User."
            data['created_by'] = request.user.id

            serializer = DatasetSerializer(data=data)
            if serializer.is_valid():
                dataset_object = serializer.save()
                dataset_object.create()
                return Response(serializer.data)
            return creation_failed_exception(serializer.errors)
        except Exception as err:
            return creation_failed_exception(err)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)

        try:
            instance = self.get_object_from_all()
            if 'deleted' in data:
                if data['deleted'] == True:
                    print 'let us delete'
                    clean_up_on_delete.delay(instance.slug, Dataset.__name__)
                    return JsonResponse({'message': 'Deleted'})
        except:
            return update_failed_exception("File Doesn't exist.")

        if 'subsetting' in data:
            if data['subsetting'] == True:
                return self.subsetting(request, instance)

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
        instance = self.get_object_from_all()
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
        queryset = Dataset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            status__in=['SUCCESS']
        )
        serializer = DataNameListSerializer(queryset, many=True)
        return Response({
            "data": serializer.data
        })

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=DataListSerializer
        )

    def retrieve(self, request, *args, **kwargs):
        # return get_retrieve_data(self)
        try:
            instance = self.get_object_from_all()
        except:
            return retrieve_failed_exception("File Doesn't exist.")

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = DatasetSerializer(instance=instance)
        object_details = serializer.data
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

        return Response(object_details)

    def subsetting(self, request, instance=None):

        if instance is None:
            return creation_failed_exception("File Doesn't exist.")

        # try:
        data = request.data
        data = convert_to_string(data)

        temp_details = dict()
        if instance.datasource_type == "fileUpload":
            temp_details['input_file'] = instance.input_file
            temp_details['datasource_type'] = instance.datasource_type
            temp_details['file_remote'] = instance.file_remote
            temp_details['name'] = data.get('name', temp_details['input_file'].name)
        else:
            temp_details['input_file'] = None
            temp_details['datasource_details'] = instance.datasource_details
            temp_details['datasource_type'] = instance.datasource_type
            temp_details['name'] = data.get(
                'name',
                data.get('datasource_type', "NoName") + "_" + str(random.randint(1000000, 10000000))
            )
        temp_details['created_by'] = request.user.id

        serializer = DatasetSerializer(data=temp_details)
        if serializer.is_valid():
            dataset_object = serializer.save()
            if 'filter_settings' in data:
                dataset_object.create_for_subsetting(
                    data['filter_settings'],
                    data.get('transformation_settings', {}),
                    instance.get_input_file(),
                    instance.get_metadata_url_config()
                )
            else:
                return creation_failed_exception({'error': 'no filter_settings'})
            return Response(serializer.data)
        # except Exception as err:
        #     return creation_failed_exception(err)
        # return creation_failed_exception(serializer.errors)

    @detail_route(methods=['put'])
    def meta_data_modifications(self, request, slug=None):
        data = request.data
        if 'config' not in data:
            return Response({'messgae': 'No config in request body.'})
        uiMetaData = data['uiMetaData']
        ts = data.get('config')

        uiMetaData = convert_metadata_according_to_transformation_setting(
                uiMetaData,
                transformation_setting=ts
            )

        uiMetaData["advanced_settings"] = get_advanced_setting(uiMetaData['varibaleSelectionArray'])
        return Response(uiMetaData)

    @detail_route(methods=['put'])
    def advanced_settings_modification(self, request, slug=None):
        data = request.data
        data = data.get('variableSelection')
        return Response(get_advanced_setting(data))