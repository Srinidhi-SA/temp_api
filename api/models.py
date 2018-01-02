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

from StockAdvisor.crawling.common_utils import get_regex
from StockAdvisor.crawling.crawl_util import crawl_extract, \
    generate_urls_for_crawl_news, \
    convert_crawled_data_to_metadata_format, \
    generate_urls_for_historic_data
from api.helper import convert_json_object_into_list_of_object
from api.lib import hadoop, fab_helper

THIS_SERVER_DETAILS = settings.THIS_SERVER_DETAILS
from auditlog.registry import auditlog

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
    command_array = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    deleted = models.BooleanField(default=False)
    submitted_by = models.ForeignKey(User, null=False)
    error_report = models.TextField(default="{}")

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Job, self).save(*args, **kwargs)

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.job_type, self.created_at, self.slug]])

    def kill(self):
        from api.yarn_job_api import kill_application, kill_application_using_fabric
        # return kill_application(self.url)
        return kill_application_using_fabric(self.url)

    def start(self):
        command_array = json.loads(self.command_array)
        from api.yarn_job_api import start_yarn_application_again
        newly_spawned_job = start_yarn_application_again(
            command_array=command_array
        )
        self.url = newly_spawned_job.get('application_id')
        original_object = None
        if self.job_type in ["metadata", "subSetting"]:
            original_object = Dataset.objects.get(slug=self.object_id)
        elif self.job_type == "master":
            original_object = Insight.objects.get(slug=self.object_id)
        elif self.job_type == "model":
            original_object = Trainer.objects.get(slug=self.object_id)
        elif self.job_type == 'score':
            original_object = Score.objects.get(slug=self.object_id)
        elif self.job_type == 'robo':
            original_object = Robo.objects.get(slug=self.object_id)
        elif self.job_type == 'stockAdvisor':
            original_object = StockDataset.objects.get(slug=self.object_id)
        else:
            print "No where to write"

        if original_object is not None:
            original_object.status = 'INPROGRESS'
            original_object.save()

        self.save()

    def update_status(self):
        import yarn_api_client
        ym = yarn_api_client.resource_manager.ResourceManager(address=settings.YARN.get("host"),
                                                              port=settings.YARN.get("port"),
                                                              timeout=settings.YARN.get("timeout"))
        app_status = ym.cluster_application(self.url)

        self.status = app_status.data['app']["state"]
        self.save()


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
            original_metadata_url_info

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
        if original_metadata_url_info:
            jobConfig = self.add_previous_dataset_metadata_url_info(
                original_metadata_url_info=original_metadata_url_info,
                jobConfig=jobConfig
            )

        job = job_submission(
            instance=self,
            jobConfig=jobConfig,
            job_type='subSetting'
        )

        self.job = job

        if job is None:
            self.status = "FAILED"
            # self.status = "INPROGRESS"
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

    def add_previous_dataset_metadata_url_info(self, original_metadata_url_info, jobConfig):

        if "FILE_SETTINGS" in jobConfig["config"]:
            jobConfig["config"]["FILE_SETTINGS"]['metadata'] = original_metadata_url_info

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

    def get_number_of_row_size(self):
        config = self.get_config()
        if 'metaData' in config:
            metad = config['metaData']
            for data in metad:
                if 'displayName' not in data:
                    continue
                if data['displayName'] == 'Rows':
                    return int(data['value'])
        return -1

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

    def get_metadata_url_config(self):
        ip_port = "{0}:{1}".format(THIS_SERVER_DETAILS.get('host'),
                                   THIS_SERVER_DETAILS.get('port'))
        url = "/api/get_metadata_for_mlscripts/"
        slug_list = [
            self.slug
        ]
        return {
            "url": ip_port + url,
            "slug_list": slug_list
        }


