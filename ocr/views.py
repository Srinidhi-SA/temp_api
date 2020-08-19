"""
View Implementations for OCRImage and OCRImageset models.
"""

# -------------------------------------------------------------------------------
# pylint: disable=too-many-ancestors
# pylint: disable=no-member
# pylint: disable=too-many-return-statements
# pylint: disable=too-many-locals
# pylint: disable=too-many-branches
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=too-many-statements
# pylint: disable=broad-except
# pylint: disable=invalid-name
# pylint: disable=wrong-import-order
# pylint: disable=ungrouped-imports
# -------------------------------------------------------------------------------
import base64
import copy
import datetime
import os
import random
import ast

import cv2
import simplejson as json
from django.db.models import Q, Sum
from django.conf import settings
from django.core.files import File
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.models import User, Group
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route, api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response

from api.datasets.helper import convert_to_string
from api.utils import name_check
# ---------------------EXCEPTIONS-----------------------------
from api.exceptions import creation_failed_exception, \
    retrieve_failed_exception
# ------------------------------------------------------------
from ocr.query_filtering import get_listed_data, get_image_list_data, \
    get_specific_listed_data, get_reviewer_data, get_filtered_ocrimage_list, get_filtered_project_list, \
    get_userlisted_data
# -----------------------MODELS-------------------------------

from .ITE.scripts.info_mapping import Final_json
from .ITE.scripts.timesheet.timesheet_modularised import timesheet_main
from .ITE.scripts.ui_corrections import ui_flag_v2, fetch_click_word_from_final_json, ui_corrections, offset, \
    cleaned_final_json, sort_json, dynamic_cavas_size
from .models import OCRImage, OCRImageset, OCRUserProfile, Project, Template

# ------------------------------------------------------------
# ---------------------PERMISSIONS----------------------------
from .permission import OCRImageRelatedPermission, \
    IsOCRClientUser
# ------------------------------------------------------------

from ocr.tasks import extract_from_image, write_to_ocrimage
from celery.result import AsyncResult

# ---------------------SERIALIZERS----------------------------
from .serializers import OCRImageSerializer, \
    OCRImageListSerializer, \
    OCRImageSetSerializer, \
    OCRImageSetListSerializer, \
    OCRUserProfileSerializer, \
    OCRUserListSerializer, \
    ProjectSerializer, \
    ProjectListSerializer, \
    OCRImageExtractListSerializer, \
    GroupSerializer, \
    OCRReviewerSerializer, OCRImageNameListSerializer

# ------------------------------------------------------------
# ---------------------PAGINATION----------------------------
from .pagination import CustomOCRPagination

# ---------------------S3 Files-----------------------------
from .dataloader import S3File

from .forms import CustomUserCreationForm, CustomUserEditForm

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics
from django.core.exceptions import PermissionDenied, \
    SuspiciousOperation

from api.utils import UserListSerializer

# Create your views here.
from .utils import json_2_xml, json_2_csv, error_message


def ocr_datasource_config_list(request):
    """
    METHOD: OCR DATASOURCES CONFIG LIST BASED ON USER PERMISSIONS
    ALLOWED REQUESTS : [GET]
    PARAMETERS: None
    """
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
@api_view(['GET'])
def get_dashboard_metrics(request):
    return JsonResponse({
        'status': True,
        'projectMetrics': get_ocr_data(),
        'reviewerL1data': get_reviewer_metrics()
    })


def get_ocr_data():
    totProjects = Project.objects.all().count()
    totOCRImages = OCRImage.objects.all().count()

    totalaccuracy = OCRImage.objects.filter(
        is_recognized=True
    ).aggregate(Sum('confidence'))['confidence__sum'] or 0.00
    try:
        accuracy = round((totalaccuracy / totOCRImages), 2)
    except:
        accuracy = 0

    return {
        'Project': {
            'totalProject': totProjects,
            'accuracy': accuracy
        },
        'Pages': {
            'TotalImages': totOCRImages,
            'accuracy': accuracy
        },
        'TotalTexts': {
            'totalTexts': get_total_texts_extracted(),
            'accuracy': accuracy
        },
        'TypedTexts': {
            'typedTexts': get_total_texts_extracted(),
            'accuracy': accuracy
        },
        'HandPrintedTexts': {
            'handPrintedTexts': get_total_texts_extracted(),
            'accuracy': accuracy
        },
        'HandWrittenTexts': {
            'handWrittenTexts': get_total_texts_extracted(),
            'accuracy': accuracy
        }
    }


def get_total_texts_extracted():
    return OCRImage.objects.filter(
        is_recognized=True
    ).aggregate(Sum('fields'))['fields__sum'] or 0


def get_reviewer_metrics():
    totalReviewers = OCRUserProfile.objects.filter(
        ocr_user__groups__name__in=['ReviewerL1'],
        is_active=True
    ).count()
    totL1AssignedDocs = OCRImage.objects.filter(is_L1assigned=True)
    count = totL1AssignedDocs.count()

    if not count == 0:
        # for doc in totL1AssignedDocs:
        from ocrflow.models import ReviewRequest
        reviewedL1Docs = ReviewRequest.objects.filter(
            ocr_image__in=totL1AssignedDocs,
            status='reviewerL1_reviewed'
        ).count()
        totalPendingDocs = ReviewRequest.objects.filter(
            ocr_image__in=totL1AssignedDocs,
            status='submitted_for_review(L1)'
        ).count()
        return {
            'totalReviewers': totalReviewers,
            'totalReviewedDocs': reviewedL1Docs,
            'totalPendingDocs': totalPendingDocs,
            'reviewsPerReviewer': avg_reviews_per_reviewer(totalReviewers, count)
        }
    else:
        return {
            'totalReviewers': totalReviewers,
            'totalReviewedDocs': None,
            'totalPendingDocs': None,
            'reviewsPerReviewer': avg_reviews_per_reviewer(totalReviewers, count)
        }


def avg_reviews_per_reviewer(totalReviewers, count):
    from math import floor
    try:
        return (floor(count / totalReviewers))
    except:
        return 0


