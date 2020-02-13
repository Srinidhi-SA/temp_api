#!/usr/bin/env python3


import os
import random
import tkinter as tk
from tkinter import ttk
from tkinter import *
import numpy as np
from tkinter import messagebox
from PIL import ImageTk, Image
import pandas as pd
import json

import matplotlib as mpl

from scipy.spatial import distance
import pandas as pd
import numpy as np
from matplotlib.patches import Polygon
import matplotlib.pyplot as plt
import networkx as nx
from scipy import optimize as opt
from sklearn.cluster import DBSCAN
import cv2, os, sys, time, json, operator, requests
from PIL import Image, ImageEnhance
from PIL import Image as im
# TODO: fix these duplicate imports
from io import BytesIO
from math import floor, ceil, sqrt
from shutil import rmtree
import pdf2image
from IPython.display import Image as ImageforDisplay
from scipy.ndimage import interpolation as inter
from collections import OrderedDict
from shutil import copy2, rmtree
import re  # define upper frame


def azure_response_to_dict_format(analysis):
    """
    convert the azure response to a dict format
    """

    wc = {}
    for i,line in enumerate(analysis["recognitionResults"][0]["lines"]):
        wc[i+1] = [(word['boundingBox'] ,word['text']) for word in line['words']]


    bs = [lst for sublist in list(wc.values()) for lst in sublist]


    needed_dict = {'b'+str(i):val for  i,val in enumerate(bs)}

    return needed_dict

def euclidean_distance(plot1,plot2):
    import math
    return math.sqrt( (plot1[0]-plot2[0])**2 + (plot1[1]-plot2[1])**2 )


def google_microsoft_common_format(analysis,google_response):
    """
    function to convert the analysis and google response into a common format say
    "bounding box number :bounding box co-ordinates and text in the co-ordinates"
    """
    d=azure_response_to_dict_format(analysis)




    response_dict={}


    for i in range(len(google_response.text_annotations)):
        response_dict['b'+str(i)]=([[google_response.text_annotations[i].bounding_poly.vertices[0].x,google_response.text_annotations[i].bounding_poly.vertices[0].y],[google_response.text_annotations[i].bounding_poly.vertices[2].x,google_response.text_annotations[i].bounding_poly.vertices[2].y]],google_response.text_annotations[i].description)
    return response_dict,d

def midpoint(point_1,point_2):
    mid_x=(point_1[0]+((point_2[0]-point_1[0])/2))
    mid_y=(point_1[1]+((point_2[1]-point_1[1])/2))
    return [mid_x,mid_y]


def midpoint_comparison(response_dict,d):
    """
    find the midpoint of the words from both google response and microsoft analysis and
    see if there are any matches in both of them,if any raise the flag as True else False
    """



    #midpoint(list(response_dict[list(response_dict.keys())[i]])[0][0],list(response_dict[list(response_dict.keys())[i]])[0][1])
    for i in range(len(list(response_dict.keys()))):
        temp=list(response_dict[list(response_dict.keys())[i]])
        temp.append(midpoint(list(response_dict[list(response_dict.keys())[i]])[0][0],list(response_dict[list(response_dict.keys())[i]])[0][1]))
        response_dict[list(response_dict.keys())[i]]=temp
    # =============================================================================
    # [list(d[list(d.keys())[i]])[0][0],list(d[list(d.keys())[i]])[0][1]]
    # [list(d[list(d.keys())[i]])[0][4],list(d[list(d.keys())[i]])[0][5]]
    #
    # =============================================================================
    for i in range(len(list(d.keys()))):
        temp=list(d[list(d.keys())[i]])
        temp.append(midpoint([list(d[list(d.keys())[i]])[0][0],list(d[list(d.keys())[i]])[0][1]],[list(d[list(d.keys())[i]])[0][4],list(d[list(d.keys())[i]])[0][5]]))
        temp.append("False")
        d[list(d.keys())[i]]=temp


    l=0
    for i in range(len(response_dict)):
        for j in range(len(d)):
            if (response_dict[list(response_dict.keys())[i]][1]==d[list(d.keys())[j]][1]) and (euclidean_distance(response_dict[list(response_dict.keys())[i]][2],d[list(d.keys())[j]][2])<7):
                print("word found")
                l=l+1
                plt.scatter([response_dict[list(response_dict.keys())[i]][2][0]],[response_dict[list(response_dict.keys())[i]][2][1]],c='y',s=15)
                temp=list(d[list(d.keys())[j]])
                temp[3]="True"
                d[list(d.keys())[j]]=temp
                #microsoft_centroid_list[j]['match_flag']=True
                break

# =============================================================================
#     with open('comparison.json', 'w') as fp:
#         json.dump(d, fp, sort_keys=True, indent=4)
# =============================================================================
    return d

