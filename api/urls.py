# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import url
from rest_framework import routers

from api import views
from datasets.views import DatasetView
from views import ScoreView, StockDatasetView, get_concepts_to_show_in_ui
from views import SignalView, get_datasource_config_list
from views import TrainerView
from views import RoboView
from views import AudiosetView

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
    'score',
    ScoreView,
    base_name='score'
)

router.register(
    'robo',
    RoboView,
    base_name='robo'
)

router.register(
    'audioset',
    AudiosetView,
    base_name='audioset'
)

router.register(
    'stockdataset',
    StockDatasetView,
    base_name='stockdataset'
)

from api.user_helper import upload_photo, get_profile_image
urlpatterns = [
    url(r'^datasource/get_config_list$',get_datasource_config_list , name="datasource_get_config_list"),
    url(r'^job/(?P<slug>[^/.]+)/get_config$',views.get_config , name="get_config"),
    url(r'^job/(?P<slug>[^/.]+)/set_result',views.set_result , name="set_result"),
    url(r'^job/(?P<slug>[^/.]+)/use_set_result',views.use_set_result , name="use_set_result"),
    url(r'^download_data/(?P<slug>[^/.]+)',views.get_chart_or_small_data , name="get_chart_or_small_data"),
    url(r'^random_test_api',views.random_test_api , name="random_test_api"),
    url(r'^get_info',views.get_info , name="get_info"),
    url(r'^messages/(?P<slug>[^/.]+)/',views.set_messages , name="set_messages"),
    url(r'^upload_photo',upload_photo , name="upload_photo"),
    url(r'^get_profile_image/(?P<slug>[^/.]+)/',get_profile_image , name="get_profile_image"),
    url(r'^stockdatasetfiles/(?P<slug>[^/.]+)/',views.get_stockdatasetfiles , name="get_stockdatasetfiles"),
    url(r'^get_profile_image/(?P<slug>[^/.]+)/', get_profile_image, name="get_profile_image"),
    url(r'^get_concepts/', get_concepts_to_show_in_ui, name="get_concepts"),
]


urlpatterns += router.urls
# print urlpatterns

