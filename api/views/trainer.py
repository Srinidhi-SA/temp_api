# import models

from api.models.trainer import Trainer, TrainerSerializer
from api.models.dataset import Dataset

# import views

# import rest_framework

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


def get_trainer(request):
    pass

    id = request.GET['trainer_id'] if request.method == "GET" else request.POST['trainer_id']
    try:
        e = Trainer.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None


def get_trainer_using_id(id):

    try:
        e = Trainer.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None


def get_all_trainers_of_this_user(user_id):

    tr = Trainer.objects.filter(
        userId=user_id
        )
    results = []
    for trained in tr:
        data = dict()
        data['detail'] = TrainerSerializer(trained, many=True).data
        data['results'] = trained.read_trainer_details()
        results.append(data)

    return results


def get_trainer_details_from_request(request):
    details = {}
    return details


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def create_trainer(request):

    # get user
    user = request.user

    # collect info from request
    details = get_trainer_details_from_request(request)

    # create database entry
    tr = Trainer.make(details=details, userId=user.id)

    # call script
    pass

    # create response
    pass


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def set_trainer_measure(request):
    pass


@api_view(['GET'])
@renderer_classes((JSONRenderer, ), )
def retrieve_trainer(request):

    # get trainer object from request
    trainer = get_trainer(request)

    # serialize trainer
    details = TrainerSerializer(trainer, many=True).data
    results = trainer.read_trainer_details()

    # create response
    return  Response({
        'trainer': details,
        'results': results,
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer))
def get_all_trainer(request):

    # get user
    user = request.user

    # get all trainer details
    trainers = get_all_trainers_of_this_user(user.id)

    # create response
    return Response({
        'data':trainers
    })







