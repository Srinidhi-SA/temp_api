import json

import os
import re

import sys
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.utils import humanize_datetime
from sjsclient import client

from api.helper import JobserverDetails, get_job_status, get_message
from api.user_helper import UserSerializer
from models import Insight, Dataset, Trainer, Score, Job, Robo, Audioset, StockDataset, CustomApps

from django.conf import settings
import subprocess


import json
from pygments import highlight
from pygments.lexers import JsonLexer
from pygments.formatters import HtmlFormatter

from django.utils.safestring import mark_safe


def submit_job_through_yarn(slug, class_name, job_config, job_name=None, message_slug=None, queue_name=None,app_id= None):
    config = generate_job_config(class_name, job_config, job_name, message_slug, slug,app_id)

    try:
        base_dir = correct_base_dir()
        scripts_dir = os.path.join(base_dir, "scripts")
        egg_file_path = os.path.join(scripts_dir, "marlabs_bi_jobs-0.0.0-py2.7.egg")
        driver_file = os.path.join(scripts_dir, "driver.py")

        print("About to submit job through YARN")
        # Submit_job to YARN
        print queue_name

        if queue_name is None:
            command_array = ["spark-submit", "--name", job_name, "--master", "yarn", "--py-files", egg_file_path,
                             driver_file,
                             json.dumps(config)]
        else:
            command_array = ["spark-submit", "--name", job_name, "--master", "yarn", "--queue", queue_name,
                             "--py-files", egg_file_path, driver_file,
                             json.dumps(config)]

        application_id = ""

        from tasks import submit_job_separate_task

        submit_job_separate_task.delay(command_array, slug)

    except Exception as e:
        print 'Error-->submit_job_through_yarn--->'
        print e
        pass
        # from smtp_email import send_alert_through_email
        # send_alert_through_email(e)

    return {
        "application_id": application_id,
        "command_array": command_array,
        "queue_name": queue_name,
        "egg_file_path": egg_file_path,
        "driver_py_file_path": driver_file,
        "config": config
    }


def generate_job_config(class_name, job_config, job_name, message_slug, slug,app_id=None):
    # here
    temp_config = JobserverDetails.get_config(slug=slug,
                                              class_name=class_name,
                                              job_name=job_name,
                                              message_slug=message_slug,
                                              app_id=app_id
                                              )
    config = {}
    config['job_config'] = job_config
    config['job_config'].update(temp_config)

    return config


def submit_job_through_job_server(slug, class_name, job_config, job_name=None, message_slug=None):
    sjs = client.Client( JobserverDetails.get_jobserver_url())
    app = sjs.apps.get(JobserverDetails.get_app())
    ctx = sjs.contexts.get(JobserverDetails.get_context())

    # class path for all class name are same, it is job_type which distinguishes which scripts to run
    # actually not much use of this function for now. things may change in future.
    class_path = JobserverDetails.get_class_path(class_name)

    config = generate_job_config(class_name, job_config, job_name, message_slug, slug)


    try:
        job = sjs.jobs.create(app, class_path, ctx=ctx, conf=json.dumps(config))
    except Exception as e:
        from smtp_email import send_alert_through_email
        send_alert_through_email(e)
        return None

    # print
    job_url = JobserverDetails.print_job_details(job)
    return job_url


def submit_job(slug, class_name, job_config, job_name=None, message_slug=None,queue_name=None,app_id=None):
    """Based on config, submit jobs either through YARN or job server"""
    if settings.SUBMIT_JOB_THROUGH_YARN:
        return submit_job_through_yarn(slug, class_name, job_config, job_name, message_slug,queue_name=queue_name,app_id=app_id)
    else:
        return submit_job_through_job_server(slug, class_name, job_config, job_name, message_slug)

