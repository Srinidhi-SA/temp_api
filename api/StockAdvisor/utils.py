import hashlib
import string

import watson_developer_cloud.natural_language_understanding.features.v1 \
    as Features
from watson_developer_cloud.natural_language_understanding_v1 import NaturalLanguageUnderstandingV1

from api.StockAdvisor.crawling.cache import Cache
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

    return date


def get_nl_understanding_from_bluemix(url="", content_of_the_url="", use_cache=True):
    """
    get Natural Language understanding using Bluemix APIs
    :param url:
    :param content_of_the_url:
    :param use_cache:
    :return:
    """
    def __get_nl_analyzer():
        return NaturalLanguageUnderstandingV1(
            username=nlu_settings.get("username"),
            password=nlu_settings.get("password"),
            version="2017-02-27")

    def __get_default_features():
        return [
            Features.Entities(limit=100, emotion=True, sentiment=True),
            Features.Keywords(limit=100, emotion=True, sentiment=True),
            Features.Categories(),
            Features.Concepts(),
            Features.Sentiment(),
            Features.Emotion(),
            #     Features.Feature(),
            #     Features.MetaData(),
            Features.Relations(),
            Features.SemanticRoles(),

        ]

    bluemix_cache = Cache("bluemix")

    nl_understanding = None

    if use_cache:
        nl_understanding = bluemix_cache.get(url)

    if not nl_understanding:
        natural_language_analyzer = __get_nl_analyzer()
        for i in range(NUMBEROFTRIES):
            if i % 2 == 0:
                features = __get_default_features()
            else:
                features = {"sentiment": {}, "keywords": {}}
            try:
                if content_of_the_url:
                    nl_understanding = natural_language_analyzer.analyze(
                        text=content_of_the_url, features=features)
                else:
                    nl_understanding = natural_language_analyzer.analyze(
                        url=url,features=features )
            except Exception as err:
                print "FAILED "*10, err

            if nl_understanding:
                break

    bluemix_cache.put(url, nl_understanding)
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