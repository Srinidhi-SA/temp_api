from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from ocrflow.models import Task
from .serializers import TaskSerializer
from ocr.pagination import CustomOCRPagination
from ocr.query_filtering import get_listed_data

# Create your views here.
class TaskListView(generics.ListCreateAPIView):
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
        # Note the use of `get_queryset()` instead of `self.queryset`
        # queryset = self.get_queryset()
        # serializer = TaskSerializer(queryset, many=True)
        # return Response(serializer.data)
        return get_listed_data(
            viewset=self,
            request=request,
            list_serializer=TaskSerializer
        )