@api_view(['GET'])
def get_recent_activity(request):
    from django.contrib.admin.models import LogEntry, ADDITION, CHANGE
    from django.contrib.contenttypes.models import ContentType

    user = request.user
    recent_activity = []
    group = Group.objects.get(user=user.id)

    if group.name == 'ReviewerL1' or group.name == 'ReviewerL2':
        recentActions = LogEntry.objects.filter(user=user.id).order_by('-action_time')[:30]

        for each in recentActions:
            recent_activity.append(
                {
                    "Message": each.__str__().replace("\"", ""),
                    "Object": each.object_repr,
                }
            )
        return JsonResponse({"message": "success", "Activity": recent_activity})
    else:
        recent_activity = {}
        usersList = User.objects.filter(
            groups__name__in=['Admin', 'Superuser', 'ReviewerL1', 'ReviewerL2']
        ).values_list('username', flat=True)

        for user in usersList:
            activity = []
            userID = User.objects.get(username=user).id
            recentActions = LogEntry.objects.filter(user=userID).order_by('-action_time')[:30]

            for each in recentActions:
                activity.append(
                    {
                        "Message": each.__str__().replace("\"", ""),
                        "Object": each.object_repr,
                        "user": each.user.username
                    }
                )
            recent_activity[user] = activity

        return JsonResponse({
            "message": "success",
            "Activity": recent_activity
            # "Users":usersList
        })


# -------------------------------------------------------------------------------


# -------------------------------------------------------------------------------
class OCRUserView(viewsets.ModelViewSet):
    """
    Model: USER
    Viewset : OCRUserView
    Description :
    """
    serializer_class = OCRUserListSerializer
    model = User
    # permission_classes = (IsAuthenticated, IsOCRAdminUser)
    permission_classes = (IsAuthenticated,)
    pagination_class = CustomOCRPagination

    def get_queryset(self, request, role):
        if role == 'Admin':
            queryset = User.objects.filter(
                ~Q(is_active=False),
                groups__name__in=['Admin', 'Superuser', ]
            ).exclude(id='1').order_by('-date_joined')  # Excluding "ANONYMOUS_USER_ID"
        else:
            queryset = User.objects.filter(
                ~Q(is_active=False),
                groups__name__in=['ReviewerL1', 'ReviewerL2'],
                ocruserprofile__supervisor=request.user
            ).order_by('-date_joined')  # Excluding "ANONYMOUS_USER_ID"
        return queryset

    def get_specific_reviewer_qyeryset(self, request, role, user_type):
        if user_type == 'Admin':
            queryset = User.objects.filter(groups=role)
        else:
            queryset = User.objects.filter(
                groups=role,
                ocruserprofile__supervisor=request.user
            ).order_by('-date_joined')
        return queryset

    def get_specific_reviewer_detail_queryset(self, request):
        queryset = User.objects.filter(
            groups__name__in=['ReviewerL1', 'ReviewerL2'],
            ocruserprofile__supervisor=request.user
        )
        return queryset

    def get_user_profile_object(self, username=None):
        user = User.objects.get(username=username)
        object = OCRUserProfile.objects.get(ocr_user_id=user.id)
        return object

    def create(self, request, *args, **kwargs):
        """Add OCR User"""

        if request.method == 'POST':
            form = CustomUserCreationForm(request.POST)
            if form.is_valid():
                form.save()
                OCR_profile = self.get_user_profile_object(username=request.POST.get('username'))
                return JsonResponse({
                    "created": True,
                    "message": "User added successfully.",
                    "ocr_profile_slug": OCR_profile.get_slug() if OCR_profile is not None else None
                })
            else:
                return JsonResponse({
                    "created": False,
                    "message": form.errors
                })
        else:
            raise SuspiciousOperation("Invalid Method.")

    def list(self, request, *args, **kwargs):

        user_group = request.user.groups.values_list('name', flat=True)
        if 'Superuser' in user_group:
            return get_userlisted_data(
                viewset=self,
                request=request,
                list_serializer=OCRUserListSerializer,
                role='Superuser'
            )
        else:
            return get_userlisted_data(
                viewset=self,
                request=request,
                list_serializer=OCRUserListSerializer,
                role='Admin'
            )

    @list_route(methods=['post'])
    def edit(self, request, *args, **kwargs):

        username = request.POST.get('username')

        user = User.objects.get(username=username)

        if request.method == 'POST':
            form = CustomUserEditForm(request.POST, instance=user)
            if form.is_valid():
                form.save()
                return JsonResponse({
                    "updated": True,
                    "message": "User profile Updated successfully."
                })
            return JsonResponse({

                "updated": False,
                "message": form.errors
            })
        else:
            raise SuspiciousOperation("Invalid Method.")

    def check_for_pending_tasks(self, user):
        from ocrflow.models import Task, ReviewRequest
        userGroup = user.groups.all()[0].name
        if userGroup == "ReviewerL1":
            tasks = Task.objects.filter(
                assigned_user=user,
                is_closed=False)
            for task in tasks:
                reviewObj = ReviewRequest.objects.get(tasks=task)
                imageObj = OCRImage.objects.get(id=reviewObj.ocr_image.id)
                imageObj.is_L1assigned = False
                imageObj.status = "ready_to_assign"
                imageObj.l1_assignee = None
                imageObj.save()
                reviewObj.delete()
        elif userGroup == "ReviewerL2":
            tasks = Task.objects.filter(
                assigned_user=user,
                is_closed=False)
            for task in tasks:
                reviewObj = ReviewRequest.objects.get(tasks=task)
                imageObj = OCRImage.objects.get(id=reviewObj.ocr_image.id)
                imageObj.is_L2assigned = False
                imageObj.assignee = None
                imageObj.status = "l1_verified"
                imageObj.save()
        else:
            tasks = []

        print("~" * 50)
        print("Total tasks un-assigned for user {0} : {1}".format(user.username, len(tasks)))
        print("~" * 50)

    def delete(self, request, *args, **kwargs):
        """Delete OCR User"""
        if request.method == 'DELETE':
            username_list = request.data['username']
            print("Deleting Users: ", username_list)
            for user in username_list:
                try:
                    user_object = User.objects.get(username=user)
                    self.check_for_pending_tasks(user_object)
                    user_object.delete()

                except User.DoesNotExist:
                    return JsonResponse({
                        "deleted": False,
                        "message": "User " + user + " DoesNotExist."
                    })
                except Exception as e:
                    return JsonResponse({
                        "deleted": False,
                        "message": str(e)
                    })
            return JsonResponse({
                "deleted": True,
                "message": "User deleted."
            })

        else:
            raise SuspiciousOperation("Invalid Method.")

    @list_route(methods=['get'])
    def reviewer_list(self, request, *args, **kwargs):
        role = request.GET['role']
        user_group = request.user.groups.values_list('name', flat=True)
        if 'Superuser' in user_group:
            return get_specific_listed_data(
                viewset=self,
                request=request,
                list_serializer=OCRUserListSerializer,
                role=role,
                user_type='Superuser'
            )
        else:
            return get_specific_listed_data(
                viewset=self,
                request=request,
                list_serializer=OCRUserListSerializer,
                role=role,
                user_type='Admin'
            )

    @list_route(methods=['get'])
    def reviewer_detail_list(self, request, *args, **kwargs):
        response = get_reviewer_data(
            viewset=self,
            request=request,
            list_serializer=OCRReviewerSerializer,
        )

        if 'accuracy' in request.GET or 'time' in request.GET:
            accuracy_operator, accuracy = request.GET['accuracy'][:3], request.GET['accuracy'][3:]
            time_operator, time = request.GET['time'][:3], request.GET['time'][3:]
            add_key = response.data['data']

            if accuracy:
                if accuracy_operator == 'GTE':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['accuracyModel'] >= float(accuracy):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]
                if accuracy_operator == 'LTE':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['accuracyModel'] <= float(accuracy):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]
                if accuracy_operator == 'EQL':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['accuracyModel'] == float(accuracy):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]

            if time:
                if time_operator == 'GTE':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['avgTimeperWord'] >= float(time):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]
                if time_operator == 'LTE':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['avgTimeperWord'] <= float(time):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]
                if time_operator == 'EQL':
                    buffer = list()
                    for user in add_key:
                        if not user['ocr_data']['avgTimeperWord'] == float(time):
                            buffer.append(user)
                    add_key = [ele for ele in add_key if ele not in buffer]

            response.data['data'] = add_key
        return response

    @list_route(methods=['get'])
    def get_ocr_users(self, request):
        try:
            role = request.GET['role']
            queryset = self.get_specific_reviewer_qyeryset(request, role=role, user_type='Superuser')
            for query in queryset.iterator():
                ocr_profile_object = self.get_user_profile_object(username=query)
                if not ocr_profile_object.is_active:
                    queryset = queryset.exclude(id=query.id)
            serializer = UserListSerializer(queryset, many=True, context={"request": self.request})
            UsersList = dict()
            for index, i in enumerate(serializer.data):
                UsersList.update({index: {
                    'name': (i.get('username')).capitalize(),
                    'Uid': i.get('id'),
                    'email': i.get('email')}})
            return JsonResponse({'allUsersList': UsersList})
        except Exception as err:
            return JsonResponse({'message': str(err)})


