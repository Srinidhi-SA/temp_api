from ocr.ITE.Functions import *
from PIL import Image
import simplejson as json
from io import BytesIO

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "ocr/ITE/My_ProjectOCR_2427.json"


lis = []


def RPA(analysis, google_response, image_slug, image_name, mask_ex=" "):

    response_dict, d = fun1(analysis, google_response)

    data3 = fun2(response_dict, d, image_name)  # comparison

    data = write_to_Json(analysis, image_name)  # Azure
    image_data = open(mask_ex, "rb").read()
    image_ = Image.open(BytesIO(image_data))
    data2 = write_to_json2(data, image_name, image_slug)  # Converted
    mask = plot(image_, data3, image_slug)
    return data, data2, data3, image_data, image_, mask


def FindPoint1(x, y, data2):
    if isinstance(data2, dict):
        for i in range(len(data2)):
            p1 = data2['b' + str(i)][0]
            p2 = data2['b' + str(i)][1]
            p3 = data2['b' + str(i)][4]
            p4 = data2['b' + str(i)][5]
            if p1 < x < p3 and p2 < y < p4:
                act_point = i
                return data2['b' + str(i)][8], act_point


def not_clear(act_point, word, data2, data3):

    analysis_list = list()

    data2['b' + str(act_point)][8] = word

    data3['b' + str(act_point)][1] = word  # word returned from UI
    data3['b' + str(act_point)][3] = 'Not_Sure'

    analysis_list.append(['b' + str(act_point), {'boundingBox': data3['b' + str(act_point)][0], 'text': word}])

    return data2, data3, analysis_list


def update_word(act_point, word, data2, data3):  # Save the new words

    analysis_list = list()

    data2['b' + str(act_point)][8] = word

    data3['b' + str(act_point)][1] = word
    data3['b' + str(act_point)][3] = 'True'

    analysis_list.append(['b' + str(act_point), {'boundingBox': data3['b' + str(act_point)][0], 'text': word}])

    return data2, data3, analysis_list


def updated_analysis(analysis, user_input):
    def Sort(list_):
        # reverse = None (Sorts in Ascending order)
        # key is set to sort using second element of
        # sublist lambda has been used
        list_.sort(key=lambda x: x[1]["boundingBox"][1])
        return list_

    def get_text_cor(analysis):
        text_cor = []
        for line in analysis["recognitionResults"][0]["lines"]:
            for word_dic in line["words"]:
                text_cor.append(word_dic["boundingBox"][0:2])
        return text_cor

    text_cor = get_text_cor(analysis)

    if not user_input:
        return analysis
    else:
        print(user_input)
        user_input = Sort(user_input)
        for new_text in user_input:
            for line in analysis["recognitionResults"][0]["lines"]:
                #                     print(line["words"][-1]["boundingBox"])
                for word_dic in line["words"]:
                    #                         print(word_dic["text"])
                    if word_dic["boundingBox"][0:2] == new_text[1]["boundingBox"][0:2] and line["text"] == word_dic[
                        "text"]:
                        line["text"] = new_text[1]["text"]
                        word_dic["text"] = new_text[1]["text"]
                        #                             print(word_dic["text"])
                        break
                    elif word_dic["boundingBox"][0:2] == new_text[1]["boundingBox"][0:2] and len(line["text"]) != len(
                            word_dic["text"]):
                        line["text"] = " ".join(
                            [new_text[1]["text"] if x == word_dic["text"] else x for x in line["text"].split(" ")])
                        word_dic["text"] = new_text[1]["text"]
                        #                             print(word_dic["text"])
                        break

        return analysis
