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

# import urls



router = routers.DefaultRouter()
router.register(
    'datasets',
    DatasetView,
    base_name='datasets'
)

urlpatterns = [

]

urlpatterns += router.urls

