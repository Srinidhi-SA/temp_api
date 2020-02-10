#!/usr/bin/env python
# coding: utf-8

# In[1]:
from ocr.ITE.utils import *
import numpy as np


# In[2]:


# try:rmtree(path+'/Pages')
# except:pass
# try:os.makedirs(path+'/Pages')
# except:pass

# shutil.copy(image_with_path_for_cpy,path+"/Pages" )


# try:rmtree(path+'/Deskewed_Pages')
# except:pass
# try:os.makedirs(path+'/Deskewed_Pages')
# except:pass

# try:rmtree(path+'/Preprocessed_Page_for_Table')
# except:pass
# try:os.makedirs(path+'/Preprocessed_Page_for_Table')
# except:pass

# try:rmtree(path+'/Preprocessed_Page_for_Text')
# except:pass
# try:os.makedirs(path+'/Preprocessed_Page_for_Text')
# except:pass

# try:rmtree(path+'/Tables')
# except:pass
# try:os.makedirs(path+'/Tables')
# except:pass

# try:rmtree(path+'/Templates')
# except:pass
# try:os.makedirs(path+'/Templates')
# except:pass


# # FUNCTIONS

# In[3]:


# In[8]:


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
            clustering = DBSCAN(eps=10, min_samples=2, algorithm='ball_tree', n_jobs=-1).fit(
                np.array(list(zip(cy, cx))))
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

            return temp_dict2

        else:
            print('0 cell detected.')

    except Exception as e:
        print(e)


# In[9]:


# In[10]:


## NEW LOGIC FOR PARAGRAPH EXTRACTION

def get_similar(line_number, p1_p3, lines, dst):  ## GET ALL THE POLYGONS WHICH HAVE SAME START OR STOP PLACES

    x1, x3 = p1_p3[line_number][0][0], p1_p3[line_number][1][0]
    y1, y3 = p1_p3[line_number][0][1], p1_p3[line_number][1][1]

    thrx = round(((x3 - x1) / len(lines[line_number])) * 6)  ## USUAL INTEND IS 5 SPACES

    #     net1,net2  = range(x1-10,x1+10),range(x3-10,x3+10)    ## net for X's
    #     net3,net4 = range(y1-100,y1+100),range(y3-100,y3+100) ## net for Y's

    similar = []

    thr_centroid = (
                y3 - y1)  # + (y3-y1)*1.45   ##For most text, the optimal line spacing is between 120% and 145% of the point size
    similar = [y for (x, y) in dst.keys() if (x == line_number) and (dst[(x, y)] < thr_centroid)]
    similar = similar + [x for (x, y) in dst.keys() if (y == line_number) and (dst[(x, y)] < thr_centroid)]

    # if len(similar): thry = round(((y3-y1) + (y3-y1))*0.5 *1.25) * 2
    for i, key in enumerate(p1_p3):  ## Key here is line number!!!!

        p1, p3 = p1_p3[key]

        if (key not in similar) and (key != line_number):

            if i == 0 and len(similar) > 0:
                x1, x3 = p1_p3[similar[0]][0][0], p1_p3[similar[0]][1][0]
                y1, y3 = p1_p3[similar[0]][0][1], p1_p3[similar[0]][1][1]

            thry = round(((y3 - y1) + (y3 - y1)) * 0.5 * 1.25)

            netx1, netx3 = range(x1 - thrx, x1 + thrx), range(x3 - thrx, x3 + thrx)  ## net for X's
            nety1, nety3 = range(y1 + 1, y1 + thry), range(y3 + 1, y3 + thry)
            text_size_diff = abs((p3[1] - p1[1]) - (y3 - y1))

            if ((p1[0] in netx1) or (p3[0] in netx3)) and (
                    (p1[1] in nety1) or (p3[1] in nety3)):  # or (p3[1] in net2)):

                similar.append(key)
                #                 thrx = thrx
                x1, x3 = p1[0], p3[0]
                y1, y3 = p1[1], p3[1]
    #     similar_lines = [lines[i] for i in similar]

    return similar, p1_p3[line_number][0][1]  ## ALL THE LINE NUMBERS AND Y1


# In[11]:


def display_template(template_number):
    print('PRESS ANY BUTTON ON KEYBOARD TO CLOSE IMAGE')

    template = cv2.imread('Templates/template_' + str(template_number) + '.png')

    cv2.namedWindow('TEMPLATE' + str(template_number), cv2.WINDOW_NORMAL)
    cv2.imshow('TEMPLATE' + str(template_number), template)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# # MAIN

# In[12]:


