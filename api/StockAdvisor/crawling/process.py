import re
import sys
import common_utils

def sanitize(content,remove_tags=[]):
	for html_tag in remove_tags:
		tag_regex='(?is)<'+html_tag+'[^>]*?>.*?</'+html_tag+'>' #(?is) is important to add,as it ignores case and new lines in text
		content=re.sub(tag_regex,'',content)
	text=''
	text=re.sub('<.*?>',' ',content)
	if text:
		text=text.replace("\n","").replace("&nbsp;","").replace("\t"," ").replace("\u"," ").strip()
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