# -------------------------------------------------------------------------------


# -------------------------------------------------------------------------------
class OCRUserProfileView(viewsets.ModelViewSet):
    """
    Model: OCRUserProfile
    Viewset : OCRUserProfileView
    Description :
    """
    serializer_class = OCRUserProfileSerializer
    model = OCRUserProfile
    permission_classes = (IsAuthenticated,)
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = OCRUserProfile.objects.filter(
            ~Q(is_active=False)
        ).order_by('-created_at')
        return queryset

    def get_object_from_all(self):
        """
        Returns the queryset of OCRUserProfile filtered by the slug.
        """
        return OCRUserProfile.objects.get(
            slug=self.kwargs.get('slug')
        )

    def retrieve(self, request, *args, **kwargs):
        """Returns specific object details"""
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("Profile Doesn't exist.")

        serializer = OCRUserProfileSerializer(instance=instance, context={'request': request})
        profile_details = serializer.data

        return Response(profile_details)

    def update(self, request, *args, **kwargs):
        instance = self.get_object_from_all()
        instance.is_active = request.data.get("is_active")
        instance.supervisor = request.user
        group_object = Group.objects.get(id=request.data.get("role"))
        try:
            user_group = User.groups.through.objects.get(user=instance.ocr_user)
            user_group.group = group_object
            user_group.save()
        except:
            group_object.user_set.add(instance.ocr_user)
        try:
            permitted_app_list = request.data.get("app_list")
            from api.models import CustomAppsUserMapping, CustomApps
            apps = CustomApps.objects.filter(app_id__in=permitted_app_list)
            CustomAppsUserMapping.objects.filter(user=instance.ocr_user).delete()
            for app in apps:
                caum = CustomAppsUserMapping()
                caum.user = instance.ocr_user
                caum.app = app
                caum.rank = app.rank
                caum.save()
        except Exception as err:
            print(err)

        instance.save()
        serializer = OCRUserProfileSerializer(instance=instance, context={'request': request})
        return JsonResponse({
            "message": "Profile updated successfully.",
            "updated": True,
            "ocr_profile": serializer.data
        })

    @list_route(methods=['post'])
    def edit_status(self, request, *args, **kwargs):
        try:
            username_list = request.data['username']
            status = request.data.get("is_active")
        except:
            raise KeyError('Parameters missing.')

        for user in username_list:
            try:
                user = User.objects.get(username=user)
                ocr_profile = OCRUserProfile.objects.get(ocr_user=user)
                ocr_profile.is_active = status
                ocr_profile.save()
            except Exception as err:
                print(err)
                return JsonResponse({
                    "message": "Profile update unsuccessfull.",
                    "updated": False,
                    "error": str(err)
                })
        return JsonResponse({
            "message": "Profile update successfully.",
            "updated": True,
        })


# -------------------------------------------------------------------------------

# -------------------------------------------------------------------------------

# -------------------------------------------------------------------------------

class GroupListView(generics.ListCreateAPIView):

    def get_queryset(self, userGroup):
        if userGroup == 'Admin':
            queryset = Group.objects.filter(
                name__in=['Admin', 'Superuser']
            )
        else:
            queryset = Group.objects.filter(
                name__in=['ReviewerL1', 'ReviewerL2']
            )
        return queryset

    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, ]

    # IsOCRAdminUser]

    def list(self, request):
        userGroup = request.user.groups.all()[0].name
        print(userGroup)

        queryset = self.get_queryset(userGroup)
        serializer = GroupSerializer(queryset, many=True)
        return Response(serializer.data)


