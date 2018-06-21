from __future__ import absolute_import, unicode_literals

import random

import signal

import os
from celery.decorators import task
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME
from django.conf import settings


@task(name="sum_two_numbers")
def add(x, y):
    print "crazy bird {0}{1}".format(x,y)
    return x + y


@task(name="multiply_two_numbers")
def mul(x, y):
    total = x * (y * random.randint(3, 100))
    return total


@task(name="sum_list_numbers")
def xsum(numbers):
    return sum(numbers)


import subprocess
import re
from api.models import Job, Dataset, Score, Insight, Trainer, StockDataset, Robo


@task(name='hum_se_hai_zamana_sara', queue=CONFIG_FILE_NAME)
def submit_job_separate_task(command_array, slug):
    import subprocess, os
    my_env = os.environ.copy()
    if settings.HADOOP_CONF_DIR:
        my_env["HADOOP_CONF_DIR"] = settings.HADOOP_CONF_DIR
        my_env["HADOOP_USER_NAME"] = settings.HADOOP_USER_NAME
    cur_process = subprocess.Popen(command_array, stderr=subprocess.PIPE, env=my_env)
    print cur_process
    # TODO: @Ankush need to write the error to error log and standard out to normal log
    for line in iter(lambda: cur_process.stderr.readline(), ''):
        # print(line.strip())
        match = re.search('Submitted application (.*)$', line)
        if match:
            application_id = match.groups()[0]
            from api.helper import get_db_object

            model_instance = get_db_object(model_name=Job.__name__,
                                           model_slug=slug
                                           )
            model_instance.url = application_id
            model_instance.save()
            break

def submit_job_separate_task1(command_array, slug):
    import subprocess, os
    my_env = os.environ.copy()
    if settings.HADOOP_CONF_DIR:
        my_env["HADOOP_CONF_DIR"] = settings.HADOOP_CONF_DIR
        my_env["HADOOP_USER_NAME"] = settings.HADOOP_USER_NAME
    cur_process = subprocess.Popen(command_array, stderr=subprocess.PIPE, env=my_env)
    print cur_process
    # TODO: @Ankush need to write the error to error log and standard out to normal log
    for line in iter(lambda: cur_process.stderr.readline(), ''):
        # print(line.strip())
        match = re.search('Submitted application (.*)$', line)
        if match:
            application_id = match.groups()[0]
            from api.helper import get_db_object

            model_instance = get_db_object(model_name=Job.__name__,
                                           model_slug=slug
                                           )
            model_instance.url = application_id
            model_instance.save()
            break