def convert_to_string(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data', 'model_data', 'meta_data']

    for key in keys:
        if key in data:
            value = data[key]
            if isinstance(value, str):
                pass
            elif isinstance(value, dict):
                data[key] = json.dumps(value)

    return data


def convert_to_json(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data', 'model_data', 'meta_data']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = json.loads(value)

    string_to_list_keys = ['stock_symbols']

    for key in string_to_list_keys:
        if key in data:
            value = data[key]
            data[key] = value.split(',')
    return data


def convert_time_to_human(data):
    keys = ['created_on', 'updated_on']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = humanize_datetime.humanize_strptime(value)
    return data


# TODO: use dataserializer
class InsightSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(InsightSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        if instance.viewed == False and instance.status=='SUCCESS':
            instance.viewed = True
            instance.save()
        try:
            message_list = get_message(instance.job)

            if message_list is not None:
                message_list = [message_list[-1]]
            ret['message'] = message_list
        except:
            ret['message'] = None
        if dataset_object.datasource_type=='fileUpload':
            PROCEED_TO_UPLOAD_CONSTANT = settings.PROCEED_TO_UPLOAD_CONSTANT
            try:
                from api.helper import convert_to_humanize
                ret['file_size']=convert_to_humanize(dataset_object.input_file.size)
                if(dataset_object.input_file.size < PROCEED_TO_UPLOAD_CONSTANT or ret['status']=='SUCCESS'):
                    ret['proceed_for_loading']=True
                else:
                    ret['proceed_for_loading'] = False
            except:
                ret['file_size']=-1
                ret['proceed_for_loading'] = True
        return ret

    def update(self, instance, validated_data):
        instance.compare_with = validated_data.get("compare_with", instance.compare_with)
        instance.compare_type = validated_data.get("compare_type", instance.compare_type)
        instance.column_data_raw = validated_data.get("column_data_raw", instance.column_data_raw)
        instance.status = validated_data.get("status", instance.status)
        instance.live_status = validated_data.get("live_status", instance.live_status)
        instance.analysis_done = validated_data.get("analysis_done", instance.analysis_done)
        instance.name = validated_data.get("name", instance.name)
        instance.deleted = validated_data.get("deleted", instance.deleted)

        instance.save()

        return instance

    class Meta:
        model = Insight
        exclude = ('compare_with', 'compare_type', 'column_data_raw', 'id')


class InsightListSerializers(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(InsightListSerializers, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['brief_info'] = instance.get_brief_info()

        # ret['is_viewed'] = False
        try:
            ret['completed_percentage']=get_message(instance.job)[-1]['globalCompletionPercentage']
            ret['completed_message']=get_message(instance.job)[-1]['shortExplanation']
        except:
            ret['completed_percentage'] = 0
            ret['completed_message']="Analyzing Target Variable"
        return ret

    def get_brief_info(self):
        pass

    class Meta:
        model = Insight
        exclude = (
            'compare_with',
            'compare_type',
            'column_data_raw',
            'id',
            'config',
            'data'
        )



class TrainerSerlializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(TrainerSerlializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        if instance.viewed == False and instance.status=='SUCCESS':
            instance.viewed = True
            instance.save()
        try:
            message_list = get_message(instance.job)

            if message_list is not None:
                message_list = [message_list[-1]]
            ret['message'] = message_list
        except:
            ret['message'] = None

        if dataset_object.datasource_type=='fileUpload':
            PROCEED_TO_UPLOAD_CONSTANT = settings.PROCEED_TO_UPLOAD_CONSTANT
            try:
                from api.helper import convert_to_humanize
                ret['file_size']=convert_to_humanize(dataset_object.input_file.size)
                if(dataset_object.input_file.size < PROCEED_TO_UPLOAD_CONSTANT or ret['status']=='SUCCESS'):
                    ret['proceed_for_loading']=True
                else:
                    ret['proceed_for_loading'] = False
            except:
                ret['file_size']=-1
                ret['proceed_for_loading'] = True
        return ret

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.column_data_raw = validated_data.get("column_data_raw", instance.column_data_raw)
        instance.deleted = validated_data.get("deleted", instance.deleted)
        instance.bookmarked = validated_data.get("bookmarked", instance.bookmarked)
        instance.data = validated_data.get("data", instance.data)
        instance.live_status = validated_data.get("live_status", instance.live_status)
        instance.status = validated_data.get("status", instance.status)



        instance.save()

        return instance

    class Meta:
        model = Trainer
        exclude = ('id', 'job')


class TrainerListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(TrainerListSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['brief_info'] = instance.get_brief_info()
        try:
            ret['completed_percentage']=get_message(instance.job)[-1]['globalCompletionPercentage']
            ret['completed_message']=get_message(instance.job)[-1]['shortExplanation']
        except:
            ret['completed_percentage'] = 0
            ret['completed_message']="Analyzing Target Variable"
        return ret


    class Meta:
        model = Trainer
        exclude =  (
            'column_data_raw',
            'id',
            'config',
            'data'
        )


class ScoreSerlializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(ScoreSerlializer, self).to_representation(instance)
        trainer = ret['trainer']
        trainer_object = Trainer.objects.get(pk=trainer)
        ret['trainer'] = trainer_object.slug
        ret['trainer_name'] = trainer_object.name
        ret['dataset'] = trainer_object.dataset.slug
        ret['dataset_name'] = trainer_object.dataset.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        try:
            ret['message'] = get_message(instance)
        except:
            ret['message'] = None
        return ret

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.config = validated_data.get("config", instance.config)
        instance.deleted = validated_data.get("deleted", instance.deleted)
        instance.bookmarked = validated_data.get("bookmarked", instance.bookmarked)
        instance.data = validated_data.get("data", instance.data)
        instance.model_data = validated_data.get("model_data", instance.model_data)
        instance.column_data_raw = validated_data.get("column_data_raw", instance.column_data_raw)

        instance.save()

        return instance

    class Meta:
        model = Score
        exclude = ('id', 'job')


class ScoreListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(ScoreListSerializer, self).to_representation(instance)
        trainer = ret['trainer']
        trainer_object = Trainer.objects.get(pk=trainer)
        ret['trainer'] = trainer_object.slug
        ret['trainer_name'] = trainer_object.name
        ret['dataset'] = trainer_object.dataset.slug
        ret['dataset_name'] = trainer_object.dataset.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['brief_info'] = instance.get_brief_info()
        return ret

    class Meta:
        model = Score
        exclude =  (
            'column_data_raw',
            'id',
            'config',
            'data'
        )


class JobSerializer(serializers.Serializer):

    class Meta:
        model = Job
        exclude = ("id", "created_at")


class RoboSerializer(serializers.ModelSerializer):

    class Meta:
        model = Robo
        exclude = ("id", "config", "column_data_raw")

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.analysis_done = validated_data.get('analysis_done', instance.analysis_done)
        instance.deleted = validated_data.get('deleted', instance.deleted)

        instance.save()
        return instance

    def to_representation(self, instance):

        from api.datasets.serializers import DatasetSerializer
        ret = super(RoboSerializer, self).to_representation(instance)

        customer_dataset_object = Dataset.objects.get(pk=ret['customer_dataset'])
        ret['customer_dataset'] = DatasetSerializer(customer_dataset_object).data

        historical_dataset_object = Dataset.objects.get(pk=ret['historical_dataset'])
        ret['historical_dataset'] = DatasetSerializer(historical_dataset_object).data

        market_dataset_object = Dataset.objects.get(pk=ret['market_dataset'])
        ret['market_dataset'] = DatasetSerializer(market_dataset_object).data

        if instance.dataset_analysis_done is False:
            if customer_dataset_object.analysis_done and \
                historical_dataset_object.analysis_done and \
                    market_dataset_object.analysis_done:
                instance.dataset_analysis_done = True
                instance.save()


        if instance.robo_analysis_done and instance.dataset_analysis_done:
            instance.analysis_done = True

            if 'FAILED' in [
                customer_dataset_object.status,
                historical_dataset_object.status,
                market_dataset_object.status
                ]:
                instance.status = 'FAILED'
            else:
                instance.status = "SUCCESS"
            instance.save()

        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['analysis_done'] = instance.analysis_done

        try:
            ret['message'] = get_message(instance)
        except:
            ret['message'] = None
        return ret


class RoboListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        from api.datasets.serializers import DatasetSerializer
        ret = super(RoboListSerializer, self).to_representation(instance)

        customer_dataset_object = Dataset.objects.get(pk=ret['customer_dataset'])
        ret['customer_dataset'] = customer_dataset_object.slug

        historical_dataset_object = Dataset.objects.get(pk=ret['historical_dataset'])
        ret['historical_dataset'] = historical_dataset_object.slug

        market_dataset_object = Dataset.objects.get(pk=ret['market_dataset'])
        ret['market_dataset'] = market_dataset_object.slug

        ret['dataset_name'] = market_dataset_object.name + ", " +\
                              customer_dataset_object.name + ", " + \
                              historical_dataset_object.name

        if instance.analysis_done is False:
            if customer_dataset_object.analysis_done and \
                historical_dataset_object.analysis_done and \
                    market_dataset_object.analysis_done:
                instance.analysis_done = True
                instance.save()

        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['analysis_done'] = instance.analysis_done
        return ret

    class Meta:
        model = Robo
        exclude =  (
            'id',
            'config',
            'data'
        )

class StockDatasetSerializer(serializers.ModelSerializer):

    # name = serializers.CharField(max_length=100,
    #                              validators=[UniqueValidator(queryset=Dataset.objects.all())]
    #                              )

    input_file = serializers.FileField(allow_null=True)

    def update(self, instance, validated_data):
        instance.meta_data = validated_data.get('meta_data', instance.meta_data)
        instance.name = validated_data.get('name', instance.name)
        instance.created_by = validated_data.get('created_by', instance.created_by)
        instance.deleted = validated_data.get('deleted', instance.deleted)
        instance.bookmarked = validated_data.get('bookmarked', instance.bookmarked)
        instance.auto_update = validated_data.get('auto_update', instance.auto_update)
        # instance.auto_update_duration = validated_data.get('auto_update_duration', instance.auto_update_duration)

        instance.save()
        return instance

    def to_representation(self, instance):
        print get_job_status(instance)
        ret = super(StockDatasetSerializer, self).to_representation(instance)
        ret = convert_to_json(ret)
        ret = convert_time_to_human(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data

        try:
            ret['message'] = get_message(instance)
        except:
            ret['message'] = None

        return ret

    class Meta:
        model = StockDataset
        exclude = ( 'id', 'updated_at')

class StockDatasetListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        print get_job_status(instance)
        ret = super(StockDatasetListSerializer, self).to_representation(instance)
        ret['brief_info'] = instance.get_brief_info()
        return ret

    class Meta:
        model = StockDataset
        fields = (
            "slug",
            "name",
            "created_at",
            "updated_at",
            "input_file",
            "bookmarked",
            "analysis_done"
        )



class AudiosetSerializer(serializers.ModelSerializer):

    # name = serializers.CharField(max_length=100,
    #                              validators=[UniqueValidator(queryset=Dataset.objects.all())]
    #                              )

    input_file = serializers.FileField(allow_null=True)

    def update(self, instance, validated_data):
        instance.meta_data = validated_data.get('meta_data', instance.meta_data)
        instance.name = validated_data.get('name', instance.name)
        instance.created_by = validated_data.get('created_by', instance.created_by)
        instance.deleted = validated_data.get('deleted', instance.deleted)
        instance.bookmarked = validated_data.get('bookmarked', instance.bookmarked)
        instance.auto_update = validated_data.get('auto_update', instance.auto_update)
        instance.auto_update_duration = validated_data.get('auto_update_duration', instance.auto_update_duration)
        instance.datasource_details = validated_data.get('datasource_details', instance.datasource_details)
        instance.datasource_type = validated_data.get('datasource_type', instance.datasource_type)

        instance.save()
        return instance

    def to_representation(self, instance):
        print get_job_status(instance)
        ret = super(AudiosetSerializer, self).to_representation(instance)
        ret = convert_to_json(ret)
        ret = convert_time_to_human(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data

        try:
            ret['message'] = get_message(instance)
        except:
            ret['message'] = None

        return ret

    class Meta:
        model = Audioset
        exclude = ( 'id', 'updated_at')


class AudioListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(AudioListSerializer, self).to_representation(instance)
        ret['brief_info'] = instance.get_brief_info()
        return ret

    class Meta:
        model = Audioset
        fields = (
            "slug",
            "name",
            "created_at",
            "updated_at",
            "input_file",
            "datasource_type",
            "bookmarked",
            "analysis_done",
            "file_remote"
        )

class AppListSerializers(serializers.ModelSerializer):
        def to_representation(self, instance):
            ret = super(AppListSerializers, self).to_representation(instance)
            ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data['username']
            #add tags object
            template_tags = settings.APPS_KEYWORD_TEMPLATE
            if ret['tags'] != None:
                tags = ret['tags'].split(",")
                tag_object = []
                for obj in template_tags:
                    if obj['name'] in tags:
                        tag_object.append(obj)
                #print tag_object
                ret['tags'] = tag_object
                #add all keys list
                ret['tag_keywords'] = self.add_all_tag_keywords(template_tags)

                CUSTOM_WORD1_APPS = settings.CUSTOM_WORD1_APPS
                CUSTOM_WORD2_APPS = settings.CUSTOM_WORD2_APPS
                upper_case_name = ret['name'].upper()
                print upper_case_name
                ret['custom_word1'] = CUSTOM_WORD1_APPS[upper_case_name]
                ret['custom_word2'] = CUSTOM_WORD2_APPS[upper_case_name]
            return ret

        def add_all_tag_keywords(self,template_tags):
            tag_keywords=[]
            for key in template_tags:
                tag_keywords.append(key['name'])
            return tag_keywords

        class Meta:
            model = CustomApps
            fields = '__all__'

class AppSerializer(serializers.ModelSerializer):
        def to_representation(self, instance):
            print "in app serializers"
            ret = super(AppSerializer, self).to_representation(instance)
            ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
            if ret['tags'] != None:
                tags = ret['tags'].split(",")
                tag_object = []

                template_tags = settings.APPS_KEYWORD_TEMPLATE
                for obj in template_tags:
                    if obj['name'] in tags:
                        tag_object.append(obj)

                print tag_object

                ret['tags'] = tag_object

            CUSTOM_WORD1_APPS = settings.CUSTOM_WORD1_APPS
            CUSTOM_WORD2_APPS = settings.CUSTOM_WORD2_APPS
            upper_case_name = ret['name'].upper()
            print upper_case_name
            ret['CUSTOM_WORD1_APPS'] = CUSTOM_WORD1_APPS[upper_case_name]
            ret['CUSTOM_WORD2_APPS'] = CUSTOM_WORD2_APPS[upper_case_name]
            return ret


        def update(self, instance, validated_data):
            instance.app_id = validated_data.get("app_id", instance.app_id)
            instance.displayName = validated_data.get("displayName", instance.displayName)
            instance.description = validated_data.get("description", instance.description)
            instance.status = validated_data.get("status", instance.status)
            instance.tags = validated_data.get("tags", instance.tags)
            instance.iconName = validated_data.get("iconName", instance.iconName)
            instance.name = validated_data.get("name", instance.name)
            instance.app_url = validated_data.get("app_url", instance.app_url)

            instance.save()

            return instance

        class Meta:
            model = CustomApps
            fields = '__all__'


def correct_base_dir():
    if  settings.BASE_DIR.endswith("config") or settings.BASE_DIR.endswith("config/"):
        return os.path.dirname(settings.BASE_DIR)
    else:
        return settings.BASE_DIR

def json_prettify_for_admin(json_val):
    response = json.dumps(json_val, sort_keys=True, indent=2)
    formatter = HtmlFormatter(style='colorful')
    response = highlight(response, JsonLexer(), formatter)
    style = "<style>" + formatter.get_style_defs() + "</style><br>"

    return mark_safe(style + response +"<hr>")

