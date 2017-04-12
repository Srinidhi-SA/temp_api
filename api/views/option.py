import os, glob, getpass, subprocess
from django.shortcuts import render
from django.http import HttpResponse
from subprocess import call

from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.models.option import Option, OptionSerializer


@api_view(['POST'])
@renderer_classes((JSONRenderer,))
def set(request):

    userId = request.query_params.get('userId')
    option_dict = request.POST

    set_option(option_dict, userId)

    return Response({"data": "Successfully saved option information"})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_all(request):
    userId = request.query_params.get('userId')
    return Response({"data": OptionSerializer(Option.objects.filter(userId=userId), many=True).data})


@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def get_dict(request):
    userId = request.query_params.get('userId')
    option_dict = get_option_for_this_user(userId)
    return Response({"data": option_dict})


def get_option_for_this_user(userId):
    option_dict = {}
    for item in Option.objects.filter(userId=userId):
        option_dict[item.slug] = item.data

    if option_dict == {}:
        option_dict = default_settings_in_option()

        set_option(
            option_dict=option_dict,
            userId=userId
        )

        for item in Option.objects.filter(userId=userId):
            option_dict[item.slug] = item.data

    return option_dict


def default_settings_in_option():
    default = {
        "cview": "yes",
        "dview": "yes",
        "textHighlight": "yes",
        "desc_analysis": "yes",
        "time_historical": "no",
        "time_statistical": "no",
        "measure_dimension_stest": "no",
        "dimension_dimension_stest": "yes",
        "measure_measure_impact": "no",
        "prediction_check": "yes",
        "prediction_rules_loc_los": "los",
        "pred_count": "",
        "md_variables": "",
        "dd_variables": "",
        "mesm_variables": ""
    }

    return default


def set_option(option_dict, userId):
    for key in option_dict:
        obj, created = Option.objects.get_or_create(slug=key, userId=userId)
        obj.data = option_dict[key]
        obj.save()

    return True


