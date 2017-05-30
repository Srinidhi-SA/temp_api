import time
import json
import urllib

from server import  settings
from sjsclient import client
from sjsclient import app
from rest_framework.response import Response

# TODO: Check for ERROR, and more conditions
def submit_masterjob(configpath):
    host = settings.HDFS['host']
    sjs = client.Client("http://"+host + ":" + "8090")
    test_app = sjs.apps.get("test_api_1")
    test_ctx = sjs.contexts.get("pysql-context")
    class_path = "bi.sparkjobs.madvisor.JobScript"
    config = 'cfgpath=[{0}]'.format(configpath)
    job = sjs.jobs.create(test_app, class_path, ctx=test_ctx, conf=config)
    job_url = "http://{0}:8090/jobs/{1}".format(host,job.jobId)
    print "job_url: {0}".format(job_url)

    time.sleep(2)

    final_status = None
    while True:
        check_status = urllib.urlopen(job_url)
        data = json.loads(check_status.read())

        if data.get("status") == "FINISHED":
            final_status = data.get("status")
            break
        elif data.get("status") == "ERROR" and "startTime" in data.keys():
            final_status = data.get("status")
            raise Exception("Jobserver might caught in some error!! Forget and Move on is only option.")
        time.sleep(1)

    return final_status

# TODO: Check for ERROR, and more condition
def submit_metadatajob(inputpath,resultpath):
    host = settings.HDFS['host']
    host_with_hdfs = "hdfs://"+host
    sjs = client.Client("http://"+host + ":" + "8090")
    test_app = sjs.apps.get("test_api_1")
    test_ctx = sjs.contexts.get("pysql-context")
    class_path = "bi.sparkjobs.metadata.JobScript"
    config = 'input.strings=["{0}:8020/{1}","{0}:8020/{2}"]'.format(host_with_hdfs,inputpath,resultpath)
    job = sjs.jobs.create(test_app, class_path, ctx=test_ctx, conf=config)
    job_url = "http://{0}:8090/jobs/{1}".format(host, job.jobId)
    print "job_url: {0}".format(job_url)
    time.sleep(2)

    final_status = None
    while True:
        check_status = urllib.urlopen(job_url)
        data = json.loads(check_status.read())
        if data.get("status") == "FINISHED":
            final_status = data.get("status")
            break
        elif data.get("status") == "ERROR" and "startTime" in data.keys():
            final_status = data.get("status")
            raise Exception("Jobserver might caught in some error!! Forget and Move on is only option.")
        else:
            pass
        time.sleep(1)
    return final_status
