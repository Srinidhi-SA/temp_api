# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import csv
import json
import os
import random
import string

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.template.defaultfilters import slugify

from api.lib import hadoop, fab_helper
from api.helper import convert_json_object_into_list_of_object

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
    status = models.CharField(max_length=100, default="")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    # TODO: @Ankush please add created by
    # created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Job, self).save(*args, **kwargs)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.job_type, self.created_at, self.slug]])


class Dataset(models.Model):
    name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=True)
    auto_update = models.BooleanField(default=False)
    auto_update_duration = models.IntegerField(default=99999)

    input_file = models.FileField(upload_to='datasets', null=True)
    datasource_type = models.CharField(max_length=100, null=True)
    datasource_details = models.TextField(default="{}")
    preview = models.TextField(default="{}")

    meta_data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

    bookmarked = models.BooleanField(default=False)
    file_remote = models.CharField(max_length=100, null=True)
    analysis_done = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.datasource_type, self.slug]])

    def as_dict(self):
        return {
            'name': self.name,
            'slug': self.slug,
            'auto_update': self.auto_update,
            'datasource_type': self.datasource_type,
            'datasource_details': self.datasource_details,
            'created_on': self.created_at,  # TODO: depricate this value
            'created_at': self.created_at,
            'bookmarked': self.bookmarked
        }

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Dataset, self).save(*args, **kwargs)

    def create(self):
        if self.datasource_type in ['file', 'fileUpload']:
            self.csv_header_clean()
            self.copy_file_to_destination()
        self.add_to_job()

    def add_to_job(self):

        jobConfig = self.generate_config()
        print jobConfig
        print "Dataset realted config genarated."

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='metadata'
        )

        self.job = job

        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"
        self.save()

    def generate_config(self, *args, **kwrgs):
        inputFile = ""
        datasource_details = ""
        if self.datasource_type in ['file', 'fileUpload']:
            inputFile = self.get_input_file()
        else:
            datasource_details = json.loads(self.datasource_details)

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
                    "DATA_SOURCE": {
                        "datasource_type": self.datasource_type,
                        "datasource_details": datasource_details
                    }
                }
            }

    def csv_header_clean(self):
        CLEAN_DATA = []
        cleaned_header = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file)
            for (i, row) in enumerate(rows):
                row = [self.clean_restriced_chars(item) for item in row]
                if i == 0:
                    cleaned_header = self.clean_column_names(row)
                    print cleaned_header
                else:
                    CLEAN_DATA.append(row)

        with open(self.input_file.path, 'w') as file:
            writer = csv.writer(file)
            writer.writerow(cleaned_header)

            for row in CLEAN_DATA:
                writer.writerow(row)

        return cleaned_header

    def clean_column_names(self, colname_list):
        special_chars = [".", "*", "$", "#"]
        cleaned_list = []

        for col in colname_list:
            for x in special_chars:
                col = col.replace(x, "")
            col = col.strip(' ')
            cleaned_list.append(col)
        return cleaned_list

    def clean_restriced_chars(self, line):
        restricted_chars = string.printable
        return "".join([c for c in line if c in restricted_chars])

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
        return os.path.join(settings.HDFS.get('base_path'), self.slug)

    def get_hdfs_relative_file_path(self):
        return os.path.join(settings.HDFS.get('base_path'), self.slug, os.path.basename(self.input_file.path))

    def emr_local(self):
        return "/home/marlabs" + self.get_hdfs_relative_path()

    def get_input_file(self):

        if self.datasource_type in ['file', 'fileUpload']:
            type = self.file_remote
            if type == 'emr_file':
                return "file://{}".format(self.input_file.path)
            elif type == 'hdfs':
                # return "file:///home/hadoop/data_date.csv"
                return "hdfs://{}:{}{}".format(
                    settings.HDFS.get("host"),
                    settings.HDFS.get("hdfs_port"),
                    self.get_hdfs_relative_file_path())
            elif type == 'fake':
                return "file:///asdasdasdasd"
        else:
            return ""

    def get_datasource_info(self):
        datasource_details = ""
        if self.datasource_type in ['file', 'fileUpload']:
            inputFile = self.get_input_file()
        else:
            datasource_details = json.loads(self.datasource_details)

        return {
                        "datasource_type": self.datasource_type,
                        "datasource_details": datasource_details
                    }

    def common_config(self):

        ignore_column_suggestion = []
        utf8_column_suggestions = []
        dateTimeSuggestions = []

        if self.analysis_done is True:
            meta_data = json.loads(self.meta_data)
            dataset_meta_data = meta_data.get('metaData')

            for variable in dataset_meta_data:
                if variable['name'] == 'ignoreColumnSuggestions':
                    ignore_column_suggestion += variable['value']

                if variable['name'] == 'utf8ColumnSuggestion':
                    utf8_column_suggestions += variable['value']

                if variable['name'] == 'dateTimeSuggestions':
                    dateTimeSuggestions += [variable['value']]
        else:
            print "How the hell reached here!. Metadata is still not there. Please Wait."

        return {
            'ignore_column_suggestion': ignore_column_suggestion,
            'utf8_column_suggestions': utf8_column_suggestions,
            'dateTimeSuggestions': dateTimeSuggestions,
        }

    def get_config(self):
        import json
        config = json.loads(self.meta_data)
        if config is None:
            return {}
        return config

    def get_brief_info(self):
        list_objects = []
        brief_info = dict()
        config = self.get_config()
        sample = {
            'Rows': 'number of rows',
            'Columns': 'number of columns',
            'Measures': 'number of measures',
            'Dimensions': 'number of dimensions',
            'Time Dimension': 'number of time dimension',
        }
        if 'metaData' in config:
            metad = config['metaData']
            for data in metad:
                if 'displayName' not in data:
                    continue
                if data['displayName'] in sample:
                    brief_info.update(
                        {
                            sample[data['displayName']]: data['value']
                        }
                    )

        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'dataset': self.name
            }
        )
        return convert_json_object_into_list_of_object(brief_info, 'dataset')


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

    live_status = models.CharField(max_length=300, default='0', choices=STATUS_CHOICES)
    analysis_done = models.BooleanField(default=False)
    # state -> job submitted, job started, job ...

    data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.slug, self.status, self.created_at]])

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

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='master'
        )

        self.job = job
        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"

        self.save()

    def generate_config(self, *args, **kwargs):
        config = {
            "config": {}
        }

        config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings()
        config['config']["COLUMN_SETTINGS"] = self.create_configuration_column_settings()
        config['config']["DATA_SOURCE"] = self.dataset.get_datasource_info()
        # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
        # config['config']["META_HELPER"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def get_config(self):
        import json
        return json.loads(self.config)

    def get_config_from_config(self):
        config = json.loads(self.config)
        consider_columns_type = ['including']
        data_columns = config.get("timeDimension", None)

        if data_columns is None:
            consider_columns = config.get('dimension', []) + config.get('measures', [])
            data_columns = ""
        else:
            if data_columns is "":
                consider_columns = config.get('dimension', []) + config.get('measures', [])
            else:
                consider_columns = config.get('dimension', []) + config.get('measures', []) + [data_columns]

        if len(consider_columns) < 1:
            consider_columns_type = ['excluding']

        ret = {
            'consider_columns_type': consider_columns_type,
            'consider_columns': consider_columns,
            'date_columns': [] if data_columns is "" else [data_columns],
        }
        return ret

    def create_configuration_url_settings(self):
        default_scripts_to_run = [
            'Descriptive analysis',
            'Measure vs. Dimension',
            'Dimension vs. Dimension',
            'Trend'
        ]
        config = json.loads(self.config)
        script_to_run = config.get('possibleAnalysis', default_scripts_to_run)
        for index, value in enumerate(script_to_run):
            if value == 'Trend Analysis':
                script_to_run[index] = 'Trend'

        if script_to_run is [] or script_to_run is "":
            script_to_run = default_scripts_to_run

        return {
            'script_to_run': script_to_run,
            'inputfile': [self.dataset.get_input_file()]
        }

    def create_configuration_column_settings(self):
        analysis_type = [self.type]
        result_column = [self.target_column]

        ret = {
            'polarity': ['positive'],
            'result_column': result_column,
            'analysis_type': analysis_type,
            'date_format': None,
        }

        get_config_from_config = self.get_config_from_config()
        meta_data_related_config = self.dataset.common_config()

        ret.update(get_config_from_config)
        ret.update(meta_data_related_config)
        return ret
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

    def get_brief_info(self):
        brief_info = dict()
        config = self.get_config()
        config = config.get('config')
        if config is not None:
            if 'COLUMN_SETTINGS' in config:
                column_settings = config['COLUMN_SETTINGS']
                brief_info.update({
                    'variable selected': column_settings.get('result_column')[0],
                    'variable type': column_settings.get('analysis_type')[0]
                })

            if 'FILE_SETTINGS' in config:
                file_setting = config['FILE_SETTINGS']
                brief_info.update({
                    'analysis list': set(file_setting.get('script_to_run'))
                })

        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'dataset': self.dataset.name
            }
        )

        return convert_json_object_into_list_of_object(brief_info, 'signal')


