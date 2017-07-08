from api.C3Chart.c3charts import C3Chart, ScatterChart, PieChart, DonutChart

# --------------------------------------------------------------------- Histogram Bin---------------------------------->


def manipulate_results_histogram_bins(output):
    bins = output['histogram']['bins']
    x_label = output['histogram']['column_name']
    y_label = 'num_records'
    x_axis = []
    y_axis = []

    for bin in bins:
        x_axis.append('<' + str(bin.get('end_value')))
        y_axis.append(bin.get('num_records'))

    x_axis = ['x'] + x_axis
    y_axis = [y_label] + y_axis
    chart_data = [x_axis, y_axis]
    c3 = C3Chart(data=chart_data, chart_type='bar', data_type='columns')
    c3.set_all_basics()
    c3.set_axis_label_text(y_label='num_records', x_label=x_label)
    output['histogram_chart'] = c3.get_json()
    output['yformat'] = 'm'
    return output


# ------------------------------------------------------------------- Trend Narrative---------------------------------->

def manipulate_trend_narrative_card1_chart_format(output):
    card = output.get('narratives').get('card1').get('chart').get('data')
    chart_data = convert_json_to_column_data(card)
    c3 = C3Chart(data=chart_data, x_column_name='key')
    c3.set_all_basics()
    # c3.set_x_axis(column_name='key')
    c3.set_axis_label_text(x_label='Time Period', y_label='ONLINE_SPEND')
    output['narratives']['card1']['chart_c3'] = c3.get_json()
    output['narratives']['card1']['yformat'] = 'm'
    return output


def manipulate_trend_narrative_card3_chart_format(output):
    card = output.get('narratives').get('card3').get('chart').get('data')
    c3 = C3Chart(data=card, x_column_name='key', data_type='json')
    c3.set_all_basics()
    c3.set_axis_label_text(x_label='Time Period', y_label='ONLINE_SPEND')
    output['narratives']['card3']['chart_c3'] = c3.get_json()
    output['narratives']['card3']['yformat'] = 'm'
    return output


# --------------------------------------------------------------------Dimension Narrative------------------------------>

def manipulate_dimensions_narratives_main_card_charts_effect_size_data(output):
    # dimensions.narratives.main_card.charts.effect_size.data
    card = output.get('narratives').get('main_card').get('charts').get('effect_size').get('data')
    labels = output.get('narratives').get('main_card').get('charts').get('effect_size').get('labels')
    card = convert_single_json_object_into_column_data(card)
    c3 = C3Chart(data=card, x_column_name='x', data_type='columns', chart_type='bar')
    c3.set_all_basics()
    c3.rotate_axis()
    c3.set_axis_label_text(y_label=labels.get('Dimension'), x_label='Dimension')
    output['narratives']['main_card']['charts']['effect_size']['chart_c3'] = c3.get_json()
    output['narratives']['main_card']['charts']['effect_size']['yformat'] = 'm'
    return output


