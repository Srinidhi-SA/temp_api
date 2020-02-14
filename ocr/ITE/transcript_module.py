#!/usr/bin/env python
# coding: utf-8

# In[28]:

from __future__ import print_function
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
from io import BytesIO
from math import floor, ceil, sqrt
from shutil import rmtree
import pdf2image
from IPython.display import Image as ImageforDisplay
from scipy.ndimage import interpolation as inter
from collections import OrderedDict
from shutil import copy2, rmtree
import re
import pandas


from ipywidgets import interact, interactive, fixed, interact_manual
import ipywidgets as widgets
from IPython.display import clear_output
from ipywidgets import Layout, HBox, VBox
import warnings
warnings.filterwarnings("ignore")
# get_ipython().run_line_magic('gui', 'qt')
from PyQt5.QtWidgets import QFileDialog


# In[29]:


def gui_fname(dir=None):
    """Select a file via a dialog and return the file name."""
    if dir is None: dir ='./'
    fname = QFileDialog.getOpenFileName(None, "Select data file...",
                dir, filter="All files (*);; SM Files (*.sm)")
    return fname[0]


# In[27]:


# image_name = 'mass__deskewed'

# analysis = text_from_Azure_API(image_name)

# x,y = intermediate_1(analysis,'mass__deskewed')

# x


# # FUNCTIONS

# In[3]:


def extract_metadata_transcript(analysis,image_name):

    polygons = []


    if ("recognitionResults" in analysis):
        polygons = [(line["boundingBox"], line["text"]) for line in analysis["recognitionResults"][0]["lines"]]
    print(image_name)

    image = cv2.imread(image_name)

    h,w,z = image.shape

    if check_template(polygons,w):

        typ = '2 SIDED'

        pages = check_template(polygons,w)

        cut =int(w/2)
        arl1 = [bb for bb in analysis['recognitionResults'][0]['lines'] if bb['boundingBox'][4] < int(cut)]
        arl2 = [bb for bb in analysis['recognitionResults'][0]['lines'] if bb['boundingBox'][4] > int(cut)]

        wc_1,wc_2 = {},{}
        for i,line in enumerate(arl1):
            wc_1[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]

        for i,line in enumerate(arl2):
            wc_2[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]
        wc = [wc_1,wc_2]

        sem_info_list,p1_p3_list = extract_data(pages,type = 2,wor_cor = wc,shape = image.shape,metadata = True)

#         return sem_info
#         print(typ,'\n',sem_info)
        headers = []
        semesters = []
        header_cords = []
        headers_lines = []
        for i,page in enumerate(sem_info_list):
            page_sems = list(sem_info_list[i].keys())
            semesters = semesters + page_sems
            # print('sem_info[page]')
            # print(sem_info[page])
            # print('*'*50)
            # print('[list(sem_info[page].keys())')
            # print([list(sem_info[page].keys())])
            headers_lines.append(sem_info_list[i][page_sems[0]]['sem_header_1'][1])
            header_cords.append([p1_p3_list[i][line][0] if line == headers_lines[i][0] else p1_p3_list[i][line][1] for line in headers_lines[i] if line in [headers_lines[i][0],headers_lines[i][-1]]])

        d= {}
        d['TYPE'] = typ
        d['No of Semesters:'] = len(semesters)
        d['Header Co-Ordinates'] = header_cords
        d['Header Centroids'] = [(np.array(header_cord[0]) + np.array(header_cord[1]))*0.5 for header_cord in header_cords]


    else:

        typ = 'SINGLE SIDED'

        wc = {}
        for i,line in enumerate(analysis["recognitionResults"][0]["lines"]):
            wc[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]

        sem_info,p1_p3 = extract_data(polygons,type = 1,wor_cor = None ,shape = image.shape,metadata = True)
#         print(typ,'\n',sem_info)
#         return sem_info
        # print('*'*50,p1_p3,'*'*50)
    ## METADATA

        semesters =  list(sem_info.keys())
        header_lines = sem_info[semesters[0]]['sem_header_1'][1]   ## FIRST SEMESTER FROM PAGE
        header_cord = [p1_p3[line][0] if line == header_lines[0] else p1_p3[line][1] for line in header_lines if line in [header_lines[0],header_lines[-1]]]
        print('*'*50)
        print('header_cord')
        print(header_cord)
        print('*'*50)

        d= {}
        d['TYPE'] = typ
        d['No of Semesters:'] = len(semesters)
        d['Header Co-Ordinates'] = header_cord
        d['Header Centroid'] = (np.array(header_cord[0]) + np.array(header_cord[1]))*0.5

    return d



