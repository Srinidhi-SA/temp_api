# -*- coding: utf-8 -*-
import base64
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "ocr/ITE/My_ProjectOCR_2427.json"
from google.protobuf.json_format import MessageToJson
from ocr.ITE.scripts.apis import fetch_google_response
import cv2
import json
from ocr.ITE.scripts.info_mapping import update_u1


class ui_corrections:
    def __init__(self, mask, final_json, google_response, image_path=None, image_directory_name=None,
                 database_path=None):
        self.mask = mask
        self.final_json = final_json
        # self.google_response = self.optimised_fetch_google_response(image_path, image_directory_name, database_path)
        self.google_response = google_response
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

    # =============================================================================
    # for i in needed_words:
    #
    #     x,y=calculate_centroid(list(i.values())[0][0],list(i.values())[0][1])
    # =============================================================================

    def check_if_centroid_inbetween_p1_p3(self, centroid, p1, p3):
        if p1[0] <= centroid[0] <= p3[0] and p1[1] <= centroid[1] <= p3[1]:
            return True
        else:
            return False

    def calculate_centroid(self, p1, p3):
        x_centroid = ((p1[0] + p3[0]) * 0.5)
        y_centroid = ((p1[1] + p3[1]) * 0.5)
        return x_centroid, y_centroid

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

    def default_all_words_flag_to_false(self, final_json):
        for k in final_json["paragraphs"]:
            for l in final_json["paragraphs"][k]:
                for m in l['words']:
                    m.update({"flag": "False"})
        for k in final_json["tables"]:
            for l in final_json["tables"][k]:
                for m in final_json["tables"][k][l]["words"]:
                    m.update({"flag": "False"})
        return final_json

    def flag_words_to_plot(self, final_json, needed_words, mode):
        u1 = []
        for k in final_json["paragraphs"]:
            for l in final_json["paragraphs"][k]:
                for m in l['words']:
                    for val in list(m.values()):
                        if isinstance(val, dict):
                            p1 = val['p1']
                            p3 = val['p3']
                    for i in needed_words:
                        x, y = self.calculate_centroid(list(i.values())[0][0], list(i.values())[0][1])
                        if mode:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    list(m.keys())[0] == list(i.keys())[0])):
                                m.update({"flag": "False"})
                                break
                            elif (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    list(m.keys())[0] != list(i.keys())[0])):
                                m.update({"flag": "True"})
                                temp_dict = {list(m.keys())[0]: [p1, p3]}
                                if temp_dict not in u1: u1.append(temp_dict)
                            else:
                                m.update({"flag": "True"})
                        #                                temp_dict = {list(m.keys())[0]: [p1,p3]}
                        #                                if temp_dict not in u1: u1.append(temp_dict)

                        else:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1,
                                                                       p3)):  # and (list(m.keys())[0]==list(i.keys())[0])):
                                m.update({"flag": "True"})
                                break
                            else:
                                m.update({"flag": "False"})
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
                                m.update({"flag": "False"})
                                break
                            elif (self.check_if_centroid_inbetween_p1_p3([x, y], p1, p3) and (
                                    m["text"] != list(i.keys())[0])):
                                m.update({"flag": "True"})
                                temp_dict = {m["text"]: [p1, p3]}
                                if temp_dict not in u1: u1.append(temp_dict)
                            else:
                                m.update({"flag": "True"})
                        #                                    temp_dict = {m["text"]: [p1,p3]}
                        #                                    if temp_dict not in u1: u1.append(temp_dict)
                        else:
                            if (self.check_if_centroid_inbetween_p1_p3([x, y], p1,
                                                                       p3)):  # and (m["text"]==list(i.keys())[0])):
                                m.update({"flag": "True"})
                                break
                            else:
                                m.update({"flag": "False"})

        upd = {'U1': u1}
        # update_u1(upd, image_name)
        return upd, final_json

    def render_flagged_image(self, final_json_to_flag, texted_image):
        for k in final_json_to_flag["paragraphs"]:
            for l in final_json_to_flag["paragraphs"][k]:
                for m in l['words']:
                    for val in list(m.values()):
                        if isinstance(val, dict):
                            p1 = val['p1']
                            p3 = val['p3']
                            p2 = [p3[0], p1[1]]
                            p4 = [p1[0], p3[1]]
                    for key, val in m.items():
                        if isinstance(val, dict):
                            text = key
                    texted_image = cv2.putText(img=texted_image, text=text, org=(p1[0], int((p3[1] + p1[1]) * 0.5)),
                                               fontFace=3, fontScale=0.7, color=(0, 0, 0), thickness=1)
                    if (m['flag'] == 'True'):
                        cv2.rectangle(texted_image, (p1[0], p1[1]), (p3[0], p3[1]), (0, 0, 255), 1)
        for k in final_json_to_flag["tables"]:
            for l in final_json_to_flag["tables"][k]:
                for m in final_json_to_flag["tables"][k][l]["words"]:
                    p1 = m["boundingBox"]["p1"]
                    p3 = m["boundingBox"]["p3"]
                    p2 = [p3[0], p1[1]]
                    p4 = [p1[0], p3[1]]
                    text = m["text"]
                    texted_image = cv2.putText(img=texted_image, text=text, org=(p1[0], int((p3[1] + p1[1]) * 0.5)),
                                               fontFace=3, fontScale=0.6, color=(0, 0, 0), thickness=1)
                    if (m['flag'] == 'True'):
                        cv2.rectangle(texted_image, (p1[0], p1[1]), (p3[0], p3[1]), (0, 0, 255), 1)
        return texted_image


def ui_flag_v2(mask, final_json, google_response, gen_image, percent=100):
    mask = mask
    final_json = final_json

    adsfff = ui_corrections(mask, final_json, google_response)

    final_json = adsfff.final_json_para_corrections(final_json)
    final_json = adsfff.default_all_words_flag_to_false(final_json)
    needed_words = adsfff.confidence_filter(adsfff.google_response, percent)

    if percent == 1:
        mode = "default"
    else:
        mode = None
    upd, tempasdfds = adsfff.flag_words_to_plot(final_json, needed_words, mode)

    texted_image = adsfff.render_flagged_image(tempasdfds, adsfff.mask)
    cv2.imwrite(gen_image, texted_image)
    with open(gen_image, mode='rb') as file:
        img = file.read()
    gen_image = base64.encodebytes(img)
    return gen_image


def check_if_centroid_inbetween_p1_p3(centroid, p1, p3):
    if p1[0] <= centroid[0] <= p3[0] and p1[1] <= centroid[1] <= p3[1]:
        return True
    else:
        return False


def fetch_click_word_from_final_json(final_json, click_coordinate):
    """

        """
    for k in final_json["paragraphs"]:
        for l in final_json["paragraphs"][k]:
            for m in l['words']:
                #                print(m)
                p1 = list(m.values())[0][0:2]
                p3 = list(m.values())[0][4:6]
                if check_if_centroid_inbetween_p1_p3(click_coordinate, p1, p3):
                    return True, list(m.values())[1]

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
