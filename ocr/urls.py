from django.conf.urls import url
from rest_framework import routers

from ocr import views
from ocr.views import ocr_datasource_config_list
from ocr.views import OCRImageView

router = routers.DefaultRouter()
router.register(
    'ocrimage',
    OCRImageView,
    base_name='ocrimages'
)

urlpatterns = [
    url(r'^datasource/ocr_datasource_config_list$', ocr_datasource_config_list, name="ocr_datasource_config_list"),
]
urlpatterns += router.urls
#print(urlpatterns)
