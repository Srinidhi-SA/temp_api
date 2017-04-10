from django.conf.urls import include, url
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required

from api.views import errand, dataset, robo, option, user

@login_required
@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def test(request):
    return Response({"message": "Is this a test?", "data": "Yes it is!"});

urlpatterns = [
    url(r'test', test),
    url(r'env', errand.get_env),

    # USERS
    url(r'user/login', user.login),
    url(r'user/profile', user.profile),
    url(r'user/logout', user.logout),

    # DATASETSS
    url(r'dataset/create', dataset.create),
    url(r'dataset/all', dataset.all),
    url(r'dataset/preview', dataset.preview),
    url(r'dataset/get_meta', dataset.get_meta),
    url(r'dataset/edit', dataset.edit),
    url(r'dataset/delete', dataset.delete),
    url(r'dataset/filter', dataset.filter_sample),
    url(r'dataset/quickinfo', dataset.quickinfo),

    # ERRANDS
    url(r'errand/uploaded_files', errand.get_uploaded_files),
    url(r'errand/make', errand.make),
    url(r'errand/columns', errand.columns),
    url(r'errand/get_measures', errand.columns),
    url(r'errand/set_dimension', errand.set_dimension),
    url(r'errand/set_column_data', errand.set_column_data),
    url(r'errand/set_measure', errand.set_measure),
    url(r'errand/get_results', errand.get_results),
    url(r'errand/archived', errand.get_archived),
    url(r'errand/archive', errand.set_archived),
    url(r'errand/get_frequency_results', errand.get_frequency_results),
    url(r'errand/get_tree_results_raw', errand.get_tree_results_raw),
    url(r'errand/get_tree_results', errand.get_tree_results),
    url(r'errand/get_tree_narratives', errand.get_tree_narratives),
    url(r'errand/get_chi_results', errand.get_chi_results),
    url(r'errand/edit', errand.edit),
    url(r'errand/delete', errand.delete),
    url(r'errand/configure_data', errand.configure_data),
    url(r'errand/(?P<errand_id>\d+)/log_status', errand.log_status),
    url(r'errand/quickinfo', errand.quickinfo),
    url(r'errand/get_trend_analysis', errand.get_trend_analysis),
    url(r'errand/get_dimension_all_results', errand.get_dimension_all_results),

    # ROBOS
    url(r'robo/create', robo.create),
    url(r'robo/all', robo.all),
    url(r'robo/preview', robo.preview),
    url(r'robo/get_results', robo.get_results),
    url(r'robo/edit', robo.edit),
    url(r'robo/delete', robo.delete),

    # OPTIONS
    url(r'option/get_all', option.get_all),
    url(r'option/get_dict', option.get_dict),
    url(r'option/set', option.set)

]
