#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from ocr.ITE.master_helper import *
import os
import simplejson as json

import matplotlib as mpl

if os.environ.get('DISPLAY', '') == '':
    print('no display found. Using non-interactive Agg backend')
    mpl.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon


def euclidean_distance(plot1, plot2):
    import math
    return math.sqrt((plot1[0] - plot2[0]) ** 2 + (plot1[1] - plot2[1]) ** 2)


def detect_text(path):
    """Detects text in the file."""
    from google.cloud import vision
    import io
    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.types.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    return response


def fun1(analysis, google_response):
    wc = {}
    for i, line in enumerate(analysis["recognitionResults"][0]["lines"]):
        wc[i + 1] = [(word['boundingBox'], word['text']) for word in line['words']]

    bs = [lst for sublist in list(wc.values()) for lst in sublist]

    d = {'b' + str(i): val for i, val in enumerate(bs)}
    response_dict = {}

    for i in range(len(google_response.text_annotations)):
        response_dict['b' + str(i)] = ([[google_response.text_annotations[i].bounding_poly.vertices[0].x,
                                         google_response.text_annotations[i].bounding_poly.vertices[0].y],
                                        [google_response.text_annotations[i].bounding_poly.vertices[2].x,
                                         google_response.text_annotations[i].bounding_poly.vertices[2].y]],
                                       google_response.text_annotations[i].description)
    return response_dict, d


########################################################################################################
"""
function to find the centroid of the points
"""


def fun2(response_dict, d, image_name):
    def midpoint(point_1, point_2):
        mid_x = (point_1[0] + ((point_2[0] - point_1[0]) / 2))
        mid_y = (point_1[1] + ((point_2[1] - point_1[1]) / 2))
        return [mid_x, mid_y]

    # midpoint(list(response_dict[list(response_dict.keys())[i]])[0][0],list(response_dict[list(response_dict.keys())[i]])[0][1])
    for i in range(len(list(response_dict.keys()))):
        temp = list(response_dict[list(response_dict.keys())[i]])
        temp.append(midpoint(list(response_dict[list(response_dict.keys())[i]])[0][0],
                             list(response_dict[list(response_dict.keys())[i]])[0][1]))
        response_dict[list(response_dict.keys())[i]] = temp
    # =============================================================================
    # [list(d[list(d.keys())[i]])[0][0],list(d[list(d.keys())[i]])[0][1]]
    # [list(d[list(d.keys())[i]])[0][4],list(d[list(d.keys())[i]])[0][5]]
    #
    # =============================================================================
    for i in range(len(list(d.keys()))):
        temp = list(d[list(d.keys())[i]])
        temp.append(midpoint([list(d[list(d.keys())[i]])[0][0], list(d[list(d.keys())[i]])[0][1]],
                             [list(d[list(d.keys())[i]])[0][4], list(d[list(d.keys())[i]])[0][5]]))
        temp.append("False")
        d[list(d.keys())[i]] = temp
    l = 0
    for i in range(len(response_dict)):
        for j in range(len(d)):
            if (response_dict[list(response_dict.keys())[i]][1] == d[list(d.keys())[j]][1]) and (
                    euclidean_distance(response_dict[list(response_dict.keys())[i]][2], d[list(d.keys())[j]][2]) < 7):
                # print("word found")
                l = l + 1
                # plt.scatter([response_dict[list(response_dict.keys())[i]][2][0]],
                #             [response_dict[list(response_dict.keys())[i]][2][1]], c='y', s=15)
                temp = list(d[list(d.keys())[j]])
                temp[3] = "True"
                d[list(d.keys())[j]] = temp
                # microsoft_centroid_list[j]['match_flag']=True
                break

    # with open(os.getcwd() + '/ocr/ITE/ir/' + 'comparison.json', 'w+') as fp:
    #    json.dump(d, fp, sort_keys=True, indent=4)
    return d


##########################################################################################################
''' WRITE THE ACTUAL COORDINATES TO JSON - WORDWISE'''


