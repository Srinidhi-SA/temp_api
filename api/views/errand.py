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

from api.models.errand import Errand, ErrandSerializer

from time import sleep

# Create your views here.

def showme(request):
    return HttpResponse("Alright, this is a test");

def get_errand(request):
    id = request.GET['errand_id'] if request.method == "GET" else request.POST['errand_id']
    return Errand.objects.get(pk=id)

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def get_uploaded_files(request):
    return Response({'files': glob.iglob("uploads/errands/*/*.csv")})

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def jack(request):
    return Response({'name': "prakash raman"});

@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def make(request):
    errand = Errand.make(request.POST)
    return Response({"message": "Successfully created errand", "data": ErrandSerializer(errand).data});

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    e = get_errand(request)
    return Response({'data': e.get_preview_data()})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_meta(request):
    e = get_errand(request)
    return Response(e.get_meta())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def columns(request):
    e = get_errand(request)
    return Response({'data': e.get_columns()})

@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_dimensions(request):
    e = get_errand(request)
    e.set_dimensions(request.POST['dimensions'].split(","))
    return Response({'message': "Success"})

@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_measure(request):
    e = get_errand(request)
    e.set_measure(request.POST['measure'])
    if request.POST.has_key('cache') and request.POST['cache'] == "yes":
        print("do nothing right now")
    else:
        e.run_dist()
    sleep(5)
    return Response({'message': "Success", "id": e.id})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_env(request):
    return Response({'user': getpass.getuser(), 'env': os.environ})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_results(request):
    e = get_errand(request)
    return Response({
        'result': e.get_result(),
        'narratives': e.get_narratives(),
        'dimensions': e.get_dimension_results(),
        'measures': e.get_reg_results()
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_frequency_results(request):
    e = get_errand(request)
    return Response(e.get_frequency_results())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_archived(request):
    es = Errand.objects.filter(is_archived=True)
    return Response({'errands': ErrandSerializer(es, many=True).data})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_archived(request):
    e = get_errand(request)
    e.is_archived = True
    e.save()
    return Response({'data': "Successfully archived errand"})