class Trainer(models.Model):
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    dataset = models.ForeignKey(Dataset, null=False)
    column_data_raw = models.TextField(default="{}")
    config = models.TextField(default="{}")
    app_id = models.IntegerField(null=True, default=0)

    data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)
    analysis_done = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.created_at, self.slug, self.app_id]])

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
        config['config']["COLUMN_SETTINGS"] = self.create_configuration_column_settings()
        config['config']["DATA_SOURCE"] = self.dataset.get_datasource_info()
        # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
        # config['config']["META_HELPER"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def get_config_from_config(self):
        config = json.loads(self.config)
        consider_columns_type = ['including']
        data_columns = config.get("timeDimension", None)

        if data_columns is None:
            consider_columns = config.get('dimension', []) + config.get('measures', [])
            data_columns = ""
        else:
            if data_columns is "":
                consider_columns = config.get('dimension', []) + config.get('measures', [])
            else:
                consider_columns = config.get('dimension', []) + config.get('measures', []) + [data_columns]

        if len(consider_columns) < 1:
            consider_columns_type = ['excluding']

        ret = {
            'consider_columns_type': consider_columns_type,
            'consider_columns': consider_columns,
            'date_columns': [] if data_columns is "" else [data_columns],
        }
        return ret

    def create_configuration_url_settings(self):

        config = json.loads(self.config)
        train_test_split = float(config.get('trainValue'))/100
        return {
            'inputfile': [self.dataset.get_input_file()],
            'modelpath': [self.slug],
            'train_test_split': [train_test_split],
            'analysis_type': ['training']
        }

    def create_configuration_column_settings(self):
        config = json.loads(self.config)
        result_column = config.get('analysisVariable')

        ret = {
            'polarity': ['positive'],
            'result_column': [result_column],
            'date_format': None,
        }

        get_config_from_config = self.get_config_from_config()
        meta_data_related_config = self.dataset.common_config()

        ret.update(get_config_from_config)
        ret.update(meta_data_related_config)

        return ret

    def add_to_job(self, *args, **kwargs):
        jobConfig = self.generate_config(*args, **kwargs)
        print "Trainer realted config genarated."

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='model'
        )

        self.job = job
        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"
        self.save()

    def get_config(self):
        import json
        return json.loads(self.config)

    def get_brief_info(self):
        brief_info = dict()
        config = self.get_config()
        config = config.get('config')
        if config is not None:
            if 'COLUMN_SETTINGS' in config:
                column_settings = config['COLUMN_SETTINGS']
                brief_info.update({
                    'variable selected': column_settings.get('result_column')[0]
                })

            if 'FILE_SETTINGS' in config:
                file_setting = config['FILE_SETTINGS']
                brief_info.update({
                    'analysis type': file_setting.get('analysis_type')[0],
                    'train_test_split': file_setting.get('train_test_split')[0]
                })

        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'dataset': self.dataset.name
            }
        )

        return convert_json_object_into_list_of_object(brief_info, 'trainer')

"""
{
    "name": "WWADw",
    "dataset": "iriscsv-5dbng5clba",
    "app_id": 1,
    "column_data_raw":
        {
            "measures": "",
            "dimension": "",
            "timeDimension": "",
            "trainValue": 50,
            "testValue": 50,
            "analysisVariable": "age"
        }
}
"""


# TODO: Add generate config
# TODO: Add set_result function: it will be contain many things.
class Score(models.Model):
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True)
    trainer = models.ForeignKey(Trainer, null=False)
    dataset = models.ForeignKey(Dataset, null=False , default="")
    config = models.TextField(default="{}")
    data = models.TextField(default="{}")
    model_data = models.TextField(default="{}")
    column_data_raw = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)
    analysis_done = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.created_at, self.slug, self.trainer]])

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Score, self).save(*args, **kwargs)

    def create(self):
        self.add_to_job()

    def add_to_job(self, *args, **kwargs):

        jobConfig = self.generate_config(*args, **kwargs)
        print "Score realted config genarated."

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='score'
        )

        self.job = job
        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"
        self.save()

    def generate_config(self, *args, **kwargs):
        config = {
            "config": {}
        }

        config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings()
        config['config']["COLUMN_SETTINGS"] = self.create_configuration_column_settings()
        config['config']["DATA_SOURCE"] = self.dataset.get_datasource_info()
        # config['config']["DATE_SETTINGS"] = self.create_configuration_filter_settings()
        # config['config']["META_HELPER"] = self.create_configuration_meta_data()

        import json
        self.config = json.dumps(config)
        self.save()
        return config

    def create_configuration_url_settings(self):

        config = json.loads(self.config)
        algorithmslug = config.get('algorithmName')

        trainer_slug = self.trainer.slug
        score_slug = self.slug
        model_data = json.loads(self.trainer.data)
        model_config_from_results = model_data['config']
        targetVariableLevelcount = model_config_from_results.get('targetVariableLevelcount', None)
        modelFeaturesDict = model_config_from_results.get('modelFeatures', None)
        # algorithmslug = 'f77631ce2ab24cf78c55bb6a5fce4db8rf'

        modelfeatures = modelFeaturesDict.get(algorithmslug, None)

        return {
            'inputfile': [self.dataset.get_input_file()],
            'modelpath': [trainer_slug],
            'scorepath': [score_slug],
            'analysis_type': ['score'],
            'levelcounts': targetVariableLevelcount if targetVariableLevelcount is not None else [],
            'algorithmslug': [algorithmslug],
            'modelfeatures': modelfeatures if modelfeatures is not None else []

        }

    def get_config_from_config(self):
        trainer_config = json.loads(self.trainer.config)
        trainer_config_config = trainer_config.get('config')
        file_column_config = trainer_config_config.get('COLUMN_SETTINGS')
        trainer_consider_column_type = file_column_config.get('consider_columns_type')
        trainer_consider_columns = file_column_config.get('consider_columns')

        config = json.loads(self.config)
        consider_columns_type = ['including']
        data_columns = config.get("timeDimension", None)

        if data_columns is None:
            consider_columns = config.get('dimension', []) + config.get('measures', [])
            data_columns = ""
        else:
            if data_columns is "":
                consider_columns = config.get('dimension', []) + config.get('measures', [])
            else:
                consider_columns = config.get('dimension', []) + config.get('measures', []) + [data_columns]

        if len(consider_columns) < 1:
            consider_columns_type = ['excluding']

        app_id = config.get('app_id', 1)

        ret = {
            'consider_columns_type': trainer_consider_column_type,
            'consider_columns': trainer_consider_columns,
            'score_consider_columns_type': consider_columns_type,
            'score_consider_columns': consider_columns,
            'date_columns': [] if data_columns is "" else [data_columns],
            'app_id': [app_id]
        }
        return ret

    def create_configuration_column_settings(self):
        config = json.loads(self.config)
        model_data = json.loads(self.trainer.data)
        model_config_from_results = model_data['config']
        result_column = model_config_from_results.get('target_variable')[0]

        ret = {
            'polarity': ['positive'],
            'result_column': [result_column],
            'date_format': None,
        }

        get_config_from_config = self.get_config_from_config()
        meta_data_related_config = self.dataset.common_config()

        ret.update(get_config_from_config)
        ret.update(meta_data_related_config)

        return ret

    def get_local_file_path(self):
        return '/tmp/' + self.slug

    def get_config(self):
        import json
        return json.loads(self.config)

    def get_brief_info(self):
        brief_info = dict()
        config = self.get_config()
        config = config.get('config')
        if config is not None:
            if 'COLUMN_SETTINGS' in config:
                column_settings = config['COLUMN_SETTINGS']
                brief_info.update({
                    'variable selected': column_settings.get('result_column')[0]
                })

            if 'FILE_SETTINGS' in config:
                file_setting = config['FILE_SETTINGS']
                brief_info.update({
                    'analysis type': file_setting.get('analysis_type')[0],
                    'algorithm name': file_setting.get('algorithmslug')[0],
                })

        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'dataset': self.dataset.name,
                'model':self.trainer.name
            }
        )
        return convert_json_object_into_list_of_object(brief_info, 'score')


