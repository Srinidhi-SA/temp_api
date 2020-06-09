# -*- coding: utf-8 -*-
import base64
import os
import numpy as np
from collections import OrderedDict

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "ocr/ITE/My_ProjectOCR_2427.json"
from google.protobuf.json_format import MessageToJson
from ocr.ITE.scripts.apis import fetch_google_response
import cv2
import json
import os
import matplotlib as mpl

if os.environ.get('DISPLAY', '') == '':
    print('no display found. Using non-interactive Agg backend')
    mpl.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches


# from ocr.ITE.scripts.info_mapping import update_u1


class ui_corrections:

    def __init__(self, mask, final_json, google_response, google_response2, image_path=None, image_directory_name=None,
                 database_path=None):
        self.mask = mask
        self.final_json = final_json
        # self.google_response = self.optimised_fetch_google_response(image_path, image_directory_name, database_path)
        self.google_response = google_response
        self.google_response2 = google_response2
        self.image_name = image_directory_name

    def optimised_fetch_google_response(self, image_path, image_directory_name, database_path):
        try:
            with open(database_path + image_directory_name + "/" + image_directory_name + "_google_response.json") as f:
                google_response_as_string = json.load(f)
            return google_response_as_string
        except:
            google_response = fetch_google_response(image_path)
            serialized = json.loads(MessageToJson(google_response))
            with open(database_path + image_directory_name + "/" + image_directory_name + "_google_response.json",
                      'w') as outfile:
                json.dump(serialized, outfile)
            return serialized

    def check_if_centroid_inbetween_p1_p3(self, centroid, p1, p3):
        if p1[0] <= centroid[0] <= p3[0] and p1[1] <= centroid[1] <= p3[1]:
            return True
        else:
            return False

    def all_words(self, analysis):

        loi = []
        for line in analysis['lines']:
            for word in line['words']:
                if 'confidence' in word.keys():
                    try:
                        loi.append({word['text']: [word['boundingBox'][:2], word['boundingBox'][4:6]]})
                    except:
                        pass
        return loi

    def calculate_centroid(self, p1, p3):
        x_centroid = ((p1[0] + p3[0]) * 0.5)
        y_centroid = ((p1[1] + p3[1]) * 0.5)
        return x_centroid, y_centroid

    def adjust_gamma(self, image, gamma):  # TODO: Give Abishek's Autogamma correction code also.
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        return cv2.LUT(image, table)

    def toPercentage(self, x1, y1, x2, y2, x3, y3, x4, y4, height, width):
        x1p = round(x1 / width, 2)  # play with the round of parameter for better pricision
        x2p = round(x2 / width, 2)
        x3p = round(x3 / width, 2)
        x4p = round(x4 / width, 2)
        y1p = round(y1 / height, 3)
        y2p = round(y2 / height, 3)
        y3p = round(y3 / height, 3)
        y4p = round(y4 / height, 3)
        # def toImCoord(im1, x1p,y1p,x2p,y2p):
        w, h = 700, 800
        p1 = int(x1p * w)
        p2 = int(y1p * h)
        p3 = int(x2p * w)
        p4 = int(y2p * h)
        p5 = int(x3p * w)
        p6 = int(y3p * h)
        p7 = int(x4p * w)
        p8 = int(y4p * h)

        return p1, p2, p3, p4, p5, p6, p7, p8

    def confidence_filter(self, response, user_input):
        loi = []
        for page in response["fullTextAnnotation"]["pages"]:
            for block in page["blocks"]:
                for paragraph in block["paragraphs"]:
                    for word in paragraph["words"]:
                        word_text = ''.join([symbol["text"] for symbol in word["symbols"]])
                        #                        print(word["confidence"])
                        if word["confidence"] < user_input:
                            loi.append({word_text: [
                                [word["boundingBox"]["vertices"][0]["x"], word["boundingBox"]["vertices"][0]["y"]],
                                [word["boundingBox"]["vertices"][2]["x"], word["boundingBox"]["vertices"][2]["y"]]]})

        return loi

    def final_json_para_corrections(self, final_json):
        paradata = final_json["paragraphs"]
        for i in paradata:
            for j in paradata[i]:
                for k in range(len(j["words"])):
                    temp = {j["words"][k]["text"]: {"p1": j["words"][k]["boundingBox"][0:2],
                                                    "p3": j["words"][k]["boundingBox"][4:6]}}
                    j["words"][k].clear()
                    j["words"][k].update(temp)
        final_json["paragraphs"] = paradata
        return final_json

    """def default_all_words_flag_to_false(self, final_json):
        for k in final_json["paragraphs"]:
            for l in final_json["paragraphs"][k]:
                for m in l['words']:
                    m.update({"flag": "False"})
        for k in final_json["tables"]:
            for l in final_json["tables"][k]:
                for m in final_json["tables"][k][l]["words"]:
                    m.update({"flag": "False"})
        return final_json"""

    def default_all_words_flag_to_false(self, final_json):
        for para in final_json["paragraphs"]:
            for line in final_json["paragraphs"][para]:
                for word in line:
                    word.update({"flag": False, "color": None})
        #            print(word)
        for table in final_json["tables"]:
            for cell in final_json["tables"][table]:
                for word in final_json["tables"][table][cell]["words"]:
                    word.update({"flag": False, "color": None})
        return final_json

    def flag_words_to_plot(self, final_json, needed_words, mode):
        u1 = []
        for k in final_json["paragraphs"]:
            for l in final_json["paragraphs"][k]:
                for m in l:
                    p1 = m['boundingBox']["p1"]
                    p3 = m['boundingBox']["p3"]

                    #            print(p1,p3)
                    for i in needed_words:
                        x, y = self.calculate_centroid(list(i.values())[0][0], list(i.values())[0][1])
                        if mode:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    m['text'] == list(i.keys())[0])):
                                m['flag'] = True
                                break
                            elif (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    m['text'] != list(i.keys())[0])):
                                m['flag'] = True
                                temp_dict = {m['text']: [p1, p3]}
                                if temp_dict not in u1: u1.append(temp_dict)
                            else:
                                m['flag'] = False
                        #                                temp_dict = {list(m.keys())[0]: [p1,p3]}
                        #                                if temp_dict not in u1: u1.append(temp_dict)

                        else:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1,
                                                                       p3)):  # and (list(m.keys())[0]==list(i.keys())[0])):
                                m['flag'] = True
                                break
                            else:
                                m['flag'] = False
        for k in final_json["tables"]:
            for l in final_json["tables"][k]:
                for m in final_json["tables"][k][l]["words"]:
                    p1 = m["boundingBox"]["p1"]
                    p3 = m["boundingBox"]["p3"]
                    for i in needed_words:
                        x, y = self.calculate_centroid(list(i.values())[0][0], list(i.values())[0][1])
                        if mode:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    m["text"] == list(i.keys())[0])):
                                m.update({"flag": True})
                                break
                            elif (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    m["text"] != list(i.keys())[0])):
                                m.update({"flag": True})
                                temp_dict = {m["text"]: [p1, p3]}
                                if temp_dict not in u1: u1.append(temp_dict)
                            else:
                                m.update({"flag": False})
                        #                                    temp_dict = {m["text"]: [p1,p3]}
                        #                                    if temp_dict not in u1: u1.append(temp_dict)
                        else:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1,
                                                                       p3)):  # and (m["text"]==list(i.keys())[0])):
                                m.update({"flag": True})
                                break
                            else:
                                m.update({"flag": False})

        upd = {'U1': u1}
        # update_u1(upd, image_name)
        return upd, final_json

    def highlight_word(self, img, text, cord, fontScale,
                       font):  # text = "Some text in a box!"  img = np.zeros((500, 500))

        #        font_scale = 0.7
        #        font = cv2.FONT_HERSHEY_PLAIN
        #        print('FONT : ' ,font)
        # set the rectangle background to Yellow
        rectangle_bgr = (0, 255, 255)  # [255,255,0] (255, 255, 0)

        # get the width and height of the text box
        (text_width, text_height) = cv2.getTextSize(text, fontFace=2, fontScale=fontScale, thickness=1)[0]
        # set the text start position
        text_offset_x = cord[0]
        text_offset_y = cord[1]  # org=(p1[0],int((p3[1]+p1[1])*0.5))
        # make the coords of the box with a small padding of two pixels
        box_coords = (
            (text_offset_x, text_offset_y), (int(text_offset_x + (text_width) * 1.01), text_offset_y - text_height - 2))
        # print("text : ", text, "box_coords : ", box_coords)
        cv2.rectangle(img, box_coords[0], box_coords[1], rectangle_bgr, cv2.FILLED)
        image_final = cv2.putText(img, text, (text_offset_x, text_offset_y), font, fontScale=fontScale,
                                  color=(0, 0, 0), thickness=1)

        return image_final

    def get_optimal_params(self, bb_height, ratio, area):  ## bb width,page size, number of letters to print

        if ratio > 11:
            font = cv2.FONT_HERSHEY_DUPLEX
        #            font = cv2.FONT_HERSHEY_COMPLEX
        else:
            font = cv2.FONT_HERSHEY_SIMPLEX
        #            font = cv2.FONT_HERSHEY_COMPLEX_SMALL

        if area > (1000 * 1000):  ## ABOVE THRESHOLD QUALITY IMAGES
            if bb_height > 70:
                fontscale = 1
            elif bb_height > 60:
                fontscale = 0.92
            elif bb_height > 50:
                fontscale = 0.85
            elif bb_height > 40:
                fontscale = 0.78
            elif bb_height > 30:
                fontscale = 0.71
            elif bb_height > 20:
                fontscale = 0.62
            else:
                fontscale = 0.5
        else:
            fontscale = area / (1000 * 1000)  ## DYNAMIC FONT SCALE
            font = cv2.FONT_HERSHEY_SIMPLEX
            #            print(fontscale)

            if bb_height > 20 and ratio > 8:  # BIG TEXT BUT NOT CONJUSTED
                pass

            elif bb_height > 15 and ratio > 8:  # BIG TEXT BUT NOT CONJUSTED
                fontscale = 0.45

            elif bb_height > 15:  # BIG TEXT BUT CONJUSTED
                fontscale = 0.32

            elif ratio > 8:  ##  SMALL TEXT BUT NOT CONJUSTED
                fontscale = 0.35

            elif fontscale < 0.35:
                pass
            else:
                fontscale = 0.35

        #        fontscale_final = (fontScale_default+fontscale)*0.5
        return fontscale, font

    """def render_flagged_image(self, final_json_to_flag, texted_image, gen_image):

        #        texted_image = self.adjust_gamma(texted_image, gamma=0.2)
        height, width, _ = texted_image.shape
        area = height * width
        #        fontScale = 0.6
        #        print (fontScale)

        if 'paragraphs' in final_json_to_flag:
            for k in final_json_to_flag["paragraphs"]:
                for l in final_json_to_flag["paragraphs"][k]:
                    for m in l:
                        p1 = m['boundingBox']["p1"]
                        p3 = m['boundingBox']["p3"]
                        p2 = [p3[0], p1[1]]
                        p4 = [p1[0], p3[1]]
                        text = m['text']
                        #
                        print('WORD : ', text, ' BoundingBox Height : ', abs(p3[1] - p1[1]))
                        print('WORD : ', text, ' BoundingBox Width / len of word : ', abs(p3[0] - p1[0]) / len(text))

                        print('*' * 10)

                        height, ratio = abs(p3[1] - p1[1]), abs(p3[0] - p1[0]) / len(text)
                        fontScale, font = self.get_optimal_params(height, ratio, area)
                        #                        print('FONT : ',font)
                        if m['flag'] == True:
                            texted_image = self.highlight_word(texted_image, text,
                                                               (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), fontScale, font)
                        else:
                            cv2.putText(texted_image, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), font, fontScale,
                                        (0, 0, 0), 1, cv2.LINE_AA)
        else:
            pass

        if 'tables' in final_json_to_flag:
            for k in final_json_to_flag["tables"]:
                for l in final_json_to_flag["tables"][k]:
                    for m in final_json_to_flag["tables"][k][l]["words"]:
                        p1 = m["boundingBox"]["p1"]
                        p3 = m["boundingBox"]["p3"]
                        p2 = [p3[0], p1[1]]
                        p4 = [p1[0], p3[1]]
                        text = m["text"]
                        vertices = [p1, p2, p3, p4]

                        #                        print('WORD : ',text , ' BoundingBox Height : ',abs(p3[1]-p1[1]))
                        #                        print('WORD : ',text , ' BoundingBox Width / len of word : ',abs(p3[0]-p1[0])/len(text))
                        #
                        #                        print('*'*10)

                        height, ratio = abs(p3[1] - p1[1]), abs(p3[0] - p1[0]) / len(text)
                        fontScale, font = self.get_optimal_params(height, ratio, area)
                        #                        print('FONT : ',font)
                        if m['flag'] == True:
                            texted_image = self.highlight_word(texted_image, text,
                                                               (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), fontScale, font)
                        else:
                            cv2.putText(texted_image, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), font, fontScale,
                                        (0, 0, 0), 1, cv2.LINE_AA)
        else:
            pass

        #        int((p4[1]+p1[1])*0.5)

        if area < 1000 * 1000:
            pass

        else:
            texted_image = self.adjust_gamma(texted_image, gamma=0.4)
        cv2.imwrite(gen_image, texted_image)
        return"""

    def render_flagged_image(self, final_json_to_flag, mask, gen_image):  # plain_mask = False

        #        texted_image = self.adjust_gamma(texted_image, gamma=0.2)
        height, width, _ = mask.shape
        area = height * width
        #        fontScale = 0.6
        #        print (fontScale)
        #        print(final_json_to_flag)
        #        print('RESULT: ',sum([len(final_json_to_flag["tables"][table]) for table in final_json_to_flag["tables"]]))
        # if ((len(final_json_to_flag["tables"]) == 0) or (sum(
        #         [len(final_json_to_flag["tables"][table]) for table in final_json_to_flag["tables"]]) == 0)) and min(
        #     height, width) < 700:  # or plain_mask == True:
        #     white_canvas = 255 * np.ones(mask.shape).astype(mask.dtype)
        #     mask = white_canvas.copy()
        # else:
        #     pass

        if 'paragraphs' in final_json_to_flag:
            for k in final_json_to_flag["paragraphs"]:
                for l in final_json_to_flag["paragraphs"][k]:
                    for m in l:
                        p1 = m['boundingBox']["p1"]
                        p3 = m['boundingBox']["p3"]
                        p2 = [p3[0], p1[1]]
                        p4 = [p1[0], p3[1]]
                        text = m['text']
                        #
                        #                        print('WORD : ',text , ' BoundingBox Height : ',abs(p3[1]-p1[1]))
                        #                        print('WORD : ',text , ' BoundingBox Width / len of word : ',abs(p3[0]-p1[0])/len(text))
                        #
                        #                        print('*'*10)
                        #
                        height, ratio = abs(p3[1] - p1[1]), abs(p3[0] - p1[0]) / len(text)
                        fontScale, font = self.get_optimal_params(height, ratio, area)
                        #                        print('FONT : ',font)
                        if m['flag'] == True:
                            mask = self.highlight_word(mask, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), fontScale,
                                                       font)
                        else:
                            cv2.putText(mask, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), font, fontScale, (0, 0, 0),
                                        1, cv2.LINE_AA)
        else:
            pass

        if 'tables' in final_json_to_flag:
            for k in final_json_to_flag["tables"]:
                for l in final_json_to_flag["tables"][k]:
                    for m in final_json_to_flag["tables"][k][l]["words"]:
                        p1 = m["boundingBox"]["p1"]
                        p3 = m["boundingBox"]["p3"]
                        p2 = [p3[0], p1[1]]
                        p4 = [p1[0], p3[1]]
                        text = m["text"]
                        vertices = [p1, p2, p3, p4]

                        #                        print('WORD : ',text , ' BoundingBox Height : ',abs(p3[1]-p1[1]))
                        #                        print('WORD : ',text , ' BoundingBox Width / len of word : ',abs(p3[0]-p1[0])/len(text))
                        #
                        #                        print('*'*10)

                        height, ratio = abs(p3[1] - p1[1]), abs(p3[0] - p1[0]) / len(text)
                        fontScale, font = self.get_optimal_params(height, ratio, area)
                        #                        print('FONT : ',font)
                        if m['flag'] == True:
                            mask = self.highlight_word(mask, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), fontScale,
                                                       font)
                        else:
                            cv2.putText(mask, text, (p4[0] + 3, int((p4[1] + p1[1]) * 0.5)), font, fontScale, (0, 0, 0),
                                        1, cv2.LINE_AA)
        else:
            pass

        #        int((p4[1]+p1[1])*0.5)

        if area < 1000 * 1000:
            pass

        else:
            mask = self.adjust_gamma(mask, gamma=0.4)
        mask = dynamic_cavas(mask)
        cv2.imwrite(gen_image, mask)
        return

    def document_confidence(self, analysis):
        word_count, error = 0, 0
        for line in analysis['lines']:

            for word in line['words']:
                word_count = word_count + 1

                if 'confidence' in word.keys():
                    error = error + 1
                else:
                    pass

        document_accuracy = round((word_count - error) / word_count, 2)
        return document_accuracy, word_count


