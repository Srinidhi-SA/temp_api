#!/usr/bin/env python
# coding: utf-8

# In[10]:


# import
# import timesheet_templates_module
# from timesheet_templates_module import *
import time

import requests

from ocr.ITE.modularised_table_detection import *
from ocr.ITE.transcript_module import *
from google.cloud import vision
import io

# In[2]:
from ocr.ITE.utils import denoise


def process_template(analysis, image):
    #     ## CHECKING FOR TABLES
    #     gray = cv2.cvtColor(image_table_extraction, cv2.COLOR_BGR2GRAY)
    #     bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)
    #     tables = countour_count(bw)           ## ADD VARIABLE AREA THRESHOLDS

    ## CHECKING FOR PATTERNS
    shape = image.shape
    x_lines, y_lines = lines(analysis, shape)

    ## DECIDING THE MODULES
    if (check_line(x_lines) == 'No match') and (check_line(y_lines) == 'No match'):
        return 'BASE MODULE'

    else:
        l = [check_line(x_lines)] + [check_line(y_lines)]
        l.remove('No match')
        return l


# In[3]:
def extract_metadata_timesheet(analysis, image):
    shape = image.shape
    x_lines, y_lines = lines(analysis, shape)

    ## DECIDING THE MODULES
    if check_line(x_lines) == 'Time Sheet':
        return 'Vertical TS'
    else:
        return 'Horizontal TS'


def preprocess_main(image, kind='base'):
    if kind == 'base':

        denoised_table = denoise(image, denoise_strength=20)
        blured_table = cv2.bilateralFilter(denoised_table, 9, 30, 30)
        return blured_table

    else:
        pass


# In[4]:


def lines(analysis, shape):
    ## HORIZONTAL

    horizontal_lines = []
    clubbed_lines = []
    polygons = [(line["boundingBox"], line["text"]) for line in analysis["recognitionResults"][0]["lines"]]
    lines_api = {}
    lines_api = {i + 1: polygons[i][1] for i in range(len(polygons))}  # {line_number: Content of that line}
    #     lines_api
    starting_point = {line_number: polygons[line_number - 1][0][0] for line_number in range(1, len(polygons) + 1)}
    #     starting_point
    p1_p3 = {}

    for line_number, line in enumerate(polygons):
        line_number = line_number + 1
        p1_p3[line_number] = line[0][:2], line[0][4:6]

    #     lines = {}
    #     l,h,s,i = 1,1,1,1
    clubbed_lines = []
    current_depth = 0
    same_line = {}  ## ADDED NEW

    for line_number in p1_p3:

        if (line_number not in clubbed_lines):

            current_depth = p1_p3[line_number][1][1]

            if shape[1] > 2000:
                cl = get_same_line_words_hori(p1_p3, line_number, current_depth)
            else:
                cl = get_same_line_words_hori_2(p1_p3, line_number, current_depth)

            clubbed_lines = [line_number] + cl + clubbed_lines
            #         print(clubbed_lines)
            sl = [line_number] + cl  ### SAME LINE NUMBERS
            #             d = {k:starting_point[k] for k in sl}
            #             sl = sorted(d, key=d.get)            ## LINE NUMBERS
            x = [lines_api[line_number] for line_number in sl]  ### LINE
            horizontal_lines.append(x)

    ## VERTICAL

    vertical_lines = []
    clubbed_lines_vertical = []
    wc = {}
    for i, line in enumerate(analysis["recognitionResults"][0]["lines"]):
        wc[i + 1] = [(word['boundingBox'], word['text']) for word in line['words']]
    #     print(wc.values())
    words_api = {i + 1: word[0][1] for i, word in enumerate(wc.values())}
    # print(words_api)
    p1_p3_words = {i + 1: (word[0][0][:2], word[0][0][4:6]) for i, word in enumerate(list(wc.values()))}

    # print(p1_p3_words)

    for word_number in p1_p3_words:

        if (word_number not in clubbed_lines_vertical):
            x1 = p1_p3_words[word_number][0][0]
            x2 = p1_p3_words[word_number][1][0]

            cl = get_same_line_words_vert(p1_p3_words, word_number, x1, x2)
            clubbed_lines_vertical = [word_number] + cl + clubbed_lines_vertical
            #         print(clubbed_lines)
            sl = [word_number] + cl  ### SAME LINE NUMBERS
            #             d = {k:starting_point[k] for k in sl}
            #             sl = sorted(d, key=d.get)            ## LINE NUMBERS
            x = [words_api[word_number] for word_number in sl]  ### LINE
            vertical_lines.append(x)

    return horizontal_lines, vertical_lines


