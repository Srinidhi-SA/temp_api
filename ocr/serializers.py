from rest_framework import serializers

from api.user_helper import UserSerializer
from .models import OCRImage, OCRImageset

'''
    *Serializers*
-------------------------------------------------
Model : OCRImage
Viewset : OCRImageView
Defined Serilizers :
    - Details Serializer : OCRImageSerializer
    - List Serializer : OCRImageListSerializer
-------------------------------------------------
'''


class OCRImageSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRImage
    Viewset : OCRImageView
    Defined Serilizers :
        - Details Serializer : OCRImageSerializer
        - List Serializer : OCRImageListSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageSerializer, self).to_representation(instance)
        # serialized_data = convert_to_json(serialized_data)
        # serialized_data = convert_time_to_human(serialized_data)
        serialized_data['created_by'] = UserSerializer(instance.created_by).data['username']

        '''
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

        try:
            ret['job_status'] = instance.job.status
        except:
            ret['job_status'] = None

        if 'request' in self.context:
            # permission details
            permission_details = get_permissions(
                user=self.context['request'].user,
                model=self.Meta.model.__name__.lower(),
            )
            serialized_data['permission_details'] = permission_details
        '''
        return serialized_data

    class Meta:
        model = OCRImage
        fields = ['slug', 'file', 'datasource_type', 'created_at', 'status', 'created_by']


class OCRImageListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        serialized_data = super(OCRImageListSerializer, self).to_representation(instance)
        # ret['brief_info'] = instance.get_brief_info()

        # permission details
        # permission_details = get_permissions(
        #     user=self.context['request'].user,
        #     model=self.Meta.model.__name__.lower(),
        # )
        # ret['permission_details'] = permission_details
        return serialized_data

    class Meta(object):
        model = OCRImage
        fields = ['slug', 'file']


class OCRImageSetSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        serialized_data = super(OCRImageSetSerializer, self).to_representation(instance)
        serialized_data['created_by'] = UserSerializer(instance.created_by).data

        return serialized_data

    class Meta:
        model = OCRImageset
        fields = ['slug', 'file', 'datasource_type', 'created_at', 'created_by']


class OCRImageSetListSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        serialized_data = super(OCRImageSetListSerializer, self).to_representation(instance)
        return serialized_data

    class Meta(object):
        model = OCRImageset
        fields = ['slug', 'file']
