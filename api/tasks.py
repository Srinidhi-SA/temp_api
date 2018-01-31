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
from api.models import Job


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