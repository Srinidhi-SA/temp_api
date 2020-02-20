"""
Miscellaneous celery tasks module for OCR.
"""

from celery.decorators import task
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME
from django.conf import settings
from ocr.ITE import ite_noui


@task(name='extract_from_image', queue=CONFIG_FILE_NAME)
def extract_from_image(image: str):
    ite_noui.ite_noui_main(image)

@task(name='send_welcome_email', queue=CONFIG_FILE_NAME)
def send_welcome_email(username=None):
    print("~"*100)
    print("Sending Welcome mail to : ",username)
    print("~"*100)
