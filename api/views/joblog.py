import json
import time
import urllib

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.shortcuts import render
from django.utils import timezone
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from sjsclient import client

from api.get_user import get_username
from api.models.joblog import Jobdetail, JobSerializer
from server import settings


def login_user(request):
    logout(request)
    username = password = ''
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect(render_html)
    return render(request, 'login/login.html')


# TODO: Check for ERROR, and more conditions
def submit_masterjob(configpath, parent_id):
    host = settings.HDFS['host']
    sjs = client.Client("http://"+host + ":" + "8090")
    test_app = sjs.apps.get("test_api_1")
    test_ctx = sjs.contexts.get("pysql-context")
    class_path = "bi.sparkjobs.madvisor.JobScript"
    config = 'cfgpath=[{0}]'.format(configpath)
    job = sjs.jobs.create(test_app, class_path, ctx=test_ctx, conf=config)
    job_url = "http://{0}:8090/jobs/{1}".format(host,job.jobId)
    print "job_url: {0}".format(job_url)

    create_joblog({
        'code':"{0}".format(job.jobId),
        'name':job_url,
        'job_type':"master",
        'status':"running",
        'resubmit_parent_id': parent_id,
        'input_details': json.dumps({
            'configpath': configpath
        })
    }, "create")

    time.sleep(2)

    final_status = None
    while True:
        check_status = urllib.urlopen(job_url)
        data = json.loads(check_status.read())

        if data.get("status") == "FINISHED":
            final_status = data.get("status")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "finished",
                'note': final_status
            }, "edit")
            break
        elif data.get("status") == "ERROR" and "startTime" in data.keys():
            final_status = data.get("status")
            error_statement = data.get("result")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "error",
                'note': json.dumps(error_statement)
            }, "edit")
            raise Exception("Jobserver might caught in some error!! Forget and Move on is only option.")
        time.sleep(1)

    return final_status

# TODO: Check for ERROR, and more condition
def submit_metadatajob(inputpath,resultpath, parent_id):
    host = settings.HDFS['host']
    host_with_hdfs = "hdfs://"+host
    sjs = client.Client("http://"+host + ":" + "8090")
    test_app = sjs.apps.get("test_api_1")
    test_ctx = sjs.contexts.get("pysql-context")
    class_path = "bi.sparkjobs.metadata.JobScript"
    config = 'input.strings=["{0}:9000/{1}","{0}:9000/{2}"]'.format(host_with_hdfs,inputpath,resultpath)
    job = sjs.jobs.create(test_app, class_path, ctx=test_ctx, conf=config)
    job_url = "http://{0}:8090/jobs/{1}".format(host, job.jobId)
    print "job_url: {0}".format(job_url)

    create_joblog({
        'code': "{0}".format(job.jobId),
        'name': job_url,
        'job_type': "metadata",
        'status': "running",
        'resubmit_parent_id': parent_id,
        'input_details': json.dumps({
            "inputpath": inputpath,
            "resultpath": resultpath
        })
    }, "create")

    time.sleep(2)

    final_status = None
    while True:
        check_status = urllib.urlopen(job_url)
        data = json.loads(check_status.read())
        if data.get("status") == "FINISHED":
            final_status = data.get("status")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "finished",
                'note': final_status
            }, "edit")
            break
        elif data.get("status") == "ERROR" and "startTime" in data.keys():
            final_status = data.get("status")
            error_statement = data.get("result")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "error",
                'note': json.dumps(error_statement)
            }, "edit")
            raise Exception("Jobserver might caught in some error!! Forget and Move on is only option.")
        else:
            pass
        time.sleep(1)
    return final_status

# TODO: Check for ERROR, and more condition
def submit_filterjob(inputpath,resultpath,measure_suggestions,consider_columns, measure_filter, dimension_filter, parent_id):
    host = settings.HDFS['host']
    host_with_hdfs = "hdfs://"+host
    sjs = client.Client("http://"+host + ":" + "8090")
    test_app = sjs.apps.get("test_api_1")
    test_ctx = sjs.contexts.get("pysql-context")
    class_path = "bi.sparkjobs.filter_job"
    config = {
        "input_path":"{}:9000/{}".format(host_with_hdfs,inputpath),
        "result_path" : "{}:9000/{}".format(host_with_hdfs,resultpath),
                "measure_suggestions" :measure_suggestions,
                 "consider_columns" :consider_columns,
                 "measure_filter" : measure_filter,
             "dimension_filter" : dimension_filter

    }
    # config = 'input.strings=["{0}:9000/{1}","{0}:9000/{2}",{3},{4},{5},{6}]'.format(host_with_hdfs,inputpath,resultpath,
    #                                                                 measure_suggestions,consider_columns,measure_filter,
    #                                                                 dimension_filter)
    job = sjs.jobs.create(test_app, class_path, ctx=test_ctx, conf= json.dumps(config))
    job_url = "http://{0}:8090/jobs/{1}".format(host, job.jobId)
    print "job_url: {0}".format(job_url)


    create_joblog({
        'code': "{0}".format(job.jobId),
        'name': job_url,
        'job_type': "filter",
        'status': "running",
        'resubmit_parent_id': parent_id,
        'input_details': json.dumps({
            "inputpath": inputpath,
            "resultpath": resultpath
        })
    }, "create")

    time.sleep(2)

    final_status = None
    while True:
        check_status = urllib.urlopen(job_url)
        data = json.loads(check_status.read())
        if data.get("status") == "FINISHED":
            final_status = data.get("status")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "finished",
                'note': final_status
            }, "edit")
            break
        elif data.get("status") == "ERROR" and "startTime" in data.keys():
            print '#'*300
            print json.dumps(data)
            final_status = data.get("status")
            error_statement = data.get("result")
            create_joblog({
                'code': "{0}".format(job.jobId),
                'status': "error",
                'note': json.dumps(error_statement)
            }, "edit")
            raise Exception("Jobserver might caught in some error!! Forget and Move on is only option.")
        else:
            pass
        time.sleep(1)
    return final_status