def toPercentage(im23,x1,y1,x2,y2,x3,y3,x4,y4):

        height,width,ch = im23.shape
        x1p = round(x1 / width,2) #play with the round of parameter for better pricision
        x2p = round(x2 / width,2)
        x3p= round(x3 / width,2)
        x4p= round(x4 / width,2)
        y1p = round(y1 / height,3)
        y2p = round(y2 / height,3)
        y3p= round(y3 / height,3)
        y4p = round(y4 / height,3)
    #def toImCoord(im1, x1p,y1p,x2p,y2p):
        w,h = 700,800
        p1 =int( x1p * w)
        p2 =int (y1p * h)
        p3 = int( x2p * w)
        p4 = int(y2p * h)
        p5=int( x3p * w)
        p6=int (y3p * h)
        p7=int( x4p * w)
        p8=int (y4p * h)

        return p1,p2,p3,p4,p5,p6,p7,p8


def write_to_json2(data,im1):

    new = []
    for i in range(len(data)):
        x1=data["b"+str(i)][0][0]
        y1=data["b"+str(i)][0][1]

        x2=data["b"+str(i)][0][2]
        y2=data["b"+str(i)][0][3]

        x3=data["b"+str(i)][0][4]
        y3=data["b"+str(i)][0][5]

        x4=data["b"+str(i)][0][6]
        y4=data["b"+str(i)][0][7]

        w=data["b"+str(i)][1]
        #toPercentage(im,ix1,y1,x2,y2,w)
        new.append(toPercentage(im1,x1,y1,x2,y2,x3,y3,x4,y4))

    d11 = {'b'+str(i):val for  i,val in enumerate(new)}
    return d11






def plot_function(image,data3):
    dpi = mpl.rcParams['figure.dpi']

    height,width,ch = image.shape
    #figsize = width / float(dpi), height / float(dpi)
    plt.figure(figsize=(15,15))
    print (width, height)
    plt.axis('off')
    ax = plt.imshow(image)
    #ax=plt
    # ax.set_axis_off()
    for i in data3:
        text = data3[i][1]
        #if(data3[i][3]=='False'):

        vertices =[ (data3[i][0][0],data3[i][0][1]),(data3[i][0][2],data3[i][0][3]),((data3[i][0][4],data3[i][0][5])),(data3[i][0][6],data3[i][0][7])]
        plt.text(vertices[0][0], vertices[0][1], text, fontsize=8, va="top",color = 'black')
        if(data3[i][3]=='False'):
            patch = Polygon(vertices, closed=True, fill=False, linewidth=2, color='r')
            ax.axes.add_patch(patch)
    try:rmtree("./Rpa_mask")
    except:pass
    try:os.makedirs("./Rpa_mask")
    except:pass
    plt.savefig('./Rpa_mask/mask_with_text.png', bbox_inches='tight',pad_inches=0)
    return ax.figure






# =============================================================================
#
# image_data = open("/home/abishek/update_code/Page4_mask0.png", "rb").read()
# image_1 = Image.open(BytesIO(image_data))
#
#
#
#
# analysis=text_from_Azure_API("/home/abishek/update_code/image_left.png")
# google_response=detect_text("/home/abishek/update_code/image_left.png")
# =============================================================================

def main_in_rpa_function(mask,analysis,google_response):
    google_response_dict,microsoft_response_in_dict=google_microsoft_common_format(analysis,google_response)
    comparison_dict_1=midpoint_comparison(google_response_dict,microsoft_response_in_dict)
    converted_coordinates=write_to_json2(comparison_dict_1,mask)
    resized_mask_with_text=plot_function(mask,comparison_dict_1)








# =============================================================================
# def text_from_Azure_API(image_name_with_path):
#         # For Azure OCR API.
#     subscription_key = "f65aa12bbb9549fdbd6543bdbf42fa07"
#     vision_base_url = "https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/"
#     text_recognition_url = vision_base_url + "read/core/asyncBatchAnalyze"
#
#     try:
#
#
#         image_data = open(image_name_with_path, "rb").read()
#
#     except:
#
#
#         image_data = open(image_name_with_path, "rb").read()
#
#
#
#     headers = {'Ocp-Apim-Subscription-Key': subscription_key,
#                    'Content-Type': 'application/octet-stream'}
#
#     response = requests.post(text_recognition_url, headers=headers, data=image_data)
#     response.raise_for_status()
#
#     analysis = {}
#     poll = True
#     while (poll):
#         response_final = requests.get(response.headers["Operation-Location"],
#                                           headers=headers)
#         analysis = response_final.json()
# #         print(analysis)
#         time.sleep(1)
#         if ("recognitionResults" in analysis):    poll = False
#         if ("status" in analysis and analysis['status'] == 'Failed'):    poll = False
#
#     return analysis
#
#
#
# def detect_text(path):
#     !export GOOGLE_APPLICATION_CREDENTIALS="My_ProjectOCR_2427.json"
#     os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="My_ProjectOCR_2427.json"
#     """Detects text in the file."""
#     from google.cloud import vision
#     import io
#     client = vision.ImageAnnotatorClient()
#     with io.open(path, 'rb') as image_file:
#         content = image_file.read()
#     image = vision.types.Image(content=content)
#     response = client.text_detection(image=image)
#     texts = response.text_annotations
#     print('Texts:')
#     for text in texts:
#         print('\n"{}"'.format(text.description))
#         vertices = (['({},{})'.format(vertex.x, vertex.y)
#                     for vertex in text.bounding_poly.vertices])
#         print('bounds: {}'.format(','.join(vertices)))
#     return response
#
#
#
#
# =============================================================================
