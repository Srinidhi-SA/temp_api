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
    print "Hello"
    userId = request.query_params.get('userId')
    userId = '1'
    for key in request.POST:
        print key
        obj, created = Option.objects.get_or_create(slug=key, userId=userId)
        print obj
        obj.data = request.POST[key]
        obj.save()
    return Response({"data": "Successfully saved option information"})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_all(request):
    userId = request.query_params.get('userId')
    return Response({"data": OptionSerializer(Option.objects.filter(userId=userId), many=True).data})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dict(request):
    userId = request.query_params.get('userId')
    option_dict = get_option_for_this_user(userId)
    return Response({"data": option_dict})


def get_option_for_this_user(userId):
    option_dict = {}
    for item in Option.objects.filter(userId=userId):
        option_dict[item.slug] = item.data
    return option_dict