def deskew(image):
    '''  STEP 2: Deskew and save the pages  '''
    print('\n\n\n DESKEWING PAGES...')
    # create_empty_folder('Deskewed_Pages')

    # for  page_image  in sorted(os.listdir('Pages')):
    t = time.time()

    # Choose one of the two -
    # out_im, angle  =  deskew_original('Pages/' + page_image)
    out_im, angle = deskew_optimized(image)

    # cv2.imwrite('Deskewed_Pages/' + page_image[:-4] + '__deskewed.png', out_im)

    time_taken = str(round(time.time() - t, 2)) + 's'

    print('\nDESKEWED FILENAME:', image,
          '\nANGLE OF ROTATION:', angle,
          '\nTIME TAKEN:', time_taken)  # monitor progress.
    return out_im


# In[ ]:


# In[13]:


def preprocess(out_im, image):
    '''  STEP 3: Preprocess images for better text and table extraction  '''
    print('\n\n\n PREPROCESSING...')
    # create_empty_folder('Preprocessed_Page_for_Text')
    # create_empty_folder('Preprocessed_Page_for_Table')

    # for  deskewed_page  in sorted(os.listdir('Deskewed_Pages')):
    t = time.time()

    # image = cv2.imread('Deskewed_Pages/' + deskewed_page)

    # Preprocessing for text.
    #     adjusted = adjust_gamma(image, gamma=0.2)
    #     denoised = denoise(adjusted, denoise_strength=20)
    # cv2.imwrite('Preprocessed_Page_for_Text/' + deskewed_page[:-14] + '_prep_for_text.png', image)

    # Preprocessing for table.
    denoised_table = denoise(out_im, denoise_strength=20)
    blured_table = cv2.bilateralFilter(denoised_table, 9, 30, 30)
    # cv2.imwrite('Preprocessed_Page_for_Table/' + deskewed_page[:-14] + '_prep_for_table.png', blured_table)

    time_taken = str(round(time.time() - t, 2)) + 's'

    print('\nPREPROCESSED FILENAME:', image,
          '\nTIME TAKEN:', time_taken)
    return blured_table


# ### Table and Cells PART

# In[1]:


