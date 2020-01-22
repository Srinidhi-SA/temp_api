import copy
import random

from django.conf import settings
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.response import Response

from api.datasets.helper import convert_to_string
# ---------------------EXCEPTIONS-----------------------------
from api.exceptions import creation_failed_exception, \
    retrieve_failed_exception
# ------------------------------------------------------------
# -----------------------MODELS-------------------------------
from .models import OCRImage
from .models import OCRImageset
# ------------------------------------------------------------
# ---------------------PERMISSIONS----------------------------
from .permission import OCRImageRelatedPermission
# ------------------------------------------------------------

# ---------------------SERIALIZERS----------------------------
from .serializers import OCRImageSerializer, \
    OCRImageListSerializer
# ------------------------------------------------------------

# ---------------------PAGINATION----------------------------
from .pagination import CustomOCRPagination
# ------------------------------------------------------------
from ocr.query_filtering import get_listed_data


# Create your views here.
# -------------------------------------------------------------------------------

def ocr_datasource_config_list(request):
    '''
    METHOD: OCR DATASOURCES CONFIG LIST BASED ON USER PERMISSIONS
    ALLOWED REQUESTS : [GET]
    PARAMETERS: None
    '''
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


# -------------------------------------------------------------------------------

# -------------------------------------------------------------------------------

STATUS_CHOICES = [
    'Not Registered',
    'SUCCESS',
    'FAILED'
]


class OCRImageView(viewsets.ModelViewSet, viewsets.GenericViewSet):
    """
    Model: OCRImage
    Viewset : OCRImageView
    Description :
    """
    serializer_class = OCRImageSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    pagination_class = CustomOCRPagination
    permission_classes = (OCRImageRelatedPermission,)

    def get_queryset(self):
        queryset = OCRImage.objects.filter(
            created_by=self.request.user,
            deleted=False,
            status__in=['SUCCESS']
        ).order_by('-created_at')
        return queryset

    def get_object_from_all(self):
        return OCRImage.objects.get(
            slug=self.kwargs.get('slug'),
            created_by=self.request.user
        )

    # queryset = OCRImage.objects.all()

    def create(self, request, *args, **kwargs):
        # try:
        serializer_data, serializer_error, response = [], [], {}
        if 'data' in kwargs:
            data = kwargs.get('data')
            self.request = request
        else:
            data = request.data
        data = convert_to_string(data)
        img_data = data

        if 'imagefile' in data:
            # data['file'] = request.FILES.get('file')
            files = request.FILES.getlist('imagefile')
            for f in files:
                img_data['imagefile'] = f
                if f is None:
                    img_data['name'] = img_data.get('name',
                                                    img_data.get('datasource_type', "H") + "_" + str(
                                                        random.randint(1000000, 10000000)))
                else:
                    img_data['name'] = f.name[:-4].replace('.', '_')
                imagename_list = []
                image_query = self.get_queryset()
                for index, i in enumerate(image_query):
                    imagename_list.append(i.imagefile.name)
                if img_data['name'] in imagename_list:
                    serializer_error.append(creation_failed_exception("Image name already exists!."))

                img_data['created_by'] = request.user.id
                img_data['status'] = 'SUCCESS'
                serializer = OCRImageSerializer(data=img_data, context={"request": self.request})
                if serializer.is_valid():
                    image_object = serializer.save()
                    image_object.create()
                    serializer_data.append(serializer.data)
                else:
                    serializer_error.append(creation_failed_exception(serializer.errors))
                response = {'serializer_data': serializer_data, 'serializer_error': str(serializer_error)}
        return JsonResponse(response)

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=OCRImageListSerializer
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = OCRImageSerializer(instance=instance, context={'request': request})
        object_details = serializer.data

        return Response(object_details)

