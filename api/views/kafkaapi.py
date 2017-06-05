import json
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models.kafkaapi import Kafkadata

@csrf_exempt
def call_producer(request):

    #data = request.GET['data'] if request.method == "GET" else request.POST['data']
    data = request.body
    data = json.loads(data)
    try:
        e = Kafkadata.kafka_producer(json.dumps(data.get('data')))
        print e
        return JsonResponse({"data":e})
    except Exception as e:
        print e
        return JsonResponse({"data": "error"})



