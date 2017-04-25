import os
import getpass
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from subprocess import call
import subprocess
import glob
import json

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.errand import Errand, ErrandSerializer

from time import sleep

name_map = {
    # 'dview': "Dimension View",
    'measure_dimension_stest': "Measure vs. Dimension",
    'dimension_dimension_stest':'Dimension vs. Dimension',
    'measure_measure_impact':'Measure vs. Measure',
    'prediction_check':'Predictive modeling',
    'desc_analysis':'Descriptive analysis',
}

# Create your views here.


def showme(request):
    return HttpResponse("Alright, this is a test");

def get_errand(request):

    id = request.GET['errand_id'] if request.method == "GET" else request.POST['errand_id']
    try:
        e = Errand.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None

def get_errand_from_id(id):

    try:
        e = Errand.objects.get(pk=id)
        return e
    except Exception as dne_error:
        return None



def list_to_string(list_obj):
    string_  = ", ".join(list_obj)
    return string_

def string_to_list(string_):
    list_ = string_.split(", ")
    return list_

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

def read_utf8_columns_from_meta_data(meta_data):
    utf8_columns = meta_data.get('utf8_columns')
    if utf8_columns != None:
        return list_to_string(utf8_columns)
    else:
        return ""


@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def get_uploaded_files(request):
    return Response({'files': glob.iglob("uploads/errands/*/*.csv")})

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def jack(request):
    return Response({'name': "prakash raman"});