def manipulate_dimensions_narratives_cards_for_each_card1_charts_group_by_total_data(output):
    for index, data in enumerate(output.get('narratives').get('cards')):
        card1 = data.get('card1').get('charts').get('group_by_total').get('data')
        card2 = data.get('card1').get('charts').get('group_by_mean').get('data')
        labels = data.get('card1').get('charts').get('group_by_mean').get('labels')

        card1 = convert_single_json_object_into_column_data(card1)
        card2 = convert_single_json_object_into_column_data(card2)
        card2[1][0] = 'y2'
        card1.append(card2[1])
        c3 = C3Chart(data=card1, x_column_name='x', data_type='columns', chart_type='bar')
        c3.set_all_basics()
        c3.set_another_y_axis('y2')
        c3.set_d3_format_y2()
        c3._set_title(title=data.get('card1').get('heading'))
        c3.set_axis_label_text(x_label=labels.keys()[0],
                               y_label=labels[labels.keys()[0]],
                               y2_label='Average Spend'
                               )
        output['narratives']['cards'][index]['card1']['chart_c3'] = c3.get_json()
        output['narratives']['cards'][index]['card1']['yformat'] = 'm'
        output['narratives']['cards'][index]['card1']['y2format'] = 'm'

        card2 = data.get('card2').get('charts').get('trend_chart').get('data_c3')
        c3 = C3Chart(data=card2, x_column_name='Time Period', data_type='columns', chart_type='line')
        c3.set_all_basics()
        c3.set_axis_label_text(x_label='Time Period', y_label='ONLINE_SPEND')
        output['narratives']['cards'][index]['card2']['chart_c3'] = c3.get_json()
        output['narratives']['cards'][index]['card2']['yformat'] = 'm'

        # anova scatter
        card3 = data.get('card3').get('charts').get('decision_matrix').get('data_c3')
        card3_data, xs = convert_column_data_with_array_of_category_into_column_data_stright_xy(card3, 3)
        c3 = ScatterChart(data=card3_data, x_column_name='Share', data_type='columns')
        c3.set_xs(xs)
        c3.set_axis_label_text(x_label=card3[0][0], y_label=card3[1][0])
        c3.set_x_type_as_index()
        c3.add_tooltip_for_scatter()
        c3.set_axis_label_text(x_label=card3[0][0], y_label=card3[1][0])
        output['narratives']['cards'][index]['card3']['chart_c3'] = c3.get_json()
        output['narratives']['cards'][index]['card3']['yformat'] = 'm'
        output['narratives']['cards'][index]['card3']['tooltip_c3'] = [card3[0], card3[1], card3[2]]
    return output


# --------------------------------------------------------------------- measure narrative changes---------------------->


def manipulate_measures_narratives_main_card_chart_data(output):
    data = output.get('main_card').get('chart').get('data')
    label = output.get('main_card').get('chart').get('label')
    title = output.get('main_card').get('header')
    data = add_x_and_y_at_start(data)
    c3 = C3Chart(data=data, chart_type='bar')
    c3.special_bar_chart()
    # c3.set_axis_label_text(x_label=label.get('x'), y_label=label.get('y'))
    c3.set_axis_label_text(x_label='Measure', y_label='ONLINE SPEND')
    c3._set_title(title=title)
    output['main_card']['chart_c3'] = c3.get_json()
    output['main_card']['yformat'] = 'f'
    output['main_card']['colorformat'] = 'set_negative_color'
    return output


def manipulate_measures_narratives_cards_data(output):
    for index, data in enumerate(output.get('cards')):

        card0_charts_2 = data.get('card0').get('charts').get('chart2').get('data')
        x_name = card0_charts_2[0][0]
        # card0_charts_2 = [card0_charts_2[0],card0_charts_2[1]]
        card0_charts_2, xs = convert_column_data_with_array_of_category_into_column_data_stright_xy(card0_charts_2, 2)
        c3 = ScatterChart(data=card0_charts_2, x_column_name=x_name, data_type='columns')
        c3.set_xs(xs)
        # c3.set_axis_label_text(x_label=card0_charts_2[0][0], y_label=card0_charts_2[1][0])
        c3.set_axis_label_text(x_label='ONLINE_SPEND', y_label='AVERAGE_BALANCE')
        c3.set_x_type_as_index()
        c3.hide_basic_legends()
        output['cards'][index]['card0']['chart_c3'] = c3.get_json()
        output['cards'][index]['card0']['yformat'] = 'm'

        card2_charts_data = data.get('card2').get('charts').get('data')
        c3 = C3Chart(data=card2_charts_data)
        c3.set_all_basics()
        c3.set_another_y_axis('ONLINE_SPEND')
        c3.set_d3_format_y2()
        # c3.set_axis_label_text(x_label=card0_charts_2[0][0], y_label=card0_charts_2[1][0])
        c3.set_axis_label_text(x_label='Time Period',
                               y2_label='ONLINE SPEND',
                               y_label='AVERAGE_BALANCE')
        output['cards'][index]['card2']['chart_c3'] = c3.get_json()
        output['cards'][index]['card2']['yformat'] = 'm'
        output['cards'][index]['card2']['y2format'] = 'm'

        card3_charts_data = data.get('card3').get('charts').get('data')
        x_name = card3_charts_data[0][0]
        card3_charts_data, xs = convert_column_data_with_array_of_category_into_column_data_stright_xy(card3_charts_data, 2)
        c3 = ScatterChart(data=card3_charts_data, x_column_name=x_name, data_type='columns')
        c3.set_xs(xs)
        # c3.set_axis_label_text(x_label=card3_charts_data[0][0], y_label=card3_charts_data[1][0])
        c3.set_axis_label_text(x_label='ONLINE_SPEND', y_label='AVERAGE_BALANCE')
        c3.set_x_type_as_index()
        output['cards'][index]['card3']['chart_c3'] = c3.get_json()
        output['cards'][index]['card3']['yformat'] = 'm'
    return output


