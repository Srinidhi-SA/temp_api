# import models

from api.models.trainer import Trainer, TrainerSerializer
from api.models.dataset import Dataset, DatasetSerializer

from api.views.dataset import add_more_info_to_dataset
from django.contrib.auth.models import User
import json
from django.conf import settings
from api.views.joblog import submit_masterjob

EMR_INFO = settings.EMR
emr_home_path = EMR_INFO.get('home_path')


# import views

# import rest_framework

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


from django.core.cache import cache
from api.redis_access import get_cache_name

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)


def get_trainer(request):
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


def get_all_trainers_of_this_user(user_id, app_id):

    tr = Trainer.objects.filter(
        userId=user_id,
        analysis_done='TRUE',
        app_id=app_id
        )
    results = []
    user = User.objects.get(pk=user_id)
    profile = user.profile.rs()

    for t in tr:
        trainer_serialize = TrainerSerializer(t).data
        trainer_serialize['username'] = profile['username']
        trainer_serialize['dataset'] = add_more_info_to_dataset(t.dataset)
        # trainer_serialize['results'] = t.read_trainer_details()
        results.append(trainer_serialize)

    return results


def get_all_trainers(user_id):
    tr = Trainer.objects.filter(
        userId=user_id,
        analysis_done='TRUE'
    )

    return tr


def get_trainer_details_from_request(request):

    data = request.POST

    details = {
        'compare_with': data.get('compare_with') if data.get('compare_with') and len(data.get('compare_with')) > 0 else "",
        'compare_type': data.get('compare_type') if data.get('compare_type') and len(data.get('compare_type')) > 0 else "",
        'train_value': data.get('train_value') if data.get('train_value') and len(data.get('train_value')) > 0 else "",
        'name': data.get('story_name') if data.get('story_name') and len(data.get('story_name')) > 0 else "Unnamed",
        'dimension': data.get('dimension') if data.get('dimension') and len(data.get('dimension')) > 0 else "",
        'dataset_id': int(data.get('dataset_id')) if data.get('dataset_id') and len(data.get('dataset_id')) > 0 else 1,
    }

    app_id = request.query_params.get("app_id")
    print "-------trainer------------>app_id<----------------", app_id, request.query_params
    details["app_id"] = app_id

    # print details
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


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def create_trainer(request):
    """
    Creates Trainer (Model)
    Creates entry in Trained table.
    Creates local directories.
    :param request: user and data
    :return: JSON formatted trainer details
    """
    # print "*"*40
    # print request.POST
    # get user
    user = request.user

    # collect info from request
    details = get_trainer_details_from_request(request)

    # create database entry
    tr = Trainer.make(details=details, userId=user.id)

    details = TrainerSerializer(tr).data


    # create response
    return  Response({
        'trainer': details,
        # 'results': results,
    })


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def setup_and_call_script(request):
    """
    Adds more configuration details.
    Creates config file locally and copies to EMR.
    Create directory structure at EMR
    Run Master Script
    :param request: Trainer Id, name and details
    :return: JSON formatted model details and results
    """
    # print "--/" * 40
    # print request.POST
    # get trainer object from request
    trainer = get_trainer(request)

    req_details = get_trainer_details_from_request(request)

    # setup and create
    trainer.setup_and_call(req_details)
    trainer.name = req_details.get("name")
    trainer.analysis_done = 'TRUE'
    trainer.save()

    details = TrainerSerializer(trainer).data
    results = trainer.read_trainer_details()
    # results['feature'] = trainer_feature_dummy_data

    # create response
    return Response({
        'trainer': details,
        'results': results,
    })


@api_view(['POST'])
@renderer_classes((JSONRenderer, ), )
def set_trainer_measure(request):
    pass


