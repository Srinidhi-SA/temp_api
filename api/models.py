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

from api.lib import hadoop, fab_helper

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
    file_remote = models.CharField(max_length=100, null=True)
    analysis_done = models.BooleanField(default=False)

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
        print "asdasd", self.slug
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))
        print "-----------", self.slug

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Dataset, self).save(*args, **kwargs)

    def create(self):
        self.copy_file_to_destination()
        self.add_to_job()

    def add_to_job(self):

        jobConfig = self.generate_config()
        print jobConfig
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Dataset", self.slug])
        job.job_type = "metadata"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job created."

        from utils import submit_job

        try:
            print "Submitting job."
            job_url = submit_job(
                slug=job.slug,
                class_name='metadata',
                job_config=jobConfig
            )
            print "Job submitted."

            job.url = job_url
            job.save()
        except Exception as exc:
            print "Unable to submit job."
            print exc

        self.job = job
        self.save()

    def generate_config(self, *args, **kwrgs):
        inputFile = self.get_input_file()
        return {
            "config": {
                "FILE_SETTINGS": {
                                    "inputfile": [inputFile],
                                },
                "COLUMN_SETTINGS": {
                                    "analysis_type": ["metaData"],
                                },
                "DATE_SETTINGS": {

                },
            }
        }

    def copy_file_to_destination(self):
        try:
            self.copy_file_to_hdfs()
            self.file_remote = "hdfs"
        except:
            try:
                self.copy_file_to_hdfs_local()
                self.file_remote = "emr_file"
            except:
                pass

    def copy_file_to_hdfs(self):
        try:
            hadoop.hadoop_put(self.input_file.path, self.get_hdfs_relative_path())
        except:
            raise Exception("Failed to copy file to HDFS.")

    def copy_file_to_hdfs_local(self):
        try:
            pass
            fab_helper.mkdir_remote(self.get_hdfs_relative_path())
            fab_helper.put_file(self.input_file.path, self.get_hdfs_relative_path())
        except:
            raise Exception("Failed to copy file to EMR Local")

    def get_hdfs_relative_path(self):
        return os.path.join( settings.HDFS.get('base_path'), self.slug)

    def get_hdfs_relative_file_path(self):
        return os.path.join( settings.HDFS.get('base_path'), self.slug, os.path.basename(self.input_file.path))

    def emr_local(self):
        return "/home/marlabs" + self.get_hdfs_relative_path()

    def get_input_file(self):
        type = self.file_remote
        if type=='emr_file':
            return "file://{}".format(self.input_file.path)
        elif type=='hdfs':
            # return "file:///home/hadoop/data_date.csv"
            return "hdfs://{}:{}{}".format(
                settings.HDFS.get("host"),
                settings.HDFS.get("hdfs_port"),
                self.get_hdfs_relative_file_path())
        elif type=='fake':
            return "file:///asdasdasdasd"


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

    def create(self):
        self.add_to_job()

    def add_to_job(self, *args, **kwargs):

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Insight", self.slug])
        job.job_type = "master"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job entry created."

        from utils import submit_job

        try:
            job_url = submit_job(
                slug=job.slug,
                class_name='master',
                job_config=jobConfig
            )
            print "Job submitted."

            job.url = job_url
            job.save()
        except Exception as exc:
            print "Unable to submit job."
            print exc

        self.job = job
        self.save()

    def generate_config(self, *args, **kwargs):
        config = {
            "config": {}
        }

        config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings()
        config['config']["COLUMN_SETTINGS"]= self.create_configuration_column_settings()
        # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
        # config['config']["META_HELPER"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def get_config(self):
        import json
        return json.loads(self.config)

    def create_configuration_url_settings(self):
        default_scripts_to_run = [
            'Descriptive analysis',
            'Measure vs. Dimension',
            'Dimension vs. Dimension',
            'Trend'
        ]
        config = json.loads(self.config)
        script_to_run = config.get('possibleAnalysis', default_scripts_to_run)
        if script_to_run is [] or script_to_run is "":
            script_to_run = default_scripts_to_run

        return {
            'script_to_run': script_to_run,
            'inputfile': [self.dataset.get_input_file()]
        }

    def create_configuration_column_settings(self):

        config = json.loads(self.config)
        consider_columns_type = ['including']
        analysis_type = [self.type]
        data_columns = config.get("timeDimension", "")
        result_column = [self.target_column]
        consider_columns = config.get('dimension', []) + config.get('measures', [])
        ignore_column_suggestion = []

        if len(consider_columns) < 1:
            consider_columns_type = ['excluding']

        if self.dataset.analysis_done is True:
            dataset_meta_data = self.dataset.meta_data.get('metaData')
            for variable in dataset_meta_data:
                if variable['name'] == 'ignoreColumnSuggestions':
                    ignore_column_suggestion += variable['value']
        else:
            print "How the hell reached here!. Metadata is still not there. Please Wait."
            ignore_column_suggestion = []

        return {
            'polarity': ['positive'],
            'consider_columns_type': consider_columns_type,
            'date_format': None,
            'ignore_column_suggestions': ignore_column_suggestion,
            'result_column': result_column,
            'consider_columns': consider_columns,
            'date_columns': data_columns,
            'analysis_type': analysis_type,
        }
        # return {
        #     "analysis_type": ["master"],
        #     "result_column": "",
        #     "polarity": "",
        #     "consider_columns": "",
        #     "consider_columns_type": "",
        #     "date_columns": "",
        #     "date_format": "",
        #     "ignore_column_suggestions": "",
        #     "utf8_columns": "",
        #     "measure_column_filter": "",
        #     "dimension_column_filter": "",
        #     "measure_suggestions": ""
        # }

    def create_configuration_filter_settings(self):
        return {}

    def create_configuration_meta_data(self):
        return {}

    def get_list_of_scripts_to_run(self):
        pass


