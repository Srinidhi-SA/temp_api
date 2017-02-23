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
def set_measure(request):
    e = get_errand(request)
    e.set_measure(request.POST['measure'])
    e.compare_with = request.POST['compare_with']
    e.save()
    e.run_dist()
    return Response({'message': "Success", "id": e.id})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_dimension(request):
    e = get_errand(request)
    e.set_dimension(request.POST['dimension'])
    e.compare_with = request.POST['compare_with']
    e.save()
    e.run_dimension()
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
def get_tree_results(request):
    e = get_errand(request)
    return Response(e.get_tree_results())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_narratives(request):
    e = get_errand(request)
    return Response(e.get_tree_narratives())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_chi_results(request):
    e = get_errand(request)
    return Response(e.get_chi_results())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_archived(request):
    #es = Errand.objects.filter(is_archived=True)
    es = Errand.objects.all()
    return Response({'errands': ErrandSerializer(es, many=True).data})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_archived(request):
    e = get_errand(request)
    e.is_archived = True
    e.save()
    return Response({'data': "Successfully archived errand"})

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def edit(request):
    e = get_errand(request)
    e.name = request.POST['name']
    e.save()
    return Response({"message" : "Updated"})

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def delete(request):
    Errand.objects.filter(id__in=request.POST['errand_ids'].split(",")).delete()
    return Response({"message": "Deleted"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def log_status(request, errand_id=None):
    return Response({"message": "Successfully logged the statuses"})