class Insight(models.Model):
    name = models.CharField(max_length=300, null=True)
    slug = models.SlugField(null=False, blank=True, max_length=300)
    type = models.CharField(max_length=300, null=True)  # dimension/measure
    target_column = models.CharField(max_length=300, null=True, blank=True)

    dataset = models.ForeignKey(Dataset, null=True)  # get all dataset related detail

    compare_with = models.CharField(max_length=300, default="", null=True, blank=True)
    compare_type = models.CharField(max_length=300, null=True, blank=True)
    column_data_raw = models.TextField(default="{}")
    config = models.TextField(default="{}")

    live_status = models.CharField(max_length=300, default='0', choices=STATUS_CHOICES)
    analysis_done = models.BooleanField(default=False)
    # state -> job submitted, job started, job ...

    data = models.TextField(default="{}")

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, db_index=True)
    created_by = models.ForeignKey(User, null=False, db_index=True)
    deleted = models.BooleanField(default=False)

    bookmarked = models.BooleanField(default=False)

    job = models.ForeignKey(Job, null=True)
    status = models.CharField(max_length=100, null=True, default="Not Registered")
    viewed = models.BooleanField(default=False)

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

    def create(self, *args, **kwargs):
        self.add_to_job(*args, **kwargs)

    def add_to_job(self, *args, **kwargs):

        jobConfig = self.generate_config(*args, **kwargs)
        print "Dataset realted config genarated."
        print jobConfig

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
            'customAnalysisDetails': config.get('customAnalysisDetails', []),
            'polarity': config.get('polarity', [])
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

        script_to_run = []
        analysis = advanced_settings['analysis']
        for data in analysis:
            if data['status'] == True:
                script_to_run.append(REVERSE_ANALYSIS_LIST[data['name']])

        if len(script_to_run) < 1:
            script_to_run = default_scripts_to_run

        return {
            'script_to_run': script_to_run,
            'inputfile': [self.dataset.get_input_file()],
            'metadata': self.dataset.get_metadata_url_config()
        }

    def create_configuration_column_settings(self):
        analysis_type = [self.type]
        result_column = [self.target_column]

        ret = {
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

    def get_list_of_scripts_to_run(self, analysis_list):
        analysis_list_sequence = settings.ANALYSIS_LIST_SEQUENCE
        temp_list = []
        for item in analysis_list_sequence:
            if item in analysis_list:
                temp_list.append(item)
        return temp_list

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
                try:
                    brief_info.update({
                        'analysis list': set(file_setting.get('script_to_run'))
                    })
                except:
                    brief_info.update({
                        'analysis list': []
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
        train_test_split = float(config.get('trainValue')) / 100
        return {
            'inputfile': [self.dataset.get_input_file()],
            'modelpath': [self.slug],
            'train_test_split': [train_test_split],
            'analysis_type': ['training'],
            'metadata': self.dataset.get_metadata_url_config()
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
    dataset = models.ForeignKey(Dataset, null=False, default="")
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
        labelMappingDictAll = model_config_from_results.get('labelMappingDict',None)
        # algorithmslug = 'f77631ce2ab24cf78c55bb6a5fce4db8rf'

        modelfeatures = modelFeaturesDict.get(algorithmslug, None)
        if labelMappingDictAll != None:
            labelMappingDict = labelMappingDictAll.get(algorithmslug, None)
        else:
            labelMappingDict = None

        return {
            'inputfile': [self.dataset.get_input_file()],
            'modelpath': [trainer_slug],
            'scorepath': [score_slug],
            'analysis_type': ['score'],
            'levelcounts': targetVariableLevelcount if targetVariableLevelcount is not None else [],
            'algorithmslug': [algorithmslug],
            'modelfeatures': modelfeatures if modelfeatures is not None else [],
            'metadata': self.dataset.get_metadata_url_config(),
            'labelMappingDict':[labelMappingDict]
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

        # app_id = config.get('app_id', 1)
        app_id = self.trainer.app_id
        self.app_id = app_id
        self.save()

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
                'model': self.trainer.name
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


class CustomApps(models.Model):
    app_id = models.IntegerField(null=False)
    name = models.CharField(max_length=300, null=False, default="App")
    slug = models.SlugField(null=False, blank=True, max_length=300)
    displayName = models.CharField(max_length=300, null=True, default="App")
    description = models.CharField(max_length=300, null=True)
    tags = models.CharField(max_length=500, null=True)
    iconName = models.CharField(max_length=300, null=True)
    app_url = models.CharField(max_length=300, null=True)
    # data = models.TextField(default="{}")
    # model_data = models.TextField(default="{}")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    # updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    # deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=100, null=True, default="Inactive")

    class Meta:
        ordering = ['app_id']

    def __str__(self):
        return " : ".join(["{}".format(x) for x in [self.name, self.slug, self.app_id]])

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.name + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(CustomApps, self).save(*args, **kwargs)

    def create(self, *args, **kwargs):
        self.add_to_job()

    def generate_config(self, *args, **kwargs):
        return {

        }

    def add_to_job(self, *args, **kwargs):
        # jobConfig = self.generate_config(*args, **kwargs)

        # job = job_submission(
        #     instance=self,
        #     jobConfig=jobConfig,
        #     job_type='robo'
        # )
        #
        # self.job = job
        # if job is None:
        #     self.status = "FAILED"
        # else:
        #     self.status = "INPROGRESS"
        print "create app is called!"
        self.status = "Active"
        self.save()

        # def get_brief_info(self):
        #     brief_info = dict()
        #     brief_info.update(
        #         {
        #             'created_by': self.created_by.username,
        #         })
        #     return convert_json_object_into_list_of_object(brief_info, 'apps')


auditlog.register(Dataset)
auditlog.register(Insight)
auditlog.register(Robo)
auditlog.register(Trainer)
auditlog.register(CustomApps)


def job_submission(instance=None, jobConfig=None, job_type=None):
    """Submit job to jobserver"""
    # Job Book Keeping
    job = Job()
    job.name = "-".join([job_type, instance.slug])
    job.job_type = job_type
    job.object_id = str(instance.slug)
    job.submitted_by = instance.created_by

    if jobConfig is None:
        jobConfig = json.loads(instance.config)
    job.config = json.dumps(jobConfig)
    job.save()

    print "Job entry created in db. Now going to submit job to job server."

    queue_name = None
    try:
        data_size = None
        if job_type in ['metadata', 'subSetting']:
            data_size = instance.get_number_of_row_size()
        elif job_type in ['master', 'model', 'score']:
            data_size = instance.dataset.get_number_of_row_size()

        queue_name = get_queue_to_use(job_type=job_type, data_size=data_size)
    except Exception as e:
        print e
        print "ignoring the exception and continue"

    if not queue_name:
        queue_name = "default"

    '''
    job_type = {
            "metadata": "metaData",
            "master": "story",
            "model":"training",
            "score": "prediction",
            "robo": "robo",
            "subSetting": "subSetting",
            "stockAdvisor": "stockAdvisor"
        }
    '''
    # Submitting JobServer
    from utils import submit_job
    from smtp_email import send_alert_through_email
    try:
        job_return_data = submit_job(
            slug=job.slug,
            class_name=job_type,
            job_config=jobConfig,
            job_name=instance.name,
            message_slug=get_message_slug(instance),
            queue_name=queue_name
        )
        print "Job submitted."

        job.url = job_return_data.get('application_id')
        job.command_array = json.dumps(job_return_data.get('command_array'))
        job.config = json.dumps(job_return_data.get('config'))
        job.save()
    except Exception as exc:
        print "#" * 100
        print "Unable to submit job. Could be some issue with job server please check"
        print "#" * 100
        print exc
        send_alert_through_email(exc)
        return None

    return job


def get_queue_deployment_env_name():
    return settings.DEPLOYMENT_ENV


def get_queue_job_type_name(job_type):
    return "." + get_queue_deployment_env_name() + '-' + settings.YARN_QUEUE_NAMES.get(job_type)


def get_queue_to_use(job_type, data_size=None):
    return get_queue_deployment_env_name() + '-' + settings.YARN_QUEUE_NAMES.get(job_type) + get_queue_size_name(
        job_type, data_size)


def get_queue_size_name(job_type, data_size):
    job_type = job_type.lower()
    if job_type in ['metadata', 'subsetting', 'score', 'stockadvisor']:
        return ''

    data_size_name = None
    if data_size < settings.DATASET_ROW_SIZE_LIMITS.get('small'):
        data_size_name = 'small'
    elif data_size < settings.DATASET_ROW_SIZE_LIMITS.get('medium'):
        data_size_name = 'medium'
    else:
        data_size_name = 'large'
    if data_size_name:
        return "-" + data_size_name
    else:
        return ''


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
                "STOCK_SETTINGS": {
                    "stockSymbolList": stockSymbolList,
                    "dataAPI": data_api  # + "?" + 'stockDataType = "bluemix"' + '&' + 'stockName = "googl"'
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

combo_chart = {
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
                17.51824817518248,
                8.860759493670885,
                20.297029702970296,
                42.30769230769231,
                0
            ],
            [
                "total",
                72,
                7,
                41,
                11,
                0
            ],
            [
                "key",
                "0 to 3.4",
                "3.4 to 6.8",
                "6.8 to 10.2",
                "10.2 to 13.6",
                "13.6 to 17"
            ]
        ],
        "x": "key",
        "type": "combination",
        "types": {
            "percentage": "line",
            "total": "bar"
        },
        "names": {
            "percentage": "% of Travel_Frequently",
            "total": "# of Travel_Frequently"
        }
    },
    "legend": {
        "show": True
    },
    "size": {
        "height": 340
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

word_cloud = {
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
            ["Category", "Batteries & Accessories", "Car Electronics", "Exterior Accessories", "Garage & Car Care",
             "Interior Accessories", "Motorcycle Parts", "Performance Parts", "Replacement Parts", "Shelters & RV",
             "Tires & Wheels", "Towing & Hitches"],
            ["0.0 to 5.0", "73.87", "56.69", "70.8", "60.28", "73.62", "71.49", "73.96", "70.39", "71.71", "79.29",
             "76.68"],
            ["5.0 to 10.0", "69.08", "44.8", "60.21", "61.73", "63.54", "60.64", "58.52", "61.38", "60.7", "76.0",
             "63.56"],
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
            ["High", ["Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days <= 32.0",
                      "Closing Days <= 37.0,Opportunity Result in (Loss),Closing Days > 32.0",
                      "Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route not in (Telesales,Reseller)"],
             [93.09, 69.98, 65.67]
             ],
            ["Medium", ["Closing Days > 37.0,Closing Days <= 59.0,Closing Days <= 45.0",
                        "Closing Days > 37.0,Closing Days <= 59.0,Closing Days > 45.0",
                        "Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count <= 4.0"],
             [59.03, 86.34, 56.82]
             ],
            ["Low", ["Closing Days <= 37.0,Opportunity Result not in (Loss),Market Route in (Telesales,Reseller)",
                     "Closing Days > 37.0,Closing Days > 59.0,Sales Stage Change Count > 4.0"],
             [73.77, 65.56]
             ]
        ]
    }
}


def change_html_data(content=''):
    return {
        "dataType": "html",
        "data": content
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
                'databox',  # databox_chart
                'articles_and_sentiments_by_source',  # horizontal_bar_chart,
                'articles_and_sentiments_by_concepts',  # horizontal_bar_chart,
                'stock_performance_vs_sentiment_score',  # line_chart,
                # 'statistical_significance_of_keywords', # bar_chart,
                # 'top_entities', # word_cloud
                'stock_word_cloud_title',
                'stock_word_cloud'
            ]
        },
        {
            "cardType": "normal",
            "name": "node2-card2",
            "slug": "node2-card2",
            "cardData": [
                'decisionTreeTable_title',
                'decisionTreeTable',  # decisionTreeTable
                'key_events_title',
                'key_events',
            ]
        }, {
            "cardType": "normal",
            "name": "node2-card3",
            "slug": "node2-card3",
            "cardData": [
                'sentiments_by_concepts_title',
                'sentiments_by_concepts',  # decisionTreeTable
                'factors_that_impact_stock_price',
            ]
        },
        # {
        #     "cardType": "normal",
        #     "name": "node2-card2",
        #     "slug": "node2-card2",
        #     "cardData": [
        #         # 'html_random'# 'top_positive_and_negative_statement', # table2,
        #         # 'articles_with_highest_and_lowest_sentiments_score', #table2
        #     ]
        # },
        # {
        #     "cardType": "normal",
        #     "name": "node2-card3",
        #     "slug": "node2-card3",
        #     "cardData": [
        #         # 'html_random' # "segment_by_concept_and_keyword", # heat_map,
        #         # 'key_parameter_that_impact_stock_prices', # bar_chart
        #     ]
        # }
    ],
    "name": "",
    "slug": ""
}

