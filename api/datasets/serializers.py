# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from api.models import Dataset
from helper import convert_to_json, convert_time_to_human


class DatasetSerializer(serializers.ModelSerializer):
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
        return ret

    class Meta:
        model = Dataset
        exclude = ('input_file', 'id')
