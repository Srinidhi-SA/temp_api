#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# import intergrated_helper
# import timesheet_templates_module
# from timesheet_templates_module import *
from ocr.ITE.master_helper import *
from ocr.ITE.timesheet_templates2 import *
from ocr.ITE.timesheet_templates1 import *
from ocr.ITE.modularised_table_detection import *
import os
from ocr.ITE.rp import *
import json

from ocr.ITE.transcript_module import intermediate_1, extract_metadata_transcript


def main_for_all_modules(path):
    # path= '/home/sainaththikkireddi/Documents/OCRP/All-OCR/OCR_Demo/Timesheet_09082019.jpg'
    demo = True

    print(os.getcwd())
    image_name = path.split('/')[-1]
    print(image_name)

    image = cv2.imread(path)
    cv2.imwrite("ocr/ITE/demo_analysis/image_left.png", image)

    wm = extract_whitepage_mask(image)
    cv2.imwrite("ocr/ITE/demo_analysis/Page4_mask0.png", wm)

    global analysis, google_response

    if demo:
        print('*' * 50)
        print('Reading Analysis From Local')
        print('*' * 50)
        cwd = os.getcwd()
        json_path = cwd + '/ocr/ITE/demo_analysis/' + image_name.split('.')[0] + '.json'
        with open(json_path) as f:
            analysis = json.load(f)
    else:
        analysis = text_from_Azure_API(path)

    google_response = detect_text(path)
    flag = process_template(analysis, image)

    # analysis_new = RPA(analysis,google_response,image,"Page4_mask0.png")
    # analysis = analysis_new

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
            return flag, json_final, d

    elif flag[0] == 'Transcript':

        md = extract_metadata_transcript(analysis, path)
        print(md)
        d[image_name]['Metadata'] = md
        white_page = 255 * np.ones(image.shape).astype(image.dtype)
        # analysis_new = RPA(analysis,google_response,image,wm)

        x, y = intermediate_1(analysis, path)  # x WILL HAVE ALL SEMDETAILS IN DFS

        return flag, x, d

    else:  # BASE MODULE

        _, metadata = tp_run_all(path, analysis)
        d[image_name]['Metadata'] = metadata
        # analysis_new = RPA(analysis,google_response,image,wm)          ## RPA MODULE WIP
        # json,_ = tp_run_all(path,analysis)
        # print('*'*50)
        # print("all_json")
        # print(_)
        # print('*'*50)
        new_json = {path: {}}
        for n, x in enumerate(metadata[path]['order']):
            if x[0] == 'p':
                new_json[path][n] = {}
                new_json[path][n]['data'] = _[path]["paragraphs"]['p_' + x[2]]
                new_json[path][n]['type'] = 'para'
            else:
                new_json[path][n] = {}
                new_json[path][n]['data'] = _[path]["tables"][int(x[2])]
                new_json[path][n]['type'] = 'table'
        with open('ocr/ITE/demo_analysis/ordered.json', 'w') as fp:
            json.dump(new_json, fp)

        return flag, _, metadata

# domain_classification_flag,needed_json_final,meta_data_of_the_page=main_for_all_modules('/home/abishek/ocr/timesheet/aakarsha kasturi.png')