def ui_flag_v2(mask, final_json, google_response, google_response2, gen_image, analysis, percent=1):
    mask = mask
    final_json = final_json

    uc_obj = ui_corrections(mask, final_json, google_response, google_response2)

    final_json = uc_obj.default_all_words_flag_to_false(final_json)
    doc_accuracy, total_words = uc_obj.document_confidence(analysis)

    if percent == 1:
        mode = "default"
        needed_words = uc_obj.all_words(analysis)
    else:
        mode = None
        needed_words = uc_obj.confidence_filter(uc_obj.google_response, percent)
    upd, fj = uc_obj.flag_words_to_plot(final_json, needed_words, mode)

    uc_obj.render_flagged_image(fj, uc_obj.mask, gen_image)
    # cv2.imwrite(gen_image, texted_image)
    with open(gen_image, mode='rb') as file:
        img = file.read()
    gen_image = base64.encodebytes(img)
    return gen_image, doc_accuracy, total_words


def check_if_centroid_inbetween_p1_p3(centroid, p1, p3):
    if p1[0] <= centroid[0] <= p3[0] and p1[1] <= centroid[1] <= p3[1]:
        return True
    else:
        return False


def fetch_click_word_from_final_json(final_json, click_coordinate):
    if "paragraphs" in final_json.keys():
        for para in final_json["paragraphs"]:
            for line in final_json["paragraphs"][para]:
                for word in line:

                    p1 = word['boundingBox']['p1']
                    p3 = word['boundingBox']['p3']
                    print(p1, p3)
                    '''for val in list(m.values()):
                        if isinstance(val, list):
                            p1 = val[0:2]
                            p3 = val[4:6]'''
                    if check_if_centroid_inbetween_p1_p3(click_coordinate, p1, p3):
                        return True, word['text']
    if "tables" in final_json.keys():
        for k in final_json["tables"]:
            for l in final_json["tables"][k]:
                for m in final_json["tables"][k][l]["words"]:
                    p1 = m["boundingBox"]["p1"]
                    p3 = m["boundingBox"]["p3"]
                    if check_if_centroid_inbetween_p1_p3(click_coordinate, p1, p3):
                        return True, m['text']

    return False, ""