#########################################################################################################
def write_to_Json(analysis, image_name):
    wc = {}
    for i, line in enumerate(analysis["recognitionResults"][0]["lines"]):
        wc[i + 1] = [(word['boundingBox'], word['text']) for word in line['words']]

    bs = [lst for sublist in list(wc.values()) for lst in sublist]

    d = {'b' + str(i): val for i, val in enumerate(bs)}

    with open(os.getcwd() + '/ocr/ITE/ir/' + image_name + '_AzureCoord.json', 'w') as fp:
        json.dump(d, fp, sort_keys=True, indent=4)
    with open(os.getcwd() + '/ocr/ITE/ir/' + image_name + '_AzureCoord.json', 'r') as fp:
        data = json.load(fp)
    return data


##########################################################################################################
'''Convert the coordinates according to the size of the Image'''


##########################################################################################################
def write_to_json2(data, image_name, image_slug):
    image_path1 = os.getcwd() + '/ocr/ITE/ir/' + image_slug + '_original_image.png'

    # ImageforDisplay(filename=image_path1)
    im1 = Image.open(image_path1)
    width, height = im1.size
    print(width, height)

    def toPercentage(im, x1, y1, x2, y2, x3, y3, x4, y4, word):
        width, height = im.size
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

        return p1, p2, p3, p4, p5, p6, p7, p8, word

    new = []
    for i in range(len(data)):
        x1 = data["b" + str(i)][0][0]
        y1 = data["b" + str(i)][0][1]

        x2 = data["b" + str(i)][0][2]
        y2 = data["b" + str(i)][0][3]

        x3 = data["b" + str(i)][0][4]
        y3 = data["b" + str(i)][0][5]

        x4 = data["b" + str(i)][0][6]
        y4 = data["b" + str(i)][0][7]

        w = data["b" + str(i)][1]
        # toPercentage(im,ix1,y1,x2,y2,w)
        new.append(toPercentage(im1, x1, y1, x2, y2, x3, y3, x4, y4, w))

    d11 = {'b' + str(i): val for i, val in enumerate(new)}

    with open(os.getcwd() + '/ocr/ITE/ir/' + image_name + '_ConvertedCoords.json', 'w') as fp:
        json.dump(d11, fp, sort_keys=True, indent=4)
    with open(os.getcwd() + '/ocr/ITE/ir/' + image_name + '_ConvertedCoords.json', 'r') as fp:
        data2 = json.load(fp)
    return data2


#########################################################################################################
''' Plot the text on an Image    '''
##########################################################################################################
try:
    with open(os.getcwd() + '/ocr/ITE/ir/' + 'comparison.json', 'r') as fp:
        data3 = json.load(fp)
except:
    pass


# image_data = open(mask, "rb").read()
# image_ = Image.open(BytesIO(image_data))


def plot(image, data3, image_slug):
    plt.figure(figsize=(15, 15))

    width, height = image.size
    print(width, height)
    plt.axis('off')
    ax = plt.imshow(image)
    # ax.set_axis_off()
    for i in data3:
        text = data3[i][1]
        # if(data3[i][3]=='False'):

        vertices = [(data3[i][0][0], data3[i][0][1]), (data3[i][0][2], data3[i][0][3]),
                    (data3[i][0][4], data3[i][0][5]), (data3[i][0][6], data3[i][0][7])]
        plt.text(vertices[0][0], vertices[0][1], text, fontsize=8, va="top", color='black')
        if data3[i][3] == 'False':
            patch = Polygon(vertices, closed=True, fill=False, linewidth=2, color='r')
            ax.axes.add_patch(patch)
    # print(os.getcwd())
    plt.savefig(os.getcwd() + '/ocr/ITE/ir/' + image_slug + '_gen_image.png', bbox_inches='tight', pad_inches=0)
    return os.getcwd() + '/ocr/ITE/ir/' + image_slug + '_gen_image.png'


#####################################################################################################################################

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


def updated_analysis(analysis, user_input):
    text_cor = get_text_cor(analysis)
    user_input = Sort(user_input)
    for new_text in user_input:
        for line in analysis["recognitionResults"][0]["lines"]:
            #                     print(line["words"][-1]["boundingBox"])
            for word_dic in line["words"]:
                #                         print(word_dic["text"])
                if word_dic["boundingBox"][0:2] == new_text[1]["boundingBox"][0:2] and line["text"] == word_dic["text"]:
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
        if new_text[1]["boundingBox"][0:2] not in text_cor:
            new_text[1]["words"] = [new_text[1].copy()]
            analysis["recognitionResults"][0]["lines"].append(new_text[1])
    return analysis