def check_template(polygons,w):

    cut = int(w/2)
    pages = {1 :{} , 2 :{}}

    pages[1]['polygons'] = [polygon for polygon in polygons if polygon[0][2]< cut]      ## LEFT HALF OF THE PAGE
    pages[2]['polygons'] = [polygon for polygon in polygons if polygon[0][0]> cut]      ## RIGHT HALF OF THE PAGE

    ke_1_p = [pages[1]["polygons"][i][1] for i in range(len(pages[1]["polygons"]))]
    ke_2_p = [pages[2]["polygons"][i][1] for i in range(len(pages[2]["polygons"]))]

    wo = [words for words in list(set(ke_1_p) & set(ke_2_p)) if not  re.findall(r"\d+\ *\.\ *\d+", words)]

    if len(wo) > 5:
        return pages
    else:
        return False


# In[18]:


def intermediate_1(analysis,image_name,return_sem_info = False):

    polygons = []

    if ("recognitionResults" in analysis):
        polygons = [(line["boundingBox"], line["text"]) for line in analysis["recognitionResults"][0]["lines"]]

    image = cv2.imread(image_name)

    h,w,z = image.shape

    if check_template(polygons,w):
        pages = check_template(polygons,w)

        cut =int(w/2)
        arl1 = [bb for bb in analysis['recognitionResults'][0]['lines'] if bb['boundingBox'][4] < int(cut)]
        arl2 = [bb for bb in analysis['recognitionResults'][0]['lines'] if bb['boundingBox'][4] > int(cut)]

        wc_1,wc_2 = {},{}
        for i,line in enumerate(arl1):
            wc_1[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]

        for i,line in enumerate(arl2):
            wc_2[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]

        full_info,transcript_info = extract_data(pages,type = 2,wor_cor = [wc_1,wc_2],shape = image.shape)
        print(full_info,transcript_info)
        f = open( 'file.txt', 'w' )
        for l in  full_info:
            f.writelines(str(l))

        return full_info,transcript_info
    else:
        wc = {}
        for i,line in enumerate(analysis["recognitionResults"][0]["lines"]):
            wc[i+1] = [(word['boundingBox'],word['text']) for word in line['words']]

        full_info,transcript_info = extract_data(polygons,type = 1,wor_cor  = wc,shape = image.shape)
        f = open( 'file.txt', 'w' )
        for l in  full_info:
            f.writelines(str(l))
        return full_info,transcript_info


# In[19]:


def extract_data(pages_or_polygons,type = 1,wor_cor = None ,shape = 0,metadata = False):


    transcript_info = {}
    sem_info = {}
    print('*'*50)
    print(type)
    print('*'*50)

    if type == 2:

#         wc = wor_cor[page]
        full_info  = []
        sem_info_list = []
        p1_p3_list = []
        for page in pages_or_polygons:

            sem_info = {}
            wc = wor_cor[page-1]
            current_page = pages_or_polygons[page]['polygons'].copy()
            lines_api = {}
            sem_info = {}
            lines_api = {i:current_page[i-1][1] for i in range(1,len(current_page)+1)}   #{line_number: Content of that line}
        #     lines_api
            starting_point = {line_number:current_page[line_number-1][0][0]  for line_number in range(1,len(current_page)+1)}
        #     starting_point
            p1_p3 = {}
            width_poly = {}
        #     centroids = {}
            for line_number,line in enumerate(current_page):

                line_number = line_number+1
                p1_p3[line_number] = line[0][:2],line[0][4:6]
                width_poly[line_number] = line[0][2] -line[0][0]

            lines = {}
            l,h,s,i = 1,1,1,1
            clubbed_lines = []
            current_depth = 0

            same_line = {}                      ## ADDED NEW

            header = set(['Attempted','Scored','Points','Earned'])

            for line_number in p1_p3:

                if (line_number not in clubbed_lines) :

                    current_depth = p1_p3[line_number][1][1]

                    if shape[1]>2000:
                        cl = get_same_line_words_2(p1_p3,line_number,current_depth)
                    else:
                        cl = get_same_line_words(p1_p3,line_number,current_depth)

                    clubbed_lines = [line_number] + cl +clubbed_lines
            #         print(clubbed_lines)
            #         sys.exit()

        #             line_widths['line_'+str(l)]  = width_poly[line_number]+sum([width_poly[line_number] for line_number in cl])
        #             l = l+1

                    sl = [line_number] + cl

                    d = {k:starting_point[k] for k in sl}

                    sl = sorted(d, key=d.get)            ## LINE NUMBERS

        #             same_line[line_number] = sl                         ## ADDED NEW

                    x =[lines_api[line_number] for line_number in sl]   ### LINE

        #             loc = []
        #             print(x)
        #             header = set('Attempted','Scored','Points')

                    if ([re.match(r'.*([2][0][0-9]{2})',line) for line in x] +                          [re.match(r'.*([1][9][0-9]{2})',line) for line in x] != [None]*2*len(x))                     and ([re.match(r'.*(Fall|Spring|Summer|Term)',word) for word in x] != [None]*len(x))                     and ([re.match(r'.*(/)',word) for word in x] == [None]*len(x)):

        #                 lines['Sem_'+str(s)] = x

                        sem_info[' '.join(x)] = {}
                        i1,i2,i3 = 1,1,1
                        s = s+1

                    elif (len(x) == 1) and (':' in list(x[0])) and (len(sem_info.keys()) ==0):

                        info = x[0].split(':')
                        transcript_info[info[0]] = info[1]

        #                 else:
        #                     transcript_info['Heading_'+str(h)] = x[0]

                        lines['Heading_'+str(h)] = x
                        h = h+1

                    else:

                        try:

                            key = list(sem_info.keys())[-1]
                            joined = ' '.join(x)

        #                     print(x)

                            if ([':' in list(word) for word in x] != [False]*len(x)) and (len(x) == 2):

                                k,v = joined.split(':')[0], joined.split(':')[1]
                                sem_info[key][k]= v

                            elif len(x) ==2:
                                sem_info[key][x[0]] = x[1]


                            elif re.findall(r'Total', joined) and ([w[0].isdigit() for w in x] != [False]*len(x)):
                                sem_info[key]['final_'+str(i1)] = [x,sl]
                                i1 = i1+1

                            elif len(header.intersection(set(joined.split()))) >= 2:
                                sem_info[key]['sem_header_'+str(i2)] = [x,sl]
                                i2 = i2+1

                            elif ([':' in list(word) for word in x] != [False]*len(x)):
                                k,v = joined.split(':')[0], joined.split(':')[1]
                                sem_info[key][k]= v

                            elif len(x) > 2 and ('Course Attributes' not in x):
                                sem_info[key]['data_'+str(i3)]= [x,sl]
                                i3 = i3+1
                            else:
                                pass
                        except:

                            joined = ' '.join(x)

                            if ([':' in list(word) for word in x] != [False]*len(x)) and (len(x) == 2):
                                transcript_info[x[0][:-1]] = x[1]
        #                         pass
                            elif (len(x) == 2):
                                transcript_info[x[0]] = x[1]

                            elif len(x) >3  and len(header.intersection(set(joined.split()))) >= 2:
                                transcript_info['Global_header'] = x

            if metadata == True:
                sem_info_list.append(sem_info)
                p1_p3_list.append(p1_p3)
            full_info.append(clean_info(sem_info,lines_api,wc,p1_p3))
#             print(sem_info)
        if metadata == True: return sem_info_list,p1_p3_list
        # f = open( 'file.txt', 'w' )
        # for l in  full_info:
        #     f.writelines(str(l))


        return full_info,transcript_info

    else:

        wc = wor_cor
        transcript_info = {}
        sem_info = {}
