# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# import python default
import random
import string

# import django defaults
from django.template.defaultfilters import slugify
from django.db import models
from django.contrib.auth.models import User

# import rest_framework

# import helper
from helper import UPLOAD_FOLDER
from api.jobserver.views import submit_job


def dataset_upload_directory(instance):
    return "{0}{1}/".format(UPLOAD_FOLDER, instance.id)


def dataset_input_file_path(instance, filename):
    print("yes, I am in here")
    return dataset_upload_directory(instance) + "{0}".format(filename)


class Datasets(models.Model):
    name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=True)
    auto_update = models.BooleanField(default=False)
    auto_update_duration = models.IntegerField(default=99999)

    input_file = models.FileField(upload_to=dataset_input_file_path, null=True)
    db_type = models.CharField(max_length=100, null=True)
    db_details = models.TextField(default="{}")

    meta_data = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_on', '-updated_on']

    def __str__(self):
        return "Dataset|Name:{0}|Type:{1}".format(self.name, self.db_type)

    def as_dict(self):
        return {
            'name': self.name,
            'slug': self.slug,
            'auto_update': self.auto_update,
            'db_type': self.db_type,
            'db_details': self.db_details,
            'created_on': self.created_on,
            'bookmarked': self.bookmarked
        }

    def run_meta(self):
        submit_job(
            api_url='',
            class_name='class_path_metadata'
        )

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        # self.run_meta()
        super(Datasets, self).save(*args, **kwargs)

