from django.conf.urls import include, url
from api.views import errand

urlpatterns = [
    url(r'make/', errand.make)
]
