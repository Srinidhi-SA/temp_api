from django.conf.urls import url
from rest_framework import routers

from ocr import views
from ocr.views import ocr_datasource_config_list

urlpatterns = [
    url(r'^datasource/ocr_datasource_config_list$', ocr_datasource_config_list, name="ocr_datasource_config_list"),
]
print(urlpatterns)
