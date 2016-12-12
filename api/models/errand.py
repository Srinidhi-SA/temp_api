from django.db import models
from rest_framework import serializers

def errand_input_file_directory_path(instance, filename):
    return "uploads/errands/{0}/{1}".format(instance.id, filename)

class Errand(models.Model):
    slug = models.CharField(max_length=100)
    input_file = models.FileField(upload_to=errand_input_file_directory_path, null=True, blank=True)

    # CLASS METHODS
    @classmethod
    def make(cls, data, input_file):
        obj = cls(slug=data.get('slug'))
        obj.save()
        obj.input_file =  input_file
        obj.save()
        return obj

class ErrandSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=100)
    id = serializers.ReadOnlyField()

    class Meta:
        model = Errand
        fields = ('id', 'slug')
