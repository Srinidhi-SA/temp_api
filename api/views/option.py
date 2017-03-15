import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.option import Option, OptionSerializer

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def set(request):
    for key in request.POST:
        obj, created = Option.objects.get_or_create(slug=key)
        obj.data = request.POST[key]
        obj.save()
    return Response({"data": "Successfully saved option information"})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_all(request):
    return Response({"data": OptionSerializer(Option.objects.all(), many=True).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dict(request):
    dict = {}
    for item in Option.objects.all():
        dict[item.slug] = item.data
    return Response({"data": dict})
