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
        user = request.user

        if request.method in ['GET']:
            return user.has_perm('api.view_dataset')

        if request.method in ['POST']:
            data = request.data
            datasource_type = data.get('datasource_type')
            print datasource_type
            if user.has_perm('api.create_dataset'):
                if datasource_type == 'fileUpload':
                    return user.has_perm('api.upload_from_file')
                elif datasource_type == 'MySQL':
                    return user.has_perm('api.upload_from_mysql')
                elif datasource_type == 'mssql':
                    return user.has_perm('api.upload_from_mssql')
                elif datasource_type == 'Hana':
                    return user.has_perm('api.upload_from_hana')
                elif datasource_type == 'Hdfs':
                    return user.has_perm('api.upload_from_hdfs')

            return False

        if request.method in ['PUT']:
            data = request.data
            path = request.path

            if 'meta_data_modifications' in path:
                return user.has_perm('api.data_validation')

            if 'subsetting' in data:
                if data['subsetting'] == True:
                    return user.has_perm('api.subsetting_dataset')

            if 'deleted' in data:
                if data['deleted'] == True:
                    return user.has_perm('api.remove_dataset')

            return user.has_perm('api.rename_dataset')


class SignalsRelatedPermission(permissions.BasePermission):
    message = 'Permission for signals.'

    def has_permission(self, request, view):
        user = request.user
        if request.method in ['GET']:
            return user.has_perm('api.view_signal')

        if request.method in ['POST']:
            return user.has_perm('api.create_signal')

        if request.method in ['PUT']:
            data = request.data

            if 'deleted' in data:
                if data['deleted'] == True:
                    return user.has_perm('api.remove_signal')

            return user.has_perm('api.rename_signal')


class TrainerRelatedPermission(permissions.BasePermission):
    message = 'Permission for trainers.'

    def has_permission(self, request, view):
        user = request.user
        if request.method in ['GET']:
            return user.has_perm('api.view_trainer')

        if request.method in ['POST']:
            return user.has_perm('api.create_trainer')

        if request.method in ['PUT']:
            data = request.data

            if 'deleted' in data:
                if data['deleted'] == True:
                    return user.has_perm('api.remove_trainer')

            return user.has_perm('api.rename_trainer')


class ScoreRelatedPermission(permissions.BasePermission):
    message = 'Permission for scores.'

    def has_permission(self, request, view):
        user = request.user
        if request.method in ['GET']:
            return user.has_perm('api.view_score')

        if request.method in ['POST']:
            return user.has_perm('api.create_score')

        if request.method in ['PUT']:
            data = request.data

            if 'deleted' in data:
                if data['deleted'] == True:
                    return user.has_perm('api.remove_score')

            return user.has_perm('api.rename_score')


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
