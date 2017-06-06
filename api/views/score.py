from api.models.trainer import Trainer
from api.models.score import Score, ScoreSerializer
from django.contrib.auth.models import User
from django.conf import settings

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


def get_all_score_of_this_user(user_id, app_id):

    scr = Score.objects.filter(
        userId=user_id,
        analysis_done='TRUE',
        app_id=app_id
        )
    results = []
    user = User.objects.get(pk=user_id)
    profile = user.profile.rs()

    for score in scr:
        score_serial = ScoreSerializer(score).data
        score_serial["sid"] = "s" + str(score.id)
        score_serial['username'] = profile['username']
        # score_serial['results'] = score.read_score_details()
        results.append(score_serial)

    return results

def add_more_info_to_score(score, data):

    ds = score.dataset
    model = score.trainer
    pass


def get_details_from_request(request):
    data = request.data
    details = dict()
    details['name'] = data.get("name")
    details['dataset_id'] = data.get("dataset_id")
    details['trainer_id'] = data.get("trainer_id")
    details['model_name'] = data.get('model_name').split("-")[0]
    details["app_id"] = request.query_params.get("app_id")
    # details['model_name'] = "Random Forest"


    return details


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def create_score(request):

    user = request.user
    # collect details from request
    details = get_details_from_request(request)

    # create database entry for score
    scr = Score.make(details=details, userId=user.id)
    results = scr.read_score_details()

    # create response
    return Response({'details': ScoreSerializer(scr).data,
                     'results': results})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def retrieve_score(request):
    user = request.user

    scr = get_score(request)

    details = ScoreSerializer(scr).data
    results = scr.read_score_details()

    return Response({
        "details": details,
        "results": results
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def retrieve_all_score(request):
    user = request.user
    app_id = request.query_params.get("app_id")
    scrs = get_all_score_of_this_user(user.id, app_id)
    return Response({'data': scrs})


@api_view(['PUT'])
@renderer_classes((JSONRenderer, ),)
def edit_score(request):
    id = request.data['id']
    score = get_score_using_id(id)

    score.change_name(request.data['name'])

    details = ScoreSerializer(score).data

    return Response({
        "details": details
    })


@api_view(['DELETE'])
@renderer_classes((JSONRenderer, ),)
def delete_score(request):
    id = request.data['id']
    score = get_score_using_id(id)

    score.delete()

    return Response({'message': 'Score has been deleted'})


def download_file(request):
    score = get_score(request)

    ds = score.dataset
    import csv
    import os
    from django.http import HttpResponse, Http404
    from django.utils.encoding import smart_str

    path_to_file = settings.BASE_DIR + "/" + ds.input_file.name


    if os.path.exists(path_to_file):
        with open(path_to_file, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="text/csv")
            response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(path_to_file)
            return response

    return Http404


from django.http import HttpResponse

def unknown_api(request):
    from api.get_user import get_username
    print get_username().user
    # id = 59
    # score = get_score_using_id(id)
    #
    # result = score.get_score_story_data()
    return HttpResponse("Hello, world. You're at the polls index.")
