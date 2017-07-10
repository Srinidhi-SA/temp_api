import getpass
import glob
import json
import os

from django.http import HttpResponse
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.errand import Errand, ErrandSerializer

from django.core.cache import cache
from api.redis_access import get_cache_name

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

name_map = {
    'measure_dimension_stest': "Measure vs. Dimension",
    'dimension_dimension_stest': 'Dimension vs. Dimension',
    'measure_measure_impact': 'Measure vs. Measure',
    'prediction_check': 'Predictive modeling',
    'desc_analysis': 'Descriptive analysis',
}

# Create your views here.
measure_operations = ["Measure vs. Dimension", 'Measure vs. Measure', 'Descriptive analysis']
dimension_operations = ['Dimension vs. Dimension', 'Predictive modeling', 'Descriptive analysis']

def showme(request):
    return HttpResponse("Alright, this is a test")

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

def get_all_errand(userId):
    es = Errand.objects.filter(
        userId=userId,
        analysis_done='TRUE',
        is_archived='FALSE'
        )
    return es


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
    """
    Creates database entry in errand table.
    Creates hadoop directories.
    :param request: Dataset ID, name, slug and other details
    :return: Message Success
    """
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
    """
    No Implementation
    :param request:
    :return:
    """
    e = get_errand(request)
    if e is None:
        return Response({'message': 'Errand not Found!!'})
    return Response({'data': e.get_preview_data()})

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_meta(request):
    """
    No Implementation
    :param request:
    :return:
    """
    e = get_errand(request)
    return Response(e.get_meta())

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def columns(request):
    """
    No Implementation
    :param request:
    :return:
    """
    e = get_errand(request)
    return Response({'data': e.get_columns()})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_measure(request):
    """
    Start Measure Story.
    Creates Hadoop Directories.
    Creates Configuration and copy it to EMR.
    Run Master Script.
    :param request: Story name and other configuration details
    :return: Errand (Story) Id
    """
    e = get_errand(request)
    e.set_measure(request.POST['measure'])
    e.compare_with = request.POST['compare_with']
    e.compare_type = request.POST['compare_type']
    e.name = request.POST['story_name']
    # e.analysis_done = 'TRUE'
    e.save()
    try:
        e.run_master()
    except Exception as e:
        print e
        return Response({'Exception': "Failure"})

    # analysis done
    # e.analysis_done = 'TRUE'
    e.save()
    return Response({'message': "Success", "id": e.id})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_dimension(request):
    """
    Start Dimension Story.
    Creates Hadoop Directories.
    Creates Configuration and copy it to EMR.
    Run Master Script.
    :param request: Story name and other configuration details
    :return: Errand (Story) Id
    """
    e = get_errand(request)
    e.set_dimension(request.POST['dimension'])
    e.compare_with = request.POST['compare_with']
    e.compare_type = request.POST['compare_type']
    e.name = request.POST['story_name']
    # e.analysis_done = "TRUE"
    e.save()
    try:
        e.run_master()
    except Exception as e:
        print e
        return Response({'Exception': "Failure"})
    # analysis done
    # e.analysis_done = "TRUE"
    e.save()
    return Response({'message': "Success", "id": e.id})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_column_data(request):
    """
    Set Errand related Configurations
    :param request: Errand Id and configuration details
    :return: Errand Id
    """
    e = get_errand(request)
    from api.views.dataset import get_dataset_from_data_from_id
    ds = get_dataset_from_data_from_id(e.dataset_id)
    ignore_column_suggestions, measure_suggetions_json_data, utf8_columns = read_ignore_column_suggestions_from_meta_data(ds)

    data = {}
    for x in ["ignore", "date", "date_format"]:
        if request.POST.has_key(x):
            data[x] = "" if request.POST[x] == "null" else request.POST[x]
    # print(data)
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
    """
    Get Story Details
    :param request: Errand Id
    :return: JSON formatted story details
    """

    e = get_errand(request)
    cache_name = get_cache_name(e)

    data = cache.get(cache_name)
    if data is None:

        data = {
            'result': e.get_result(),
            'narratives': e.get_narratives(),
            'dimensions': e.get_dimension_results(),
            'measures': e.get_reg_results(),
            'decision_tree_narrative': e.get_decision_tree_regression_narratives(),
            'decision_tree_result': e.get_decision_tree_regression_results(),
            'density_histogram': e.get_density_histogram()
        }

        cache.set(cache_name, data)

    return Response(data)


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_result_list_measures(request):
    """
    Get Story Details
    :param request: Errand Id
    :return: JSON formatted story details
    """
    e = get_errand(request)

    cache_name = get_cache_name(e, extra='result_list')
    data = cache.get(cache_name)

    if data is None:

        data = {
            'result': e.get_result(),
            'narratives': e.get_narratives(),
            'dimensions': e.get_dimension_results(),
            'measures': e.get_reg_results(),
            'decision_tree_narrative': e.get_decision_tree_regression_narratives(),
            'decision_tree_result': e.get_decision_tree_regression_results(),
            'density_histogram': e.get_density_histogram(),
        }

        name = {
            'dimensions': 'Anova',
            'measures':'Regression',
        }
        trend = e.get_trend_analysis()

        final_array = []
        if data['result'] != {} and data['narratives'] != {}:
            final_array.append('Distribution')

        if trend == {}:
            pass
        else:
            final_array.append('Trend')

        if data['dimensions'] == {}:
            pass
        else:
            final_array.append('Anova')

        if data['measures'] == {}:
            pass
        else:
            final_array.append('Regression')

        if data['decision_tree_result'] != {} and data['decision_tree_narrative'] != {}:
            final_array.append('DecisionTree')

        data = {'result': final_array}
        cache.set(cache_name, data)

    return Response(data)


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_decision_tree(request):
    """
    Get anova of Errand
    :param request: Errand Id
    :return: JSON formatted anova details
    """
    e = get_errand(request)
    return Response({
        'decision_tree_narrative': e.get_decision_tree_regression_narratives(),
        'decision_tree_result': e.get_decision_tree_regression_results(),
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_distribution(request):
    """
    Get distribution results of Errand
    :param request: Errand Id
    :return: JSON formatted distribution details
    """
    e = get_errand(request)
    return Response({
        'result': e.get_result(),
        'narratives': e.get_narratives()
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_regression(request):
    """
    Get regression results of Errand
    :param request: Errand Id
    :return: JSON formatted regression details
    """
    e = get_errand(request)
    return Response({
        'measures': e.get_reg_results()
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_anova(request):
    """
    Get anova of Errand
    :param request: Errand Id
    :return: JSON formatted anova details
    """
    e = get_errand(request)
    return Response({
        'dimensions': e.get_dimension_results(),
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_desc_stats(request):
    """
    Get desc stats of Errand
    :param request: Errand Id
    :return: JSON formatted desc stats details
    """
    e = get_errand(request)
    return Response(e.get_result())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_density_histogram(request):
    """
    Get density histogram of Errand
    :param request: Errand Id
    :return: JSON formatted density histogram details
    """
    e = get_errand(request)
    return Response(e.get_density_histogram())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_decision_tree_regression_results(request):
    """
    Get decision tree regression results of Errand
    :param request: Errand Id
    :return: JSON formatted decision tree regression result details
    """
    e = get_errand(request)
    return Response(e.get_decision_tree_regression_results())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_decision_tree_regression_narratives(request):
    """
    Get decision tree regression narrative of Errand
    :param request: Errand Id
    :return: JSON formatted decision tree regression narrative details
    """
    e = get_errand(request)
    return Response(e.get_decision_tree_regression_narratives())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_reg_results(request):
    """
    Get regression results of Errand
    :param request: Errand Id
    :return: JSON formatted regression details
    """
    e = get_errand(request)
    return Response(e.get_reg_results())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dimension_results(request):
    """
    Get dimension results of Errand
    :param request: Errand Id
    :return: JSON formatted dimension details
    """
    e = get_errand(request)
    return Response(e.get_dimension_results())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_narratives(request):
    """
    Get Narrative results of Errand
    :param request: Errand Id
    :return: JSON formatted narrative details
    """
    e = get_errand(request)
    return Response(e.get_narratives())


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_frequency_results(request):
    """
    Get frequency results of Errand
    :param request: Errand Id
    :return: JSON formatted frequency details
    """
    e = get_errand(request)
    return Response(e.get_frequency_results())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results(request):
    """
    Get decision tree results of Errand
    :param request: Errand Id
    :return: JSON formatted tree results
    """
    e = get_errand(request)
    return Response(e.get_tree_results())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_results_raw(request):
    """
    Get decision tree results of Errand
    :param request: Errand Id
    :return: JSON formatted tree results
    """
    e = get_errand(request)
    return Response(e.get_tree_results_raw())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_tree_narratives(request):
    """
    Get decision tree narratives of Errand
    :param request: Errand Id
    :return: JSON formatted tree narratives
    """
    e = get_errand(request)
    return Response(e.get_tree_narratives())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_chi_results(request):
    """
    Get ChiSquare results of Errand
    :param request: Errand Id
    :return: JSON formatted ChiSquare results
    """
    e = get_errand(request)
    return Response(e.get_chi_results())
    # return Response({})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dimension_all_results(request):
    """
    Get All Dimension related results
    :param request: Errand Id
    :return: JSON formatted all results of dimension story
    """
    e = get_errand(request)
    cache_name = get_cache_name(e)

    data = cache.get(cache_name)
    if data is None:
        data = {
            "get_frequency_results":e.get_frequency_results(),
            "get_tree_results":e.get_tree_results(),
            "get_tree_results_raw":e.get_tree_results_raw(),
            "get_tree_narratives":e.get_tree_narratives(),
            "get_chi_results":e.get_chi_results()
        }

        cache.set(cache_name, data)

    return Response(data)


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_archived(request):
    """
    List of all Errands not archived.
    :param request: Errand Id
    :return: List of errands
    """

    userId = request.query_params.get('userId')

    es = get_all_errand(userId)

    es_info = []
    for e in es:
        es_info.append(add_more_info_to_errand_info(e))

    # return Response({'errands': ErrandSerializer(es, many=True).data})
    return Response({'errands': es_info})


@api_view(['POST'])
@renderer_classes((JSONRenderer, ))
def set_archived(request):
    """
    Mark errand as archived (Like hide).
    :param request: Errand Id
    :return: Success Message
    """
    e = get_errand(request)
    e.is_archived = 'TRUE'
    e.save()
    return Response({'data': "Successfully archived errand"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def edit(request):
    """
    Edit name of errand.
    :param request: Errand Id and new name
    :return: Update Message
    """
    e = get_errand(request)
    e.name = request.POST['name']
    e.save()
    return Response({"message": "Updated"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def delete(request):
    """
    Delete an errand.
    :param request: Errand Id
    :return: Delete Message
    """
    Errand.objects.filter(id__in=request.POST['errand_ids'].split(",")).delete()
    return Response({"message": "Deleted"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def configure_data(request):
    """
    No Implementation
    :param request:
    :return:
    """
    return Response({"message": "Data has been configured"})


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def log_status(request, errand_id=None):
    """
    No Implementation
    :param request:
    :param errand_id:
    :return:
    """
    return Response({"message": "Successfully logged the statuses"})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ),)
def quickinfo(request):
    """
    No Implementation
    :param request:
    :return:
    """
    e = get_errand(request)
    # print ErrandSerializer(e).data, e.userId
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

    errand_info = ErrandSerializer(e).data

    if errand_info.get("measure"):
        errand_info["variable_type"] = "measure"
        errand_info["variable_selected"] = errand_info.get("measure")
    else:
        errand_info["variable_type"] = "dimension"
        errand_info["variable_selected"] = errand_info.get("dimension")

    errand_info["dataset_name"] = dataset_quickinfo.get("name")
    errand_info["dataset_created_at"] = dataset_quickinfo.get("created_at")
    errand_info["dataset_creator"] = dataset_quickinfo.get("")
    errand_info["username"] = profile.get("username")
    errand_info["analysis_list"] = analysis_list

    return Response({
        "errand_quickinfo": errand_info,
        "dataset_quickinfo": dataset_quickinfo,
        "profile": profile,
        "config_details": analysis_list,
        "config_file_script_to_run": config_file_script_to_run
    })


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def get_trend_analysis(request):
    """
    Get trend analysis results of Errand
    :param request: Errand Id
    :return: JSON formatted trend data
    """
    e = get_errand(request)
    if e is None:
        return Response({
        'trend': {}
    })
    trend_data = e.get_trend_analysis()

    return Response({
        'trend': trend_data
        # 'trend': trend_narraives_demo
    })


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def filter_sample(request):
    """
    No umplementation
    :param request:
    :return:
    """
    # e = get_errand(request)
    dimension = "cities"
    measure = "sales"
    subsetting_data = request.POST

    subsetting_data = subsetting_data.get('data')

    subsetting_data = json.loads(str(subsetting_data))
    # print subsetting_data
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
                    pass
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
    """
    No Implementation
    :param request:
    :return:
    """
    import time
    import random
    delay_seconds = random.randint(180,183)
    time.sleep(delay_seconds)
    return Response({"message": "result","delay":delay_seconds})


def add_more_info_to_errand_info(e):

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

    # read from config file itself measure_operations
    config_file_script_to_run = e.read_config_file()
    files_to_run = config_file_script_to_run.get('analysis_list', None)

    errand_info = ErrandSerializer(e).data

    if errand_info.get("measure"):
        errand_info["variable_type"] = "measure"
        errand_info["variable_selected"] = errand_info.get("measure")
        analysis_list = list(set(measure_operations) - (set(measure_operations) - set(files_to_run)))
    else:
        errand_info["variable_type"] = "dimension"
        errand_info["variable_selected"] = errand_info.get("dimension")
        analysis_list = list(set(dimension_operations) - (set(measure_operations) - set(files_to_run)))

    errand_info["dataset_name"] = dataset_quickinfo.get("name")
    errand_info["dataset_created_at"] = dataset_quickinfo.get("created_at")
    errand_info["dataset_creator"] = dataset_quickinfo.get("")
    errand_info["username"] = profile.get("username")
    errand_info["analysis_list"] = analysis_list

    return errand_info



trend_narraives_demo = {
  "narratives": {
    "SectionHeading": "Sales Performance Report",
    "card1":{
      "bubbleData":[
                {"value":"232%","text":"Overall growth in sales over the last 12 months"},
                {"value":"156%","text":"Largest growth in sales happened in Feb 2016"}
                ],
      "paragraphs":[
                {
                  "content": [
                    " This section provides insights on how Sales is performing over time and captures the most significant moments that defined the overall pattern or trend over the observation period. "
                  ],
                  "header": "How Sales is Changing over Time "
                },
                {
                  "content": [
                    " The dataset contains sales figures for a 12-month period. The values of sales have grown by 232% during the same time, from $4,406 in Jan 2014 to $14,628 in Dec 2014. The total sales were $146,516 for the last 12 months, with the average sales per month being $12,209. Interestingly, the sales contribution from a streak of 3 months (Aug-Oct) amounts to a total of $651,037, which is almost half of the overall sales for the 12-month period. "
                  ],
                  "header": ""
                },
                {
                  "content": [
                    " Driven by the strong increase, sales seem to be on positive trend which is statistically significant. However, the sales figures are unlikely to follow a seasonal pattern during this period. "
                  ],
                  "header": ""
                }

      ],
      "chart":{"data":[
            {
              "key1": "Jan-2017",
              "value": 7500.0,
              "key": "2017-01-01"
            },
            {
              "key1": "Feb-2017",
              "value": 3000.0,
              "key": "2017-02-01"
            },
            {
              "key1": "Mar-2017",
              "value": 2100.0,
              "key": "2017-03-01"
            },
            {
              "key1": "Apr-2017",
              "value": 5100.0,
              "key": "2017-04-01"
            },
            {
              "key1": "May-2017",
              "value": 3600.0,
              "key": "2017-05-01"
            },
            {
              "key1": "Jun-2017",
              "value": 1500.0,
              "key": "2017-06-01"
            },
            {
              "key1": "Jul-2017",
              "value": 10800.0,
              "key": "2017-07-01"
            },
            {
              "key1": "Aug-2017",
              "value": 900.0,
              "key": "2017-08-01"
            },
            {
              "key1": "Sep-2017",
              "value": 3300.0,
              "key": "2017-09-24"
            },
            {
              "key1": "Oct-2017",
              "value": 600.0,
              "key": "2017-10-01"
            },
            {
              "key1": "Nov-2017",
              "value": 600.0,
              "key": "2017-11-01"
            },
            {
              "key1": "Dec-2017",
              "value": 10800.0,
              "key": "2017-12-01"
            }
      ],"format":"%b-%y"},
    },
    "card2":{
      "table1":[
                {"increase":"Largest (Percentage)", "period":"Feb 2016","increased_by":"128%", "range":"$4406 to $10085"},
                {"increase":"Largest (Absolute)", "period":"Mar 2016", "increased_by":"$ 5250", "range":"$4400 to $9650"},
                {"increase":"Longest Streak", "period":"Jun-Aug 14", "increased_by":"$5350", "range":"$9263 to $14628"}
              ],
      "table2":[
                {"decrease":"Largest (Percentage)", "period":"Feb 2016","decreased_by":"128%", "range":"$4406 to $10085"},
                {"decrease":"Largest (Absolute)", "period":"Mar 2016", "decreased_by":"$ 5250", "range":"$4400 to $9650"},
                {"decrease":"Longest Streak", "period":"Jun-Aug 14", "decreased_by":"$5350", "range":"$9263 to $14628"}
              ],
      "paragraphs":[
                {
                  "content": [
                    " The sales figures hit a peak of $25,306 in Aug 2014, which resulted after a continuous streak of growth for 2 months (Jul-Aug). The most significant factor that fuelled this strong run is the product category, Local Deals. Sales contribution from Local Deals in Aug 2014 increased by over 4 percentage points (18% vis-\\u00e0-vis 13.6%) compared to rest of the observation period. "
                  ],
                  "header": " Highest and Lowest Points of Sales "
                },
                {
                  "content": [
                    " However, there are also few months when sales were lagging and didn\\u2019t do very well. The most notable among them was Jun 2014 and values for sales dropped to $9,263 from 12,263 in May 2014. This was primarily due to sharp decline in sales from 18 to 24 Age Group, which observed a decline of over 6 percentage points (21% vs. 15%). "
                  ],
                  "header": ""
                },
                {
                  "content":[
                      """
                      <ul>
                      <li>City has been very instrumental in driving sales growth, as New York and Chicago witnessed the highest overall growth rates of 50% and 38% respectively. </li>
                      <li>Product categories, such as Vegetables (35%) and Diary (32%), were also contributing significantly to the overall increase. </li>
                      </ul>
                      """
                  ],
                  "header": " Significant factors that drive increase in Sales "
                },
                {
                  "content": [
                      """
                      <ul>
                      <li>Deal Type has been an area of concern, as Adventures and Gourmet shrunk over 56% and 43% respectively.</li>
                      <li>45 to 54 age group declined by 25% from $10,350 to $7,800 and it had a significant impact on overall growth as the age group accounted for 30% of the total sales in Jan 2014.</li>
                      </ul>
                      """
                  ],
                  "header": " Significant factors that drag Sales down "
                }

      ]

    },
    "card3":{
      "paragraphs": [
        {
          "content": [
            " The predicted values for sales, estimated based on historical trend and seasonality, for the next six months lie between $12,960 and $13,383. It is expected to cross 13,000-mark in Feb 2015 and generate total sales of about $13,383 in Jun 2015, which represents an overall decli ne of 9% (CAGR)."
          ],
          "header": " Forecast for the next 6 months "
        }
      ],
      "chart": {"data":[
            {
              "key1": "Jan-2017",
              "value": 7500.0,
              "key": "2017-01-01"
            },
            {
              "key1": "Feb-2017",
              "value": 3000.0,
              "key": "2017-02-01"
            },
            {
              "key1": "Mar-2017",
              "value": 2100.0,
              "key": "2017-03-01"
            },
            {
              "key1": "Apr-2017",
              "value": 5100.0,
              "key": "2017-04-01"
            },
            {
              "key1": "May-2017",
              "value": 3600.0,
              "key": "2017-05-01"
            },
            {
              "key1": "Jun-2017",
              "predicted_value": 1500.0,
              "value":1500.0,
              "key": "2017-06-01"
            },
            {
              "key1": "Jul-2017",
              "predicted_value": 10800.0,
              "key": "2017-07-01"
            },
            {
              "key1": "Aug-2017",
              "predicted_value": 900.0,
              "key": "2017-08-01"
            }
      ],"format":"%b-%y"}
    }
}
}

anova_dummy_data_2 = {
  "narratives": {
    "heading": "Sales Performance Analysis",
    "main_card": {
      "charts": {
        "effect_size": {
          "heading": "",
          "data": {
            "City": 0.76,
            "Marketing Channel": 0.64,
            "Deal Type": 0.45
          },
          "labels": {
            "Dimension": "Effect Size"
          }
        }
      },
      "header": "Relationship between Sales and Other Dimensions",
      "paragraphs": [{
          "header": "",
          "content": ["There are 20 dimensions in the dataset and 5 of them (including City, Marketing Channel, Deal Type, etc.) have significant influence on sales.  It implies that specific categories within each of the dimensions show considerable amount of variation in sales. However, other dimensions, such as Product Group, Subcategory, etc., don't show significant difference in sales values across categories."]
        },
        {
          "header": "",
          "content": ["The chart below displays the impact of key dimensions on sales, as measured by effect size. Let us take a deeper look at some of the most important dimensions that show significant amount of difference in average sales."]
        }
      ]
    },
    "cards": [
	{
        "card1": {
          "heading": "Impact of City on Sales",
          "charts": {
            "group_by_total": {
              "heading": "",
              "data": {
                "Miami": 7860101.948559997,
                "New York": 2.016576714184001E7,
                "Los Angeles": 1.1850875860800004E7,
                "Las Vegas": 3783720.639999998
              },
              "labels": {
                "City": "Sales"
              }
            },
            "group_by_mean": {
              "heading": "",
              "data": {
                "Miami": 60101.948559997,
                "New York": 65767.141840,
                "Los Angeles": 850875.8608,
                "Las Vegas": 37830.639999998
              },
              "labels": {
                "City": "Sales"
              }
            }
          },
          "paragraphs": [{
            "header": "Overview",
            "content": [
                "The top 3 cities account for about 25% of the total sales.  Being the largest contributor, total sales from Miami amounts to $122,589 that accounts for about 10% of the total sales. However, Sacramento has the highest average sales of $295, whereas the average for Miami is $270. On the other hand, Minneapolis contributes to just 8% of the total sales with the average being 79. Interestingly, the effect of city on sales is significant as the average sales seem to be different across various cities. The average sale figures from Miami are typically 18% higher than those of Detroit and Boise."]
          },
          {
                "header": "Key Factors Influencing Sales from Miami",
                "content": [
                    "High contribution of sales from Miami is characterized by the influence of key dimensions, such as Sales Person, Region, and Channel. Certain specific segments from those dimensions are more likely to explain Miami's significant sales turnover.  For instance, John Greg (40%) along with Karl (35%), the top performing Sales Persons account for 75% of the overall sales from Miami. In terms of Region, Americas (54%) and Europe (39%) account for 93% of the total sales. Among the channels, Convenience Stores has got the major chunk of sales from Miami, accounting for 43%."]
          }
          ],
          "bubble_data": [{
            "value": "34.87 Million",
            "text": "New York is the largest contributor to sales"
          },
            {
                "value": "234.87K",
                "text": "San Francisco has the highest average sales"
            }
          ]
        },
        "card2": {
            "heading": "Miami's Sales Performance over Time",
            "charts": {
              "trend_chart": {
                "heading": "",
                "data": [
                  ['date', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06', '2013-01-07', '2013-01-08', '2013-01-09', '2013-01-10', '2013-01-11', '2013-01-12', '2014-01-01', '2014-01-02', '2015-01-03', '2015-01-04'],
                  # ["x", "Jan-12", "Feb-12", "Mar-12", "Apr-12", "May-12", "Jun-12", "Jul-12", "Aug-12", "Sep-12", "Oct-12", "Nov-12", "Dec-12", "Jan-13", "Feb-13", "Mar-13", "Apr-13"],
                  ["Total Sales", 43223.875, 56400.8571428571, 39982.5455, 46732.8182, 56061, 85415, 59389.67, 4241.8, 53862.3, 39618.625, 5645.3, 35795.4, 43730.3, 57595.7142857143, 57147, 58620.875],
                  ["Miami Sales", 5164.8461538462, 3277.0882352941, 3858.064516129, 3920.5588235294, 4241.3461538462, 4123.83, 2893.2857142857, 2937, 3174.7297297297, 4039.0606060606, 3525.8, 254.925, 3160.1388888889, 3534.1428571429, 4045.2258064516, 3136.775]
                ],
                "format": '%b-%d-%Y'
              }
            },
            "paragraphs": [{
                "header": "",
                "content": ["Sales contribution from Miami is predominantly in line with the overall sales trend, as the city observed similar ups and downs during the observation period. The overall sales figures hit a peak of $25,306 in Aug 2014, when it grew by over 32% compared to the previous month. Interestingly, Miami's sales also sharply rose and hit a peak of $25,155 during the same period. The last three months, between Jul 2014 and Sep 2014, accounted for almost half of Miami's total sales, i.e. $62,560. Driven by this buoyant growth off late, the outlook for Miami's next quarter sales looks very promising."]
              },
              {
                "header": "How other cities are trending",
                "content": ["Cities, Seattle and Atlanta, are the fastest growing in terms of sales at 19% & 20% respectively compared to the overall average of 10%. On the other hand, Denver and San Diego have experienced the highest negative growth rates of -10% and -20% respectively. Finally, there are also cities which didn't experience any growth nor decline are Washington and Boston.  Out of the 15 cities, 8 showed positive growth, 5 witnessed negative growth and 2 cities remained stagnant."]
              }
            ]
          },
        "card3": {
            "heading": "City-Sales Performance Decision Matrix",
            "charts": {
              "decision_matrix": {
                  "data": [
                      ['x', 50, 30, 40, 20],
                      ['y', 20, 30, 40, 50],
                      ['label', 'chicago', 'ny', 'ambala', 'delhi'],
                      ['categories', 'Leaders Club', 'Opportunity Bay', 'Playing Safe', 'Red Alert']
                  ],
              }
            },
            "paragraphs": [{
                "header": "",
                "content": ["Based on the absolute sales values and the overall growth rates, mAdvisor presents the decision matrix for sales as displayed below."]
              },
              {
                "header": "Leaders Club",
                "content": ["Total of 3 cities, Miami, Seattle, and Boston, feature in the Leaders Club signalling healthy trend in terms of revenue contribution as well growth."]
              },
              {
                "header": "Opportunity Bay",
                "content": ["Four cities, including NYC, Detroit, Denver, and Boise, feature in this quadrant implying that there is good potential for revenue growth, even though their current sales contributions are relatively less."]
              },
              {
                "header": "Playing Safe",
                "content": ["There are four cities (Atlanta, Orlando, San Francisco, and Sacramento) featuring in this quadrant which is characterized by high level of sales but low rates of growth."]
              },
              {
                "header": "Red Alert",
                "content": [" Chicago, Los Angeles, Washington, and San Diego are not performing well both in terms of sales contribution and growth."]
              }
            ]
          }
      },
      {
            "card1": {
              "heading": "Impact of Deal Type on Sales",
              "charts": {
                "group_by_total": {
                  "heading": "",
                  "data": {
                    "Online": 7860101.948559997,
                    "Telephone Booking": 2.016576714184001E7,
                    "Referral": 1.1850875860800004E7,
                    "Broker": 3783720.639999998
                  },
                  "labels": {
                    "Deal Type": "Sales"
                  }
                },
                "group_by_mean": {
                  "heading": "",
                  "data": {
                    "Online": 60101.948559997,
                    "Telephone Booking": 65767.141840,
                    "Referral": 850875.8608,
                    "Broker": 37830.639999998
                  },
                  "labels": {
                    "Deal Type": "Sales"
                  }
                }
              },
              "paragraphs": [{
                  "header": "Overview",
                  "content": ["The top 3 Deal Types account for about 25% of the total sales.  Being the largest contributor, total sales from Online amounts to $122,589 that accounts for about 10% of the total sales. However, Broker has the highest average sales of $295, whereas the average for Online is $270. On the other hand, Referral contributes to just 8% of the total sales with the average being 79. Interestingly, the effect of Deal Type on sales is significant as the average sales seem to be different across various Deal Types. The average sale figures from Online are typically 18% higher than those of Detroit and Boise."]
                },
                {
                  "header": "Key Factors Influencing Sales from Online",
                  "content": ["High contribution of sales from Online is characterized by the influence of key dimensions, such as Sales Person, Region, and Channel. Certain specific segments from those dimensions are more likely to explain Online's significant sales turnover.  For instance, John Greg (40%) along with Karl (35%), the top performing Sales Persons account for 75% of the overall sales from Online. In terms of Region, Americas (54%) and Europe (39%) account for 93% of the total sales. Among the channels, Convenience Stores has got the major chunk of sales from Online, accounting for 43%."]
                }
              ],
              "bubble_data": [{
                  "value": "34.87 Million",
                  "text": "Telephone Booking is the largest contributor to sales"
                },
                {
                  "value": "234.87K",
                  "text": "San Francisco has the highest average sales"
                }
              ]
            },
            "card2": {
              "heading": "Online's Sales Performance over Time",
              "charts": {
                "trend_chart": {
                  "heading": "",
                    "data": [
                        ['date', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06',
                         '2013-01-07', '2013-01-08', '2013-01-09', '2013-01-10', '2013-01-11', '2013-01-12',
                         '2014-01-01', '2014-01-02', '2015-01-03', '2015-01-04'],
                        # ["x", "Jan-12", "Feb-12", "Mar-12", "Apr-12", "May-12", "Jun-12", "Jul-12", "Aug-12", "Sep-12", "Oct-12", "Nov-12", "Dec-12", "Jan-13", "Feb-13", "Mar-13", "Apr-13"],
                        ["Total Sales", 43223.875, 56400.8571428571, 39982.5455, 46732.8182, 56061, 85415, 59389.67,
                         4241.8, 53862.3, 39618.625, 5645.3, 35795.4, 43730.3, 57595.7142857143, 57147, 58620.875],
                        ["Miami Sales", 5164.8461538462, 3277.0882352941, 3858.064516129, 3920.5588235294,
                         4241.3461538462, 4123.83, 2893.2857142857, 2937, 3174.7297297297, 4039.0606060606, 3525.8,
                         254.925, 3160.1388888889, 3534.1428571429, 4045.2258064516, 3136.775]
                    ],
                    "format": '%b-%d-%Y'
                }
              },
              "paragraphs": [{
                  "header": "",
                  "content": ["Sales contribution from Online is predominantly in line with the overall sales trend, as the Deal Type observed similar ups and downs during the observation period. The overall sales figures hit a peak of $25,306 in Aug 2014, when it grew by over 32% compared to the previous month. Interestingly, Online's sales also sharply rose and hit a peak of $25,155 during the same period. The last three months, between Jul 2014 and Sep 2014, accounted for almost half of Online's total sales, i.e. $62,560. Driven by this buoyant growth off late, the outlook for Online's next quarter sales looks very promising."]
                },
                {
                  "header": "How other Deal Types are trending",
                  "content": ["Deal Types, Seattle and Atlanta, are the fastest growing in terms of sales at 19% & 20% respectively compared to the overall average of 10%. On the other hand, Denver and San Diego have experienced the highest negative growth rates of -10% and -20% respectively. Finally, there are also Deal Types which didn't experience any growth nor decline are Washington and Boston.  Out of the 15 Deal Types, 8 showed positive growth, 5 witnessed negative growth and 2 Deal Types remained stagnant."]
                }
              ]
            },
            "card3": {
              "heading": "Deal Type-Sales Performance Decision Matrix",
              "charts": {
                "decision_matrix": {
                  "heading": "",
                  "data": [
                      ['x', 50, 30, 40, 20],
                      ['y', 20, 30, 40, 50],
                      ['label', 'chicago', 'ny', 'ambala', 'delhi'],
                      ['categories', 'Leaders Club', 'Opportunity Bay', 'Playing Safe', 'Red Alert']
                  ],
                }
              },
              "paragraphs": [{
                  "header": "",
                  "content": ["Based on the absolute sales values and the overall growth rates, mAdvisor presents the decision matrix for sales as displayed below."]
                },
                {
                  "header": "Leaders Club",
                  "content": ["Total of 3 Deal Types, Online, Seattle, and Boston, feature in the Leaders Club signalling healthy trend in terms of revenue contribution as well growth."]
                },
                {
                  "header": "Opportunity Bay",
                  "content": ["Four Deal Types, including NYC, Detroit, Denver, and Boise, feature in this quadrant implying that there is good potential for revenue growth, even though their current sales contributions are relatively less."]
                },
                {
                  "header": "Playing Safe",
                  "content": ["There are four Deal Types (Atlanta, Orlando, San Francisco, and Broker) featuring in this quadrant which is characterized by high level of sales but low rates of growth."]
                },
                {
                  "header": "Red Alert",
                  "content": [" Chicago, Referral, Washington, and San Diego are not performing well both in terms of sales contribution and growth."]
                }
              ]
            }

      }
    ]
  }
}

regression_dummy_data = {
  "narratives": {
    "heading": "Sales Performance Analysis",
    "main_card": {
      "chart": {
          "heading": "Change in Sales per unit increase",
          "data": [[ 30, 200, 100, 400, 150, -250, -10],
                    [130, 100, -140, 200, 150, 50, -10, -200]],
          "labels": {
            "Dimension": "Effect Size"
          }

      },
      "header": "Key Measures that Affect Sales",
      "paragraphs": [{
          "header": "",
          "content": ["""
          There are 15 measures in the dataset and 4 of them (Marketing Cost, Shipping Cost
                      and others) have significant influence on sales. It implies that these measures explain
                      considerable amount of variation in sales figures. However, other measures, such as
                      Number of Units, Average Profit Margin, Overhead Expense, don't show significant
                      relationship with sales. """]
        },
        {
          "header": "",
          "content": ["""The chart below displays the impact of key measures on sales, as measured by
                      regression coefficient. Let us take a deeper look at some of key measures that explain
                      remarkable amount of change in sales."""]
        }
      ]
    },
    "cards": [
       {
        "card0": {
          "heading": "Impact of Marketing Cost on Sales",
          "charts": {
            "chart1": {
              "heading": "Magnitude of Impact on Average Sales",
              "data": [['x', 'Category1', 'Category2'],
                      ['value', 300, 400]],
              "labels": {
                "City": "Sales"
              }
            },
            "chart2": {
              "heading": "",
              "data": [['Marketing Cost', 20, 30,10,50,60],
                      ['Sales', 1300, 4000,2000,1200,3000],
                      ['Colors', 'Red', 'Yellow','Green','Blue','Orange'],
                      ['Labels','Low Sales with Low Marketing Cost','High Sales with Low Marketing Cost','Low Sales with High Marketing Cost']],
              "labels": {
                "City": "Sales"
              }
            }
          },
          "paragraphs": [{
              "header": "Overview",
              "content": ["""Marketing Cost is one of the most significant influencer of sales and it explains a great
                          magnitude of change in sales. It is positively & strongly correlated with the sales
                          figures. As Marketing Cost changes, sales also tend to move in the same direction. An
                          incremental unit change in marketing cost corresponds to an average increase in sales
                          by 13.3 units."""]
            },
            {
              "header": "",
              "content": ["""There are also key segments where marketing cost has been relatively more significant
                          in driving the overall sales. For instance, price range 101 to 500 is an excellent case in
                          point. For every unit increase in marketing cost in this segment, the sales values are
                          likely to increase by an average of 39 units, which is almost thrice as high as the overall
                          impact. The chart below displays other key areas where marketing cost plays a critical
                          role"""]
            },
            {
              "header": "",
              "content": ["""Comparing the distribution of marketing cost with sales observations, we find that there
                          are three distinct groups which notably differ from each other"""]
            },
            {
              "header": "",
              "content": ["""<ul>
                <li>Group 1: This is the largest group, accounting for 82% of the observations, has an
                average sale of $170 and average marketing cost of $3.67.</li>
                <li>Group 2: The average sale for this group is $560 and the average marketing cost
                is $8.2. It covers about 14% of the total observations.</li>
                <li>Group3: The smallest group has the highest average sale, i.e., $1,438 and the
                marketing cost typically amounts to $20.8 for any observation from this group.</li></ul>"""]
            }
          ]
        },
        "card1": {
            "heading": "Key Areas where Marketing Cost Matters",
            "tables": {
                "table1": {
                    "heading": "Average Sales",
                    "data": {
                        "header": [{"header1": "Category", "header2": "0 t0 10", "header3": "11 to 50",
                                    "header4": "51 to 100"}],
                        "tableData": [{"header1": "Less than 2.2", "header2": 10, "header3": 30, "header4": 60},
                                      {"header2": 70, "header3": 30, "header4": 20}],

                    }
                },
                "table2": {
                    "heading": "Average Sales",
                    "data": {
                        "header": [{"header1": "Category", "header2": "0 t0 10", "header3": "11 to 50",
                                    "header4": "51 to 100"}],
                        "tableData": [{"header1": "Less than 2.2", "header2": 10, "header3": 30, "header4": 60},
                                      {"header2": 70, "header3": 30, "header4": 20}],

                    }
                }
        },
            "paragraphs": [{
                "header": "Discount range",
                "content": ["""There are five categories within discount range (0 to 10 percent, 11 to 20 percent, 21 to
                              30 percent, 31 to 40 percent, and 41 to 50 percent). The following table displays how
                              average sales vary across discount ranges and segments of marketing cost."""]
              },
              {
                "header": "",
                "content": ["""Discount range has significant influence on sales and the impact of marketing cost on
                            sales shows interesting variations across discount ranges. Even though the average
                            sales from 0 to 10 percent is higher, marketing cost has the highest impact on 21 to 30
                            percent discount range, as sales increases by 16.5 units for every unit increase in
                            marketing cost. On the other hand, 0 to 10 percent discount range is the least affected,
                            as it increases sales by just 0.3 units for one unit increase in marketing costs."""]
              },
              {
                "header": "Price Range",
                "content": ["""Price range contains four categories, which are 0 to 10, 11 to 50, 51 to 100, and 100 to
                              500. The following table displays how average sales vary across price ranges and
                              segments of marketing cost."""]
              },
              {
                "header": "",
                "content": ["""The relationship between marketing cost and sales is also significantly influenced by
                              price range. For instance, price range, 101 to 500 seems to have an average sale of
                              $344, which is significantly higher than the other three categories. The price range also
                              seems to be highly influenced as it moves up by an enormous 46 units for every unit
                              increase in marketing cost. However, marketing cost has hardly any impact (0.03 units)
                              on sales when it comes to 0 to 10 price range."""]
              }
            ]
          },
        "card2": {
            "heading": "How Sales and Marketing Cost Changed over Time",
            "charts": {
                "heading": "",
                "data": [['x', 'Dec-13', 'Jan-14', 'Feb-14', 'Mar-14', 'Apr-14', 'May-14'],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 130, 300, 200, 300, 250, 450]]
            },
            "paragraphs": [{
                "header": "",
                "content": ["""Marketing cost increased from $800 in Dec 2013 to $3,143 in Sep 2014, which is a fourfold
                            increase over a 10-month period. It hit a peak of $5,133 in Aug 2014 and had the
                            lowest ($800) in Dec 2013. The total marketing cost for the entire time period is
                            $24,563, which is about 1.8% of the overall sales. The ratio of marketing cost over sales
                            has been mostly constant, as changes in marketing cost over time is mostly in line with
                            the overall sales trend. """]
              }
            ]
          },
        "card3": {
          "heading": "Sensitivity Analysis: Effect of Marketing Cost on Segments of Sales",
          "charts": {
              "heading": "",
              "data": [['Marketing Cost', 20, 30,10,50,60],
                      ['Sales', 1300, 4000,2000,1200,3000],
                      ['Colors', 'Red', 'Yellow','Green','Blue','Orange'],
                      ['Labels','Low Sales with Low Marketing Cost','High Sales with Low Marketing Cost','Low Sales with High Marketing Cost']]

          },
          "paragraphs": [{
              "header": "",
              "content": ["""Marketing cost seems to have a remarkable impact on various segments of sales
                          observations. The chart above shows four quadrants based on the distribution of sales
                          (high vs. low) and marketing cost (high vs. low)."""]
            },
            {
              "header": "",
              "content": ["""High Sales with High Marketing Cost: The sales observations from this quadrant are
                          typically from Gourmet (Deal Type), 21 to 30 percent (Discount Range), and Email
                          Campaign (Marketing Source). It accounts for about 22% of the total population."""]
            },
            {
              "header": "",
              "content": ["""Low Sales with Low Marketing Cost: Sales from National (Deal Type), 65+ (Age
                          Group), and Email Campaign (Direct) belong to this segment. They cover nearly 58% of
                          total sales observations."""]
            },
            {
              "header": "",
              "content": ["""High Sales with Low Marketing Cost: Nearly one-tenth of the total observations are
                          from this group and they are generally coming from New York (City), 101 to 500 (Price
                          Range)."""]
            },
            {
              "header": "",
              "content": [""" Low Sales with High Marketing Cost: The segment, which is least effective to
                            marketing cost, comes from Families (Deal Type) and 45 to 54 (Age Group)."""]
            },
            {
              "header": "",
              "content": [""" Overall, sales values are relatively inelastic to changes in marketing costs. For a one
                            percent increase in marketing cost is associated with a 0.24% increase in sales.
                            However, the sensitivity of sales to change in marketing cost varies across these four
                            segments."""]
            },
            {
              "header": "",
              "content": [""" <ul>
                            <li>"High Sales with High Marketing Cost" and "Low Sales with Low Marketing
                              Cost" show relatively higher sensitivity to change in marketing cost (increase of 0.7% and 0.6% respectively, for a one percent increase in marketing cost)
                              compared to other segments
                            </li>
                            <li>Interestingly, for "High Sales with Low Marketing Cost" segment, sales
                              decrease by 1.01% for a one percent increase in marketing cost. It implies that
                              any incremental change in marketing cost undermines potential sales from this
                              segment.
                              </li>
                          </ul>"""]
            }
          ]
        }
      },
       {
        "card0": {
          "heading": "Impact of Marketing Cost on Sales",
          "charts": {
            "chart1": {
              "heading": "Magnitude of Impact on Average Sales",
              "data": [['x', 'Category1', 'Category2'],
                      ['value', 300, 400]],
              "labels": {
                "City": "Sales"
              }
            },
            "chart2": {
              "heading": "",
              "data": [['Marketing Cost', 20, 30,10,50,60],
                      ['Sales', 1300, 4000,2000,1200,3000],
                      ['Colors', 'Red', 'Yellow','Green','Blue','Orange'],
                      ['Labels','Low Sales with Low Marketing Cost','High Sales with Low Marketing Cost','Low Sales with High Marketing Cost']],
              "labels": {
                "City": "Sales"
              }
            }
          },
          "paragraphs": [{
              "header": "Overview",
              "content": ["""Marketing Cost is one of the most significant influencer of sales and it explains a great
                          magnitude of change in sales. It is positively & strongly correlated with the sales
                          figures. As Marketing Cost changes, sales also tend to move in the same direction. An
                          incremental unit change in marketing cost corresponds to an average increase in sales
                          by 13.3 units."""]
            },
            {
              "header": "",
              "content": ["""There are also key segments where marketing cost has been relatively more significant
                          in driving the overall sales. For instance, price range 101 to 500 is an excellent case in
                          point. For every unit increase in marketing cost in this segment, the sales values are
                          likely to increase by an average of 39 units, which is almost thrice as high as the overall
                          impact. The chart below displays other key areas where marketing cost plays a critical
                          role"""]
            },
            {
              "header": "",
              "content": ["""Comparing the distribution of marketing cost with sales observations, we find that there
                          are three distinct groups which notably differ from each other"""]
            },
            {
              "header": "",
              "content": ["""<ul>
                <li>Group 1: This is the largest group, accounting for 82% of the observations, has an
                average sale of $170 and average marketing cost of $3.67.</li>
                <li>Group 2: The average sale for this group is $560 and the average marketing cost
                is $8.2. It covers about 14% of the total observations.</li>
                <li>Group3: The smallest group has the highest average sale, i.e., $1,438 and the
                marketing cost typically amounts to $20.8 for any observation from this group.</li></ul>"""]
            }
          ]
        },
        "card1": {
            "heading": "Key Areas where Marketing Cost Matters",
            "tables": {
                "table1": {
                    "heading": "Average Sales",
                    "data": {
                        "header": [{"header1": "Category", "header2": "0 t0 10", "header3": "11 to 50",
                                    "header4": "51 to 100"}],
                        "tableData": [{"header1": "Less than 2.2", "header2": 10, "header3": 30, "header4": 60},
                                      {"header2": 70, "header3": 30, "header4": 20}],

                    }
                },
                "table2": {
                    "heading": "Average Sales",
                    "data": {
                        "header": [{"header1": "Category", "header2": "0 t0 10", "header3": "11 to 50",
                                    "header4": "51 to 100"}],
                        "tableData": [{"header1": "Less than 2.2", "header2": 10, "header3": 30, "header4": 60},
                                      {"header2": 70, "header3": 30, "header4": 20}],

                    }
                }
            },
            "paragraphs": [{
                "header": "Discount range",
                "content": ["""There are five categories within discount range (0 to 10 percent, 11 to 20 percent, 21 to
                              30 percent, 31 to 40 percent, and 41 to 50 percent). The following table displays how
                              average sales vary across discount ranges and segments of marketing cost."""]
              },
              {
                "header": "",
                "content": ["""Discount range has significant influence on sales and the impact of marketing cost on
                            sales shows interesting variations across discount ranges. Even though the average
                            sales from 0 to 10 percent is higher, marketing cost has the highest impact on 21 to 30
                            percent discount range, as sales increases by 16.5 units for every unit increase in
                            marketing cost. On the other hand, 0 to 10 percent discount range is the least affected,
                            as it increases sales by just 0.3 units for one unit increase in marketing costs."""]
              },
              {
                "header": "Price Range",
                "content": ["""Price range contains four categories, which are 0 to 10, 11 to 50, 51 to 100, and 100 to
                              500. The following table displays how average sales vary across price ranges and
                              segments of marketing cost."""]
              },
              {
                "header": "",
                "content": ["""The relationship between marketing cost and sales is also significantly influenced by
                              price range. For instance, price range, 101 to 500 seems to have an average sale of
                              $344, which is significantly higher than the other three categories. The price range also
                              seems to be highly influenced as it moves up by an enormous 46 units for every unit
                              increase in marketing cost. However, marketing cost has hardly any impact (0.03 units)
                              on sales when it comes to 0 to 10 price range."""]
              }
            ]
          },
        "card2": {
            "heading": "How Sales and Marketing Cost Changed over Time",
            "charts": {
                "heading": "",
                "data": [['x', 'Dec-13', 'Jan-14', 'Feb-14', 'Mar-14', 'Apr-14', 'May-14'],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 130, 300, 200, 300, 250, 450]]
            },
            "paragraphs": [{
                "header": "",
                "content": ["""Marketing cost increased from $800 in Dec 2013 to $3,143 in Sep 2014, which is a fourfold
                            increase over a 10-month period. It hit a peak of $5,133 in Aug 2014 and had the
                            lowest ($800) in Dec 2013. The total marketing cost for the entire time period is
                            $24,563, which is about 1.8% of the overall sales. The ratio of marketing cost over sales
                            has been mostly constant, as changes in marketing cost over time is mostly in line with
                            the overall sales trend. """]
              }
            ]
          },
        "card3": {
          "heading": "Sensitivity Analysis: Effect of Marketing Cost on Segments of Sales",
          "charts": {
              "heading": "",
              "data": [['Marketing Cost', 20, 30,10,50,60],
                      ['Sales', 1300, 4000,2000,1200,3000],
                      ['Colors', 'Red', 'Yellow','Green','Blue','Orange'],
                      ['Labels','Low Sales with Low Marketing Cost','High Sales with Low Marketing Cost','Low Sales with High Marketing Cost']]
          },
          "paragraphs": [{
              "header": "",
              "content": ["""Marketing cost seems to have a remarkable impact on various segments of sales
                          observations. The chart above shows four quadrants based on the distribution of sales
                          (high vs. low) and marketing cost (high vs. low)."""]
            },
            {
              "header": "",
              "content": ["""High Sales with High Marketing Cost: The sales observations from this quadrant are
                          typically from Gourmet (Deal Type), 21 to 30 percent (Discount Range), and Email
                          Campaign (Marketing Source). It accounts for about 22% of the total population."""]
            },
            {
              "header": "",
              "content": ["""Low Sales with Low Marketing Cost: Sales from National (Deal Type), 65+ (Age
                          Group), and Email Campaign (Direct) belong to this segment. They cover nearly 58% of
                          total sales observations."""]
            },
            {
              "header": "",
              "content": ["""High Sales with Low Marketing Cost: Nearly one-tenth of the total observations are
                          from this group and they are generally coming from New York (City), 101 to 500 (Price
                          Range)."""]
            },
            {
              "header": "",
              "content": [""" Low Sales with High Marketing Cost: The segment, which is least effective to
                            marketing cost, comes from Families (Deal Type) and 45 to 54 (Age Group)."""]
            },
            {
              "header": "",
              "content": [""" Overall, sales values are relatively inelastic to changes in marketing costs. For a one
                            percent increase in marketing cost is associated with a 0.24% increase in sales.
                            However, the sensitivity of sales to change in marketing cost varies across these four
                            segments."""]
            },
            {
              "header": "",
              "content": [""" <ul>
                            <li>"High Sales with High Marketing Cost" and "Low Sales with Low Marketing
                              Cost" show relatively higher sensitivity to change in marketing cost (increase of 0.7% and 0.6% respectively, for a one percent increase in marketing cost)
                              compared to other segments
                            </li>
                            <li>Interestingly, for "High Sales with Low Marketing Cost" segment, sales
                              decrease by 1.01% for a one percent increase in marketing cost. It implies that
                              any incremental change in marketing cost undermines potential sales from this
                              segment.
                              </li>
                          </ul>"""]
            }
          ]
        }
      }
    ]
  }
}


def chart_html(request):
    pass

