from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from api.exceptions import creation_failed_exception
from .models import OCRImageset, OCRImage
from rest_framework import viewsets
from rest_framework.response import Response
from .serialisers import OCRImageSerializer
from api.datasets.helper import convert_to_string
from api.utils import name_check
import simplejson as json
import random
import copy
from .permission import OCRImageRelatedPermission

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

    # print(list(data_source_config.keys()))
    for data in data_source_config['conf']:
        if data['dataSourceType'] in upload_permitted_list:
            permitted_source_config['conf'].append(data)

    return JsonResponse(data_source_config)


class OCRImageView(viewsets.ModelViewSet, viewsets.GenericViewSet):
    queryset = OCRImage.objects.all()
    serializer_class = OCRImageSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    permission_classes = (OCRImageRelatedPermission,)

    def create(self, request, *args, **kwargs):

        # try:
        serializer_data, serializer_error = [], []
        if 'data' in kwargs:
            data = kwargs.get('data')
            self.request = request
        else:
            data = request.data
        data = convert_to_string(data)
        img_data = data
        '''if 'name' in data:
            should_proceed = name_check(data['name'])
            if should_proceed < 0:
                if should_proceed == -1:
                    return creation_failed_exception("Name is empty.")
                elif should_proceed == -2:
                    return creation_failed_exception("Name is very large.")
                elif should_proceed == -3:
                    return creation_failed_exception("Name have special_characters.")'''

        if 'file' in data:
            # data['file'] = request.FILES.get('file')
            files = request.FILES.getlist('file')
            for f in files:
                img_data['datasource_type'] = 'fileUpload'
                if img_data['file'] is None:
                    img_data['name'] = img_data.get('name',
                                                    img_data.get('datasource_type', "H") + "_" + str(
                                                        random.randint(1000000, 10000000)))
                else:
                    img_data['name'] = img_data.get('name', f.name[:-4].replace('.', '_'))
                imagename_list = []
                image_query = OCRImage.objects.filter(deleted=False, created_by=request.user.id)
                for index, i in enumerate(image_query):
                    imagename_list.append(i.name)
                if img_data['name'] in imagename_list:
                    serializer_error.append(creation_failed_exception("Image name already exists!."))

                serializer = OCRImageSerializer(data=img_data, context={"request": self.request})
                if serializer.is_valid():
                    image_object = serializer.save()
                    image_object.create()
                    serializer_data.append(Response(serializer.data))
                serializer_error.append(creation_failed_exception(serializer.errors))
        return {'serializer_data': serializer_data, 'serializer_error': serializer_error}