def create_joblog(data, action):
    user = get_username().user
    print data
    if action == "create":
        _set_job(data, user)
    elif action == "edit":
        _edit_job_for_submitjob(data)



def _get_job(id):
    id = int(id)
    job = Jobdetail.objects.get(id=id)
    if job:
        return job
    return None


def _get_job__on_code(code):
    print "_get_job__on_code code:", code
    job = Jobdetail.objects.filter(code=code)
    if job:
        return job[0]


def _get_jobs_this_user(userId):
    jobs = Jobdetail.objects.filter(submitted_by=userId)
    return jobs


def _get_all_jobs():
    jobs = Jobdetail.objects.all()
    return jobs


def _set_job(data, user):
    print "while setting job", data
    job = JobSerializer(data=data)
    if job.is_valid():
        job.save(submitted_by=user)
        print job.data
        return job.data
    else:
        raise Exception("Setting job failed")


def _edit_job(id, data):
    print "while editing job"
    job = _get_job(id)
    if job is None:
        job = _get_job__on_code(code=data['code'])

    job.status = data['status']
    job.note = data['note']

    job.save()
    return JobSerializer(job).data


def _edit_job_for_submitjob(data):
    print "while editing job", data

    job = _get_job__on_code(code=data['code'])

    job.status = data['status']
    job.note = data['note']

    job.save()
    return JobSerializer(job).data


def _kill_job(id, user):
    print "_kill_job"
    job = _get_job(id)

    if job.status == "running":
        resp = _kill_job_from_sjs(job.code)

        print resp

        job.killed_on = timezone.now()
        job.killed_by = user
        job.final_status = "killed"

        job.save()
        return JobSerializer(job).data
    else:
        return None


def _kill_job_from_sjs(jobId):
    print "_kill_job_from_sjs", jobId
    host = settings.HDFS['host']
    sjs = client.Client("http://"+host + ":" + "8090")
    resp = sjs.jobs.delete(jobId)
    return resp


def _delete_job(id):
    job = _get_job(id)
    job.delete()


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
# @login_required(login_url='/login/')
def get_jobs_of_this_user(request):
    """
    Get All jobs (Running Finished Error) from jobserver
    :param request: user login needed
    :return: JSON All Jobs details
    """
    user = request.user
    jobs = _get_jobs_this_user(user.id)
    return Response({"Job": JobSerializer(jobs, many=True).data})


@api_view(['POST'])
@renderer_classes((JSONRenderer,),)
def set_job(request):
    """
    Not In Use
    Insert an job row in Jobdetails Table.
    :param request: user and data
    :return: JSON Job details
    """
    user = request.user
    data = request.data
    job_data = _set_job(data, user)
    return Response({"details": job_data})


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def get_job(request, id):
    """
    Get a job detail
    :param request: user
    :param id: Job Id
    :return: JSON Job details
    """
    job = _get_job(id)
    return Response({"details": JobSerializer(job).data})


@api_view(['PUT'])
@renderer_classes((JSONRenderer,),)
def edit_job_of_this_user(request, id):
    """
    Edit a job detail
    :param request: user
    :param id: Job Id
    :return: JSON Job details
    """
    user = request.user
    job_details = _edit_job(id=id,
                            data=request.data)
    return Response({"detial": job_details})


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def kill_job_of_this_user(request, id):
    """
    Kill a running job
    :param request: user
    :param id: Job Id
    :return: Kill Message
    """
    user = request.user
    job_details = _kill_job(id=id,
                            user=user)
    if job_details is None:
        return Response("Failed to Kill.")
    else:
        return Response("Successfully Killed")


@api_view(['DELETE'])
@renderer_classes((JSONRenderer,),)
def delete_job(request, id):
    """
    Delete job
    :param request: user
    :param id: Job Id
    :return: Success Message
    """
    _delete_job(id)
    return Response({"status": "Success"})


@api_view(['GET'])
@renderer_classes((JSONRenderer,),)
def resubmit_job(request, id):
    """
    Resubmit an old job to rerun as new job
    :param request: user
    :param id: Parent Job Id
    :return: JSON Job details of new job
    """
    job = _get_job(id)

    data = json.loads(job.input_details)

    if job.final_status == "killed":
        if job.job_type == "metadata":
            submit_metadatajob(data['inputpath'], data['resultpath'], str(job.id))
        elif job.job_type == "master":
            submit_masterjob(data['configpath'], str(job.id))
    user = request.user

    if user.is_superuser:
        jobs = _get_all_jobs()
    else:
        jobs = _get_jobs_this_user(user.id)

    return render(request, 'joblog/jobdash.html', {'jobs': jobs, 'user': user})


# @api_view(['GET'])
# @renderer_classes((JSONRenderer,),)
@login_required(login_url='/api/user/login/')
def render_html(request):
    """
    Render Job Dashboard
    :param request: user
    :return: HTML
    """
    user = request.user
    if user.is_superuser:
        jobs = _get_all_jobs()
    else:
        jobs = _get_jobs_this_user(user.id)
    return render(request, 'joblog/jobdash.html', {'jobs': jobs, 'user': user})






