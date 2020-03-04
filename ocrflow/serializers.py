from rest_framework import serializers
from .models import Task

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
        fields = ("id", "name", "slug", "is_closed")
