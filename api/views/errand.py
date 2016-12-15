from django.shortcuts import render
from django.http import HttpResponse

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.errand import Errand, ErrandSerializer

# Create your views here.

def showme(request):
    return HttpResponse("Alright, this is a test");

def get_errand(request):
    id = request.GET['errand_id'] if request.method == "GET" else request.POST['errand_id']
    return Errand.objects.get(pk=id)

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

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    e = get_errand(request)
    return Response({'data': e.get_preview_data()})

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
    return Response({'message': "Success", "id": e.id})
