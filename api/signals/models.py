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

# import models
from api.datasets.models import Datasets

# Create your models here.

STATUS_CHOICES = (
    ('0', 'Not Started Yet'),
    ('1', 'Signal Creation Started.'),
    ('2', 'Trend Created'),
    ('3', 'ChiSquare Created'),
    ('4', 'Decision Tree Created'),
    ('5', 'Density Histogram Created'),
    ('6', 'Regression Created'),
    ('7', 'Signal Creation Done'),
)


class Signals(models.Model):
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    type = models.CharField(max_length=300, null=True)  # dimension/measure
    target_column = models.CharField(max_length=300, null=True, blank=True)

    dataset = models.ForeignKey(Datasets, null=True)  # get all dataset related detail

    compare_with = models.CharField(max_length=300, default="")
    compare_type = models.CharField(max_length=300, null=True)
    column_data_raw = models.TextField(default="{}")
    config = models.TextField(default="{}")

    status = models.BooleanField(default=False)
    live_status = models.CharField(max_length=300, default='0', choices=STATUS_CHOICES)
    analysis_done = models.BooleanField(default=False)
    # state -> job submitted, job started, job ...

    data = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_on', '-updated_on']

    def __str__(self):
        return "Signal- Name:{0} | status{1}".format(self.name, self.status)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Signals, self).save(*args, **kwargs)

    def create_configuration(self):
        config = dict()

        config["url_settings"] = self.create_configuration_url_settings()
        config["column_settings"] = self.create_configuration_column_settings()
        config["filter_settings"] = self.create_configuration_filter_settings()
        config["meta_data"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def get_config(self):
        import json
        return json.loads(self.config)

    def create_configuration_url_settings(self):
        return {
            "dataset_api": {
                "methods": ['get'],
                "url": ""
            },
            "results_api": {
                "methods": ['get', 'post'],
                "url": ""
            },
            "narratives_api": {
                "methods": ['get', 'post'],
                "url": ""
            },
            "monitor_api": {
                "methods": ['get', 'post'],
                "url": ""
            },
            "config_api": {
                "methods": ['get', 'post'],
                "url": ""
            },
            "scripts_to_run": self.get_scripts_to_run()
        }

    def create_configuration_column_settings(self):
        return {
            "result_column": "",
            "analysis_type": "",
            "polarity": "",
            "consider_columns": "",
            "consider_columns_type": "",
            "date_columns": "",
            "date_format": "",
            "ignore_column_suggestions": "",
            "utf8_columns": "",
            "measure_column_filter": "",
            "dimension_column_filter": "",
            "measure_suggestions": ""
        }

    def create_configuration_filter_settings(self):
        return ""

    def create_configuration_meta_data(self):
        return ""

    def get_list_of_scripts_to_run(self):
        pass