def update_user_changes_to_from_final_json(final_json, click_coordinate, user_input):
    """
    click coordinate is a list where the word has to be updated
    user input is a string that  user provides
    """
    for k in final_json["paragraphs"]:
        for l in final_json["paragraphs"][k]:
            for m in l['words']:
                #                print(m)
                p1 = list(m.values())[0][0:2]
                p3 = list(m.values())[0][4:6]
                if check_if_centroid_inbetween_p1_p3(click_coordinate, p1, p3):
                    m['text'] = user_input
                    return True, final_json

    for k in final_json["tables"]:
        for l in final_json["tables"][k]:
            for m in final_json["tables"][k][l]["words"]:
                p1 = m["boundingBox"]["p1"]
                p3 = m["boundingBox"]["p3"]
                if check_if_centroid_inbetween_p1_p3(click_coordinate, p1, p3):
                    m['text'] = user_input
                    return True, final_json
    return False, final_json


def offset(dev_click_cord, image_size, dim):
    x, y = dev_click_cord[0], dev_click_cord[1]
    x_offseted = int(x * (image_size[1] / dim[1]))
    y_offseted = int(y * (image_size[0] / dim[0]))

    return [x_offseted, y_offseted]


def cleaned_final_json(final_json):
    clean_final_json = final_json.copy()

    if 'paragraphs' in final_json.keys():
        for i in range(len(final_json['paragraphs'])):

            lines = {}
            for j, line in enumerate(final_json['paragraphs']['p_' + str(i + 1)]):
                lines['line_' + str(j + 1)] = ' '.join([word['text'] for word in line])

            clean_final_json['paragraphs']['p_' + str(i + 1)] = lines
    else:
        pass

    if 'tables' in final_json.keys():
        for i in range(len(final_json['tables'])):

            for cell in final_json['tables'][str(i + 1)]:
                cell_content = {}
                for j, word in enumerate(clean_final_json['tables'][str(i + 1)][cell]['words']):
                    cell_content[j + 1] = clean_final_json['tables'][str(i + 1)][cell]['words'][j]['text']

                clean_final_json['tables'][str(i + 1)][cell] = cell_content
    else:
        pass

    return clean_final_json


