import json
from rest_framework.utils import humanize_datetime





def convert_to_string(data):

    keys = ['meta_data', 'datasource_details']

    for key in keys:
        if key in data:
            value = data[key]
            if isinstance(value, str or unicode):
                pass
            elif isinstance(value, dict):
                data[key] = json.dumps(value)

    return data


def convert_to_json(data):
    keys = ['meta_data', 'datasource_details', 'preview']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = json.loads(value)
    return data


def convert_time_to_human(data):

    keys = ['created_on', 'updated_on']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = humanize_datetime.humanize_strptime(value)
    return data


def convert_metadata_according_to_transformation_setting(meta_data, transformation_setting=None):
    meta_data = json.loads(meta_data)

    if transformation_setting is None:
        pass

    meta_data['modified'] = True
    meta_data["transformation_setting"] = transformation_setting
    return meta_data