@task(name='write_into_databases', queue=CONFIG_FILE_NAME)
def write_into_databases(job_type, object_slug, results):
    from api import helper
    import json
    from api.helper import get_db_object
    from api.views import chart_changes_in_metadata_chart, add_slugs

    if job_type in ["metadata", "subSetting"]:
        dataset_object = get_db_object(model_name=Dataset.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            dataset_object.status = "FAILED"
            dataset_object.save()
            return results
        columnData = results['columnData']
        for data in columnData:
            # data["chartData"] = helper.find_chart_data_and_replace_with_chart_data(data["chartData"])
            card_data = data["chartData"]
            if 'dataType' in card_data and card_data['dataType'] == 'c3Chart':
                chart_data = card_data['data']
                final_chart_data = helper.decode_and_convert_chart_raw_data(chart_data, object_slug=object_slug)
                data["chartData"] = chart_changes_in_metadata_chart(final_chart_data)
                data["chartData"]["table_c3"] = []

        results['columnData'] = columnData
        # results['possibleAnalysis'] = settings.ANALYSIS_FOR_TARGET_VARIABLE
        da = []
        for d in results.get('sampleData'):
            da.append(map(str, d))
        results['sampleData'] = da
        # results["modified"] = False

        dataset_object.meta_data = json.dumps(results)
        dataset_object.analysis_done = True
        dataset_object.status = 'SUCCESS'
        dataset_object.save()
        return results
    elif job_type == "master":
        insight_object = get_db_object(model_name=Insight.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            insight_object.status = "FAILED"
            insight_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        insight_object.data = json.dumps(results)
        insight_object.analysis_done = True
        insight_object.status = 'SUCCESS'
        insight_object.save()
        return results
    elif job_type == "model":
        trainer_object = get_db_object(model_name=Trainer.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results or "model_summary" not in results:
            trainer_object.status = "FAILED"
            trainer_object.save()
            return results

        results['model_summary'] = add_slugs(results['model_summary'],object_slug=object_slug)
        trainer_object.data = json.dumps(results)
        trainer_object.analysis_done = True
        trainer_object.status = 'SUCCESS'
        trainer_object.save()
        return results
    elif job_type == 'score':
        score_object = get_db_object(model_name=Score.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            score_object.status = "FAILED"
            score_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        score_object.data = json.dumps(results)
        score_object.analysis_done = True
        score_object.status = 'SUCCESS'
        score_object.save()
        return results
    elif job_type == 'robo':
        robo_object = get_db_object(model_name=Robo.__name__,
                                    model_slug=object_slug
                                    )

        if "error_message" in results:
            robo_object.status = "FAILED"
            robo_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        robo_object.data = json.dumps(results)
        robo_object.robo_analysis_done = True
        robo_object.status = 'SUCCESS'
        robo_object.save()
        return results
    elif job_type == 'stockAdvisor':
        stock_objects = get_db_object(model_name=StockDataset.__name__,
                                           model_slug=object_slug
                                           )
        results = add_slugs(results, object_slug=object_slug)
        stock_objects.data = json.dumps(results)
        stock_objects.analysis_done = True
        stock_objects.status = 'SUCCESS'
        stock_objects.save()
        return results
    else:
        print "No where to write"

def write_into_databases1(job_type, object_slug, results):
    from api import helper
    import json
    from api.helper import get_db_object
    from api.views import chart_changes_in_metadata_chart, add_slugs

    if job_type in ["metadata", "subSetting"]:
        dataset_object = get_db_object(model_name=Dataset.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            dataset_object.status = "FAILED"
            dataset_object.save()
            return results
        columnData = results['columnData']
        for data in columnData:
            # data["chartData"] = helper.find_chart_data_and_replace_with_chart_data(data["chartData"])
            card_data = data["chartData"]
            if 'dataType' in card_data and card_data['dataType'] == 'c3Chart':
                chart_data = card_data['data']
                final_chart_data = helper.decode_and_convert_chart_raw_data(chart_data, object_slug=object_slug)
                data["chartData"] = chart_changes_in_metadata_chart(final_chart_data)
                data["chartData"]["table_c3"] = []

        results['columnData'] = columnData
        # results['possibleAnalysis'] = settings.ANALYSIS_FOR_TARGET_VARIABLE
        da = []
        for d in results.get('sampleData'):
            da.append(map(str, d))
        results['sampleData'] = da
        # results["modified"] = False

        dataset_object.meta_data = json.dumps(results)
        dataset_object.analysis_done = True
        dataset_object.save()
        return results
    elif job_type == "master":
        insight_object = get_db_object(model_name=Insight.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            insight_object.status = "FAILED"
            insight_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        insight_object.data = json.dumps(results)
        insight_object.analysis_done = True
        insight_object.status = 'SUCCESS'
        insight_object.save()
        return results
    elif job_type == "model":
        trainer_object = get_db_object(model_name=Trainer.__name__,
                                           model_slug=object_slug
                                           )
        if "error_message" in results or "model_summary" not in results:
            trainer_object.status = "FAILED"
            trainer_object.save()
            return results

        results['model_summary'] = add_slugs(results['model_summary'],object_slug=object_slug)
        trainer_object.data = json.dumps(results)
        trainer_object.analysis_done = True
        trainer_object.status = 'SUCCESS'
        trainer_object.save()
        return results
    elif job_type == 'score':
        score_object = get_db_object(model_name=Score.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            score_object.status = "FAILED"
            score_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        score_object.data = json.dumps(results)
        score_object.analysis_done = True
        score_object.status = 'SUCCESS'
        score_object.save()
        return results
    elif job_type == 'robo':
        robo_object = get_db_object(model_name=Robo.__name__,
                                    model_slug=object_slug
                                    )

        if "error_message" in results:
            robo_object.status = "FAILED"
            robo_object.save()
            return results

        results = add_slugs(results, object_slug=object_slug)
        robo_object.data = json.dumps(results)
        robo_object.robo_analysis_done = True
        robo_object.status = 'SUCCESS'
        robo_object.save()
        return results
    elif job_type == 'stockAdvisor':
        stock_objects = get_db_object(model_name=StockDataset.__name__,
                                           model_slug=object_slug
                                           )
        results = add_slugs(results, object_slug=object_slug)
        stock_objects.data = json.dumps(results)
        stock_objects.analysis_done = True
        stock_objects.status = 'SUCCESS'
        stock_objects.save()
        return results
    else:
        print "No where to write"


@task(name='save_results_to_job', queue=CONFIG_FILE_NAME)
def save_results_to_job(slug, results):
    from api.helper import get_db_object
    import json

    job = get_db_object(model_name=Job.__name__,
                                   model_slug=slug
                                   )

    if isinstance(results, str) or isinstance(results, unicode):
        job.results = results
    elif isinstance(results, dict):
        results = json.dumps(results)
        job.results = results
    job.save()


@task(name='cleanup_logentry', queue=CONFIG_FILE_NAME)
def save_results_to_job1(slug, results):
    from api.helper import get_db_object
    import json

    job = get_db_object(model_name=Job.__name__,
                                   model_slug=slug
                                   )

    if isinstance(results, str) or isinstance(results, unicode):
        job.results = results
    elif isinstance(results, dict):
        results = json.dumps(results)
        job.results = results
    job.save()
    print "save hogaya "*100



@task(name='cleanup_logentry')
def clean_up_logentry():

    from auditlog.models import LogEntry
    from django.contrib.auth.models import User

    all_users = User.objects.all()

    for user in all_users:
        log_entries = LogEntry.objects.filter(actor=user.id).count()
        LogEntry.objects.all().delete()
        print "delete object(s) :- %{0}".format(log_entries)


@task(name='cleanup_on_delete', queue=CONFIG_FILE_NAME)
def clean_up_on_delete(slug, model_name):
    from api.models import SaveAnyData, Job, SaveData

    job_instance = Job.objects.filter(object_id__contains=slug).first()
    if job_instance:
        job_instance.data = '{}'
        job_instance.save()

    sad_instance = SaveAnyData.objects.filter(slug__contains=slug)
    print len(sad_instance)
    sad_instance.delete()

    sd_instance = SaveData.objects.filter(object_slug__contains=slug)
    print len(sd_instance)
    sd_instance.delete()


@task(name='kill_job_using_application_id', queue=CONFIG_FILE_NAME)
def kill_application_using_fabric(app_id=None):

    if None == app_id:
        return -1

    from fabric.api import env, run
    from django.conf import settings

    HDFS = settings.HDFS
    BASEDIR = settings.BASE_DIR
    emr_file = BASEDIR + settings.PEM_KEY

    env.key_filename = [emr_file]
    if CONFIG_FILE_NAME == 'cwpoc':
        env.host_string = "{0}@{1}".format("ankush", HDFS["host"])
    else:
        env.host_string = "{0}@{1}".format(HDFS["user.name"], HDFS["host"])

    try:
        capture = run("yarn application --kill {0}".format(app_id))

        if 'finished' in capture:
            return False
        else:
            return True
    except:
        return True


@task(name='stock_sense_crawling', queue=CONFIG_FILE_NAME)
def stock_sense_crawl(object_slug):

    from api import helper
    import json
    from api.helper import get_db_object
    from api.views import chart_changes_in_metadata_chart, add_slugs
    print "stock_sense_crawl"*2
    stock_dataset_object = get_db_object(model_name=StockDataset.__name__,
                                   model_slug=object_slug
                                   )
    print "got_object"*10
    stock_dataset_object.generate_meta_data()
    print "stock_sense_crawl"*2
    metafile = open('/tmp/metafile_{0}'.format(stock_dataset_object.slug), 'w')
    stock_dataset_object.meta_data = metafile.write(json.loads(metafile.read()))
    stock_dataset_object.fake_call_mlscripts()
    stock_dataset_object.save()
