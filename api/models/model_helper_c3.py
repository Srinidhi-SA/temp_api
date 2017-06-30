from api.c3charts import C3Chart


def manipulate_results_histogram_bins(output):
    bins = output['histogram']['bins']
    y_label = output['histogram']['column_name']
    x_axis = []
    y_axis = []

    for bin in bins:
        x_axis.append('<' + str(bin.get('end_value')))
        y_axis.append(bin.get('num_records'))

    x_axis = ['x'] + x_axis
    y_axis = [y_label] + y_axis
    chart_data = [x_axis, y_axis]
    chart_type = 'bar'

    c3 = C3Chart(data=chart_data, chart_type=chart_type)
    c3.set_all_basics()
    output['histogram_chart'] = c3.get_json()
    return output


def manipulate_trend_narrative_card1_chart_format(output):
    card = output.get('narratives').get('card1').get('chart').get('data')
    chart_data = convert_json_to_column_data(card)
    c3 = C3Chart(data=chart_data, x_column_name='key')
    c3.set_all_basics()
    c3.set_x_axis(column_name='key')
    output['narratives']['card1']['chart_c3'] = c3.get_json()
    return output


def manipulate_trend_narrative_card3_chart_format(output):
    card = output.get('narratives').get('card3').get('chart').get('data')
    # chart_data = convert_json_to_column_data(card)
    c3 = C3Chart(data=card, x_column_name='key')
    c3.set_all_basics()
    c3.set_x_axis(column_name='key')
    output['narratives']['card3']['chart_c3'] = c3.get_json()
    return output


def convert_json_to_column_data(json_data):
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


def get_all_unique_keys_from_json(json_data):

    keys = set()

    for data in json_data:
        keys = keys + set(data.keys())

    return keys
