from rest_framework import serializers
from models import Signals
from api.datasets.models import Datasets
from helper import convert_to_json


class SignalSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(SignalSerializer, self).to_representation(instance)
        dataset = ret['dataset']
        dataset_object = Datasets.objects.get(pk=dataset)
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
        model = Signals
        exclude = ('compare_with', 'compare_type', 'column_data_raw', 'id')