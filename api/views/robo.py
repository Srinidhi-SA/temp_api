import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.robo import Robo, RoboSerializer

from django.core.cache import cache
from api.redis_access import get_cache_name

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

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

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def all(request):
    return Response({"data": RoboSerializer(Robo.objects.all(), many=True).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_results(request):
    r = get_robo(request)
    cache_name = get_cache_name(r)

    data = cache.get(cache_name)
    if data is None:
        data = r.get_results()
        cache.set(cache_name, data)

    # create response
    return Response(data)

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def edit(request):
    e = get_robo(request)
    e.name = request.POST['name']
    e.save()
    return Response({"message" : "Updated"})

@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def delete(request):
    Robo.objects.filter(id__in=request.POST['robo_ids'].split(",")).delete()
    return Response({"message": "Deleted"})
