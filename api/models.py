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
from StockAdvisor.crawling.crawl_util import crawl_extract, \
    generate_urls_for_crawl_news, \
    convert_crawled_data_to_metadata_format, \
    generate_urls_for_historic_data
from StockAdvisor.crawling.common_utils import get_regex

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
            transformation_settings,
            inputfile,

    ):
        self.set_subesetting_true()
        jobConfig = self.add_subsetting_to_config(
                                filter_subsetting
                                )
        jobConfig = self.add_transformation_settings_to_config(jobConfig=jobConfig,
                                                               transformation_settings=transformation_settings)
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
        jobConfig["config"]["FILTER_SETTINGS"] = filter_subsetting


        return jobConfig

    def add_transformation_settings_to_config(self, jobConfig, transformation_settings):

        jobConfig["config"]["TRANSFORMATION_SETTINGS"] = transformation_settings

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
        default_scripts_to_run = [
            'Descriptive analysis',
            'Measure vs. Dimension',
            'Dimension vs. Dimension',
            'Trend'
        ]
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
        analysis = advanced_settings['analysis']
        for data in analysis:
            if data['status'] == True:
                script_to_run.append(REVERSE_ANALYSIS_LIST[data['name']])

        if len(script_to_run) < 1:
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
    app_id = models.IntegerField(null=True, default=1)

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


class StockDataset(models.Model):
    name = models.CharField(max_length=100, null=True)
    stock_symbols = models.CharField(max_length=500, null=True, blank=True)
    slug = models.SlugField(null=True, max_length=300)
    auto_update = models.BooleanField(default=False)

    input_file = models.FileField(upload_to='conceptsfiles', null=True)

    meta_data = models.TextField(default="{}")
    data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)
    bookmarked = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)
    analysis_done = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Not Registered")

    class Meta:
        ordering = ['-created_at', '-updated_at']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.slug]])

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(StockDataset, self).save(*args, **kwargs)

    def create(self):
        # self.meta_data = json.dumps(dummy_audio_data_3)
        self.meta_data = self.generate_meta_data()
        self.analysis_done = True
        self.status = 'SUCCESS'
        self.save()

    def crawl_data(self):

        stock_symbols = self.get_stock_symbol_names()
        GOOGLE_REGEX_FILE = "google_regex.json"
        print "stock_symbols  ---> crawl_data", stock_symbols
        extracted_data = crawl_extract(
            urls=generate_urls_for_crawl_news(stock_symbols),
            regex_dict=get_regex(GOOGLE_REGEX_FILE)
        )
        if len(extracted_data) < 1:
            print "No news_data"
            return {}
        meta_data = convert_crawled_data_to_metadata_format(
            news_data=extracted_data,
            other_details={
                'type': 'news_data'
            }
        )
        meta_data['extracted_data'] = extracted_data
        self.write_to_concepts_folder(
            stockDataType="news",
            stockName="",
            data=extracted_data,
            type='json'
        )

        return json.dumps(meta_data)

    def crawl_for_historic_data(self):
        stock_symbols = self.get_stock_symbol_names()
        GOOGLE_REGEX_FILE = "nasdaq_stock.json"
        print "stock_symbols  ---> crawl_for_historic_data", stock_symbols
        extracted_data = crawl_extract(
            urls=generate_urls_for_historic_data(stock_symbols),
            regex_dict=get_regex(GOOGLE_REGEX_FILE)
        )
        if len(extracted_data) < 1:
            print "No news_data"
            return {}
        meta_data = convert_crawled_data_to_metadata_format(
            news_data=extracted_data,
            other_details={
                'type': 'historical_data'
            }
        )
        meta_data['extracted_data'] = extracted_data

        self.write_to_concepts_folder(
            stockDataType="historic",
            stockName="all",
            data=extracted_data,
            type='json'
        )
        return meta_data

    def get_bluemix_natural_language_understanding(self, name=None):
        from StockAdvisor.bluemix.process_urls import ProcessUrls
        path = os.path.dirname(os.path.dirname(__file__)) + "/scripts/data/" + "stock_info.csv"
        pu = ProcessUrls(path)
        datas = pu.process()
        self.write_bluemix_data_into_concepts(
            name="bluemix",
            data=datas,
            type='json'
        )

    def generate_meta_data(self):
        self.create_folder_in_scripts_data()
        self.crawl_for_historic_data()
        self.get_bluemix_natural_language_understanding()
        return self.crawl_data()

    def create_folder_in_scripts_data(self):
        path = os.path.dirname(os.path.dirname(__file__)) + "/scripts/data/" + self.slug
        if not os.path.exists(path):
            os.makedirs(path)

    def stats(self, file):
        self.input_file = file
        self.data = self.generate_stats()
        self.analysis_done = True
        self.status = 'SUCCESS'
        self.save()

    def crawl_stats(self):
        crawled_stats = {
            "stats_sample": {
                "a": "a",
                "b": "b"
            }
        }
        return json.dumps(crawled_stats)

    def generate_stats(self):
        return self.crawl_stats()

    def get_stock_symbol_names(self):
        list_of_stock = self.stock_symbols.split(', ')
        return [stock_name.lower() for stock_name in list_of_stock]

    def get_brief_info(self):
        brief_info = dict()
        from api.helper import convert_to_humanize
        brief_info.update(
            {
                'created_by': self.created_by.username,
                'updated_at': self.updated_at,
                'stockdataset': self.name,
                # 'file_size': convert_to_humanize(self.input_file.size)
            })
        return convert_json_object_into_list_of_object(brief_info, 'stockdataset')

    def call_mlscripts(self):
        self.add_to_job()
        self.analysis_done = False
        self.status = 'INPROGRESS'
        self.save()

    def fake_call_mlscripts(self):
        # self.data = json.dumps(sample_stockdataset_data)
        self.data = json.dumps(sample_dummy_data_for_stock)
        # self.data = json.dumps(anothersample_stock_dummy_data)
        self.analysis_done = True
        self.status = 'SUCCESS'
        self.save()

    def generate_config(self, *args, **kwargs):
        inputFile = ""
        datasource_details = ""
        datasource_type = ""
        stockSymbolList = self.get_stock_symbol_names()

        THIS_SERVER_DETAILS = settings.THIS_SERVER_DETAILS
        data_api = "http://{0}:{1}/api/stockdatasetfiles/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                        THIS_SERVER_DETAILS.get('port'),
                                                        self.get_data_api())

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
                        "datasource_details": datasource_details,
                        "datasource_type": datasource_type
                    },
                    "STOCK_SETTINGS":{
                        "stockSymbolList": stockSymbolList,
                        "dataAPI": data_api # + "?" + 'stockDataType = "bluemix"' + '&' + 'stockName = "googl"'
                    }
                }
            }

    def get_data_api(self):
        return str(self.slug)

    def add_to_job(self, *args, **kwargs):
        jobConfig = self.generate_config(*args, **kwargs)

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='stockAdvisor'
        )

        self.job = job
        if job is None:
            self.status = "FAILED"
        else:
            self.status = "INPROGRESS"
        self.save()

    def write_to_concepts_folder(self, stockDataType, stockName, data, type='csv'):
        name = stockDataType + "_" + stockName
        path = os.path.dirname(os.path.dirname(__file__)) + "/scripts/data/" + self.slug + "/"
        file_path = path + name + "." + type

        with open(file_path, "wb") as file_to_write_on:
            if 'csv' == type:
                writer = csv.writer(file_to_write_on)
                writer.writerow(data)
            elif 'json' == type:
                json.dump(data, file_to_write_on)

    def write_bluemix_data_into_concepts(self, name, data, type='json'):

        for key in data.keys():
            name = name + "_" + key
            path = os.path.dirname(os.path.dirname(__file__)) + "/scripts/data/" + self.slug + "/"
            file_path = path + name + "." + type
            out_file = open(file_path, "wb")
            json.dump(data[key], out_file)
            out_file.close()


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

    slug = models.SlugField(null=False, blank=True, max_length=255, unique=True)
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

