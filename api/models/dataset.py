import ConfigParser
import csv
import json
import os
from subprocess import call

from django.conf import settings
from django.db import models
from rest_framework import serializers

from api.helper import CSVChecker, tell_me_size_readable_format
from api.lib import hadoop
from api.views.joblog import submit_metadatajob


def dataset_base_directory(instance):
    return "uploads/datasets/{0}".format(instance.id)

def dataset_input_file_directory_path(instance, filename):
    print("yes, I am in here")
    return dataset_base_directory(instance) + "/{0}".format(filename)

def check_blank_object(object):
    keys = object.keys()
    if len(keys) > 0:
        return False
    else:
        return True


class Dataset(models.Model):
    input_file = models.FileField(upload_to=dataset_input_file_directory_path, null=True, blank=True)
    name = models.CharField(max_length=100, null=True)
    userId = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    # file_type = models.CharField(max_length=100, null=True)
    # file_size = models.IntegerField()

    filename_meta = "meta.json"

    def base_storage_dir(self):
        return "/datasets/{0}".format(self.id)

    def storage_input_dir(self):
        return "{}/input".format(self.base_storage_dir())

    def storage_output_dir(self):
        return "{}/output".format(self.base_storage_dir())

    def delete_dataset_from_local(self, id):
       path = "uploads/datasets/{0}".format(id)
       #call(["rm", "-r",path])

    @property
    def input_filename(self):
        return os.path.basename(self.input_file.name)

    @property
    def output_file_meta_path(self):
        return self.storage_output_dir() + '/' + self.filename_meta + "_" + self.input_filename + "_" + self.userId.__str__()


    @property
    def output_file_meta_path_for_script(self):
        return self.storage_output_dir() + '/' + self.filename_meta + "filter"

    @classmethod
    def make(cls, input_file, userId):
        obj = cls()
        obj.save()
        obj.userId = userId
        obj.input_file = input_file
        obj.save()
        csvc = CSVChecker(obj.input_file)
        if not csvc.csv_checker() or csvc.empty_file_check():
            obj.delete()
            return None
        try:
            csvc.csv_header_clean()
            obj.setup()
            obj.run_meta()
        except Exception as e:
            print e
            obj.delete()
            return "ConnectionError"
        return obj

    def setup(self):
        hadoop.hadoop_mkdir(self.storage_input_dir())
        hadoop.hadoop_mkdir(self.storage_output_dir())
        self.send_input_file_to_storage()

    @property
    def safe_name(self):
        return self.name if self.name else self.input_filename

    def send_input_file_to_storage(self):
        hadoop.hadoop_put(self.input_file.path, self.storage_input_dir() + "/")


    def get_input_file_storage_path(self):
        return "{0}/{1}".format(self.storage_input_dir(), self.input_filename)

    def run_meta(self):
        #print("Running meta script")
        #call(["sh", "api/lib/run_meta.sh", settings.HDFS['host'], self.get_input_file_storage_path(), self.output_file_meta_path])

        print("Running jobserver meta script")
        inputpath =  self.get_input_file_storage_path()
        resultpath = self.output_file_meta_path
        submit_metadatajob(inputpath, resultpath, None)


    def get_meta(self):
        path = self.output_file_meta_path

        try:
            result = hadoop.hadoop_read_output_file(path)
        except Exception as error:
            return {}

        if not check_blank_object(result):

            result_data = {}
            if result.has_key('Metadata'):
                if isinstance(result['Metadata'], dict):
                    result_data = result['Metadata']
                elif isinstance(result['Metadata'], str):
                    result_data = json.loads(result['Metadata'])
                elif isinstance(result['Metadata'], unicode):
                    result_data = json.loads(str(result['Metadata']))
            else:
                result_data = result

            return  result_data
        else:
            return {}
        # result_columns = result['columns']
        #
        # data = {}
        # columns = []
        # data['count'] = {'rows': result['total_rows'], 'cols': result['total_columns'], 'dimensions': len(result_columns['dimension_columns'])}
        #
        # for key, value in result_columns['dimension_columns'].iteritems() :
        #     columns.append({'name': key, 'data_type': 'dimension', 'data_format': '', 'no_of_nulls': value['num_nulls']})
        #
        # for key, value in result_columns['measure_columns'].iteritems() :
        #     columns.append({'name': key, 'data_type': 'measure', 'data_format': '', 'no_of_nulls': value['num_nulls']})
        #
        # for key, value in result_columns['time_dimension_columns'].iteritems() :
        #     columns.append({'name': key, 'data_type': 'time', 'data_format': '', 'no_of_nulls': value['num_nulls']})
        #
        # data['columns'] = columns
        # data['measures'] = result_columns['measure_columns'].keys()
        # data['dimensions'] = result_columns['dimension_columns'].keys()
        #
        # return data

    def get_preview_data(self):
        items = []
        all_items = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=',')
            # for row in itertools.islice(rows, 20):
            for row in rows:
                all_items.append(row)
                if "" in row or " " in row:
                    if len(all_items) > 21:
                        continue
                    all_items.append(row)
                    continue
                items.append(row)

        return items[:21] if len(items) > 21 else all_items[:21]

    def sample_filter_subsetting(self,
                                 COLUMN_SETTINGS,
                                 DIMENSION_FILTER,
                                 MEASURE_FILTER,
                                 MEASURE_SUGGESTIONS):

        input_file = self.get_input_file_storage_path()
        # output_file = self.output_file_meta_path_for_script
        output_file = self.output_file_meta_path

        column_settings = json.dumps(COLUMN_SETTINGS)
        dimension_filter = json.dumps(DIMENSION_FILTER)
        measure_filter = json.dumps(MEASURE_FILTER)
        measure_suggestions = json.dumps(MEASURE_SUGGESTIONS)

        call([
            "sh", "api/lib/run_filter.sh",
            settings.HDFS['host'],
            input_file,
            output_file,
            str(column_settings),
            str(dimension_filter),
            str(measure_filter),
            str(measure_suggestions)
        ])
        return "Done"

    def output_file_name(self):
        return

    @property
    def config_file_path(self):
        return dataset_base_directory(self) + "/config.cfg"

    def configuration_file(self, file_settings):
        config = ConfigParser.RawConfigParser()
        config.add_section("FILE_SETTINGS")
        settings_string_for_file_setting = ", ".join(file_settings)
        config.set('COLUMN_SETTINGS', 'analysis_type', settings_string_for_file_setting)
        file_write_on = self.config_file_path

        with open(file_write_on, 'wb') as file:
            config.write(file)

    def get_meta_data_numnbers(self):
        meta_data = self.get_meta()

        if 'columns' in meta_data.keys():
            meta_data = meta_data['columns']

            details = {}
            details['time_dimension_columns'] = self.get_number_of_keys(meta_data['time_dimension_columns'])
            details['dimension_columns'] = self.get_number_of_keys(meta_data['dimension_columns'])
            details['measure_columns'] = self.get_number_of_keys(meta_data['measure_columns'])
            return details
        else:
            return {}

    def get_number_of_keys(self, dictionary_object):
        # find number of keys in a dictionary object
        count = 0
        for key in dictionary_object:
            count += 1
        return count

    def update_options_for(self):
        pass

    def get_size_of_file(self):
        return tell_me_size_readable_format(os.stat(self.input_file.path).st_size)

    def get_measure_suggestion_from_meta_data(self):
        meta_data = self.get_meta()

        if 'measure_suggestions' in meta_data.keys():
            return meta_data.get("measure_suggestions", [])


class DatasetSerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField(source="safe_name")
    created_at = serializers.DateTimeField()
    user_id = serializers.ReadOnlyField()