# ---------------------------------------------------dimension flow---------------------------------------------------->

def get_frequency_results_changes(result):
    result = convert_individual_data_to_just_xy(result)
    c3 = C3Chart(data=result, chart_type='bar')
    c3.set_all_basics()
    c3.hide_basic_legends()

    return {
        'chart_c3': c3.get_json(),
        'yformat': 'm'
    }


def get_chisquare_narratives_narratives_top5_result_changes(output):
    final_array = [['x'],['y']]
    for d in output:
        final_array[0].append(d.get('dimension'))
        final_array[1].append(d.get('effect_size'))

    c3 = C3Chart(data=final_array, chart_type='bar')
    c3.set_all_basics()
    c3.rotate_axis()
    c3.hide_basic_legends()

    return {
        'chart_c3': c3.get_json(),
        'yformat': 'f'
    }

# ---------------------------------------------------Robo         ---------------------------------------------------->


def manipulate_result_snapshot_sector_and_class(data):
    sector = data['sector']
    sector = convert_individual_data_to_just_xy(sector, add_first_name=False)
    c3 = C3Chart(data=sector, chart_type='bar', x_column_name=sector[0][0])
    c3.set_all_basics()
    c3.rotate_axis()
    c3.hide_basic_legends()
    data['chart_c3'] = c3.get_json()
    data['yformat'] = 'm'

    class_data = data['class']['values']
    class_data = convert_single_json_data_into_multiple_column_data(class_data)
    c3 = PieChart(data=class_data)
    c3.set_all_basics()
    data['pie_c3'] = c3.get_json()
    data['pieformat'] = 'set_pie_labels'
    data['pielabelformat'] = 'm'

    return data


def manipulate_result_portfolio_performance_gchart(data):

    data, x_column_name = convert_row_data_to_column_data(data)
    c3 = C3Chart(data=data, x_column_name=x_column_name)
    c3.set_all_basics()
    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'm'
    }
    return final_data


def manipulate_result_portfolio_performance(data):
    data, xs = convert_json_with_list_to_column_data_for_xs(data)
    c3 = C3Chart(data=data, x_column_name=data[0][0])
    c3.set_all_basics()
    c3.set_xs(xs)
    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'm'
    }
    return final_data


def manipulate_result_sector_performance_sector_data(data):
    final_data = []
    for d in data.keys():
        final_data.append([d, data[d].get('allocation')])

    c3 = DonutChart(data=final_data)
    c3.set_all_basics()
    c3.remove_x_from_data()

    final_data = {
        'chart_c3': c3.get_json(),
        'donutformat': 'set_donut_labels',
        'donutlabelformat': 'm'
    }

    return final_data


def manipulate_result_sector_performace_color(data):
    # import pdb;pdb.set_trace()
    data, xs = convert_array_type_data_to_column_data_xs(data)

    c3 = C3Chart(data=data, chart_type='bar')
    c3.set_all_basics()
    c3.set_xs(xs)

    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'm'
    }
    return final_data


# ---------------------------------------------------Model/Trainer ---------------------------------------------------->


def manipulate_trainer_results_feature(data):
    c3 = C3Chart(data=data, chart_type='bar', x_column_name='Name')
    c3.set_all_basics()
    c3.hide_subchart()
    c3.rotate_axis()

    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'f'
    }

    return final_data


def manipulate_trainer_results_data_precision_recall_stats(data):
    data = convert_json_to_column_data(data)
    c3 = C3Chart(data=data, x_column_name='class', chart_type='bar')
    c3.set_all_basics()

    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'f'
    }
    return final_data