import copy


def make_combochart(data, chart, x=None, axes=None, widthPercent=None, title=None):
    t_chart = set_axis_and_data(axes, chart, data, x)
    set_label_and_title(axes, t_chart, title, widthPercent, x)
    if len(axes.keys()) > 1:
        t_chart["data"]["chart_c3"]["data"]["types"] = {axes.keys()[1]: "line"}

    make_y2axis(axes, t_chart)
    return t_chart


def make_y2axis(axes, t_chart):
    if len(axes.keys()) > 1:
        t_chart["data"]["chart_c3"]["axis"]["y2"] = {
            "show": True,
            "tick": {
                "count": 7,
                "multiline": True,
                "format": ".2s"
            },
            "label": {
                "text": axes.keys()[1],
                "position": "outer-middle"
            }
        }
        t_chart["data"]["y2format"] = ".2s"


def set_axis_and_data(axes, chart, data, x):
    t_chart = copy.deepcopy(chart)
    t_chart["data"]["chart_c3"]["data"]["columns"] = data
    t_chart["data"]["chart_c3"]["data"]["x"] = x
    t_chart["data"]["chart_c3"]["data"]["axes"] = axes
    t_chart["data"]["xdata"] = data[0][1:]
    t_chart["data"]["table_c3"] = data
    return t_chart