# In[5]:


def check_line(lines):
    flag = 'No match'
    transcript_header = set(
        ['Attempted', 'Scored', 'Points', 'Earned', 'Course', 'Description', 'Attempted Earned Grade'])
    time_sheet_header = set(
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon,', 'Tue,', 'Wed,', 'Thu,', 'Fri,', 'Sat,', 'Sun,'])

    clean_lines = []
    for line in lines:
        current_line = line
        for word in line:
            if len(word.split()) > 1:
                split = word.split()
                current_line.remove(word)
                current_line = current_line + split
        clean_lines.append(current_line)
    #     print(lines)
    for line in clean_lines:
        if len(transcript_header.intersection(set(line))) >= 2:
            flag = 'Transcript'
            break
        elif len(time_sheet_header.intersection(set(line))) >= 3:
            flag = 'Time Sheet'
            break
        else:
            pass

    return flag


# In[6]:

def extract_whitepage_mask(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)
    scalev, scaleh = optimal_params(bw, task='table')

    horizontal = bw.copy()
    horizontalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (horizontal.shape[1] // int(scaleh), 1))
    horizontal = cv2.erode(horizontal, horizontalStructure, iterations=1)
    horizontal = cv2.dilate(horizontal, horizontalStructure, iterations=1)
    # horizontal = cv2.dilate(horizontal, np.ones((4, 4)))
    horizontal = horizontal + cv2.morphologyEx(horizontal, cv2.MORPH_GRADIENT, np.ones((4, 4)))

    vertical = bw.copy()
    verticalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (1, vertical.shape[0] // int(scalev)))
    vertical = cv2.erode(vertical, verticalStructure, iterations=1)
    vertical = cv2.dilate(vertical, verticalStructure, iterations=1)
    # vertical = cv2.dilate(vertical, np.ones((4, 4)))
    vertical = vertical + cv2.morphologyEx(vertical, cv2.MORPH_GRADIENT, np.ones(
        (4, 4)))  ## ADDDING OUTPUT TO ADDITIONAL LAYER OF EXO SKELETON OF THE LINES

    mask = horizontal + vertical
    mask_white = cv2.cvtColor(cv2.bitwise_not(mask), cv2.COLOR_GRAY2RGB)
    return mask_white


def get_same_line_words_hori(p1_p3, line_number, dep):
    current_depth = dep
    same_line = []
    for line_oi in p1_p3:

        if (line_oi != line_number) and (p1_p3[line_oi][1][1] in range(current_depth - 6, current_depth + 7)):
            same_line.append(line_oi)

    return same_line


# In[7]:


def get_same_line_words_vert(p1_p3_words, line_number, x1, x2):
    same_line = []
    for word_oi in p1_p3_words:
        #         print(p1_p3_words[word_oi])
        if (word_oi != line_number) and ((p1_p3_words[word_oi][0][0] in range(x1 - 2, x1 + 3)) or (
                p1_p3_words[word_oi][1][0] in range(x2 - 2, x2 + 3))):
            same_line.append(word_oi)

    return same_line


# In[8]:


def get_same_line_words_hori_2(p1_p3, line_number, dep):
    current_depth = dep
    same_line = []
    for line_oi in p1_p3:

        if (line_oi != line_number) and (p1_p3[line_oi][1][1] in range(current_depth - 10, current_depth + 12)):
            same_line.append(line_oi)

    return same_line


# In[9]:


def text_from_Azure_API(image_path):
    # For Azure OCR API.

    subscription_key = "8f6ad67b6c4344779e6148ddc48d96c0"
    vision_base_url = "https://madvisor.cognitiveservices.azure.com/vision/v2.0/"
    text_recognition_url = vision_base_url + "read/core/asyncBatchAnalyze"

    image_data = open(image_path, "rb").read()

    headers = {'Ocp-Apim-Subscription-Key': subscription_key,
               'Content-Type': 'application/octet-stream'}

    response = requests.post(text_recognition_url, headers=headers, data=image_data)
    response.raise_for_status()

    analysis = {}
    poll = True
    while poll:
        response_final = requests.get(response.headers["Operation-Location"],
                                      headers=headers)
        analysis = response_final.json()
        #         print(analysis)
        time.sleep(1)
        if "recognitionResults" in analysis:
            poll = False
        if "status" in analysis and analysis['status'] == 'Failed':
            poll = False

    return analysis


def detect_text(path):
    """Detects text in the file."""

    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.types.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    return response
