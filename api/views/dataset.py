import os
import getpass
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call
import subprocess
import glob
import json

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.dataset import Dataset, DatasetSerializer

def get_dataset(request):
    id = request.GET['dataset_id'] if request.method == "GET" else request.POST['dataset_id']
    return Dataset.objects.get(pk=id)

def get_dataset_from_data(request):
    id = request.data['dataset_id']
    return Dataset.objects.get(pk=id)

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def create(request):
    # ds = Dataset.make(request.FILES.get('input_file'))
    print request.POST.get('userId')
    ds = Dataset.make(request.FILES.get('input_file'), request.POST.get('userId'))
    return Response({"data" : DatasetSerializer(ds).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def all(request):
    userId = request.query_params.get('userId')
    return Response({'data': DatasetSerializer(Dataset.objects.filter(userId=userId), many=True).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    e = get_dataset(request)
    return Response({'data': e.get_preview_data()})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_meta(request):
    e = get_dataset(request)
    return Response(e.get_meta())

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def edit(request):
    e = get_dataset(request)
    e.name = request.POST['name']
    e.save()
    return Response({"message" : "Updated"})

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def delete(request):
    Dataset.objects.filter(id__in=request.POST['dataset_ids'].split(",")).delete()
    return Response({"message": "Deleted"})

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def filter_sample(request):

    COLUMN_SETTINGS = json.loads(request.POST['COLUMN_SETTINGS'])
    DIMENSION_FILTER = json.loads(request.POST['DIMENSION_FILTER'])
    MEASURE_FILTER = json.loads(request.POST['MEASURE_FILTER'])
    print DIMENSION_FILTER, COLUMN_SETTINGS, MEASURE_FILTER
    e = get_dataset_from_data(request)
    result = e.sample_filter_subsetting(
        COLUMN_SETTINGS,
        DIMENSION_FILTER,
        MEASURE_FILTER
    )
    return Response({"message": "result"})
