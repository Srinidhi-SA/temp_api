from django.db import models
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework.response import Response
from django.http import JsonResponse
import random
import string
from django.template.defaultfilters import slugify
from rest_framework import permissions


class DummyPermission(permissions.BasePermission):
    message = 'Adding Dummy not allowed.'

    def has_permission(self, request, view):
        user = request.user

        if user.is_superuser:
            return True
        else:
            if request.method in permissions.SAFE_METHODS:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        pass


class Dummy(models.Model):
    job_type = models.CharField(max_length=300, null=False)
    object_id = models.CharField(max_length=300, null=False)
    name = models.CharField(max_length=300, null=False, default="")
    slug = models.SlugField(null=True, max_length=300)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(User, null=False)
    deleted = models.BooleanField(default=False)

    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(str(self.name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    def save(self, *args, **kwargs):
        self.generate_slug()
        super(Dummy, self).save(*args, **kwargs)


class DummySerializer(serializers.ModelSerializer):

    class Meta:
        model = Dummy
        exclude = ( 'id', 'updated_at')


class DummyView(viewsets.ModelViewSet):

    def get_queryset(self):
        queryset = Dummy.objects.filter(
            created_by=self.request.user,
            deleted=False
        )
        return queryset

    def get_object_from_all(self):
        return Dummy.objects.get(slug=self.kwargs.get('slug'))

    serializer_class = DummySerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend,)
    permission_classes = (DummyPermission, )

    def create(self, request, *args, **kwargs):
        data = request.data
        data['created_by'] = request.user.id

        seriali = DummySerializer(data=data)
        if seriali.is_valid():
            instance = seriali.save()
            return JsonResponse(seriali.data)





