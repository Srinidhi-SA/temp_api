#!/usr/bin/env python
# coding: utf-8

# In[1]:


import copy
import re

import pandas as pd


# In[12]:


def nomatch_timesheet_template(analysis):

    if ("recognitionResults" in analysis):
        temp = [(line["text"], line["boundingBox"] ) for line in analysis["recognitionResults"][0]["lines"]]

    analysis_list = copy.deepcopy(temp)
    new_list = []
    for a in temp:
        tem_ele = [a]
        analysis_list.remove(a)
        for b in analysis_list:
            if abs(a[1][5] - b[1][5]) <= 8 or  abs(a[1][1] - b[1][1]) <= 8 :
                tem_ele.append(b)
                if b in temp:
                    temp.remove(b)
        new_list.append(tem_ele)
    for i in new_list:
        Sort(i)
    head = get_header(new_list)
    headings = [h[0] for h in head]


    analysis_list = []
    for out_list in range(len(new_list)):
        if new_list[out_list][0][1][1] > 76:
            analysis_list.append(new_list[out_list])

    return_hrs = []
    for out_list in analysis_list:
        for nest_list in range(len(out_list)):
            if out_list[nest_list] == out_list[-1] and len(out_list) >2:
                return_hrs.append(out_list[-1][0])
            elif out_list[nest_list] == out_list[-1] and (len(out_list) == 2):
                return_hrs.append(out_list[-1][0])

    df_sem = pd.DataFrame(columns = headings)
    for line in analysis_list:
        #     print(line)
        curr_row = {heading:'NA' for heading in headings }
        #     print(curr_row)

        x1_x2 = [(cord[1][0],cord[1][2]) for cord in line]
        #     print(x1_x2)

        for i,heading in enumerate(headings):

            x1,x2 = head[i][1][0], head[i][1][2]

            for j,cord in enumerate(x1_x2):

                if (cord[0] in range(x1-15 , x1+16)) or  (cord[1] in range(x2-15 , x2+16))                 or (abs(sum(cord) - sum((x1,x2))) <=25):

                    curr_row[heading] = line[j][0]

        df_sem = df_sem.append(curr_row,ignore_index=True)

    df_sem["return"] = return_hrs
    return df_sem


# In[14]:


def get_header(new_list):
    for i in new_list:
        if len(([a[0] for a in i[:len(i)] if not re.findall(r"\d+\ *\.\ *\d+|\d+\ *\d+", a[0])])) >=4:
            head = ([[a[0],a[1]] for a in i[:len(i)] if not re.findall(r"\d+\ *\.\ *\d+|\d+\ *\d+", a[0])])

            return head


# In[15]:


def Sort(sub_list):

    # reverse = None (Sorts in Ascending order)
    # key is set to sort using second element of
    # sublist lambda has been used
    sub_list.sort(key = lambda x: x[1][0])
    return sub_list