@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def make(request):
    userId = request.query_params.get('userId')
    if userId is None:
        return Response({"upload_error": "User not found. Try logout/login again"})

    try:
        errand = Errand.make(request.POST, userId)
    except Exception as error:
        print error
        return Response({"upload_error": "Can't create story right now. Try after some time!!"})
    return Response({"message": "Successfully created errand", "data": ErrandSerializer(errand).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    e = get_errand(request)
    if e is None:
        return Response({'message': 'Errand not Found!!'})
    return Response({'data': e.get_preview_data()})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_meta(request):
    e = get_errand(request)
    return Response(e.get_meta())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def columns(request):
    e = get_errand(request)
    return Response({'data': e.get_columns()})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_measure(request):
    e = get_errand(request)
    e.set_measure(request.POST['measure'])
    e.compare_with = request.POST['compare_with']
    e.compare_type = request.POST['compare_type']
    e.name = request.POST['story_name']
    e.save()
    e.run_master()

    # analysis done
    e.analysis_done = 'TRUE'
    e.save()
    return Response({'message': "Success", "id": e.id})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_dimension(request):
    e = get_errand(request)
    e.set_dimension(request.POST['dimension'])
    e.compare_with = request.POST['compare_with']
    e.compare_type = request.POST['compare_type']
    e.name = request.POST['story_name']
    e.save()
    e.run_master()

    # analysis done
    e.analysis_done = "TRUE"
    e.save()
    return Response({'message': "Success", "id": e.id})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_column_data(request):
    e = get_errand(request)
    from api.views.dataset import get_dataset_from_data_from_id
    ds = get_dataset_from_data_from_id(e.dataset_id)
    ignore_column_suggestions, measure_suggetions_json_data, utf8_columns = read_ignore_column_suggestions_from_meta_data(ds)

    data = {}
    for x in ["ignore", "date", "date_format"]:
        if request.POST.has_key(x):
            data[x] = "" if request.POST[x] == "null" else request.POST[x]
    print(data)
    data['ignore_column_suggestions'] = ignore_column_suggestions
    data['measure_suggetions_json_data'] = measure_suggetions_json_data
    data["utf8_columns"] = utf8_columns
    e.set_column_data(data)
    return Response({'message': "Successfuly set column data"})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_env(request):
    return Response({'user': getpass.getuser(), 'env': os.environ})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_results(request):
    e = get_errand(request)

    return Response({
        'result': e.get_result(),
        'narratives': e.get_narratives(),
        'dimensions': e.get_dimension_results(),
        'measures': e.get_reg_results()
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_frequency_results(request):
    e = get_errand(request)
    return Response(e.get_frequency_results())
    # return Response({})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results(request):
    e = get_errand(request)
    return Response(e.get_tree_results())
    # return Response({})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results_raw(request):
    e = get_errand(request)
    return Response(e.get_tree_results_raw())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_narratives(request):
    e = get_errand(request)
    return Response(e.get_tree_narratives())
    # return Response({})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_chi_results(request):
    e = get_errand(request)
    return Response(e.get_chi_results())
    # return Response({})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dimension_all_results(request):
    e = get_errand(request)
    # return Response({
    #     "get_frequency_results":{},
    #     "get_tree_results":{},
    #     "get_tree_results_raw":{},
    #     "get_tree_narratives":{},
    #     "get_chi_results":{}
    # })
    return Response({
        "get_frequency_results":e.get_frequency_results(),
        "get_tree_results":e.get_tree_results(),
        "get_tree_results_raw":e.get_tree_results_raw(),
        "get_tree_narratives":e.get_tree_narratives(),
        "get_chi_results":e.get_chi_results()
    })

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_archived(request):

    userId = request.query_params.get('userId')

    es = Errand.objects.filter(
        userId=userId,
        analysis_done='TRUE',
        is_archived='FALSE'
        )

    return Response({'errands': ErrandSerializer(es, many=True).data})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_archived(request):
    e = get_errand(request)
    e.is_archived = 'TRUE'
    e.save()
    return Response({'data': "Successfully archived errand"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def edit(request):
    e = get_errand(request)
    e.name = request.POST['name']
    e.save()
    return Response({"message" : "Updated"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def delete(request):
    Errand.objects.filter(id__in=request.POST['errand_ids'].split(",")).delete()
    return Response({"message": "Deleted"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def configure_data(request):
    return Response({"message": "Data has been configured"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def log_status(request, errand_id=None):
    return Response({"message": "Successfully logged the statuses"})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def quickinfo(request):
    e = get_errand(request)
    print ErrandSerializer(e).data, e.userId
    user_id = e.userId
    from api.views.dataset import get_dataset_from_data_from_id
    from api.models.dataset import DatasetSerializer
    ds = get_dataset_from_data_from_id(e.dataset_id)
    dataset_quickinfo = DatasetSerializer(ds).data

    from django.contrib.auth.models import User
    user = User.objects.get(pk=user_id)
    profile = {}
    if user:
        profile = user.profile.rs()
        profile = {
            "username": profile['username'],
            "full_name": profile['full_name'],
            "email": profile['email']
        }

    # read from option model
    from api.views.option import get_option_for_this_user
    config_details = get_option_for_this_user(user_id)
    analysis_list = []
    for key in config_details:
        if config_details[key] == 'yes' and name_map.get(key, None):
            analysis_list.append(name_map.get(key))

    # read from config file itself
    config_file_script_to_run = e.read_config_file()

    return Response({
        "errand_quickinfo": ErrandSerializer(e).data,
        "dataset_quickinfo": dataset_quickinfo,
        "profile": profile,
        "config_details": analysis_list,
        "config_file_script_to_run": config_file_script_to_run
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def get_trend_analysis(request):
    e = get_errand(request)
    if e is None:
        return Response({
        'trend': {}
    })
    trend_data = e.get_trend_analysis()

    return Response({
        'trend': trend_data
    })


@api_view(['POST'])
# @renderer_classes((JSONRenderer,))
def filter_sample(request):
    # e = get_errand(request)
    dimension = "cities"
    measure = "sales"
    subsetting_data = request.POST

    subsetting_data = subsetting_data.get('data')

    subsetting_data = json.loads(str(subsetting_data))
    print subsetting_data
    main_data = {}

    # errand_id = request.query_params.get('errand_id')
    e = get_errand_from_id('112')

    CONSIDER_COLUMNS = {}
    DIMENSION_FILTER = {}
    MEASURE_FILTER = {}
    consider_columns = []
    for dict_data in subsetting_data:
        if dimension in dict_data:
            fields = dict_data['fields']
            DIMENSION_FILTER[dict_data[dimension]] = [field.keys()[1] for field in fields if field['status'] == True]
            consider_columns.append(dict_data[dimension])
            for field in fields:
                if field['status'] == True:
                    print field.keys()
        elif measure in dict_data:
            consider_columns.append(dict_data[measure])
            MEASURE_FILTER[dict_data[measure]] = {
                "min":dict_data['min'],
                "max":dict_data['max']
            }

    main_data['DIMENSION_FILTER'] = DIMENSION_FILTER
    main_data['MEASURE_FILTER'] = MEASURE_FILTER
    main_data['CONSIDER_COLUMNS'] = {"consider_columns": consider_columns}

    e.add_subsetting_to_column_data(main_data)
    e.save()

    return Response({"message": "result"})


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def drill_down_anova(request):
    import time
    import random
    delay_seconds = random.randint(180,183)
    time.sleep(delay_seconds)
    return Response({"message": "result","delay":delay_seconds})