def change_data_in_chart(data, chart, x=None, axes=None, widthPercent=None, title=None):
    t_chart = set_axis_and_data(axes, chart, data, x)
    set_label_and_title(axes, t_chart, title, widthPercent, x)

    make_y2axis(axes, t_chart)

    return t_chart


def change_data_in_chart_time_series(data, chart, x=None, axes=None, widthPercent=None, title=None):
    t_chart = change_data_in_chart(data, chart, x, axes, widthPercent, title)
    t_chart["axis"] = {"x": {
        'type': 'timeseries',
        'tick': {
            'format': '%d-%m-%Y'
        }
    }}
    return t_chart


def change_data_in_chart_no_zoom(data, chart, x=None, axes=None, widthPercent=None, title=None):
    t_chart = set_axis_and_data(axes, chart, data, x)
    set_label_and_title(axes, t_chart, title, widthPercent, x)

    make_y2axis(axes, t_chart)

    t_chart["data"]["chart_c3"]["subchart"] = None
    return t_chart


def set_label_and_title(axes, chart, title, widthPercent, x):
    if title:
        chart["data"]["chart_c3"]["title"] = {"text": title}
    if x:
        chart["data"]["chart_c3"]["axis"]["x"]["label"]["text"] = x
    if axes:
        chart["data"]["chart_c3"]["axis"]["y"]["label"]["text"] = axes.keys()[0]
    if widthPercent is not None:
        chart["widthPercent"] = widthPercent


