import os
import getpass
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call
import subprocess
import glob

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.dataset import Dataset, DatasetSerializer

def get_dataset(request):
    id = request.GET['dataset_id'] if request.method == "GET" else request.POST['dataset_id']
    return Dataset.objects.get(pk=id)

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def create(request):
    ds = Dataset.make(request.FILES.get('input_file'))
    return Response({"data" : DatasetSerializer(ds).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def all(request):
    return Response({'data': DatasetSerializer(Dataset.objects.all(), many=True).data})

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
