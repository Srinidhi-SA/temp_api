import re
import sys
import common_utils
import requests
from bs4 import BeautifulSoup

def sanitize(content,remove_tags=[]):
	for html_tag in remove_tags:
		tag_regex='(?is)<'+html_tag+'[^>]*?>.*?</'+html_tag+'>' #(?is) is important to add,as it ignores case and new lines in text
		content=re.sub(tag_regex,'',content)
	text=''
	text=re.sub('<.*?>',' ',content)
	if text:
		text=text.replace("\n","").replace("&nbsp;","").replace("\t"," ").replace("\u"," ").replace("\r"," ").strip()
	text =text.encode('utf-8')
	return text

def process_data(url,content,regex_dict={},remove_tags=[]):
	all_data=[]
	if not regex_dict:
		#This is when we want all the page data in form of single text info
		text=sanitize(content,remove_tags=remove_tags)
		all_data.append(text)
		return all_data
	all_blocks=[content]
	if "block" in regex_dict:
		block_regex=regex_dict.get('block')
		if not block_regex:
			print "block regex is not present so exit"
			sys.exit(0)
		else:
			block_regex="(?is)"+block_regex
		all_blocks=re.findall(block_regex,content)
	print "total block on this page is : ",len(all_blocks)
	for block in all_blocks:
		json_data={"blocks":len(all_blocks),"seed_url":url}
		for key in regex_dict.keys():
			if key in ['block','blocks','source']:
				continue
			value=''
			obj=re.search("(?is)"+regex_dict[key],block)
			if obj:
				value=obj.group(1)
				value=sanitize(value)
			json_data[key]=value.strip()
		if not json_data.get("url"):
			json_data["url"]=url
		if not json_data.get("source"):
			json_data["source"]=regex_dict.get("source","source-not-added-in-regex")
		all_data.append(json_data)
	return all_data

def process_json_data(url,content,regex_dict={},remove_tags=[]):
	all_data=[]
	json_content=content.split("google.finance.data = ")[-1].split(";\ngoogle.finance.data")[0]
	raw_json_obj=common_utils.get_json_obj(json_content)
	raw_json_list=raw_json_obj.get("company",{}).get("news",{}).get("clusters",[])
	for raw_json in raw_json_list:
		tmp_list=raw_json.get("a",[])
		for tmp_json in tmp_list:
			json_obj={}
			json_obj["stock"]=url.split("%3A")[-1]
			json_obj["title"]=tmp_json.get("t","")
			json_obj["final_url"]=tmp_json.get("u")
			json_obj["source"]=tmp_json.get("s")
			json_obj["time"]=tmp_json.get("d")
			all_data.append(json_obj)
	return all_data

def process_nasdaq_news_article(url, content, stock):
	soup = BeautifulSoup(content)
	new_headlines = soup.find_all('div', class_="news-headlines")
	all_data = []
	for i, tag in enumerate(new_headlines[0]):
		json_data = {}
		if i % 10 == 3 and 'class' not in tag.attrs:
			#         print i, tag
			json_data['title'] = sanitize(tag.span.a.text)
			json_data['final_url'] = tag.span.a['href']
			json_data['google_url'] = url
			date_and_author = tag.small.text
			json_data['time'] = sanitize(date_and_author.split('-')[0])
			json_data['source'] = sanitize(date_and_author.split('-')[1])
			json_data['stock'] = stock
			json_data['short_desc'] = process_nasdaq_news_paragraph(tag.span.a['href'])

			all_data.append(json_data)
	return all_data


def process_marketwatch_news_article(content):
	soup = BeautifulSoup(content)
	article__content = soup.find_all('div', class_="article__content")
	from bs4.element import Tag
	all_data = []
	for article in article__content:
		json_data = {}
		json_data['title'] = article.h3.a.text
		json_data['final_url'] = article.h3.a['href']
		for l in article.ul.children:

			if type(l) == Tag:
				print l['class'][0]
				if l['class'][0] == 'article__timestamp':
					json_data['time'] = l.text
				if l['class'][0] == 'article__author':
					json_data['author'] = l.text.split(" ")[-1]
		all_data.append(json_data)

	return all_data

def process_nasdaq_news_paragraph(url):
	from bs4 import BeautifulSoup
	import requests
	r = requests.get(url)
	data = r.text

	soup = BeautifulSoup(data)
	all_para = soup.find_all('p')
	article_text = ""
	for para in all_para[2:]:
		article_text += sanitize(para.text)

	return article_text
