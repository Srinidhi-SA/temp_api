from rest_framework import serializers
from .models import OCRImage


class OCRImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRImage
        fields = ['slug', 'file', 'imageset', 'datasource_type', 'datasource_details', 'created_at', 'created_by']