# ---------------------------------------------------Score  ----------------------------------------------------------->


def manipulate_score_results_data_prediction_split(data):
    c3 = C3Chart(data=data, x_column_name='Range', chart_type='bar')
    c3.set_all_basics()
    c3.add_groups_to_data([data[1][0], data[2][0]])

    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'f'
    }
    return final_data


def manipulate_score_results_data_feature_importance(data):

    c3 = C3Chart(data=data, chart_type='bar', x_column_name=data[0][0])
    c3.set_all_basics()
    c3.hide_subchart()
    c3.rotate_axis()

    final_data = {
        'chart_c3': c3.get_json(),
        'yformat': 'f'
    }

    return final_data


# ----------------> common utility function---------------------------------------------------------------------------->
# ----------------> common utility function---------------------------------------------------------------------------->
# ----------------> common utility function---------------------------------------------------------------------------->
# ----------------> common utility function---------------------------------------------------------------------------->


def convert_json_to_column_data(json_data):
    """

    :param json_data:
    :return:
    """
    # import pdb; pdb.set_trace()
    if not json_data or not json_data[0]:
        return []
    keys = json_data[0].keys()
    column_data = [[] for _ in range(len(keys))]
    item_index_dictionary = dict()
    for index, item in enumerate(keys):
        column_data[index].append(item)
        item_index_dictionary[item] = index

    for data in json_data:
        for item in data.keys():
            column_data[item_index_dictionary[item]].append(data[item])
    return column_data


def convert_single_json_object_into_column_data(json_data):
    """
    Converts a single json object in (x,y) array format
    :param json_data: = {
                            'a':'1',
                            'b':'2'
                        }
    :return: [
                ['x', 'a', 'b'],
                ['y', '1', '2']
            ]
    """
    keys = json_data.keys()
    x_axis = ['x'] + keys
    y_axis = ['y']
    for key in keys:
        y_axis += [json_data.get(key)]
    return [x_axis, y_axis]


def convert_single_json_data_into_multiple_column_data(json_data):
    """
    Converts a single json object in (x,y) array format
    :param json_data: = {
                            'a':'1',
                            'b':'2'
                        }
    :return: [
                ['x', '1'],
                ['y', '2']
            ]
    """
    final_data = []
    for key in json_data.keys():
        final_data.append([key, json_data.get(key)])
    return final_data

def convert_json_to_columns_data(json_data):

    data_y = json_data.get('ONLINE_SPEND growth')
    data_x = json_data.get('Share of ONLINE_SPEND')
    data_category = json_data.get('Category')
    data_AGE_CATEGORY = json_data.get('AGE_CATEGORY')

    keys = list(set(data_category))
    data_array = [[key] for key in keys]
    data_array_index = dict()
    for index, data in enumerate(data_array):
        data_array_index[data[0]] = index

    for index, key in enumerate(data_category):
        data_array[data_array_index[key]].append()


def get_all_unique_keys_from_json(json_data):

    keys = set()

    for data in json_data:
        keys = keys + set(data.keys())

    return keys


def convert_single_row_columns_data_to_multiplt_row_colums_data(column_data):
    final_column_data = [['x',]]
    row1 = column_data[0]
    for index, value in enumerate(row1):
        final_column_data.append([value,column_data[1][index]])
    return final_column_data


def add_x_and_y_at_start(column_data):
    column_data[0] = ['x'] + column_data[0]
    column_data[1] = ['y'] + column_data[1]
    return column_data


