import os
import getpass
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from subprocess import call
import subprocess
import glob

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
    return Errand.objects.get(pk=id)


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
    for key, val in enumerate(ignore_columns_json_data):
        dict_data += val
    return list_to_string(dict_data)

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
        return Response({"message": "Unsuccessfully!!"})

    errand = Errand.make(request.POST, userId)
    return Response({"message": "Successfully created errand", "data": ErrandSerializer(errand).data})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def preview(request):
    e = get_errand(request)
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
    ignore_column_suggestions = read_ignore_column_suggestions_from_meta_data(ds)

    data = {}
    for x in ["ignore", "date", "date_format"]:
        if request.POST.has_key(x):
            data[x] = request.POST[x]
    print(data)
    data['ignore_column_suggestions'] = ignore_column_suggestions
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

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results(request):
    e = get_errand(request)
    return Response(e.get_tree_results())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results_raw(request):
    e = get_errand(request)
    return Response(e.get_tree_results_raw())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_narratives(request):
    e = get_errand(request)
    return Response(e.get_tree_narratives())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_chi_results(request):
    e = get_errand(request)
    return Response(e.get_chi_results())

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
    trend_data = e.get_trend_analysis()

    # trend_data = {
    #   "trend_data": [
    #       {
    #         "key1": "Nov-2015",
    #         "key": "2015-12-09",
    #         "value": 10755.22
    #       },
    #       {
    #         "key1": "Nov-2015",
    #         "key": "2015-11-30",
    #         "value": 5096.99
    #       },
    #       {
    #           "key1": "Nov-2015",
    #           "key": "2015-10-30",
    #           "value": 7096.99
    #       },
    #       {
    #           "key1": "Nov-2015",
    #           "key": "2015-9-30",
    #           "value": 6096.99
    #       },
    #       {
    #           "key1": "Nov-2015",
    #           "key": "2015-8-30",
    #           "value": 5000.99
    #       }
    #     ],
    #   "narratives": {
    #     "sub_heading": "This section provides insights on how ONLINE_SPEND is performing over time and captures the most significant moments that defined the overall pattern or trend over the observation period.",
    #     "heading": "Trend Analysis",
    #     "summary": [
    #       "The dataset contains DATE_UPDATE figures for a period of 4 years and 3months. The values of DATE_UPDATE have decreased by 59.39% over the last 4 years and 3months, from $10748.49 in Sep-2003 to $4365.17 in Feb-2017. The total DATE_UPDATE was $37587370.46. with the average value per day being $25058.25. ",
    #       " The largest decrease in DATE_UPDATE happened in Jan-2012, when it sharply decreased by 89.82% (from $47517.41 to $37574.03). ",
    #       " While there were many ups and downs, the longest streak of continuous decrease (by absolute value) was experienced between Feb-2013 and Oct-2011, when it decreased from $31791.59 to $167.42.Driven by the strong negative growth, sales seem to be on negative trend. However, the DATE_UPDATE figures are unlikely to follow a seasonal pattern during this period."
    #     ]
    #   }
    # }

    return Response({
        'trend': trend_data
    })