# -------------------------------------------------------------------------------

# -------------------------------------------------------------------------------

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
        ).order_by('-created_at').select_related('imageset')
        return queryset

    @staticmethod
    def get_all_queryset():
        return OCRImage.objects.all()

    def get_active_queryset(self, projectslug):
        return OCRImage.objects.filter(
            status__in=['ready_to_verify(L1)', 'l1_verified', 'ready_to_verify(L2)', 'ready_to_export', 'bad_scan'],
            created_by=self.request.user,
            project__slug=projectslug
        ).order_by('-created_at')

    def get_backlog_queryset(self, projectslug):
        return OCRImage.objects.filter(
            status__in=['ready_to_recognize', 'ready_to_assign', 'recognizing', 'uploading'],
            created_by=self.request.user,
            project__slug=projectslug
        ).order_by('-created_at')

    def get_queryset_by_status(self, projectslug, imageStatus):
        if imageStatus == 'active':
            queryset = self.get_active_queryset(projectslug)
            return queryset
        elif imageStatus == 'backlog':
            queryset = self.get_backlog_queryset(projectslug)
            return queryset

    def get_object_from_all(self):
        """
        Returns the queryset of OCRImage filtered by the slug.
        """
        return OCRImage.objects.get(
            slug=self.kwargs.get('slug'),
        )

    def process_image(self, data, response, slug, image_queryset):
        data['final_result'] = json.dumps(response['final_json'])
        data['analysis'] = json.dumps(response['analysis'])
        image = base64.decodebytes(response['mask'].encode('utf-8'))
        with open('ocr/ITE/database/{}_mask.png'.format(slug), 'wb') as f:
            f.write(image)
        data['mask'] = File(name='{}_mask.png'.format(slug),
                            file=open('ocr/ITE/database/{}_mask.png'.format(slug), 'rb'))
        gen_image, doc_accuracy, total_words = ui_flag_v2(cv2.imread("ocr/ITE/database/{}_mask.png".format(slug)),
                                                          response['final_json'],
                                                          'ocr/ITE/database/{}_gen_image.png'.format(slug),
                                                          response['analysis'])
        image = base64.decodebytes(gen_image)
        with open('ocr/ITE/database/{}_gen_image.png'.format(slug), 'wb') as f:
            f.write(image)
        data['generated_image'] = File(name='{}_gen_image.png'.format(slug),
                                       file=open('ocr/ITE/database/{}_gen_image.png'.format(slug), 'rb'))
        data['metadata'] = json.dumps(response['metadata'])

        data['is_recognized'] = True
        data['status'] = "ready_to_assign"
        # data['modified_by'] = self.request.user.id
        data['slug'] = slug
        data['flag'] = response['flag']
        data['classification'] = str(response['final_json']['temp_number'][0]).upper()

        data['fields'] = total_words
        data['confidence'] = round(doc_accuracy * 100, 2)

        if 'extension' in response and response['extension'] == '.pdf':
            original_image = base64.decodebytes(response['original_image'].encode('utf-8'))
            with open('ocr/ITE/database/{}_original_image.png'.format(slug), 'wb') as f:
                f.write(original_image)
            data['imagefile'] = File(name='{}_original_image.png'.format(slug),
                                     file=open('ocr/ITE/database/{}_original_image.png'.format(slug), 'rb'))
            data['imageset'] = image_queryset.imageset.id
            data['project'] = image_queryset.project.id
            data['created_by'] = image_queryset.created_by.id
            data['name'] = response['image_name']
            serializer = self.get_serializer(data=data, context={"request": self.request})
        else:
            del data['slug']
            serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                             context={"request": self.request})
        return serializer

    @list_route(methods=['post'])
    def get_s3_files(self, request, **kwargs):
        """
        Returns the lists of files from the s3 bucket.
        """
        if 'data' in kwargs:
            data = kwargs.get('data')
        else:
            data = request.data
        data = convert_to_string(data)
        s3_file_lists = S3File()
        files_list = s3_file_lists.s3_files(**data)
        response = files_list
        return JsonResponse(response)

    def create(self, request, *args, **kwargs):

        imageset_id = None
        serializer_data, serializer_error, imagepath, response = list(), list(), list(), dict()
        if 'data' in kwargs:
            data = kwargs.get('data')
        else:
            data = request.data
        data = convert_to_string(data)
        img_data = data

        if data['dataSourceType'] == 'fileUpload':
            if 'imagefile' in data:
                files = request.FILES.getlist('imagefile')
                for file in files:
                    imagepath.append(file.name[:-4].replace('.', '_'))

        if data['dataSourceType'] == 'S3':
            s3_downloader = S3File()
            files_download = s3_downloader.download_file_from_s3(**data)
            if files_download['status'] == 'SUCCESS':
                s3_dir = files_download['file_path']
                files = [f for f in os.listdir(s3_dir) if os.path.isfile(os.path.join(s3_dir, f))]
                for file in files:
                    imagepath.append(file)

        if data['dataSourceType'] == 'SFTP':
            pass

        imageset_data = dict()
        imageset_data['imagepath'] = str(imagepath)
        imageset_data['created_by'] = request.user.id
        imageset_data['project'] = Project.objects.get(slug=data['projectslug']).id
        serializer = OCRImageSetSerializer(data=imageset_data, context={"request": self.request})

        if serializer.is_valid():
            imageset_object = serializer.save()
            imageset_object.create()
            imageset_id = imageset_object.id
            response['imageset_serializer_data'] = serializer.data
            response['imageset_message'] = 'SUCCESS'
        else:
            response['imageset_serializer_error'] = serializer.errors
            response['imageset_message'] = 'FAILED'

        imagename_list = []
        image_query = self.get_queryset()
        for i in image_query:
            imagename_list.append(i.name)

        for file in files:
            if data['dataSourceType'] == 'S3':
                img_data = dict()
                django_file = File(open(os.path.join(s3_dir, file), 'rb'), name=file)
                img_data['imagefile'] = django_file
                img_data['projectslug'] = data['projectslug']
                img_data['imageset'] = OCRImageset.objects.filter(id=imageset_id)
                if file is None:
                    img_data['name'] = img_data.get('name',
                                                    img_data.get('datasource_type', "H") + "_" + str(
                                                        random.randint(1000000, 10000000)))
                else:
                    img_data['name'] = file[:-4].replace('.', '_')
                img_data['created_by'] = request.user.id
                img_data['project'] = Project.objects.filter(slug=img_data['projectslug'])
                # if img_data['name'] in imagename_list:
                #     serializer_error.append(creation_failed_exception("Image name already exists!.").data['exception'])
                #     response['serializer_error'] = str(serializer_error)
                #     response['message'] = 'FAILED'
                #     return JsonResponse(response)
                serializer = OCRImageSerializer(data=img_data, context={"request": self.request})
                if serializer.is_valid():
                    image_object = serializer.save()
                    image_object.create()

            if data['dataSourceType'] == 'fileUpload':
                img_data['imagefile'] = file
                img_data['imageset'] = OCRImageset.objects.filter(id=imageset_id)
                if file is None:
                    img_data['name'] = img_data.get('name',
                                                    img_data.get('datasource_type', "H") + "_" + str(
                                                        random.randint(1000000, 10000000)))
                else:
                    img_data['name'] = file.name[:-4].replace('.', '_')
                img_data['created_by'] = request.user.id
                img_data['project'] = Project.objects.filter(slug=img_data['projectslug'])
                # if img_data['name'] in imagename_list:
                #     serializer_error.append(creation_failed_exception("Image name already exists!.").data['exception'])
                #     response['serializer_error'] = str(serializer_error)
                #     response['message'] = 'FAILED'
                #     return JsonResponse(response)
                serializer = OCRImageSerializer(data=img_data, context={"request": self.request})
                if serializer.is_valid():
                    image_object = serializer.save()
                    image_object.create()
                else:
                    serializer_error.append(serializer.errors)
                    return JsonResponse(response)
            if data['dataSourceType'] == 'SFTP':
                pass

            img_data['status'] = 'ready_to_recognize'
            serializer = OCRImageSerializer(instance=image_object, data=img_data, partial=True,
                                            context={"request": self.request})
            if serializer.is_valid():
                serializer.save()
                serializer_data.append(serializer.data)
            else:
                serializer_error.append(serializer.errors)
        if not serializer_error:
            response['serializer_data'] = serializer_data
            response['message'] = 'SUCCESS'
        else:
            response['serializer_error'] = str(serializer_error)
            response['message'] = 'FAILED'
        return JsonResponse(response)

    def list(self, request, *args, **kwargs):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=OCRImageListSerializer
        )

    @list_route(methods=['get'])
    def get_ocrimages(self, request, *args, **kwargs):
        imageStatus = self.request.query_params.get('imageStatus')
        projectslug = self.request.query_params.get('projectslug')
        response = get_filtered_ocrimage_list(
            viewset=self,
            request=request,
            list_serializer=OCRImageListSerializer,
            imageStatus=imageStatus,
            projectslug=projectslug
        )
        project_id = Project.objects.get(slug=projectslug).id
        temp_obj = Template.objects.first()
        values = list(json.loads(temp_obj.template_classification).keys())
        value = [i.upper() for i in values]
        response.data['values'] = value
        response.data['total_data_count_wf'] = len(
            OCRImage.objects.filter(created_by_id=request.user.id, project=project_id))
        return response

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = OCRImageSerializer(instance=instance, context={'request': request})
        object_details = serializer.data
        temp_obj = Template.objects.first()
        values = list(json.loads(temp_obj.template_classification).keys())
        value = [i.upper() for i in values]
        object_details.update({'values': value})
        desired_response = ['imagefile', 'slug', 'generated_image', 'is_recognized', 'tasks', 'values',
                            'classification']
        object_details = {key: val for key, val in object_details.items() if key in desired_response}
        mask = 'ocr/ITE/database/{}_mask.png'.format(object_details['slug'])
        size = cv2.imread(mask).shape
        dynamic_shape = dynamic_cavas_size(size[:-1])
        object_details.update({'height': dynamic_shape[0], 'width': dynamic_shape[1]})
        return Response(object_details)

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)

        if 'name' in data:
            imagename_list = []
            image_query = OCRImage.objects.filter(deleted=False, created_by=request.user)
            for _, i in enumerate(image_query):
                imagename_list.append(i.name)
            if data['name'] in imagename_list:
                return creation_failed_exception("Name already exists!.")
            should_proceed = name_check(data['name'])
            if should_proceed < 0:
                if should_proceed == -1:
                    return creation_failed_exception("Name is empty.")
                if should_proceed == -2:
                    return creation_failed_exception("Name is very large.")
                if should_proceed == -3:
                    return creation_failed_exception("Name have special_characters.")

        try:
            instance = self.get_object_from_all()
            # if 'deleted' in data:
            #     if data['deleted']:
            #         print('let us deleted')
            #         instance.delete()
            #         # clean_up_on_delete.delay(instance.slug, OCRImage.__name__)
            #         return JsonResponse({'message': 'Deleted'})
        except FileNotFoundError:
            return creation_failed_exception("File Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    @list_route(methods=['post'])
    def extract(self, request, *args, **kwargs):
        data = request.data
        results = []
        image_list = []
        try:
            if 'slug' in data:
                for slug in ast.literal_eval(str(data['slug'])):
                    image_queryset = OCRImage.objects.get(slug=slug)
                    image_queryset.status = 'recognizing'
                    image_queryset.save()
                    template = json.loads(Template.objects.first().template_classification)
                    try:
                        response = extract_from_image.apply_async(args=(image_queryset.imagefile.path, slug, template),
                                                                  retry=True, retry_policy={
                                'max_retries': 3,
                                'interval_start': 1,
                                'interval_step': 1,
                                'interval_max': 3,
                            })
                        result = response.task_id
                        res = AsyncResult(result)
                        res = res.get()
                    except Exception as e:
                        image_queryset.status = 'failed'
                        image_queryset.save()
                        res = {}
                        results.append({'slug': slug, 'status': str(e), 'message': 'FAILED'})
                    try:
                        for response in res.values():
                            if 'status' in response and response['status'] == 'failed':
                                data['slug'] = response['image_slug']
                                original_image = base64.decodebytes(response['original_image'].encode('utf-8'))
                                with open('ocr/ITE/database/{}_original_image.png'.format(slug), 'wb') as f:
                                    f.write(original_image)
                                data['imagefile'] = File(name='{}_original_image.png'.format(slug),
                                                         file=open(
                                                             'ocr/ITE/database/{}_original_image.png'.format(slug),
                                                             'rb'))
                                data['imageset'] = image_queryset.imageset.id
                                data['project'] = image_queryset.project.id
                                data['created_by'] = image_queryset.created_by.id
                                data['name'] = response['image_name']
                                data['status'] = 'failed'
                                serializer = self.get_serializer(data=data, context={"request": self.request})
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    print(serializer.errors)
                                results.append(
                                    {'slug': response['image_slug'], 'status': response['error'], 'message': 'FAILED'})
                            else:
                                slug = response['image_slug']
                                data = {}
                                serializer = self.process_image(data, response, slug, image_queryset)
                                if serializer.is_valid():
                                    serializer.save()
                                    results.append(
                                        {'slug': slug, 'status': serializer.data['status'], 'message': 'SUCCESS'})
                                    temp_obj = Template.objects.first()
                                    temp_obj.template_classification = json.dumps(response['template'])
                                    temp_obj.save()
                                    if image_queryset.imagefile.path[-4:] == '.pdf':
                                        image_queryset.status = 'ready_to_assign'
                                        image_queryset.deleted = True
                                        image_queryset.save()
                                else:
                                    image_list.append(response['image_slug'])
                                    results.append(serializer.errors)
                    except Exception as e:
                        print(str(e))
                        pass
                if image_list:
                    for slug in image_list:
                        image_queryset = OCRImage.objects.get(slug=slug)
                        image_queryset.status = 'failed'
                        image_queryset.save()
                return Response(results)
        except Exception as e:
            if image_list:
                for slug in image_list:
                    image_queryset = OCRImage.objects.get(slug=slug)
                    image_queryset.status = 'failed'
                    image_queryset.save()
            category = e.__class__.__name__
            return JsonResponse(
                {'message': error_message(category), 'error': str(e)})

    @list_route(methods=['post'])
    def extract2(self, request, *args, **kwargs):
        data = request.data
        results = []
        try:
            if 'slug' in data:
                for slug in ast.literal_eval(str(data['slug'])):
                    try:
                        image_queryset = OCRImage.objects.get(slug=slug)
                        image_queryset.status = 'recognizing'
                        image_queryset.save()
                        template = json.loads(Template.objects.first().template_classification)
                        response = write_to_ocrimage.apply_async(args=(image_queryset.imagefile.path, slug, template))
                        result = response.task_id
                        results.append({'slug': slug, 'id': result})
                    except Exception as e:
                        results.append({slug: str(e)})
            return JsonResponse({'tasks': results})
        except Exception as e:
            return JsonResponse({'failed': str(e)})

    @list_route(methods=['post'])
    def poll_recognize(self, request, *args, **kwargs):
        result = []
        for task in ast.literal_eval(str(request.data['id'])):
            res = AsyncResult(task)
            result.append({'state': res.status, 'result': res.result})
        return Response(result)

    @list_route(methods=['post'])
    def get_word(self, request, *args, **kwargs):
        data = request.data
        x = data['x']
        y = data['y']

        # try:
        image_queryset = OCRImage.objects.get(slug=data['slug'])
        review_start_time = image_queryset.review_start
        if not review_start_time:
            data['review_start'] = datetime.datetime.now()
            serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                             context={"request": self.request})
            if serializer.is_valid():
                serializer.save()
        final_json = json.loads(image_queryset.final_result)
        mask = 'ocr/ITE/database/{}_mask.png'.format(data['slug'])
        size = cv2.imread(mask).shape
        dynamic_shape = dynamic_cavas_size(size[:-1])
        [x, y] = offset([x, y], size, dynamic_shape)
        response = fetch_click_word_from_final_json(final_json, [x, y])
        return JsonResponse({'exists': response[0], 'word': response[1]})
        # except Exception as e:
        #    return JsonResponse({'message': 'Failed to fetch any words!', 'error': str(e)})

    @list_route(methods=['post'])
    def update_word(self, request, *args, **kwargs):
        data = request.data
        x = data['x']
        y = data['y']
        word = data['word']

        try:
            image_queryset = OCRImage.objects.get(slug=data['slug'])
            final_json = json.loads(image_queryset.final_result)
            analysis = json.loads(image_queryset.analysis)

            try:
                user_object = OCRUserProfile.objects.get(ocr_user=request.user.id)
                reviewer = list(user_object.json_serialized()['role'])
                if reviewer:
                    reviewer = reviewer[0]
                else:
                    reviewer = 'Admin'
            except:
                reviewer = 'Superuser'

            update_history = json.loads(image_queryset.analysis_list)
            if not update_history:
                update_history = {reviewer: {}}
            mask = 'ocr/ITE/database/{}_mask.png'.format(data['slug'])
            size = cv2.imread(mask).shape
            dynamic_shape = dynamic_cavas_size(size[:-1])
            [x, y] = offset([x, y], size, dynamic_shape)
            final_json_obj = Final_json(final_json, update_history)
            final_json, update_history = final_json_obj.update_final_json([x, y], word)
            data['final_result'] = json.dumps(final_json)
            data['analysis_list'] = json.dumps(update_history)
            image_path = 'ocr/ITE/database/{}_gen_image.png'.format(data['slug'])
            gen_image, _, _ = ui_flag_v2(cv2.imread(mask), final_json, image_path,
                                         analysis)
            image = base64.decodebytes(gen_image)
            with open('ocr/ITE/database/{}_gen_image.png'.format(data['slug']), 'wb') as f:
                f.write(image)
            data['generated_image'] = File(name='{}_gen_image.png'.format(data['slug']),
                                           file=open('ocr/ITE/database/{}_gen_image.png'.format(data['slug']), 'rb'))

            serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                             context={"request": self.request})
            if serializer.is_valid():
                serializer.save()
                od = OCRImageExtractListSerializer(instance=image_queryset, context={'request': request})
                object_details = od.data
                object_details['message'] = 'SUCCESS'
                return Response(object_details)
            return Response(serializer.errors)
        except Exception as e:
            return JsonResponse({'message': 'Failed to update the word!', 'error': str(e)})

    @list_route(methods=['post'])
    def get_images(self, request, *args, **kwargs):

        data = request.data
        instance = OCRImage.objects.get(slug=data['slug'])

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = OCRImageExtractListSerializer(instance=instance, context={'request': request})
        object_details = serializer.data

        return Response(object_details)

    @list_route(methods=['post'])
    def not_clear(self, request, *args, **kwargs):
        data = request.data
        image_queryset = OCRImage.objects.get(slug=data['slug'])
        data['status'] = 'bad_scan'
        serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                         context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'message': 'SUCCESS'})
        return Response(serializer.errors)

    @list_route(methods=['post'])
    def final_analysis(self, request, *args, **kwargs):
        data = request.data
        try:
            image_queryset = OCRImage.objects.get(slug=data['slug'])
            final_result = json.loads(image_queryset.final_result)
            final_result_user = cleaned_final_json(final_result)
            final_result_user = sort_json(final_result_user)
            data['google_response'] = json.dumps(final_result_user)
            review_end_time = image_queryset.review_end
            if not review_end_time:
                data['review_end'] = datetime.datetime.now()

            serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                             context={"request": self.request})
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({'message': 'SUCCESS'})
            return Response(serializer.errors)
        except Exception as e:
            return JsonResponse({'message': 'Failed to generate final results!', 'error': str(e)})

    @list_route(methods=['post'])
    def export_data(self, request):
        data = request.data
        slug = ast.literal_eval(str(data['slug']))[0]
        try:
            image_queryset = OCRImage.objects.get(slug=slug)
            final_result = json.loads(image_queryset.final_result)
            flag = final_result['domain_classification']
            if flag == 'Time Sheet':
                data['format'] = 'csv'
                df = timesheet_main(final_result)
                result = df.to_csv()
                response = HttpResponse(result, content_type="application/text")
                response['Content-Disposition'] = 'attachment; filename={}.csv'.format(data['slug'])
                return response
            result = image_queryset.google_response
            if data['format'] == 'json':
                response = HttpResponse(result, content_type="application/json")
                response['Content-Disposition'] = 'attachment; filename={}.json'.format(data['slug'])
            elif data['format'] == 'xml':
                result = json_2_xml(result)
                response = HttpResponse(result, content_type="application/xml")
                response['Content-Disposition'] = 'attachment; filename={}.xml'.format(data['slug'])
            elif data['format'] == 'csv':
                result = json_2_csv(json.loads(result))
                response = HttpResponse(result, content_type="application/text")
                response['Content-Disposition'] = 'attachment; filename={}.csv'.format(data['slug'])
            else:
                response = JsonResponse({'message': 'Invalid export format!'})
            return response
        except Exception as e:
            return JsonResponse({'message': 'Failed to export data!', 'error': str(e)})

    @list_route(methods=['post'])
    def confidence_filter(self, request):
        data = request.data
        user_input = 1
        if 'filter' in data:
            user_input = data['filter']
        slug = data['slug']
        try:
            image_queryset = OCRImage.objects.get(slug=slug)
            analysis = json.loads(image_queryset.analysis)
            final_json = json.loads(image_queryset.final_result)
            mask = 'ocr/ITE/database/{}_mask.png'.format(data['slug'])
            image_path = 'ocr/ITE/database/{}_gen_image.png'.format(data['slug'])

            gen_image, _, _ = ui_flag_v2(cv2.imread(mask), final_json, image_path,
                                         analysis, percent=user_input)

            image = base64.decodebytes(gen_image)
            with open('ocr/ITE/database/{}_gen_image.png'.format(data['slug']), 'wb') as f:
                f.write(image)

            data['generated_image'] = File(name='{}_gen_image.png'.format(data['slug']),
                                           file=open('ocr/ITE/database/{}_gen_image.png'.format(data['slug']), 'rb'))
            serializer = self.get_serializer(instance=image_queryset, data=data, partial=True,
                                             context={"request": self.request})
            if serializer.is_valid():
                serializer.save()
                od = OCRImageExtractListSerializer(instance=image_queryset, context={'request': request})
                object_details = od.data
                object_details['message'] = 'SUCCESS'
                return Response(object_details)
            return Response(serializer.errors)
        except Exception as e:
            return JsonResponse({'message': 'Failed to generate image!', 'error': str(e)})

    @list_route(methods=['post'])
    def update_template(self, request):
        data = request.data
        slug = data['slug']
        template = data['template']
        try:
            image_queryset = OCRImage.objects.get(slug=slug)
            image_queryset.classification = template
            print(image_queryset.classification)
            image_queryset.save()
            name = image_queryset.imagefile.path.split('/')[-1]
            classification = image_queryset.classification
            template_data = Template.objects.first()
            template_classification = json.loads(template_data.template_classification)
            for item in template_classification[classification]['Pages']:
                if slug in item:
                    template_classification[classification]['Pages'].remove(item)
                    template_classification[template]['Pages'].append(item)
                else:
                    if name == item:
                        template_classification[classification]['Pages'].remove(name)
                        template_classification[template]['Pages'].append(name)
            template_data.template_classification = json.dumps(template_classification)
            template_data.save()
            return JsonResponse({'message': 'SUCCESS'})
        except Exception as e:
            return JsonResponse({'message': 'Failed to modify template!', 'error': str(e)})

    @detail_route(methods=['get'])
    def all(self, request, *args, **kwargs):
        project = OCRImage.objects.get(slug=self.kwargs['slug']).project
        queryset = OCRImage.objects.filter(
            created_by=self.request.user,
            deleted=False,
            project=project
        )
        serializer = OCRImageNameListSerializer(queryset, many=True, context={"request": self.request})
        return Response({
            "data": set(item['name'] for item in serializer.data)
        })

    def delete(self, request, *args, **kwargs):
        """
        TODO
        """
        pass


class OCRImagesetView(viewsets.ModelViewSet, viewsets.GenericViewSet):
    """
    Model: OCRImage
    Viewset : OCRImageView
    Description :
    """
    serializer_class = OCRImageSetSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    pagination_class = CustomOCRPagination
    permission_classes = (OCRImageRelatedPermission,)

    def get_queryset(self):
        """
        Returns an ordered queryset object of OCRImageset filtered for a particular user.
        """
        queryset = OCRImageset.objects.filter(
            created_by=self.request.user,
            deleted=False,
            status__in=['Not Registered']
        ).order_by('-created_at')
        return queryset

    def get_object_from_all(self):
        """
        Returns the queryset of OCRImageset filtered by the slug.
        """
        return OCRImageset.objects.get(
            slug=self.kwargs.get('slug'),
            created_by=self.request.user,
            deleted=False
        )

    # pylint: disable=unused-argument
    def retrieve(self, request, *args, **kwargs):
        ocrimageset_object = self.get_object_from_all()
        imageset_list = ocrimageset_object.imagepath
        imageset_list = ast.literal_eval(imageset_list)
        image_queryset = OCRImage.objects.filter(
            name__in=imageset_list,
            imageset=ocrimageset_object.id,
            deleted=False)
        return get_image_list_data(
            viewset=OCRImageView,
            queryset=image_queryset,
            request=request,
            serializer=OCRImageListSerializer
        )

    def list(self, request, *args, **kwargs):
        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=OCRImageSetListSerializer
        )


