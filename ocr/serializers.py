"""
    Serializers implementation for OCRImage and OCRImageset models.
"""

from rest_framework import serializers

from api.user_helper import UserSerializer
from .models import OCRImage, OCRImageset, OCRUserProfile, ReviewerType, \
    Project
from django.contrib.auth.models import User

# -------------------------------------------------------------------------------
# pylint: disable=too-many-ancestors
# pylint: disable=no-member
# pylint: disable=useless-object-inheritance
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=too-few-public-methods
# pylint: disable=pointless-string-statement
# -------------------------------------------------------------------------------


class OCRImageSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRImage
    Viewset : OCRImageView
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
        """
        Meta class definition for OCRImageSerializer
        """
        model = OCRImage
        fields = ['slug', 'name', 'imagefile', 'datasource_type', 'imageset', 'status', 'confidence', 'comment', 'created_at', 'created_by', 'project', 'generated_image']


class OCRImageListSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImage
    -------------------------------------------------
    Model : OCRImage
    List Serializer : OCRImageListSerializer
    -------------------------------------------------
    """

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
        """
        Meta class definition for OCRImageListSerializer
        """
        model = OCRImage
        fields = ['name', 'slug', 'status', 'confidence', 'comment', 'imagefile']


class OCRImageExtractListSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImage
    -------------------------------------------------
    Model : OCRImage
    List Serializer : OCRImageListSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageExtractListSerializer, self).to_representation(instance)
        # ret['brief_info'] = instance.get_brief_info()

        # permission details
        # permission_details = get_permissions(
        #     user=self.context['request'].user,
        #     model=self.Meta.model.__name__.lower(),
        # )
        # ret['permission_details'] = permission_details
        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageListSerializer
        """
        model = OCRImage
        fields = ['imagefile', 'generated_image']


class OCRImageSetSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRImageset
    Viewset : OCRImagesetView
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageSetSerializer, self).to_representation(instance)
        serialized_data['created_by'] = UserSerializer(instance.created_by).data

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRImageSetSerializer
        """
        model = OCRImageset
        fields = ['name', 'slug', 'imagepath', 'deleted', 'status', 'created_at', 'created_by']


class OCRImageSetListSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImageset
    -------------------------------------------------
    Model : OCRImageset
    List Serializer : OCRImageSetListSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageSetListSerializer, self).to_representation(instance)
        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageSetListSerializer
        """
        model = OCRImageset
        fields = ['slug', 'name']

class OCRUserProfileSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRUserProfile
    """

    def to_representation(self, instance):
        serialized_data = super(OCRUserProfileSerializer, self).to_representation(instance)
        serialized_data['user'] = OCRUserSerializer(instance.ocr_user).data

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRUserProfileSerializer
        """
        model = OCRUserProfile
        fields = ['user_type', 'is_active', 'slug', 'reviewer_type']

    # def update(self, instance, validated_data):
    #     print("inside update")
    #     instance.is_active = validated_data.get('is_active', instance.is_active)
    #     instance.reviewer_type = validated_data.get('reviewer_type', instance.reviewer_type)
    #     instance.save()
    #     return instance

class OCRUserProfileListSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRUserProfile
    """

    def to_representation(self, instance):
        serialized_data = super(OCRUserProfileListSerializer, self).to_representation(instance)

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRUserProfileSerializer
        """
        model = OCRUserProfile
        fields = ['user_type', 'is_active', 'slug', 'reviewer_type']

class OCRUserSerializer(serializers.ModelSerializer):
    """
    """
    def to_representation(self, instance):
        serialized_data = super(OCRUserSerializer, self).to_representation(instance)

        return serialized_data
    """
    """
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined", "last_login", "is_superuser")

class ProjectSerializer(serializers.ModelSerializer):
    """
        *Serializers*
    -------------------------------------------------
    Model : OCRImageset
    Viewset : OCRImagesetView
    """

    def to_representation(self, instance):
        serialized_data = super(ProjectSerializer, self).to_representation(instance)
        serialized_data['created_by'] = UserSerializer(instance.created_by).data

        return serialized_data

    class Meta:
        """
        """
        model = Project
        fields = ['name', 'slug', 'deleted', 'created_at', 'created_by']


class OCRUserListSerializer(serializers.ModelSerializer):
    """
    """
    def to_representation(self, instance):
        serialized_data = super(OCRUserListSerializer, self).to_representation(instance)
        ocr_profile_obj = OCRUserProfile.objects.get(ocr_user=instance)
        try:
            serialized_data['ocr_profile'] = ocr_profile_obj.json_serialized()
            serialized_data['ocr_user'] = True
        except:
            serialized_data['ocr_user'] = False
        #serialized_data['reviewer_type'] = ocr_profile_obj.reviewer_type.type if ocr_profile_obj is not None else None
        #print(serialized_data)

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRUserProfileSerializer
        """
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined", "last_login", "is_superuser")

class ReviewerTypeSerializer(serializers.ModelSerializer):
    """
    """
    def to_representation(self, instance):
        serialized_data = super(ReviewerTypeSerializer, self).to_representation(instance)

        return serialized_data

    class Meta:
        """
        Meta class definition for ReviewerTypeSerializer
        """
        model = ReviewerType
        fields = ("id","type")

class ProjectListSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImageset
    -------------------------------------------------
    Model : OCRImageset
    List Serializer : OCRImageSetListSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(ProjectListSerializer, self).to_representation(instance)
        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageSetListSerializer
        """
        model = Project
        fields = ['slug', 'name']
