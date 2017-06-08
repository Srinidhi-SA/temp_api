from django.conf.urls import include, url
from rest_framework.decorators import renderer_classes, api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import routers
from rest_framework.documentation import include_docs_urls


from django.contrib.auth.decorators import login_required
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import refresh_jwt_token
from rest_framework_jwt.views import verify_jwt_token

from api.views import errand, dataset, robo, option, user, trainer, score, joblog, kafkaapi

@login_required
@api_view(['GET'])
@renderer_classes((JSONRenderer, ))
def test(request):
    return Response({"message": "Is this a test?", "data": "Yes it is!"});


# noinspection PyPackageRequirements
urlpatterns = [
    url(r'test', test),
    url(r'env', errand.get_env),

    # USERS
    url(r'user/login', joblog.login_user),
    url(r'user/profile', user.profile),
    url(r'user/logout', user.logout),
    url(r'user/api-token-auth', obtain_jwt_token),
    url(r'user/api-token-refresh', refresh_jwt_token),
    url(r'user/api-token-verify', verify_jwt_token),

    # DATASETSS
    url(r'dataset/create', dataset.create),
    url(r'dataset/all', dataset.all),
    url(r'dataset/preview', dataset.preview),
    url(r'dataset/get_meta', dataset.get_meta),
    url(r'dataset/edit', dataset.edit),
    url(r'dataset/delete', dataset.delete),
    url(r'dataset/quickinfo', dataset.quickinfo),
    url(r'dataset/trick', dataset.trick),
    url(r'dataset/filter', dataset.filter_sample),

    # filter_sample
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
    url(r'errand/filter', errand.filter_sample),
    url(r'errand/drill_down_anova', errand.drill_down_anova),

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
    url(r'option/set', option.set),
    url(r'option/test', option.test),

    # TRAINER
    url(r'trainer/make', trainer.create_trainer),
    url(r'trainer/all', trainer.get_all_trainer),
    url(r'trainer/model', trainer.retrieve_trainer),
    url(r'trainer/set_column_data', trainer.set_column_data),
    url(r'trainer/create', trainer.setup_and_call_script),
    url(r'trainer/download', trainer.download_file),
    url(r'trainer/remote', trainer.remote_folder),
    url(r'trainer/edit', trainer.edit_trainer),
    url(r'trainer/delete', trainer.delete_tariner),

    # SCORE
    url(r'score/make', score.create_score),
    url(r'score/all', score.retrieve_all_score),
    url(r'score/score', score.retrieve_score),
    url(r'score/download', score.download_file),
    url(r'score/unknown_api', score.unknown_api),
    url(r'score/edit', score.edit_score),
    url(r'score/delete', score.delete_score),

    #REAL TIME
    url(r'iot/senddata', kafkaapi.call_producer),

    # JOBS
    url(r'job/all$', joblog.get_jobs_of_this_user),
    url(r'job/create$', joblog.set_job),
    url(r'job/(?P<id>[0-9]+)/edit$', joblog.edit_job_of_this_user),
    url(r'job/(?P<id>[0-9]+)/kill', joblog.kill_job_of_this_user),
    url(r'job/(?P<id>[0-9]+)/resubmit_job', joblog.resubmit_job),
    url(r'job/(?P<id>[0-9]+)/job', joblog.get_job),
    url(r'job/(?P<id>[0-9]+)/delete', joblog.delete_job),
    url(r'job/render_html', joblog.render_html),
]
