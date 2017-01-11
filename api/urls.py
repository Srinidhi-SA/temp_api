from django.conf.urls import include, url
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.views import errand

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def test(request):
    return Response({"message": "Is this a test?", "data": "Yes it is!"});

urlpatterns = [
    url(r'test', test),
    url(r'env', errand.get_env),
    url(r'errand/uploaded_files', errand.get_uploaded_files),
    url(r'errand/make', errand.make),
    url(r'errand/preview', errand.preview),
    url(r'errand/get_meta', errand.get_meta),
    url(r'errand/columns', errand.columns),
    url(r'errand/get_measures', errand.columns),
    url(r'errand/set_dimensions', errand.set_dimensions),
    url(r'errand/set_measure', errand.set_measure),
    url(r'errand/get_results', errand.get_results),
    url(r'errand/archived', errand.get_archived),
    url(r'errand/archive', errand.set_archived)

]