def change_data_in_pie_chart(data, chart, widthPercent=None, title=None):
    import copy
    chart = copy.deepcopy(chart)
    chart["data"]["chart_c3"]["data"]["columns"] = data
    chart["data"]["table_c3"] = data

    if title:
        chart["data"]["chart_c3"]["title"] = {"text": title}

    if widthPercent is not None:
        chart["widthPercent"] = widthPercent

    return chart


def change_data_in_databox(data, databox):
    import copy
    databox = copy.deepcopy(databox)
    databox["data"] = data
    return databox


def change_data_in_wordcloud(data, wordcloud=None):
    if wordcloud:
        import copy
        t_wordcloud = copy.deepcopy(wordcloud)
    else:
        t_wordcloud = {
            "dataType": "wordCloud",
            "data": None
        }

    t_wordcloud['data'] = data
    return t_wordcloud


def change_data_inheatmap(data):
    return data


def change_data_in_table(data):
    return {
        "dataType": "table",
        "data": {
            "tableData": data,
            "tableType": "normal",
        }
    }


def change_data_in_decision_tree_table(data):
    return {"dataType": "table", "data": {"tableType": "decisionTreeTable", "tableData": data}}
    pass


def change_data_in_heatmap(data):
    return {
        "dataType": "table",
        "data": {
            "tableData": data,
            "tableType": "textHeatMapTable",
        }
    }

    pass