def convert_column_data_with_array_of_category_into_column_data_stright_xy(columns_data, category_data_index):
    def get_all_unique(category_data_list):
        return list(set(category_data_list))

    category_data_list = columns_data[category_data_index]
    try:
        color_naming_scheme = columns_data[3]
    except:
        color_naming_scheme = None

    if isinstance(color_naming_scheme, dict):
        pass
    elif isinstance(color_naming_scheme, list) or color_naming_scheme is None:

        color_naming_scheme = {
                        'red': 'Cluster0',
                        'blue': 'Cluster1',
                        'green': 'Cluster2',
                        'orange': 'Cluster3',
                        'yellow': 'Cluster4'
                    }

    unique_category_name = get_all_unique(category_data_list)

    end_data = []
    name_indexs = dict()
    xs = dict()

    i = 0
    for name in unique_category_name:
        if name == columns_data[category_data_index][0]:
            continue

        name_x = name
        try:
            name_y = color_naming_scheme[name_x]
        except:
            name_y = name + '_'

        end_data.append([name_x])
        name_indexs[name_x] = i
        i += 1

        end_data.append([name_y])
        name_indexs[name_y] = i
        i += 1

        xs[name_y] = name_x

    for index, name in enumerate(columns_data[category_data_index][1:]):
        name_x = name
        try:
            name_y = color_naming_scheme[name_x]
        except:
            name_y = name + '_'

        end_data[name_indexs[name_x]].append(columns_data[0][index + 1])
        end_data[name_indexs[name_y]].append(columns_data[1][index + 1])

    return end_data, xs


def convert_individual_data_to_just_xy(output, add_first_name=True):
    """
     [
            [
                "Large Blend",
                14
            ],
            [
                "Large Growth",
                11
            ],
            [
                "Intermediate-Term Bond",
                9
            ],
    ]

    to

    [
        ['x', "Large Blend", "Large Growth", "Intermediate-Term Bond"],
        ['y', 14, 11, 9]
    ]
    :return:
    """
    # import pdb; pdb.set_trace()

    if add_first_name is True:
        final_output = [['x'], ['y']]
    else:
        final_output = [[], []]

    for data in output:
        final_output[0].append(data[0])
        final_output[1].append(data[1])
    return final_output


def convert_row_data_to_column_data(row_data):
    # import pdb; pdb.set_trace()
    if len(row_data) < 1:
        return []

    header_ = row_data[0]

    final_data = []
    for index, head in enumerate(header_):
        final_data.append([head])

    for data in row_data[1:]:
        for index, d in enumerate(data):
            final_data[index].append(d)
    return final_data, header_[0]

def convert_json_with_list_to_column_data_for_xs(data):
    """
    {
        'a' : [{
            'date':23,
            'value':5
        },
        {
            'date':24,
            'value':6
        }],
        'b' : [{
            'date':23,
            'value':4
        },
        {
            'date':24,
            'value':7
        }]
    }

    to

    [
        ['a_date', 23, 24],
        ['a', 5, 6],
        ['b_date', 23, 24],
        ['b', 4, 7]
    ]

    """
    # import pdb; pdb.set_trace()
    all_key = data.keys()

    final_data = []
    xs = {}
    mapp = {}
    i = 0
    for d in all_key:
        final_data.append([d + '_x'])
        final_data.append([d])

        xs[d] = d + '_x'

        mapp[d + '_x'] = i
        i += 1
        mapp[d] = i
        i += 1

    # import pdb;pdb.set_trace()
    for d in data.keys():
        array_of_json = data[d]
        x_index = mapp[d + '_x']
        y_index = mapp[d]
        for snip in array_of_json:
            final_data[x_index].append(snip.get('date'))
            final_data[y_index].append(snip.get('val'))

    return final_data, xs


def convert_array_type_data_to_column_data_xs(data):
    data = data[1:]
    final_data = [['blue'],['blue_x'],['red'], ['red_x'], ['green'], ['green_x']]

    xs = {
        'blue': 'blue_x',
        'red': 'red_x',
        'green': 'green_x'
    }

    mapp = {
        'blue': 0,
        'blue_x': 1,
        'red': 2,
        'red_x': 3,
        'green': 4,
        'green_x': 5
    }

    for d in data:
        final_data[mapp[d[2].lower()]].append(d[1])
        final_data[mapp[d[2].lower()+'_x']].append(d[0])

    change_name = {
        'blue': 'outperform',
        'red': 'underperform',
        'green': 'constant',
        'blue_x': 'outperform_x',
        'red_x': 'underperform_x',
        'green_x': 'constant_x'
    }

    end_name_xs = {
        'outperform': 'outperform_x',
        'constant': 'constant_x',
        'underperform': 'underperform_x',
    }

    for d in final_data:
        d[0] = change_name[d[0]]


    return final_data, end_name_xs