class Robo(models.Model):

    name = models.CharField(max_length=300, default="", blank=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)

    customer_dataset = models.ForeignKey(Dataset, null=False, default="", related_name='customer_dataset')
    historical_dataset = models.ForeignKey(Dataset, null=False, default="", related_name='historical_dataset')
    market_dataset = models.ForeignKey(Dataset, null=False, default="", related_name='market_dataset')

    config = models.TextField(default="{}")
    data = models.TextField(default="{}")
    column_data_raw = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)
    analysis_done = models.BooleanField(default=False)
    dataset_analysis_done = models.BooleanField(default=False)
    robo_analysis_done = models.BooleanField(default=True)

    bookmarked = models.BooleanField(default=False)
    job = models.ForeignKey(Job, null=True)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.created_at, self.slug]])

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Robo, self).save(*args, **kwargs)

    def create(self, *args, **kwargs):
        self.add_to_job()

    def generate_config(self, *args, **kwargs):
        return {

        }

    def add_to_job(self, *args, **kwargs):
        jobConfig = self.generate_config(*args, **kwargs)

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='robo'
        )

        self.job = job
        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"
        self.save()


def job_submission(
        instance=None,
        jobConfig=None,
        job_type=None
):
    # Job Book Keeping
    job = Job()
    job.name = "-".join([job_type, instance.slug])
    job.job_type = job_type
    job.object_id = str(instance.slug)

    if jobConfig is None:
        jobConfig = json.loads(instance.config)
    job.config = json.dumps(jobConfig)
    job.save()

    print "Job entry created."

    # Submitting JobServer
    from utils import submit_job

    try:
        job_url = submit_job(
            slug=job.slug,
            class_name=job_type,
            job_config=jobConfig,
            job_name=instance.name
        )
        print "Job submitted."

        job.url = job_url
        job.save()
    except Exception as exc:
        print "Unable to submit job."
        print exc
        return None

    return job


class Audioset(models.Model):
    name = models.CharField(max_length=100, null=True)
    slug = models.SlugField(null=True, max_length=300)
    auto_update = models.BooleanField(default=False)
    auto_update_duration = models.IntegerField(default=99999)

    input_file = models.FileField(upload_to='audioset', null=True)
    datasource_type = models.CharField(max_length=100, null=True)
    datasource_details = models.TextField(default="{}")
    preview = models.TextField(default="{}")

    meta_data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)

    bookmarked = models.BooleanField(default=False)
    file_remote = models.CharField(max_length=100, null=True)
    analysis_done = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.datasource_type, self.slug]])

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Audioset, self).save(*args, **kwargs)

    def create(self):
        self.meta_data = json.dumps(dummy_audio_data_2)
        self.analysis_done = True
        self.status = 'SUCCESS'
        self.save()

    def get_brief_info(self):
        brief_info = dict()
        from api.helper import convert_to_humanize
        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'audioset': self.name,
                'file_size': convert_to_humanize(self.input_file.size)
            })
        return convert_json_object_into_list_of_object(brief_info, 'audioset')

dummy_audio_data = {
  "semantic_roles": [
    {
      "action": {
        "text": "calling",
        "verb": {
          "text": "call",
          "tense": "present"
        },
        "normalized": "call"
      },
      "sentence": "I am calling regarding my cellphone details  regarding the AD and D. center and my bills that's not in proper order  can you get back to me",
      "object": {
        "text": "regarding my cellphone details regarding the AD and D.  center"
      },
      "subject": {
        "text": "I"
      }
    },
    {
      "action": {
        "text": "get",
        "verb": {
          "text": "get",
          "tense": "future"
        },
        "normalized": "get"
      },
      "sentence": "I am calling regarding my cellphone details  regarding the AD and D. center and my bills that's not in proper order  can you get back to me",
      "object": {
        "text": "to me"
      },
      "subject": {
        "text": "you"
      }
    }
  ],
  "emotion": {
    "document": {
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      }
    }
  },
  "sentiment": {
    "document": {
      "score": -0.658045,
      "label": "negative"
    }
  },
  "language": "en",
  "entities": [

  ],
  "relations": [
    {
      "score": 0.941288,
      "type": "agentOf",
      "arguments": [
        {
          "text": "I",
          "entities": [
            {
              "text": "you",
              "type": "Person"
            }
          ]
        },
        {
          "text": "calling",
          "entities": [
            {
              "text": "calling",
              "type": "EventCommunication"
            }
          ]
        }
      ],
      "sentence": "I am calling regarding my cellphone details  regarding the AD and D. center and my bills that's not in proper order  can you get back to me"
    }
  ],
  "keywords": [
    {
      "relevance": 0.955237,
      "text": "cellphone details",
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      },
      "sentiment": {
        "score": -0.658045
      }
    },
    {
      "relevance": 0.79169,
      "text": "proper order",
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      },
      "sentiment": {
        "score": -0.658045
      }
    },
    {
      "relevance": 0.603743,
      "text": "D. center",
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      },
      "sentiment": {
        "score": -0.658045
      }
    },
    {
      "relevance": 0.32934,
      "text": "bills",
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      },
      "sentiment": {
        "score": -0.658045
      }
    },
    {
      "relevance": 0.275752,
      "text": "AD",
      "emotion": {
        "anger": 0.168596,
        "joy": 0.028956,
        "sadness": 0.058371,
        "fear": 0.035605,
        "disgust": 0.03976
      },
      "sentiment": {
        "score": -0.658045
      }
    }
  ],
  "concepts": [

  ],
  "usage": {
    "text_characters": 138,
    "features": 8,
    "text_units": 1
  },
  "categories": [
    {
      "score": 0.301348,
      "label": "/finance/personal finance/lending/credit cards"
    },
    {
      "score": 0.17561,
      "label": "/business and industrial"
    },
    {
      "score": 0.165519,
      "label": "/technology and computing"
    }
  ],
  "text": "I am calling regarding my cellphone details regarding the AD  and D. center and my bills that's not in proper order can you get back  to me "
}

class SaveData(models.Model):
    slug = models.SlugField(null=False, blank=True)
    data = models.TextField(default="{}")

    def get_data(self):
        data = self.data
        json_data = json.loads(data)
        csv_data = json_data.get('data')
        return csv_data

    def set_data(self, data):
        json_data = {
            "data": data
        }
        self.data = json.dumps(json_data)
        self.save()
        return True

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(16)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(SaveData, self).save(*args, **kwargs)

    def get_url(self):
        return "/api/download_data/" + self.slug


