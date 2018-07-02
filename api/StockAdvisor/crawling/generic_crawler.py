import os
import hashlib
import common_utils
import requests
import time

class GenericCrawler:
	def __init__(self,crawl_options={}):
		self.headers={"User-Agent":"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:53.0) Gecko/20100101 Firefox/53.0","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","Accept-Language":"en-US,en;q=0.5","Accept-Encoding":"gzip, deflate, br"}
		self.fdir=os.environ["HOME"]+"/html/"+crawl_options.get("source","misc")

	def get_data(self,url,crawl_options={}):
		fname=self.fdir+"/"+common_utils.get_sha(url)
		print "File is : ",fname
		content=""
		if os.path.exists(fname):
			obj=open(fname)
			content=obj.read()
		else:
			# resp=requests.get(url,headers=self.headers)
			resp=requests.get(url,headers={})
			time.sleep(2)
			content=resp.content
			html_dir=os.path.dirname(fname)
			if not os.path.exists(html_dir):
				os.makedirs(html_dir)
			obj=open(fname,"w")
			obj.write(content)
			obj.close()
		return content
