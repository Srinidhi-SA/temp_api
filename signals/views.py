# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# import python defaults

# import django defaults

# import rest_framework
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

# import helper


# import models
from models import Signal

# import serializers
from serializers import SignalSerializer

# import views

# create views here


class SignalView(viewsets.ModelViewSet):

    def get_queryset(self):
        return Signal.objects.all()

    def get_serializer_class(self):
        return SignalSerializer

    def list(self, request, *args, **kwargs):
        queryset = Signal.objects.filter(
            created_by=request.user,
            deleted=False
        )
        return Response(SignalSerializer(queryset, many=True).data)

    def create(self, request, *args, **kwargs):
        data = request.data
        data['created_by'] = request.user.id  # "Incorrect type. Expected pk value, received User."
        serializer = SignalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

    # def retrieve(self, request, *args, **kwargs):
    #     pass
    #
    # def update(self, request, *args, **kwargs):
    #     pass
    #
    # def partial_update(self, request, *args, **kwargs):
    #     pass
    #
    # def destroy(self, request, *args, **kwargs):
    #     pass

    @detail_route(methods=['post'])
    def register(self, respect, pk=None):
        pass

    @detail_route(methods=['post'])
    def make(self, respect, pk=None):
        pass

    @detail_route(methods=['get'])
    def get_measure(self, respect, pk=None):
        pass