#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from ocr.ITE.timesheet_templates2 import *
from ocr.ITE.timesheet_templates1 import *
from ocr.ITE.ocr_mods import *
import json
import base64
from ocr.ITE.transcript_module import intermediate_1, extract_metadata_transcript

global analysis, google_response


def analyse(path, image_slug):
    image_name = path.split('/')[-1].split('.')[0]

    image = cv2.imread(path)
    original_image = "ocr/ITE/ir/{}_original_image.png".format(image_slug)
    cv2.imwrite(original_image, image)

    wm = extract_whitepage_mask(image)
    extracted_image = "ocr/ITE/ir/{}_mask.png".format(image_name)
    cv2.imwrite(extracted_image, wm)

    demo = False
    if demo:
        print('*' * 50)
        print('Reading Analysis From Local')
        print('*' * 50)
        cwd = os.getcwd()
        json_path = cwd + '/ocr/ITE/demo_analysis/' + '_'.join(image_name.split('.')[0].split('_')[:-1]) + '.json'
        with open(json_path) as f:
            analysis = json.load(f)
    else:
        analysis = text_from_Azure_API(path)

    google_response, conf_google_response = detect_text(path)
    flag = process_template(analysis, image)
    data, data2, data3, image_data, image_, mask = RPA(analysis, google_response, image_slug, image_name, extracted_image)
    with open(mask, mode='rb') as file:
        img = file.read()

    mask = base64.encodebytes(img)

    with open(extracted_image, mode='rb') as file:
        img1 = file.read()

    mask1 = base64.encodebytes(img1)

    response = dict()
    response['analysis'] = analysis
    response['google_response'] = str(google_response.text_annotations)
    response['conf_google_response'] = conf_google_response
    response['flag'] = flag
    response['original_image'] = original_image
    response['extracted_image'] = mask
    response['data'] = data
    response['data2'] = data2
    response['data3'] = data3
    response['mask'] = mask1
    return response


def get_word_in_bounding_box(data2, x, y):

    word = FindPoint1(x, y, data2)
    if word:
        return word
    else:
        return None


def finalize(path, analysis, analysis_list, flag):

    analysis_new = updated_analysis(analysis, analysis_list)
    with open('Updated_Analysis.json', 'w') as fp:
        json.dump(analysis_new, fp, sort_keys=True, indent=4)
    analysis = analysis_new

    image_name = path.split('/')[-1].split('.')[0]

    image = cv2.imread(path)

    d = {}
    d[image_name] = {}
    d[image_name]['Flag'] = flag
    print(flag)
    print("Backend running")
    if flag[0] == 'Time Sheet':

        tc = table_count(image)
        d[image_name]['Number of tables'] = tc
        d[image_name]['Type'] = extract_metadata_timesheet(analysis, image)

        # analysis_new = RPA(analysis,google_response,image,wm)

        if table_count(image) == 0:
            df = nomatch_timesheet_template(analysis)

        else:
            if table_count(image) >= 3:
                imagepp = preprocess1(path)
            else:
                imagepp = preprocess2(path)

            imagepp = imagepp.astype('uint8')
            json_final = run_all(imagepp, analysis, path)
            return flag, json_final, d, analysis

    elif flag[0] == 'Transcript':

        md = extract_metadata_transcript(analysis, path)
        print(md)
        d[image_name]['Metadata'] = md
        white_page = 255 * np.ones(image.shape).astype(image.dtype)
        # analysis_new = RPA(analysis,google_response,image,wm)

        x, y = intermediate_1(analysis, path)  # x WILL HAVE ALL SEMDETAILS IN DFS

        return flag, x, d, analysis

    else:  # BASE MODULE

        all_final_json, metadata = tp_run_all(path, analysis)
        d[image_name]['Metadata'] = metadata

        return flag, all_final_json, metadata, analysis