sample_stockdataset_data = {
        "listOfNodes": [
            {
                "listOfNodes": [
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Market Route on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Market Route",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            74.9746835443038,
                                                            59.375,
                                                            74.06371191135734,
                                                            77.50344530577088,
                                                            57.624663677130044
                                                        ],
                                                        [
                                                            "total",
                                                            5923.0,
                                                            475.0,
                                                            26737.0,
                                                            179963.0,
                                                            128503.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Telesales",
                                                            "Telecoverage",
                                                            "Other",
                                                            "Fields Sales",
                                                            "Reseller"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    74.9746835443038,
                                                    59.375,
                                                    74.06371191135734,
                                                    77.50344530577088,
                                                    57.624663677130044
                                                ],
                                                [
                                                    "total",
                                                    5923.0,
                                                    475.0,
                                                    26737.0,
                                                    179963.0,
                                                    128503.0
                                                ],
                                                [
                                                    "dimension",
                                                    "Telesales",
                                                    "Telecoverage",
                                                    "Other",
                                                    "Fields Sales",
                                                    "Reseller"
                                                ]
                                            ],
                                            "xdata": [
                                                "Telesales",
                                                "Telecoverage",
                                                "Other",
                                                "Fields Sales",
                                                "Reseller"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Market Routes(Fields Sales and Reseller)</b> account for about <b>90%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Fields Sales amounts to 179,963 that accounts for about <b>52.68% of the total Elapsed Day</b> and the average Elapsed Day is 77. On the other hand, bottom 3 contributes to just 9% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Fields Sales</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Market Route is characterized by the influence of key dimensions, such as Region, Deal Size Category, and Subgroup. For instance,Midwest, the <b>top performing Region account for 49.43%</b> of the overall Elapsed Day from Fields Sales. In terms of Deal Size Category, 100k to 250k(30.03%) and 50k to 100k(27.54%) account for 57% of the total Elapsed Day from Fields Sales. Among the Subgroup, Exterior Accessories has got the major chunk of Elapsed Day from Fields Sales, accounting for 18. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-gk4uk2a7d5",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Market Route",
                        "slug": "market-route-ke455kazyr"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Opportunity Result on Elapsed Day</h3>"
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Opportunity Result",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            73.98582333696838,
                                                            52.718468468468465
                                                        ],
                                                        [
                                                            "total",
                                                            271380.0,
                                                            70221.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Loss",
                                                            "Won"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    73.98582333696838,
                                                    52.718468468468465
                                                ],
                                                [
                                                    "total",
                                                    271380.0,
                                                    70221.0
                                                ],
                                                [
                                                    "dimension",
                                                    "Loss",
                                                    "Won"
                                                ]
                                            ],
                                            "xdata": [
                                                "Loss",
                                                "Won"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> Being the <b>largest contributor</b>, total Elapsed Day from Loss amounts to 271,380 that accounts for about <b>79.44% of the total Elapsed Day</b> and the average Elapsed Day is 73. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Loss</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Opportunity Result is characterized by the influence of key dimensions, such as Market Route, Subgroup, and Deal Size Category. For instance, Fields Sales(54.66%) along with Reseller(35.68%), the <b>top performing Market Route account for 90%</b> of the overall Elapsed Day from Loss. In terms of Subgroup, top 6 account for 84% of the total Elapsed Day from Loss. Among the Deal Size Category, 50k to 100k and 100k to 250k has got the major chunk of Elapsed Day from Loss, accounting for 50. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-pjhzerq40n",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Opportunity Result",
                        "slug": "opportunity-result-bfb524gywf"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Subgroup on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Subgroup",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            55.24390243902439,
                                                            71.33474576271186,
                                                            67.87566607460036,
                                                            68.12948207171314,
                                                            73.59302325581395,
                                                            69.83414634146341,
                                                            60.60432766615147,
                                                            69.30278232405892,
                                                            72.84201077199282,
                                                            69.12937433722163,
                                                            75.9047619047619
                                                        ],
                                                        [
                                                            "total",
                                                            2265.0,
                                                            16835.0,
                                                            38214.0,
                                                            68402.0,
                                                            12657.999999999998,
                                                            14315.999999999998,
                                                            39211.0,
                                                            42344.0,
                                                            40573.0,
                                                            65189.0,
                                                            1593.9999999999998
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Car Electronics",
                                                            "Interior Accessories",
                                                            "Replacement Parts",
                                                            "Exterior Accessories",
                                                            "Towing & Hitches",
                                                            "Performance Parts",
                                                            "Garage & Car Care",
                                                            "Shelters & RV",
                                                            "Batteries & Accessories",
                                                            "Motorcycle Parts",
                                                            "Tires & Wheels"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    55.24390243902439,
                                                    71.33474576271186,
                                                    67.87566607460036,
                                                    68.12948207171314,
                                                    73.59302325581395,
                                                    69.83414634146341,
                                                    60.60432766615147,
                                                    69.30278232405892,
                                                    72.84201077199282,
                                                    69.12937433722163,
                                                    75.9047619047619
                                                ],
                                                [
                                                    "total",
                                                    2265.0,
                                                    16835.0,
                                                    38214.0,
                                                    68402.0,
                                                    12657.999999999998,
                                                    14315.999999999998,
                                                    39211.0,
                                                    42344.0,
                                                    40573.0,
                                                    65189.0,
                                                    1593.9999999999998
                                                ],
                                                [
                                                    "dimension",
                                                    "Car Electronics",
                                                    "Interior Accessories",
                                                    "Replacement Parts",
                                                    "Exterior Accessories",
                                                    "Towing & Hitches",
                                                    "Performance Parts",
                                                    "Garage & Car Care",
                                                    "Shelters & RV",
                                                    "Batteries & Accessories",
                                                    "Motorcycle Parts",
                                                    "Tires & Wheels"
                                                ]
                                            ],
                                            "xdata": [
                                                "Car Electronics",
                                                "Interior Accessories",
                                                "Replacement Parts",
                                                "Exterior Accessories",
                                                "Towing & Hitches",
                                                "Performance Parts",
                                                "Garage & Car Care",
                                                "Shelters & RV",
                                                "Batteries & Accessories",
                                                "Motorcycle Parts",
                                                "Tires & Wheels"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Subgroups(Exterior Accessories and Motorcycle Parts)</b> account for about <b>39%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Exterior Accessories amounts to 68,402 that accounts for about <b>20.02% of the total Elapsed Day</b>. However, Tires & Wheels has the <b>highest average</b> Elapsed Day of 75, whereas the average for Exterior Accessories is 68. On the other hand, bottom 4 contributes to just 9% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Exterior Accessories</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Subgroup is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Competitor Type. For instance, Fields Sales(48.46%) along with Reseller(45.65%), the <b>top performing Market Route account for 94%</b> of the overall Elapsed Day from Exterior Accessories. In terms of Opportunity Result, Loss account for 73.96% of the total Elapsed Day from Exterior Accessories. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from Exterior Accessories, accounting for 68. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-tu5h243hm3",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Subgroup",
                        "slug": "subgroup-od231tw76q"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Competitor Type on Elapsed Day</h3>"
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Competitor Type",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            72.95333333333333,
                                                            66.08055009823183,
                                                            76.36950904392765
                                                        ],
                                                        [
                                                            "total",
                                                            76601.0,
                                                            235445.0,
                                                            29555.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Known",
                                                            "Unknown",
                                                            "None"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    72.95333333333333,
                                                    66.08055009823183,
                                                    76.36950904392765
                                                ],
                                                [
                                                    "total",
                                                    76601.0,
                                                    235445.0,
                                                    29555.0
                                                ],
                                                [
                                                    "dimension",
                                                    "Known",
                                                    "Unknown",
                                                    "None"
                                                ]
                                            ],
                                            "xdata": [
                                                "Known",
                                                "Unknown",
                                                "None"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Competitor Types(Unknown and Known)</b> account for about <b>91%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Unknown amounts to 235,445 that accounts for about <b>68.92% of the total Elapsed Day</b>. However, None has the <b>highest average</b> Elapsed Day of 76, whereas the average for Unknown is 66. On the other hand, None contributes to just 8% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Unknown</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Competitor Type is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 80.42%</b> of the overall Elapsed Day from Unknown. In terms of Market Route, Reseller(47.73%) and Fields Sales(44.37%) account for 92% of the total Elapsed Day from Unknown. Among the Subgroup, Motorcycle Parts and Exterior Accessories has got the major chunk of Elapsed Day from Unknown, accounting for 40. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-l3xvvbdmub",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Competitor Type",
                        "slug": "competitor-type-pudehd71lv"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Deal Size Category on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Deal Size Category",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            72.22222222222223,
                                                            68.30897435897435,
                                                            71.02564102564102,
                                                            63.03129445234708,
                                                            69.66885245901639,
                                                            64.25,
                                                            70.4298245614035
                                                        ],
                                                        [
                                                            "total",
                                                            83850.00000000001,
                                                            53280.99999999999,
                                                            8310.0,
                                                            44311.0,
                                                            21249.0,
                                                            58339.0,
                                                            72261.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "50k to 100k",
                                                            "25k to 50k",
                                                            "More than 500k",
                                                            "Less than 10k",
                                                            "250k to 500k",
                                                            "10k to 25k",
                                                            "100k to 250k"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    72.22222222222223,
                                                    68.30897435897435,
                                                    71.02564102564102,
                                                    63.03129445234708,
                                                    69.66885245901639,
                                                    64.25,
                                                    70.4298245614035
                                                ],
                                                [
                                                    "total",
                                                    83850.00000000001,
                                                    53280.99999999999,
                                                    8310.0,
                                                    44311.0,
                                                    21249.0,
                                                    58339.0,
                                                    72261.0
                                                ],
                                                [
                                                    "dimension",
                                                    "50k to 100k",
                                                    "25k to 50k",
                                                    "More than 500k",
                                                    "Less than 10k",
                                                    "250k to 500k",
                                                    "10k to 25k",
                                                    "100k to 250k"
                                                ]
                                            ],
                                            "xdata": [
                                                "50k to 100k",
                                                "25k to 50k",
                                                "More than 500k",
                                                "Less than 10k",
                                                "250k to 500k",
                                                "10k to 25k",
                                                "100k to 250k"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Deal Size Categories(50k to 100k and 100k to 250k)</b> account for about <b>45%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from 50k to 100k amounts to 83,850 that accounts for about <b>24.55% of the total Elapsed Day</b> and the average Elapsed Day is 72. On the other hand, More than 500k and 250k to 500k contributes to just 8% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from 50k to 100k</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Deal Size Category is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Competitor Type. For instance,Fields Sales, the <b>top performing Market Route account for 59.1%</b> of the overall Elapsed Day from 50k to 100k. In terms of Opportunity Result, Loss account for 87.93% of the total Elapsed Day from 50k to 100k. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from 50k to 100k, accounting for 66. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-n5zou4joy0",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Deal Size Category",
                        "slug": "deal-size-category-n62chl3yjy"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Region on Elapsed Day</h3>"
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Region",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            65.80722418531606,
                                                            67.17653276955602,
                                                            73.28533510285335
                                                        ],
                                                        [
                                                            "total",
                                                            167611.0,
                                                            63548.99999999999,
                                                            110441.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Midwest",
                                                            "Northwest",
                                                            "Pacific"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    65.80722418531606,
                                                    67.17653276955602,
                                                    73.28533510285335
                                                ],
                                                [
                                                    "total",
                                                    167611.0,
                                                    63548.99999999999,
                                                    110441.0
                                                ],
                                                [
                                                    "dimension",
                                                    "Midwest",
                                                    "Northwest",
                                                    "Pacific"
                                                ]
                                            ],
                                            "xdata": [
                                                "Midwest",
                                                "Northwest",
                                                "Pacific"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Regions(Midwest and Pacific)</b> account for about <b>81%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Midwest amounts to 167,611 that accounts for about <b>49.07% of the total Elapsed Day</b>. However, Pacific has the <b>highest average</b> Elapsed Day of 73, whereas the average for Midwest is 65. On the other hand, Northwest contributes to just 18% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Midwest</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Region is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 80.4%</b> of the overall Elapsed Day from Midwest. In terms of Market Route, Fields Sales(53.07%) and Reseller(45.13%) account for 98% of the total Elapsed Day from Midwest. Also, the top 6 Subgroup contribute to 86% of Elapsed Day from Midwest. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-6hiof0puzf",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Region",
                        "slug": "region-e771506rsf"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Revenue on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Revenue",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            68.84068466096116,
                                                            61.6530612244898,
                                                            64.23170731707317,
                                                            47.43010752688172,
                                                            71.61176470588235
                                                        ],
                                                        [
                                                            "total",
                                                            313707.0,
                                                            6042.0,
                                                            5267.0,
                                                            4411.0,
                                                            12174.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "0",
                                                            "50k to 400k",
                                                            "400k to 1.5M",
                                                            "1 to 50k",
                                                            "More than 1.5M"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    68.84068466096116,
                                                    61.6530612244898,
                                                    64.23170731707317,
                                                    47.43010752688172,
                                                    71.61176470588235
                                                ],
                                                [
                                                    "total",
                                                    313707.0,
                                                    6042.0,
                                                    5267.0,
                                                    4411.0,
                                                    12174.0
                                                ],
                                                [
                                                    "dimension",
                                                    "0",
                                                    "50k to 400k",
                                                    "400k to 1.5M",
                                                    "1 to 50k",
                                                    "More than 1.5M"
                                                ]
                                            ],
                                            "xdata": [
                                                "0",
                                                "50k to 400k",
                                                "400k to 1.5M",
                                                "1 to 50k",
                                                "More than 1.5M"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Revenues(0 and More than 1.5M)</b> account for about <b>95%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from 0 amounts to 313,707 that accounts for about <b>91.83% of the total Elapsed Day</b>. However, More than 1.5M has the <b>highest average</b> Elapsed Day of 71, whereas the average for 0 is 68. On the other hand, bottom 4 contributes to just 8% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from 0</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Revenue is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 82.27%</b> of the overall Elapsed Day from 0. In terms of Market Route, Fields Sales(51.71%) and Reseller(38.51%) account for 90% of the total Elapsed Day from 0. Among the Subgroup, Exterior Accessories and Motorcycle Parts has got the major chunk of Elapsed Day from 0, accounting for 39. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-6dpjic8c6o",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Revenue",
                        "slug": "revenue-1hr2wx2r07"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Size By Revenue on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Size By Revenue",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            69.02635228848821,
                                                            70.71753986332574,
                                                            71.31851851851852,
                                                            67.1603448275862,
                                                            66.96612244897959
                                                        ],
                                                        [
                                                            "total",
                                                            49768.0,
                                                            31045.0,
                                                            57768.0,
                                                            38953.0,
                                                            164067.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "50M to 100M",
                                                            "1M to 10M",
                                                            "More than 100M",
                                                            "10M to 50M",
                                                            "Less than 1M"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    69.02635228848821,
                                                    70.71753986332574,
                                                    71.31851851851852,
                                                    67.1603448275862,
                                                    66.96612244897959
                                                ],
                                                [
                                                    "total",
                                                    49768.0,
                                                    31045.0,
                                                    57768.0,
                                                    38953.0,
                                                    164067.0
                                                ],
                                                [
                                                    "dimension",
                                                    "50M to 100M",
                                                    "1M to 10M",
                                                    "More than 100M",
                                                    "10M to 50M",
                                                    "Less than 1M"
                                                ]
                                            ],
                                            "xdata": [
                                                "50M to 100M",
                                                "1M to 10M",
                                                "More than 100M",
                                                "10M to 50M",
                                                "Less than 1M"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top three Size By Revenues(Less than 1M, More than 100M and 50M to 100M)</b> account for about <b>79%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Less than 1M amounts to 164,067 that accounts for about <b>48.03% of the total Elapsed Day</b>. However, More than 100M has the <b>highest average</b> Elapsed Day of 71, whereas the average for Less than 1M is 66. On the other hand, 1M to 10M contributes to just 9% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Less than 1M</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Size By Revenue is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Competitor Type. For instance,Loss, the <b>top performing Opportunity Result account for 78.56%</b> of the overall Elapsed Day from Less than 1M. In terms of Market Route, Fields Sales account for 45.11% of the total Elapsed Day from Less than 1M. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from Less than 1M, accounting for 71. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-yuesxo6eqh",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Size By Revenue",
                        "slug": "size-by-revenue-5b0da6zlcr"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Group on Elapsed Day</h3>"
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Group",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            67.91223655237496,
                                                            55.24390243902439,
                                                            69.27174530983514,
                                                            75.9047619047619
                                                        ],
                                                        [
                                                            "total",
                                                            215893.0,
                                                            2265.0,
                                                            121849.00000000001,
                                                            1593.9999999999998
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Car Accessories",
                                                            "Car Electronics",
                                                            "Performance & Non-auto",
                                                            "Tires & Wheels"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    67.91223655237496,
                                                    55.24390243902439,
                                                    69.27174530983514,
                                                    75.9047619047619
                                                ],
                                                [
                                                    "total",
                                                    215893.0,
                                                    2265.0,
                                                    121849.00000000001,
                                                    1593.9999999999998
                                                ],
                                                [
                                                    "dimension",
                                                    "Car Accessories",
                                                    "Car Electronics",
                                                    "Performance & Non-auto",
                                                    "Tires & Wheels"
                                                ]
                                            ],
                                            "xdata": [
                                                "Car Accessories",
                                                "Car Electronics",
                                                "Performance & Non-auto",
                                                "Tires & Wheels"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Groups(Car Accessories and Performance & Non-auto)</b> account for about <b>98%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Car Accessories amounts to 215,893 that accounts for about <b>63.2% of the total Elapsed Day</b>. However, Tires & Wheels has the <b>highest average</b> Elapsed Day of 75, whereas the average for Car Accessories is 67. On the other hand, bottom 3 contributes to just 36% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Car Accessories</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Group is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Subgroup. For instance, Fields Sales(53.47%) along with Reseller(38.83%), the <b>top performing Market Route account for 92%</b> of the overall Elapsed Day from Car Accessories. In terms of Opportunity Result, Loss account for 76.26% of the total Elapsed Day from Car Accessories. Among the Subgroup, Exterior Accessories has got the major chunk of Elapsed Day from Car Accessories, accounting for 31. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-v0zxkyr9mr",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Group",
                        "slug": "group-r8fge8wmb8"
                    },
                    {
                        "listOfNodes": [

                        ],
                        "listOfCards": [
                            {
                                "name": "Impact on Elapsed Day",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "data": "<h3>Elapsed Day: Impact of Size By Employees on Elapsed Day</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "data": {
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
                                                            "text": "Total Elapsed Day",
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
                                                            "text": "Size By Employees",
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
                                                            "text": "Average Elapsed Day",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "x": "dimension",
                                                    "axes": {
                                                        "average": "y2"
                                                    },
                                                    "type": "bar",
                                                    "columns": [
                                                        [
                                                            "average",
                                                            67.64553686934023,
                                                            67.34752981260647,
                                                            69.64868804664724,
                                                            67.09144542772862,
                                                            71.13835616438357
                                                        ],
                                                        [
                                                            "total",
                                                            156870.0,
                                                            39532.99999999999,
                                                            47779.00000000001,
                                                            45488.0,
                                                            51931.0
                                                        ],
                                                        [
                                                            "dimension",
                                                            "Less than 1k",
                                                            "1k to 5k",
                                                            "10k to 30k",
                                                            "5k to 10k",
                                                            "More than 30k"
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
                                            "y2format": ".2s",
                                            "table_c3": [
                                                [
                                                    "average",
                                                    67.64553686934023,
                                                    67.34752981260647,
                                                    69.64868804664724,
                                                    67.09144542772862,
                                                    71.13835616438357
                                                ],
                                                [
                                                    "total",
                                                    156870.0,
                                                    39532.99999999999,
                                                    47779.00000000001,
                                                    45488.0,
                                                    51931.0
                                                ],
                                                [
                                                    "dimension",
                                                    "Less than 1k",
                                                    "1k to 5k",
                                                    "10k to 30k",
                                                    "5k to 10k",
                                                    "More than 30k"
                                                ]
                                            ],
                                            "xdata": [
                                                "Less than 1k",
                                                "1k to 5k",
                                                "10k to 30k",
                                                "5k to 10k",
                                                "More than 30k"
                                            ]
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> The <b>top two Size By Employees(Less than 1k and More than 30k)</b> account for about <b>61%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Less than 1k amounts to 156,870 that accounts for about <b>45.92% of the total Elapsed Day</b>. However, More than 30k has the <b>highest average</b> Elapsed Day of 71, whereas the average for Less than 1k is 67. On the other hand, 1k to 5k contributes to just 11% of the total Elapsed Day. </p>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<h4>Key Factors influencing Elapsed Day from Less than 1k</h4>"
                                    },
                                    {
                                        "dataType": "html",
                                        "data": "<p class = \"txt-justify\"> High contribution of Elapsed Day from Size By Employees is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Subgroup. For instance, Fields Sales(45.63%) along with Reseller(42.67%), the <b>top performing Market Route account for 88%</b> of the overall Elapsed Day from Less than 1k. In terms of Opportunity Result, Loss account for 76.81% of the total Elapsed Day from Less than 1k. Among the Subgroup, Exterior Accessories and Motorcycle Parts has got the major chunk of Elapsed Day from Less than 1k, accounting for 40. </p>"
                                    }
                                ],
                                "slug": "impact-on-elapsed-day-4uqutsu5mp",
                                "cardWidth": 100
                            }
                        ],
                        "name": "Size By Employees",
                        "slug": "size-by-employees-4jl6qkqopl"
                    }
                ],
                "listOfCards": [
                    {
                        "name": "Overview of Key Factors",
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "data": "<p class = \"txt-justify\"> There are <b>10 dimensions</b> in the dataset(including Market Route, Opportunity Result, Opportunity Result, etc.) and all of them have a <b>significant influence</b> on Elapsed Day. It implies that specific categories within each of the dimensions show <b>considerable amount of variation</b> in Elapsed Day. </p>"
                            },
                            {
                                "dataType": "c3Chart",
                                "data": {
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
                                                    "text": "Effect Size",
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
                                            "x": "dimension",
                                            "axes": {
                                                "effect_size": "y"
                                            },
                                            "type": "bar",
                                            "columns": [
                                                [
                                                    "effect_size",
                                                    0.15386169534200783,
                                                    0.14562503712225297,
                                                    0.022035830105915553,
                                                    0.021577016041256426,
                                                    0.019229733067950075,
                                                    0.017948507344020186,
                                                    0.016272992177517247,
                                                    0.005086305763765186,
                                                    0.0034070743152993977,
                                                    0.003177274635950544
                                                ],
                                                [
                                                    "dimension",
                                                    "Market Route",
                                                    "Opportunity Result",
                                                    "Subgroup",
                                                    "Competitor Type",
                                                    "Deal Size Category",
                                                    "Region",
                                                    "Revenue",
                                                    "Size By Revenue",
                                                    "Group",
                                                    "Size By Employees"
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
                                            "effect_size",
                                            0.15386169534200783,
                                            0.14562503712225297,
                                            0.022035830105915553,
                                            0.021577016041256426,
                                            0.019229733067950075,
                                            0.017948507344020186,
                                            0.016272992177517247,
                                            0.005086305763765186,
                                            0.0034070743152993977,
                                            0.003177274635950544
                                        ],
                                        [
                                            "dimension",
                                            "Market Route",
                                            "Opportunity Result",
                                            "Subgroup",
                                            "Competitor Type",
                                            "Deal Size Category",
                                            "Region",
                                            "Revenue",
                                            "Size By Revenue",
                                            "Group",
                                            "Size By Employees"
                                        ]
                                    ],
                                    "xdata": [
                                        "Market Route",
                                        "Opportunity Result",
                                        "Subgroup",
                                        "Competitor Type",
                                        "Deal Size Category",
                                        "Region",
                                        "Revenue",
                                        "Size By Revenue",
                                        "Group",
                                        "Size By Employees"
                                    ]
                                }
                            },
                            {
                                "dataType": "html",
                                "data": "<p class = \"txt-justify\"> The chart above displays the <b>impact of key dimensions</b> on Elapsed Day, as measured by effect size. Let us take a deeper look at some of the most important dimensions that show significant amount of difference in average Elapsed Day. </p>"
                            }
                        ],
                        "slug": "overview-of-key-factors-dmpwln1ha7",
                        "cardWidth": 100
                    }
                ],
                "name": "Performance",
                "slug": "performance-qm5ilmxf41"
            },
        ],
        "listOfCards": [
        ],
        "name": "Overview card",
        "slug": "fdfdfd_overview"
    }

bar_chart = {
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
                    "text": "score",
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
                "extent": None,
                "label": {
                    "text": "keyword",
                    "position": "outer-center"
                }
            }
        },
        "data": {
            "x": "text",
            "axes": {
                "score": "y"
            },
            "type": "bar",
            "columns": [
                [
                    "text",
                    "bank account number",
                    "credit card",
                    "New York",
                    "America",
                    "money",
                    "John",
                    "numbers"
                ],
                [
                    "score",
                    0.940398,
                    0.742339,
                    0.737608,
                    0.366456,
                    0.365641,
                    0.361568,
                    0.361102
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
            "text",
            "bank account number",
            "credit card",
            "New York",
            "America",
            "money",
            "John",
            "numbers"
        ],
        [
            "score",
            0.940398,
            0.742339,
            0.737608,
            0.366456,
            0.365641,
            0.361568,
            0.361102
        ]
    ],
    "download_url": "/api/download_data/bkz2oyjih4iczk95",
    "xdata": [
        "bank account number",
        "credit card",
        "New York",
        "America",
        "money",
        "John",
        "numbers"
    ]
}
}

horizontal_bar_chart = {
    "dataType": "c3Chart",
    "data":{
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
                    "text": "score",
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
                "extent": None,
                "label": {
                    "text": "keyword",
                    "position": "outer-center"
                },
                "rotated": True
            }
        },
        "data": {
            "x": "Source",
            "axes": {
                "No. of Articles": "y"
            },
            "type": "bar",
            "columns": [
                [
                    "text",
                    "bank account number",
                    "credit card",
                    "New York",
                    "America",
                    "money",
                    "John",
                    "numbers"
                ],
                [
                    "score",
                    0.940398,
                    0.742339,
                    0.737608,
                    0.366456,
                    0.365641,
                    0.361568,
                    0.361102
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
            "text",
            "bank account number",
            "credit card",
            "New York",
            "America",
            "money",
            "John",
            "numbers"
        ],
        [
            "score",
            0.940398,
            0.742339,
            0.737608,
            0.366456,
            0.365641,
            0.361568,
            0.361102
        ]
    ],
    "download_url": "/api/download_data/bkz2oyjih4iczk95",
    "xdata": [
        "bank account number",
        "credit card",
        "New York",
        "America",
        "money",
        "John",
        "numbers"
    ]
    }
}