def sort_json(final_json):
    sorted_json = {}
    for key in final_json.keys():
        if key not in ['tables', 'paragraphs']:
            sorted_json[key] = final_json[key]

    if 'paragraphs' in final_json.keys():
        para_order = sorted(final_json['paragraphs'], key=lambda x: int(x.split('_')[1]))

        paras = []
        for para in para_order:
            paras.append((para, final_json['paragraphs'][para]))

        sorted_json['paragraphs'] = OrderedDict(paras)

    if 'tables' in final_json.keys():
        sorted_json['tables'] = {}
        for table in final_json['tables']:
            cell_order = sorted(final_json['tables'][table], key=lambda x: int(x.split('r')[0].split('c')[-1]))

            cells = []
            for cell in cell_order:
                cells.append((cell, final_json['tables'][table][cell]))

            sorted_json['tables'][table] = OrderedDict(cells)

    return sorted_json


def dynamic_cavas(image):
    height, width = image.shape[:2]

    if max(height, width) > 2000:  # 35% size reduction
        scale_percent = 65  # percent of original size

    elif max(height, width) > 1500:
        scale_percent = 75



    elif max(height, width) > 1000:
        scale_percent = 85

    else:
        scale_percent = 100

    width_scaled = int(image.shape[1] * scale_percent / 100)
    height_scaled = int(image.shape[0] * scale_percent / 100)

    dim = (width_scaled, height_scaled)
    # resize image
    resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)

    return resized


def dynamic_cavas_size(shape):
    height, width = shape

    if max(height, width) > 2000:  # 35% size reduction
        scale_percent = 65  # percent of original size

    elif max(height, width) > 1500:
        scale_percent = 75

    elif max(height, width) > 1000:
        scale_percent = 85

    else:
        scale_percent = 100

    width_scaled = int(shape[1] * scale_percent / 100)
    height_scaled = int(shape[0] * scale_percent / 100)

    dim = height_scaled, width_scaled

    return dim