#         print(wc)
#         sys.exit()
        current_page = pages_or_polygons
    #     print(current_page)

        lines_api = {i:current_page[i-1][1] for i in range(1,len(current_page)+1)}   #{line_number: Content of that line}
    #     lines_api
        starting_point = {line_number:current_page[line_number-1][0][0]  for line_number in range(1,len(current_page)+1)}
    #     starting_point
        p1_p3 = {}
        width_poly = {}
    #     centroids = {}
        for line_number,line in enumerate(current_page):

            line_number = line_number+1
            p1_p3[line_number] = line[0][:2],line[0][4:6]
            width_poly[line_number] = line[0][2] -line[0][0]

        lines = {}
        l,h,s,i = 1,1,1,1
        clubbed_lines = []
        current_depth = 0

        same_line = {}                      ## ADDED NEW

        header = set(['Attempted','Scored','Points','Earned',"Grade"])

        for line_number in p1_p3:

            if (line_number not in clubbed_lines) :

                current_depth = p1_p3[line_number][1][1]

                cl = get_same_line_words(p1_p3,line_number,current_depth)

                clubbed_lines = [line_number] + cl +clubbed_lines
        #         print(clubbed_lines)
        #         sys.exit()

    #             line_widths['line_'+str(l)]  = width_poly[line_number]+sum([width_poly[line_number] for line_number in cl])
    #             l = l+1

                sl = [line_number] + cl

                d = {k:starting_point[k] for k in sl}

                sl = sorted(d, key=d.get)            ## LINE NUMBERS

    #             same_line[line_number] = sl                         ## ADDED NEW

                x =[lines_api[line_number] for line_number in sl]   ### LINE

    #             loc = []
    #             print(x)
    #             header = set('Attempted','Scored','Points')

                if ([re.match(r'.*([2][0][0-9]{2})',line) for line in x] +                      [re.match(r'.*([1][9][0-9]{2})',line) for line in x] != [None]*2*len(x))                 and ([re.match(r'.*(Fall|Spring|Summer|Term)',word) for word in x] != [None]*len(x))                 and ([re.match(r'.*(/)',word) for word in x] == [None]*len(x)):

    #                 lines['Sem_'+str(s)] = x

                    sem_info[' '.join(x)] = {}
                    i1,i2,i3 = 1,1,1
                    s = s+1

                elif (len(x) == 1) and (':' in list(x[0])) and (len(sem_info.keys()) ==0):

                    info = x[0].split(':')
                    transcript_info[info[0]] = info[1]

    #                 else:
    #                     transcript_info['Heading_'+str(h)] = x[0]


                    lines['Heading_'+str(h)] = x
                    h = h+1

                else:

                    try:

                        key = list(sem_info.keys())[-1]
                        joined = ' '.join(x)

    #                     print(x)

                        if len(header.intersection(set(joined.split()))) >= 2:
                            sem_info[key]['sem_header_'+str(i2)] = [x,sl]
                            i2 = i2+1

                        elif re.findall(r'Total|Cum|Term GPA', joined) and ([w[0].isdigit() for w in x] != [False]*len(x)):
                            sem_info[key]['final_'+str(i1)] = [x,sl]
                            i1 = i1+1

                        elif ([':' in list(word) for word in x] != [False]*len(x)) and (len(x) == 2):
                            k,v = joined.split(':')[0], joined.split(':')[1]
                            sem_info[key][k]= v

                        elif len(x) ==2:
                            sem_info[key][x[0]] = x[1]

                        elif ([':' in list(word) for word in x] != [False]*len(x)):
                            k,v = joined.split(':')[0], joined.split(':')[1]
                            sem_info[key][k]= v

                        elif len(x) > 2:
                            sem_info[key]['data_'+str(i3)]= [x,sl]
                            i3 = i3+1
                        else:
                            pass
                    except:

                        joined = ' '.join(x)

                        if ([':' in list(word) for word in x] != [False]*len(x)) and (len(x) == 2):
                            transcript_info[x[0][:-1]] = x[1]
    #                         pass
                        elif (len(x) == 2):
                            transcript_info[x[0]] = x[1]

                        elif len(x) >3  and len(header.intersection(set(joined.split()))) >= 2:
                            transcript_info['Global_header'] = x
#         print(sem_info)
        if metadata == True: return sem_info,p1_p3
        # for l in  [clean_info(sem_info,lines_api,wc,p1_p3)]:
        #     f.writelines(str(l))
        return [clean_info(sem_info,lines_api,wc,p1_p3)],transcript_info



# In[7]:


def clean_info(x,lines_api,wc,p1_p3):

    df_sem_list = []
    df_final_list = []
