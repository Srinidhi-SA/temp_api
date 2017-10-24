import hashlib
import string

import watson_developer_cloud.natural_language_understanding.features.v1 \
    as Features
from watson_developer_cloud.natural_language_understanding_v1 import NaturalLanguageUnderstandingV1

from settings import NUMBEROFTRIES, CACHESALT, TEMPDIR
from settings import natural_language_understanding_settings as nlu_settings


def clean_key(key):
    return "".join([x if x in string.ascii_lowercase else "" for x in key.lower()])


def normalize_date_time(date_string):
    """
    Understand "6 hours ago, and other formats and return curret date in YYYYMMDD"
    :param date_string:
    :return:
    """
    from datetime import datetime
    date = datetime.today()

    if "ago" in date_string:
        date = datetime.today()
    else:
        try:
            # mm/dd/yyyy
            date = datetime.strptime(date_string, "%m/%d/%Y").date()
        except:
            pass

        try:
            # 'Sep 29, 2017'
            date = datetime.strptime(date_string, "%b %d, %Y").date()
        except:
            pass

    print date
    return date


def get_data_from_bluemix(target_url):
    nl_understanding = cache_get(target_url)
    if not nl_understanding:
        natural_language_understanding = NaturalLanguageUnderstandingV1(
            username=nlu_settings.get("username"),
            password=nlu_settings.get("password"),
            version="2017-02-27")
        features = [
                Features.Entities(limit=100,emotion=True,sentiment=True),
                Features.Keywords(limit=100,emotion=True,sentiment=True),
                Features.Categories(),
                Features.Concepts(),
                Features.Sentiment(),
                Features.Emotion(),
                #     Features.Feature(),
                #     Features.MetaData(),
                Features.Relations(),
                Features.SemanticRoles(),

            ]
        nl_understanding = None

        for i in range(NUMBEROFTRIES):
            try:
                nl_understanding = natural_language_understanding.analyze(
                    url=target_url,
                    features=features
                )
            except:
                pass

            if nl_understanding:
                break
        cache_put(target_url, nl_understanding)

    return nl_understanding




def get_cache_file_name(input_key):

    m = hashlib.md5(CACHESALT + input_key)
    return TEMPDIR + m.hexdigest()


import pickle
import os

def cache_get(key):
    cache_file_name = get_cache_file_name(key)
    if os.path.isfile(cache_file_name):
        return pickle.load( open( cache_file_name, "rb" ) )
    else:
        return None

def cache_put(key, obj):

    pickle.dump(obj, open(get_cache_file_name(key), "wb"))


# columnData, headers, sampledata, metadata
def convert_crawled_data_to_metadata_format(news_data, other_details):

    headers = find_headers(news_data=news_data)
    columnData = get_column_data_for_metadata(headers)
    sampleData = get_sample_data(news_data=news_data)
    metaData = get_metaData(news_data=news_data)

    return {
        "headers": headers,
        "sampleData": sampleData,
        "columnData": columnData,
        "metaData": metaData
    }


def find_headers(news_data):
    headers_name = news_data[0].keys()
    headers = []
    for header in headers_name:
        temp = {}
        temp['name'] = header
        temp['slug'] = generate_slug(header)
        headers.append(temp)
    return headers

def get_column_data_for_metadata(headers):
    import copy
    sample_column_data = {
                "ignoreSuggestionFlag": False,
                "name": None,
                "chartData": None,
                "dateSuggestionFlag": False,
                "columnStats": None,
                "columnType": None,
                "ignoreSuggestionMsg": None,
                "slug": None

            }

    columnData = []
    for header in headers:
        temp = copy.deepcopy(sample_column_data)
        temp['name'] = header['name']
        temp['slug'] = header['slug']
        columnData.append(temp)

    return columnData

def get_sample_data(news_data):
    required_fields = ['url',  'source', 'date', 'title','desc']
    return [ [row[key] for key in required_fields] for row in news_data ]

def get_metaData(news_data):
    return  [{
                "displayName": "Number of records",
                "name": "noOfRows",
                "value": len(news_data),
                "display": True
            },
        {
            "displayName": "Source",
            "name": "source",
            "value": "Google Finance",
            "display": True
        },

             ]




def generate_slug(name=None):
    from django.template.defaultfilters import slugify
    from random import random

    return slugify(str(name) + "-" + ''.join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))