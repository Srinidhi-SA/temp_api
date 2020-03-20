"""
    Serializers implementation for OCRImage and OCRImageset models.
"""

from rest_framework import serializers

from api.user_helper import UserSerializer
from .models import OCRImage, OCRImageset, OCRUserProfile, Project
from django.contrib.auth.models import User, Group


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

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRImageSerializer
        """
        model = OCRImage
        # fields = ['slug', 'name', 'imagefile', 'datasource_type', 'imageset', 'status', 'confidence', 'comment', 'created_at', 'created_by', 'project', 'generated_image', ]
        exclude = ['id']


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
        serialized_data['assignee'] = instance.get_assignee()
        serialized_data['created_by'] = UserSerializer(instance.created_by).data['username']

        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageListSerializer
        """
        model = OCRImage
        fields = ['name', 'slug', 'status', 'confidence', 'comment', 'imagefile', 'flag', 'created_at', 'created_by', 'modified_at']


class OCRImageExtractListSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImage
    -------------------------------------------------
    Model : OCRImage
    List Serializer : OCRImageExtractListSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageExtractListSerializer, self).to_representation(instance)

        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageExtractListSerializer
        """
        model = OCRImage
        fields = ['imagefile', 'generated_image', 'slug']


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
        fields = ['name', 'slug', 'imagepath', 'deleted', 'status', 'created_at', 'created_by','project']


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
        fields = ['user_type', 'is_active', 'slug',]

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
        fields = ("username", "first_name", "last_name", "email", "date_joined", "last_login", "is_superuser", "groups")


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
        serialized_data['ocr_profile'] = ocr_profile_obj.json_serialized()

        if len(serialized_data['ocr_profile']["role"]) == 1:
            serialized_data['ocr_user'] = True
        else:
            serialized_data['ocr_user'] = False

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRUserProfileSerializer
        """
        model = User
        fields = ("username", "first_name", "last_name", "email", "date_joined", "last_login", "is_superuser")


class GroupSerializer(serializers.ModelSerializer):
    """
    """

    def to_representation(self, instance):
        serialized_data = super(GroupSerializer, self).to_representation(instance)

        return serialized_data

    class Meta:
        """
        Meta class definition for GroupSerializer
        """
        model = Group
        fields = ('id','name')


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
        serialized_data['project_overview'] = instance.get_project_overview()
        serialized_data['created_by'] = UserSerializer(instance.created_by).data['username']
        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageSetListSerializer
        """
        model = Project
        fields = ['slug', 'name', 'created_at', 'created_by']

class OCRReviewerSerializer(serializers.ModelSerializer):
    """
    """

    def to_representation(self, instance):
        serialized_data = super(OCRReviewerSerializer, self).to_representation(instance)
        ocr_profile_obj = OCRUserProfile.objects.get(ocr_user=instance)
        serialized_data['ocr_profile'] = ocr_profile_obj.json_serialized()
        serialized_data['ocr_data'] = ocr_profile_obj.reviewer_data()

        if len(serialized_data['ocr_profile']["role"]) == 1:
            serialized_data['ocr_user'] = True
        else:
            serialized_data['ocr_user'] = False

        return serialized_data

    class Meta:
        """
        Meta class definition for OCRUserProfileSerializer
        """
        model = User
        fields = ("username", "last_login")

class OCRImageReviewSerializer(serializers.ModelSerializer):
    """
        List Serializer definition for OCRImage
    -------------------------------------------------
    Model : OCRImage
    List Serializer : OCRImageReviewSerializer
    -------------------------------------------------
    """

    def to_representation(self, instance):
        serialized_data = super(OCRImageReviewSerializer, self).to_representation(instance)

        return serialized_data

    class Meta(object):
        """
        Meta class definition for OCRImageListSerializer
        """
        model = OCRImage
        fields = ['name', 'slug', 'imagefile']