#     df_finals = pd.DataFrame()

    final_scores ={}

    locations = {}                     ## ADDED NEW

    for sem in x:
        s = x[sem].copy()

        try:
            if transcript_info['Global_header']:
                s['sem_header_1'] = ['Number','Title','Type','Grade','Attempted','Earned','GPA','Points']

        except:
            pass

        if len(s['sem_header_1'][0]) <=6 :

#             print(s['sem_header_1'])

            s['sem_header_1'][0] = [x.split() for x in s['sem_header_1'][0]]
            s['sem_header_1'][0] = [item for sublist in s['sem_header_1'][0] for item in sublist]

#             print(s['sem_header_1'][0])

        locations = {'sem_header_1' : []}

        for header in s['sem_header_1'][0] :

            line_number = [x for x in s['sem_header_1'][1] if header in lines_api[x].split()][0]

#                 print(header,line_number)

            wc_line = wc[line_number]
            locations['sem_header_1'].append(get_location_words(p1_p3,lines_api,header, line_number,wc_line)[0])

        try:
            locations['sem_header_2'] = []

#             print(s['sem_header_2'][0])

            if len(s['sem_header_2'][0]) <= 3 :

    #             print(s['sem_header_1'])

                s['sem_header_2'][0] = [x.split() for x in s['sem_header_2'][0]]
                s['sem_header_2'][0] = [item for sublist in s['sem_header_2'][0] for item in sublist]

                if 'Units' in s['sem_header_2'][0]: s['sem_header_2'][0].remove('GPA')


            for header in s['sem_header_2'][0] :

                line_number = [x for x in s['sem_header_2'][1] if header in lines_api[x].split()][0]

#                 print(header,line_number)

                wc_line = wc[line_number]
                locations['sem_header_2'].append(get_location_words(p1_p3,lines_api,header, line_number,wc_line)[0])

#                 print(locations)
#             sys.exit()

        except:
            pass
#         print(locations)
        df_sem = pd.DataFrame(columns=s['sem_header_1'][0])                     ## CREATING NEW DF FOR SEM
#         df_finals = pd.DataFrame(columns=s['sem_header_2'])                  ## CREATING NEW DF FOR FINAL

        data_rows = list(filter(lambda x : x[0:4] =='data', list(s.keys())))

        data_mids = {}

        for data in data_rows:
#             print(s[data][0])
            s[data][0] = [clean(word) for word in s[data][0]]
#             print(s[data][0])
            x1_x2 = []
            for pos,ls in enumerate(s[data][0]):

                if len(s[data][0]) != len(s[data][1]) : continue

                line_number = s[data][1][pos]

                if len(ls) ==1:

                    x1,x2 = get_location_line(line_number,p1_p3)
                    x1_x2.append((x1,x2))

                if len(ls) > 1:

                    x1,x2 = p1_p3[line_number][0][0],p1_p3[line_number][1][0]
                    total_width = abs(x2-x1)

                    if len(ls) ==2 and (ls[0] == ls[1]):
                        loc = [(x1,x1+(total_width)*0.5),(x1+(total_width)*0.5,x2)]

                    else:
                        wc_line = wc[line_number]
                        loc = []
                        for word in ls:
                            l,index = get_location_words(p1_p3,lines_api,word,line_number,wc_line)
                            loc.append(l)

                            if index!= None : wc_line.remove(wc_line[index])

#                         loc = [get_location_words(p1_p3,lines_api,word,line_number,wc) for word in ls]

                        if None in loc:

    #                             total_letters = sum([len(w) for w in ls])
                            word_len = total_width/len(ls)

                            for i,_ in enumerate(loc):

                                if loc[i] == None:

                                    if i == 0:
                                        loc[i] = (x1 , x1+word_len)
                                    else:
                                        loc[i] = (loc[i-1][1] , loc[i-1][1]+word_len)

                                else:
                                    pass

                    x1_x2 = x1_x2+loc

            s[data][0] = [item for sublist in s[data][0] for item in sublist]