dummy_audio_data_2 = {
        "listOfNodes": [
            {
                "listOfNodes": [],
                "listOfCards": [
                    {
                        "name": "Distribution of Product Category",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<p class=\"txt-justify\"> The Product Category variable has only two values, i.e. Olien Consumer and Olien Bulk. Olien Consumer is the <b>largest</b> with 106 observations, whereas Olien Bulk is the <b>smallest</b> with just 56 observations. </p>"
                            },
                            {
                                "dataType": "c3Chart",
                                "data": {
                                    "chart_c3": {
                                        "bar": {
                                            "width": 40
                                        },
                                        "point": None,
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "show": True,
                                            "format": {
                                                "title": ".2s"
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "grid": {
                                            "y": {
                                                "show": True
                                            },
                                            "x": {
                                                "show": True
                                            }
                                        },
                                        "subchart": None,
                                        "axis": {
                                            "y": {
                                                "tick": {
                                                    "count": 7,
                                                    "outer": False,
                                                    "multiline": True,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "",
                                                    "position": "outer-middle"
                                                }
                                            },
                                            "x": {
                                                "height": 90,
                                                "tick": {
                                                    "rotate": -45,
                                                    "multiline": False,
                                                    "fit": False,
                                                    "format": ".2s"
                                                },
                                                "type": "category",
                                                "label": {
                                                    "text": "",
                                                    "position": "outer-center"
                                                }
                                            }
                                        },
                                        "data": {
                                            "x": "key",
                                            "axes": {
                                                "value": "y"
                                            },
                                            "type": "bar",
                                            "columns": [
                                                [
                                                    "value",
                                                    106,
                                                    56
                                                ],
                                                [
                                                    "key",
                                                    "Olien Consumer",
                                                    "Olien Bulk"
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "show": False
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2s",
                                    "table_c3": [
                                        [
                                            "value",
                                            106,
                                            56
                                        ],
                                        [
                                            "key",
                                            "Olien Consumer",
                                            "Olien Bulk"
                                        ]
                                    ],
                                    "download_url": "/api/download_data/jis96dzhpyd55zsx",
                                    "xdata": [
                                        "Olien Consumer",
                                        "Olien Bulk"
                                    ]
                                }
                            },
                            {
                                "dataType": "html",
                                "data": "<p class = \"txt-justify\"> The segment Olien Consumer accounts for 65.43% of the overall observations. </p>"
                            },
                            {
                                "dataType": "html",
                                "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>65.43%</span><br /><small> Olien Consumer is the largest with 106 observations</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>34.57%</span><br /><small> Olien Bulk is the smallest with 56 observations</small></h2></div>"
                            }
                        ],
                        "slug": "distribution-of-product-category-j8no17sj87",
                        "cardWidth": 100
                    }
                ],
                "name": "Overview",
                "slug": "overview-eerm9f6uuh"
            },
            {
                "listOfNodes": [],
                "listOfCards": [
                    {
                        "name": "Trend Analysis",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<h3>How Product Category is Changing over Time</h3> "
                            },
                            {
                                "dataType": "c3Chart",
                                "data": {
                                    "download_url": "/api/download_data/jhqhvtigr2dfwh9f",
                                    "y2format": ".2s",
                                    "xdata": [
                                        "Aug-16",
                                        "Sep-16",
                                        "Oct-16",
                                        "Nov-16",
                                        "Dec-16",
                                        "Feb-17",
                                        "Mar-17",
                                        "Apr-17",
                                        "May-17",
                                        "Jul-17"
                                    ],
                                    "chart_c3": {
                                        "bar": {
                                            "width": {
                                                "ratio": 0.5
                                            }
                                        },
                                        "point": None,
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "show": True,
                                            "format": {
                                                "title": ".2s"
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "grid": {
                                            "y": {
                                                "show": True
                                            },
                                            "x": {
                                                "show": True
                                            }
                                        },
                                        "subchart": None,
                                        "axis": {
                                            "y": {
                                                "tick": {
                                                    "count": 7,
                                                    "outer": False,
                                                    "multiline": True,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "Percentage of Olien Consumer",
                                                    "position": "outer-middle"
                                                }
                                            },
                                            "x": {
                                                "height": 90,
                                                "tick": {
                                                    "rotate": -45,
                                                    "multiline": False,
                                                    "fit": False,
                                                    "format": ".2s"
                                                },
                                                "type": "category",
                                                "label": {
                                                    "text": "Time",
                                                    "position": "outer-center"
                                                }
                                            },
                                            "y2": {
                                                "show": True,
                                                "tick": {
                                                    "count": 7,
                                                    "multiline": True,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "Percentage of Olien Bulk",
                                                    "position": "outer-middle"
                                                }
                                            }
                                        },
                                        "data": {
                                            "x": "key",
                                            "axes": {
                                                "Olien Bulk": "y2"
                                            },
                                            "type": "line",
                                            "names": {
                                                "k3": "Olien Bulk",
                                                "k2": "Olien Consumer",
                                                "k1": "key",
                                                "y": "Olien Consumer",
                                                "x": "key",
                                                "y2": "Olien Bulk"
                                            },
                                            "columns": [
                                                [
                                                    "Olien Consumer",
                                                    36.8,
                                                    100,
                                                    100,
                                                    75,
                                                    37.5,
                                                    92.9,
                                                    100,
                                                    100,
                                                    42.9,
                                                    100
                                                ],
                                                [
                                                    "key",
                                                    "Aug-16",
                                                    "Sep-16",
                                                    "Oct-16",
                                                    "Nov-16",
                                                    "Dec-16",
                                                    "Feb-17",
                                                    "Mar-17",
                                                    "Apr-17",
                                                    "May-17",
                                                    "Jul-17"
                                                ],
                                                [
                                                    "Olien Bulk",
                                                    63.2,
                                                    25,
                                                    62.5,
                                                    100,
                                                    7.1,
                                                    57.1,
                                                    100,
                                                    0,
                                                    0,
                                                    0
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "show": True
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2s",
                                    "table_c3": [
                                        [
                                            "Olien Consumer",
                                            36.8,
                                            100,
                                            100,
                                            75,
                                            37.5,
                                            92.9,
                                            100,
                                            100,
                                            42.9,
                                            100
                                        ],
                                        [
                                            "key",
                                            "Aug-16",
                                            "Sep-16",
                                            "Oct-16",
                                            "Nov-16",
                                            "Dec-16",
                                            "Feb-17",
                                            "Mar-17",
                                            "Apr-17",
                                            "May-17",
                                            "Jul-17"
                                        ],
                                        [
                                            "Olien Bulk",
                                            63.2,
                                            25,
                                            62.5,
                                            100,
                                            7.1,
                                            57.1,
                                            100,
                                            0,
                                            0,
                                            0
                                        ]
                                    ]
                                }
                            },
                            {
                                "dataType": "html",
                                "data": " <p class=\"txt-justify\"> This section provides insights on how Product Category categories are trending over time and captures the most significant moments that defined the overall pattern or trend over the observation period. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <h4>Olien Consumer</h4> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class=\"txt-justify\"> The percentage of Olien Consumer <b>increased</b> from <b> 36.8% </b> in Aug-16 to <b>100.0%</b> in Jul-17. The total number of observations for Olien Consumer was 106 for the last 12 months, and the <b> average rate</b> of Olien Consumer was <b>78.5%</b>. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class=\"txt-justify\"> Olien Consumer category hit a peak of <b>100.0%</b> in <b>Sep-16</b>, when the total number of Olien Consumer observations was 3. The most significant factor that fuelled this strong run is the <b>Product</b> category,6x2 ltr c.tray. The Olien Consumer rate for <b>6x2 ltr c.tray</b> in Sep-16, increased by over <b>92.78</b> percentage points (100.0 vis-a-vis 7.22) compared to rest of the observation period. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <h4>Olien Bulk</h4> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class=\"txt-justify\"> There was a significant <b>increase</b> in Olien Bulk, as it increased from <b> 63.2% </b> in Aug-16 to <b>100.0%</b> in Jun-17. The total number of observations for Olien Bulk was 56 for the last 12 months, and the <b> average rate</b> of Olien Bulk was <b>59.3%</b>. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class=\"txt-justify\"> The percentage of Olien Bulk hit a peak of 100.0% in Jan-17, when the total number of Olien Bulk observations was 9. The most significant factor that fuelled this strong run is the <b>Sales Office</b> category,Nairobi - Local. The Olien Bulk rate for <b>Nairobi - Local</b> in Jan-17, increased by over <b>54.08</b> percentage points (100.0 vis-a-vis 45.92) compared to rest of the observation period. </p> "
                            }
                        ],
                        "slug": "trend-analysis-y9yubuk1a3",
                        "cardWidth": 100
                    }
                ],
                "name": "Trend",
                "slug": "trend-m98773khm2"
            },
            {
                "listOfNodes": [
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Relationship between Product Category  and Product</h3>"
                                    },
                                    {
                                        "dataType": "table",
                                        "data": {
                                            "tableType": "heatMap",
                                            "tableData": [
                                                [
                                                    "Product",
                                                    "Olien Consumer",
                                                    "Olien Bulk"
                                                ],
                                                [
                                                    "10 ltr j.can",
                                                    0,
                                                    100
                                                ],
                                                [
                                                    "18kg j.can",
                                                    0,
                                                    100
                                                ],
                                                [
                                                    "4x5 ltr rpc",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "6x2 ltr c.tray",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "6x3 ltr c.tray",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "12x1 ltr c.tray",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "72x50ml sachet",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "12x500ml c.tray",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "24x200ml sachet",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "36x100ml sachet",
                                                    100,
                                                    0
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> Product is one of <b>the most significant influencers</b> of Product Category and displays significant variation in distribution of Product Category categories. The top 7 Products including segment 10 ltr j.can and segment 6x2 ltr c.tray account for <b> 96.3% </b>of the total observations. <b>Segment 36x100ml sachet and segment 24x200ml sachet</b> are the smallest with <b>just 0.62%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Bulk</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> The <b>percentage of Olien Bulk</b> is the <b> lowest(0.0%) for 8 segments including 4x5 ltr rpc and 6x2 ltr c.tray</b>. The segments <b> 10 ltr j.can and 18kg j.can</b> have the <b>highest rate of Olien Bulk</b> (100.0%), which is 189.3% higher than the overall Olien Bulk rate. Interestingly, the <b>segment 6x2 ltr c.tray and segment 12x1 ltr c.tray</b>, which cumulatively account for <b> 29.0% of the total </b>observations, has contributed to <b> 0.0% of total Olien Bulk</b>. On the other hand, the segments <b>18kg j.can and 10 ltr j.can</b> cumulatively account for <b>34.6% of the total</b> observations, but it has contributed to <b>100.0% of total Olien Bulk</b>. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Consumer</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>Olien Consumer, both segment 10 ltr j.can and segment 18kg j.can</b> seems to be the least dominant segment with 0.0% of their total observations from each of the categories. But, there are <b>8 categories</b>(including segment 4x5 ltr rpc and segment 6x2 ltr c.tray) have the <b>highest rate of Olien Consumer</b> (100.0%). Interestingly, <b>segment 10 ltr j.can and segment 18kg j.can</b>, which cumulatively account for <b> 34.6% of the total </b>observations, have contributed to <b> 0.0% of total Olien Consumer</b>. On the other hand, the segments <b>12x1 ltr c.tray and 6x2 ltr c.tray</b> cumulatively account for <b>29.0% of the total</b> observations, but it has contributed to <b>44.3% of total Olien Consumer</b>. </p>"
                                    }
                                ],
                                "name": "Product: Relationship with Product Category",
                                "slug": "product-relationship-with-product-category-utapxjwvnf"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Bulk) across Product</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/o90t66t1yhq95r8c",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "10 ltr j.can",
                                                "18kg j.can",
                                                "4x5 ltr rpc",
                                                "6x2 ltr c.tray",
                                                "6x3 ltr c.tray",
                                                "12x1 ltr c.tray",
                                                "72x50ml sachet",
                                                "12x500ml c.tray",
                                                "24x200ml sachet",
                                                "36x100ml sachet"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            100,
                                                            100,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        ],
                                                        [
                                                            "total",
                                                            35,
                                                            21,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        ],
                                                        [
                                                            "key",
                                                            "10 ltr j.can",
                                                            "18kg j.can",
                                                            "4x5 ltr rpc",
                                                            "6x2 ltr c.tray",
                                                            "6x3 ltr c.tray",
                                                            "12x1 ltr c.tray",
                                                            "72x50ml sachet",
                                                            "12x500ml c.tray",
                                                            "24x200ml sachet",
                                                            "36x100ml sachet"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Bulk",
                                                        "total": "# of Olien Bulk"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    100,
                                                    100,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ],
                                                [
                                                    "total",
                                                    35,
                                                    21,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ],
                                                [
                                                    "key",
                                                    "10 ltr j.can",
                                                    "18kg j.can",
                                                    "4x5 ltr rpc",
                                                    "6x2 ltr c.tray",
                                                    "6x3 ltr c.tray",
                                                    "12x1 ltr c.tray",
                                                    "72x50ml sachet",
                                                    "12x500ml c.tray",
                                                    "24x200ml sachet",
                                                    "36x100ml sachet"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top 2 Products(segment 10 ltr j.can and segment 18kg j.can) account for 100.0% of the total Olien Bulk observations. Being the largest contributor, total Olien Bulk from 10 ltr j.can amounts to 35.0 that accounts for about 62.5% of the total Olien Bulk. On the other hand, 4x5 ltr rpc contributes to just 0.0% of the total Olien Bulk. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Bulk from 10 ltr j.can</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> High concentration of Olien Bulk from segment 10 ltr j.can is characterized by the influence of key dimensions, such as Sales Office. Certain specific segments from those factors are more likely to explain segment 10 ltr j.can's significant rate of Olien Bulk. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Sales Office</b>: Among the Sales Offices, Nairobi - Local has got the major chunk of Olien Bulk from segment 10 ltr j.can, accounting for 45.7%. The percentage of Olien Bulk for Nairobi - Local is 100.0%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>62.5%</span><br /><small>Overall Olien Bulk comes from 10 ltr j.can</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>10 ltr j.can has the highest rate of Olien Bulk</small></h2></div>"
                                    }
                                ],
                                "name": "Product : Distribution of Olien Consumer",
                                "slug": "product-distribution-of-olien-consumer-nmirq83361"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Consumer) across Product</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/8qx8p4cb4u4pldhk",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "10 ltr j.can",
                                                "18kg j.can",
                                                "4x5 ltr rpc",
                                                "6x2 ltr c.tray",
                                                "6x3 ltr c.tray",
                                                "12x1 ltr c.tray",
                                                "72x50ml sachet",
                                                "12x500ml c.tray",
                                                "24x200ml sachet",
                                                "36x100ml sachet"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            0,
                                                            0,
                                                            100,
                                                            100,
                                                            100,
                                                            100,
                                                            100,
                                                            100,
                                                            100,
                                                            100
                                                        ],
                                                        [
                                                            "total",
                                                            0,
                                                            0,
                                                            14,
                                                            26,
                                                            20,
                                                            21,
                                                            4,
                                                            19,
                                                            1,
                                                            1
                                                        ],
                                                        [
                                                            "key",
                                                            "10 ltr j.can",
                                                            "18kg j.can",
                                                            "4x5 ltr rpc",
                                                            "6x2 ltr c.tray",
                                                            "6x3 ltr c.tray",
                                                            "12x1 ltr c.tray",
                                                            "72x50ml sachet",
                                                            "12x500ml c.tray",
                                                            "24x200ml sachet",
                                                            "36x100ml sachet"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Consumer",
                                                        "total": "# of Olien Consumer"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    0,
                                                    0,
                                                    100,
                                                    100,
                                                    100,
                                                    100,
                                                    100,
                                                    100,
                                                    100,
                                                    100
                                                ],
                                                [
                                                    "total",
                                                    0,
                                                    0,
                                                    14,
                                                    26,
                                                    20,
                                                    21,
                                                    4,
                                                    19,
                                                    1,
                                                    1
                                                ],
                                                [
                                                    "key",
                                                    "10 ltr j.can",
                                                    "18kg j.can",
                                                    "4x5 ltr rpc",
                                                    "6x2 ltr c.tray",
                                                    "6x3 ltr c.tray",
                                                    "12x1 ltr c.tray",
                                                    "72x50ml sachet",
                                                    "12x500ml c.tray",
                                                    "24x200ml sachet",
                                                    "36x100ml sachet"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top 5 Products(including segment 6x2 ltr c.tray and segment 12x1 ltr c.tray) account for 94.3% of the total Olien Consumer observations. Being the largest contributor, total Olien Consumer from 6x2 ltr c.tray amounts to 26.0 that accounts for about 24.5% of the total Olien Consumer. On the other hand, 10 ltr j.can contributes to just 0.0% of the total Olien Consumer. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Consumer from 6x2 ltr c.tray</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> High concentration of Olien Consumer from segment 6x2 ltr c.tray is characterized by the influence of key dimensions, such as Sales Office. Certain specific segments from those factors are more likely to explain segment 6x2 ltr c.tray's significant rate of Olien Consumer. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Sales Office</b>: Some of the Sales Office(Nairobi - Local(30.77%) and Trans Nzoia(26.92%)) account of a significant portion of Olien Consumer observations from segment 6x2 ltr c.tray. They cumulatively account for about 57.7% of the total Olien Consumer from segment 6x2 ltr c.tray. The percentage of Olien Consumer for Nairobi - Local and Trans Nzoia are 100.0% and 100.0% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>24.5%</span><br /><small>Overall Olien Consumer comes from 6x2 ltr c.tray</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>4x5 ltr rpc has the highest rate of Olien Consumer</small></h2></div>"
                                    }
                                ],
                                "name": "Product : Distribution of Olien Bulk",
                                "slug": "product-distribution-of-olien-bulk-uxbpds059u"
                            }
                        ],
                        "name": "Product",
                        "slug": "product-sjwuqr7kgs"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Relationship between Product Category  and Gross Margin</h3>"
                                    },
                                    {
                                        "dataType": "table",
                                        "data": {
                                            "tableType": "heatMap",
                                            "tableData": [
                                                [
                                                    "Gross Margin",
                                                    "Olien Consumer",
                                                    "Olien Bulk"
                                                ],
                                                [
                                                    "0 to 0.19",
                                                    20,
                                                    80
                                                ],
                                                [
                                                    "0.19 to 0.23",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "0.23 to 0.27",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "0.27 to 0.31",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "0.31 to 1",
                                                    100,
                                                    0
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> Gross Margin is one of <b>the most significant influencers</b> of Product Category and displays significant variation in distribution of Product Category categories. <b>Segment 0 to 0.19 and segment 0.23 to 0.27 </b> are the two largest Gross Margins, accounting for <b> 72.2% </b> of the total observations. <b>Segment 0.31 to 1</b> is the smallest with <b>just 3.09%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Bulk</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> The <b>percentage of Olien Bulk</b> is the <b> lowest(0.0%) for 4 segments including 0.19 to 0.23 and 0.23 to 0.27</b>. The segment <b> 0 to 0.19</b> has the <b>highest rate of Olien Bulk</b> (80.0%), which is 131.4% higher than the overall Olien Bulk rate. Interestingly, the <b>segment 0.23 to 0.27 and segment 0.19 to 0.23</b>, which cumulatively account for <b> 42.0% of the total </b>observations, has contributed to <b> 0.0% of total Olien Bulk</b>. On the other hand, the segment <b>0 to 0.19</b> accounts for <b>43.2% of the total</b> observations, but it has contributed to <b>100.0% of total Olien Bulk</b>. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Consumer</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>Olien Consumer, segment 0 to 0.19</b> seems to be the <b>least dominant segment</b> since 20.0% of its total observations are into Olien Consumer category. But, there are <b>4 categories</b>(including segment 0.19 to 0.23 and segment 0.23 to 0.27) have the <b>highest rate of Olien Consumer</b> (100.0%). Interestingly, <b>segment 0 to 0.19</b>, which accounts for <b>43.2% of the total </b>observations, has contributed to <b>13.2% of total Olien Consumer</b>. On the other hand, the segment <b>0.23 to 0.27</b> accounts for <b>29.0% of the total</b> observations, but it has contributed to <b>44.3% of total Olien Consumer</b>. </p>"
                                    }
                                ],
                                "name": "Gross Margin: Relationship with Product Category",
                                "slug": "gross-margin-relationship-with-product-category-y986vj6bal"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Bulk) across Gross Margin</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/v2hz18iktsnst9f2",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "0 to 0.19",
                                                "0.19 to 0.23",
                                                "0.23 to 0.27",
                                                "0.27 to 0.31",
                                                "0.31 to 1"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            80,
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        ],
                                                        [
                                                            "total",
                                                            56,
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        ],
                                                        [
                                                            "key",
                                                            "0 to 0.19",
                                                            "0.19 to 0.23",
                                                            "0.23 to 0.27",
                                                            "0.27 to 0.31",
                                                            "0.31 to 1"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Bulk",
                                                        "total": "# of Olien Bulk"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    80,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ],
                                                [
                                                    "total",
                                                    56,
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ],
                                                [
                                                    "key",
                                                    "0 to 0.19",
                                                    "0.19 to 0.23",
                                                    "0.23 to 0.27",
                                                    "0.27 to 0.31",
                                                    "0.31 to 1"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top Gross Margin(segment 0 to 0.19) accounts for 100.0% of the total Olien Bulk observations. The segment 0.19 to 0.23 contributes to just 0.0% of the total Olien Bulk. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Bulk from 0 to 0.19</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> There are some key factors(Product and Sales Office) that explain why the concentration of Olien Bulk from segment 0 to 0.19 is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Product</b>: Among the Products, 10 ltr j.can has got the major chunk of Olien Bulk from segment 0 to 0.19, accounting for 62.5%. The percentage of Olien Bulk for 10 ltr j.can is 100.0%. </li> </li> <li> <b>Sales Office</b>: Nairobi - Local plays a key role in explaining the high concentration of Olien Bulk from segment 0 to 0.19. It accounts for 46.4% of total Olien Bulk from segment 0 to 0.19. The percentage of Olien Bulk for Nairobi - Local is 78.8%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>Overall Olien Bulk comes from 0 to 0.19</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>80.0%</span><br /><small>0 to 0.19 has the highest rate of Olien Bulk</small></h2></div>"
                                    }
                                ],
                                "name": "Gross Margin : Distribution of Olien Consumer",
                                "slug": "gross-margin-distribution-of-olien-consumer-j5orvr7qrj"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Consumer) across Gross Margin</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/po2wmhv6l8uw92jz",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "0 to 0.19",
                                                "0.19 to 0.23",
                                                "0.23 to 0.27",
                                                "0.27 to 0.31",
                                                "0.31 to 1"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            20,
                                                            100,
                                                            100,
                                                            100,
                                                            100
                                                        ],
                                                        [
                                                            "total",
                                                            14,
                                                            21,
                                                            47,
                                                            19,
                                                            5
                                                        ],
                                                        [
                                                            "key",
                                                            "0 to 0.19",
                                                            "0.19 to 0.23",
                                                            "0.23 to 0.27",
                                                            "0.27 to 0.31",
                                                            "0.31 to 1"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Consumer",
                                                        "total": "# of Olien Consumer"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    20,
                                                    100,
                                                    100,
                                                    100,
                                                    100
                                                ],
                                                [
                                                    "total",
                                                    14,
                                                    21,
                                                    47,
                                                    19,
                                                    5
                                                ],
                                                [
                                                    "key",
                                                    "0 to 0.19",
                                                    "0.19 to 0.23",
                                                    "0.23 to 0.27",
                                                    "0.27 to 0.31",
                                                    "0.31 to 1"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top Gross Margin(segment 0.23 to 0.27) account for 44.3% of the total Olien Consumer observations. The segment 0.31 to 1 contributes to just 4.7% of the total Olien Consumer. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Consumer from 0.23 to 0.27</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> There are some key factors(Sales Office and Product) that explain why the concentration of Olien Consumer from segment 0.23 to 0.27 is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Sales Office</b>: Nairobi - Local plays a key role in explaining the high concentration of Olien Consumer from segment 0.23 to 0.27. It accounts for 38.3% of total Olien Consumer from segment 0.23 to 0.27. The percentage of Olien Consumer for Nairobi - Local is 100.0%. </li> </li> <li> <b>Product</b>: 6x2 ltr c.tray plays a key role in explaining the high concentration of Olien Consumer from segment 0.23 to 0.27. It accounts for 55.3% of total Olien Consumer from segment 0.23 to 0.27. The percentage of Olien Consumer for 6x2 ltr c.tray is 100.0%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>44.3%</span><br /><small>Overall Olien Consumer comes from 0.23 to 0.27</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>0.19 to 0.23 has the highest rate of Olien Consumer</small></h2></div>"
                                    }
                                ],
                                "name": "Gross Margin : Distribution of Olien Bulk",
                                "slug": "gross-margin-distribution-of-olien-bulk-srs9z5jjeo"
                            }
                        ],
                        "name": "Gross Margin",
                        "slug": "gross-margin-k7103q8o1i"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Relationship between Product Category  and Sales Office</h3>"
                                    },
                                    {
                                        "dataType": "table",
                                        "data": {
                                            "tableType": "heatMap",
                                            "tableData": [
                                                [
                                                    "Sales Office",
                                                    "Olien Consumer",
                                                    "Olien Bulk"
                                                ],
                                                [
                                                    "Central",
                                                    100,
                                                    0
                                                ],
                                                [
                                                    "Coast",
                                                    66.67,
                                                    33.33
                                                ],
                                                [
                                                    "Internal",
                                                    0,
                                                    100
                                                ],
                                                [
                                                    "Lake",
                                                    80,
                                                    20
                                                ],
                                                [
                                                    "Nairobi - Local",
                                                    63.38,
                                                    36.62
                                                ],
                                                [
                                                    "Nyanza",
                                                    71.43,
                                                    28.57
                                                ],
                                                [
                                                    "Rift Valley",
                                                    58.33,
                                                    41.67
                                                ],
                                                [
                                                    "Trans Nzoia",
                                                    60,
                                                    40
                                                ],
                                                [
                                                    "Western",
                                                    42.86,
                                                    57.14
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> Sales Office is one of <b>the most significant influencers</b> of Product Category and displays significant variation in distribution of Product Category categories. <b>Segment Nairobi - Local </b> is the largest Sales Office, accounting for almost<b> 43.8% of the total </b>observations. <b>Segment Internal</b> is the smallest with <b>just 1.85%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Bulk</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> The <b>percentage of Olien Bulk</b> is the <b> lowest for the segment Central</b> (0.0%). The segment <b> Internal</b> has the <b>highest rate of Olien Bulk</b> (100.0%), which is 189.3% higher than the overall Olien Bulk rate. Interestingly, the <b>segment Central and segment Lake</b>, which cumulatively account for <b> 14.8% of the total </b>observations, has contributed to <b> 3.6% of total Olien Bulk</b>. On the other hand, the segments <b>Western and Internal</b> cumulatively account for <b>6.2% of the total</b> observations, but it has contributed to <b>12.5% of total Olien Bulk</b>. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key segments of Olien Consumer</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>Olien Consumer, segment Internal</b> seems to be the <b>least dominant segment</b> since 0.0% of its total observations are into Olien Consumer category. But,<b> segment Central</b> has the <b>highest rate of Olien Consumer</b> (100.0%). Interestingly, <b>segment Internal and segment Western</b>, which cumulatively account for <b> 6.2% of the total </b>observations, have contributed to <b> 2.8% of total Olien Consumer</b>. On the other hand, the segments <b>Lake and Central</b> cumulatively account for <b>14.8% of the total</b> observations, but it has contributed to <b>20.8% of total Olien Consumer</b>. </p>"
                                    }
                                ],
                                "name": "Sales Office: Relationship with Product Category",
                                "slug": "sales-office-relationship-with-product-category-p06si2n10q"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Bulk) across Sales Office</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/jnlnbx9hz9hv8cta",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Central",
                                                "Coast",
                                                "Internal",
                                                "Lake",
                                                "Nairobi - Local",
                                                "Nyanza",
                                                "Rift Valley",
                                                "Trans Nzoia",
                                                "Western"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            0,
                                                            33.333333333333336,
                                                            100,
                                                            20,
                                                            36.61971830985915,
                                                            28.571428571428573,
                                                            41.666666666666664,
                                                            40,
                                                            57.142857142857146
                                                        ],
                                                        [
                                                            "total",
                                                            0,
                                                            2,
                                                            3,
                                                            2,
                                                            26,
                                                            4,
                                                            5,
                                                            10,
                                                            4
                                                        ],
                                                        [
                                                            "key",
                                                            "Central",
                                                            "Coast",
                                                            "Internal",
                                                            "Lake",
                                                            "Nairobi - Local",
                                                            "Nyanza",
                                                            "Rift Valley",
                                                            "Trans Nzoia",
                                                            "Western"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Bulk",
                                                        "total": "# of Olien Bulk"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    0,
                                                    33.333333333333336,
                                                    100,
                                                    20,
                                                    36.61971830985915,
                                                    28.571428571428573,
                                                    41.666666666666664,
                                                    40,
                                                    57.142857142857146
                                                ],
                                                [
                                                    "total",
                                                    0,
                                                    2,
                                                    3,
                                                    2,
                                                    26,
                                                    4,
                                                    5,
                                                    10,
                                                    4
                                                ],
                                                [
                                                    "key",
                                                    "Central",
                                                    "Coast",
                                                    "Internal",
                                                    "Lake",
                                                    "Nairobi - Local",
                                                    "Nyanza",
                                                    "Rift Valley",
                                                    "Trans Nzoia",
                                                    "Western"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top Sales Office(segment Nairobi - Local) accounts for 46.4% of the total Olien Bulk observations. The segment Central contributes to just 0.0% of the total Olien Bulk. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Bulk from Nairobi - Local</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> There are some key factors(Product) that explain why the concentration of Olien Bulk from segment Nairobi - Local is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Product</b>: Among the Products, 10 ltr j.can has got the major chunk of Olien Bulk from segment Nairobi - Local, accounting for 61.5%. The percentage of Olien Bulk for 10 ltr j.can is 100.0%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>46.4%</span><br /><small>Overall Olien Bulk comes from Nairobi - Local</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>Internal has the highest rate of Olien Bulk</small></h2></div>"
                                    }
                                ],
                                "name": "Sales Office : Distribution of Olien Consumer",
                                "slug": "sales-office-distribution-of-olien-consumer-ijrexvuikx"
                            },
                            {
                                "cardWidth": 100,
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Distribution of Product Category (Olien Consumer) across Sales Office</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
                                            "download_url": "/api/download_data/krvkxlgpz95k8rzn",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Central",
                                                "Coast",
                                                "Internal",
                                                "Lake",
                                                "Nairobi - Local",
                                                "Nyanza",
                                                "Rift Valley",
                                                "Trans Nzoia",
                                                "Western"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": None,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": True,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": True
                                                    },
                                                    "x": {
                                                        "show": True
                                                    }
                                                },
                                                "subchart": None,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "count": 7,
                                                            "outer": False,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 90,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": False,
                                                            "fit": False,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": True,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": True,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            100,
                                                            66.66666666666667,
                                                            0,
                                                            80,
                                                            63.38028169014085,
                                                            71.42857142857143,
                                                            58.333333333333336,
                                                            60,
                                                            42.857142857142854
                                                        ],
                                                        [
                                                            "total",
                                                            14,
                                                            4,
                                                            0,
                                                            8,
                                                            45,
                                                            10,
                                                            7,
                                                            15,
                                                            3
                                                        ],
                                                        [
                                                            "key",
                                                            "Central",
                                                            "Coast",
                                                            "Internal",
                                                            "Lake",
                                                            "Nairobi - Local",
                                                            "Nyanza",
                                                            "Rift Valley",
                                                            "Trans Nzoia",
                                                            "Western"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Olien Consumer",
                                                        "total": "# of Olien Consumer"
                                                    }
                                                },
                                                "legend": {
                                                    "show": True
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "percentage",
                                                    100,
                                                    66.66666666666667,
                                                    0,
                                                    80,
                                                    63.38028169014085,
                                                    71.42857142857143,
                                                    58.333333333333336,
                                                    60,
                                                    42.857142857142854
                                                ],
                                                [
                                                    "total",
                                                    14,
                                                    4,
                                                    0,
                                                    8,
                                                    45,
                                                    10,
                                                    7,
                                                    15,
                                                    3
                                                ],
                                                [
                                                    "key",
                                                    "Central",
                                                    "Coast",
                                                    "Internal",
                                                    "Lake",
                                                    "Nairobi - Local",
                                                    "Nyanza",
                                                    "Rift Valley",
                                                    "Trans Nzoia",
                                                    "Western"
                                                ]
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The top Sales Office(segment Nairobi - Local) account for 42.5% of the total Olien Consumer observations. The segment Internal contributes to just 0.0% of the total Olien Consumer. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <h4>Key Factors influencing Olien Consumer from Nairobi - Local</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> There are some key factors(Product) that explain why the concentration of Olien Consumer from segment Nairobi - Local is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>Product</b>: The top 5 Products, including 12x1 ltr c.tray(22.22%) and 12x500ml c.tray(22.22%), account for 91.1% of the total Olien Consumer observations from segment Nairobi - Local. The percentage of Olien Consumer for 12x1 ltr c.tray and 12x500ml c.tray are 100.0% and 100.0% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>42.5%</span><br /><small>Overall Olien Consumer comes from Nairobi - Local</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>Central has the highest rate of Olien Consumer</small></h2></div>"
                                    }
                                ],
                                "name": "Sales Office : Distribution of Olien Bulk",
                                "slug": "sales-office-distribution-of-olien-bulk-1pmyhvq2ev"
                            }
                        ],
                        "name": "Sales Office",
                        "slug": "sales-office-8yqbflo7z0"
                    }
                ],
                "listOfCards": [
                    {
                        "name": "Key Influencers",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<h3>Strength of association between Product Category and other dimensions</h3>"
                            },
                            {
                                "dataType": "html",
                                "data": "<p class=\"txt-justify\"> There are <b>6 factors</b> in the dataset and <b> 3 of them </b> (including Product, Gross Margin) have <b>significant association</b> with Product Category. It implies that specific categories within each of the dimensions show <b>considerable amount of variation </b> in distribution of Product Category categories. The chart above displays the<b> impact of key dimensions </b> on Product Category, as measured by effect size. Let us take a deeper look at some of the most important relationships. </p>"
                            },
                            {
                                "dataType": "c3Chart",
                                "data": {
                                    "chart_c3": {
                                        "bar": {
                                            "width": 40
                                        },
                                        "point": None,
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "show": True,
                                            "format": {
                                                "title": ".2s"
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "grid": {
                                            "y": {
                                                "show": True
                                            },
                                            "x": {
                                                "show": True
                                            }
                                        },
                                        "subchart": None,
                                        "axis": {
                                            "y": {
                                                "tick": {
                                                    "count": 7,
                                                    "outer": False,
                                                    "multiline": True,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "Effect Size (Cramers-V)",
                                                    "position": "outer-middle"
                                                }
                                            },
                                            "x": {
                                                "height": 90,
                                                "tick": {
                                                    "rotate": -45,
                                                    "multiline": False,
                                                    "fit": False,
                                                    "format": ".2s"
                                                },
                                                "type": "category",
                                                "label": {
                                                    "text": "Dimensions",
                                                    "position": "outer-center"
                                                }
                                            }
                                        },
                                        "data": {
                                            "x": "key",
                                            "axes": {
                                                "value": "y"
                                            },
                                            "type": "bar",
                                            "columns": [
                                                [
                                                    "value",
                                                    0.7071067811865476,
                                                    0.5892111771858666,
                                                    0.22595840851513502
                                                ],
                                                [
                                                    "key",
                                                    "Product",
                                                    "Gross Margin",
                                                    "Sales Office"
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "show": False
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2f",
                                    "table_c3": [
                                        [
                                            "value",
                                            0.7071067811865476,
                                            0.5892111771858666,
                                            0.22595840851513502
                                        ],
                                        [
                                            "key",
                                            "Product",
                                            "Gross Margin",
                                            "Sales Office"
                                        ]
                                    ],
                                    "download_url": "/api/download_data/hfsoi3nso6rii0bu",
                                    "xdata": [
                                        "Product",
                                        "Gross Margin",
                                        "Sales Office"
                                    ]
                                }
                            }
                        ],
                        "slug": "key-influencers-jari6il0p6",
                        "cardWidth": 100
                    }
                ],
                "name": "Association",
                "slug": "association-nqq62xqn2r"
            },
            {
                "listOfNodes": [],
                "listOfCards": [
                    {
                        "name": "Predicting Key Drivers of Product Category",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<p class = \"txt-justify\"> Please select any Product Category category from the drop down below to view it's most significant decision rules. These rules capture sets of observations that are most likely to be from the chosen Product Category. </p>"
                            },
                            {
                                "dataType": "tree",
                                "data": {
                                    "name": "Root",
                                    "children": [
                                        {
                                            "name": "Product in (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray)",
                                            "children": [
                                                {
                                                    "name": "Predict: Olien Consumer"
                                                }
                                            ]
                                        },
                                        {
                                            "name": "Product not in (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray)",
                                            "children": [
                                                {
                                                    "name": "Predict: Olien Bulk"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                "dataType": "table",
                                "data": {
                                    "tableType": "decisionTreeTable",
                                    "tableData": [
                                        [
                                            "PREDICTION",
                                            "RULES",
                                            "PERCENTAGE"
                                        ],
                                        [
                                            "Olien Consumer",
                                            [
                                                "Product in (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray)"
                                            ],
                                            [
                                                100
                                            ]
                                        ],
                                        [
                                            "Olien Bulk",
                                            [
                                                "Product not in (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray)"
                                            ],
                                            [
                                                100
                                            ]
                                        ]
                                    ]
                                }
                            }
                        ],
                        "slug": "predicting-key-drivers-of-product-category-80m93vi9na",
                        "cardWidth": 100
                    },
                    {
                        "name": "Decision Rules for Product Category",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<h3>Predicting the Drivers of Product Category</h3> "
                            },
                            {
                                "dataType": "c3Chart",
                                "data": {
                                    "chart_c3": {
                                        "bar": {
                                            "width": 40
                                        },
                                        "point": None,
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "show": True,
                                            "format": {
                                                "title": ".2s"
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "grid": {
                                            "y": {
                                                "show": True
                                            },
                                            "x": {
                                                "show": True
                                            }
                                        },
                                        "subchart": None,
                                        "axis": {
                                            "y": {
                                                "tick": {
                                                    "count": 7,
                                                    "outer": False,
                                                    "multiline": True,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "",
                                                    "position": "outer-middle"
                                                }
                                            },
                                            "x": {
                                                "height": 90,
                                                "tick": {
                                                    "rotate": -45,
                                                    "multiline": False,
                                                    "fit": False,
                                                    "format": ".2s"
                                                },
                                                "type": "category",
                                                "label": {
                                                    "text": "",
                                                    "position": "outer-center"
                                                }
                                            }
                                        },
                                        "data": {
                                            "x": "key",
                                            "axes": {
                                                "value": "y"
                                            },
                                            "type": "bar",
                                            "columns": [
                                                [
                                                    "value",
                                                    106,
                                                    56
                                                ],
                                                [
                                                    "key",
                                                    "Olien Consumer",
                                                    "Olien Bulk"
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "show": False
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2s",
                                    "table_c3": [
                                        [
                                            "value",
                                            106,
                                            56
                                        ],
                                        [
                                            "key",
                                            "Olien Consumer",
                                            "Olien Bulk"
                                        ]
                                    ],
                                    "download_url": "/api/download_data/98azd1dbrjvhvnn0",
                                    "xdata": [
                                        "Olien Consumer",
                                        "Olien Bulk"
                                    ]
                                }
                            },
                            {
                                "dataType": "html",
                                "data": " <h4>Olien Consumer</h4> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class = \"txt-justify\"> Key variable that characterize the segment of Olien Consumer Product Category is Product. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class = \"txt-justify\"> <ul> <li> If the Product falls among (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray), it is <b>100%</b> likely that the observations are Olien Consumer segment. </ul> </p> <h4>Olien Bulk</h4> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class = \"txt-justify\"> Key variable that characterize the segment of Olien Bulk Product Category is Product. </p> "
                            },
                            {
                                "dataType": "html",
                                "data": " <p class = \"txt-justify\"> <ul> <li> There is a very high chance(<b>100%</b>) that product category would be relatively Olien Bulk when, the Product does not fall in (12x500ml c.tray,6x2 ltr c.tray,4x5 ltr rpc,24x200ml sachet,12x1 ltr c.tray,72x50ml sachet,36x100ml sachet,6x3 ltr c.tray). </ul> </p> "
                            }
                        ],
                        "slug": "decision-rules-for-product-category-cy7bmy7944",
                        "cardWidth": 100
                    }
                ],
                "name": "Prediction",
                "slug": "prediction-dtzrdjlqre"
            }
        ],
        "listOfCards": [
            {
                "cardWidth": 100,
                "cardType": "summary",
                "cardData": {
                    "noOfMeasures": 4,
                    "quotesHtml": None,
                    "summaryHtml": [
                        {
                            "dataType": "html",
                            "data": "<p class=\"lead txt-justify\"> mAdvisor has analyzed the dataset, which contains<b> 8</b> variables and <b>162</b> observations. Please click next to find the insights from our analysis of <b>product category</b>, that describes how it is distributed, what drives it, and how we can predict it. </p>"
                        }
                    ],
                    "noOfTimeDimensions": 1,
                    "noOfDimensions": 3
                },
                "name": "overall summary card",
                "slug": "overall-summary-card-b2lc5nsnpg"
            }
        ],
        "name": "testt",
        "slug": "testt-wzi3knp354"
    }