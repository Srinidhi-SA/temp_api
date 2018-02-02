from __future__ import absolute_import, unicode_literals
import random
from celery.decorators import task
from api.redis_access import AccessFeedbackMessage


@task(name="sum_two_numbers")
def add(x, y):
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


@task(name='hum_se_hai_zamana_sara')
def submit_job_separate_task(command_array, slug):
    cur_process = subprocess.Popen(command_array, stderr=subprocess.PIPE)
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


@task(name='write_into_databases')
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
                final_chart_data = helper.decode_and_convert_chart_raw_data(chart_data)
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

        results = add_slugs(results)
        insight_object.data = json.dumps(results)
        insight_object.analysis_done = True
        insight_object.status = 'SUCCESS'
        insight_object.save()
        return results
    elif job_type == "model":
        trainer_object = get_db_object(model_name=Trainer.__name__,
                                           model_slug=object_slug
                                           )

        if "error_message" in results:
            trainer_object.status = "FAILED"
            trainer_object.save()
            return results

        results['model_summary'] = add_slugs(results['model_summary'])
        trainer_object.data = json.dumps(results)
        trainer_object.analysis_done = True
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

        results = add_slugs(results)
        score_object.data = json.dumps(results)
        score_object.analysis_done = True
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

        results = add_slugs(results)
        robo_object.data = json.dumps(results)
        robo_object.robo_analysis_done = True
        robo_object.save()
        return results
    elif job_type == 'stockAdvisor':
        stock_objects = get_db_object(model_name=StockDataset.__name__,
                                           model_slug=object_slug
                                           )
        results = add_slugs(results)
        stock_objects.data = json.dumps(results)
        stock_objects.analysis_done = True
        stock_objects.status = 'SUCCESS'
        stock_objects.save()
        return results
    else:
        print "No where to write"


@task(name='save_results_to_job')
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