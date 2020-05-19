# -*- coding: utf-8 -*-
import base64
import random
import string
import sys
import time
import os

import cv2
from django.template.defaultfilters import slugify

from ocr.ITE.scripts.data_ingestion import ingestion_1
from ocr.ITE.scripts.image_class import image_cls
from ocr.ITE.scripts.apis import Api_Call, fetch_google_response, fetch_google_response2
from ocr.ITE.scripts.domain_classification import Domain
from ocr.ITE.scripts.preprocessing import Preprocess
from ocr.ITE.scripts.base_module import BaseModule
from ocr.ITE.scripts.transcripts import Transcript


def main(input_path, template, slug=None):
    print("Loading File")
    print("Waiting For API Response")
    api_response = Api_Call(input_path)
    google_response = fetch_google_response(input_path)
    google_response2 = fetch_google_response2(input_path)
    image_obj = image_cls(input_path, input_path.split('/')[-1])
    if slug is None:
        slug = slugify("img-" + ''.join(
            random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))

    image_obj.set_microsoft_analysis(api_response.page_wise_response(1))

    flag = Domain().process_domain(
        image_obj.microsoft_analysis,
        image_obj.image)

    analysis = image_obj.microsoft_analysis
    image_obj.set_domain_flag(flag)
    print('\n FLAG : ', flag)

    de_skewed_img, de_noised_img, blurred_img = Preprocess().pre_process(
        image_obj.image, image_obj.image_shape)

    image_obj.set_deskewed_denoised_blurred_image(
        de_skewed_img, de_noised_img, blurred_img)

    if flag == 'Transcript':

        trobj = Transcript()

        x, y = trobj.intermediate_1(image_obj.microsoft_analysis, image_obj.image_path, return_sem_info=False)

        print('\n SEM INFO  : \n', x)
    else:

        base_obj = BaseModule(image_obj, input_path.split('/')[-1])

        final_json, mask, metadata, template = base_obj.extract_info(template, base_obj.bwimage)
        image_obj.set_final_json_mask_metadata(final_json, mask, metadata)
        white_background_mask = cv2.bitwise_not(mask)
        if os.path.exists("ocr/ITE/database/{}_mask.png".format(slug)):
            with open("ocr/ITE/database/{}_mask.png".format(slug), mode='rb') as file:
                img = file.read()
            mask = base64.encodebytes(img)
        else:
            cv2.imwrite("ocr/ITE/database/{}_mask.png".format(slug), white_background_mask)
            with open("ocr/ITE/database/{}_mask.png".format(slug), mode='rb') as file:
                img = file.read()
            mask = base64.encodebytes(img)

        image = cv2.imread(input_path)
        original_image = "ocr/ITE/database/{}_original_image.png".format(slug)
        cv2.imwrite(original_image, image)

        with open(original_image, mode='rb') as file:
            img = file.read()

        og = base64.encodebytes(img)

        response = {
            'final_json': final_json,
            'mask': mask,
            'metadata': metadata,
            'google_response': google_response,
            'analysis': analysis,
            'google_response2': google_response2,
            'flag': flag,
            'image_slug': slug,
            'original_image': og,
            'image_name': input_path.split('/')[-1].split('.')[0],
            'template': template
        }
        return response
