from django.contrib import admin
from django.conf import settings
from utils import json_prettify_for_admin
import json

# Register your models here.

from api.models import Dataset, Insight, Job, Score, Trainer,CustomApps


class DatasetAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">cloud_done</i>'
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "created_at", "deleted"]  # TODO: @Ankush Add "created_by"
    # list_filter = []
    readonly_fields = ["created_at", "deleted"]


class InsightAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">bubble_chart</i>'
    name = "Signals"
    search_fields = ["name", "slug", "target_column"]
    list_display = ["name", "slug", "type", "target_column", "dataset", "status", "analysis_done", "created_at",
                    "created_by"]
    list_filter = ["status", "analysis_done"]
    readonly_fields = ["created_at"]


class JobAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">settings_input_component</i>'
    search_fields = ["name", "slug", "job_type", "url"]
    list_display = ["name", "YARN_URL_html", "job_type", "deleted", "status", 'submitted_by',
                    "msg_count", "time_difference", "script_time_difference"
                    ]
    list_filter = ["job_type", "status", "submitted_by"]
    readonly_fields = ("created_at", "javascript_like_config" , "python_like_config")
    actions = ['kill_selected_jobs', 'start_selected_jobs', 'refresh_status']

    def config_prettified(self, instance):
        """Function to display pretty version of our config"""
        return json_prettify_for_admin(json.loads(instance.config))
    config_prettified.short_description = 'ConfigPrettified'
    config_prettified.verbose_name = 'Verbose ConfigPrettified'

    def javascript_like_config(self, instance):
        config_str = instance.config
        replace_words = {
            'None': 'null',
            'True': 'true',
            'False': 'false'
        }

        for key in replace_words:
            config_str.replace(key, replace_words[key])

        return config_str

    def python_like_config(self, instance):
        config_str = instance.config
        replace_words = {
            'null': 'None',
            'true': 'True',
            'false': 'False'
        }

        for key in replace_words:
            config_str.replace(key, replace_words[key])

        return config_str

    def time_difference(self, instance):
        time_difference = instance.updated_at - instance.created_at
        time_delta = str(time_difference).split('.')[0]
        return time_delta


    def messages_prettified(self, instance):
        """Function to display pretty version of our config"""
        return json_prettify_for_admin(json.loads(instance.message_log))
    messages_prettified.short_description = 'MessagespPrettified'

    def YARN_URL_html(self, instance):
        return '<a href="http://{}:{}/cluster/app/{}">{}</a>'.format(settings.YARN.get("host"),
                                                                     settings.YARN.get("port"), instance.url, instance.url)
    YARN_URL_html.short_description = "YARN URL"
    YARN_URL_html.allow_tags = True


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

    def refresh_status(self, request, queryset):
        for instance in queryset:
            instance.update_status()
        return 'good grace'

    def msg_count(self, instance):
        message_log_json = json.loads(instance.message_log)
        message_count = len(message_log_json)

        error_report_json = json.loads(instance.error_report)
        msgKeys = error_report_json.keys()
        msgKeys = list(set(msgKeys))
        errorKeys = [x for x in msgKeys if x != "jobRuntime"]
        timeMsg = "No"
        if "jobRuntime" in msgKeys:
            timeMsg= "Yes"
        error_report_count = len(errorKeys)
        return "Msg:{0}/Err:{1}/Time:{2}".format(message_count, error_report_count,timeMsg)

    def script_time_difference(self, instance):
        message_log_json = json.loads(instance.message_log)

        if 'jobRuntime' in message_log_json:
            run_time_msg = message_log_json['jobRuntime']

            if len(run_time_msg) > 1:
                try:
                    return run_time_msg[1]['endTime'] - run_time_msg[0]['startTime']
                except:
                    return 'Gadbad ho gai.'
            elif len(run_time_msg) == 1:
                try:
                    return run_time_msg[0]['startTime']
                except:
                    return 'Gadbad ho gai.'
            else:
                return 'wait'
        return 'None'

class ScoreAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">assessment</i>'
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "analysis_done", "created_at", "created_by"]
    list_filter = ["analysis_done", ]
    readonly_fields = ["created_at"]


class TrainerAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">tune</i>'
    search_fields = ["name", "slug"]
    list_display = ["name", "slug", "app_id", "analysis_done", "created_at",
                    "created_by", "deleted"]
    list_filter = ["analysis_done"]
    readonly_fields = ["created_at"]

class CustomAppsAdmin(admin.ModelAdmin):
    icon = '<i class="material-icons">widgets</i>'
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