def change_name_and_slug_in_individual(name):
    card_name = ["Analysis Overview", "Event Analysis", "Impact Analysis"]
    # temp_node = copy.deepcopy(individual_company)
    import copy
    temp_node = copy.deepcopy(individual_company)
    temp_node['name'] = name
    temp_node['slug'] = name
    listOfCards = temp_node['listOfCards']
    new_list_of_cards = []
    final_list_of_cards = []
    for i, cards in enumerate(listOfCards):
        this_card = {}
        cards["name"] = card_name[i]
        cards["slug"] = card_name[i] + ''.join(
            random.choice(string.ascii_uppercase + string.digits) for _ in range(5))

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
                chart = make_combochart(
                    data=details_data[cardD],
                    chart=horizontal_bar_chart,
                    x="Source",
                    axes={"No. of Articles": "y", "Average Sentiment Score": "y2"},
                    widthPercent=50,
                    title="Sentiment Score by Source"
                )
            if cardD == "articles_and_sentiments_by_concepts":
                chart = make_combochart(
                    data=details_data[cardD],
                    chart=horizontal_bar_chart,
                    x="Concept",
                    axes={"No. of Articles": "y", 'Average Sentiment Score': "y2"},
                    widthPercent=50,
                    title="Sentiment Score by Concept"

                )
            if cardD == 'stock_performance_vs_sentiment_score':
                chart = change_data_in_chart_time_series(
                    data=details_data[cardD],
                    chart=line_chart,
                    x="Date",
                    axes={'Stock Value': 'y', 'Sentiment Score': 'y2'},
                    widthPercent=100,
                    title="Stock Performance Vs Sentiment Score"
                )
            if cardD == 'statistical_significance_of_concepts':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=bar_chart,
                    x="Score",
                    axes={"Avg. Sentiment Score": "y"},
                    widthPercent=100
                )
            if cardD == 'top_keywords':
                chart = change_data_in_wordcloud(
                    data=details_data[cardD],
                    wordcloud=word_cloud
                )
            # if cardD == "stock_performance_vs_sentiment_score":
            #     chart = change_data_inheatmap(details_data[cardD])
            if cardD == 'key_parameter_that_impact_stock_prices':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=bar_chart,
                    x="Score",
                    axes={"Avg. Sentiment Score": "y"},
                    widthPercent=100
                )
            if cardD == "segment_by_concept_and_keyword":
                chart = change_data_inheatmap(details_data[cardD])
            if cardD in ['top_positive_and_negative_statement']:
                chart = change_data_in_table(details_data[cardD])

            if cardD == 'html_random':
                chart = change_html_data('<p><h2>{}</h2>{}</p>'.format("Test", "Test content"))
                return chart

            if cardD == "stock_word_cloud":
                chart = change_data_in_wordcloud(details_data[cardD])

            if cardD == "stock_word_cloud_title":
                chart = change_html_data("<h3>Top Entities</h3>")
            if cardD == "decisionTreeTable_title":
                chart = change_html_data("<h3>Key Days and Impactful Articles</h3>")
            if cardD == "key_events_title":
                chart = change_html_data("<h3>Top Articles</h3>")

            if cardD == 'decisionTreeTable':
                chart = change_data_in_table(details_data[cardD])

            if cardD == "key_events":
                chart = change_data_in_table(details_data[cardD])

            if cardD == "sentiments_by_concepts_title":
                chart = change_html_data("<h3>Sentiment by Concept</h3>")

            if cardD == 'sentiments_by_concepts':
                chart = change_data_in_heatmap(details_data[cardD])

            if cardD == 'factors_that_impact_stock_price':
                chart = change_data_in_chart(
                    data=details_data[cardD],
                    chart=bar_chart,
                    x="Key Factors",
                    axes={"Correlation Coefficient": "y"},
                    widthPercent=100,
                    title="Factors Influencing Stock Price"
                )

            if chart is not None:
                temp_card_data.append(chart)

        cards['cardData'] = temp_card_data
        new_list_of_cards.append(cards)

    temp_node['listOfCards'] = new_list_of_cards

    return temp_node


