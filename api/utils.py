import json

from rest_framework import serializers
from rest_framework.utils import humanize_datetime
from sjsclient import client

from models import Job, Insight, Dataset
from django.conf import settings


def submit_job(class_name, config_json):
    """

    :param class_name:
    :param config_json:
    :return:
    """
    job = Job()

    sjs = client.Client(JobserverDetails.get_jobserver_url())
    app = sjs.apps.get(JobserverDetails.get_app())
    ctx = sjs.contexts.get(JobserverDetails.get_context())
    class_path = JobserverDetails.get_class_path(class_name)
    job = sjs.jobs.create(app, class_path, ctx=ctx, conf=config_json)

    # print
    JobserverDetails.print_job_details(job)


def convert_to_string(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data']

    for key in keys:
        if key in data:
            value = data[key]
            if isinstance(value, str):
                pass
            elif isinstance(value, dict):
                data[key] = json.dumps(value)

    return data


def convert_to_json(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = json.loads(value)
    return data


def convert_time_to_human(data):
    keys = ['created_on', 'updated_on']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = humanize_datetime.humanize_strptime(value)
    return data


class InsightSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        ret = super(InsightSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret = convert_to_json(ret)
        return ret

    def update(self, instance, validated_data):
        instance.compare_with = validated_data.get("compare_with", instance.compare_with)
        instance.compare_type = validated_data.get("compare_type", instance.compare_type)
        instance.column_data_raw = validated_data.get("column_data_raw", instance.column_data_raw)
        instance.status = validated_data.get("status", instance.status)
        instance.live_status = validated_data.get("live_status", instance.live_status)
        instance.analysis_done = validated_data.get("analysis_done", instance.analysis_done)

        instance.save()

        return instance

    class Meta:
        model = Insight
        exclude = ('compare_with', 'compare_type', 'column_data_raw', 'id')


class JobserverDetails(object):
    @classmethod
    def get_jobserver_url(cls):
        return "http://" + settings.JOBSERVER.get('HOST') + ":" + settings.JOBSERVER.get('PORT')

    @classmethod
    def get_app(cls):
        return settings.JOBSERVER.get('app-name')

    @classmethod
    def get_context(cls):
        return settings.JOBSERVER.get('context')

    @classmethod
    def get_class_path(cls, name):
        if name not in settings.JOBSERVER:
            raise Exception('No such class.')
        return settings.JOBSERVER.get(name)

    @classmethod
    def print_job_details(cls, job):
        job_url = "{0}/{2}".format(cls.get_jobserver_url(), job.jobId)
        print "job_url: {0}".format(job_url)
