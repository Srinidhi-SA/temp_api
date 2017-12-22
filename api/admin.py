from django.contrib import admin

# Register your models here.

from api.models import Dataset, Insight, Job, Score, Trainer,CustomApps


class DatasetAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "created_at", "deleted"]  # TODO: @Ankush Add "created_by"
    # list_filter = []
    readonly_fields = ["created_at", "deleted"]


class InsightAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug", "target_column"]
    list_display = ["name", "slug", "type", "target_column", "dataset", "status", "analysis_done", "created_at",
                    "created_by"]
    list_filter = ["status", "analysis_done"]
    readonly_fields = ["created_at"]


class JobAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug", ]
    list_display = ["name", "slug", "job_type", "deleted", "status"]
    list_filter = ["job_type", "status"]
    readonly_fields = ["created_at"]
    actions = ['kill_selected_jobs', 'pause_selected_jobs', 'start_selected_jobs']

    def kill_selected_jobs(self, request, queryset):
        for instance in queryset:
            instance.kill()
        return 'good grace'

    def pause_selected_jobs(self, request, queryset):
        for instance in queryset:
            instance.kill()
        return 'good grace'

    def start_selected_jobs(self, request, queryset):
        for instance in queryset:
            try:
                if instance.status is 'KILLED' or instance.status is 'FAILED':
                    instance.start()
            except Exception as exc:
                print exc
        return 'good grace'


class ScoreAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "analysis_done", "created_at", "created_by"]
    list_filter = ["analysis_done", ]
    readonly_fields = ["created_at"]


class TrainerAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "app_id", "analysis_done", "created_at",
                    "created_by", "deleted"]
    list_filter = ["analysis_done"]
    readonly_fields = ["created_at"]

class CustomAppsAdmin(admin.ModelAdmin):
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "app_id","created_by","status","created_at"]
    list_filter = ["status"]
    readonly_fields = ["status","app_id"]

admin.site.register(Dataset, DatasetAdmin)
admin.site.register(Insight, InsightAdmin)
admin.site.register(Job, JobAdmin)
admin.site.register(Score, ScoreAdmin)
admin.site.register(Trainer, TrainerAdmin)
admin.site.register(CustomApps, CustomAppsAdmin)
