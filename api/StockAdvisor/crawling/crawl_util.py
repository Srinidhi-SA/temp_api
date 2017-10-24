import generic_crawler
import process
import common_utils
import simplejson as json
import urllib
import sys
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
			print json_obj
			fobj.write(json.dumps(json_obj)+"\n")
			all_data.append(json_obj)
	fobj.close()
	return all_data

def generate_urls(list_of_company_name):
	STATIC_URL = "http://www.nasdaq.com/symbol/{0}/historical"
	urls = []
	for name in list_of_company_name:
		urls.append(STATIC_URL.format(name))
	return urls

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
