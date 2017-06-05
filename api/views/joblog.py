from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.http import Http404

from api.models.joblog import Jobdetail, JobSerializer

# class JobViewSet(viewsets.ModelViewSet):
#     """
#     View set fo Jobserver:
#     """
#
#     # overriding queryset attribute of ModelViewSet class
#     #       queryset = Jobdetail.objects.all()
#     # but can be customized by overriding function
#     #       def get_queryset(self):
#     def get_queryset(self):
#         return self.request.user.accounts.all()
#
#     serializer_class = JobSerializer

class JobGetCreateSet(APIView):
    """
    List all the jobs or create a new job
    """

    def get(self, request):
        jobs = Jobdetail.objects.all()
        job_serialized = JobSerializer(jobs, many=True)
        return Response(job_serialized.data)

    def post(self, request, format=None):
        user = request.user
        data = request.data
        data['submitted_by'] = user.id
        serializer = JobSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobUpdateRetrieveDelete(APIView):

    def get_object(self, pk):
        try:
            return Jobdetail.objects.get(pk=pk)
        except Jobdetail.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        job = self.get_object(pk)
        serializer = JobSerializer(job).data

        return Response(serializer)

    def put(self, request, pk, format=None):
        job = self.get_object(pk)
        serializer = JobSerializer(job).data

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        snippet = self.get_object(pk)
        snippet.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
