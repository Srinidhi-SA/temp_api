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
        print get_job_status(instance)
        ret = super(DatasetSerializer, self).to_representation(instance)
        ret = convert_to_json(ret)
        ret = convert_time_to_human(ret)
        ret['created_by'] = UserSerializer(User.objects.get(pk=ret['created_by'])).data
        meta_data = ret.get('meta_data')
        self.changes_to_metadata(meta_data)
        try:
            ret['message'] = get_message(instance)
        except:
            ret['message'] = None

        return ret

    def changes_to_metadata(self, meta_data):

        if 'possibleAnalysis' in meta_data:
            meta_data['possibleAnalysis'] = settings.ANALYSIS_FOR_TARGET_VARIABLE
        meta_data['advanced_settings'] = self.get_advanced_setting(meta_data)

        transformation_final_obj = {"existingColumns":None,"newColumns":None}
        transformation_data = []
        if 'columnData' in meta_data:
            columnData = meta_data['columnData']
            transformation_settings = settings.TRANSFORMATION_SETTINGS_CONSTANT

            for head in columnData:
                import copy
                temp = dict()
                temp['name'] = head.get('name')
                temp['slug'] = head.get('slug')
                columnSettingCopy = copy.deepcopy(transformation_settings.get('columnSetting'))
                columnType = head.get('columnType')

                if "dimension" == columnType:
                    temp['columnSetting'] = columnSettingCopy[:3]
                elif "boolean" == columnType:
                    temp['columnSetting'] = columnSettingCopy[:3]
                elif "measure" == columnType:
                    datatype_element = columnSettingCopy[3]
                    datatype_element['listOfDataTypes'][0]["status"] = True
                    temp['columnSetting'] = columnSettingCopy
                elif "datetime" == columnType:
                    temp['columnSetting'] = columnSettingCopy[:3]
                transformation_data.append(temp)

            transformation_final_obj["existingColumns"] = transformation_data
            transformation_final_obj["newColumns"] = transformation_settings.get('new_columns')
            meta_data['transformation_settings'] = transformation_final_obj

    def get_advanced_setting(self, meta_data):
        metaData = meta_data.get('metaData')

        time_count = 0
        try:
            for data in metaData:
                if data.get('name') == 'timeDimension':
                    time_count += data.get('value')
                if data.get('name') == 'dateTimeSuggestions':
                    time_count += len(data.get('value').keys())
        except:
            pass

        print "get_advanced_setting    ", time_count

        return self.add_trend_in_advanced_setting(time_count)


    def add_trend_in_advanced_setting(self, time_count):

        if time_count > 0:
            main_setting = copy.deepcopy(settings.ADVANCED_SETTINGS_FOR_POSSIBLE_ANALYSIS_WITHOUT_TREND)
            trend_setting = copy.deepcopy(settings.ADANCED_SETTING_FOR_POSSIBLE_ANALYSIS_TREND)

            main_setting["dimensions"]["analysis"].insert(1, trend_setting)
            main_setting["measures"]["analysis"].insert(1, trend_setting)
            return main_setting
        else:
            return settings.ADVANCED_SETTINGS_FOR_POSSIBLE_ANALYSIS_WITHOUT_TREND


    class Meta:
        model = Dataset
        exclude = ( 'id', 'updated_at')


class DataListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(DataListSerializer, self).to_representation(instance)
        ret['brief_info'] = instance.get_brief_info()
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
            "status"
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
