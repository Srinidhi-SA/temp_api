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

def crawl_extract(url,regex_dict={},remove_tags=[], slug=None):
    all_data=[]
    crawl_obj=generic_crawler.GenericCrawler()

    content=crawl_obj.get_data(url, crawl_options={'fresh': True })
    json_list=process.process_data(url,content,regex_dict=regex_dict,remove_tags=remove_tags)

    for json_obj in json_list:
        if not json_obj.get("url"):
            continue
        if "date" in json_obj:
            json_obj["date"] = myutils.normalize_date_time(json_obj.get("date","1 min ago")).strftime("%Y%m%d")
        all_data.append(json_obj)

    return all_data[4:]


def fetch_news_article_from_nasdaq(stock):
    crawl_obj = generic_crawler.GenericCrawler()
    stock_news = []
    urls = [get_nasdaq_news_article(stock)] + get_nasdaq_news_articles(stock)
    # urls = [get_nasdaq_news_article(stock)]

    for url in urls:
        print url
        content = crawl_obj.get_data(url, crawl_options={'date_of_crawl': True })
        json_list = process.process_nasdaq_news_article(url, content, stock=stock)
        if len(json_list) < 1:
            break
        for json_obj in json_list:
            if not json_obj.get("url"):
                continue
            if "date" in json_obj:
                date_string = json_obj.get("date").split(" ")[0]
                json_obj["date"] = myutils.normalize_date_time(date_string).strftime("%Y%m%d")
                json_obj["time"] = myutils.normalize_date_time(date_string).strftime("%Y%m%d")
            stock_news.append(json_obj)

    stock_news_with_sentiments = []
    for news in stock_news:
        short_desc = news["short_desc"]
        nl_understanding = myutils.get_data_from_bluemix(short_desc, content=True, unique_id=news['final_url'])
        if nl_understanding:
            news['keywords'] = nl_understanding.get('keywords', [])
            news['sentiment'] = nl_understanding.get('sentiment', [])
            stock_news_with_sentiments.append(news)

    return stock_news_with_sentiments


def write_to_news_data_in_folder(stockName, data):
    import os
    import csv
    path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))) + "/scripts/data/" + self.slug + "/"
    # file_path = path + stockName + "." + type
    file_path = path + stockName + "." + type
    with open(file_path, "wb") as file_to_write_on:
        if 'csv' == type:
            writer = csv.writer(file_to_write_on)
            writer.writerow(data)
        elif 'json' == type:
            json.dump(data, file_to_write_on)


def generate_urls_for_historic_data(list_of_company_name):
	return ["http://www.nasdaq.com/symbol/{0}/historical".format(name) for name in list_of_company_name]

def generate_url_for_historic_data(name):
	return "http://www.nasdaq.com/symbol/{0}/historical".format(name)


def generate_urls_for_crawl_news(stock_symbols):
	return ["https://finance.google.com/finance/company_news?q=NASDAQ:{}".format(stock_symbol.upper()) for stock_symbol in stock_symbols]

def get_nasdaq_news_article(stock_symbol):
    return "http://www.nasdaq.com/symbol/{0}/news-headlines".format(stock_symbol)

def get_nasdaq_news_articles(stock_symbol):
    return ["https://www.nasdaq.com/symbol/{0}/news-headlines?page={1}".format(stock_symbol, str(i)) for i in range(2,10)]


def convert_crawled_data_to_metadata_format(news_data, other_details=None, slug=None):
    if other_details is None:
        type = 'news_data'
    else:
        type= other_details['type']

    headers = find_headers(news_data=news_data, type=type, slug=slug)
    columnData = get_column_data_for_metadata(headers, slug=slug)
    sampleData = get_sample_data(news_data=news_data, type=type, slug=slug)
    metaData = get_metaData(news_data=news_data, slug=slug)
    transformation_settings = get_transformation_settings(slug=slug)

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

    return metadata_json


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
    return existingColumn


def find_headers(news_data, type='historical_data', slug=None):
    if len(news_data) < 1:
        return []
    headers_name = news_data[0].keys()
    required_fields = get_required_fields(type)
    headers_name = list(set(required_fields).intersection(set(headers_name)))
    headers = []
    for header in headers_name:
        temp = {}
        temp['name'] = header
        temp['slug'] = generate_slug(header)
        headers.append(temp)
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
    return columnData

def get_sample_data(news_data, type='historical_data', slug=None):
    required_fields = get_required_fields(type)
    headers_name = news_data[0].keys()
    headers_name = list(set(required_fields).intersection(set(headers_name)))
    sampleData = []
    for row in news_data:
        row_data = []
        for key in headers_name:
            row_data.append(row[key])
        sampleData.append(row_data)
    return sampleData


def get_metaData(news_data, slug=None):

    metaData = [
        {"displayName": "News source", "name": "newsSource", "value": "NASDAQ", "display": True},
        {"displayName": "Stock Prices", "name": "stockPrices", "value": "NASDAQ", "display": True},
        {"displayName": "Number of Articles", "name": "numberOfArticles", "value": len(news_data) , "display": True},
    ]
    return metaData

def get_required_fields(type='historical_data'):
    matching = {
        'historical_data': ['url',  'source', 'date', 'time'],
        'news_data': ['url',  'source', 'date', 'title','short_desc'],
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
