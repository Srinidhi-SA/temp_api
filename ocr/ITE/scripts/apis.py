# -*- coding: utf-8 -*-
import datetime
import time
import requests
from google.cloud import vision
import io
import numpy as np
import simplejson as json
from google.protobuf.json_format import MessageToJson


class Api_Call:
    def __init__(self, doc_path):
        self.doc_path = doc_path
        self.text_from_Azure_API()

    def text_from_Azure_API(self):

        # For Azure OCR API.
        print('#' * 50, '\n', datetime.datetime.now(), '\nAPI called\n', '#' * 50)
        subscription_key = "8f6ad67b6c4344779e6148ddc48d96c0"
        vision_base_url = "https://madvisor.cognitiveservices.azure.com/vision/v3.0/"
        text_recognition_url = vision_base_url + "read/analyze"

        data = open(self.doc_path, "rb").read()

        headers = {'Ocp-Apim-Subscription-Key': subscription_key,
                   'Content-Type': 'application/octet-stream'}

        analysis = {}
        poll = True
        wait = 0

        while wait < 3:
            try:
                response = requests.post(
                    text_recognition_url,
                    headers=headers,
                    data=data)
                response.raise_for_status()
                wait = 4
            except:
                wait = wait + 1
                wait_time = int(np.random.uniform(1, 4))
                print('Waiting')
                time.sleep(wait_time)
                if wait >= 3: raise

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
