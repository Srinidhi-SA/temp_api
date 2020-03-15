"""
Miscellaneous celery tasks module for OCRflow.
"""

from django.conf import settings
from celery.decorators import task, periodic_task
from celery.task.schedules import crontab
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME
from ocr.models import OCRImage
from ocrflow.models import *

#@task(name='start_auto_assignment_L1', queue=CONFIG_FILE_NAME)
@periodic_task(run_every=(crontab(minute='*/1')), name="start_auto_assignment_L1", ignore_result=False,
               queue=CONFIG_FILE_NAME)
def start_auto_assignment_L1():
    if settings.AUTO_ASSIGNMENT:
        print("~" * 90)
        #TODO
        #1.Filter all Images with Recognised True, assigned = False
        ocrImageQueryset = OCRImage.objects.filter(
            is_recognized=True,
            is_L1assigned=False
        ).order_by('created_at')
        if len(ocrImageQueryset)>0:
            for image in ocrImageQueryset:
                #TODO Checkif reviewrequest already exists.
                if len(ReviewRequest.objects.filter(ocr_image=image))==0:
                    object = ReviewRequest.objects.create(
                        ocr_image = image,
                        created_by = image.created_by
                    )
                else:
                    #TODO Try to assign the backlog task
                    object = ReviewRequest.objects.get(ocr_image = image)
                    object.start_simpleflow()

                if object.status =='submitted_for_review':
                    task=Task.objects.get(object_id = object.id)
                    print("Task assigned:  {0}  -  User:  {1}".format(image.name, task.assigned_user))
                    continue
                else:
                    print("~" * 90)
                    break

            print("~" * 90)
        else:
            print("All images got assigned for review.")
            print("~" * 90)




#    print("~" * 100)
