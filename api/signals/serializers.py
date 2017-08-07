from rest_framework import serializers
from models import Signal


class SignalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Signal
        # fields = '__all__'
        exclude = ('compare_with', 'compare_type', 'column_data_raw', 'deleted')