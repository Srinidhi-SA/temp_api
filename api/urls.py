# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url
from rest_framework import routers

from api import views
from datasets.views import DatasetView
from views import ScoreView
from views import SignalView, get_datasource_config_list
from views import TrainerView
from views import RoboView

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

router.register(
    'trainer',
    TrainerView,
    base_name='trainer'
)

router.register(
    'trainer',
    TrainerView,
    base_name='trainer'
)

router.register(
    'score',
    ScoreView,
    base_name='score'
)

router.register(
    'robo',
    RoboView,
    base_name='robo'
)

urlpatterns = [
    url(r'^datasource/get_config_list$',get_datasource_config_list , name="datasource_get_config_list"),
    url(r'^job/(?P<slug>[^/.]+)/get_config$',views.get_config , name="get_config"),
    url(r'^job/(?P<slug>[^/.]+)/set_result',views.set_result , name="set_result"),
    url(r'^job/(?P<slug>[^/.]+)/use_set_result',views.use_set_result , name="use_set_result"),
    url(r'^download_data/(?P<slug>[^/.]+)',views.get_chart_or_small_data , name="get_chart_or_small_data"),
    url(r'^random_test_api',views.random_test_api , name="random_test_api"),
]

urlpatterns += router.urls
# print urlpatterns

