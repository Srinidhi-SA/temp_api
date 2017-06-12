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
measure_operations = ["Measure vs. Dimension", 'Measure vs. Measure', 'Descriptive analysis']
dimension_operations = ['Dimension vs. Dimension', 'Predictive modeling', 'Descriptive analysis']

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
    e.save()
    try:
        e.run_master()
    except Exception as e:
        print e
        return Response({'Exception': "Failure"})

    # analysis done
    e.analysis_done = 'TRUE'
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
    e.save()
    try:
        e.run_master()
    except Exception as e:
        print e
        return Response({'Exception': "Failure"})
    # analysis done
    e.analysis_done = "TRUE"
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

    return Response({
        'result': e.get_result(),
        'narratives': e.get_narratives(),
        'dimensions': e.get_dimension_results(),
        'measures': e.get_reg_results(),
        'decision_tree_narrative': e.get_decision_tree_regression_narratives(),
        'decision_tree_result': e.get_decision_tree_regression_results(),
        'density_histogram': e.get_density_histogram(),

    })


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
    """
    List of all Errands not archived.
    :param request: Errand Id
    :return: List of errands
    """

    userId = request.query_params.get('userId')

    es = Errand.objects.filter(
        userId=userId,
        analysis_done='TRUE',
        is_archived='FALSE'
        )

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
        # 'trend': trend_data
        'trend': trend_narraives_demo
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
      "chart":[
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
      ],
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
      "chart": [
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
            }
      ]
    }
}
}