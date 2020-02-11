# !/usr/bin/env python
# coding: utf-8

# In[1]:
import numpy as np
from ocr.ITE.utils import *


#
#
def table_count(image, scalev=40, scaleh=20):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)

    horizontal, vertical = extract_mask(bw, scalev=scalev, scaleh=20)
    mask = horizontal + vertical

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    parent_area = mask.shape[0] * mask.shape[1]
    areaThr = 0.01 * parent_area
    count = 0
    table_count_dict = {}
    for cnt in contours:
        area = cv2.contourArea(cnt)
        #         print(area/parent_area)
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        x, y, width, height = cv2.boundingRect(cnt)
        # if  area > areaThr  and  min(width, height) > 12  and  is_single_celled(x, y, x+width, y+height, intersection_coordinates):
        if area > areaThr and (len(approx) >= 4) and (len(approx) <= 6) and (min(width, height)) > 20 and \
                (area / parent_area < 0.8):
            #             table_count_dict[count] = [x, y, x+width-1, y+height-1]
            count += 1

    return count


#

# In[8]:


def clean(col):
    col_new = [np.nan if len(x) == 0 else " ".join(x) for x in col]
    return pd.Series(col_new)


# In[9]:


def display_template(template_number):
    print('PRESS ANY BUTTON ON KEYBOARD TO CLOSE IMAGE')

    template = cv2.imread('Templates/template_' + str(template_number) + '.png')

    cv2.namedWindow('TEMPLATE' + str(template_number), cv2.WINDOW_NORMAL)
    cv2.imshow('TEMPLATE' + str(template_number), template)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# In[10]:


def preprocess2(path):
    t = time.time()

    # Choose one of the two -
    # out_im, angle  =  deskew_original('Pages/' + page_image)
    out_im, angle = deskew_optimized(path)
    adjusted = adjust_gamma(out_im, gamma=0.2)
    denoised_table = denoise(adjusted, denoise_strength=20)
    blured_table = cv2.bilateralFilter(denoised_table, 9, 30, 30)

    cv2.imwrite(os.getcwd() + '/' + path[:-4] + '_prep_for_text.png', denoised_table)
    #     cv2.imwrite('Deskewed_Pages/' + page_image[:-4] + '__deskewed.png', out_im)

    time_taken = str(round(time.time() - t, 2)) + 's'

    print('\nDESKEWED FILENAME:', path,
          '\nANGLE OF ROTATION:', angle,
          '\nTIME TAKEN:', time_taken,
          '\nDENOISED IMAGE',
          '\nADJUSTED GAMMA')  # monitor progress.

    return blured_table


# In[72]:


def run_all(imagepp, analysis, path):
    # filename = 'page_1_prep_for_table.png'

    all_JSON = {}
    page_metadata = {}
    filename_ = path.split('/')[-1]
    page_metadata[filename_] = {"order": [], "table": {}, "paragraph": {}}

    # cv2.imshow('image before',imagepp)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    #     analysis = text_from_Azure_API(filename_)

    image_no_words = remove_all_words(imagepp, analysis)
    imagepp = image_no_words.copy()
    #     cv2.imshow('image after',imagepp)
    #     cv2.waitKey(0)
    #     cv2.destroyAllWindows()
    image_path = path
    #     image_table_extraction = cv2.imread(image_path)

    gray = cv2.cvtColor(imagepp, cv2.COLOR_BGR2GRAY)
    bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)

    scalev, scaleh = optimal_params(bw, task='table')
    # print(scalev,scaleh)
    # if table_count >3 : scale
    #     print(scalev,scaleh)
    #     import sys
    #     sys.exit()
    #     cv2.imshow('BW',bw)
    #     cv2.waitKey(0)
    #     cv2.destroyAllWindows()

    horizontal, vertical = extract_mask(bw, scalev=scalev, scaleh=scaleh)

    #     print(vertical.shape,horizontal.shape)

    mask = horizontal + vertical
    # cv2.imshow('MASK',mask)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
    #     cv2.imwrite("Templates/" + filename_ + '__mask_' +'.png', mask)        ## FOR TEMPLATE IDENTIFICATION

    cy, cx = np.where(np.bitwise_and(vertical, horizontal) == 255)
    intersection_coordinates = list(zip(list(cx), list(cy)))

    parent_area = mask.shape[0] * mask.shape[1]
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    table_number = 0
    areaThr = 0.01 * parent_area  ## threshold will be changed from template to template
    table_area_dict = {}  ## Dictionary with the area of the table
    table_count_dict = {}  ##Dictionary with table number and the bounding co-ordinates
    table_centroid_dict = {}

    for cnt in contours:

        area = cv2.contourArea(cnt)  ## Area of the contour

        peri = cv2.arcLength(cnt, True)  ## Perimeter of the contour
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)  ### EDGES (explained in the end)
        # approx = cv2.approxPolyDP(curve, epsilon, closed, approxCurve)

        x, y, width, height = cv2.boundingRect(cnt)

        # template to template changes
        if (area > areaThr) and (len(approx) >= 4) and (len(approx) <= 6) and (min(width, height)) > 20:
            table_count_dict[table_number + 1] = [x, y, x + width - 1, y + height - 1]
            table_area_dict[table_number + 1] = area

            M = cv2.moments(cnt)
            cx = int(M['m10'] / M['m00'])
            cy = int(M['m01'] / M['m00'])
            table_centroid_dict[table_number + 1] = [(cx, cy)]
            table_number = table_number + 1

    #     print(table_count_dict)

    #### TABLE IN TABLE DETECTION!!**************************

    inner_table_dict = {}
    for table_number in table_count_dict:

        if table_area_dict[table_number] > 0.3 * (parent_area):

            #             print('imgoing in')
            temp = table_count_dict[table_number]
            outer_table_mask = mask[temp[1] + 10:temp[3] - 10, temp[0] + 10:temp[
                                                                                2] - 10]  # startY and endY coordinates, followed by the startX and endX

            contours_inner, _ = cv2.findContours(outer_table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            inner_table_number = 0
            #             print(contours_inner)

            for cnt in contours_inner:
                area = cv2.contourArea(cnt)
                x, y, width, height = cv2.boundingRect(cnt)

                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

                if (area > areaThr) and (area < 0.8 * table_area_dict[table_number]) and (len(approx) == 4) and (
                        abs(approx[1][0][0] - approx[2][0][0]) in range(20)) and (min(width, height) > 20):
                    table_area_dict[int(str(table_number) + str(inner_table_number + 1))] = area
                    M = cv2.moments(cnt)
                    cx = int(M['m10'] / M['m00'])
                    cy = int(M['m01'] / M['m00'])
                    table_centroid_dict[int(str(table_number) + str(inner_table_number + 1))] = [(cx, cy)]

                    inner_table_dict[int(str(table_number) + str(inner_table_number + 1))] = [x + temp[0] + 10,
                                                                                              y + temp[1] + 10,
                                                                                              x + width - 1 + temp[
                                                                                                  0] + 10,
                                                                                              y + height - 1 + temp[
                                                                                                  1] + 10]
                    inner_table_number = inner_table_number + 1

    #                     print(inner_table_number,' area :' , area , ' width :',width , ' Height :',height)

    if len(inner_table_dict) > 0:
        for inner_table in inner_table_dict:
            table_count_dict[inner_table] = inner_table_dict[inner_table]

    for table_number in table_count_dict:
        page_metadata[filename_]["table"][table_number] = table_centroid_dict[table_number]
        page_metadata[filename_]["table"][table_number].append(table_area_dict[table_number])

    page_metadata[filename_]["no_of_tables"] = len(page_metadata[filename_]["table"])
    page_metadata[filename_]["total_area"] = sum(table_area_dict.values())

    order = {}
    table_cell_dict = {}
    img = imagepp.copy()  ## Original IMAGE
    white_page = 255 * np.ones(img.shape).astype(img.dtype)  ## WHite PAGE with same size as the BW image

    #     print(table_count_dict)

    for table_number in table_count_dict:  ## NOW SAVING THE INDIVIDUAL TABLE IMAGES AND EXTRACTING CO-ORDINATES FROM EACH TABLE

        temp = table_count_dict[table_number]

        order['t_' + str(table_number)] = temp[1]

        stencil = white_page.copy()
        stencil[temp[1]:temp[3], temp[0]:temp[2]] = img[temp[1]:temp[3],
                                                    temp[0]:temp[2]]  ## EXTRACTING ORIGINAL TABLE ON A WHITE PAGE

        stencil2 = white_page.copy()  ## TAKING THIS INSTEAD OF TAKING TABLE EXTRACTION
        mask_inverted = cv2.cvtColor(cv2.bitwise_not(mask), cv2.COLOR_GRAY2RGB)  ### TO Extract Lines in BLACK

        stencil2[temp[1]:temp[3], temp[0]:temp[2]] = mask_inverted[temp[1]:temp[3],
                                                     temp[0]:temp[2]]  ## BLACK LINES ON WHITE PAGE

        ### Check for inner tables and removing from the parent table

        pos_inner_tabs = set([int(str(table_number) + str(i)) for i in range(1, 10)])  ## possible inner tabs
        keys_sets = set(table_count_dict.keys())  ## all the tables in the page

        inner_tabs = list(pos_inner_tabs.intersection(keys_sets))

        if inner_tabs:  ## REMOVING INNER TABLES TO AVOID REPETITION IN DATA EXTRACTION

            for inner_table in inner_tabs:
                temp = table_count_dict[inner_table]
                stencil2[temp[1]:temp[3], temp[0]:temp[2]] = white_page[temp[1]:temp[3], temp[0]:temp[2]]

        #         cv2.imwrite(os.getcwd()+"/" + image_path.split('/')[-1][:-19] + '__TABLE_' + str(table_number) + '.png', stencil2)

        table_cell_dict[table_number] = get_cell_coordinates(stencil2, scalev_optimal=scalev)

    if len(table_count_dict) > 0: print('TABLES DETECTED... FOR ', filename_)

    ### GETTING DATA IN EACH CELL OF THE TABLE *****************************************************88

    print('API run Successful for page ', filename_)

    final_mapped_dict_table = {}
    tables = list(table_cell_dict.keys())
    for table in tables:
        final_mapped_dict_cell = {}
        for cell in table_cell_dict[table].keys():
            final_mapped_dict_cell[cell] = []
        final_mapped_dict_table[table] = final_mapped_dict_cell

    len_check = 0
    for i in range(len(analysis['recognitionResults'][0]['lines'])):
        for h in range(len(analysis['recognitionResults'][0]['lines'][i]['words'])):
            da_c_main = analysis['recognitionResults'][0]['lines'][i]['words'][h]['boundingBox']
            x = (da_c_main[0] + da_c_main[2] + da_c_main[4] + da_c_main[6]) / 4
            y = (da_c_main[3] + da_c_main[5] + da_c_main[1] + da_c_main[7]) / 4

            for j in table_cell_dict:
                tab_cell = list(table_cell_dict[j].keys())
                for l in tab_cell:
                    x1 = table_cell_dict[j][l][0][0][0]
                    x2 = table_cell_dict[j][l][0][1][0]
                    y2 = table_cell_dict[j][l][0][1][1]
                    y3 = table_cell_dict[j][l][1][0][1]

                    if round(x) in range(x1, x2) and round(y) in range(y2, y3):
                        len_check += 1
                        # print(word_cord['recognitionResults'][0]['lines'][i]['words'][h]['text'], j, l)
                        final_mapped_dict_table[j][l].append(
                            analysis['recognitionResults'][0]['lines'][i]['words'][h]['text'])

    print('DATA IN CELLS DETECTED AND MAPPED')

    ### PARAGRAPHS DETECTION LOGIC *********************************************************

    polygons = []
    if ("recognitionResults" in analysis):
        polygons = [(line["boundingBox"], line["text"]) for line in analysis["recognitionResults"][0]["lines"]]

    table_coordinates = {}
    for table in table_cell_dict:

        i = sum([sum(sum(table_cell_dict[table][i], []), []) for i in table_cell_dict[table]], [])
        #     print(i)

        try:
            table_coordinates[table] = [(min(i[::2]), min(i[1::2])), (max(i[::2]), max(i[1::2]))]
        except:
            pass

    polygons_ = []
    for i in polygons:  ## Filtering all the polygons that are inside tables

        x_min, y_min, x_max, y_max = min(i[0][::2]), min(i[0][1::2]), max(i[0][::2]), max(i[0][1::2])
        flag = True

        for v in table_coordinates.values():
            if ((v[0][0] <= x_min <= v[1][0]) or (v[0][0] <= x_max <= v[1][0])) and (
                    (v[0][1] <= y_min <= v[1][1]) or (v[0][1] <= y_max <= v[1][1])):
                flag = False
                break
        if flag:    polygons_.append(i)

    polygons = polygons_

    lines = {i: polygons[i - 1][1] for i in range(1, len(polygons) + 1)}  # {line_number: Content of that line}

    p1_p3 = {}  ## Point 1 Point 3 DICTIONARY FOR ALL THE POLYGONS {line_number: [point1,point3]}
    centroids = {}  ## CENTROID DICTIONARY FOR ALL THE POLYGONS {line_number: centroid}
    for line_number, line in enumerate(polygons):
        line_number = line_number + 1
        p1_p3[line_number] = line[0][:2], line[0][4:6]
        #     print(p1_p3[line_number][1][0])
        centroids[line_number] = (p1_p3[line_number][0][0] + p1_p3[line_number][1][0]) * 0.5, (
                p1_p3[line_number][0][1] + p1_p3[line_number][1][1]) * 0.5

    line_numbers = p1_p3.keys()

    combinations = [(x, y) for x in line_numbers for y in line_numbers if x != y and y > x]

    dst = {combination: distance.euclidean(centroids[combination[0]], centroids[combination[1]]) for combination in
           combinations}

    page_metadata[filename_]['order'] = sorted(order, key=order.get)

    final_json = {'tables': final_mapped_dict_table}

    all_JSON[filename_] = final_json

    print('Final Json and Page_meta_data done for ', filename_, '\n')

    with open('ocr/ITE/demo_analysis/all_final_json.json', 'w+') as f:
        try:
            data = json.load(f)
        except:
            data = {}
        for x in all_JSON:
            data[x] = all_JSON[x]
    with open('ocr/ITE/demo_analysis/all_final_json.json', 'w+') as fp:
        json.dump(data, fp)
    # print(final_json)
    return final_json


#     f = open('out.json', 'w')
#     f.write(json.dumps(all_JSON, indent=4))
#     f.close()


# In[13]:


def structure_json(final_json):
    dict_ = {}
    dict_2 = {}
    for d in final_json["tables"]:
        dict_[d] = {}
        dict_2[d] = {}
        for i in final_json["tables"][d]:
            dict_[d][i[0:2]] = []
            for a in final_json["tables"][d]:
                if len(final_json["tables"][d][a]) <= 6 and i[0:2] == a[0:2]:
                    dict_[d][i[0:2]].append(final_json["tables"][d][a])
                elif len(final_json["tables"][d][a]) > 2:
                    dict_2[d][a] = final_json["tables"][d][a]

    df_ = {}
    for i in dict_:
        df_[i - 1] = pd.DataFrame.from_dict(dict_[i]).apply(lambda x: clean(x), axis=1)

    return df_


# In[14]:


### FINAL JSON TO DATA FRAME ( NON FULLY CONNECTED TABLES TO DFS)


# In[15]:


def structure_json2(final_json):
    for table in final_json['tables']:

        table_info = final_json['tables'][table]

        if len(table_info) != 0:

            cells = table_info.keys()
            #         print(cells)
            max_cols = int((re.findall('\d+', list(cells)[-1].split('r')[0]))[0])

            max_rows = max([int(cell.split('r')[1]) for cell in cells])
            #             print(max_rows,max_cols)
            #     max_rows =
            #         print(max_cols)
            df = pd.DataFrame(columns=list(range(max_cols)))

            for row in range(max_rows + 1):
                cur_row = {}
                for col in range(max_cols + 1):
                    key = 'c' + str(col) + 'r' + str(row)
                    if key in table_info.keys():
                        if type(table_info[key]) == list and len(table_info[key]) == 1:
                            #                         print(table_info[key])
                            cur_row[col] = table_info[key][0]

                        elif type(table_info[key]) == list and len(table_info[key]) > 1:
                            cur_row[col] = ' '.join(table_info[key])

                        elif type(table_info[key]) == list and len(table_info[key]) == 0:
                            cur_row[col] = 'NA'
                        else:
                            cur_row[col] = table_info[key]
                    else:
                        cur_row[col] = 'No Cell'
                df = df.append(cur_row, ignore_index=True)
    #             print(cur_row)

    #     cols_to_drop = []
    #     na_cols = [i for i ,v  in  enumerate(df.apply(pd.Series.nunique)) if v ==1]

    #     cols_to_drop = cols_to_drop +na_cols

    #     for col in df.columns:
    #         vals = list(df[col].value_counts().index)
    # #         print(vals)

    #         if 'NA' in vals : vals.remove('NA')

    #         if len(vals) == 1 and not (vals[0].isdigit() and bool(re.search('[a-zA-Z]', s))):

    #             if col not in cols_to_drop : cols_to_drop.append(col)

    #     for col in cols_to_drop:
    #         df = df.drop(col,axis = 1)

    return df


# In[16]:


def preprocess1(path):
    t = time.time()

    # Choose one of the two -
    # out_im, angle  =  deskew_original('Pages/' + page_image)
    out_im, angle = deskew_optimized(path)
    #     adjusted = adjust_gamma(image, gamma=0.2)
    denoised_table = denoise(out_im, denoise_strength=20)
    blured_table = cv2.bilateralFilter(denoised_table, 9, 30, 30)

    # cv2.imwrite(os.getcwd()+'/' + page_image[:-4] + '_prep_for_text.png', denoised_table)
    #     cv2.imwrite('Deskewed_Pages/' + page_image[:-4] + '__deskewed.png', out_im)

    time_taken = str(round(time.time() - t, 2)) + 's'

    # print('\nDESKEWED FILENAME:', page_image,
    #       '\nANGLE OF ROTATION:', angle,
    #       '\nTIME TAKEN:', time_taken,
    #      '\nDENOISED IMAGE',
    #      '\nADJUSTED GAMMA')    # monitor progress.

    return blured_table


# In[17]:


def remove_all_words(imagepp, analysis):
    wc = {}
    for i, line in enumerate(analysis["recognitionResults"][0]["lines"]):
        wc[i + 1] = [([word['boundingBox'][:2], word['boundingBox'][4:6]], word['text']) for word in line['words']]

    bs = [lst for sublist in list(wc.values()) for lst in sublist]
    d = {'b' + str(i): val for i, val in enumerate(bs)}

    for val in list(d.values()):
        temp = [val for sublist in val[0] for val in sublist]

        pixel = imagepp[temp[1], temp[0]]
        area = imagepp.shape[0] * imagepp.shape[1]
        page = np.reshape([pixel for i in range(area)], imagepp.shape)

        imagepp[temp[1]:temp[3], temp[0]:temp[2]] = page[temp[1]:temp[3], temp[0]:temp[2]]
    return imagepp


# In[18]:


def get_cell_coordinates(img, scalev_optimal=40):
    try:
        img_copy = img.copy()
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)

        scalev, scaleh = optimal_params(bw, task='cells', scalev=scalev_optimal)

        horizontal, vertical = extract_mask(bw, scalev=scalev, scaleh=scaleh)
        mask = horizontal + vertical

        cy, cx = np.where(np.bitwise_and(vertical, horizontal) == 255)

        if len(cy):
            clustering = DBSCAN(eps=7, min_samples=2, algorithm='ball_tree', n_jobs=-1).fit(np.array(list(zip(cy, cx))))
            cluster_labels = clustering.labels_

            grouped = [[y[0:2] for y in zip(cy, cx, cluster_labels) if y[2] == cluster_label] for cluster_label in
                       set(cluster_labels)]

            ## Grouped has all the pixel coordinates of the intersection of horizonta and vertical lines

            grouped_centroids = [(int(sum([i[0] for i in grouped[j]]) / len(grouped[j])),
                                  int(sum([i[1] for i in grouped[j]]) / len(grouped[j]))) for j in range(len(grouped))]

            def cluster_1D(values, threshold=5):  # Assuming height/width of a table > threshold.

                values = sorted(values)  # ;    print(values)
                _ = map(list, np.split(values, np.where(np.diff(values) > threshold)[0] + 1))
                return ([int(ceil(np.average(i))) for i in list(_) if len(i) > 1])

                #############   CHANGE MADE HERE TO CORRECT THE CELL NAMING

            cy_list, cx_list = cluster_1D([i[0] for i in grouped_centroids]), cluster_1D(
                [i[1] for i in grouped_centroids])

            edge_present = dict()
            for ix in range(len(cx_list) - 1):
                for iy in range(len(cy_list) - 1):
                    if ix != 0:
                        cx = cx_list[ix]
                        count = np.count_nonzero(mask[cy_list[iy]:cy_list[iy + 1] + 1, cx - 3:cx + 4])
                        _ = round(float(count) / float(cy_list[iy + 1] - cy_list[iy] + 1), 2)
                        edge_present[str(ix) + '_' + str(iy) + 'v'] = _ > 2.67

                    if iy != 0:
                        cy = cy_list[iy]
                        count = np.count_nonzero(mask[cy - 3:cy + 4, cx_list[ix]:cx_list[ix + 1] + 1])
                        _ = round(float(count) / float(cx_list[ix + 1] - cx_list[ix] + 1), 2)
                        edge_present[str(ix) + '_' + str(iy) + 'h'] = _ > 2.67

            cell_coordinates = dict()  # initialization for all unit cells. DETECTING CELLS NAMES
            for j in range(len(cx_list) - 1):
                for i in range(len(cy_list) - 1):
                    cell_coordinates['r' + str(i) + 'c' + str(j)] = (
                        cx_list[j], cy_list[i], cx_list[j + 1], cy_list[i + 1])

            temp_dict = {i: [i] for i in cell_coordinates}
            temp = []
            for edge in edge_present:
                if not edge_present[edge]:
                    i, j = map(int, edge[:-1].split('_'))

                    if edge.endswith('h'):
                        val = temp_dict['r' + str(j - 1) + 'c' + str(i)] + temp_dict['r' + str(j) + 'c' + str(i)]

                        for k in temp_dict['r' + str(j - 1) + 'c' + str(i)] + temp_dict['r' + str(j) + 'c' + str(i)]:
                            temp_dict[k] = val
                    else:
                        val = temp_dict['r' + str(j) + 'c' + str(i - 1)] + temp_dict['r' + str(j) + 'c' + str(i)]

                        for k in temp_dict['r' + str(j) + 'c' + str(i - 1)] + temp_dict['r' + str(j) + 'c' + str(i)]:
                            temp_dict[k] = val

                    temp.append('r' + str(j) + 'c' + str(i))

            for i in set(temp):    del temp_dict[i]

            temp_dict2 = OrderedDict()
            for merged_cell in temp_dict:  ## MERGING CELLS WHERE EDGE IS NOT PRESENT
                x1, y1, x2, y2 = (min([cell_coordinates[i][0] for i in temp_dict[merged_cell]]),
                                  min([cell_coordinates[i][1] for i in temp_dict[merged_cell]]),
                                  max([cell_coordinates[i][2] for i in temp_dict[merged_cell]]),
                                  max([cell_coordinates[i][3] for i in temp_dict[merged_cell]]))

                temp123 = merged_cell[1:].split('c')
                key = 'c' + temp123[1] + 'r' + temp123[0]
                temp_dict2[key] = [[[x1, y1], [x2, y1]], [[x1, y2], [x2, y2]]]
                cv2.putText(img_copy, merged_cell, (int((x1 + x2) / 2) - 10, int((y1 + y2) / 2) + 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255))
                cv2.rectangle(img_copy, (x1, y1), (x2, y2), (255, 0, 0), 1)

            #             if len(temp_dict2) ==0:
            #             print(temp_dict2)
            return temp_dict2

        else:
            print('0 cell detected.')

    except Exception as e:
        print(e)