@api_view(['GET'])
@renderer_classes((JSONRenderer, ), )
def retrieve_trainer(request):
    """
    Get a trainer detail
    :param request: Trainer Id
    :return: JSON formatted trainer details and results
    """

    # get trainer object from request
    trainer = get_trainer(request)

    # serialize trainer
    details = TrainerSerializer(trainer).data

    cache_name = get_cache_name(trainer)

    data = cache.get(cache_name)
    if data is None:
        data = trainer.read_trainer_details()
        cache.set(cache_name, data)

    # results['feature'] = trainer_feature_dummy_data

    # create response
    return Response({
        'trainer': details,
        'results': data,
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ), )
def get_all_trainer(request):
    """
    Get all trainer details
    :param request: App Id
    :return: JSON all trainer adetails and results
    """
    # get user
    user = request.user

    # app_id = request.POST["app_id"]
    app_id = request.query_params.get("app_id")

    # get all trainer details
    trainers = get_all_trainers_of_this_user(user.id, app_id)

    # create response
    return Response({
        'data': trainers
    })


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_column_data(request):
    """
    Set configuration details
    :param request: Trainer Id
    :return: Success Message
    """
    tr = get_trainer(request)
    from api.views.dataset import get_dataset_from_data_from_id
    ds = get_dataset_from_data_from_id(tr.dataset_id)
    ignore_column_suggestions, measure_suggetions_json_data, utf8_columns = read_ignore_column_suggestions_from_meta_data(ds)

    data = {}
    for x in ["ignore", "date", "date_format"]:
        if request.POST.has_key(x):
            data[x] = "" if request.POST[x] == "null" else request.POST[x]

    data['ignore_column_suggestions'] = ignore_column_suggestions
    data['measure_suggetions_json_data'] = measure_suggetions_json_data
    data["utf8_columns"] = utf8_columns
    tr.set_column_data(data)
    return Response({'message': "Successfuly set column data"})


@api_view(['PUT'])
@renderer_classes((JSONRenderer, ), )
def edit_trainer(request):
    """
    Edit name of trainer
    :param request: Trainet id
    :return: JSON Formatted trainer detials
    """
    id = request.data['id']
    tr = get_trainer_using_id(id)
    tr.name = request.data['name']
    tr.save()

    # serialize trainer
    details = TrainerSerializer(tr).data
    # results = tr.read_trainer_details()

    # create response
    return Response({
        'trainer': details,
        # 'results': results,
    })


@api_view(['DELETE'])
@renderer_classes((JSONRenderer,),)
def delete_tariner(request):
    """
    Delete trainer
    :param request: Trainer Id
    :return: Delete Message
    """
    id = request.data['id']
    tr = get_trainer_using_id(id)
    tr.delete()

    return Response({'message':'trainer deleted'})


@api_view(['GET'])
def download_file(request):



    trainer = get_trainer(request)

    ds = trainer.dataset


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


from django.http import HttpResponse, Http404
# @api_view(['GET'])
def remote_folder(request):
    from api.lib.fab_helper import remote_uname, \
        create_base_model_and_score_folder, \
        create_model_instance_extended_folder, \
        read_remote
    remote_uname()
    path_dir = '{0}/config.cfg'.format(emr_home_path)
    # read_remote(path_dir)

    tr = get_trainer_using_id(92)

    # print tr.read_data_from_emr()
    # create_base_model_and_score_folder()
    # create_model_instance_extended_folder(1)
    return HttpResponse({
                         'a':'a'})

#
# trainer_feature_dummy_data = [
#     ["Name", "AGE_CATEGORY", "AMOUNT_PAID_NOVEMBER", "STATUS", "BILL_AMOUNT_NOVEMBER", "EDUCATION", "BILL_AMOUNT_DECEMBER", "AMOUNT_PAID_DECEMBER", "STATE", "OCCUPATION", "MARRIAGE"],
#     ["Value", 0.007058221371135741, 0.0028883097720690254, 0.0026129957425838064, 0.0021655785195103493, 0.0012144740424919747, 0.0011479622477891692, 0.0009416868976334556, 0.0008169380994169005, 0.00045068569038685796, 0.00012034484007067192]
# ]








