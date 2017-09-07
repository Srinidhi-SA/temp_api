import json

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.utils import humanize_datetime
from sjsclient import client

from api.helper import JobserverDetails, get_jobserver_status
from api.user_helper import UserSerializer
from models import Insight, Dataset, Trainer, Score, Job, Robo


def submit_job(
        slug,
        class_name,
        job_config,
        job_name=None
):
    sjs = client.Client(
        JobserverDetails.get_jobserver_url()
    )

    app = sjs.apps.get(
        JobserverDetails.get_app()
    )

    ctx = sjs.contexts.get(
        JobserverDetails.get_context()
    )

    # class path for all class name are same, it is job_type which distinguishes which scripts to run
    # actually not much use of this function for now. things may change in future.
    class_path = JobserverDetails.get_class_path(class_name)

    # here
    config1 = JobserverDetails.get_config(slug=slug,
                                         class_name=class_name,
                                          job_name=job_name
                                          )
    config = {}
    config['job_config'] = job_config
    config['job_config'].update(config1)

    print "overall---------config"
    print config
    job = sjs.jobs.create(app, class_path, ctx=ctx, conf=json.dumps(config))

    # print
    job_url = JobserverDetails.print_job_details(job)
    return job_url


def convert_to_string(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data', 'model_data']

    for key in keys:
        if key in data:
            value = data[key]
            if isinstance(value, str):
                pass
            elif isinstance(value, dict):
                data[key] = json.dumps(value)

    return data


def convert_to_json(data):
    keys = ['compare_type', 'column_data_raw', 'config', 'data', 'model_data']

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


# TODO: use dataserializer
class InsightSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        print get_jobserver_status(instance)
        ret = super(InsightSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
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
        ret = super(InsightListSerializers, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        return ret

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
        print get_jobserver_status(instance)
        ret = super(TrainerSerlializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        return ret

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.column_data_raw = validated_data.get("column_data_raw", instance.column_data_raw)
        instance.deleted = validated_data.get("deleted", instance.deleted)
        instance.bookmarked = validated_data.get("bookmarked", instance.bookmarked)
        instance.data = validated_data.get("data", instance.data)

        instance.save()

        return instance

    class Meta:
        model = Trainer
        exclude = ('id', 'job')


class TrainerListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(TrainerListSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Dataset.objects.get(pk=dataset)
        ret['dataset'] = dataset_object.slug
        ret['dataset_name'] = dataset_object.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
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
        print get_jobserver_status(instance)
        ret = super(ScoreSerlializer, self).to_representation(instance)
        trainer = ret['trainer']
        trainer_object = Trainer.objects.get(pk=trainer)
        ret['trainer'] = trainer_object.slug
        ret['trainer_name'] = trainer_object.name
        ret['dataset'] = trainer_object.dataset.slug
        ret['dataset_name'] = trainer_object.dataset.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
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
        ret = super(ScoreListSerializer, self).to_representation(instance)
        trainer = ret['trainer']
        trainer_object = Trainer.objects.get(pk=trainer)
        ret['trainer'] = trainer_object.slug
        ret['trainer_name'] = trainer_object.name
        ret['dataset'] = trainer_object.dataset.slug
        ret['dataset_name'] = trainer_object.dataset.name
        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
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

        print get_jobserver_status(instance)
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
            print get_jobserver_status(instance)
            instance.save()

        ret = convert_to_json(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        ret['analysis_done'] = instance.analysis_done
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



