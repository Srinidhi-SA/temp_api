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
    slug = models.SlugField(null=True, max_length=300)
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
    slug = models.SlugField(null=True, max_length=300)
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
    subsetting = models.BooleanField(default=False, blank=True)

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

    def create_for_subsetting(
            self,
            filter_subsetting,
            inputfile,

    ):
        self.set_subesetting_true()
        jobConfig = self.add_subsetting_to_config(
                                filter_subsetting
                                )
        print jobConfig
        print "Dataset realted config generated."

        if inputfile:
            jobConfig = self.add_inputfile_outfile_to_config(
                                        inputfile,
                                        jobConfig
                                    )

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='subSetting'
        )

        self.job = job

        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"

        self.save()

    def set_subesetting_true(self):
        self.subsetting = True
        self.save()

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

    def add_subsetting_to_config(self, filter_subsetting):

        jobConfig = self.generate_config()
        print jobConfig
        print "Dataset realted config genarated."
        jobConfig["config"]["FILTER_SETTINGS"] = filter_subsetting


        return jobConfig

    def add_inputfile_outfile_to_config(self, inputfile, jobConfig):
        jobConfig["config"]["FILE_SETTINGS"] = {
            "inputfile": [inputfile],
            "outputfile": [self.get_input_file()],
        }

        return jobConfig

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

        if self.subsetting is True:
            return os.path.join(settings.HDFS.get('base_path'), self.slug)

        return os.path.join(settings.HDFS.get('base_path'), self.slug, os.path.basename(self.input_file.path))

    def emr_local(self):
        return "/home/marlabs" + self.get_hdfs_relative_path()

    def get_input_file(self):

        if self.datasource_type in ['file', 'fileUpload']:
            type = self.file_remote
            if type == 'emr_file':
                return "file://{}".format(self.input_file.path)
            elif type == 'hdfs':
                dir_path = "hdfs://{}:{}".format(
                    settings.HDFS.get("host"),
                    settings.HDFS.get("hdfs_port")
                )
                file_name = self.get_hdfs_relative_file_path()

                return dir_path + file_name

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
    slug = models.SlugField(null=False, blank=True, max_length=300)
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

    def create(self,  *args, **kwargs):
        self.add_to_job( *args, **kwargs)

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
        advanced_settings = kwargs.get('advanced_settings')
        config['config']["FILE_SETTINGS"] = self.create_configuration_url_settings(advanced_settings=advanced_settings)
        config['config']["COLUMN_SETTINGS"] = self.create_configuration_column_settings()
        config['config']["DATA_SOURCE"] = self.dataset.get_datasource_info()

        if 'advanced_settings' in kwargs:
            config['config']["ADVANCED_SETTINGS"] = kwargs.get('advanced_settings')
        else:
            config['config']["ADVANCED_SETTINGS"] = {}
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

    def create_configuration_url_settings(self, advanced_settings):
        # default_scripts_to_run = [
        #     'Descriptive analysis',
        #     'Measure vs. Dimension',
        #     'Dimension vs. Dimension',
        #     'Trend'
        # ]
        # config = json.loads(self.config)
        # script_to_run = config.get('possibleAnalysis', default_scripts_to_run)
        # for index, value in enumerate(script_to_run):
        #     if value == 'Trend Analysis':
        #         script_to_run[index] = 'Trend'
        #
        # if script_to_run is [] or script_to_run is "":
        #     script_to_run = default_scripts_to_run

        from django.conf import settings
        REVERSE_ANALYSIS_LIST = settings.REVERSE_ANALYSIS_LIST

        script_to_run= []
        for data in advanced_settings:
            if data['status'] == True:
                script_to_run.append([REVERSE_ANALYSIS_LIST[data['name']]])

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
    slug = models.SlugField(null=False, blank=True, max_length=300)
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
    slug = models.SlugField(null=False, blank=True, max_length=300)
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
            job_name=instance.name,
            message_slug=get_message_slug(instance)
        )
        print "Job submitted."

        job.url = job_url
        job.save()
    except Exception as exc:
        print "Unable to submit job."
        print exc
        return None

    return job

def get_message_slug(instance):
    from api.redis_access import AccessFeedbackMessage
    ac = AccessFeedbackMessage()
    slug = ac.get_cache_name(instance)
    return slug

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

        # self.meta_data = json.dumps(dummy_audio_data_3)
        self.meta_data = self.get_speech_data()
        self.analysis_done = True
        self.status = 'SUCCESS'
        self.save()

    def get_speech_data(self):
        from api.lib.speech_analysis import SpeechAnalyzer
        sa = SpeechAnalyzer(self.input_file.path)
        sa.convert_speech_to_text()
        sa.understand_text()
        # sa.nl_understanding = json.loads("""{"semantic_roles": [{"action": {"text": "calling", "verb": {"text": "call", "tense": "present"}, "normalized": "call"}, "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me", "object": {"text": "regarding my cellphone details regarding the AD and D. center"}, "subject": {"text": "I"}}, {"action": {"text": "get", "verb": {"text": "get", "tense": "future"}, "normalized": "get"}, "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me", "object": {"text": "to me"}, "subject": {"text": "you"}}], "emotion": {"document": {"emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}}}, "sentiment": {"document": {"score": -0.602607, "label": "negative"}}, "language": "en", "entities": [], "relations": [{"score": 0.941288, "type": "agentOf", "arguments": [{"text": "I", "entities": [{"text": "you", "type": "Person"}]}, {"text": "calling", "entities": [{"text": "calling", "type": "EventCommunication"}]}], "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me"}], "keywords": [{"relevance": 0.986328, "text": "cellphone details", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.833305, "text": "proper order", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.670873, "text": "D. center", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.552041, "text": "HESITATION", "sentiment": {"score": -0.602607}}, {"relevance": 0.396277, "text": "bills", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.34857, "text": "AD", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}], "concepts": [], "usage": {"text_characters": 150, "features": 8, "text_units": 1}, "categories": [{"score": 0.301348, "label": "/finance/personal finance/lending/credit cards"}, {"score": 0.17561, "label": "/business and industrial"}, {"score": 0.165519, "label": "/technology and computing"}]}
        #     """)
        sa.generate_node_structure()
        return json.dumps(sa.nl_understanding_nodestructure)

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


class SaveData(models.Model):
    slug = models.SlugField(null=False, blank=True, max_length=300)
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


class SaveAnyData(models.Model):

    slug = models.SlugField(null=False, blank=True, max_length=300, unique=True)
    data = models.TextField(default="{}")

    def get_url(self):
        return "/api/download_data/" + self.slug

    def get_data(self):
        data = self.data
        json_data = json.loads(data)
        rdata = json_data.get('data')
        return rdata

    def set_slug(self, slug):
        self.slug = slug

    def set_data(self, data):
        json_data = {
            "data": data
        }
        self.data = json.dumps(json_data)
        self.save()
        return True

