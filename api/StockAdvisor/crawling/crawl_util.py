import generic_crawler
import process
import common_utils
import simplejson as json
import urllib
import sys
from django.template.defaultfilters import slugify
import random
import string
import api.StockAdvisor.utils as myutils

def crawl_extract(urls,regex_dict={},remove_tags=[], slug=None):
    all_data=[]
    crawl_obj=generic_crawler.GenericCrawler()
    fobj=open("/tmp/stock_info_{0}.json".format(slug),"w")
    for url in urls:
        content=crawl_obj.get_data(url)
        json_list=[]
        if 'finance.google.com/finance?' in url:
            json_list=process.process_json_data(url,content,regex_dict=regex_dict)
        else:
            json_list=process.process_data(url,content,regex_dict=regex_dict,remove_tags=remove_tags)

        for json_obj in json_list:
            if not json_obj.get("url"):
                continue
            if "date" in json_obj:
                json_obj["date"] = myutils.normalize_date_time(json_obj.get("date","1 min ago")).strftime("%Y%m%d")
            fobj.write(json.dumps(json_obj)+"\n")
            all_data.append(json_obj)

    fobj.close()
    with open('/tmp/all_data_json_{0}.json'.format(slug), 'w') as all_data_json:
        json.dump(all_data, all_data_json)
    return all_data

def generate_urls_for_historic_data(list_of_company_name):
	return ["http://www.nasdaq.com/symbol/{0}/historical".format(name) for name in list_of_company_name]

def generate_urls_for_crawl_news(stock_symbols):
	return ["https://finance.google.com/finance/company_news?q=NASDAQ:{}".format(stock_symbol.upper()) for stock_symbol in stock_symbols]



# columnData, headers, sampledata, metadata
def convert_crawled_data_to_metadata_format(news_data, other_details=None, slug=None):
    if other_details is None:
        type = 'news_data'
    else:
        type= other_details['type']

    headers = find_headers(news_data=news_data, type=type, slug=slug)
    headers = read_from_a_file(slug=slug)
    columnData = get_column_data_for_metadata(headers, slug=slug)
    columnData = read_from_a_file(slug=slug)
    sampleData = get_sample_data(news_data=news_data, type=type, slug=slug)
    sampleData = read_from_a_file(slug=slug)
    metaData = get_metaData(news_data=news_data, slug=slug)
    metaData = read_from_a_file(slug=slug)
    transformation_settings = get_transformation_settings(slug=slug)
    transformation_settings = read_from_a_file(slug=slug)
    #
    # return {
    #     "headers": headers,
    #     "sampleData": sampleData,
    #     "columnData": columnData,
    #     "metaData": metaData,
    #     "transformation_settings": transformation_settings
    # }

    metadata_json = {
        'scriptMetaData': {
            'columnData': columnData,
            'headers': headers,
            'metaData': metaData,
            'sampleData': sampleData
        },
        'uiMetaData': {
            'advanced_settings': {},
            'columnDataUI': columnData,
            'headersUI': headers,
            'metaDataUI': metaData,
            'possibleAnalysis': '',
            'sampleDataUI': sampleData,
            'transformation_settings': transformation_settings,
            'varibaleSelectionArray': []
        }
    }

    with open('/tmp/metafile_{0}'.format(slug),'w') as metafile:
        json.dump(metadata_json, metafile)

def transform_into_uiandscripts_metadata():
    return {
        'scriptMetaData': {
            'columnData': '',
            'headers': '',
            'metaData': '',
            'sampleData': ''
        },
        'uiMetaData': {
            'advanced_settings': '',
            'columnDataUI': '',
            'headersUI': '',
            'metaDataUI': '',
            'possibleAnalysis': '',
            'sampleDataUI': '',
            'transformation_settings': '',
            'varibaleSelectionArray': ''
        }
    }


def get_transformation_settings(slug=None):
    existingColumn = {
            "existingColumns": []
        }
    write_to_a_file(slug=slug, data=existingColumn)
    return existingColumn


def find_headers(news_data, type='historical_data', slug=None):
    headers_name = news_data[0].keys()
    required_fields = get_required_fields(type)

    headers_name = list(set(required_fields).intersection(set(headers_name)))
    headers = []
    for header in headers_name:
        temp = {}
        temp['name'] = header
        temp['slug'] = generate_slug(header)
        headers.append(temp)
    write_to_a_file(slug=slug, data=headers)
    return headers

def get_column_data_for_metadata(headers, slug=None):
    import copy
    sample_column_data = {
                "ignoreSuggestionFlag": False,
                "name": None,
                "chartData": None,
                "dateSuggestionFlag": False,
                "columnStats": None,
                "columnType": None,
                "ignoreSuggestionMsg": None,
                "slug": None,
                "consider": True
            }

    columnData = []
    for header in headers:
        temp = copy.deepcopy(sample_column_data)
        temp['name'] = header['name']
        temp['slug'] = header['slug']
        columnData.append(temp)
    write_to_a_file(slug=slug, data=columnData)
    return columnData

def get_sample_data(news_data, type='historical_data', slug=None):
    required_fields = get_required_fields(type)
    sampleData = [ [row[key] for key in required_fields] for row in news_data ]

    write_to_a_file(slug=slug, data=sampleData)
    return sampleData

def get_metaData(news_data, slug=None):
    # return  [{
    #             "displayName": "Number of records",
    #             "name": "noOfRows",
    #             "value": len(news_data),
    #             "display": True
    #         },
    #     {
    #         "displayName": "Source",
    #         "name": "source",
    #         "value": "Google Finance",
    #         "display": True
    #     },
    #
    #          ]
    metaData = [
        {"displayName": "News source", "name": "newsSource", "value": "Google Finance", "display": True},
        {"displayName": "Stock Prices", "name": "stockPrices", "value": "NASDAQ", "display": True},
        {"displayName": "Number of Articles", "name": "numberOfArticles", "value": 1249 , "display": True},
    ]
    write_to_a_file(slug=slug, data=metaData)
    return metaData

def get_required_fields(type='historical_data'):
    matching = {
        'historical_data': ['url',  'source', 'date'],
        'news_data': ['url',  'source', 'date', 'title','desc'],
    }

    return matching[type]

def generate_slug(name=None):

    return slugify(str(name) + "-" + ''.join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))


def write_to_a_file(slug=None, data=None):

    with open('/tmp/temp_{0}'.format(slug), 'w') as temp:
        json.dump(data, temp)


def read_from_a_file(slug=None):

    temp = open('/tmp/temp_{0}'.format(slug), 'r')
    return json.loads(temp.read())
