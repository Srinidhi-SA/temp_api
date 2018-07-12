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
		self.proxy_list = [
			{'http': u'http://46.225.241.6:8080'},
			{'http': u'http://66.119.180.104:80'},
			{'http': u'http://202.51.17.246:80'},
			{'http': u'http://202.179.190.210:8080'},
			{'http': u'http://103.94.64.90:8080'},
			{'http': u'http://202.138.254.29:8080'},
			{'http': u'http://197.159.16.2:8080'},
			{'http': u'http://host131-186-static.58-217-b.business.telecomitalia.it:8080'},
			{'http': u'http://182.253.142.16:8080'},
			{'http': u'http://152.231.29.210:8080'},
			{'http': u'http://103.234.137.158:8080'},
			{'http': u'http://131.161.124.36:3128'},
			{'http': u'http://195.138.91.117:8080'},
			{'http': u'http://185.36.172.190:8080'},
			{'http': u'http://client-90-123-107-176.kk-net.cz:8080'},
			{'http': u'http://46.209.25.1:8080'},
			{'http': u'http://165.16.113.210:8080'},
			{'http': u'http://168.232.157.142:8080'}
			]

	def get_proxy(self):
		import random
		get_number = random.randint(0, 17)
		return self.proxy_list[get_number]

	def get_data(self,url,crawl_options={}):
		if 'date_of_crawl' in crawl_options:
			if crawl_options['date_of_crawl'] == True:
				print "Asked today's Fresh Page?"
				fname=self.fdir+"/"+common_utils.get_sha(url + str(datetime.now().date()))
		elif "fresh" in crawl_options:
			if crawl_options['fresh'] == True:
				print "Asked Fresh Page?"
				fname = self.fdir + "/" + common_utils.get_sha(url + str(random.randint(99999999, 100000000000)))
		else:
			print "Asked for Archieved Page?"
			fname = self.fdir + "/" + common_utils.get_sha(url)
		content=""
		if os.path.exists(fname):
			print "Archieved Page."
			obj=open(fname)
			content=obj.read()
		else:
			print "Requesting New Page -->", self.headers, self.get_proxy()
			try:
				resp=requests.get(url,headers=self.headers)
			except:
				try:
					resp = requests.get(url, headers=self.headers, proxies=self.get_proxy())
				except:
					resp = requests.get(url,headers=self.headers, proxies=self.get_proxy())


			print "Response Came"
			content=resp.content
			html_dir=os.path.dirname(fname)
			if not os.path.exists(html_dir):
				os.makedirs(html_dir)
			obj=open(fname,"w")
			obj.write(content)
			obj.close()
		return content
