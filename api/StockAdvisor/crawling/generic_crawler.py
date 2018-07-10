import os
import hashlib
import common_utils
import requests
import time
from datetime import datetime
import random

class GenericCrawler:
	def __init__(self,crawl_options={}):
		self.headers={"User-Agent":"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:53.0) Gecko/20100101 Firefox/53.0","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","Accept-Language":"en-US,en;q=0.5","Accept-Encoding":"gzip, deflate, br"}
		self.fdir=os.environ["HOME"]+"/html/"+crawl_options.get("source","misc")

	def get_data(self,url,crawl_options={}):

		if 'date_of_crawl' in crawl_options:
			if crawl_options['date_of_crawl'] == True:
				fname=self.fdir+"/"+common_utils.get_sha(url + str(datetime.now().date()))
				print "File is : ",fname
		elif "fresh" in crawl_options:
			if crawl_options['fresh'] == True:
				fname = self.fdir + "/" + common_utils.get_sha(url + str(random.randint(100000,9999999)))
				print "File is : ", fname
		else:
			fname = self.fdir + "/" + common_utils.get_sha(url)
			print "File is : ", fname
		content=""
		if os.path.exists(fname):
			print "File was there: H"
			obj=open(fname)
			content=obj.read()
		else:
			resp=requests.get(url,headers=self.headers)
			# resp=requests.get(url,headers={})
			# time.sleep(2)
			print "get_data get_data"
			content=resp.content
			if "historic" in url:
				print url, resp
			html_dir=os.path.dirname(fname)
			if not os.path.exists(html_dir):
				os.makedirs(html_dir)
			obj=open(fname,"w")
			obj.write(content)
			obj.close()
		return content
