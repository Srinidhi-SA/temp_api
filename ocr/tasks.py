"""
Miscellaneous celery tasks module for OCR.
"""
import json
import os

from celery.decorators import task
from config.settings.config_file_name_to_run import CONFIG_FILE_NAME

from ocr.ITE.scripts.data_ingestion import ingestion_1
from django.conf import settings
from django.contrib.auth.models import User
from ocr.ITE.master_ite import main


@task(name='send_welcome_email', queue=CONFIG_FILE_NAME)
def send_welcome_email(username=None):
    if settings.SEND_WELCOME_MAIL:
        from api.helper import get_outlook_auth
        r = get_outlook_auth(settings.OUTLOOK_AUTH_CODE, settings.OUTLOOK_REFRESH_TOKEN,
                             settings.OUTLOOK_DETAILS)
        result = r.json()
        access_token = result['access_token']
        user = User.objects.get(username=username)
        print("~" * 90)
        print("Sending Welcome mail to : {0}".format(username))

        welcome_mail('send', access_token=access_token, return_mail_id=user.email,
                     subject='Marlabs-Welcome', username=username)
        print("~" * 90)
    else:
        print("Please enable SEND_WELCOME_MAIL=True in order to send welcome email to users.")


def welcome_mail(action_type=None, access_token=None, return_mail_id=None, subject=None, username=None):
    if not access_token:
        return HttpResponseRedirect(reverse('tutorial:home'))
    else:
        try:
            messages = send_my_messages(access_token, return_mail_id, subject, username)
            if messages[:3] == '202':
                print("Welcome mail sent.")
        except Exception as e:
            print(e)
            print("Some issue with mail sending module...")


def send_my_messages(access_token, return_mail_id, subject, username):
    '''
    Replies to the mail with attachments
    '''
    get_messages_url = 'https://graph.microsoft.com/v1.0/me/' + '/sendmail'
    htmlData = """<!DOCTYPE html><html><body>Dear {},</br></br><b>Welcome to mAdvisor.
    </b></br></br>Have a great day ahead.</br></br>Regards,</br>mAdvisor</body></html>""" \
        .format(username)

    payload = {

        "Message": {

            "Subject": subject,
            "Body": {

                "ContentType": "HTML",
                "Content": htmlData,

            },
            "ToRecipients": [
                {
                    "EmailAddress": {
                        "Address": return_mail_id
                    }
                }
            ],
        },
        "SaveToSentItems": "true",

    }
    from api.helper import make_api_call
    import requests

    r = make_api_call('POST', get_messages_url, access_token, payload=payload)
    if r.status_code == requests.codes.ok:
        return r.json()
    else:
        return "{0}: {1}".format(r.status_code, r.text)


@task(name='extract_from_image', queue=CONFIG_FILE_NAME)
def extract_from_image(image, slug, template):
    path, extension = ingestion_1(image, os.getcwd() + "/ocr/ITE/pdf_to_images_folder")
    response = dict()
    if os.path.isdir(path):
        for index, image in enumerate(os.listdir(path)):
            response[index] = main(os.path.join(path, image), template)
            response[index]['extension'] = extension
        return response
    else:
        response[0] = main(path, template, slug)
        return response
