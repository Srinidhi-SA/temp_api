from shapely.geometry import Point
from shapely.geometry.polygon import Polygon


def calculate_centroid(p1, p3):
    x_centroid = int((p1[0] + p3[0]) * 0.5)
    y_centroid = int((p1[1] + p3[1]) * 0.5)
    return x_centroid, y_centroid


def add_azure_conf(final_json, analysis):  ## ADDS AZURE CONFIDENCE KEY
    wc = {}
    for i, line in enumerate(analysis["lines"]):
        wc[i + 1] = [(word['boundingBox'], word['text'], word['confidence'], line['appearance']['style']) for word in
                     line['words']]

    manual = False
    for line in wc:
        for word in wc[line]:
            updated = False
            bb = word[0]
            cord = calculate_centroid(bb[:2], bb[4:6])
            conf = word[2]
            style = word[3]

            if len(final_json['paragraphs']) > 0:
                updated, final_json = check_update_paras_conf(final_json, cord, conf, style)
            if not updated and len(final_json['tables']) > 0:
                updated, final_json = check_update_tables_conf(final_json, cord, conf, style)

            if updated:
                pass
                print('update done')
            else:

                manual = True

    if manual:
        final_json = manual_fill_flags_az(final_json)

    return final_json


def check_update_paras_conf(final_json, cord, conf, style):
    for i in range(len(final_json['paragraphs'])):
        for j, line in enumerate(final_json['paragraphs']['p_'
                                                          + str(i + 1)]):
            # j th line
            for k, d in enumerate(final_json['paragraphs']['p_' +
                                                           str(i + 1)][j]):
                # k th word
                bb = d['boundingBox']['p1'] + d['boundingBox']['p3']
                #                if (cord[0] in range(bb[0], bb[2])) and (cord[1] in range(bb[1], bb[3])):
                if cord[0] in range(min(bb[0], bb[2])
                        , max(bb[0], bb[2])) and \
                        cord[1] in range(min(bb[1], bb[3]),
                                         max(bb[1], bb[3])):
                    final_json['paragraphs']['p_' + str(i + 1)][j][k]['azure_conf'] = conf
                    final_json['paragraphs']['p_' + str(i + 1)][j][k]['style'] = style
                    return True, final_json
                else:
                    pass

    return False, final_json


def check_update_tables_conf(final_json, cord, conf, style):
    update = True
    p = Point(cord)

    for i in range(len(final_json['tables'])):
        # CURRENTLY ONLY 4 SIDED TABLES

        # str table number********* when saved
        p1, p3 = final_json['table_coordinates'][i + 1][:2], \
                 final_json['table_coordinates'][i + 1][2:]
        p2 = [p3[0], p1[1]]
        p4 = [p1[0], p3[1]]
        polygon_coordinates_list = [p1, p2, p3, p4]
        temp_polygon = Polygon(polygon_coordinates_list)

        if temp_polygon.contains(p):
            for cell in final_json['tables'][i + 1]:
                bb = final_json['tables'][i + 1][cell]['boundingBox']

                if cord[0] in range(bb['p1'][0], bb['p3'][0]) and cord[1] in range(bb['p1'][1], bb['p3'][1]):
                    words_bb = final_json['tables'][i + 1][cell]['words']

                    for j, bb in enumerate([el['boundingBox'] for el in words_bb]):
                        if cord[0] in range(min(bb['p1'][0], bb['p3'][0]), max(bb['p1'][0], bb['p3'][0])) and \
                                cord[1] in range(min(bb['p1'][1], bb['p3'][1]), max(bb['p1'][1], bb['p3'][1])):

                            final_json['tables'][i + 1][cell]['words'][j]['azure_conf'] = conf
                            final_json['tables'][i + 1][cell]['words'][j]['style'] = style

                            update = True
                        #                            return True, final_json

                        else:
                            pass
                else:
                    pass
        else:
            pass

    if not update:
        return False, final_json
    else:
        return True, final_json


def manual_fill_flags_az(final_json):
    if len(final_json['paragraphs']) > 0:

        for i in range(len(final_json['paragraphs'])):
            for j, line in enumerate(final_json['paragraphs']['p_'
                                                              + str(i + 1)]):
                # j th line
                for k, d in enumerate(final_json['paragraphs']['p_' +
                                                               str(i + 1)][j]):
                    # k th word
                    if 'azure_conf' not in list(d.keys()):
                        final_json['paragraphs']['p_' + str(i + 1)][j][k]['azure_conf'] = 0.0
                        final_json['paragraphs']['p_' + str(i + 1)][j][k]['style'] = 'NA'
                    else:
                        pass

    if len(final_json['tables']) > 0:
        for i in range(len(final_json['tables'])):
            for cell in final_json['tables'][i + 1]:
                words = final_json['tables'][i + 1][cell]['words']

                for j, word in enumerate(words):
                    if 'azure_conf' not in list(word.keys()):
                        final_json['tables'][i + 1][cell]['words'][j]['azure_conf'] = 0.0
                        final_json['tables'][i + 1][cell]['words'][j]['style'] = 'NA'

                    else:
                        pass

    return final_json


