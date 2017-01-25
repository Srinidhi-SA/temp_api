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

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def create(request):
    ds = Dataset.make(request.FILES.get('input_file'))
    return Response({"status" : ds.id})

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def all(request):
    return Response({'data': DatasetSerializer(Dataset.objects.all(), many=True).data})