#             print(s[data][0])

            if ((s[data][0][1][0].isdigit()) or (s[data][0][1][0] == 'D')) and (len(s[data][0][1]) >1)             and ((len(s[data][0][0].split()) <= 1))and (s[data][0][0][-1] != ':'):

                s[data][0] = [s[data][0][0]+' - ' + s[data][0][1]] + s[data][0][2:]

                x1_x2.remove(x1_x2[1])


            curr_row = {heading:'NA' for heading in s['sem_header_1'][0] }

            if len(s[data][0]) == len(s['sem_header_1'][0]):

#                 print('comin here')
                curr_row = {}
                for i,heading in enumerate(s['sem_header_1'][0]):

                    curr_row[heading] = s[data][0][i]
                df_sem = df_sem.append(curr_row,ignore_index=True)

            else:
                curr_index = -1

                for i,heading in enumerate(s['sem_header_1'][0]):

                    x1,x2 = locations['sem_header_1'][i]
                    found = False

                    for j,cord in enumerate(x1_x2):

                        if found == False:
                            if (cord[0] in range(x1-15 , x1+16)) or  (cord[1] in range(x2-15 , x2+16))                             or (abs(sum(cord) - sum((x1,x2))) <=25):

                                if j>curr_index: curr_row[heading] = s[data][0][j]
                                curr_index = j
                                found = True

                df_sem = df_sem.append(curr_row,ignore_index=True)

#         print(df_sem,'\n')

        df_sem_list.append(df_sem)


        final_rows = list(filter(lambda x : x[0:5] =='final', list(s.keys())))
#         print(s.keys())
#         sys.exit()
        try:
            df_final = pd.DataFrame()
            df_final = pd.DataFrame(columns=s['sem_header_2'][0])
        except:
            final_scores = {}
            s['sem_header_2'] = ['Attempted' ,'Earned','Points']
            df_final = None

        for fr in final_rows:

            if df_final is None:

                s[fr][0] = [clean(x) for x in s[fr][0]]
                s[fr][0] = [item for sublist in s[fr][0] for item in sublist if item != '']

    #             print(s[fr])
                final_scores[sem] = {}
                final_scores[sem][s[fr][0][0]] = s[fr][0][1]

                d = {}
                try:
                    for i,header in enumerate(s['sem_header_2']):
                         d[header] = s[fr][0][i+3]
                except:
                    pass
                final_scores[sem][s[fr][0][2]] = d

            else:
                s[fr][0] = [clean(word) for word in s[fr][0]]
#                 print(s[fr][0])
#                 c = 0

                x1_x2 = []
                for pos,ls in enumerate(s[fr][0]):

                    line_number = s[fr][1][pos]

                    wc_line = wc[line_number]

                    if len(ls) ==1:

                        x1,x2 = get_location_line(line_number,p1_p3)
                        x1_x2.append((x1,x2))

                    if len(ls) > 1:

                        x1,x2 = p1_p3[line_number][0][0],p1_p3[line_number][1][0]
                        total_width = abs(x2-x1)

                        if len(ls) ==2 and (ls[0] == ls[1]):
                            loc = [(x1,x1+(total_width)*0.5),(x1+(total_width)*0.5,x2)]

                        else:

                            wc_line = wc[line_number]
                            loc = []
                            for word in ls:
                                l,index = get_location_words(p1_p3,lines_api,word,line_number,wc_line)
                                loc.append(l)

                                if index!= None : wc_line.remove(wc_line[index])

                            if None in loc:
                                x1,x2 = p1_p3[line_number][0][0],p1_p3[line_number][1][0]
                                total_width = abs(x2-x1)
    #                             total_letters = sum([len(w) for w in ls])
                                word_len = total_width/len(ls)

                                for i,_ in enumerate(loc):

                                    if loc[i] == None:

                                        if i == 0:

                                            loc[i] = (x1 , x1+word_len)
                                        else:
                                            loc[i] = (loc[i-1][1] , loc[i-1][1]+word_len)

                                    else:
                                        pass

                        x1_x2 = x1_x2+loc

                s[fr][0] = [item for sublist in s[fr][0] for item in sublist]



#                 print('DATA :' ,s[fr][0])
#                 print('LOCATIONS: ',x1_x2)
#                 print('HEADER-LOC :',locations['sem_header_2'] , '\n')
                curr_row = {heading:'NA' for heading in s['sem_header_2'][0] }
                curr_index = -1
                for i,heading in enumerate(s['sem_header_2'][0]):

                    x1,x2 = locations['sem_header_2'][i]
                    found = False

                    for j,cord in enumerate(x1_x2):

                        if found == False:
