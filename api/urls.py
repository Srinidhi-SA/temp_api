# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# import python defaults


# import django defaults
from django.conf.urls import include, url

# import rest_framework
from rest_framework import routers

# import helper


# import models


# import serializers


# import views
from datasets.views import DatasetView
from signals.views import SignalView

# import urls

# Start adding urlconf from here

router = routers.DefaultRouter()
router.register(
    'datasets',
    DatasetView,
    base_name='datasets'
)

router.register(
    'signals',
    SignalView,
    base_name='signals'
)

urlpatterns = [

]

urlpatterns += router.urls

