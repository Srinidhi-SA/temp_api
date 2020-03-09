from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from ocrflow.models import Task, SimpleFlow, ReviewRequest
from .serializers import TaskSerializer, \
    ReviewRequestListSerializer, \
    ReviewRequestSerializer
from ocr.pagination import CustomOCRPagination
from ocr.query_filtering import get_listed_data
from django.http import JsonResponse

# Create your views here.
class TaskView(viewsets.ModelViewSet):
    """
    Model: Task
    Description :
    """
    serializer_class = TaskSerializer
    model = Task
    permission_classes = (IsAuthenticated,)
    pagination_class = CustomOCRPagination

    print("~"*100)

    def get_queryset(self):
        queryset = Task.objects.all()
        return queryset

    def list(self, request):
        # Note the use of `get_queryset()` instead of `self.queryset`
        # queryset = self.get_queryset()
        # serializer = TaskSerializer(queryset, many=True)
        # return Response(serializer.data)
        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=TaskSerializer
        )

    # def get_context_data(self, **kwargs):
    #     context = super(
    #         TaskView, self).get_context_data(**kwargs)
    #     context['approval_form'] = self.task.get_approval_form
    #     return context

    @property
    def task(self):
        return self.get_object()

    def post(self, request, *args, **kwargs):
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
        queryset = ReviewRequest.objects.all()
        return queryset

    def get_object_from_all(self):

        return ReviewRequest.objects.get(
            id=self.kwargs.get('id')
        )

    def list(self, request):

        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=ReviewRequestListSerializer
        )

    def retrieve(self, request, *args, **kwargs):
        """Returns specific object details"""
        instance = self.get_object_from_all()

        if instance is None:
            return retrieve_failed_exception("ReviewRequest object Doesn't exist.")

        serializer = ReviewRequestSerializer(instance=instance, context={'request': request})

        return Response(serializer.data)