#                             if fr == final[-1] : print('Heading :' ,heading ,'\n x1,x2 :',x1,x2,'\n Word-Cord :',cord ,'\n WORD : ',s[fr][0][j])
                            if (cord[0] in range(x1-15 , x1+16)) or  (cord[1] in range(x2-15 , x2+16))                             or (abs(sum(cord) - sum((x1,x2))) <=25):

#                                 if fr == 'final_9' : print('Heading :' ,heading ,'\n x1,x2 :',x1,x2,'\n Word-Cord :',cord ,'\n WORD : ',s[fr][0][j])
                                if j>curr_index: curr_row[heading] = s[fr][0][j]
                                curr_index = j
                                found = True

                        else: pass
                # try:
                #     print(s[fr][0][-5])
                #     import sys
                #     sys.exit()
                # except:
                #     pass

                if list(curr_row.values()).count('NA')>=1:

                    if ([w[0].isdigit() for w in s[fr][0][-4:]] == [True]*len(s['sem_header_2'][0])) and                         ('Grade' not in s['sem_header_2'][0]):

                        for i,heading in enumerate(s['sem_header_2'][0]):
                                curr_row[heading] = s[fr][0][-4:][i]

                    elif ([w[0].isdigit() for w in s[fr][0][-4:]] == [True,True,False,True]) and                     ('Grade' in s['sem_header_2'][0]):
                         for i,heading in enumerate(s['sem_header_2'][0]):
                                curr_row[heading] = s[fr][0][-4:][i]

                    else:
                        pass

####################################################################################################

                index_found = False
                index_place = -(len(s['sem_header_2'][0])+1)
                # print(index_place)
                # print(s[fr][0][index_place-1] +',,,,'+ s[fr][0][index_place])

                try:
                    if (not s[fr][0][index_place-1][0].isdigit()) and (not s[fr][0][index_place].isdigit()):
                        row = pd.Series(curr_row,name=s[fr][0][index_place-1] +' '+ s[fr][0][index_place])
                        df_final = df_final.append(row)
                        index_found = True
                    else:
                        pass
                except: pass

                if index_found ==False:
                    try:
                        if not s[fr][0][index_place].isdigit():
                            row = pd.Series(curr_row,name= s[fr][0][index_place])
                            df_final = df_final.append(row)

                        else:
                            df_final = df_final.append(curr_row,ignore_index=True)
                    except:
                        df_final = df_final.append(curr_row,ignore_index=True)

        if df_final is None:
            df_final_list.append(final_scores)
        else:
            df_final_list.append(df_final)



    return df_sem_list,df_final_list


# In[8]:


def get_location_line(line_number,p1_p3):

#     print('comin here')
    return (p1_p3[line_number][0][0],p1_p3[line_number][1][0])


# In[9]:


def get_same_line_words(p1_p3,line_number,current_depth):

    same_line = []
    for line_oi in p1_p3:

        if (line_oi != line_number) and ((p1_p3[line_oi][1][1] in range(current_depth-6,current_depth+7))):

            same_line.append(line_oi)

    return same_line


# In[10]:


def get_same_line_words_2(p1_p3,line_number,current_depth):

    same_line = []
    for line_oi in p1_p3:

        if (line_oi != line_number) and ((p1_p3[line_oi][1][1] in range(current_depth-10,current_depth+12))):

            same_line.append(line_oi)

    return same_line


# In[11]:


def get_location_words(p1_p3,lines_api,word,line_number,wc_line):

    words = wc_line

    if lines_api[line_number] == word:
        return get_location_line(line_number,p1_p3),None

    for p,w in enumerate(words):
        try:
            if sum([list(w[1])[i] == list(word)[i] for i in range(len(word))]) == len(word):
                return (w[0][0],w[0][2]),p

            elif sum([list(w[1])[i] == list(word)[i] for i in range(len(word))]) in range(len(word)-2,len(word)+3):
                return (w[0][0],w[0][2]),p

            else:
                pass

            if (len(word) >= len(w)+2) and (w in word) and (w not in ['.']):
                return (w[0][0],w[0][2]),p

#             if p+1 ==len(words): print(word)

        except:
            pass

    return get_location_line(line_number,p1_p3),None


