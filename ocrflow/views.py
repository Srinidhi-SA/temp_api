import datetime

import simplejson as json
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ocr.pagination import CustomOCRPagination
from ocr.permission import IsOCRAdminUser
from ocr.query_filtering import get_listed_data, get_specific_assigned_requests
from ocrflow.forms import feedbackForm
from ocrflow.models import Task, ReviewRequest, OCRRules
from .serializers import TaskSerializer, \
    ReviewRequestListSerializer, \
    ReviewRequestSerializer, \
    OCRRulesSerializer


# Create your views here.
class OCRRulesView(viewsets.ModelViewSet):
    """
    Model: OCRRules
    Description : Defines OCR rules for reviewer task assignments
    """
    serializer_class = OCRRulesSerializer
    model = OCRRules
    permission_classes = (IsAuthenticated, IsOCRAdminUser)

    @list_route(methods=['post'])
    def autoAssignment(self, request):
        data = request.data
        if data['autoAssignment'] == "True":
            if data['stage'] == "initial":
                ruleObj = OCRRules.objects.get(id=1)
                ruleObj.auto_assignmentL1 = True
                ruleObj.save()
                return JsonResponse({"message": "Initial Auto-Assignment Active.", "status": True})
            elif data['stage'] == "secondary":
                ruleObj = OCRRules.objects.get(id=1)
                ruleObj.auto_assignmentL2 = True
                ruleObj.save()
                return JsonResponse({"message": "Secondary Auto-Assignment Active.", "status": True})
        else:
            if data['stage'] == "initial":
                ruleObj = OCRRules.objects.get(id=1)
                ruleObj.auto_assignmentL1 = False
                ruleObj.save()
                return JsonResponse({"message": "Initial Auto-Assignment De-active.", "status": True})
            elif data['stage'] == "secondary":
                ruleObj = OCRRules.objects.get(id=1)
                ruleObj.auto_assignmentL2 = False
                ruleObj.save()
                return JsonResponse({"message": "Secondary Auto-Assignment De-active.", "status": True})

    @list_route(methods=['post'])
    def modifyRulesL1(self, request, *args, **kwargs):
        modifiedrule = request.data
        ruleObj = OCRRules.objects.get(id=1)
        ruleObj.rulesL1 = json.dumps(modifiedrule)
        ruleObj.modified_at = datetime.datetime.now()
        ruleObj.save()
        return JsonResponse({"message": "Rules L1 Updated.", "status": True})

    @list_route(methods=['post'])
    def modifyRulesL2(self, request, *args, **kwargs):
        modifiedrule = request.data
        ruleObj = OCRRules.objects.get(id=1)
        ruleObj.rulesL2 = json.dumps(modifiedrule)
        ruleObj.modified_at = datetime.datetime.now()
        ruleObj.save()
        return JsonResponse({"message": "Rules L2 Updated.", "status": True})

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

    @list_route(methods=['post'])
    def feedback(self, request, *args, **kwargs):
        instance = Task.objects.get(id=self.request.query_params.get('feedbackId'))
        if request.user == instance.assigned_user:
            form = feedbackForm(request.POST)
            if form.is_valid():
                bad_scan = form.cleaned_data['bad_scan']
                instance.bad_scan = bad_scan
                instance.save()
                return JsonResponse({
                    "submitted": True,
                    "message": "Feedback submitted Successfully."
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
        response = get_specific_assigned_requests(
            viewset=self,
            request=request,
            list_serializer=ReviewRequestSerializer,
            username=username
        )
        add_key = response.data['data']
        accuracy_operator, accuracy = request.GET['accuracy'][:3], request.GET['accuracy'][3:]
        fields_operator, fields = request.GET['fields'][:3], request.GET['fields'][3:]

        if accuracy:
            if accuracy_operator == 'GTE':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['confidence'] >= float(accuracy):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]
            if accuracy_operator == 'LTE':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['confidence'] <= float(accuracy):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]
            if accuracy_operator == 'EQL':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['confidence'] == float(accuracy):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]

        if fields:
            if fields_operator == 'GTE':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['fields'] >= int(fields):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]
            if fields_operator == 'LTE':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['fields'] <= int(fields):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]
            if fields_operator == 'EQL':
                buffer = list()
                for user in add_key:
                    if not user['ocrImageData']['fields'] == int(fields):
                        buffer.append(user)
                add_key = [ele for ele in add_key if ele not in buffer]

        response.data['data'] = add_key
        return response

    def retrieve(self, request, *args, **kwargs):
        """Returns specific object details"""
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("ReviewRequest object Doesn't exist.")

        serializer = ReviewRequestSerializer(instance=instance, context={'request': request})

        return Response(serializer.data)
