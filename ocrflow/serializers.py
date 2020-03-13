from rest_framework import serializers
from .models import Task, ReviewRequest
from ocr.models import OCRImage
from ocr.serializers import OCRImageReviewSerializer

class ContentObjectRelatedField(serializers.RelatedField):
    """
    A custom field to use for the `content_object` generic relationship.
    """
    def to_representation(self, instance):
        """
        Serialize tagged objects to a simple textual representation.
        """
        if isinstance(instance, ReviewRequest):
            serializer = ReviewRequestSerializer(instance)
            return serializer.data
        elif isinstance(instance, Task):
            serializer = TaskSerializer(instance)
            return serializer.data

        raise Exception('Unexpected type of tagged object')

class TaskSerializer(serializers.ModelSerializer):
    """
    """
    def to_representation(self, instance):
        serialized_data = super(TaskSerializer, self).to_representation(instance)

        return serialized_data

    class Meta:
        """
        Meta class definition for ReviewerTypeSerializer
        """
        model = Task
        fields = ("id", "assigned_group", "assigned_user", "is_closed", 'comments', 'reviewed_on')

class ReviewRequestListSerializer(serializers.ModelSerializer):
    """
    """

    tasks=ContentObjectRelatedField(many=True, queryset=Task.objects.all())

    class Meta:
        """
        Meta class definition for ReviewRequestListSerializer
        """
        model = ReviewRequest
        fields = '__all__'

class ReviewRequestSerializer(serializers.ModelSerializer):
    """
    """

    tasks=ContentObjectRelatedField(many=True, queryset=Task.objects.all())
    def to_representation(self, instance):
        serialized_data = super(ReviewRequestSerializer, self).to_representation(instance)
        Image_instance = OCRImage.objects.get(id=instance.ocr_image.id)
        serialized_data['ocrImageData'] = OCRImageReviewSerializer(Image_instance).data
        return serialized_data

    class Meta:
        """
        Meta class definition for ReviewRequestSerializer
        """
        model = ReviewRequest
        exclude = ('id', 'slug', 'ocr_image', 'created_by')