# In[12]:


def clean(x):
    words = x.split()

    if len(words) ==1:

        #*****SPECIAL CASES****#
        reg = list(filter(None, re.split('(\d+)',x)))

        if (':' in x) and (x.split(':')[0].isdigit()) and (x.split(':')[1].isdigit()):
            return words

        elif (len(reg) >1) and ('.' not in list(x)):  ## Splitting words and charecters
            return reg

        return words

    ## When Starts witha WORD Ends with A Word USUALLY SUBJECTS
    if (words[0][0].isdigit() == False and words[-1][0].isdigit() ==False) and     (len(words[0])>3 and len(words[-1])>3) and (len(words)>2):

        return [x]

    ## ALL ALPHABATICAL WORDS (of ant length)
    if [word[0].isdigit() for word in words] == [False]*len(words):
        return [' '.join(words)]


    ## ALL ALPHABATICAL ONE NUMERIC WITH LEN 1

    numbers = [word for word in words if word.isdigit()]

    if len(numbers)==1 and len(numbers[0]) ==1:
        return [' '.join(words)]


    if len(words) == 2:

            ## BOTH ARE NUMBERS AND '.' (present)

            if words[0].isdigit() and words[1].isdigit():
                return ['.'.join(words)]

            ## BOTH ARE NUMBERS AND '.' (present)
            elif ( (words[0].isdigit() and words[1][1].isdigit()) or                     (words[0][0].isdigit() and words[1].isdigit()) )                  and ((['.' in list(word) for word in words]) != [False]*len(words)):
                return [''.join(words)]

            ## ONE APLHABATIC AND ONE NUMERIC

            else:
                return words


    elif len(words) ==3:

 # **************************SPECIAL CASES************************************************** #

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (present)   ALPHABET IN THE START
            if '.' in [words[0],words[2]]:
                words.remove('.')
                return words

            ## ALL ARE INDEPENDENT NUMBERS!!
            elif ([('.' in word) or (',' in word) or (';' in word) or (':' in word) for word in words] == [True]*len(words))  and             ([word[0].isdigit() for word in words] == [True]*len(words)):

                return [re.sub(r',|;|:', '.', word) for word in words]

            ## ALL ARE NUMBERS AND '.' (present)
            elif ([word[0].isdigit() for word in words] == [True]*len(words))             and ((['.' in list(word) for word in words]) != [False]*len(words)):
                return [''.join(words)]


            ## ALL ARE NUMBERS AND '.' (absent)
            elif ([word[0].isdigit() for word in words] == [True]*len(words)):
                return [words[0]+'.'+''.join(words[1:])]


            ## MIX OF NUMBERS AND ALPHABET!!  '.' (present)  ALPHABET IN THE START
            elif not words[0][0].isdigit()              and ((['.' in list(word) for word in words]) != [False]*len(words)):
                return [words[0],''.join(words[1:])]

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (present)  ALPHABET IN THE END
            elif not words[2].isdigit()             and ((['.' in list(word) for word in words]) != [False]*len(words)):
                return [''.join(words[:2]),words[2]]

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (absent)  ALPHABET IN THE START
            elif not words[0].isdigit():
                return [words[0],''.join(words[1:])]

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (absent)  ALPHABET IN THE END
            elif not words[2].isdigit():
                return ['.'.join(words[:2]),words[2]]

  # ********************************************************************************************* #
            ## MIX OF NUMBERS AND ALPHABET!!  '.' (present)   ALPHABET IN THE START
            elif not words[2].isdigit() and              ((['.' in list(word) for word in words]) != [False]*len(words)):
                return [''.join(words[:2]),words[2]]

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (absent)   ALPHABET IN THE END
            elif not words[2].isdigit():
                return ['.'.join(words[:2]),words[2]]

            ##  TWO NUMBERS AND '.' in between

            elif  words[2].isdigit() and words[0].isdigit() and words[1] == '.':
                return [''.join(words)]

    # ********************************************************************************************* #

            ## MIX OF NUMBERS AND ALPHABET!!  '.' (present)   ALPHABET IN THE START
            elif '.' in [words[0],words[2]]:
                words.remove('.')
                return words

    else:

        return words



# In[ ]:





# In[ ]:
