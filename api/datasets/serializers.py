# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from api.user_helper import UserSerializer
from django.contrib.auth.models import User
from django.conf import settings

from api.models import Dataset
from helper import convert_to_json, convert_time_to_human
from api.helper import get_job_status, get_message
import copy
import json

from api.utils import get_permissions


class DatasetSerializer(serializers.ModelSerializer):

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
        get_job_status(instance)
        ret = super(DatasetSerializer, self).to_representation(instance)
        ret = convert_to_json(ret)
        ret = convert_time_to_human(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data

        try:
            ret['message'] = get_message(instance.job)
        except:
            ret['message'] = None

        if instance.viewed == False and instance.status=='SUCCESS':
            instance.viewed = True
            instance.save()

        if instance.datasource_type=='fileUpload':
            PROCEED_TO_UPLOAD_CONSTANT = settings.PROCEED_TO_UPLOAD_CONSTANT
            try:
                from api.helper import convert_to_humanize
                ret['file_size']=convert_to_humanize(instance.input_file.size)
                if(instance.input_file.size < PROCEED_TO_UPLOAD_CONSTANT or ret['status']=='SUCCESS'):
                    ret['proceed_for_loading']=True
                else:
                    ret['proceed_for_loading'] = False
            except:
                ret['file_size']=-1
                ret['proceed_for_loading'] = True

        ret['job_status'] = instance.job.status

        # permission details
        permission_details = get_permissions(
            user=self.context['request'].user,
            model=self.Meta.model.__name__.lower(),
        )
        ret['permission_details'] = permission_details
        return ret

    class Meta:
        model = Dataset
        exclude = ( 'id', 'updated_at')


class DataListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        get_job_status(instance)
        ret = super(DataListSerializer, self).to_representation(instance)
        ret['brief_info'] = instance.get_brief_info()

        try:
            ret['completed_percentage']=get_message(instance.job)[-1]['globalCompletionPercentage']
            ret['completed_message']=get_message(instance.job)[-1]['shortExplanation']
        except:
            ret['completed_percentage'] = 0
            ret['completed_message']="Analyzing Target Variable"

        ret['job_status'] = instance.job.status

        # permission details
        permission_details = get_permissions(
            user=self.context['request'].user,
            model=self.Meta.model.__name__.lower(),
        )
        ret['permission_details'] = permission_details
        return ret

    class Meta:
        model = Dataset
        fields = (
            "slug",
            "name",
            "created_at",
            "updated_at",
            "input_file",
            "datasource_type",
            "bookmarked",
            "analysis_done",
            "file_remote",
            "status",
            "viewed"
        )


class DataNameListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(DataNameListSerializer, self).to_representation(instance)
        return ret

    class Meta:
        model = Dataset
        fields = (
            "slug",
            "name"
        )
