import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.robo import Robo, RoboSerializer

def get_robo(request):
    id = request.GET['robo_id'] if request.method == "GET" else request.POST['robo_id']
    return Robo.objects.get(pk=id)

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def create(request):
    ds = Robo.make(request.FILES.get('customer_file'), request.FILES.get('historical_file'), request.FILES.get('market_file'))
    return Response({"data" : RoboSerializer(ds).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    r = get_robo(request)
    return Response(r.get_preview())
