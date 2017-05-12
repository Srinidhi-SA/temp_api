from api.models.trainer import Trainer
from api.models.score import Score

# import rest_framework

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


def get_score(request):

    id = request.GET['score_id'] if request.method == "GET" else request.POST['score_id']
    try:
        e = Score.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None


def get_score_using_id(id):

    try:
        e = Score.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def create_score():

    # collect details from request
    pass

    # create database entry for score
    pass

    # create config for score
    pass

    # call the script
    pass

    # create response
    pass


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def retrieve_score(request):

    # get score object from request
    pass

    # serialize score
    pass

    # create response
    pass