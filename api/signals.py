from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models import Dataset, Insight


@receiver(post_save, sender=Dataset)
def trigger_metadata_creation_job(sender, instance=None, created=False, **kwargs):
    if created:
        print("Dataset got created, trigger a metadata job")
        #TODO: Dataset got created, trigger a metadata job


@receiver(post_save, sender=Insight)
def trigger_Insight_creation_job(sender, instance=None, created=False, **kwargs):
    if created:
        print("Dataset got created, trigger a Insight job")
        #TODO: Dataset got created, trigger a Insight job

#TODO: Write for filter also