def tp_main(image_with_path_for_cpy, blured_table, analysis):
    '''  TABLE DETECTION  '''
    # TODO: Optimize the code - takes long to run.

    print('\n\n\n DETECTING TABLES...')
    # create_empty_folder('Tables')
    all_JSON = {}
    page_metadata = {}

    # for  filename  in sorted(os.listdir('Preprocessed_Page_for_Table')):
    # filename = 'page_1_prep_for_table.png'

    # filename_ = filename[:-19]
    page_metadata[image_with_path_for_cpy] = {"order": [], "table": {}, "paragraph": {}}

    # image_path = 'Preprocessed_Page_for_Table/' + filename
    # image_table_extraction = cv2.imread(image_path)

    gray = cv2.cvtColor(blured_table, cv2.COLOR_BGR2GRAY)
    bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)

    scalev, scaleh = optimal_params(bw, task='table')

    #     print(scalev,scaleh)
    #     import sys
    #     sys.exit()

    horizontal, vertical = extract_mask(bw, scalev=scalev, scaleh=scaleh)

    #     print(vertical.shape,horizontal.shape)

    mask = horizontal + vertical

    # cv2.imshow('mask',mask)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # cv2.imwrite("Templates/" + filename_ + '__mask_' +'.png', mask)        ## FOR TEMPLATE IDENTIFICATION

    cy, cx = np.where(np.bitwise_and(vertical, horizontal) == 255)
    intersection_coordinates = list(zip(list(cx), list(cy)))

    weird = True  ## ONLY WHEN THE PAGE HAS BOARDERS WHICH ARE NOT ACTUALLY A TABLE
    while weird == True:

        parent_area = mask.shape[0] * mask.shape[1]
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        table_number = 0
        areaThr = 0.003 * parent_area  ## threshold will be
        table_area_dict = {}  ## Dictionary with the area of the table
        table_count_dict = {}  ##Dictionary with table number and the bounding co-ordinates
        table_centroid_dict = {}

        for cnt in contours:

            area = cv2.contourArea(cnt)  ## Area of the contour

            peri = cv2.arcLength(cnt, True)  ## Perimeter of the contour
            approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)  ### EDGES (explained in the end)

            x, y, width, height = cv2.boundingRect(cnt)

            ### CHECKING IF THE TABLE IS SINGLE CELLED!!!!

            cells, _ = cv2.findContours(mask[y + 10:y + height - 10, x + 10:x + width - 10], cv2.RETR_TREE,
                                        cv2.CHAIN_APPROX_SIMPLE)

            cells_peri = [cv2.arcLength(cnt, True) for cnt in cells]
            cells_approxs_lens = [len(cv2.approxPolyDP(cells[i], 0.02 * cells_peri[i], True)) for i in
                                  range(len(cells))]

            if (area > 0.8 * parent_area):  ## BORDERS CONSIDERED AS TABLE

                print('IM COMIN HERE')
                mask = mask[y + 10:y + height - 10, x + 10:x + width - 10]
                break

            if (area > areaThr) and (len(approx) >= 4) and (len(approx) <= 6) and (
                    (abs(approx[1][0][0] - approx[2][0][0]) < 20) or (
                    abs(approx[0][0][0] - approx[1][0][0]) < 20)) and (min(width, height)) > 20:
                #                 print(len(cells))
                #                 print(cells_approxs_lens)

                table_count_dict[table_number + 1] = [x, y, x + width - 1, y + height - 1]
                table_area_dict[table_number + 1] = area

                M = cv2.moments(cnt)
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                table_centroid_dict[table_number + 1] = [(cx, cy)]
                table_number = table_number + 1

                weird = False

        weird = False

    #### TABLE IN TABLE DETECTION!!**************************

    inner_table_dict = {}
    for table_number in table_count_dict:

        if table_area_dict[table_number] > 0.5 * (parent_area):

            #             print('imgoing in')
            temp = table_count_dict[table_number]

            #             print(og_cor)

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
                        (abs(approx[1][0][0] - approx[2][0][0]) < 20) or (
                        abs(approx[0][0][0] - approx[1][0][0]) < 20)) and (min(width, height) > 20):
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
        page_metadata[image_with_path_for_cpy]["table"][table_number] = table_centroid_dict[table_number]
        page_metadata[image_with_path_for_cpy]["table"][table_number].append(table_area_dict[table_number])

    page_metadata[image_with_path_for_cpy]["no_of_tables"] = len(page_metadata[image_with_path_for_cpy]["table"])
    page_metadata[image_with_path_for_cpy]["total_area"] = sum(table_area_dict.values())

    order = {}
    table_cell_dict = {}
    img = blured_table.copy()  ## Original IMAGE
    white_page = 255 * np.ones(img.shape).astype(img.dtype)  ## WHite PAGE with same size as the BW image

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

        # cv2.imwrite("Tables/" + image_path.split('/')[-1][:-19] + '__TABLE_' + str(table_number) + '.png', stencil2)

        table_cell_dict[table_number] = get_cell_coordinates(stencil2, scalev_optimal=scalev)

    print('ALL TABLES DETECTED... FOR ', image_with_path_for_cpy)

    ### GETTING DATA IN EACH CELL OF THE TABLE *****************************************************88

    ##analysis = text_from_Azure_API(image_with_path_for_cpy)

    # print('API run Successful for page ' ,image_with_path_for_cpy)

    final_mapped_dict_table = {}
    tables = list(table_cell_dict.keys())
    for table in tables:
        final_mapped_dict_cell = {}
        for cell in table_cell_dict[table].keys():
            final_mapped_dict_cell[cell] = []
        final_mapped_dict_table[table] = final_mapped_dict_cell

    len_check = 0
    for i in range(len(analysis['recognitionResults'][0]['lines'])):
        # print(analysis['recognitionResults'][0]['lines'][i])
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
    ## DISTANCE BETWEEN CENTROIDS OF DIFFERENT POLYGONS

    paras = {}  ## PARAGRAPHS  { para_1 : [line1,line2]}
    para = 1
    i = 1
    clubbed_lines = []
    for line_number in p1_p3:

        # if (len(lines[line_number])<6) or (' ' not in lines[line_number]):   ## ALL THE SMALL WORDS WHICH WILL BE EXTRACTED SEPERATELY LATER
        #     pass

        if (line_number not in clubbed_lines):
            clubbed_lines.append(line_number)

            clubbed_lines_, depth = get_similar(line_number, p1_p3, lines, dst)
            # print(clubbed_lines_)
            clubbed_lines = clubbed_lines + clubbed_lines_

            paras['p_' + str(para)] = [lines[line_number]] + [lines[line_number] for line_number in clubbed_lines_]
            order['p_' + str(para)] = depth  ##
            para = para + 1

    ### FINAL PART ( FINAL JASON AND METADATA OF THAT PAGE)

    page_metadata[image_with_path_for_cpy]['order'] = sorted(order, key=order.get)

    final_json = {'tables': final_mapped_dict_table, 'paragraphs': paras}

    all_JSON[image_with_path_for_cpy] = final_json

    print('Final Json and Page_meta_data done for ', image_with_path_for_cpy, '\n')

    #     f = open('out.json', 'w')
    #     f.write(json.dumps(all_JSON, indent=4))
    #     f.close()
    with open('ocr/ITE/demo_analysis/all_final_json.json', 'w+') as f:
        try:
            data = json.load(f)
        except:
            data = {}
        for x in all_JSON:
            data[x] = all_JSON[x]
    with open('ocr/ITE/demo_analysis/all_final_json.json', 'w') as fp:
        json.dump(data, fp)

    print(all_JSON)
    # print(page_metadata)
    return all_JSON, page_metadata


# In[ ]:


# In[2]:


def tp_run_all(image_with_path_for_cpy, analysis):
    temp_image_discard = deskew(image_with_path_for_cpy)
    temp_image_blurred_table = preprocess(temp_image_discard, image_with_path_for_cpy)
    return tp_main(image_with_path_for_cpy, temp_image_blurred_table, analysis)
