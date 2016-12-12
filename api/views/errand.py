from django.shortcuts import render
from django.http import HttpResponse

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.errand import Errand, ErrandSerializer

# Create your views here.

def showme(request):
    return HttpResponse("Alright, this is a test");

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def jack(request):
    return Response({'name': "prakash raman"});


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def make(request):
    print(request.FILES.get('input_file'))
    errand = Errand.make(request.POST, request.FILES.get('input_file'))
    return Response({"message": "Successfully created errand", "data": ErrandSerializer(errand).data});
