from django.contrib import admin

# Register your models here.
from ocrflow.models import Task, SimpleFlow, Approval, ReviewRequest

class TaskAdmin(admin.ModelAdmin):
    """
    Model: Task
    """
    icon = '<i class="material-icons">cloud_done</i>'
    #search_fields = ["slug"]
    #list_display = ["type", "slug"]
    #list_filter = []
    #readonly_fields = ["slug"]

    def get_queryset(self, request):
        queryset = super(TaskAdmin, self).get_queryset(request)
        #queryset = queryset.order_by('-created_at')
        return queryset

class ReviewRequestAdmin(admin.ModelAdmin):
    #form = BugForm
    list_display = ('ocr_image','status')

    def get_queryset(self, request):
        queryset = super(ReviewRequestAdmin, self).get_queryset(request)
        #queryset = queryset.order_by('-recorded_at')
        return queryset


admin.site.register(ReviewRequest,ReviewRequestAdmin)
admin.site.register(Task, TaskAdmin)
