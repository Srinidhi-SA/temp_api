from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.response import Response
import simplejson as json
import random
import copy

#---------------------EXCEPTIONS-----------------------------
from api.exceptions import creation_failed_exception, \
    retrieve_failed_exception
#------------------------------------------------------------
#-----------------------MODELS-------------------------------
from .models import OCRImageset, \
    OCRImage
#------------------------------------------------------------

#---------------------SERIALIZERS----------------------------
from .serialisers import OCRImageSerializer, \
    OCRImageListSerializer
#------------------------------------------------------------
#---------------------PERMISSIONS----------------------------
from .permission import OCRImageRelatedPermission
#------------------------------------------------------------

from api.datasets.helper import convert_to_string
from api.utils import name_check
from api.query_filtering import get_listed_data



# Create your views here.
#-------------------------------------------------------------------------------
'''
METHOD: OCR DATASOURCES CONFIG LIST BASED ON USER PERMISSIONS
ALLOWED REQUESTS : [GET]
PARAMETERS: None
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
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
'''
Model: OCRImage
Viewset : OCRImageView
Description :
'''
class OCRImageView(viewsets.ModelViewSet, viewsets.GenericViewSet):

    serializer_class = OCRImageSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    permission_classes = (OCRImageRelatedPermission,)

    def get_queryset(self):
        queryset = OCRImage.objects.filter(
            created_by=self.request.user,
            deleted=False,)
        return queryset

    def get_object_from_all(self):
        return OCRImage.objects.get(
            slug=self.kwargs.get('slug'),
            created_by=self.request.user
        )

    #queryset = OCRImage.objects.all()

    def create(self, request, *args, **kwargs):
        print("im here111")
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
                #image_query = OCRImage.objects.filter(deleted=False, created_by=request.user.id)
                image_query = OCRImage.objects.filter(created_by=request.user.id)
                for index, i in enumerate(image_query):
                    imagename_list.append(i.file.name)
                if img_data['name'] in imagename_list:
                    serializer_error.append(creation_failed_exception("Image name already exists!."))

                img_data['created_by'] = request.user.id
                serializer = OCRImageSerializer(data=img_data, context={"request": self.request})
                if serializer.is_valid():
                    image_object = serializer.save()
                    image_object.create()
                    return Response(serializer.data)
                return creation_failed_exception(serializer.errors)
                    #serializer_data.append(Response(serializer.data))
                #serializer_error.append(creation_failed_exception(serializer.errors))
        #return {'serializer_data': serializer_data, 'serializer_error': serializer_error}
        
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = OCRImageListSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = OCRImageSerializer(instance=instance, context={'request': request})
        object_details = serializer.data

        return Response(object_details)
