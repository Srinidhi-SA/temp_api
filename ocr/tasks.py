"""
Miscellaneous celery tasks module for OCR.
"""

from celery.decorators import task
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME

from ocr.ITE.master_all import *
from ocr.ITE.ingestion import ingestion_1
from ocr.ITE.master_all import get_word_in_bounding_box, update_word


@task(name='send_welcome_email', queue=CONFIG_FILE_NAME)
def send_welcome_email(username=None):
    print("~" * 100)
    print("Sending Welcome mail to : ", username)
    print("~" * 100)


@task(name='extract_from_image', queue=CONFIG_FILE_NAME)
def extract_from_image(image, slug):
    ingestion_1(image, os.getcwd() + "/ocr/ITE/pdf_to_images_folder")
    return analyse(image, slug)


@task(name='get_word', queue=CONFIG_FILE_NAME)
def get_word(data2, x, y):
    return get_word_in_bounding_box(data2, x, y)


@task(name='update_word', queue=CONFIG_FILE_NAME)
def update_words(act_point, word, data3):
    return update_word(act_point, word, data3)


@task(name='word_not_clear', queue=CONFIG_FILE_NAME)
def word_not_clear(act_point, word, data3):
    return not_clear(act_point, word, data3)


@task(name='final_data_generation', queue=CONFIG_FILE_NAME)
def final_data_generation(path, analysis, analysis_list, flag):
    return finalize(path, analysis, analysis_list, flag)
