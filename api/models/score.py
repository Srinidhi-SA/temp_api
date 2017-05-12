from django.db import models
from rest_framework import serializers
from api.models.trainer import Trainer
from api.models.dataset import Dataset


class Score(models.Model):

    name = models.CharField(max_length=300, null=True)
    trainer = models.ForeignKey(Trainer, null=False)
    dataset = models.ForeignKey(Dataset, null=False)
    userId = models.CharField(max_length=100, null=True)
    details = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def func1(self):
        pass

    def funct2(self):
        pass

class ScoreSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    trainer = serializers.ReadOnlyField()
    user_id = serializers.ReadOnlyField()
    dataset = serializers.ReadOnlyField()
    created_at = serializers.DateTimeField()

    # class Meta:
    #     model = Score
    #     field = ('id', 'name', 'created_at', 'user_id')