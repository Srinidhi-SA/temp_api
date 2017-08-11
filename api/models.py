# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import random
import string
import csv
import json
import os

from django.template.defaultfilters import slugify
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

from api.lib import hadoop

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


class Job(models.Model):
    job_type = models.CharField(max_length=300, null=False)
    object_id = models.CharField(max_length=300, null=False)
    name = models.CharField(max_length=300, null=False, default="")
    slug = models.SlugField(null=True)
    config = models.TextField(default="{}")
    results = models.TextField(default="{}")
    url = models.TextField(default="")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    deleted = models.BooleanField(default=False)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Job, self).save(*args, **kwargs)


class Dataset(models.Model):
    name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=True)
    auto_update = models.BooleanField(default=False)
    auto_update_duration = models.IntegerField(default=99999)

    input_file = models.FileField(upload_to='datasets', null=True)
    db_type = models.CharField(max_length=100, null=True)
    db_details = models.TextField(default="{}")
    preview = models.TextField(default="{}")

    meta_data = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

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

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        print "Generated Slug"

        super(Dataset, self).save(*args, **kwargs)
        print "Dataset save once. Initial"
        self.copy_file_to_hdfs()

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Dataset", self.slug])
        job.job_type = "metadata"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job enrty created"

        from utils import submit_job
        job_url = submit_job(
            slug=job.slug,
            class_name='class_path_metadata'
        )

        print "Job submitted."

        job.url = job_url
        job.save()
        self.job = job
        self.save()

    def set_preview_data(self):
        items = []
        all_items = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=str(','))
            # for row in itertools.islice(rows, 20):
            for row in rows:
                all_items.append(row)
                if "" in row or " " in row:
                    if len(all_items) > 21:
                        continue
                    all_items.append(row)
                    continue
                items.append(row)

        return json.dumps({"data": items[:21] if len(items) > 21 else all_items[:21]})

    def generate_config(self, *args, **kwrgs):
        inputFile = "hdfs://{}:{}/{}".format(settings.HDFS.get("host"), settings.HDFS.get("port"), self.get_hdfs_relative_path())
        return {
            "dataSourceType" : "file",
            "config" : {
                "inputFile" : inputFile
            }
        }

    def copy_file_to_hdfs(self):
        hadoop.hadoop_put(self.input_file.path, self.get_hdfs_relative_path())

    def get_hdfs_relative_path(self):
        return os.path.join( settings.HDFS.get('base_path'), self.slug, self.name)

    def create_directory_for_dataset(self):
        pass


class Insight(models.Model):
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    type = models.CharField(max_length=300, null=True)  # dimension/measure
    target_column = models.CharField(max_length=300, null=True, blank=True)

    dataset = models.ForeignKey(Dataset, null=True)  # get all dataset related detail

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

    job = models.ForeignKey(Job, null=True)

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
        super(Insight, self).save(*args, **kwargs)

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Insight", self.slug])
        job.job_type = "master"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job enrty created"

        from utils import submit_job
        job_url = submit_job(
            slug=job.slug,
            class_name='class_path_master',
            job_config=jobConfig
        )

        print "Job submitted."

        job.url = job_url
        job.save()
        self.job = job
        self.save()

    def generate_config(self, *args, **kwargs):
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


