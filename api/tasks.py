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

        if 'model_management_summary' in results:
            train_algo_details = results['model_management_summary']
            for algo_detail in train_algo_details:
                if len(algo_detail['listOfNodes']) > 1:
                    from api.utils import TrainAlgorithmMappingSerializer
                    temp_data = dict()
                    temp_data['name'] = algo_detail['name']
                    temp_data['data'] = json.dumps(add_slugs(algo_detail, object_slug=object_slug))
                    temp_data['trainer'] = trainer_object.id
                    temp_data['app_id'] = trainer_object.app_id
                    temp_data['created_by'] = trainer_object.created_by.id

                    serializer = TrainAlgorithmMappingSerializer(data=temp_data)
                    if serializer.is_valid():
                        train_algo_object = serializer.save()
                    else:
                        print(serializer.errors)
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
        results['name'] = stock_objects.name
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

        if 'model_management_summary' in results:
            train_algo_details = results['model_management_summary']
            for algo_detail in train_algo_details:
                if len(algo_detail['listOfNodes']) > 1:
                    from api.utils import TrainAlgorithmMappingSerializer
                    temp_data = dict()
                    temp_data['name'] = algo_detail['name']
                    temp_data['data'] = json.dumps(add_slugs(algo_detail, object_slug=object_slug))
                    temp_data['trainer'] = trainer_object
                    temp_data['created_by'] = trainer_object.created_by.id
                    temp_config = {}
                    for i in results['model_dropdown']:
                        if algo_detail['name'] == i['name']:
                            temp_config['selectedModel'] = i
                    temp_config['variablesSelection'] = {}
                    temp_config['app_id'] = trainer_object.app_id
                    temp_data['config'] = json.dumps(temp_config)

                    serializer = TrainAlgorithmMappingSerializer(data=temp_data)
                    if serializer.is_valid():
                        train_algo_object = serializer.save()
                    else:
                        print(serializer.errors)
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
        results['name'] = stock_objects.name
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

#
# @task(name='stock_sense_crawling', queue=CONFIG_FILE_NAME)
# def stock_sense_crawl(object_slug):
#
#     from api import helper
#     import json
#     from api.helper import get_db_object
#     from api.views import chart_changes_in_metadata_chart, add_slugs
#     print "stock_sense_crawl"*2
#     stock_dataset_object = get_db_object(model_name=StockDataset.__name__,
#                                    model_slug=object_slug
#                                    )
#     stock_dataset_object.call_mlscripts()
#     stock_dataset_object.save()


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
    stock_dataset_object.generate_meta_data()
    stock_dataset_object.save()
    # stock_dataset_object.call_mlscripts()


@task(name='print_this_every_minute', queue=CONFIG_FILE_NAME)
def print_this_every_minute(data):
    print(data)


@task(name='call_dataset_then_score', queue=CONFIG_FILE_NAME)
def call_dataset_then_score(*args, **kwrgs):
    print(args)

    print(kwrgs)
    # collect all configs
    config = kwrgs
    dataset_details = config['dataset_details']
    # score_details = config['score_details']
    # trainer_details = config['trainer_details']
    modeldeployment_details = config['modeldeployment_details']
    user_details = config['user_details']

    # fetch modeldeployment instance
    from api.models import ModelDeployment
    model_deployment_object = ModelDeployment.objects.get(slug=modeldeployment_details['modeldeployment_slug'])

    # fetch user instance
    from django.contrib.auth.models import User
    user_object = User.objects.get_by_natural_key(username=user_details['username'])

    # fetch trainer model
    # trainer_object = model_deployment_object.deploytrainer.trainer

    # create dataset
    dataset_details['input_file'] = None
    if 'datasetname' in dataset_details['datasource_details']:
        dataset_details['name'] = dataset_details['datasource_details']['datasetname']
        dataset_details['created_by'] = user_object.id
    from api.datasets.helper import convert_to_string
    from api.datasets.serializers import DatasetSerializer

    dataset_details = convert_to_string(dataset_details)
    serializer = DatasetSerializer(data=dataset_details, context={})
    if serializer.is_valid():
        dataset_object = serializer.save()
        model_deployment_object.dataset = dataset_object.id
        model_deployment_object.save()
        # dataset_object.create()
        #
        # # create score
        # dataset_object = dataset_object.data
        # original_meta_data_from_scripts = dataset_object['meta_data']
        #
        # if original_meta_data_from_scripts is None:
        #     uiMetaData = None
        # if original_meta_data_from_scripts == {}:
        #     uiMetaData = None
        # else:
        #     permissions_dict = {
        #         'create_signal': user_object.has_perm('api.create_signal'),
        #         'subsetting_dataset': user_object.has_perm('api.subsetting_dataset')
        #     }
        #     from api.datasets.helper import add_ui_metadata_to_metadata
        #     uiMetaData = add_ui_metadata_to_metadata(original_meta_data_from_scripts, permissions_dict=permissions_dict)
        #
        # from api.utils import convert_to_string
        # import json
        # # dataset_metadata = json.loads(dataset_object.meta_data)
        # score_details['config'] = model_deployment_object.get_trainer_details_for_score()
        # score_details['config']['variablesSelection'] = uiMetaData['varibaleSelectionArray']
        # score_details['trainer'] = trainer_object.id
        # score_details['dataset'] = dataset_object.id
        # score_details['created_by'] = user_object.id
        # score_details['app_id'] = int(score_details['config']['app_id'])
        # score_details = convert_to_string(score_details)
        # from api.utils import ScoreSerlializer
        # score_serializer = ScoreSerlializer(data=score_details, context={})
        # if score_serializer.is_valid():
        #     score_object = score_serializer.save()
        #     # we will not call score_object.create() here it will be called in write_into_databases
        #     model_deployment_object.score = score_object.id
        #     model_deployment_object.save()
        #     print(dataset_object,score_object)
        # else:
        #     print(score_serializer.errors)
    else:
        print(serializer.errors)

'''
Things to do
- call dataset object create function (uncomment in above code)
- Once dataset is completed from ML side they will 
    -> call set_result API 
    -> which will call write_into_database
    -> where we need to check if database is part of DatasetScore Table
    -> if yes, trigger score object create function
'''


def check_if_dataset_is_part_of_datascore_table_and_do_we_need_to_trigger_score(dataset_object):
    from api.models import DatasetScoreDeployment
    datasetscore_deployment_object = DatasetScoreDeployment.objects.filter(dataset=dataset_object.id)
    if datasetscore_deployment_object is not None:
        score_object = datasetscore_deployment_object.score
        if score_object is not None:
            if score_object.status == 'NOT STARTED':
                score_object.create()

