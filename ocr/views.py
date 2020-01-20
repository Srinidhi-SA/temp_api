from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse

import copy

# Create your views here.
'''
OCR DATASOURCES CONFIG LIST BASED ON USER PERMISSIONS
'''
def ocr_datasource_config_list(request):
    user = request.user
    data_source_config = copy.deepcopy(settings.OCR_DATA_SOURCES_CONFIG)
    upload_permission_map = {
       'api.upload_from_file': 'fileUpload',
       'api.upload_from_sftp': 'SFTP',
       'api.upload_from_s3': 'S3'
    }

    upload_permitted_list = []

    for key in upload_permission_map:
        if user.has_perm(key):
            upload_permitted_list.append(upload_permission_map[key])

    permitted_source_config = {
        "conf": []
    }

    #print(list(data_source_config.keys()))
    for data in data_source_config['conf']:
        if data['dataSourceType'] in upload_permitted_list:
            permitted_source_config['conf'].append(data)

    return JsonResponse(data_source_config)