line_chart = {
    "dataType": "c3Chart",
    "data": {
        "chart_c3": {
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
            "subchart": {
                "show": True
            },
            "data": {
                "x": "date",
                "axes": {
                    "scaled_total": "y"
                },
                "type": "line",
                "columns": [
                    [
                        "date",
                        "2016-06-01",
                        "2016-06-02",
                        "2016-06-03",
                        "2016-06-06",
                        "2016-06-07",
                        "2016-06-08",
                        "2016-06-09",
                        "2016-06-13",
                        "2016-06-14",
                        "2016-06-15",
                        "2016-06-16",
                        "2016-06-17",
                        "2016-06-20",
                        "2016-06-21",
                        "2016-06-22",
                        "2016-06-23",
                        "2016-06-24",
                        "2016-06-27",
                        "2016-06-28",
                        "2016-06-29",
                        "2016-06-30",
                        "2016-07-01",
                        "2016-07-04",
                        "2016-07-05",
                        "2016-07-07",
                        "2016-07-08",
                        "2016-07-11",
                        "2016-07-12",
                        "2016-07-13",
                        "2016-07-14",
                        "2016-07-15",
                        "2016-07-18",
                        "2016-07-19",
                        "2016-07-20",
                        "2016-07-21",
                        "2016-07-22",
                        "2016-07-25",
                        "2016-07-26",
                        "2016-07-27",
                        "2016-07-28",
                        "2016-07-29",
                        "2016-08-01",
                        "2016-08-03",
                        "2016-08-04",
                        "2016-08-05",
                        "2016-08-08",
                        "2016-08-09",
                        "2016-08-10",
                        "2016-08-11",
                        "2016-08-12",
                        "2016-08-16",
                        "2016-08-17",
                        "2016-08-18",
                        "2016-08-19",
                        "2016-08-22",
                        "2016-08-23",
                        "2016-08-24",
                        "2016-08-25",
                        "2016-08-30",
                        "2016-08-31",
                        "2016-09-01",
                        "2016-09-02",
                        "2016-09-06",
                        "2016-09-07",
                        "2016-09-08",
                        "2016-09-09",
                        "2016-09-12",
                        "2016-09-16",
                        "2016-09-19",
                        "2016-09-20",
                        "2016-09-21",
                        "2016-09-22",
                        "2016-09-23",
                        "2016-09-26",
                        "2016-09-27",
                        "2016-09-28",
                        "2016-09-30",
                        "2016-10-03",
                        "2016-10-04",
                        "2016-10-05",
                        "2016-10-06",
                        "2016-10-07",
                        "2016-10-10",
                        "2016-10-13",
                        "2016-10-14",
                        "2016-10-19",
                        "2016-10-20",
                        "2016-10-21",
                        "2016-10-24",
                        "2016-10-25",
                        "2016-10-26",
                        "2016-10-27",
                        "2016-10-28",
                        "2016-11-01",
                        "2016-11-02",
                        "2016-11-03",
                        "2016-11-04",
                        "2016-11-07",
                        "2016-11-08",
                        "2016-11-09",
                        "2016-11-10",
                        "2016-11-11",
                        "2016-11-17",
                        "2016-11-18",
                        "2016-11-23",
                        "2016-11-24",
                        "2016-11-25",
                        "2016-11-28",
                        "2016-11-29"
                    ],
                    [
                        "scaled_total",
                        100,
                        100.75,
                        101.63,
                        102.14,
                        102.6,
                        102.22,
                        102.34,
                        102.08,
                        103.8,
                        104.44,
                        104.44,
                        104.89,
                        104.52,
                        104.23,
                        104.39,
                        104.86,
                        104.16,
                        104.49,
                        105.5,
                        105.08,
                        105.26,
                        105.9,
                        105.37,
                        105.22,
                        105.14,
                        104.16,
                        104.23,
                        105.49,
                        105.85,
                        105.54,
                        104.48,
                        104.77,
                        105.79,
                        105.48,
                        105.27,
                        105.68,
                        105.51,
                        105.2,
                        105.24,
                        105.49,
                        104.72,
                        104.53,
                        104.94,
                        106.47,
                        106.84,
                        106.76,
                        107.14,
                        108.67,
                        108.48,
                        108.9,
                        108.04,
                        106.51,
                        106.59,
                        106.74,
                        107.4,
                        107.53,
                        107.17,
                        107.13,
                        108.05,
                        107.69,
                        106.39,
                        106.14,
                        106.36,
                        104.77,
                        104.89,
                        106.21,
                        106.52,
                        106.13,
                        105.73,
                        105.58,
                        105.63,
                        104.15,
                        104.24,
                        103.77,
                        105.57,
                        105.34,
                        105.83,
                        105.65,
                        105.99,
                        105.69,
                        104.81,
                        105.1,
                        105.19,
                        104.98,
                        103.78,
                        103.45,
                        102.91,
                        103.54,
                        103.99,
                        102.81,
                        103.72,
                        101.29,
                        99.53,
                        99.52,
                        99.27,
                        99.03,
                        97.68,
                        98.34,
                        98.63,
                        97.94,
                        99.49,
                        99.6,
                        99.76,
                        100.64,
                        100.35,
                        99.22,
                        99.65,
                        99.81,
                        99.25
                    ],
                    [
                        "sensex",
                        100,
                        100.81,
                        101.79,
                        102.34,
                        102.84,
                        102.42,
                        102.55,
                        102.27,
                        104.16,
                        104.84,
                        104.87,
                        105.34,
                        104.95,
                        104.61,
                        104.76,
                        105.25,
                        104.47,
                        104.82,
                        105.92,
                        105.47,
                        105.65,
                        106.35,
                        105.76,
                        105.57,
                        105.49,
                        104.42,
                        104.49,
                        105.86,
                        106.25,
                        105.88,
                        104.71,
                        105.03,
                        106.14,
                        105.81,
                        105.58,
                        106.03,
                        105.85,
                        105.51,
                        105.53,
                        105.79,
                        104.94,
                        104.74,
                        105.2,
                        106.86,
                        107.27,
                        107.16,
                        107.57,
                        109.25,
                        109.05,
                        109.5,
                        108.57,
                        106.9,
                        106.97,
                        107.12,
                        107.82,
                        107.95,
                        107.53,
                        107.48,
                        108.48,
                        108.08,
                        106.67,
                        106.41,
                        106.67,
                        104.91,
                        105.06,
                        106.48,
                        106.82,
                        106.4,
                        105.96,
                        105.79,
                        105.87,
                        104.22,
                        104.33,
                        103.79,
                        105.75,
                        105.5,
                        106.05,
                        105.85,
                        106.24,
                        105.91,
                        104.95,
                        105.25,
                        105.34,
                        105.1,
                        103.78,
                        103.41,
                        102.83,
                        103.52,
                        104.02,
                        102.74,
                        103.74,
                        101.11,
                        99.17,
                        99.15,
                        98.88,
                        98.59,
                        97.14,
                        97.87,
                        98.22,
                        97.5,
                        99.21,
                        99.34,
                        99.51,
                        100.48,
                        100.13,
                        98.89,
                        99.34,
                        99.5,
                        98.92
                    ]
                ]
            },
            "legend": {
                "show": True
            },
            "size": {
                "height": 490
            },
            "bar": {
                "width": {
                    "ratio": 0.5
                }
            },
            "tooltip": {
                "format": {
                    "title": ".2s"
                },
                "show": True
            },
            "axis": {
                "y": {
                    "tick": {
                        "count": 7,
                        "multiline": True,
                        "outer": False,
                        "format": ".2s"
                    },
                    "label": {
                        "text": "",
                        "position": "outer-middle"
                    }
                },
                "x": {
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
                    },
                    "extent": [
                        0,
                        10
                    ],
                    "height": 90
                }
            }
        },
        "yformat": ".2s",
        "table_c3": [
            [
                "date",
                "2016-06-01",
                "2016-06-02",
                "2016-06-03",
                "2016-06-06",
                "2016-06-07",
                "2016-06-08",
                "2016-06-09",
                "2016-06-13",
                "2016-06-14",
                "2016-06-15",
                "2016-06-16",
                "2016-06-17",
                "2016-06-20",
                "2016-06-21",
                "2016-06-22",
                "2016-06-23",
                "2016-06-24",
                "2016-06-27",
                "2016-06-28",
                "2016-06-29",
                "2016-06-30",
                "2016-07-01",
                "2016-07-04",
                "2016-07-05",
                "2016-07-07",
                "2016-07-08",
                "2016-07-11",
                "2016-07-12",
                "2016-07-13",
                "2016-07-14",
                "2016-07-15",
                "2016-07-18",
                "2016-07-19",
                "2016-07-20",
                "2016-07-21",
                "2016-07-22",
                "2016-07-25",
                "2016-07-26",
                "2016-07-27",
                "2016-07-28",
                "2016-07-29",
                "2016-08-01",
                "2016-08-03",
                "2016-08-04",
                "2016-08-05",
                "2016-08-08",
                "2016-08-09",
                "2016-08-10",
                "2016-08-11",
                "2016-08-12",
                "2016-08-16",
                "2016-08-17",
                "2016-08-18",
                "2016-08-19",
                "2016-08-22",
                "2016-08-23",
                "2016-08-24",
                "2016-08-25",
                "2016-08-30",
                "2016-08-31",
                "2016-09-01",
                "2016-09-02",
                "2016-09-06",
                "2016-09-07",
                "2016-09-08",
                "2016-09-09",
                "2016-09-12",
                "2016-09-16",
                "2016-09-19",
                "2016-09-20",
                "2016-09-21",
                "2016-09-22",
                "2016-09-23",
                "2016-09-26",
                "2016-09-27",
                "2016-09-28",
                "2016-09-30",
                "2016-10-03",
                "2016-10-04",
                "2016-10-05",
                "2016-10-06",
                "2016-10-07",
                "2016-10-10",
                "2016-10-13",
                "2016-10-14",
                "2016-10-19",
                "2016-10-20",
                "2016-10-21",
                "2016-10-24",
                "2016-10-25",
                "2016-10-26",
                "2016-10-27",
                "2016-10-28",
                "2016-11-01",
                "2016-11-02",
                "2016-11-03",
                "2016-11-04",
                "2016-11-07",
                "2016-11-08",
                "2016-11-09",
                "2016-11-10",
                "2016-11-11",
                "2016-11-17",
                "2016-11-18",
                "2016-11-23",
                "2016-11-24",
                "2016-11-25",
                "2016-11-28",
                "2016-11-29"
            ],
            [
                "scaled_total",
                100,
                100.75,
                101.63,
                102.14,
                102.6,
                102.22,
                102.34,
                102.08,
                103.8,
                104.44,
                104.44,
                104.89,
                104.52,
                104.23,
                104.39,
                104.86,
                104.16,
                104.49,
                105.5,
                105.08,
                105.26,
                105.9,
                105.37,
                105.22,
                105.14,
                104.16,
                104.23,
                105.49,
                105.85,
                105.54,
                104.48,
                104.77,
                105.79,
                105.48,
                105.27,
                105.68,
                105.51,
                105.2,
                105.24,
                105.49,
                104.72,
                104.53,
                104.94,
                106.47,
                106.84,
                106.76,
                107.14,
                108.67,
                108.48,
                108.9,
                108.04,
                106.51,
                106.59,
                106.74,
                107.4,
                107.53,
                107.17,
                107.13,
                108.05,
                107.69,
                106.39,
                106.14,
                106.36,
                104.77,
                104.89,
                106.21,
                106.52,
                106.13,
                105.73,
                105.58,
                105.63,
                104.15,
                104.24,
                103.77,
                105.57,
                105.34,
                105.83,
                105.65,
                105.99,
                105.69,
                104.81,
                105.1,
                105.19,
                104.98,
                103.78,
                103.45,
                102.91,
                103.54,
                103.99,
                102.81,
                103.72,
                101.29,
                99.53,
                99.52,
                99.27,
                99.03,
                97.68,
                98.34,
                98.63,
                97.94,
                99.49,
                99.6,
                99.76,
                100.64,
                100.35,
                99.22,
                99.65,
                99.81,
                99.25
            ],
            [
                "sensex",
                100,
                100.81,
                101.79,
                102.34,
                102.84,
                102.42,
                102.55,
                102.27,
                104.16,
                104.84,
                104.87,
                105.34,
                104.95,
                104.61,
                104.76,
                105.25,
                104.47,
                104.82,
                105.92,
                105.47,
                105.65,
                106.35,
                105.76,
                105.57,
                105.49,
                104.42,
                104.49,
                105.86,
                106.25,
                105.88,
                104.71,
                105.03,
                106.14,
                105.81,
                105.58,
                106.03,
                105.85,
                105.51,
                105.53,
                105.79,
                104.94,
                104.74,
                105.2,
                106.86,
                107.27,
                107.16,
                107.57,
                109.25,
                109.05,
                109.5,
                108.57,
                106.9,
                106.97,
                107.12,
                107.82,
                107.95,
                107.53,
                107.48,
                108.48,
                108.08,
                106.67,
                106.41,
                106.67,
                104.91,
                105.06,
                106.48,
                106.82,
                106.4,
                105.96,
                105.79,
                105.87,
                104.22,
                104.33,
                103.79,
                105.75,
                105.5,
                106.05,
                105.85,
                106.24,
                105.91,
                104.95,
                105.25,
                105.34,
                105.1,
                103.78,
                103.41,
                102.83,
                103.52,
                104.02,
                102.74,
                103.74,
                101.11,
                99.17,
                99.15,
                98.88,
                98.59,
                97.14,
                97.87,
                98.22,
                97.5,
                99.21,
                99.34,
                99.51,
                100.48,
                100.13,
                98.89,
                99.34,
                99.5,
                98.92
            ]
        ],
        "xdata": [
            "2016-06-01",
            "2016-06-02",
            "2016-06-03",
            "2016-06-06",
            "2016-06-07",
            "2016-06-08",
            "2016-06-09",
            "2016-06-13",
            "2016-06-14",
            "2016-06-15",
            "2016-06-16",
            "2016-06-17",
            "2016-06-20",
            "2016-06-21",
            "2016-06-22",
            "2016-06-23",
            "2016-06-24",
            "2016-06-27",
            "2016-06-28",
            "2016-06-29",
            "2016-06-30",
            "2016-07-01",
            "2016-07-04",
            "2016-07-05",
            "2016-07-07",
            "2016-07-08",
            "2016-07-11",
            "2016-07-12",
            "2016-07-13",
            "2016-07-14",
            "2016-07-15",
            "2016-07-18",
            "2016-07-19",
            "2016-07-20",
            "2016-07-21",
            "2016-07-22",
            "2016-07-25",
            "2016-07-26",
            "2016-07-27",
            "2016-07-28",
            "2016-07-29",
            "2016-08-01",
            "2016-08-03",
            "2016-08-04",
            "2016-08-05",
            "2016-08-08",
            "2016-08-09",
            "2016-08-10",
            "2016-08-11",
            "2016-08-12",
            "2016-08-16",
            "2016-08-17",
            "2016-08-18",
            "2016-08-19",
            "2016-08-22",
            "2016-08-23",
            "2016-08-24",
            "2016-08-25",
            "2016-08-30",
            "2016-08-31",
            "2016-09-01",
            "2016-09-02",
            "2016-09-06",
            "2016-09-07",
            "2016-09-08",
            "2016-09-09",
            "2016-09-12",
            "2016-09-16",
            "2016-09-19",
            "2016-09-20",
            "2016-09-21",
            "2016-09-22",
            "2016-09-23",
            "2016-09-26",
            "2016-09-27",
            "2016-09-28",
            "2016-09-30",
            "2016-10-03",
            "2016-10-04",
            "2016-10-05",
            "2016-10-06",
            "2016-10-07",
            "2016-10-10",
            "2016-10-13",
            "2016-10-14",
            "2016-10-19",
            "2016-10-20",
            "2016-10-21",
            "2016-10-24",
            "2016-10-25",
            "2016-10-26",
            "2016-10-27",
            "2016-10-28",
            "2016-11-01",
            "2016-11-02",
            "2016-11-03",
            "2016-11-04",
            "2016-11-07",
            "2016-11-08",
            "2016-11-09",
            "2016-11-10",
            "2016-11-11",
            "2016-11-17",
            "2016-11-18",
            "2016-11-23",
            "2016-11-24",
            "2016-11-25",
            "2016-11-28",
            "2016-11-29"
        ]
    }
}

