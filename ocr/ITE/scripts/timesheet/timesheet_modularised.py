#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Apr 10 17:42:15 2020

@author: rampfire
"""

from ocr.ITE.scripts.data_ingestion import ingestion_1
from ocr.ITE.scripts.apis import Api_Call
from ocr.ITE.scripts.timesheet.timesheet_helper import timesheet_helper_cls
from ocr.ITE.scripts.timesheet.timesheet_class import timesheet_cls
from ocr.ITE.scripts.timesheet.weekdays_in_timesheet import weekdays_timesheet
from ocr.ITE.scripts.timesheet.dates_in_timesheet import dates_timesheet
from ocr.ITE.scripts.timesheet.proximity_words import check_orientation, direct_mapping, group_matches_on_axis, \
    threshold_mapping, same_axis_check, stitch
from ocr.ITE.scripts.timesheet.timesheet_preprocessing import Preprocessing
import os
import sys
from operator import xor
import json
#
import pandas as pd
import time
# from dateutil.parser import parse
from date_correctoins import date_operations, year_finder, month_finder, write_new_dates_to_dataframe, \
    check_if_day_first
from template_excel_filling import update_entry_template, update_entry_gen


def timesheet_main(final_json_out):
    print("\nLoading File sdfnfdjnfdjlgndfgndfjgndfg")
    # ingestion_1(input_path, os.getcwd() + "/pdf_to_images_folder")
    df_final = pd.DataFrame()
    # for count, i in enumerate(
    #                          sorted(os.listdir(os.getcwd() +
    #                                            '/pdf_to_images_folder/'))):
    #     print(i)
    #     print(os.getcwd())
    #     timesheet_obj = timesheet_cls((os.getcwd() +
    #                                    '/pdf_to_images_folder/') + i, i)
    #     print("\nStarting to crop image")
    #     Preprocessing(timesheet_obj.image_path).crop_and_save(timesheet_obj.image_path)
    #     print("\nImage cropping completed and overwritten")
    #     print("\nExtracting Info from the Image")
    #     api_response = Api_Call(timesheet_obj.image_path).page_wise_response(1)
    # Opening JSON file 
    f = open(final_json_out, )

    # returns JSON object as
    # a dictionary
    data = json.load(f)
    updated_analysis = convert_json(data)
    image_shape = data["image_shape"]

    timesheet_obj = timesheet_cls(image_shape)
    timesheet_obj.set_microsoft_analysis(updated_analysis)
    #        time.sleep(10)

    weekdays_found, weekdays_with_coordinates = weekdays_timesheet().check_days(timesheet_obj.microsoft_analysis)
    timesheet_obj.set_weekdays_found(weekdays_found)

    dates_found, dates_with_coordinates = dates_timesheet().date_extractor(timesheet_obj.microsoft_analysis)
    timesheet_obj.set_dates_found(dates_found)
    dates_filter_for_brackets = []
    for detes in dates_with_coordinates:
        bb_detes = list(detes)[0]
        date_cleaned = list(detes)[1].replace('(', '')
        date_cleaned = date_cleaned.replace(')', '')
        dates_filter_for_brackets.append((bb_detes, date_cleaned))
    #            print(i)
    print("dates_filter_for_brackets:", dates_filter_for_brackets)
    dates_with_coordinates = dates_filter_for_brackets

    hours_found, hours_with_coordinates = timesheet_helper_cls().check_hours(timesheet_obj.microsoft_analysis)
    timesheet_obj.set_hours_found(hours_found)

    print("\ndates_found:", dates_found)
    print("weekdays_found:", weekdays_found)
    print("hours_found:\n", hours_found)
    #        break

    dates_found = logic_less_filter(dates_with_coordinates)
    print("Dates_with_coordinates:", dates_with_coordinates)
    print("\nDates_found_after_filter:", dates_found)

    ### SECOND CHECK FOR DATES
    if not dates_found:
        dates_found, special_dates_with_coordinates = dates_timesheet().special_date_extractor(
            timesheet_obj.microsoft_analysis)
        print('*' * 20, 'Months found :', special_dates_with_coordinates)
        dates_found = logic_less_filter(special_dates_with_coordinates)
        print('*' * 20, 'Special dates found :', dates_found)

        orientation = check_orientation(special_dates_with_coordinates)
        dates_detected = threshold_mapping(special_dates_with_coordinates, timesheet_obj.microsoft_analysis,
                                           timesheet_obj.image_shape, typ=orientation, combine=True)
        if dates_detected:
            dates_with_coordinates = dates_detected
            print('*' * 20, 'COMBINED DATES :', dates_with_coordinates)
        else:
            print('Special Dates Not found')
    else:
        pass

    dates_as_list = [date_without_bb[1] for date_without_bb in dates_with_coordinates]
    default_year_timesheet_found, default_year_timesheet = year_finder(dates_as_list)
    if default_year_timesheet == 0:
        default_year_timesheet = 2001
    else:
        pass
    default_month_timesheet_found, default_month_timesheet = month_finder(dates_as_list)
    if default_month_timesheet == 0:
        default_month_timesheet = 1
        print("default timesheet not  found setting to 1!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        pass

    weekdays_found = logic_less_filter(weekdays_with_coordinates)
    print("\nWeekdays_with_coordinates:", weekdays_with_coordinates)
    print("Weekdays_found_after_filter:", weekdays_found)

    print("\n Hours with coordinates:", hours_with_coordinates)

    df_to_write = pd.DataFrame()
    df = []

    if dates_found == True and weekdays_found == True and hours_found == True:
        orientation = check_orientation(dates_with_coordinates)
        print('COMING HERE', '*' * 20)
        if same_axis_check(dates_with_coordinates, weekdays_with_coordinates, typ=orientation):

            print("\n Weekdays found on same axis as dates \n")
            dates_with_coordinates = stitch(dates_with_coordinates, weekdays_with_coordinates, typ=orientation)
        else:
            pass

        print("\nOrientation:", orientation)
        df = direct_mapping(dates_with_coordinates, [weekdays_with_coordinates, hours_with_coordinates],
                            typ=orientation)
        print("df:\n", df)
    elif dates_found == True and weekdays_found == False and hours_found == True:
        orientation = check_orientation(dates_with_coordinates)
        print("\nOrientation:", orientation)
        df = direct_mapping(dates_with_coordinates, [hours_with_coordinates], typ=orientation)
        print("df:\n", df)
    elif dates_found == False and weekdays_found == True and hours_found == True:
        orientation = check_orientation(weekdays_with_coordinates)
        print("\nOrientation:", orientation)
        df_with_weekday = direct_mapping(weekdays_with_coordinates, [hours_with_coordinates], typ=orientation)
        dates_detected = threshold_mapping(weekdays_with_coordinates, timesheet_obj.microsoft_analysis,
                                           timesheet_obj.image_shape, typ=orientation)

        if dates_detected:
            print('\nDates Detected Through Threshold:', dates_detected)
            df = direct_mapping(dates_detected, [weekdays_with_coordinates, hours_with_coordinates], typ=orientation)
            print("df:\n", df)
        else:
            print('\nMapping with weekday as header\n')
            df = df_with_weekday
            print("df:\n", df)
            print('\nIgnoreing DF because no dates\n')
            df = None

    else:
        print("\nnot a timesheet")

    if isinstance(df, pd.DataFrame):
        #            df_list.append(df)
        df_to_write = pd.concat([df_to_write, df], axis=0, ignore_index=True)
    #            print('DATA : \n',df)
    else:
        pass
        print('PROPER STRUCTURE NOT FOUND')

    updated_date_in_dict = date_operations(df_to_write, default_year_timesheet, default_month_timesheet)
    dates_corrected_dataframe = write_new_dates_to_dataframe(df_to_write, updated_date_in_dict)
    print('DF TO WRITE :\n', df_to_write)
    print('dates_corrected_dataframe:\n', dates_corrected_dataframe)
    print("days_first_flag:", check_if_day_first(df_to_write))
    print('PROPER STRUCTURE NOT FOUND')
    #    print('DF TO WRITE :',df_to_write)info_to_process=main(input("enter the file path : "))
    if 'dates_corrected_dataframe' in locals() or 'dates_corrected_dataframe' in globals():
        if isinstance(dates_corrected_dataframe, pd.DataFrame):
            df_final = pd.concat([df_final, dates_corrected_dataframe], axis=1, ignore_index=False)
        else:
            pass
        print('\nDF Extracted :\n', df)
        print('\ndates_corrected_dataframe:\n', dates_corrected_dataframe)
    else:
        print('\nDF Extracted :\n', df)

    print('\nFINAL DATA FRAME : ', df_final)
    return df_final


#    return dates_corrected_dataframe


def logic_less_filter(dates_with_coordinates):
    dates_found = False
    try:
        try:
            del (headers)
        except:
            pass
        header_groups, header_group_loc = group_matches_on_axis(dates_with_coordinates, typ="hor")
        for group in header_groups:
            if len(header_groups[group]) > 3:
                headers = header_groups[group]
                header_loc = header_group_loc[group]
            #                print("group:",group)
            else:
                pass
        #        orientation="hor"
        if headers:
            orientation = "hor"
            dates_found_in_horizontal = True
    except:
        orientation = "not hor"
        dates_found_in_horizontal = False

    try:
        try:
            del (headers)
        except:
            pass
        #        print("in herer")
        header_groups, header_group_loc = group_matches_on_axis(dates_with_coordinates, typ="ver")
        for group in header_groups:
            if len(header_groups[group]) > 3:
                headers = header_groups[group]
                header_loc = header_group_loc[group]
            #                print("group:",group)
            else:
                pass
        if headers:
            orientation = "ver"
            dates_found_in_vertical = True
    except:
        orientation = "not ver"
        dates_found_in_vertical = False

    print("xor:", xor(dates_found_in_vertical, dates_found_in_horizontal))
    dates_found = xor(dates_found_in_vertical, dates_found_in_horizontal)
    #    print("orientationnnnnnnnnnn:",orientation)
    #    print("dedicated_orientation:",check_orientation(dates_with_coordinates))
    return dates_found


def convert_json(data):
    data.pop("table_coordinates")
    data.pop("temp_number")
    data.pop("domain_classification")
    analysis = {}

    analysis["lines"] = []

    for table in data["tables"].keys():
        for cell in data["tables"][table]:

            if "words" in data["tables"][table][cell]:
                empty_list = []
                for dict_data in (data["tables"][table][cell]["words"]):
                    p1 = dict_data["boundingBox"]["p1"]
                    p3 = dict_data["boundingBox"]["p3"]
                    dict_data["boundingBox"] = [p1[0], p1[1], p3[0], p1[1], p3[0], p3[1], p1[0], p3[1]]
                    empty_list.append(dict_data)
                ne = {"words": empty_list}
                analysis["lines"].append(ne)

    for para in data["paragraphs"]:

        for para_list in data["paragraphs"][para]:
            empty_list = []
            for dict_data in para_list:
                p1 = dict_data["boundingBox"]["p1"]
                p3 = dict_data["boundingBox"]["p3"]
                dict_data["boundingBox"] = [p1[0], p1[1], p3[0], p1[1], p3[0], p3[1], p1[0], p3[1]]
                empty_list.append(dict_data)
            ne = {"words": empty_list}
            analysis["lines"].append(ne)
    return analysis
# info_to_process=
# main(input("enter the file path : "))
# main('/home/rajeev/Documents/v2/Intelligent-Text-Extraction-ITE_demo_improv/database/we 12-27-19 (3) (1)_page_1/final_json.json')
# main('/home/rampfire/Downloads/we 03-06-20.png')
#
################### BATCH GENERAL FILLING

# output_path = '/home/sainadh/outputs/OUTPUT.xlsx'
# root_folder_path = '/home/sainadh/SAMPLES/PYRAMID CONSULTING (copy)'
#
#
# def update_xl_for_folder(root_folder_path,output_path):
#
#    alphabet_path = root_folder_path
#    template = pd.DataFrame(columns = ['Name'])
#
#    for folder in sorted(os.listdir(alphabet_path)):
#        print('\n','*'*50)
#        print('FOR FOLDER :' , folder)
#        print('*'*50)
#
#        skip_folders = ['Aavula Manudeep Reddy','Bhanani Bhautik','Bheemakanahalli Nara Tejas Yadav','Gao He','Patel Yatinbhai Amrutbhai','Sanka Sri Naga Sai Krishna','Venkataswamy Kumar Naveen','Wang Shi']
#        if folder in skip_folders:
#            print(folder,' Skipped','*'*10)
#            continue
#
#        alphabet = alphabet_path.split('/')[-1]
#        df_to_write = pd.DataFrame()
#        folder_path = alphabet_path+'/'+folder
#
#        if os.path.isdir(folder_path):
#
#            for file in sorted(os.listdir(folder_path)):
#                print(file)
#                if file.split('.')[-1] in ["PDF","pdf","jpg","png","jpeg","JPG","PNG"]:
#    #                print('COMING HERE')
#                    file_path = folder_path+'/'+file
#    #                print(file_path)
#                    df = main(file_path)
#
#                    if isinstance(df, pd.DataFrame) : df_to_write = pd.concat([df_to_write,df],axis =1,ignore_index =False)
#
#            print('FINAL!!!   DATA FRAME TO WRITE :' , df_to_write)
#
#            template = update_entry_gen(template,df_to_write,folder)
#            print('*'*20 , '\nPRESENT STATUS :',template)
#            template.to_excel(output_path)
#        else:
#            pass
#
#    template.to_excel(output_path)
#
#    return "update finished"
#
#
##update_xl_for_folder(root_folder_path,output_path)
#
#
################### BATCH TEMPLATE FILLING
#
# template_path = '/home/rampfire/Downloads/NewTemplate.xlsx'
# root_folder_path = '/home/rampfire/Downloads/A (copy)'
#
#
# def update_template_for_folder(root_folder_path,template_path):
#
#    alphabet_path = root_folder_path
#    template = pd.read_excel(template_path,header =1)
#
#    for folder in sorted(os.listdir(alphabet_path)):
#        print('\n','*'*50)
#        print('FOR FOLDER :' , folder)
#        print('*'*50)
#        alphabet = alphabet_path.split('/')[-1]
#        df_to_write = pd.DataFrame()
#        folder_path = alphabet_path+'/'+folder
#
#        if os.path.isdir(folder_path):
#            for file in sorted(os.listdir(folder_path)):
#                print(file)
#                if file.split('.')[-1] in ["PDF","pdf","jpg","png","jpeg","JPG","PNG"]:
#    #                print('COMING HERE')
#                    file_path = folder_path+'/'+file
#    #                print(file_path)
#                    df = main(file_path)
#
#                    if isinstance(df, pd.DataFrame) : df_to_write = pd.concat([df_to_write,df],axis =1,ignore_index =False)
#
#            print('FINAL!!!   DATA FRAME TO WRITE :' , df_to_write)
#
#            template = update_entry_template(template,df_to_write,folder)
#            print('PRESENT STATUS :',template)
#        else:
#            pass
#
#    updated_template_path = '/'.join(template_path.split('/')[:-1]) +'/'+ template_path.split('/')[-1].split('.')[0] +'_1.xlsx'
#    template.to_excel(updated_template_path)
#
#    return "update finished"
#
#


# update_template_for_folder(root_folder_path,template_path)


# info_to_process.columns = [str(col).split()[0] for col in info_to_process.columns]
# template.columns=template.columns.astype(str)
# info_to_process.columns=pd.to_datetime(info_to_process.columns)
# ref_dict = template.to_dict()
#
##info_to_process.columns = [str(col).split()[0] for col in info_to_process.columns]
# ed = info_to_process.to_dict()
#
# current_row_number = len(template)+1
#
# ref_dict['Name'][current_row_number] = "qwwqeqwew"
#
#
##info_to_process.columns=pd.to_datetime(info_to_process.columns)
#
# for date in ed:
#        if date in ref_dict.keys():
#
#            ref_dict[date][current_row_number] = ed[date][0]
#        else:
#            pass
# updated_dataframe = pd.DataFrame(ref_dict)
#
#
# for update in info_to_process:
#    for date in template:
#        if type(date)=="datetime.datetime":
#            if date.year == update.year:
#                print(date,update)
#
#
# column_as_list=list(info_to_process.columns)
#
# column_as_list_template=list(template.columns)
#
#
# column_as_list[0].year
#
#
# template.loc[0,column_as_list[0]]
#
#
#
#
#
#
#
#
#
## =============================================================================
## if __name__ == '__main__':
##     main(sys.argv[1])
## =============================================================================
#
#
############## FOR BATCH TESTING PURPOSE
##
##alphabet_path = '/home/sainadh/SAMPLES/Insights_global'
##output_path = '/home/sainadh/outputs'
##
##for folder in sorted(os.listdir(alphabet_path)):
##    print('\n','*'*50)
##    print('FOR FOLDER :' , folder)
##    print('*'*50)
##    alphabet = alphabet_path.split('/')[-1]
##    df_to_write = pd.DataFrame()
##    folder_path = alphabet_path+'/'+folder
##
##    if os.path.isdir(folder_path):
##        for file in sorted(os.listdir(folder_path)):
##            print(file)
##            if file.split('.')[-1] in ["PDF","pdf","jpg","png","jpeg","JPG","PNG"]:
###                print('COMING HERE')
##                file_path = folder_path+'/'+file
###                print(file_path)
##                df = main(file_path)
##
##                if isinstance(df, pd.DataFrame) : df_to_write = pd.concat([df_to_write,df],axis =0,ignore_index =True)
##
##        print(output_path+ '/'+ alphabet + '/'+folder+'/')
##        print('FINAL!!!   DATA FRAME TO WRITE :' , df_to_write)
##        if isinstance(df_to_write, pd.DataFrame):
##            if len(df_to_write) > 1:
##                print('MAKING DIRECTORY')
##                try: os.mkdir(output_path+ '/'+ alphabet + '/')
##                except:pass
##                try:os.mkdir(output_path+ '/'+ alphabet + '/'+ folder+'/')
##                except:pass
##                df_to_write.to_excel(output_path+ '/'+ alphabet + '/'+folder+'/'+file+'.xlsx')
###            else: pass
##        else:
##            pass
##    else:
##        pass
#
##group_matches_on_axis([([176, 191, 358, 190, 357, 226, 175, 224], 'Samsung.com'), ([1166, 385, 1233, 385, 1234, 416, 1166, 416], 'Total'), ([17, 510, 82, 510, 82, 537, 17, 537], 'Mon'), ([22, 570, 69, 571, 69, 598, 22, 597], 'Tue'), ([20, 634, 81, 634, 81, 661, 19, 661], 'Wed'), ([21, 695, 72, 695, 71, 724, 21, 724], 'Thu'), ([20, 755, 59, 756, 58, 783, 19, 782], 'Fri'), ([19, 821, 61, 821, 60, 847, 19, 847], 'Sat'), ([20, 883, 70, 884, 69, 910, 19, 909], 'Sun'), ([846, 998, 919, 998, 919, 1028, 846, 1028], 'Total')])
#
#################################################
##for testing puposes only
##def plot_words_only(image_path,weekdays,dates,hrs,image_name,saving_folderrpath):
##    ImageforDisplay(filename=image_path)
##    im = Image.open(image_path)
##    width, height = im.size
##    plt.figure(figsize=(15, 15))
###    img = Image.new('RGB', (width,height), (255, 255, 255))
###    img.save("image.png", "PNG")
##
###    image_data = open("out.png", "rb").read()
###    image = Image.open(BytesIO(image_data))
###    width, height = img.size
##    print (width, height)
##    ax = plt.imshow(im)
##    for polygon in weekdays[1]:
##        vertices = [(polygon[0][i], polygon[0][i+1])
##                    for i in range(0, len(polygon[0]), 2)]
###        text = polygon[1]    
##        patch = Polygon(vertices, closed=True, fill=False, linewidth=2, color='r')
##        ax.axes.add_patch(patch)
###        plt.text(vertices[0][0], vertices[0][1], text, fontsize=6, va="top",color = 'black')
##    for polygon in dates[1]:
##        vertices = [(polygon[0][i], polygon[0][i+1])
##                    for i in range(0, len(polygon[0]), 2)]
###        text = polygon[1]
##        patch = Polygon(vertices, closed=True, fill=False, linewidth=2, color='r')
##        ax.axes.add_patch(patch)
###        plt.text(vertices[0][0], vertices[0][1], text, fontsize=6, va="top",color = 'black')
##    plt.savefig(saving_folderrpath+image_name+'.png', bbox_inches='tight',pad_inches=0)
