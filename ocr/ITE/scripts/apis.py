# -*- coding: utf-8 -*-
import datetime
import time

import backoff
import requests
from google.cloud import vision
import io
import simplejson as json
from google.protobuf.json_format import MessageToJson
from requests import HTTPError


class Api_Call:
    def __init__(self, doc_path):
        self.doc_path = doc_path
        self.text_from_Azure_API()

    @backoff.on_exception(backoff.expo, exception=HTTPError, max_tries=5)
    def text_from_Azure_API(self):

        print('#' * 50, '\n', datetime.datetime.now(), '\nAPI called\n', '#' * 50)
        subscription_key = "8f6ad67b6c4344779e6148ddc48d96c0"
        api_gateway_url = 'https://74psiiujd1.execute-api.us-east-2.amazonaws.com/dev'

        data = open(self.doc_path, "rb").read()

        headers = {'Ocp-Apim-Subscription-Key': subscription_key,
                   'Content-Type': 'application/octet-stream'}

        analysis = {}
        poll = True

        response = requests.post(
            api_gateway_url,
            headers=headers,
            data=data)
        response.raise_for_status()

        while poll:
            response_final = requests.get(
                response.headers["Operation-Location"], headers=headers)
            analysis = response_final.json()

            if "status" in analysis and analysis['status'] == 'succeeded':
                poll = False

        self.doc_analysis = analysis

    def page_wise_response(self, page_number):
        return [i for i in self.doc_analysis["analyzeResult"]["readResults"]
                if (i["page"] == page_number)][0]


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
