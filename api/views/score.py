from api.models.trainer import Trainer
from api.models.score import Score, ScoreSerializer
from django.contrib.auth.models import User
from django.conf import settings

# import rest_framework

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from django.core.cache import cache
from api.redis_access import get_cache_name

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

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


def get_all_score(user_id):
    scr = Score.objects.filter(
        userId=user_id,
        analysis_done='TRUE'
        )
    return scr


def add_more_info_to_score(score, data):

    ds = score.dataset
    model = score.trainer
    pass


def get_score_details_from_request(request):

    data = request.POST

    details = {
        'compare_with': data.get('compare_with') if data.get('compare_with') and len(data.get('compare_with')) > 0 else "",
        'compare_type': data.get('compare_type') if data.get('compare_type') and len(data.get('compare_type')) > 0 else "",
        'name': data.get('name') if data.get('name') and len(data.get('name')) > 0 else "Unnamed",
        'dimension': data.get('dimension') if data.get('dimension') and len(data.get('dimension')) > 0 else "",
        # 'measure': data.get('measure') if data.get('measure') and len(data.get('measure')) > 0 else "",
    }

    return details


def list_to_string(list_obj):
    string_ = ", ".join(list_obj)
    return string_


def read_utf8_columns_from_meta_data(meta_data):
    utf8_columns = meta_data.get('utf8_columns')
    if utf8_columns != None:
        return list_to_string(utf8_columns)
    else:
        return ""


def read_ignore_column_suggestions_from_meta_data(ds):
    dict_data = []
    meta_data = ds.get_meta()
    ignore_columns_json_data = meta_data.get('ignore_column_suggestions', {})
    measure_suggetions_json_data = meta_data.get('measure_suggestions', "")
    for key in ignore_columns_json_data:
        dict_data += ignore_columns_json_data[key]
    return list_to_string(dict_data), \
           list_to_string(measure_suggetions_json_data), \
           read_utf8_columns_from_meta_data(meta_data)


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
    """
    Creates score based on already existing trained model.
    Creates database entry on score.
    Creates local folder for score and config
    Creates Directories on EMR
    Create configuration based on selected models
    Copy configuration to EMR
    Run Master Script
    :param request: user, model Id, dataset_id, App ID and other details
    :return: JSON formatted score details
    """

    user = request.user
    # collect details from request
    details = get_details_from_request(request)

    # create database entry for score
    scr = Score.make(details=details, userId=user.id)
    # results = scr.read_score_details()
    result_column_from_model = scr.get_dimension_name_from_model()

    # create response
    return Response({'details': ScoreSerializer(scr).data,
                     'result_column_from_model':result_column_from_model})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def setup_and_call_script(request):
    """
    :param request:
    :return:
    """
    user = request.user
    req_details = get_score_details_from_request(request)

    scr = get_score(request)
    scr.setup_and_call(req_details)

    results = scr.read_score_details()

    # create response
    return Response({'details': ScoreSerializer(scr).data,
                     'results': results})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_column_data(request):
    """
    Set configuration details
    :param request: Trainer Id
    :return: Success Message
    """
    scr = get_score(request)

    from api.views.dataset import get_dataset_from_data_from_id
    ds = get_dataset_from_data_from_id(scr.dataset_id)
    ignore_column_suggestions, measure_suggetions_json_data, utf8_columns = read_ignore_column_suggestions_from_meta_data(ds)

    data = {}
    for x in ["ignore", "date", "date_format"]:
        if request.POST.has_key(x):
            data[x] = "" if request.POST[x] == "null" else request.POST[x]

    data['ignore_column_suggestions'] = ignore_column_suggestions
    data['measure_suggetions_json_data'] = measure_suggetions_json_data
    data["utf8_columns"] = utf8_columns
    scr.set_column_data(data)
    return Response({'message': "Successfuly set column data"})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def retrieve_score(request):
    """
    Get a score details
    :param request: Score Id
    :return: JSON formatted details
    """
    user = request.user

    scr = get_score(request)

    details = ScoreSerializer(scr).data


    cache_name = get_cache_name(scr)

    data = cache.get(cache_name)
    if data is None:
        data = scr.read_score_details()
        cache.set(cache_name, data)

    # results['feature'] = trainer_feature_dummy_data

    # create response
    return Response({
        'trainer': details,
        'results': data,
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def retrieve_all_score(request):
    """
    List all the scores
    :param request: App Id
    :return: JSON formatted score deatils
    """
    user = request.user
    app_id = request.query_params.get("app_id")
    scrs = get_all_score_of_this_user(user.id, app_id)
    return Response({'data': scrs})


@api_view(['PUT'])
@renderer_classes((JSONRenderer, ),)
def edit_score(request):
    """
    Edit the score name
    :param request: Score Id
    :return: JSON score details
    """
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
    """
    Delete Score
    :param request: Score Id
    :return: Delete Message
    """
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
    """
    Test Api
    :param request:
    :return:
    """
    from api.get_user import get_username
    print get_username().user
    # id = 59
    # score = get_score_using_id(id)
    #
    # result = score.get_score_story_data()
    return HttpResponse("Hello, world. You're at the polls index.")


