from rest_framework import viewsets, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from ocrflow.models import Task, SimpleFlow, ReviewRequest, OCRRules
from .serializers import TaskSerializer, \
    ReviewRequestListSerializer, \
    ReviewRequestSerializer, \
    OCRRulesSerializer
from ocr.serializers import OCRImageSerializer
from ocr.models import OCRImage
from ocr.pagination import CustomOCRPagination
from ocr.query_filtering import get_listed_data, get_specific_assigned_requests
from django.http import JsonResponse
from rest_framework.decorators import list_route, detail_route
from django.core.exceptions import PermissionDenied
from rest_framework.decorators import list_route, detail_route
import simplejson as json
import datetime

# Create your views here.
class OCRRulesView(viewsets.ModelViewSet):
    """
    Model: OCRRules
    Description : Defines OCR rules for reviewer task assignments
    """
    serializer_class = OCRRulesSerializer
    model = OCRRules
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = Task.objects.all()
        return queryset

    @list_route(methods=['post'])
    def autoAssignment(self,request):
        data = request.data
        print(data['autoAssignment'])
        if data['autoAssignment']== "True":
            print("Active")
            ruleObj = OCRRules.objects.get(id=1)
            ruleObj.auto_assignment = True
            ruleObj.save()
            return JsonResponse({"message":"Auto-Assignment Active.", "status": True})
        else:
            ruleObj = OCRRules.objects.get(id=1)
            ruleObj.auto_assignment = False
            ruleObj.save()
            return JsonResponse({"message":"Auto-Assignment De-active.", "status": True})

    @list_route(methods=['post'])
    def modifyRulesL1(self, request, *args, **kwargs):
        modifiedrule = request.data
        ruleObj = OCRRules.objects.get(id=1)
        ruleObj.rulesL1 = json.dumps(modifiedrule)
        ruleObj.modified_at = datetime.datetime.now()
        ruleObj.save()
        return JsonResponse({"message":"Rules L1 Updated.", "status": True})

    @list_route(methods=['post'])
    def modifyRulesL2(self, request, *args, **kwargs):
        modifiedrule = request.data
        ruleObj = OCRRules.objects.get(id=1)
        ruleObj.rulesL2 = json.dumps(modifiedrule)
        ruleObj.modified_at = datetime.datetime.now()
        ruleObj.save()
        return JsonResponse({"message":"Rules L2 Updated.", "status": True})

    @list_route(methods=['get'])
    def get_rules(self, request):
        ruleObj = OCRRules.objects.get(id=1)
        serializer = OCRRulesSerializer(instance=ruleObj, context={"request": self.request})
        return Response(serializer.data)

class TaskView(viewsets.ModelViewSet):
    """
    Model: Task
    Description :
    """
    serializer_class = TaskSerializer
    model = Task
    permission_classes = (IsAuthenticated,)
    pagination_class = CustomOCRPagination

    def get_queryset(self):
        queryset = Task.objects.all()
        return queryset

    def list(self, request):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=TaskSerializer
        )

    @property
    def task(self):
        return self.get_object()

    def post(self, request, *args, **kwargs):
        task_object = self.task
        if request.user == task_object.assigned_user:
            form = self.task.get_approval_form(request.POST)
            if form.is_valid():
                self.task.submit(
                    form,
                    request.user
                )
                return JsonResponse({
                    "submitted": True,
                    "message": "Task Updated Successfully."
                })
            else:
                return JsonResponse({
                    "submitted": False,
                    "message": form.errors
                })
        else:
            raise PermissionDenied("Not allowed to perform this POST action.")

class ReviewRequestView(viewsets.ModelViewSet):
    """
    Model: ReviewRequest
    Description :
    """
    serializer_class = ReviewRequestListSerializer
    model = ReviewRequest
    permission_classes = (IsAuthenticated,)
    pagination_class = CustomOCRPagination

    def get_queryset(self):
        queryset = ReviewRequest.objects.all().order_by('-created_on')
        return queryset

    def get_specific_assigned_queryset(self, username):
        queryset = ReviewRequest.objects.filter(
            tasks__assigned_user__username=username
            ).order_by('-created_on')
        return queryset

    def get_object_from_all(self):

        return ReviewRequest.objects.get(
            slug=self.kwargs.get('pk')
        )

    def list(self, request):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=ReviewRequestListSerializer
        )

    @list_route(methods=['get'])
    def assigned_requests(self, request, *args, **kwargs):
        username = self.request.query_params.get('username')
        return get_specific_assigned_requests(
            viewset=self,
            request=request,
            list_serializer=ReviewRequestSerializer,
            username=username
        )

    def retrieve(self, request, *args, **kwargs):
        """Returns specific object details"""
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("ReviewRequest object Doesn't exist.")

        serializer = ReviewRequestSerializer(instance=instance, context={'request': request})

        return Response(serializer.data)
