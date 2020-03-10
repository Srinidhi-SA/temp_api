"""
Miscellaneous celery tasks module for OCR.
"""

from celery.decorators import task
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME

from ocr.ITE.master_all import *
from ocr.ITE.ingestion import ingestion_1


@task(name='send_welcome_email', queue=CONFIG_FILE_NAME)
def send_welcome_email(username=None):
    print("~" * 100)
    print("Sending Welcome mail to : ", username)
    print("~" * 100)


@task(name='extract_from_image', queue=CONFIG_FILE_NAME)
def extract_from_image(image, slug):
    path = ingestion_1(image, os.getcwd() + "/ocr/ITE/pdf_to_images_folder")
    response = dict()
    if os.path.isdir(path):
        for index, image in enumerate(os.listdir(path)):
            response[index] = analyse(os.path.abspath(image), slug)
        return response
    else:
        response[0] = analyse(path, slug)
        return response


@task(name='final_data_generation', queue=CONFIG_FILE_NAME)
def final_data_generation(path, analysis, analysis_list, flag):
    return finalize(path, analysis, analysis_list, flag)
