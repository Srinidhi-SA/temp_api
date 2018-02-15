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


class DatasetRelatedPermission(permissions.BasePermission):
    message = 'Permission for datasets.'

    def has_permission(self, request, view):
        if request.method in ['GET']:
            return request.user.has_perm('view_dataset')

        if request.method in ['POST']:
            data = request.data
            datasource_type = data.get('datasource_type')

            if request.user.has_perm('create_dataset'):
                if datasource_type == 'fileUpload':
                    return request.user.has_perm('upload_from_file')
                elif datasource_type == 'MySQL':
                    return request.user.has_perm('upload_from_mysql')
                elif datasource_type == 'mssql':
                    return request.user.has_perm('upload_from_mssql')
                elif datasource_type == 'Hana':
                    return request.user.has_perm('upload_from_hana')

            return False

        if request.method in ['PUT']:
            data = request.data
            path = request.path

            if 'meta_data_modifications' in path:
                return request.user.has_perm('data_validation')

            if 'subsetting' in data:
                if data['subsetting'] == True:
                    return request.user.has_perm('subsetting_dataset')

            if 'delete' in data:
                if data['delete'] == True:
                    return request.user.has_perm('remove_dataset')

            return request.user.has_perm('rename_dataset')


class SuperUserPermission(permissions.BasePermission):
    message = 'All gud in superuser.'

    def has_permission(self, request, view):
        user = request.user

        # if user is superadmin then allowed to access
        if user.is_superuser:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        pass
