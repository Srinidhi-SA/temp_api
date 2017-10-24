import generic_crawler
import process
import common_utils
import simplejson as json
import urllib
import sys
from django.template.defaultfilters import slugify
import random
import string
# import utils as myutils

def crawl_extract(urls,regex_dict={},remove_tags=[]):
	all_data=[]
	crawl_obj=generic_crawler.GenericCrawler()
	fobj=open("/tmp/stock_info.json","w")
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
			# if "date" in json_obj:
			# 	json_obj["date"] = myutils.normalize_date_time(json_obj.get("date","1 min ago")).strftime("%Y%m%d")
			fobj.write(json.dumps(json_obj)+"\n")
			all_data.append(json_obj)
	fobj.close()
	return all_data

def generate_urls_historicdata(list_of_company_name):
	STATIC_URL = "http://www.nasdaq.com/symbol/{0}/historical"
	urls = []
	for name in list_of_company_name:
		urls.append(STATIC_URL.format(name))
	return urls

def generate_urls_for_crawl_news(stock_symbols):
	return ["https://finance.google.com/finance/company_news?q=NASDAQ:{}".format(stock_symbol.upper()) for stock_symbol in stock_symbols]

if __name__ == '__main__':
	urls_file=sys.argv[1]
	regex_file=sys.argv[2]
	urls=[]
	for line in open(urls_file).readlines():
		line=line.strip()
		urls.append(line)
	regex_dict=common_utils.get_regex(regex_file)
	remove_tags=["script","head","noscript","style"]
	#remove_tags=[]
	#crawl_extract(urls,regex_dict=regex_dict)
	crawl_extract(urls,regex_dict)



# columnData, headers, sampledata, metadata
def convert_crawled_data_to_metadata_format(news_data, other_details=None):

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
    required_fields = ['url',  'source', 'date', 'title','desc']

    headers_name = list(set(required_fields).intersection(set(headers_name)))
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

    return slugify(str(name) + "-" + ''.join(
        random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))
