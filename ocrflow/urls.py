from django.conf.urls import url
from rest_framework import routers

from ocrflow.views import(
    TaskView,
    SimpleFlowView
)

router = routers.DefaultRouter()
router.register(
    'tasks',
    TaskView,
    base_name='tasks'
)
router.register(
    'review',
    SimpleFlowView,
    base_name='review'
)

urlpatterns = [
    #url(r'^tasks/$', TaskListView.as_view(), name='simpleflow-task-list'),
    #url(r'^tasks/(?P<pk>\d+)$', TaskDetailView.as_view(), name='simpleflow-task-detail'),
]
urlpatterns += router.urls
