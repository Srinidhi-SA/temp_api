from django.conf.urls import url
from rest_framework import routers

from ocrflow.views import(
    TaskView
)

router = routers.DefaultRouter()
router.register(
    'tasks',
    TaskView,
    base_name='tasks'
)

urlpatterns = [
    #url(r'^tasks/$', TaskListView.as_view(), name='simpleflow-task-list'),
    #url(r'^tasks/(?P<pk>\d+)$', TaskDetailView.as_view(), name='simpleflow-task-detail'),
]
urlpatterns += router.urls