def smaller_name_and_slug_in_individual(name):
    # import copy
    # temp_node = copy.deepcopy(individual_company)
    temp_node = {}
    temp_node['name'] = name
    temp_node['slug'] = name

    card_1 = {
        "cardType": "normal",
        "name": "node2-caasdasd",
        "slug": "node2-card2asda",
        "cardData": [
            change_html_data(
                '<br/><br/><div style="text-align:center"><h2>{}</h2></div><br/><br/>'.format(text_overview)),

            change_data_in_databox(
                data=overview_of_second_node_databox_data,
                databox=databox_chart
            )
        ]
    }

    return card_1


node1_databox_data = [{
    "name": "Total Articles",
    "value": "583"
}, {
    "name": "Total Sources",
    "value": "68"
}, {
    "name": "Average Sentiment Score",
    "value": "0.27"
}, {
    "name": "Overall Stock % Change",
    "value": "3.2 %"
}, {
    "name": "Max Increase in Price",
    "value": "13.4% (FB)"
}, {
    "name": "Max Decrease in Price",
    "value": "-2.0% (AMZN)"
}]

number_of_articles_by_stock = [
    ['Stock', "FB", "GOOGL", "IBM", "AMZN", "AAPL"],
    ['No. of Articles', 92, 94, 71, 128, 101]
]

article_by_source1 = [
    ['Source', '24/7 Wall St.', '9to5Mac', 'Amigobulls', 'Argus Journal', 'Benzinga', 'Bloomberg', 'Bloomberg BNA',
     'Business Wire (press release)', 'BZ Weekly', 'Crains Detroit Business', 'DirectorsTalk Interviews',
     'Dispatch Tribunal', 'Economic News', 'Engadget', 'Equities.com', 'Forbes', 'Fox News', 'GuruFocus.com',
     'GuruFocus.com (blog)', 'Inc.com', 'insideBIGDATA', 'Investopedia (blog)', 'Investorplace.com',
     'Investorplace.com (blog)', 'LearnBonds', 'Library For Smart Investors', 'Live Trading News', 'Los Angeles Times',
     'Madison.com', 'Market Exclusive', 'MarketWatch', 'Motley Fool', 'Nasdaq', 'NBC Southern California',
     'New York Law Journal (registration)', 'NY Stock News', 'Post Analyst', 'PR Newswire (press release)',
     'Proactive Investors UK', 'Reuters', 'Reuters Key Development', 'Reuters.com', 'San Antonio Business Journal',
     'Seeking Alpha', 'Silicon Valley Business Journal', 'Simply Wall St', 'Stock Press Daily', 'Stock Talker',
     'StockNews.com (blog)', 'StockNewsGazette', 'StockNewsJournal', 'Street Observer (press release)',
     'The Ledger Gazette', 'The Recorder', 'The Wall Street Transcript', 'TheStreet.com', 'Times of India',
     'TopChronicle', 'TRA', 'Triangle Business Journal', 'TrueBlueTribune', 'USA Commerce Daily', 'ValueWalk',
     'Voice Of Analysts', 'Wall Street Journal', 'Yahoo Finance', 'Yahoo News', 'Zacks.com'],
    ['No. of Articles', 1, 1, 6, 1, 5, 10, 1, 1, 1, 1, 2, 2, 9, 1, 12, 1, 1, 2, 1, 1, 1, 1, 53, 10, 1, 1, 3, 2, 2, 2, 4,
     43, 11, 1, 1, 8, 3, 2, 3, 9, 217, 1, 1, 63, 2, 1, 1, 1, 17, 2, 16, 2, 6, 1, 1, 5, 1, 1, 1, 1, 1, 1, 8, 1, 3, 3, 2,
     2]
]

