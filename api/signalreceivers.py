from django.db.models.signals import post_save
from django.dispatch import receiver

from api.models import Dataset, Insight
from utils import submit_job


@receiver(post_save, sender=Dataset)
def trigger_metadata_creation_job(sender, instance=None, created=False, **kwargs):
    if created:
        print("Dataset got created, trigger a metadata job")
        # TODO: Dataset got created, trigger a metadata job

        config_json = {
            "job_details": {
                "job_url": "http://<ip>/api/job/<slug>/",
                "get_config": {"action": "get_config",
                               "method": "GET"},
                "save_results": {"action": "result",
                                 "method": "PUT"
                                 }
            }


        }

        submit_job(class_name='class_path_metadata', config_json=config_json)


@receiver(post_save, sender=Insight)
def trigger_Insight_creation_job(sender, instance=None, created=False, **kwargs):
    if created:
        print("Dataset got created, trigger a Insight job")
        # TODO: Dataset got created, trigger a Insight job

        # TODO: Write for filter also
