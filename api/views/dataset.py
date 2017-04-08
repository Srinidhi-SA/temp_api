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

def get_dataset_from_data_from_id(id):
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

    ds = Dataset.objects.filter(userId=userId)

    if userId is not None:
        return Response({'data': DatasetSerializer(ds, many=True).data})
    return Response({'data': []})

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


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def quickinfo(request):
    ds = get_dataset(request)
    user_id = ds.userId
    dataset_quickinfo = DatasetSerializer(ds).data
    dataset_metadata = ds.get_meta_data_numnbers()
    from django.contrib.auth.models import User
    from api.views.option import get_option_for_this_user
    profile = {}
    subsetting = {}
    if user_id:
        user = User.objects.get(pk=user_id)
        profile = user.profile.rs()
        profile = {
            "username":profile['username'],
            "full_name":profile['full_name'],
            "email":profile['email']
        }
        subsetting = get_option_for_this_user(user_id)

    return Response({"message": "result",
                     "dataset_quickinfo": dataset_quickinfo,
                     "dataset_metadata": dataset_metadata,
                     "profile": profile,
                     "subsetting":subsetting
                     })


'''
----> METHODS = quickinfo
Dataset Name (40 Characters)
Created By : Senthil R
Updated on : Feb 21, 2017
File type: CSV
File size: 788KB
Measures: 4
Dimensions: 11
Index: 3
Subsets:
  Cities (San Diego, Miami, New York)
  Sales (>$ 200,000)
  Products (count>1000)
  Sales Agent (Top 10)
'''