article_by_source = [
    ['Source', 'Reuters Key Development', 'Seeking Alpha', 'Investorplace.com', 'Motley Fool', 'StockNews.com (blog)',
     'StockNewsJournal', 'Equities.com', 'Nasdaq', 'Bloomberg', 'Investorplace.com (blog)', 'Economic News', 'Reuters',
     'NY Stock News', 'ValueWalk', 'Amigobulls', 'The Ledger Gazette', 'Benzinga', 'TheStreet.com', 'MarketWatch',
     'Live Trading News', 'Post Analyst', 'Proactive Investors UK', 'Wall Street Journal', 'Yahoo Finance',
     'DirectorsTalk Interviews', 'Dispatch Tribunal', 'GuruFocus.com', 'Los Angeles Times', 'Madison.com',
     'Market Exclusive'][:7],
    ['No. of Articles', 217, 63, 53, 43, 17, 16, 12, 11, 10, 10, 9, 9, 8, 8, 6, 6, 5, 5, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2,
     2, 2][:7]
]

from sample_stock_data import stock_performace_card1, \
    stock_by_sentiment_score, \
    card1_total_entities, \
    number_of_articles_by_concept, \
    overview_of_second_node_databox_data, \
    stock_name_match_with_data, \
    text_overview

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
                    widthPercent=50,
                    title="Articles by Stock"
                ),

                change_data_in_pie_chart(
                    data=number_of_articles_by_concept,
                    chart=pie_chart,
                    widthPercent=50,
                    title="Articles by Concept"
                ),
                change_data_in_chart(
                    data=stock_performace_card1,
                    chart=line_chart,
                    x="DATE",
                    axes={},
                    widthPercent=100,
                    title="Stock Performance Analysis"
                ),
                change_data_in_chart(
                    data=article_by_source,
                    chart=horizontal_bar_chart,
                    x="Source",
                    axes={"No. of Articles": "y"},
                    widthPercent=50,
                    title="Top Sources"
                ),

                change_data_in_chart(
                    data=stock_by_sentiment_score,
                    chart=bar_chart,
                    x="Stock",
                    axes={"Avg. Sentiment Score": "y"},
                    widthPercent=50,
                    title="Sentiment Score by Stocks"
                ),
                # change_data_in_wordcloud(card1_total_entities, word_cloud)
            ]
        }
    ],
    "name": "Overview",
    "slug": "node1-overview"
}

node2 = {
    "listOfNodes": [
        change_name_and_slug_in_individual(name='GOOGL'),
        change_name_and_slug_in_individual(name='AMZN'),
        change_name_and_slug_in_individual(name='FB'),
        change_name_and_slug_in_individual(name='AAPL'),
        change_name_and_slug_in_individual(name='IBM'),
    ],
    "listOfCards": [
        smaller_name_and_slug_in_individual(name='unknown')
    ],
    "name": "Single Stock Analysis",
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
