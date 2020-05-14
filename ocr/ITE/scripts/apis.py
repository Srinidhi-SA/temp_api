# -*- coding: utf-8 -*-
import requests
from google.cloud import vision
import io
import simplejson as json
from google.protobuf.json_format import MessageToJson


class Api_Call:
    def __init__(self, doc_path):
        self.doc_path = doc_path
        self.text_from_Azure_API()

    def text_from_Azure_API(self):

        # For Azure OCR API.

        subscription_key = "8f6ad67b6c4344779e6148ddc48d96c0"
        vision_base_url = "https://madvisor.cognitiveservices.azure.com/vision/v2.0/"
        text_recognition_url = vision_base_url + "read/core/asyncBatchAnalyze"

        data = open(self.doc_path, "rb").read()

        headers = {'Ocp-Apim-Subscription-Key': subscription_key,
                   'Content-Type': 'application/octet-stream'}

        response = requests.post(
            text_recognition_url,
            headers=headers,
            data=data)
        response.raise_for_status()

        analysis = {}
        poll = True
        while (poll):
            response_final = requests.get(
                response.headers["Operation-Location"], headers=headers)
            analysis = response_final.json()
            #         print(analysis)
            if ("recognitionResults" in analysis):
                poll = False
            if ("status" in analysis and analysis['status'] == 'Failed'):
                poll = False

        self.doc_analysis = analysis

    def page_wise_response(self, page_number):
        return [i for i in self.doc_analysis["recognitionResults"]
                if (i["page"] == page_number)][0]


def fetch_google_response(path):
    """Detects text in the file."""

    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.types.Image(content=content)

    conf_response = client.document_text_detection(image=image)
    conf_response = json.loads(MessageToJson(conf_response))

    return conf_response


def fetch_google_response2(path):
    """Detects text in the file."""

    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.types.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    response = json.loads(MessageToJson(response))

    return response