class ProjectView(viewsets.ModelViewSet, viewsets.GenericViewSet):
    """
    Model: Project
    Viewset : ProjectView
    Description :
    """
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    pagination_class = CustomOCRPagination
    permission_classes = (OCRImageRelatedPermission,)

    def get_queryset(self):
        """
        Returns an ordered queryset object of OCRImageset filtered for a particular user.
        """
        queryset = Project.objects.filter(
            created_by=self.request.user,
            deleted=False,
        ).order_by('-created_at')
        return queryset

    def get_object_from_all(self):
        """
        Returns the queryset of OCRImageset filtered by the slug.
        """
        return Project.objects.get(
            slug=self.kwargs.get('slug'),
            created_by=self.request.user,
            deleted=False
        )

    def get_reviewer_queryset(self, user):
        """
        Returns an ordered queryset object of Project filtered for a particular user.
        """
        userGroup = user.groups.all()[0].name
        if userGroup == 'ReviewerL1':
            queryset = Project.objects.filter(
                ocrimage__l1_assignee=self.request.user,
                deleted=False,
            ).order_by('-created_at').distinct()
        else:
            queryset = Project.objects.filter(
                ocrimage__assignee=self.request.user,
                deleted=False,
            ).order_by('-created_at').distinct()
        return queryset

    def total_projects(self):
        return Project.objects.filter(created_by=self.request.user).count()

    def total_reviewers(self):
        return OCRUserProfile.objects.filter(
            ocr_user__groups__name__in=['ReviewerL1', 'ReviewerL2'],
            supervisor=self.request.user,
            # is_active=True
        ).count()

    def total_documents(self):
        return OCRImage.objects.filter(
            created_by=self.request.user,
            deleted=False
        ).count()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("File Doesn't exist.")

        serializer = ProjectSerializer(instance=instance, context={'request': request})
        object_details = serializer.data

        return Response(object_details)

    def list(self, request, *args, **kwargs):
        result = get_listed_data(
            viewset=self,
            request=request,
            list_serializer=ProjectListSerializer
        )
        result.data['overall_info'] = {
            "totalProjects": self.total_projects(),
            "totalDocuments": self.total_documents(),
            "totalReviewers": self.total_reviewers()
        }
        return result

    def create(self, request, *args, **kwargs):

        response = dict()

        if 'data' in kwargs:
            data = kwargs.get('data')
        else:
            data = request.data
        data = convert_to_string(data)
        projectname_list = []
        project_query = self.get_queryset()
        for i in project_query:
            projectname_list.append(i.name)
        if data['name'] in projectname_list:
            response['project_serializer_error'] = creation_failed_exception("project name already exists!.").data[
                'exception']
            response['project_serializer_message'] = 'FAILED'
            return JsonResponse(response)

        data['created_by'] = request.user.id

        serializer = ProjectSerializer(data=data, context={"request": self.request})

        if serializer.is_valid():
            project_object = serializer.save()
            project_object.create()
            response['project_serializer_data'] = serializer.data
            response['project_serializer_message'] = 'SUCCESS'
        else:
            response['project_serializer_error'] = serializer.errors
            response['project_serializer_message'] = 'FAILED'
        return JsonResponse(response)

    @detail_route(methods=['get'])
    def all(self, request, *args, **kwargs):

        project = Project.objects.get(slug=self.kwargs['slug'])
        queryset = OCRImage.objects.filter(project=project).order_by('-created_at')
        object_details = get_image_list_data(
            viewset=OCRImageView,
            queryset=queryset,
            request=request,
            serializer=OCRImageListSerializer
        )

        object_details.data['total_data_count_wf'] = len(queryset)
        return object_details

    @list_route(methods=['get'])
    def reviewer(self, request, *args, **kwargs):
        result = get_filtered_project_list(
            viewset=self,
            request=request,
            list_serializer=ProjectListSerializer
        )
        return result

    def update(self, request, *args, **kwargs):
        data = request.data
        data = convert_to_string(data)

        if 'name' in data:
            projectname_list = []
            project_query = Project.objects.filter(deleted=False, created_by=request.user)
            for _, i in enumerate(project_query):
                projectname_list.append(i.name)
            if data['name'] in projectname_list:
                return creation_failed_exception("Name already exists!.")
            should_proceed = name_check(data['name'])
            if should_proceed < 0:
                if should_proceed == -1:
                    return creation_failed_exception("Name is empty.")
                if should_proceed == -2:
                    return creation_failed_exception("Name is very large.")
                if should_proceed == -3:
                    return creation_failed_exception("Name have special_characters.")

        try:
            instance = self.get_object_from_all()
        except FileNotFoundError:
            return creation_failed_exception("File Doesn't exist.")

        serializer = self.get_serializer(instance=instance, data=data, partial=True, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