# TODO: add generate config
# TODO: add set_result for this one
class Trainer(models.Model):

    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    dataset = models.ForeignKey(Dataset, null=False)
    column_data_raw = models.TextField(default="{}")
    app_id = models.IntegerField(null=True, default=0)

    data = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)
    analysis_done = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

    class Meta:
        ordering = ['-created_on', '-updated_on']

    def __str__(self):
        return "Trainer- Name:{0} | slug:{1} |  app:{2}".format(self.name, self.slug, self.app_id)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Trainer, self).save(*args, **kwargs)

    def create(self):
        self.add_to_job()

    def generate_config(self, *args, **kwargs):
        config = {
            "config": {}
        }

        config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings()
        config['config']["COLUMN_SETTINGS"]= self.create_configuration_column_settings()
        # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
        # config['config']["META_HELPER"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def add_to_job(self, *args, **kwargs):

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Insight", self.slug])
        job.job_type = "model"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job entry created."

        from utils import submit_job

        try:
            job_url = submit_job(
                slug=job.slug,
                class_name='model',
                job_config=jobConfig
            )
            print "Job submitted."

            job.url = job_url
            job.save()
        except Exception as exc:
            print "Unable to submit job."
            print exc

        self.job = job
        self.save()

        def create_configuration_url_settings():
            pass

        def create_configuration_column_settings():
            pass


# TODO: Add generate config
# TODO: Add set_result function: it will be contain many things.
class Score(models.Model):

    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    trainer = models.ForeignKey(Trainer, null=False)
    config = models.TextField(default="{}")
    data = models.TextField(default="{}")
    model_data = models.TextField(default="{}")
    column_data_raw = models.TextField(default="{}")

    created_on = models.DateTimeField(auto_now_add=True, null=True)
    updated_on = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)
    analysis_done = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

    def __str__(self):
        return "Score- Name:{0} | slug:{1} |  trainer:{2}".format(self.name, self.slug, self.trainer)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Score, self).save(*args, **kwargs)

    def create(self):
        self.add_to_job()

    def generate_config(self, *args, **kwargs):
        return {}

    def add_to_job(self, *args, **kwargs):

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."

        job = Job()
        job.name = "-".join(["Insight", self.slug])
        job.job_type = "score"
        job.object_id = str(self.slug)
        job.config = json.dumps(jobConfig)
        job.save()

        print "Job entry created."

        from utils import submit_job

        try:
            job_url = submit_job(
                slug=job.slug,
                class_name='score',
                job_config=jobConfig
            )
            print "Job submitted."

            job.url = job_url
            job.save()
        except Exception as exc:
            print "Unable to submit job."
            print exc

        self.job = job
        self.save()

        def generate_config(self, *args, **kwargs):
            config = {
                "config": {}
            }

            config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings()
            config['config']["COLUMN_SETTINGS"] = self.create_configuration_column_settings()
            # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
            # config['config']["META_HELPER"] = self.create_configuration_meta_data()

            import json
            self.config = json.dumps(config)
            self.save()
            return config

        def create_configuration_url_settings():
            pass

        def create_configuration_column_settings():
            pass






