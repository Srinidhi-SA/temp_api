# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from api.user_helper import UserSerializer
from django.contrib.auth.models import User

from api.models import Dataset
from helper import convert_to_json, convert_time_to_human


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
        instance.db_details = validated_data.get('db_details', instance.db_details)
        instance.db_type = validated_data.get('db_type', instance.db_type)

        instance.save()
        return instance

    def to_representation(self, instance):
        ret = super(DatasetSerializer, self).to_representation(instance)
        ret = convert_to_json(ret)
        ret = convert_time_to_human(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        return ret

    class Meta:
        model = Dataset
        exclude = ( 'id', 'updated_at')


class DataListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dataset
        fields = (
            "slug",
            "name",
            "created_at",
            "updated_at",
            "input_file",
            "db_type",
            "bookmarked",
            "analysis_done",
            "file_remote"
        )

"""
        fields = (
            "input_file",
            "auto_update",
            "auto_update_duration",
            "input_file",
            "db_type",
            "db_details",
            "preview",
            "meta_data",
            "file_remote",

        )
"""


"""
name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=True)
    auto_update = models.BooleanField(default=False)
    auto_update_duration = models.IntegerField(default=99999)

    input_file = models.FileField(upload_to='datasets', null=True)
    db_type = models.CharField(max_length=100, null=True)
    db_details = models.TextField(default="{}")
    preview = models.TextField(default="{}")

    meta_data = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

    bookmarked = models.BooleanField(default=False)
    file_remote = models.CharField(max_length=100, null=True)
    analysis_done = models.BooleanField(default=False
"""