###########   VISION  #####################################


def extract_polygons_from_response(response):  # 90
    polygons = []
    for page in response["full_text_annotation"]["pages"]:
        for block in page["blocks"]:
            for paragraph in block["paragraphs"]:
                for word in paragraph["words"]:
                    word_text = ''.join([symbol["text"] for symbol in word["symbols"]])
                    try:
                        polygons.append(([
                                             word["bounding_box"]["vertices"][0]["x"],
                                             word["bounding_box"]["vertices"][0]["y"],
                                             word["bounding_box"]["vertices"][1]["x"],
                                             word["bounding_box"]["vertices"][1]["y"],
                                             word["bounding_box"]["vertices"][2]["x"],
                                             word["bounding_box"]["vertices"][2]["y"],
                                             word["bounding_box"]["vertices"][3]["x"],
                                             word["bounding_box"]["vertices"][3]["y"]], word_text, word["confidence"]))
                    except:
                        pass
    return polygons


def check_gv_word_in_azure(gv_info, azure_info):
    poly_coordinates = [tuple(azure_info["boundingBox"]["p1"]),
                        (azure_info["boundingBox"]["p3"][0], azure_info["boundingBox"]["p1"][1]),
                        tuple(azure_info["boundingBox"]["p3"]),
                        (azure_info["boundingBox"]["p1"][0], azure_info["boundingBox"]["p3"][1])]
    point_coordinates = (int((gv_info[0] + gv_info[2]) / 2),
                         int((gv_info[1] + gv_info[5]) / 2))
    point = Point(point_coordinates)
    polygon = Polygon(poly_coordinates)
    #    print(polygon.contains(point))
    return polygon.contains(point)


def add_gv_conf_text(text_json, data):
    gv_polygons_response = extract_polygons_from_response(text_json)

    if len(data['paragraphs']) > 0:
        for para in data["paragraphs"]:
            #    print(data["paragraphs"][para])
            for word in data["paragraphs"][para]:
                for ind_word in word:
                    word_update = False
                    for gv_word in gv_polygons_response:
                        if check_gv_word_in_azure(gv_word[0], ind_word):
                            ind_word.update({"gv_text": gv_word[1], "gv_conf": gv_word[2]})
                            word_update = True
                    if word_update == False:
                        ind_word.update({"gv_text": "", "gv_conf": 0})

    if len(data['tables']) > 0:
        for table in data["tables"]:
            for row in data["tables"][table]:
                for word in data["tables"][table][row]["words"]:
                    word_update = False
                    for gv_word in gv_polygons_response:
                        if check_gv_word_in_azure(gv_word[0], word):
                            word.update({"gv_text": gv_word[1], "gv_conf": gv_word[2]})
                            word_update = True
                    if word_update == False:
                        word.update({"gv_text": "", "gv_conf": 0})

    return data


# img_path = '/home/user/ITE/ITE_APP_DEV/02 (1)_page_25.png'
# final_json_az_gv = add_gv_conf_text(img_path,final_json_az)

###############  ENSEMBLE JSON


def ensemble_final_json(final_json):
    ensemble_json = final_json.copy()

    if 'paragraphs' in final_json.keys():
        for i in range(len(final_json['paragraphs'])):
            for j, line in enumerate(
                    final_json['paragraphs']['p_' + str(i + 1)]):

                for k, word in enumerate(line):
                    try:
                        if (word['azure_conf'] > word['gv_conf']) and word['style'] != 'print':
                            pass
                        else:
                            text = final_json['paragraphs']['p_' + str(i + 1)][j][k]['gv_text']
                            ensemble_json['paragraphs']['p_' + str(i + 1)][j][k]['text'] = text
                    except:
                        print('## Exception in para: ', 'p_' + str(i + 1))
                        print('**', word, '\n')

    else:
        pass

    if 'tables' in final_json.keys():
        for i in final_json['tables']:
            #            print(i)
            for cell in final_json['tables'][i]:

                for j, word in enumerate(
                        final_json['tables'][i][cell]['words']):
                    try:
                        if (word['azure_conf'] > word['gv_conf']) and word['style'] != 'print':
                            pass
                        else:
                            text = final_json['tables'][i][cell]['words'][j]['gv_text']
                            ensemble_json['tables'][i][cell]['words'][j]['text'] = text

                    except Exception as e:
                        print(e)
                        print('## Exception in table number: ', i)
                        print('**', word, '\n')

    else:
        pass

    return ensemble_json


def ensemble_main(final_json, analysis, text_resp):
    final_json_az = add_azure_conf(final_json, analysis)
    final_json_az_gv = add_gv_conf_text(text_resp, final_json_az)
    ens_json = ensemble_final_json(final_json_az_gv)

    return ens_json