pie_chart = {
    "dataType": "c3Chart",
    "data": {
            "chart_c3": {
                "color": {
                    "pattern": [
                        "#0fc4b5",
                        "#005662",
                        "#148071",
                        "#6cba86",
                        "#bcf3a2"
                    ]
                },
                "pie": {
                    "label": {
                        "format": None
                    }
                },
                "padding": {
                    "top": 40
                },
                "data": {
                    "x": None,
                    "type": "pie",
                    "columns": [
                        [
                            "Cash",
                            7
                        ],
                        [
                            "Debt",
                            28
                        ],
                        [
                            "Equity",
                            65
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
            "table_c3": [
                [
                    "Cash",
                    7
                ],
                [
                    "Debt",
                    28
                ],
                [
                    "Equity",
                    65
                ]
            ]
        }
}

databox_chart = {
      "dataType": "dataBox",
      "data": [{
        "name": "News Sources",
        "value": "11"
      }, {
        "name": "Articles Crawled",
        "value": "1245"
      }, {
        "name": "Avg. Stock Price Change",
        "value": "15.7 %"
      }, {
        "name": "Market Cap Change",
        "value": "$1.23m"
      }, {
        "name": "Max Change in Stock",
        "value": "AMZN +11.4%"
      }, {
        "name": "Average Sentiment Score",
        "value": "0.89"
      }, {
        "name": "Max Change in Sentiment",
        "value": "GOOGL +0.24"
      }]
    }

word_cloud =  {
      "dataType": "wordCloud",
      "data": [{
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }, {
        "text": "facilities",
        "value": 2
      }]
    }

heat_map = {
        "dataType": "table",
        "data": {
            "topHeader": "Average Elapsed Day",
            "tableData": [
                ["Category", "Batteries & Accessories", "Car Electronics", "Exterior Accessories", "Garage & Car Care", "Interior Accessories", "Motorcycle Parts", "Performance Parts", "Replacement Parts", "Shelters & RV", "Tires & Wheels", "Towing & Hitches"],
                ["0.0 to 5.0", "73.87", "56.69", "70.8", "60.28", "73.62", "71.49", "73.96", "70.39", "71.71", "79.29", "76.68"],
                ["5.0 to 10.0", "69.08", "44.8", "60.21", "61.73", "63.54", "60.64", "58.52", "61.38", "60.7", "76.0", "63.56"],
                ["20.0 to 25.0", "41.0", "0.0", "57.0", "78.0", "35.5", "56.57", "54.5", "55.8", "23.0", "18.0", "39.67"],
                ["15.0 to 20.0", "0.0", "0.0", "20.33", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                ["10.0 to 15.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "47.0", "0.0", "0.0", "0.0", "0.0"]
            ],
            "tableType": "heatMap"
        }
}

table2 = {
				"dataType": "table",
				"data": {
					"tableType": "decisionTreeTable",
					"tableData": [
						["PREDICTION", "RULES", "PERCENTAGE"],
						["High", ["Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days <= 32.0", "Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days > 32.0", "Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route not in (Telesales,Reseller)"],
							[93.09, 69.98, 65.67]
						],
						["Medium", ["Closing Days > 37.0,Closing Days <= 59.0,Closing Days <= 45.0", "Closing Days > 37.0,Closing Days <= 59.0,Closing Days > 45.0", "Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count <= 4.0"],
							[59.03, 86.34, 56.82]
						],
						["Low", ["Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route in (Telesales,Reseller)", "Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count > 4.0"],
							[73.77, 65.56]
						]
					]
				}
}


individual_company = {
    "listOfNodes": [
    ],
    "listOfCards": [
        {
            "cardType": "normal",
            "name": "node2-card1",
            "slug": "node2-card1",
            "cardData": [
                'databox', # databox_chart
                'articles_and_sentiments_by_source', # horizontal_bar_chart,
                'articles_and_sentiments_by_concepts', # horizontal_bar_chart,
                'stock_performance_vs_sentiment_score', # line_chart,
                # 'statistical_significance_of_keywords', # bar_chart,
                'top_entities', # word_cloud
            ]
        },
        {
            "cardType": "normal",
            "name": "node2-card2",
            "slug": "node2-card2",
            "cardData": [
                # 'top_positive_and_negative_statement', # table2,
                # 'articles_with_highest_and_lowest_sentiments_score', #table2
            ]
        },
        {
            "cardType": "normal",
            "name": "node2-card3",
            "slug": "node2-card3",
            "cardData": [
                # "segment_by_concept_and_keyword", # heat_map,
                # 'key_parameter_that_impact_stock_prices', # bar_chart
            ]
        }
    ],
    "name": "",
    "slug": ""
}


def change_data_in_chart(data, chart, x=None, axes=None, widthPercent=None):
    import copy
    chart = copy.deepcopy(chart)
    chart["data"]["chart_c3"]["data"]["columns"] = data
    chart["data"]["chart_c3"]["data"]["x"] = x
    chart["data"]["chart_c3"]["data"]["axes"] = axes
    chart["data"]["xdata"] = data[0][1:]
    chart["data"]["table_c3"] = data

    if widthPercent is not None:
        chart["widthPercent"] = widthPercent

    return chart


def change_data_in_pie_chart(data, chart, widthPercent=None):
    import copy
    chart = copy.deepcopy(chart)
    chart["data"]["chart_c3"]["data"]["columns"] = data
    chart["data"]["table_c3"] = data

    if widthPercent is not None:
        chart["widthPercent"] = widthPercent

    return chart


def change_data_in_databox(data, databox):
    import copy
    databox = copy.deepcopy(databox)
    databox["data"] = data
    return databox

def change_data_in_wordcloud(data, wordcloud):
    import copy
    wordcloud = copy.deepcopy(wordcloud)
    wordcloud['data'] = data
    return wordcloud

def change_data_inheatmap(data):
    return data

def change_data_in_table(data):
    return data


def change_name_and_slug_in_individual(name):
    import copy
    temp_node = copy.deepcopy(individual_company)
    temp_node['name'] = name
    temp_node['slug'] = name
    listOfCards = temp_node['listOfCards']
    final_list_of_cards = []
    for cards in listOfCards:
        this_card = {}
        cards["name"] = ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        cards["slug"] = ''.join(
            random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

        cardData = cards['cardData']
        temp_card_data = []
        details_data = stock_name_match_with_data[name]
        for cardD in cardData:
            chart = None
            if cardD == "databox":
                chart = change_data_in_databox(
                    data=details_data[cardD],
                    databox=databox_chart
                )
            if cardD == "articles_and_sentiments_by_source":
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=horizontal_bar_chart,
                    x="Source",
                    axes={"No. of Articles": "y"}
                )
            if cardD == "articles_and_sentiments_by_concepts":
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=horizontal_bar_chart,
                    x="Concept",
                    axes={"No. of Articles": "y"}
                )
            if cardD == 'stock_performance_vs_sentiment_score':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=line_chart,
                    x="Date",
                    axes={}
                )
            if cardD == 'statistical_significance_of_concepts':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=bar_chart,
                    x="Score",
                    axes={"Avg. Sentiment Score": "y"}
                )
            if cardD == 'top_keywords':
                chart = change_data_in_wordcloud(
                    data=details_data[cardD],
                    wordcloud=word_cloud
                )
            if cardD == "stock_performance_vs_sentiment_score":
                chart = change_data_inheatmap(details_data[cardD])
            if cardD == 'key_parameter_that_impact_stock_prices':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=bar_chart,
                    x="Score",
                    axes={"Avg. Sentiment Score": "y"}
                )
            if cardD == "segment_by_concept_and_keyword":
                chart = change_data_inheatmap(details_data[cardD])
            if cardD in ['top_positive_and_negative_statement']:
                chart = change_data_in_table(details_data[cardD])

            if chart is not None:
                temp_card_data.append(chart)

        cards['cardData'] = temp_card_data

    return temp_node

def smaller_name_and_slug_in_individual(name):
    import copy
    temp_node = copy.deepcopy(individual_company)
    temp_node['name'] = name
    temp_node['slug'] = name

    card_1 = {
            "cardType": "normal",
            "name": "node2-caasdasd",
            "slug": "node2-card2asda",
            "cardData": [
                table2,
                table2
            ]
        }

    return temp_node['listOfCards'][0]


node1_databox_data = [{
        "name": "Total Articles",
        "value": "583"
      }, {
        "name": "Total Source",
        "value": "68"
      }, {
        "name": "Average Sentiment Score",
        "value": "0.27"
      }, {
        "name": "Overall Stock % Change",
        "value": "4.5 %"
      }, {
        "name": "Overall Stock Value Change",
        "value": "$137.1B"
      }, {
        "name": "Max Change in Price",
        "value": "12.5% (MSFT)"
      }, {
        "name": "Max Change in Sentiment",
        "value": "-0.80 (AAPL)"
      }]


number_of_articles_by_stock = [
    ['Stock', "FB", "GOOGL", "IBM", "AMZN", "MSFT", "AAPL"],
    ['No. of Articles', 92, 94, 71, 128, 97, 101]
]



article_by_source = [
    ['Source', '24/7 Wall St.','9to5Mac','Amigobulls','Argus Journal','Benzinga','Bloomberg','Bloomberg BNA','Business Wire (press release)','BZ Weekly','Crains Detroit Business','DirectorsTalk Interviews','Dispatch Tribunal','Economic News','Engadget','Equities.com','Forbes','Fox News','GuruFocus.com','GuruFocus.com (blog)','Inc.com','insideBIGDATA','Investopedia (blog)','Investorplace.com','Investorplace.com (blog)','LearnBonds','Library For Smart Investors','Live Trading News','Los Angeles Times','Madison.com','Market Exclusive','MarketWatch','Motley Fool','Nasdaq','NBC Southern California','New York Law Journal (registration)','NY Stock News','Post Analyst','PR Newswire (press release)','Proactive Investors UK','Reuters','Reuters Key Development','Reuters.com','San Antonio Business Journal','Seeking Alpha','Silicon Valley Business Journal','Simply Wall St','Stock Press Daily','Stock Talker','StockNews.com (blog)','StockNewsGazette','StockNewsJournal','Street Observer (press release)','The Ledger Gazette','The Recorder','The Wall Street Transcript','TheStreet.com','Times of India','TopChronicle','TRA','Triangle Business Journal','TrueBlueTribune','USA Commerce Daily','ValueWalk','Voice Of Analysts','Wall Street Journal','Yahoo Finance','Yahoo News','Zacks.com'],
    ['No. of Articles', 1,1,6,1,5,10,1,1,1,1,2,2,9,1,12,1,1,2,1,1,1,1,53,10,1,1,3,2,2,2,4,43,11,1,1,8,3,2,3,9,217,1,1,63,2,1,1,1,17,2,16,2,6,1,1,5,1,1,1,1,1,1,8,1,3,3,2,2]
]


from sample_stock_data import stock_performace_card1, \
    stock_by_sentiment_score, \
    card1_total_entities, \
    number_of_articles_by_concept, \
    overview_of_second_node_databox_data, \
    stock_name_match_with_data


node1 = {
    "listOfNodes": [
    ],
    "listOfCards": [
        {
            "cardType": "normal",
            "name": "node1-card1",
            "slug": "node1-card1",
            "cardData": [
                change_data_in_databox(node1_databox_data, databox_chart),
                change_data_in_chart(
                    data=number_of_articles_by_stock,
                    chart=horizontal_bar_chart,
                    x="Stock",
                    axes={"No. of Articles": "y"},
                    widthPercent=50
                ),

                change_data_in_pie_chart(
                    data=number_of_articles_by_concept,
                    chart=pie_chart,
                    widthPercent=50
                ),
                change_data_in_chart(
                    data=article_by_source,
                    chart=horizontal_bar_chart,
                    x="Source",
                    axes={"No. of Articles": "y"},
                    # widthPercent=33
                ),
                change_data_in_chart(
                    data=stock_performace_card1,
                    chart=line_chart,
                    x="DATE",
                    axes={}
                ),
                change_data_in_chart(
                    data=stock_by_sentiment_score,
                    chart=bar_chart,
                    x="Score",
                    axes={"Avg. Sentiment Score": "y"}
                ),
                change_data_in_wordcloud(card1_total_entities, word_cloud)
            ]
        }
    ],
    "name": "Overview",
    "slug": "node1-overview"
}

node2 = {
    "listOfNodes": [
        # change_name_and_slug_in_individual(name='googl'),
        change_name_and_slug_in_individual(name='amzn'),
        # change_name_and_slug_in_individual(name='ibm')
    ],
    "listOfCards": [
        smaller_name_and_slug_in_individual(name='unknown')
    ],
    "name": "node2-overview",
    "slug": "node2-overview"
}



sample_dummy_data_for_stock = {
    "listOfNodes": [
        node1,
        node2
    ],
    "listOfCards": [],
    "name": "Overview card",
    "slug": "fdfdfd_overview"
}





"""
bar_chart = [
[
    "text",
    "bank account number",
    "credit card",
    "New York",
    "America",
    "money",
    "John",
    "numbers"
],
[
    "score",
    0.940398,
    0.742339,
    0.737608,
    0.366456,
    0.365641,
    0.361568,
    0.361102
]
]

pie_chart = [
        [
            "Cash",
            7
        ],
        [
            "Debt",
            28
        ],
        [
            "Equity",
            65
        ]
]
"""

anothersample_stock_dummy_data = {"name":"test for failed story","slug":"test-for-failed-story-5l7uaz8la7","type":"measure","target_column":"Elapsed Day","config":{"config":{"COLUMN_SETTINGS":{"polarity":["positive"],"date_format":None,"consider_columns_type":["including"],"result_column":["Elapsed Day"],"ignore_column_suggestion":[],"consider_columns":["Subgroup","Group","Region","Market Route","Size By Revenue","Size By Employees","Revenue","Competitor Type","Deal Size Category","Opportunity Result","Elapsed Day","Sales Stage Change Count","Closing Days","Qualified Days","Amount USD"],"utf8_column_suggestions":[],"date_columns":[],"analysis_type":["measure"],"dateTimeSuggestions":[{}]},"FILE_SETTINGS":{"script_to_run":["Predictive modeling","Measure vs. Measure","Measure vs. Dimension","Descriptive analysis"],"inputfile":["hdfs://ec2-34-205-203-38.compute-1.amazonaws.com:8020/dev/dataset/opportunity_traincsv-c2haowjs6p/Opportunity_train_XZ7X0U7.csv"]}}},"live_status":"0","analysis_done":True,"data":{"listOfNodes":[{"listOfNodes":[],"listOfCards":[{"name":"Distribution of Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<p class = \"txt-justify\"> The value for elapsed day range from a <b>minimum</b> of 0 all the way upto a <b>maximum</b> of 126. The <b>sum of elapsed day</b> amounts to 341,601 with the <b>average</b> elapsed day per observation being 68. The dataset contains 5000 <b>observations</b> and there are 3 observations (outliers) that have <b>extremely low</b> value of elapsed day </p>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"# of Observations","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"","position":"outer-center"}}},"data":{"x":"bin_name","axes":{"count":"y"},"type":"bar","columns":[["count",31,713,121,329,549,768,1968,445,48,28],["bin_name","< 13.0","< 26.0","< 39.0","< 52.0","< 65.0","< 78.0","< 91.0","< 104.0","< 117.0","< 130.0"]]},"legend":{"show":False},"size":{"height":340}},"yformat":".2s","table_c3":[["count",31,713,121,329,549,768,1968,445,48,28],["bin_name","< 13.0","< 26.0","< 39.0","< 52.0","< 65.0","< 78.0","< 91.0","< 104.0","< 117.0","< 130.0"]],"xdata":["< 13.0","< 26.0","< 39.0","< 52.0","< 65.0","< 78.0","< 91.0","< 104.0","< 117.0","< 130.0"]}},{"dataType":"table","data":{"tableType":"normal","tableData":[["Minimum","Quartile 1","Median","Quartile 3","Maximum"],[0,"54","77","88","126"]]}},{"dataType":"html","data":" <p class = \"txt-justify\">The histogram shows distribution of elapsed day divided into 10 categories.</p> <p class = \"txt-justify\">The plot indicates that the elapsed day observations are moderately concentrated around a few categories, as more than <b>three quarters</b> (81.0%) of elapsed day values are between <b>39 and 104</b>. The distribution is <b>negatively skewed</b>, which implies that there is a significant chunk of <b>high-value</b> elapsed day observations. </p> "},{"dataType":"html","data":"<h2>Concentration of High & Low segments</h2><br> <p class = \"txt-justify\"> The top 27% of the observations (High segment) account for about 36% of the total elapsed day (341,601), i.e. 123,757. However, the overall elapsed day from the bottom quartile (24% of observations low elapsed day) amounts to 37,144, which is just 10% of the total. Quite interestingly, the average elapsed day per observations the top performing segment is 91, which is 1.33X as big as the overall average sales per observation (68) and 2.0 times bigger than the average from Low segment. </p> "}],"slug":"distribution-of-elapsed-day-204g058flv","cardWidth":100}],"name":"Overview","slug":"overview-c8sj70qmox"},{"listOfNodes":[{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Market Route on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Market Route","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",74.9746835443038,59.375,74.06371191135734,77.50344530577088,57.624663677130044],["total",5923.0,475.0,26737.0,179963.0,128503.0],["dimension","Telesales","Telecoverage","Other","Fields Sales","Reseller"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",74.9746835443038,59.375,74.06371191135734,77.50344530577088,57.624663677130044],["total",5923.0,475.0,26737.0,179963.0,128503.0],["dimension","Telesales","Telecoverage","Other","Fields Sales","Reseller"]],"xdata":["Telesales","Telecoverage","Other","Fields Sales","Reseller"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Market Routes(Fields Sales and Reseller)</b> account for about <b>90%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Fields Sales amounts to 179,963 that accounts for about <b>52.68% of the total Elapsed Day</b> and the average Elapsed Day is 77. On the other hand, bottom 3 contributes to just 9% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Fields Sales</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Market Route is characterized by the influence of key dimensions, such as Region, Deal Size Category, and Subgroup. For instance,Midwest, the <b>top performing Region account for 49.43%</b> of the overall Elapsed Day from Fields Sales. In terms of Deal Size Category, 100k to 250k(30.03%) and 50k to 100k(27.54%) account for 57% of the total Elapsed Day from Fields Sales. Among the Subgroup, Exterior Accessories has got the major chunk of Elapsed Day from Fields Sales, accounting for 18. </p>"}],"slug":"impact-on-elapsed-day-gk4uk2a7d5","cardWidth":100}],"name":"Market Route","slug":"market-route-ke455kazyr"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Opportunity Result on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":40},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Opportunity Result","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",73.98582333696838,52.718468468468465],["total",271380.0,70221.0],["dimension","Loss","Won"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",73.98582333696838,52.718468468468465],["total",271380.0,70221.0],["dimension","Loss","Won"]],"xdata":["Loss","Won"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> Being the <b>largest contributor</b>, total Elapsed Day from Loss amounts to 271,380 that accounts for about <b>79.44% of the total Elapsed Day</b> and the average Elapsed Day is 73. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Loss</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Opportunity Result is characterized by the influence of key dimensions, such as Market Route, Subgroup, and Deal Size Category. For instance, Fields Sales(54.66%) along with Reseller(35.68%), the <b>top performing Market Route account for 90%</b> of the overall Elapsed Day from Loss. In terms of Subgroup, top 6 account for 84% of the total Elapsed Day from Loss. Among the Deal Size Category, 50k to 100k and 100k to 250k has got the major chunk of Elapsed Day from Loss, accounting for 50. </p>"}],"slug":"impact-on-elapsed-day-pjhzerq40n","cardWidth":100}],"name":"Opportunity Result","slug":"opportunity-result-bfb524gywf"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Subgroup on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Subgroup","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",55.24390243902439,71.33474576271186,67.87566607460036,68.12948207171314,73.59302325581395,69.83414634146341,60.60432766615147,69.30278232405892,72.84201077199282,69.12937433722163,75.9047619047619],["total",2265.0,16835.0,38214.0,68402.0,12657.999999999998,14315.999999999998,39211.0,42344.0,40573.0,65189.0,1593.9999999999998],["dimension","Car Electronics","Interior Accessories","Replacement Parts","Exterior Accessories","Towing & Hitches","Performance Parts","Garage & Car Care","Shelters & RV","Batteries & Accessories","Motorcycle Parts","Tires & Wheels"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",55.24390243902439,71.33474576271186,67.87566607460036,68.12948207171314,73.59302325581395,69.83414634146341,60.60432766615147,69.30278232405892,72.84201077199282,69.12937433722163,75.9047619047619],["total",2265.0,16835.0,38214.0,68402.0,12657.999999999998,14315.999999999998,39211.0,42344.0,40573.0,65189.0,1593.9999999999998],["dimension","Car Electronics","Interior Accessories","Replacement Parts","Exterior Accessories","Towing & Hitches","Performance Parts","Garage & Car Care","Shelters & RV","Batteries & Accessories","Motorcycle Parts","Tires & Wheels"]],"xdata":["Car Electronics","Interior Accessories","Replacement Parts","Exterior Accessories","Towing & Hitches","Performance Parts","Garage & Car Care","Shelters & RV","Batteries & Accessories","Motorcycle Parts","Tires & Wheels"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Subgroups(Exterior Accessories and Motorcycle Parts)</b> account for about <b>39%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Exterior Accessories amounts to 68,402 that accounts for about <b>20.02% of the total Elapsed Day</b>. However, Tires & Wheels has the <b>highest average</b> Elapsed Day of 75, whereas the average for Exterior Accessories is 68. On the other hand, bottom 4 contributes to just 9% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Exterior Accessories</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Subgroup is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Competitor Type. For instance, Fields Sales(48.46%) along with Reseller(45.65%), the <b>top performing Market Route account for 94%</b> of the overall Elapsed Day from Exterior Accessories. In terms of Opportunity Result, Loss account for 73.96% of the total Elapsed Day from Exterior Accessories. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from Exterior Accessories, accounting for 68. </p>"}],"slug":"impact-on-elapsed-day-tu5h243hm3","cardWidth":100}],"name":"Subgroup","slug":"subgroup-od231tw76q"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Competitor Type on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":40},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Competitor Type","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",72.95333333333333,66.08055009823183,76.36950904392765],["total",76601.0,235445.0,29555.0],["dimension","Known","Unknown","None"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",72.95333333333333,66.08055009823183,76.36950904392765],["total",76601.0,235445.0,29555.0],["dimension","Known","Unknown","None"]],"xdata":["Known","Unknown","None"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Competitor Types(Unknown and Known)</b> account for about <b>91%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Unknown amounts to 235,445 that accounts for about <b>68.92% of the total Elapsed Day</b>. However, None has the <b>highest average</b> Elapsed Day of 76, whereas the average for Unknown is 66. On the other hand, None contributes to just 8% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Unknown</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Competitor Type is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 80.42%</b> of the overall Elapsed Day from Unknown. In terms of Market Route, Reseller(47.73%) and Fields Sales(44.37%) account for 92% of the total Elapsed Day from Unknown. Among the Subgroup, Motorcycle Parts and Exterior Accessories has got the major chunk of Elapsed Day from Unknown, accounting for 40. </p>"}],"slug":"impact-on-elapsed-day-l3xvvbdmub","cardWidth":100}],"name":"Competitor Type","slug":"competitor-type-pudehd71lv"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Deal Size Category on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Deal Size Category","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",72.22222222222223,68.30897435897435,71.02564102564102,63.03129445234708,69.66885245901639,64.25,70.4298245614035],["total",83850.00000000001,53280.99999999999,8310.0,44311.0,21249.0,58339.0,72261.0],["dimension","50k to 100k","25k to 50k","More than 500k","Less than 10k","250k to 500k","10k to 25k","100k to 250k"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",72.22222222222223,68.30897435897435,71.02564102564102,63.03129445234708,69.66885245901639,64.25,70.4298245614035],["total",83850.00000000001,53280.99999999999,8310.0,44311.0,21249.0,58339.0,72261.0],["dimension","50k to 100k","25k to 50k","More than 500k","Less than 10k","250k to 500k","10k to 25k","100k to 250k"]],"xdata":["50k to 100k","25k to 50k","More than 500k","Less than 10k","250k to 500k","10k to 25k","100k to 250k"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Deal Size Categories(50k to 100k and 100k to 250k)</b> account for about <b>45%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from 50k to 100k amounts to 83,850 that accounts for about <b>24.55% of the total Elapsed Day</b> and the average Elapsed Day is 72. On the other hand, More than 500k and 250k to 500k contributes to just 8% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from 50k to 100k</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Deal Size Category is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Competitor Type. For instance,Fields Sales, the <b>top performing Market Route account for 59.1%</b> of the overall Elapsed Day from 50k to 100k. In terms of Opportunity Result, Loss account for 87.93% of the total Elapsed Day from 50k to 100k. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from 50k to 100k, accounting for 66. </p>"}],"slug":"impact-on-elapsed-day-n5zou4joy0","cardWidth":100}],"name":"Deal Size Category","slug":"deal-size-category-n62chl3yjy"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Region on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":40},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Region","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",65.80722418531606,67.17653276955602,73.28533510285335],["total",167611.0,63548.99999999999,110441.0],["dimension","Midwest","Northwest","Pacific"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",65.80722418531606,67.17653276955602,73.28533510285335],["total",167611.0,63548.99999999999,110441.0],["dimension","Midwest","Northwest","Pacific"]],"xdata":["Midwest","Northwest","Pacific"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Regions(Midwest and Pacific)</b> account for about <b>81%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Midwest amounts to 167,611 that accounts for about <b>49.07% of the total Elapsed Day</b>. However, Pacific has the <b>highest average</b> Elapsed Day of 73, whereas the average for Midwest is 65. On the other hand, Northwest contributes to just 18% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Midwest</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Region is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 80.4%</b> of the overall Elapsed Day from Midwest. In terms of Market Route, Fields Sales(53.07%) and Reseller(45.13%) account for 98% of the total Elapsed Day from Midwest. Also, the top 6 Subgroup contribute to 86% of Elapsed Day from Midwest. </p>"}],"slug":"impact-on-elapsed-day-6hiof0puzf","cardWidth":100}],"name":"Region","slug":"region-e771506rsf"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Revenue on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Revenue","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",68.84068466096116,61.6530612244898,64.23170731707317,47.43010752688172,71.61176470588235],["total",313707.0,6042.0,5267.0,4411.0,12174.0],["dimension","0","50k to 400k","400k to 1.5M","1 to 50k","More than 1.5M"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",68.84068466096116,61.6530612244898,64.23170731707317,47.43010752688172,71.61176470588235],["total",313707.0,6042.0,5267.0,4411.0,12174.0],["dimension","0","50k to 400k","400k to 1.5M","1 to 50k","More than 1.5M"]],"xdata":["0","50k to 400k","400k to 1.5M","1 to 50k","More than 1.5M"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Revenues(0 and More than 1.5M)</b> account for about <b>95%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from 0 amounts to 313,707 that accounts for about <b>91.83% of the total Elapsed Day</b>. However, More than 1.5M has the <b>highest average</b> Elapsed Day of 71, whereas the average for 0 is 68. On the other hand, bottom 4 contributes to just 8% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from 0</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Revenue is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Subgroup. For instance,Loss, the <b>top performing Opportunity Result account for 82.27%</b> of the overall Elapsed Day from 0. In terms of Market Route, Fields Sales(51.71%) and Reseller(38.51%) account for 90% of the total Elapsed Day from 0. Among the Subgroup, Exterior Accessories and Motorcycle Parts has got the major chunk of Elapsed Day from 0, accounting for 39. </p>"}],"slug":"impact-on-elapsed-day-6dpjic8c6o","cardWidth":100}],"name":"Revenue","slug":"revenue-1hr2wx2r07"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Size By Revenue on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Size By Revenue","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",69.02635228848821,70.71753986332574,71.31851851851852,67.1603448275862,66.96612244897959],["total",49768.0,31045.0,57768.0,38953.0,164067.0],["dimension","50M to 100M","1M to 10M","More than 100M","10M to 50M","Less than 1M"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",69.02635228848821,70.71753986332574,71.31851851851852,67.1603448275862,66.96612244897959],["total",49768.0,31045.0,57768.0,38953.0,164067.0],["dimension","50M to 100M","1M to 10M","More than 100M","10M to 50M","Less than 1M"]],"xdata":["50M to 100M","1M to 10M","More than 100M","10M to 50M","Less than 1M"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top three Size By Revenues(Less than 1M, More than 100M and 50M to 100M)</b> account for about <b>79%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Less than 1M amounts to 164,067 that accounts for about <b>48.03% of the total Elapsed Day</b>. However, More than 100M has the <b>highest average</b> Elapsed Day of 71, whereas the average for Less than 1M is 66. On the other hand, 1M to 10M contributes to just 9% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Less than 1M</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Size By Revenue is characterized by the influence of key dimensions, such as Opportunity Result, Market Route, and Competitor Type. For instance,Loss, the <b>top performing Opportunity Result account for 78.56%</b> of the overall Elapsed Day from Less than 1M. In terms of Market Route, Fields Sales account for 45.11% of the total Elapsed Day from Less than 1M. Among the Competitor Type, Unknown has got the major chunk of Elapsed Day from Less than 1M, accounting for 71. </p>"}],"slug":"impact-on-elapsed-day-yuesxo6eqh","cardWidth":100}],"name":"Size By Revenue","slug":"size-by-revenue-5b0da6zlcr"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Group on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":40},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Group","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",67.91223655237496,55.24390243902439,69.27174530983514,75.9047619047619],["total",215893.0,2265.0,121849.00000000001,1593.9999999999998],["dimension","Car Accessories","Car Electronics","Performance & Non-auto","Tires & Wheels"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",67.91223655237496,55.24390243902439,69.27174530983514,75.9047619047619],["total",215893.0,2265.0,121849.00000000001,1593.9999999999998],["dimension","Car Accessories","Car Electronics","Performance & Non-auto","Tires & Wheels"]],"xdata":["Car Accessories","Car Electronics","Performance & Non-auto","Tires & Wheels"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Groups(Car Accessories and Performance & Non-auto)</b> account for about <b>98%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Car Accessories amounts to 215,893 that accounts for about <b>63.2% of the total Elapsed Day</b>. However, Tires & Wheels has the <b>highest average</b> Elapsed Day of 75, whereas the average for Car Accessories is 67. On the other hand, bottom 3 contributes to just 36% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Car Accessories</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Group is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Subgroup. For instance, Fields Sales(53.47%) along with Reseller(38.83%), the <b>top performing Market Route account for 92%</b> of the overall Elapsed Day from Car Accessories. In terms of Opportunity Result, Loss account for 76.26% of the total Elapsed Day from Car Accessories. Among the Subgroup, Exterior Accessories has got the major chunk of Elapsed Day from Car Accessories, accounting for 31. </p>"}],"slug":"impact-on-elapsed-day-v0zxkyr9mr","cardWidth":100}],"name":"Group","slug":"group-r8fge8wmb8"},{"listOfNodes":[],"listOfCards":[{"name":"Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Elapsed Day: Impact of Size By Employees on Elapsed Day</h3>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Total Elapsed Day","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Size By Employees","position":"outer-center"}},"y2":{"show":True,"tick":{"count":7,"multiline":True,"format":".2s"},"label":{"text":"Average Elapsed Day","position":"outer-middle"}}},"data":{"x":"dimension","axes":{"average":"y2"},"type":"bar","columns":[["average",67.64553686934023,67.34752981260647,69.64868804664724,67.09144542772862,71.13835616438357],["total",156870.0,39532.99999999999,47779.00000000001,45488.0,51931.0],["dimension","Less than 1k","1k to 5k","10k to 30k","5k to 10k","More than 30k"]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","y2format":".2s","table_c3":[["average",67.64553686934023,67.34752981260647,69.64868804664724,67.09144542772862,71.13835616438357],["total",156870.0,39532.99999999999,47779.00000000001,45488.0,51931.0],["dimension","Less than 1k","1k to 5k","10k to 30k","5k to 10k","More than 30k"]],"xdata":["Less than 1k","1k to 5k","10k to 30k","5k to 10k","More than 30k"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The <b>top two Size By Employees(Less than 1k and More than 30k)</b> account for about <b>61%</b> of the total Elapsed Day. Being the <b>largest contributor</b>, total Elapsed Day from Less than 1k amounts to 156,870 that accounts for about <b>45.92% of the total Elapsed Day</b>. However, More than 30k has the <b>highest average</b> Elapsed Day of 71, whereas the average for Less than 1k is 67. On the other hand, 1k to 5k contributes to just 11% of the total Elapsed Day. </p>"},{"dataType":"html","data":"<h4>Key Factors influencing Elapsed Day from Less than 1k</h4>"},{"dataType":"html","data":"<p class = \"txt-justify\"> High contribution of Elapsed Day from Size By Employees is characterized by the influence of key dimensions, such as Market Route, Opportunity Result, and Subgroup. For instance, Fields Sales(45.63%) along with Reseller(42.67%), the <b>top performing Market Route account for 88%</b> of the overall Elapsed Day from Less than 1k. In terms of Opportunity Result, Loss account for 76.81% of the total Elapsed Day from Less than 1k. Among the Subgroup, Exterior Accessories and Motorcycle Parts has got the major chunk of Elapsed Day from Less than 1k, accounting for 40. </p>"}],"slug":"impact-on-elapsed-day-4uqutsu5mp","cardWidth":100}],"name":"Size By Employees","slug":"size-by-employees-4jl6qkqopl"}],"listOfCards":[{"name":"Overview of Key Factors","cardType":"normal","cardData":[{"dataType":"html","data":"<p class = \"txt-justify\"> There are <b>10 dimensions</b> in the dataset(including Market Route, Opportunity Result, Opportunity Result, etc.) and all of them have a <b>significant influence</b> on Elapsed Day. It implies that specific categories within each of the dimensions show <b>considerable amount of variation</b> in Elapsed Day. </p>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Effect Size","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"","position":"outer-center"}}},"data":{"x":"dimension","axes":{"effect_size":"y"},"type":"bar","columns":[["effect_size",0.15386169534200783,0.14562503712225297,0.022035830105915553,0.021577016041256426,0.019229733067950075,0.017948507344020186,0.016272992177517247,0.005086305763765186,0.0034070743152993977,0.003177274635950544],["dimension","Market Route","Opportunity Result","Subgroup","Competitor Type","Deal Size Category","Region","Revenue","Size By Revenue","Group","Size By Employees"]]},"legend":{"show":False},"size":{"height":340}},"yformat":".2f","table_c3":[["effect_size",0.15386169534200783,0.14562503712225297,0.022035830105915553,0.021577016041256426,0.019229733067950075,0.017948507344020186,0.016272992177517247,0.005086305763765186,0.0034070743152993977,0.003177274635950544],["dimension","Market Route","Opportunity Result","Subgroup","Competitor Type","Deal Size Category","Region","Revenue","Size By Revenue","Group","Size By Employees"]],"xdata":["Market Route","Opportunity Result","Subgroup","Competitor Type","Deal Size Category","Region","Revenue","Size By Revenue","Group","Size By Employees"]}},{"dataType":"html","data":"<p class = \"txt-justify\"> The chart above displays the <b>impact of key dimensions</b> on Elapsed Day, as measured by effect size. Let us take a deeper look at some of the most important dimensions that show significant amount of difference in average Elapsed Day. </p>"}],"slug":"overview-of-key-factors-dmpwln1ha7","cardWidth":100}],"name":"Performance","slug":"performance-qm5ilmxf41"},{"listOfNodes":[{"listOfNodes":[],"listOfCards":[{"name":"Sales Stage Change Count: Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Impact of Sales Stage Change Count on Elapsed Day</h3>"},{"dataType":"html","data":"<h4>Overview</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Sales Stage Change Count is one of the <b>significant influencer</b> of Elapsed Day and it explains a great magnitude of change in Elapsed Day. It is <b>negatively correlated</b> with the Elapsed Day figures. An incremental unit change in Sales Stage Change Count corresponds to an average decrease in Elapsed Day by -2.77 units. </p>"},{"dataType":"html","data":"<h3>Sensitivity Analysis</h3> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Sales Stage Change Count seems to have a remarkable impact on various segments of Elapsed Day observations. The chart above shows four quadrants based on the distribution of Elapsed Day (high vs. low) and marketing cost (high vs. low). </p> "},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":{"r":4},"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Sales Stage Change Count","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False},"type":"index","extent":None,"label":{"text":"Elapsed Day","position":"outer-center"}}},"data":{"axes":{"Sales Stage Change Count":"y"},"names":{"#EC640C":"High Elapsed Day with Low Sales Stage Change Count","#00AEB3":"High Elapsed Day with High Sales Stage Change Count","#DD2E1F":"Low Elapsed Day with Low Sales Stage Change Count","#7C5BBB":"Low Elapsed Day with High Sales Stage Change Count"},"x":None,"xs":{"High Elapsed Day with Low Sales Stage Change Count":"High Elapsed Day with Low Sales Stage Change Count_x","Low Elapsed Day with Low Sales Stage Change Count":"Low Elapsed Day with Low Sales Stage Change Count_x","Low Elapsed Day with High Sales Stage Change Count":"Low Elapsed Day with High Sales Stage Change Count_x","High Elapsed Day with High Sales Stage Change Count":"High Elapsed Day with High Sales Stage Change Count_x"},"type":"scatter","columns":[["High Elapsed Day with Low Sales Stage Change Count",2,3,2,3,3,2,2,3,2,3,2,2,3,2,3,2,2,3,2,2,2,3,2,2,3,2,3,2,2,3,3,2,2,3,2,2,2,3,2,2,2,2,3,2,2,2,3,2,3,2,3,3,3,2,3,3,2,3,3,2,2,2,2,2,2,3,2,2,3,3,2,3,3,3,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,2,2,1],["High Elapsed Day with Low Sales Stage Change Count_x",70,71,72,73,73,73,74,74,74,74,75,75,77,77,77,77,77,79,79,80,80,81,81,81,81,81,82,82,82,83,83,83,83,83,84,84,84,84,84,84,84,84,84,84,85,85,86,86,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,93,101,101,101,119],["Low Elapsed Day with Low Sales Stage Change Count",3,3,2,3,3,2,2,3,3,2,2,2,2,3,3,3,3,3,3,3,2,3,3,3,3,3,3,2,2,2,2,2,2,2,3,3,3,2,3,3,2,3,2,2,3,3,3,3,2,3,3,2,3,3,3,2,2,2,3,3,3,3,2,2,3,2,3,3,2,3,3,3,2,2,2,3,3,2,2,2,2,2,2,2,2,3,2,3,3,3,2,3,2,3,3,2,3],["Low Elapsed Day with Low Sales Stage Change Count_x",16,16,16,16,22,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,27,27,35,35,37,39,40,41,44,44,44,44,44,45,45,46,49,50,51,53,55,58,58,58,59,59,60,60,61,61,61,62,62,62,62,62,62,62,62,62,63,64,64,65,65,67,67,68,68,68,68,68],["Low Elapsed Day with High Sales Stage Change Count",8,4,5,4,4,9,7,5,6,4,5,4,6,6,4,5,4,7,4,4,5,5,4,4,4,4,7,4,4,4,5,6,4,5,4,6,4,8,6,4,4,7,6,4,5,4,8,5,5,23,4,6,6,5,4,5,5,7,4,5,4,4,5,4,5,4,5,7,4,7,4,4,5,4,7,4,7,5,4,4,6,6,4,4,4,11,4,5,5,9,4,7,7,4,6,5,4,4,4,5,10],["Low Elapsed Day with High Sales Stage Change Count_x",0,7,16,16,16,16,16,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,36,37,38,41,43,43,43,44,44,44,45,45,45,45,45,47,49,49,49,50,53,54,54,54,55,56,56,57,57,60,60,60,60,60,60,61,62,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,64,65,66,66,66,66,66,66,66,67,67,68,68],["High Elapsed Day with High Sales Stage Change Count",5,6,6,4,5,6,4,4,4,8,4,4,4,4,4,8,5,7,4,5,4,5,5,4,4,4,5,5,7,5,6,4,5,4,4,6,4,8,4,6,4,4,4,4,5,5,11,8,5,4,4,5,5,4,7,4,5,4,4,6,4,5,4,4,4,4,4,6,7,5,4,5,6,4,4,4,5,4,4,4,4,5,4,4,4,4,4,4,5,4,4,8,4,4,4,4],["High Elapsed Day with High Sales Stage Change Count_x",69,69,70,70,71,71,71,71,71,71,72,73,73,73,74,74,74,74,74,74,74,74,75,75,76,76,76,76,77,77,77,79,79,79,79,80,81,81,81,81,81,81,81,81,81,82,83,83,83,84,84,84,84,84,84,85,85,86,86,86,86,86,86,86,87,87,88,88,88,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,92,93,101,110,110,118]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","table_c3":[["High Elapsed Day with Low Sales Stage Change Count",2,3,2,3,3,2,2,3,2,3,2,2,3,2,3,2,2,3,2,2,2,3,2,2,3,2,3,2,2,3,3,2,2,3,2,2,2,3,2,2,2,2,3,2,2,2,3,2,3,2,3,3,3,2,3,3,2,3,3,2,2,2,2,2,2,3,2,2,3,3,2,3,3,3,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,2,2,1],["High Elapsed Day with Low Sales Stage Change Count_x",70,71,72,73,73,73,74,74,74,74,75,75,77,77,77,77,77,79,79,80,80,81,81,81,81,81,82,82,82,83,83,83,83,83,84,84,84,84,84,84,84,84,84,84,85,85,86,86,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,93,101,101,101,119],["Low Elapsed Day with Low Sales Stage Change Count",3,3,2,3,3,2,2,3,3,2,2,2,2,3,3,3,3,3,3,3,2,3,3,3,3,3,3,2,2,2,2,2,2,2,3,3,3,2,3,3,2,3,2,2,3,3,3,3,2,3,3,2,3,3,3,2,2,2,3,3,3,3,2,2,3,2,3,3,2,3,3,3,2,2,2,3,3,2,2,2,2,2,2,2,2,3,2,3,3,3,2,3,2,3,3,2,3],["Low Elapsed Day with Low Sales Stage Change Count_x",16,16,16,16,22,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,27,27,35,35,37,39,40,41,44,44,44,44,44,45,45,46,49,50,51,53,55,58,58,58,59,59,60,60,61,61,61,62,62,62,62,62,62,62,62,62,63,64,64,65,65,67,67,68,68,68,68,68],["Low Elapsed Day with High Sales Stage Change Count",8,4,5,4,4,9,7,5,6,4,5,4,6,6,4,5,4,7,4,4,5,5,4,4,4,4,7,4,4,4,5,6,4,5,4,6,4,8,6,4,4,7,6,4,5,4,8,5,5,23,4,6,6,5,4,5,5,7,4,5,4,4,5,4,5,4,5,7,4,7,4,4,5,4,7,4,7,5,4,4,6,6,4,4,4,11,4,5,5,9,4,7,7,4,6,5,4,4,4,5,10],["Low Elapsed Day with High Sales Stage Change Count_x",0,7,16,16,16,16,16,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,36,37,38,41,43,43,43,44,44,44,45,45,45,45,45,47,49,49,49,50,53,54,54,54,55,56,56,57,57,60,60,60,60,60,60,61,62,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,64,65,66,66,66,66,66,66,66,67,67,68,68],["High Elapsed Day with High Sales Stage Change Count",5,6,6,4,5,6,4,4,4,8,4,4,4,4,4,8,5,7,4,5,4,5,5,4,4,4,5,5,7,5,6,4,5,4,4,6,4,8,4,6,4,4,4,4,5,5,11,8,5,4,4,5,5,4,7,4,5,4,4,6,4,5,4,4,4,4,4,6,7,5,4,5,6,4,4,4,5,4,4,4,4,5,4,4,4,4,4,4,5,4,4,8,4,4,4,4],["High Elapsed Day with High Sales Stage Change Count_x",69,69,70,70,71,71,71,71,71,71,72,73,73,73,74,74,74,74,74,74,74,74,75,75,76,76,76,76,77,77,77,79,79,79,79,80,81,81,81,81,81,81,81,81,81,82,83,83,83,84,84,84,84,84,84,85,85,86,86,86,86,86,86,86,87,87,88,88,88,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,92,93,101,110,110,118]]}},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with High Sales Stage Change Count</b>: The Elapsed Day observations from this quadrant are typically from 0 (Revenue),Loss (Opportunity Result) and Car Accessories (Group). It accounts for about 21.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with Low Sales Stage Change Count</b>: Mostly Elapsed Day from 0 (Revenue), Unknown (Competitor Type) and Reseller (Market Route) belong to this segment. They cover nearly 18.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with Low Sales Stage Change Count</b>: Nearly 39.0% of the total observations are from this group and they are generally coming from 0 (Revenue),Loss (Opportunity Result) and Unknown (Competitor Type). </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with High Sales Stage Change Count</b>: Nearly 19.0% of the total observations are from this group and they are generally coming from 0 (Revenue), Unknown (Competitor Type) and Car Accessories (Group). </p>"}],"slug":"sales-stage-change-count-impact-on-elapsed-day-9tjtpctul5","cardWidth":100},{"name":"Key Areas where it Matters","cardType":"normal","cardData":[{"dataType":"html","data":"<h4>Subgroup</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are 11 categories within Subgroup (including Car Electronics, Interior Accessories and Replacement Parts). The following table displays how average Elapsed Day vary across Subgroup and segments of Sales Stage Change Count. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Subgroup has significant influence on Elapsed Day and the impact of Sales Stage Change Count on Elapsed Day shows interesting variations across Subgroup. When Subgroup is Tires & Wheels average Elapsed Day is the highest as well as the impact of Sales Stage Change Count on Elapsed Day,as Elapsed Day decreases by -5.32 units for every unit increase in Sales Stage Change Count. On the other hand, Garage & Car Care Subgroup is the least affected, as it increases Elapsed Day by -0.73 units for one unit increase in Sales Stage Change Count. </p> "},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Batteries & Accessories","Car Electronics","Exterior Accessories","Garage & Car Care","Interior Accessories","Motorcycle Parts","Performance Parts","Replacement Parts","Shelters & RV","Tires & Wheels","Towing & Hitches"],["0.0 to 5.0","73.87","56.69","70.8","60.28","73.62","71.49","73.96","70.39","71.71","79.29","76.68"],["5.0 to 10.0","69.08","44.8","60.21","61.73","63.54","60.64","58.52","61.38","60.7","76.0","63.56"],["20.0 to 25.0","41.0","0.0","57.0","78.0","35.5","56.57","54.5","55.8","23.0","18.0","39.67"],["15.0 to 20.0","0.0","0.0","20.33","0.0","0.0","0.0","0.0","0.0","0.0","0.0","0.0"],["10.0 to 15.0","0.0","0.0","0.0","0.0","0.0","0.0","47.0","0.0","0.0","0.0","0.0"]],"tableType":"heatMap"}},{"dataType":"html","data":" <h4>Deal Size Category</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are 7 categories within Subgroup (including 50k to 100k, 25k to 50k and More than 500k). The following table displays how average Elapsed Day vary across Deal Size Category and segments of Sales Stage Change Count. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> The relationship between Sales Stage Change Count and Elapsed Day is also significantly influenced by Deal Size Category. For instance, Deal Size Category, 50k to 100k seems to have the average Elapsed Day that is higher than the other categories. But, the Less than 10k has the highest influence over Elapsed Day as it decreases by -4.06 for every unit increase in Sales Stage Change Count. However, More than 500k Deal Size Category is the least affected, as it decreases Elapsed Day by -0.58 units for one unit increase in Sales Stage Change Count. </p>"},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","100k to 250k","10k to 25k","250k to 500k","25k to 50k","50k to 100k","Less than 10k","More than 500k"],["0.0 to 5.0","72.84","65.91","72.83","70.26","74.67","64.4","71.76"],["5.0 to 10.0","62.44","58.48","60.69","63.68","63.48","56.37","69.77"],["20.0 to 25.0","62.63","43.0","63.6","55.4","50.86","40.6","0.0"],["15.0 to 20.0","45.0","0.0","16.0","0.0","0.0","0.0","0.0"],["10.0 to 15.0","0.0","0.0","0.0","47.0","0.0","0.0","0.0"]],"tableType":"heatMap"}}],"slug":"key-areas-where-it-matters-729fjt5m0j","cardWidth":100}],"name":"Sales Stage Change Count","slug":"sales-stage-change-count-auomvundf3"},{"listOfNodes":[],"listOfCards":[{"name":"Closing Days: Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Impact of Closing Days on Elapsed Day</h3>"},{"dataType":"html","data":"<h4>Overview</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Closing Days is one of the <b>significant influencer</b> of Elapsed Day and it explains a great magnitude of change in Elapsed Day. It is <b>negatively correlated</b> with the Elapsed Day figures. An incremental unit change in Closing Days corresponds to an average decrease in Elapsed Day by -0.22 units. </p>"},{"dataType":"html","data":"<h3>Sensitivity Analysis</h3> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Closing Days seems to have a remarkable impact on various segments of Elapsed Day observations. The chart above shows four quadrants based on the distribution of Elapsed Day (high vs. low) and marketing cost (high vs. low). </p> "},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":{"r":4},"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Closing Days","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False},"type":"index","extent":None,"label":{"text":"Elapsed Day","position":"outer-center"}}},"data":{"axes":{"Closing Days":"y"},"names":{"#EC640C":"High Elapsed Day with Low Closing Days","#00AEB3":"High Elapsed Day with High Closing Days","#DD2E1F":"Low Elapsed Day with Low Closing Days","#7C5BBB":"Low Elapsed Day with High Closing Days"},"x":None,"xs":{"High Elapsed Day with Low Closing Days":"High Elapsed Day with Low Closing Days_x","Low Elapsed Day with High Closing Days":"Low Elapsed Day with High Closing Days_x","Low Elapsed Day with Low Closing Days":"Low Elapsed Day with Low Closing Days_x","High Elapsed Day with High Closing Days":"High Elapsed Day with High Closing Days_x"},"type":"scatter","columns":[["High Elapsed Day with Low Closing Days",26,10,0,27,11,20,25,22,20,26,23,22,21,26,28,26,22,25,25,21,11,20,27,26,24,21,27,23,22,20,11,17,23,1,7,13,11,22,19,9,5,0,26,27,28,25,20,22,20,8,26,22,26,25,24,21,21,20,18,18,17,13,13,13,13,24,22,20,19,7,16,13,28,27,26,25,23,20,19,1,17,12,11,3,11,11,12,6,15,12,10,18,7,4,6,13,5,0,3],["High Elapsed Day with Low Closing Days_x",71,74,75,76,77,78,79,79,81,81,81,81,81,82,82,82,82,83,83,83,83,83,84,84,84,84,85,85,85,85,85,85,86,86,86,86,86,86,86,87,87,87,88,88,88,88,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,91,92,92,93,93,94,98,100,100,103,110,110,111,119],["Low Elapsed Day with High Closing Days",91,97,106,89,86,108,79,94,92,89,81,87,88,84,77,76,83,81,58,78,75,66,42,67,76,60,61,79,78,73,70,58,58,63,48,67,48,60,59,64,59,72,72,54,52,49,47,61,55,53,54,41,64,62,60,59,59,59,59,58,55,52,52,52,52,52,34,48,46,43,43,43,41,41,41,41,36,42,40,61,52,50,42,39,38,40,33,48,46,38,37,57,39,38,37,34],["Low Elapsed Day with High Closing Days_x",0,7,10,13,15,16,16,16,16,16,16,20,28,31,31,32,32,35,35,36,36,37,40,41,42,42,44,45,45,45,45,46,46,46,47,48,48,49,49,50,50,53,54,54,54,56,57,58,58,60,61,61,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,64,64,64,64,65,65,66,66,67,67,67,67,68,68,68,68,68],["Low Elapsed Day with Low Closing Days",16,0,6,0,0,26,18,4,0,1,24,0,6,20,20,0,3,2,0,9,0,1,12,10,7,0,0,17,15,7,13,9,6,1,4,1,1,5,4,0,0,0,7,4,13,1,2,1,3,0,0,0,2,0,1,0,0,0,0,0,0,6,2,6,0,4,4,0,1,4,5,9,0,6,2,3,0,0,11,0,2,9,20,8,18,28,8,4,17,12,0,2,0,14,0,22],["Low Elapsed Day with Low Closing Days_x",18,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,36,36,42,42,43,44,44,44,44,45,45,45,47,55,59,63,68,68],["High Elapsed Day with High Closing Days",43,39,34,34,50,38,36,43,41,36,33,32,30,47,35,30,42,35,34,34,32,29,36,34,45,42,44,43,34,33,33,41,39,33,37,33,31,30,40,32,31,39,36,36,34,47,43,41,34,32,30,30,30,29,41,39,38,31,29,41,39,37,35,35,31,31,30,30,38,33,29,38,37,36,32,29,37,37,35,34,32,31,31,29,35,34,32,30,30,30,29,32,30,30,29,29,29],["High Elapsed Day with High Closing Days_x",69,69,69,69,70,70,70,71,71,71,72,72,72,73,73,73,74,74,74,74,74,74,75,75,76,76,76,76,76,76,76,77,77,77,77,77,77,77,78,78,78,79,79,80,80,81,81,81,81,81,81,81,82,82,83,83,83,83,83,84,84,84,84,84,84,85,86,86,87,87,87,88,88,88,88,88,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,92]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","table_c3":[["High Elapsed Day with Low Closing Days",26,10,0,27,11,20,25,22,20,26,23,22,21,26,28,26,22,25,25,21,11,20,27,26,24,21,27,23,22,20,11,17,23,1,7,13,11,22,19,9,5,0,26,27,28,25,20,22,20,8,26,22,26,25,24,21,21,20,18,18,17,13,13,13,13,24,22,20,19,7,16,13,28,27,26,25,23,20,19,1,17,12,11,3,11,11,12,6,15,12,10,18,7,4,6,13,5,0,3],["High Elapsed Day with Low Closing Days_x",71,74,75,76,77,78,79,79,81,81,81,81,81,82,82,82,82,83,83,83,83,83,84,84,84,84,85,85,85,85,85,85,86,86,86,86,86,86,86,87,87,87,88,88,88,88,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,91,92,92,93,93,94,98,100,100,103,110,110,111,119],["Low Elapsed Day with High Closing Days",91,97,106,89,86,108,79,94,92,89,81,87,88,84,77,76,83,81,58,78,75,66,42,67,76,60,61,79,78,73,70,58,58,63,48,67,48,60,59,64,59,72,72,54,52,49,47,61,55,53,54,41,64,62,60,59,59,59,59,58,55,52,52,52,52,52,34,48,46,43,43,43,41,41,41,41,36,42,40,61,52,50,42,39,38,40,33,48,46,38,37,57,39,38,37,34],["Low Elapsed Day with High Closing Days_x",0,7,10,13,15,16,16,16,16,16,16,20,28,31,31,32,32,35,35,36,36,37,40,41,42,42,44,45,45,45,45,46,46,46,47,48,48,49,49,50,50,53,54,54,54,56,57,58,58,60,61,61,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,64,64,64,64,65,65,66,66,67,67,67,67,68,68,68,68,68],["Low Elapsed Day with Low Closing Days",16,0,6,0,0,26,18,4,0,1,24,0,6,20,20,0,3,2,0,9,0,1,12,10,7,0,0,17,15,7,13,9,6,1,4,1,1,5,4,0,0,0,7,4,13,1,2,1,3,0,0,0,2,0,1,0,0,0,0,0,0,6,2,6,0,4,4,0,1,4,5,9,0,6,2,3,0,0,11,0,2,9,20,8,18,28,8,4,17,12,0,2,0,14,0,22],["Low Elapsed Day with Low Closing Days_x",18,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,36,36,42,42,43,44,44,44,44,45,45,45,47,55,59,63,68,68],["High Elapsed Day with High Closing Days",43,39,34,34,50,38,36,43,41,36,33,32,30,47,35,30,42,35,34,34,32,29,36,34,45,42,44,43,34,33,33,41,39,33,37,33,31,30,40,32,31,39,36,36,34,47,43,41,34,32,30,30,30,29,41,39,38,31,29,41,39,37,35,35,31,31,30,30,38,33,29,38,37,36,32,29,37,37,35,34,32,31,31,29,35,34,32,30,30,30,29,32,30,30,29,29,29],["High Elapsed Day with High Closing Days_x",69,69,69,69,70,70,70,71,71,71,72,72,72,73,73,73,74,74,74,74,74,74,75,75,76,76,76,76,76,76,76,77,77,77,77,77,77,77,78,78,78,79,79,80,80,81,81,81,81,81,81,81,82,82,83,83,83,83,83,84,84,84,84,84,84,85,86,86,87,87,87,88,88,88,88,88,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,91,91,91,91,91,92]]}},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with High Closing Days</b>: The Elapsed Day observations from this quadrant are typically from Loss (Opportunity Result),0 (Revenue) and Unknown (Competitor Type). It accounts for about 22.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with Low Closing Days</b>: Mostly Elapsed Day from Won (Opportunity Result), 0 (Revenue) and Unknown (Competitor Type) belong to this segment. They cover nearly 16.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with Low Closing Days</b>: Nearly 38.0% of the total observations are from this group and they are generally coming from 0 (Revenue),Loss (Opportunity Result) and Unknown (Competitor Type). </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with High Closing Days</b>: Nearly 22.0% of the total observations are from this group and they are generally coming from Loss (Opportunity Result), 0 (Revenue) and Unknown (Competitor Type). </p>"}],"slug":"closing-days-impact-on-elapsed-day-we089ugd1v","cardWidth":100},{"name":"Key Areas where it Matters","cardType":"normal","cardData":[{"dataType":"html","data":"<h4>Market Route</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are 5 categories within Market Route (including Telesales, Telecoverage and Other). The following table displays how average Elapsed Day vary across Market Route and segments of Closing Days. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Market Route has significant influence on Elapsed Day and the impact of Closing Days on Elapsed Day shows interesting variations across Market Route. Even though the average Elapsed Day from Fields Sales is higher, Closing Days has the highest impact on Telecoverage Market Route, as Elapsed Day decreases by -0.98 units for every unit increase in Closing Days. On the other hand, Reseller Market Route is the least affected, as it increases Elapsed Day by 0.08 units for one unit increase in Closing Days. </p> "},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Fields Sales","Other","Reseller","Telecoverage","Telesales"],["0.0 to 23.0","85.1","77.41","49.6","0.0","83.11"],["23.0 to 46.0","79.71","80.17","75.12","84.33","75.41"],["92.0 to 115.0","60.59","61.22","57.52","53.0","43.0"],["69.0 to 92.0","35.67","37.33","30.28","31.5","32.71"],["46.0 to 69.0","15.13","19.6","15.76","0.0","0.0"],["115.0 to 138.0","10.0","0.0","7.0","0.0","0.0"]],"tableType":"heatMap"}},{"dataType":"html","data":" <h4>Opportunity Result</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are two categories within Market Route (Loss and Won). The following table displays how average Elapsed Day vary across Opportunity Result and segments of Closing Days. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> The relationship between Closing Days and Elapsed Day is also significantly influenced by Opportunity Result. For instance, Opportunity Result, Loss seems to have the average Elapsed Day that is higher than the other categories. The Elapsed Day also seems to be highly influenced at this Loss as it moves down by -0.77 units for every unit increase in Closing Days. However, Won Opportunity Result is the least affected, as it increases Elapsed Day by 0.37 units for one unit increase in Closing Days. </p>"},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Loss","Won"],["0.0 to 23.0","85.38","50.5"],["23.0 to 46.0","78.82","69.54"],["92.0 to 115.0","59.22","53.03"],["69.0 to 92.0","33.24","29.29"],["46.0 to 69.0","16.12","12.83"],["115.0 to 138.0","8.5","0.0"]],"tableType":"heatMap"}}],"slug":"key-areas-where-it-matters-j952c99s2o","cardWidth":100}],"name":"Closing Days","slug":"closing-days-77l6rsk94d"},{"listOfNodes":[],"listOfCards":[{"name":"Qualified Days: Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Impact of Qualified Days on Elapsed Day</h3>"},{"dataType":"html","data":"<h4>Overview</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Qualified Days is one of the <b>significant influencer</b> of Elapsed Day and it explains a great magnitude of change in Elapsed Day. It is <b>negatively correlated</b> with the Elapsed Day figures. An incremental unit change in Qualified Days corresponds to an average decrease in Elapsed Day by -0.2 units. </p>"},{"dataType":"html","data":"<h3>Sensitivity Analysis</h3> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Qualified Days seems to have a remarkable impact on various segments of Elapsed Day observations. The chart above shows four quadrants based on the distribution of Elapsed Day (high vs. low) and marketing cost (high vs. low). </p> "},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":{"r":4},"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Qualified Days","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False},"type":"index","extent":None,"label":{"text":"Elapsed Day","position":"outer-center"}}},"data":{"axes":{"Qualified Days":"y"},"names":{"#EC640C":"High Elapsed Day with Low Qualified Days","#00AEB3":"High Elapsed Day with High Qualified Days","#DD2E1F":"Low Elapsed Day with Low Qualified Days","#7C5BBB":"Low Elapsed Day with High Qualified Days"},"x":None,"xs":{"Low Elapsed Day with Low Qualified Days":"Low Elapsed Day with Low Qualified Days_x","High Elapsed Day with Low Qualified Days":"High Elapsed Day with Low Qualified Days_x","High Elapsed Day with High Qualified Days":"High Elapsed Day with High Qualified Days_x","Low Elapsed Day with High Qualified Days":"Low Elapsed Day with High Qualified Days_x"},"type":"scatter","columns":[["Low Elapsed Day with Low Qualified Days_x",7,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,37,38,42,43,43,43,43,44,45,47,49,49,55,55,57,58,58,58,60,61,61,63,64,66,67,68],["Low Elapsed Day with Low Qualified Days",22,0,2,0,0,26,18,2,0,2,25,2,5,5,20,0,3,0,0,1,0,3,8,1,0,5,6,1,6,4,4,1,5,1,2,5,0,5,9,2,1,0,3,8,3,3,2,0,0,0,0,3,5,2,2,0,2,11,1,2,0,0,6,3,0,1,1,0,7,6,18,10,13,1,8,8,0,4,0,18,19,3,22,26,28,13,0,11,2,20,25,12,0],["High Elapsed Day with Low Qualified Days_x",71,74,77,78,78,78,78,78,79,79,79,80,80,80,80,81,81,81,81,81,82,82,83,83,83,83,83,83,84,84,84,84,84,84,84,84,85,85,86,86,86,86,86,87,87,87,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,101,114,119],["High Elapsed Day with Low Qualified Days",0,22,1,7,28,0,24,24,27,25,25,22,15,25,21,9,24,22,22,21,23,25,9,0,25,25,22,12,27,26,24,21,19,15,20,1,18,18,4,6,24,24,18,26,15,5,11,20,2,15,25,22,22,11,22,20,20,20,20,19,19,18,17,15,9,12,26,24,24,23,24,22,19,16,15,14,24,28,3,27,23,24,22,23,3,21,0,14,18,15,14,14,14,13,13,12,12,5,0],["High Elapsed Day with High Qualified Days_x",69,69,69,69,70,70,70,70,71,71,71,71,72,72,72,72,73,73,73,73,73,74,74,74,74,74,74,74,74,74,75,75,76,76,76,76,76,77,77,77,77,77,78,78,78,78,78,78,78,78,79,79,79,81,81,81,82,82,82,84,84,84,84,85,86,86,86,86,86,86,86,87,87,87,87,88,88,88,88,88,89,89,89,89,89,90,90,90,90,90,91,91,91,91,91,91,91],["High Elapsed Day with High Qualified Days",46,36,33,32,38,36,36,35,49,42,31,40,48,40,39,31,43,41,34,34,29,48,40,31,38,37,36,33,32,30,46,31,49,44,39,36,30,39,37,35,33,30,42,42,36,33,33,33,30,29,37,36,35,47,41,39,36,35,29,41,29,36,31,36,40,38,36,35,34,33,30,39,35,34,33,35,33,32,30,30,35,34,31,31,29,34,31,29,30,30,35,35,33,33,31,29,29],["Low Elapsed Day with High Qualified Days_x",5,10,16,16,16,16,18,25,33,33,33,34,35,37,37,40,41,42,42,43,43,44,44,44,44,45,45,45,46,46,47,49,50,50,51,51,52,52,53,53,53,53,53,54,54,54,55,55,56,56,56,57,58,58,60,60,60,61,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,63,63,63,63,63,64,64,65,65,65,66,67,67,67,68,68,68,68,68,68],["Low Elapsed Day with High Qualified Days",100,106,99,79,99,78,105,77,91,86,70,56,39,73,66,42,80,72,71,41,31,30,75,65,61,79,46,69,60,59,67,35,64,54,66,65,42,57,52,54,55,53,50,72,68,49,42,47,39,49,46,45,67,48,54,48,42,55,64,59,56,52,52,52,50,49,48,43,43,41,41,62,62,41,43,52,44,44,42,40,60,43,50,37,38,34,46,44,36,47,38,39,37,34,34]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","table_c3":[["Low Elapsed Day with Low Qualified Days_x",7,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,37,38,42,43,43,43,43,44,45,47,49,49,55,55,57,58,58,58,60,61,61,63,64,66,67,68],["Low Elapsed Day with Low Qualified Days",22,0,2,0,0,26,18,2,0,2,25,2,5,5,20,0,3,0,0,1,0,3,8,1,0,5,6,1,6,4,4,1,5,1,2,5,0,5,9,2,1,0,3,8,3,3,2,0,0,0,0,3,5,2,2,0,2,11,1,2,0,0,6,3,0,1,1,0,7,6,18,10,13,1,8,8,0,4,0,18,19,3,22,26,28,13,0,11,2,20,25,12,0],["High Elapsed Day with Low Qualified Days_x",71,74,77,78,78,78,78,78,79,79,79,80,80,80,80,81,81,81,81,81,82,82,83,83,83,83,83,83,84,84,84,84,84,84,84,84,85,85,86,86,86,86,86,87,87,87,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,101,114,119],["High Elapsed Day with Low Qualified Days",0,22,1,7,28,0,24,24,27,25,25,22,15,25,21,9,24,22,22,21,23,25,9,0,25,25,22,12,27,26,24,21,19,15,20,1,18,18,4,6,24,24,18,26,15,5,11,20,2,15,25,22,22,11,22,20,20,20,20,19,19,18,17,15,9,12,26,24,24,23,24,22,19,16,15,14,24,28,3,27,23,24,22,23,3,21,0,14,18,15,14,14,14,13,13,12,12,5,0],["High Elapsed Day with High Qualified Days_x",69,69,69,69,70,70,70,70,71,71,71,71,72,72,72,72,73,73,73,73,73,74,74,74,74,74,74,74,74,74,75,75,76,76,76,76,76,77,77,77,77,77,78,78,78,78,78,78,78,78,79,79,79,81,81,81,82,82,82,84,84,84,84,85,86,86,86,86,86,86,86,87,87,87,87,88,88,88,88,88,89,89,89,89,89,90,90,90,90,90,91,91,91,91,91,91,91],["High Elapsed Day with High Qualified Days",46,36,33,32,38,36,36,35,49,42,31,40,48,40,39,31,43,41,34,34,29,48,40,31,38,37,36,33,32,30,46,31,49,44,39,36,30,39,37,35,33,30,42,42,36,33,33,33,30,29,37,36,35,47,41,39,36,35,29,41,29,36,31,36,40,38,36,35,34,33,30,39,35,34,33,35,33,32,30,30,35,34,31,31,29,34,31,29,30,30,35,35,33,33,31,29,29],["Low Elapsed Day with High Qualified Days_x",5,10,16,16,16,16,18,25,33,33,33,34,35,37,37,40,41,42,42,43,43,44,44,44,44,45,45,45,46,46,47,49,50,50,51,51,52,52,53,53,53,53,53,54,54,54,55,55,56,56,56,57,58,58,60,60,60,61,62,62,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,63,63,63,63,63,64,64,65,65,65,66,67,67,67,68,68,68,68,68,68],["Low Elapsed Day with High Qualified Days",100,106,99,79,99,78,105,77,91,86,70,56,39,73,66,42,80,72,71,41,31,30,75,65,61,79,46,69,60,59,67,35,64,54,66,65,42,57,52,54,55,53,50,72,68,49,42,47,39,49,46,45,67,48,54,48,42,55,64,59,56,52,52,52,50,49,48,43,43,41,41,62,62,41,43,52,44,44,42,40,60,43,50,37,38,34,46,44,36,47,38,39,37,34,34]]}},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with High Qualified Days</b>: The Elapsed Day observations from this quadrant are typically from Loss (Opportunity Result),0 (Revenue) and Unknown (Competitor Type). It accounts for about 22.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with Low Qualified Days</b>: Mostly Elapsed Day from Won (Opportunity Result), 0 (Revenue) and Unknown (Competitor Type) belong to this segment. They cover nearly 16.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with Low Qualified Days</b>: Nearly 39.0% of the total observations are from this group and they are generally coming from 0 (Revenue),Loss (Opportunity Result) and Unknown (Competitor Type). </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with High Qualified Days</b>: Nearly 21.0% of the total observations are from this group and they are generally coming from Loss (Opportunity Result), 0 (Revenue) and Unknown (Competitor Type). </p>"}],"slug":"qualified-days-impact-on-elapsed-day-jhbe1gjh1o","cardWidth":100},{"name":"Key Areas where it Matters","cardType":"normal","cardData":[{"dataType":"html","data":"<h4>Market Route</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are 5 categories within Market Route (including Telesales, Telecoverage and Other). The following table displays how average Elapsed Day vary across Market Route and segments of Qualified Days. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Market Route has significant influence on Elapsed Day and the impact of Qualified Days on Elapsed Day shows interesting variations across Market Route. Even though the average Elapsed Day from Fields Sales is higher, Qualified Days has the highest impact on Telecoverage Market Route, as Elapsed Day decreases by -0.98 units for every unit increase in Qualified Days. On the other hand, Reseller Market Route is the least affected, as it increases Elapsed Day by 0.09 units for one unit increase in Qualified Days. </p> "},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Fields Sales","Other","Reseller","Telecoverage","Telesales"],["0.0 to 23.0","84.96","77.58","50.29","0.0","83.11"],["23.0 to 46.0","79.6","80.06","74.88","84.33","75.41"],["92.0 to 115.0","59.87","61.22","57.21","53.0","43.0"],["69.0 to 92.0","35.2","37.33","29.93","31.5","32.71"],["46.0 to 69.0","15.86","19.6","15.64","0.0","0.0"],["115.0 to 138.0","10.0","0.0","7.0","0.0","0.0"]],"tableType":"heatMap"}},{"dataType":"html","data":" <h4>Opportunity Result</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are two categories within Market Route (Loss and Won). The following table displays how average Elapsed Day vary across Opportunity Result and segments of Qualified Days. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> The relationship between Qualified Days and Elapsed Day is also significantly influenced by Opportunity Result. For instance, Opportunity Result, Loss seems to have the average Elapsed Day that is higher than the other categories. The Elapsed Day also seems to be highly influenced at this Loss as it moves down by -0.75 units for every unit increase in Qualified Days. However, Won Opportunity Result is the least affected, as it increases Elapsed Day by 0.42 units for one unit increase in Qualified Days. </p>"},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Loss","Won"],["0.0 to 23.0","85.01","50.95"],["23.0 to 46.0","78.73","68.17"],["92.0 to 115.0","58.99","47.83"],["69.0 to 92.0","32.91","26.5"],["46.0 to 69.0","16.37","10.0"],["115.0 to 138.0","8.5","0.0"]],"tableType":"heatMap"}}],"slug":"key-areas-where-it-matters-nh54qlb3qz","cardWidth":100}],"name":"Qualified Days","slug":"qualified-days-pq9am7wypd"},{"listOfNodes":[],"listOfCards":[{"name":"Amount USD: Impact on Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Impact of Amount USD on Elapsed Day</h3>"},{"dataType":"html","data":"<h4>Overview</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Amount USD is one of the <b>significant influencer</b> of Elapsed Day and it explains a great magnitude of change in Elapsed Day. It is <b>positively correlated</b> with the Elapsed Day figures. </p>"},{"dataType":"html","data":"<h3>Sensitivity Analysis</h3> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Amount USD seems to have a remarkable impact on various segments of Elapsed Day observations. The chart above shows four quadrants based on the distribution of Elapsed Day (high vs. low) and marketing cost (high vs. low). </p> "},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":{"ratio":0.5}},"point":{"r":4},"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Amount USD","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False},"type":"index","extent":None,"label":{"text":"Elapsed Day","position":"outer-center"}}},"data":{"axes":{"Amount USD":"y"},"names":{"#EC640C":"High Elapsed Day with Low Amount USD","#00AEB3":"High Elapsed Day with High Amount USD","#DD2E1F":"Low Elapsed Day with Low Amount USD","#7C5BBB":"Low Elapsed Day with High Amount USD"},"x":None,"xs":{"High Elapsed Day with Low Amount USD":"High Elapsed Day with Low Amount USD_x","Low Elapsed Day with Low Amount USD":"Low Elapsed Day with Low Amount USD_x","Low Elapsed Day with High Amount USD":"Low Elapsed Day with High Amount USD_x","High Elapsed Day with High Amount USD":"High Elapsed Day with High Amount USD_x"},"type":"scatter","columns":[["High Elapsed Day with Low Amount USD_x",69,69,72,72,73,74,75,75,75,76,76,77,78,78,78,78,79,79,79,79,79,81,81,81,81,81,82,83,83,83,83,84,84,84,84,84,84,85,85,85,85,85,86,86,86,86,87,87,88,88,88,88,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,93,94,100,106,110,111,119,121,122],["High Elapsed Day with Low Amount USD",2325,45000,40000,60000,50000,77507,10000,50000,23255,36600,60000,70000,5000,50000,10000,55000,60000,4650,2000,10000,10000,4000,15000,75000,20000,25000,39473,20000,50000,41724,58139,10000,24939,84000,50000,4700,54000,50000,60000,46511,0,34662,17000,36144,55000,6000,15500,16700,8302,68206,50000,17051,20481,54255,5880,54255,35000,10000,10000,62005,18000,50306,19736,75000,1400,15000,30000,41411,30000,31616,25000,1500,4000,20000,20000,7000,20000,3000,61323,25002,51000,80000,75000,30000,25000,10000,59998,5223,79057,50000,25000,20000,11288,72000,15426,11536,4416,50000,5005,10000],["Low Elapsed Day with Low Amount USD_x",5,7,16,16,16,16,16,21,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,27,28,31,36,37,42,43,44,44,44,44,45,45,46,47,47,48,49,49,49,52,52,54,54,54,55,58,59,59,59,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,63,64,64,64,64,65,65,65,67,67,68],["Low Elapsed Day with Low Amount USD",18404,10000,69767,77507,15337,77507,15501,34883,25689,13951,13157,46504,20000,6360,13951,54000,15000,30120,18500,15337,0,27500,20667,3475,14900,1550,37500,51263,17000,2563,57450,60000,31600,10075,27902,34200,40124,18000,9116,8000,7000,12950,9800,34883,12048,60000,77507,3000,58139,50000,50000,14320,31002,7361,6134,27956,13258,26874,30000,35000,0,0,24541,18882,40697,30000,60000,15337,50000,25000,42168,527,130,13000,10000,67484,7361,12269,5000,0,15000,30000,14400,65000,20000,10000,77507,11000,5000,40697,30674,32894,25000,20000,50000,30000,30000,10000,4620,25000],["Low Elapsed Day with High Amount USD_x",7,10,16,16,16,16,16,16,18,20,21,23,23,23,23,23,23,23,23,24,24,24,24,25,27,28,29,30,31,32,33,35,37,37,37,39,39,42,42,43,43,43,43,43,44,44,45,45,45,45,46,46,46,48,48,50,51,52,53,53,54,54,54,54,55,57,57,58,58,58,59,60,60,61,62,62,62,62,62,62,63,63,64,64,64,64,64,65,65,65,65,66,67,67,68],["Low Elapsed Day with High Amount USD",100131,128834,100800,232522,108510,150000,110000,400000,100000,275000,120000,99498,160629,114710,120000,144425,98000,99096,300000,300000,806076,250000,127411,500000,600000,100000,150000,400000,150000,300000,358000,201519,128915,230000,174418,100000,139513,300000,170000,104000,188596,400000,112000,95504,348837,600000,150000,100000,124539,536809,122699,229425,1000000,96385,240963,450000,108000,120000,100000,110000,150000,101000,306748,95000,615000,100000,110000,220000,816250,90000,100000,110000,100000,263157,209302,159509,120481,122699,92105,250000,490000,200000,150000,150000,100000,100000,111750,100000,600000,150000,166000,139000,100000,129000,100000],["High Elapsed Day with High Amount USD_x",69,70,70,71,71,71,72,73,73,73,73,74,74,74,74,74,75,75,75,76,76,76,77,78,79,79,79,79,81,81,81,81,81,81,82,82,82,82,82,83,83,83,84,84,84,84,84,84,84,84,84,85,85,85,86,86,86,86,86,86,88,88,88,88,88,88,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,92,92,92,95,110],["High Elapsed Day with High Amount USD",105000,250000,100000,600000,320000,122699,200000,150000,150000,150000,145000,92024,179503,120000,92000,184049,124011,120000,650000,500000,100000,180722,100000,400000,150000,350000,150000,100000,180000,200000,800000,100000,100000,488000,95000,95000,100000,100000,100000,200000,120000,100000,90000,200000,300000,150000,602409,200000,250000,175000,100000,150000,100000,200000,92024,200000,300000,270000,155014,250000,100000,100000,96385,200000,200000,165000,150000,490126,250000,100000,150000,93008,775073,150000,250000,263526,240270,301500,387536,150000,250000,100000,120000,150000,199000,100000,100000,150000,400000,90000,492838,350000,100000,197674,985092,542000,96000,511627,294698]]},"legend":{"show":True},"size":{"height":340}},"yformat":".2s","table_c3":[["High Elapsed Day with Low Amount USD_x",69,69,72,72,73,74,75,75,75,76,76,77,78,78,78,78,79,79,79,79,79,81,81,81,81,81,82,83,83,83,83,84,84,84,84,84,84,85,85,85,85,85,86,86,86,86,87,87,88,88,88,88,88,88,88,88,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,90,90,90,91,91,91,91,91,91,91,91,91,91,91,91,91,93,94,100,106,110,111,119,121,122],["High Elapsed Day with Low Amount USD",2325,45000,40000,60000,50000,77507,10000,50000,23255,36600,60000,70000,5000,50000,10000,55000,60000,4650,2000,10000,10000,4000,15000,75000,20000,25000,39473,20000,50000,41724,58139,10000,24939,84000,50000,4700,54000,50000,60000,46511,0,34662,17000,36144,55000,6000,15500,16700,8302,68206,50000,17051,20481,54255,5880,54255,35000,10000,10000,62005,18000,50306,19736,75000,1400,15000,30000,41411,30000,31616,25000,1500,4000,20000,20000,7000,20000,3000,61323,25002,51000,80000,75000,30000,25000,10000,59998,5223,79057,50000,25000,20000,11288,72000,15426,11536,4416,50000,5005,10000],["Low Elapsed Day with Low Amount USD_x",5,7,16,16,16,16,16,21,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,27,28,31,36,37,42,43,44,44,44,44,45,45,46,47,47,48,49,49,49,52,52,54,54,54,55,58,59,59,59,62,62,62,62,62,62,62,62,62,62,62,63,63,63,63,63,64,64,64,64,65,65,65,67,67,68],["Low Elapsed Day with Low Amount USD",18404,10000,69767,77507,15337,77507,15501,34883,25689,13951,13157,46504,20000,6360,13951,54000,15000,30120,18500,15337,0,27500,20667,3475,14900,1550,37500,51263,17000,2563,57450,60000,31600,10075,27902,34200,40124,18000,9116,8000,7000,12950,9800,34883,12048,60000,77507,3000,58139,50000,50000,14320,31002,7361,6134,27956,13258,26874,30000,35000,0,0,24541,18882,40697,30000,60000,15337,50000,25000,42168,527,130,13000,10000,67484,7361,12269,5000,0,15000,30000,14400,65000,20000,10000,77507,11000,5000,40697,30674,32894,25000,20000,50000,30000,30000,10000,4620,25000],["Low Elapsed Day with High Amount USD_x",7,10,16,16,16,16,16,16,18,20,21,23,23,23,23,23,23,23,23,24,24,24,24,25,27,28,29,30,31,32,33,35,37,37,37,39,39,42,42,43,43,43,43,43,44,44,45,45,45,45,46,46,46,48,48,50,51,52,53,53,54,54,54,54,55,57,57,58,58,58,59,60,60,61,62,62,62,62,62,62,63,63,64,64,64,64,64,65,65,65,65,66,67,67,68],["Low Elapsed Day with High Amount USD",100131,128834,100800,232522,108510,150000,110000,400000,100000,275000,120000,99498,160629,114710,120000,144425,98000,99096,300000,300000,806076,250000,127411,500000,600000,100000,150000,400000,150000,300000,358000,201519,128915,230000,174418,100000,139513,300000,170000,104000,188596,400000,112000,95504,348837,600000,150000,100000,124539,536809,122699,229425,1000000,96385,240963,450000,108000,120000,100000,110000,150000,101000,306748,95000,615000,100000,110000,220000,816250,90000,100000,110000,100000,263157,209302,159509,120481,122699,92105,250000,490000,200000,150000,150000,100000,100000,111750,100000,600000,150000,166000,139000,100000,129000,100000],["High Elapsed Day with High Amount USD_x",69,70,70,71,71,71,72,73,73,73,73,74,74,74,74,74,75,75,75,76,76,76,77,78,79,79,79,79,81,81,81,81,81,81,82,82,82,82,82,83,83,83,84,84,84,84,84,84,84,84,84,85,85,85,86,86,86,86,86,86,88,88,88,88,88,88,89,89,89,89,89,89,89,89,90,90,90,90,90,90,90,90,90,90,91,91,91,91,91,91,91,91,91,91,92,92,92,95,110],["High Elapsed Day with High Amount USD",105000,250000,100000,600000,320000,122699,200000,150000,150000,150000,145000,92024,179503,120000,92000,184049,124011,120000,650000,500000,100000,180722,100000,400000,150000,350000,150000,100000,180000,200000,800000,100000,100000,488000,95000,95000,100000,100000,100000,200000,120000,100000,90000,200000,300000,150000,602409,200000,250000,175000,100000,150000,100000,200000,92024,200000,300000,270000,155014,250000,100000,100000,96385,200000,200000,165000,150000,490126,250000,100000,150000,93008,775073,150000,250000,263526,240270,301500,387536,150000,250000,100000,120000,150000,199000,100000,100000,150000,400000,90000,492838,350000,100000,197674,985092,542000,96000,511627,294698]]}},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with High Amount USD</b>: The Elapsed Day observations from this quadrant are typically from 0 (Revenue),Loss (Opportunity Result) and Fields Sales (Market Route). It accounts for about 20.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with Low Amount USD</b>: Mostly Elapsed Day from 0 (Revenue), Unknown (Competitor Type) and Reseller (Market Route) belong to this segment. They cover nearly 27.0% of the total population. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>High Elapsed Day with Low Amount USD</b>: Nearly 41.0% of the total observations are from this group and they are generally coming from 0 (Revenue),Loss (Opportunity Result) and Unknown (Competitor Type). </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> <b>Low Elapsed Day with High Amount USD</b>: Nearly 11.0% of the total observations are from this group and they are generally coming from 0 (Revenue), Loss (Opportunity Result) and 100k to 250k (Deal Size Category). </p>"}],"slug":"amount-usd-impact-on-elapsed-day-4vcilixz4y","cardWidth":100},{"name":"Key Areas where it Matters","cardType":"normal","cardData":[{"dataType":"html","data":"<h4>Opportunity Result</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are two categories within Opportunity Result (Loss and Won). The following table displays how average Elapsed Day vary across Opportunity Result and segments of Amount USD. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> Opportunity Result has significant influence on Elapsed Day and the impact of Amount USD on Elapsed Day shows interesting variations across Opportunity Result. When Opportunity Result is Loss average Elapsed Day is the highest as well as the impact of Amount USD on Elapsed Day,as Elapsed Day decreases by -0.0 units for every unit increase in Amount USD. On the other hand, Won Opportunity Result is the least affected, as it increases Elapsed Day by 0.0 units for one unit increase in Amount USD. </p> "},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","Loss","Won"],["0.0 to 200000.0","74.21","51.44"],["200000.0 to 400000.0","72.86","60.61"],["800000.0 to 1000000.0","70.82","56.33"],["600000.0 to 800000.0","69.13","71.85"],["400000.0 to 600000.0","76.71","84.18"],["1000000.0 to 1200000.0","73.63","0.0"]],"tableType":"heatMap"}},{"dataType":"html","data":" <h4>Deal Size Category</h4> "},{"dataType":"html","data":" <p class=\"txt-justify\"> There are 7 categories within Opportunity Result (including 50k to 100k, 25k to 50k and More than 500k). The following table displays how average Elapsed Day vary across Deal Size Category and segments of Amount USD. </p> "},{"dataType":"html","data":" <p class=\"txt-justify\"> The relationship between Amount USD and Elapsed Day is also significantly influenced by Deal Size Category. For instance, Deal Size Category, 50k to 100k seems to have the average Elapsed Day that is higher than the other categories. The Elapsed Day also seems to be highly influenced at this 50k to 100k as it moves down by -0.0 units for every unit increase in Amount USD. However, 100k to 250k Deal Size Category is the least affected, as it decreases Elapsed Day by -0.0 units for one unit increase in Amount USD. </p>"},{"dataType":"table","data":{"topHeader":"Average Elapsed Day","tableData":[["Category","100k to 250k","10k to 25k","250k to 500k","25k to 50k","50k to 100k","Less than 10k","More than 500k"],["0.0 to 200000.0","70.54","64.25","0.0","68.31","72.22","63.03","0.0"],["200000.0 to 400000.0","69.96","0.0","71.07","0.0","0.0","0.0","0.0"],["800000.0 to 1000000.0","0.0","0.0","64.59","0.0","0.0","0.0","67.31"],["600000.0 to 800000.0","0.0","0.0","0.0","0.0","0.0","0.0","70.4"],["400000.0 to 600000.0","0.0","0.0","0.0","0.0","0.0","0.0","81.28"],["1000000.0 to 1200000.0","0.0","0.0","0.0","0.0","0.0","0.0","73.63"]],"tableType":"heatMap"}}],"slug":"key-areas-where-it-matters-y3lfi49fuq","cardWidth":100}],"name":"Amount USD","slug":"amount-usd-o13g5h3v91"}],"listOfCards":[{"name":"Key Influencers","cardType":"normal","cardData":[{"dataType":"html","data":"<h3>Key Measures that affect Elapsed Day</h3>"},{"dataType":"html","data":"<p class=\"txt-justify\"> There are <b>5 measures</b> in the dataset and <b>4 of them</b> (including Sales Stage Change Count, Closing Days,Qualified Days, etc.) have <b>significant influence</b> on Elapsed Day. It implies that these measures explain considerable amount of variation in Elapsed Day figures. The chart below displays the <b>impact of key Measures</b> on Elapsed Day, as measured by effect size. Let us take a deeper look at some of the most important Measures that explain remarkable amount of change in Elapsed Day. </p>"},{"dataType":"c3Chart","data":{"chart_c3":{"bar":{"width":40},"point":None,"color":{"pattern":["#0fc4b5","#005662","#148071","#6cba86","#bcf3a2"]},"tooltip":{"show":True,"format":{"title":".2s"}},"padding":{"top":40},"grid":{"y":{"show":True},"x":{"show":True}},"subchart":None,"axis":{"y":{"tick":{"count":7,"outer":False,"multiline":True,"format":".2s"},"label":{"text":"Change in Elapsed Day per unit increase","position":"outer-middle"}},"x":{"height":90,"tick":{"rotate":-45,"multiline":False,"fit":False,"format":".2s"},"type":"category","label":{"text":"Measure Name","position":"outer-center"}}},"data":{"x":"key","axes":{"value":"y"},"type":"bar","columns":[["value",-2.7674650142141592,-0.21838769348365497,-0.20397520491268703,1.049296306672247e-05],["key","Sales Stage Change Count","Closing Days","Qualified Days","Amount USD"]]},"legend":{"show":False},"size":{"height":340}},"yformat":".2f","table_c3":[["value",-2.7674650142141592,-0.21838769348365497,-0.20397520491268703,1.049296306672247e-05],["key","Sales Stage Change Count","Closing Days","Qualified Days","Amount USD"]],"xdata":["Sales Stage Change Count","Closing Days","Qualified Days","Amount USD"]}}],"slug":"key-influencers-g3exnh2hii","cardWidth":100}],"name":"Influencers","slug":"influencers-jtm4rgp7vo"},{"listOfNodes":[],"listOfCards":[{"name":"Predicting key drivers of Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"<p class=\"txt-justify\"> The <b>decision tree diagram</b> helps us identify the key variables that explains categorization of Elapsed Day. It showcases the <b>key variable</b> and how it influences classification of observations into specific Elapsed Day. </p>"},{"dataType":"tree","data":{"name":"Root","children":[{"name":"Closing Days <= 37.0","children":[{"name":"Opportunity Result in (Loss)","children":[{"name":"Closing Days <= 32.0","children":[{"name":"Predict: High"}]},{"name":"Closing Days > 32.0","children":[{"name":"Predict: High"}]}]},{"name":"Opportunity Result not in (Loss)","children":[{"name":"Market Route in (Telesales,Reseller)","children":[{"name":"Predict: Low"}]},{"name":"Market Route not in (Telesales,Reseller)","children":[{"name":"Predict: High"}]}]}]},{"name":"Closing Days > 37.0","children":[{"name":"Closing Days <= 59.0","children":[{"name":"Closing Days <= 45.0","children":[{"name":"Predict: Medium"}]},{"name":"Closing Days > 45.0","children":[{"name":"Predict: Medium"}]}]},{"name":"Closing Days > 59.0","children":[{"name":"Sales Stage Change Count <= 4.0","children":[{"name":"Predict: Medium"}]},{"name":"Sales Stage Change Count > 4.0","children":[{"name":"Predict: Low"}]}]}]}]}},{"dataType":"table","data":{"tableType":"decisionTreeTable","tableData":[["PREDICTION","RULES","PERCENTAGE"],["High",["Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days <= 32.0","Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days > 32.0","Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route not in (Telesales,Reseller)"],[93.09,69.98,65.67]],["Medium",["Closing Days > 37.0,Closing Days <= 59.0,Closing Days <= 45.0","Closing Days > 37.0,Closing Days <= 59.0,Closing Days > 45.0","Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count <= 4.0"],[59.03,86.34,56.82]],["Low",["Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route in (Telesales,Reseller)","Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count > 4.0"],[73.77,65.56]]]}}],"slug":"predicting-key-drivers-of-elapsed-day-m5bttb8un0","cardWidth":100},{"name":"Decision Rules of Elapsed Day","cardType":"normal","cardData":[{"dataType":"html","data":"Most Significant Rules for Price :"},{"dataType":"dropdown","data":{"High":["If the value of Closing Days is less than or equal to 32.0, the Opportunity Result falls among (Loss),  it is <b>93%</b> likely that the observations are High segment.","Nearly <b>69%</b> of observations that have the value of Closing Days falls between 32.0 and 37.0, the Opportunity Result falls among (Loss),  result in High elapsed day values.","If the value of Closing Days is less than or equal to 37.0, the Opportunity Result does not fall in (Loss), the Market Route does not fall in (Telesales,Reseller),  then there is <b>65%</b> probability that the elapsed day observations would be High valued."],"Medium":["If the value of Closing Days falls between 37.0 and 45.0,  it is <b>59%</b> likely that the observations are Medium segment.","When the value of Closing Days falls between 45.0 and 59.0,  the probability of Medium is <b>86%</b>.","There is a very high chance(<b>56%</b>) that elapsed day would be relatively Medium when, the value of Closing Days is greater than 59.0, the value of Sales Stage Change Count is less than or equal to 4.0."],"Low":["If the value of Closing Days is less than or equal to 37.0, the Opportunity Result does not fall in (Loss), the Market Route falls among (Telesales,Reseller),  it is <b>73%</b> likely that the observations are Low segment.","If the value of Closing Days is greater than 59.0, the value of Sales Stage Change Count is greater than 4.0,  it is <b>65%</b> likely that the observations are Low segment."]}}],"slug":"decision-rules-of-elapsed-day-sgq9v8kp69","cardWidth":100}],"name":"Prediction","slug":"prediction-d4mnv0h6pp"}],"listOfCards":[{"cardWidth":100,"cardType":"summary","cardData":{"noOfMeasures":5,"quotesHtml":None,"summaryHtml":[{"dataType":"html","data":"<p class = \"lead txt-justify\"> mAdvisor has analyzed the dataset and it contains<b> 15</b> variables and <b>5,000</b> observations. Please click next to find the insights from our analysis of <b>elapsed day</b> factoring the other variables. </p>"}],"noOfTimeDimensions":0,"noOfDimensions":10},"name":"Summary","slug":"summary-fwarnqocl5"}],"name":"Overview","slug":"overview-433vfzasy3"},"created_at":"2017-09-07T11:18:32.077000Z","updated_at":"2017-09-07T11:25:13.048000Z","deleted":False,"bookmarked":False,"status":"SUCCESS","dataset":"opportunity_traincsv-c2haowjs6p","created_by":{"username":"pravallika","first_name":"","last_name":"","email":"","date_joined":"2017-08-21T12:49:35.442000Z","last_login":None,"is_superuser":False},"job":800,"dataset_name":"Opportunity_train.csv","message":None}