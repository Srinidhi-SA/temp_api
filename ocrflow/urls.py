from django.conf.urls import url

from ocrflow.views import(
    TaskListView,
    #TaskDetailView
)

urlpatterns = [
    url(r'^tasks/$', TaskListView.as_view(), name='simpleflow-task-list'),
    #url(r'^tasks/(?P<pk>\d+)$', TaskDetailView.as_view(), name='simpleflow-task-detail'),
]
