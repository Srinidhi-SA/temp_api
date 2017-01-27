from django.conf.urls import include, url
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from api.views import errand, dataset

@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def test(request):
    return Response({"message": "Is this a test?", "data": "Yes it is!"});

urlpatterns = [
    url(r'test', test),
    url(r'env', errand.get_env),

    # DATASETSS
    url(r'dataset/create', dataset.create),
    url(r'dataset/all', dataset.all),
    url(r'dataset/preview', dataset.preview),
    url(r'dataset/get_meta', dataset.get_meta),

    # ERRANDS
    url(r'errand/uploaded_files', errand.get_uploaded_files),
    url(r'errand/make', errand.make),
    url(r'errand/columns', errand.columns),
    url(r'errand/get_measures', errand.columns),
    url(r'errand/set_dimension', errand.set_dimension),
    url(r'errand/set_measure', errand.set_measure),
    url(r'errand/get_results', errand.get_results),
    url(r'errand/archived', errand.get_archived),
    url(r'errand/archive', errand.set_archived),
    url(r'errand/get_frequency_results', errand.get_frequency_results),
    url(r'errand/get_tree_results', errand.get_tree_results),
    url(r'errand/get_tree_narratives', errand.get_tree_narratives)

]
