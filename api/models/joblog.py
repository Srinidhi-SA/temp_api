from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import User

class Jobdetail(models.Model):
    status_choices = (('running', 'r'), ('finished', 'f'), ('error', 'e'))

    slug = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    job_type = models.CharField(max_length=100)
    status = models.CharField(max_length=100, choices=status_choices)
    submitted_on = models.DateTimeField(auto_now_add=True)
    submitted_by = models.ForeignKey(User, null=True)
    note = models.TextField(default='{}')
    killed_on = models.DateTimeField(null=True)
    killed_by = models.ForeignKey(User, null=True)
    input_details = models.TextField(default='{}')
    resubmit_parent_id = models.ForeignKey('self', null=True)



class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Jobdetail
        fields = ('id',
                  'code',
                  'name',
                  'job_type',
                  'status',
                  'submitted_on',
                  'submitted_by',
                  'note',
                  'killed_on',
                  'killed_by',
                  'input_details',
                  'resubmit_parent_id')
