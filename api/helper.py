from django.conf import settings
JOBSERVER = settings.JOBSERVER
THIS_SERVER_DETAILS = settings.THIS_SERVER_DETAILS


class JobserverDetails(object):
    @classmethod
    def get_jobserver_url(cls):
        return "http://" + JOBSERVER.get('host') + ":" + JOBSERVER.get('port')

    @classmethod
    def get_app(cls):
        return JOBSERVER.get('app-name')

    @classmethod
    def get_context(cls):
        return JOBSERVER.get('context')

    @classmethod
    def get_class_path(cls, name):
        if name not in JOBSERVER:
            raise Exception('No such class.')
        return JOBSERVER.get(name)

    @classmethod
    def get_config(cls,
                   slug,
                   class_name,
                   job_name=None
                   ):

        job_type = {
            "metadata": "metaData",
            "master": "story",
            "model":"training",
            "score": "prediction",
            "robo": "robo"
        }

        return {
            "job_config": {
                "job_type": job_type[class_name],
                "job_url" : "http://{0}:{1}/api/job/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                    THIS_SERVER_DETAILS.get('port'),
                                                                    slug),
                "job_name": job_name,
                "get_config" :
                    {
                        "action" : "get_config" ,
                        "method" : "GET"
                    },
                "set_result" :

                    {
                        "action" : "result",
                        "method"  : "PUT"
                    }
            }
        }

    @classmethod
    def print_job_details(cls, job):
        job_url = "{0}/jobs/{1}".format(cls.get_jobserver_url(), job.jobId)
        print "job_url: {0}".format(job_url)
        return job_url


def metadata_chart_conversion(data):
    output = {
      "data": {
          "columns": [
              [],
          ],
          "type": "bar",
      },
      "bar": {
          "width": {
              "ratio": 0.5
          }
      },
      "legend": {
          "show": False
      },
        "color":{
            "pattern": ['#0fc4b5' , '#005662', '#148071' , '#6cba86' , '#bcf3a2']
        }
    }
    values = ["data1"]
    for obj in data:
        values.append(obj["value"])
    output["data"]["columns"] = [values]

    return output


def find_chart_data_and_replace_with_chart_data(data):
    output = metadata_chart_conversion(data)
    return output

chartData = {
        "data": {
            "columns": [
            ["data1", 30, 200, 100, 400, 150, 250],
            ["data2", 130, 100, 140, 200, 150, 50]
            ],
            "type": "bar",
        },
        "bar": {
            "width": {
            "ratio": 0.5
        },
        "color":{
            "pattern": ['#0fc4b5' , '#005662', '#148071' , '#6cba86' , '#bcf3a2']
        }
    },
}


def decode_and_convert_chart_raw_data(data):
    if not check_chart_data_format(data):
        return {}
    from api.C3Chart.c3charts import C3Chart, ScatterChart, DonutChart, PieChart
    chart_type = data['chart_type']
    axes = data['axes']
    label_text = data['label_text']
    legend = data['legend']
    types = data.get('types', None)
    axisRotation = data.get('axisRotation', None)
    yAxisNumberFormat = data.get('yAxisNumberFormat', None)
    y2AxisNumberFormat = data.get('y2AxisNumberFormat', None)
    showLegend = data.get('show_legend', True)
    hide_xtick = data.get('hide_xtick', False)
    if y2AxisNumberFormat == "":
        y2AxisNumberFormat = ".2s"
    subchart = data.get('subchart', True)
    rotate = data.get('rotate', False)

    print "legend ------->> --------"
    print legend
    c3_chart_details = dict()

    if chart_type in ["bar", "line", "spline"]:
        chart_data = replace_chart_data(data['data'])
        c3_chart_details['table_c3'] = chart_data
        c3 = C3Chart(
            data=chart_data,
            chart_type=chart_type,
            x_column_name=axes.get('x', 'key')
        )
        c3.set_all_basics()

        if axes.get('y', None) is not None:
            c3.set_y_axis(
                y_name=axes.get('y')
            )
            if yAxisNumberFormat is not None:
                c3_chart_details["yformat"] = yAxisNumberFormat
            else:
                c3_chart_details["yformat"] = '.2s'

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

            if y2AxisNumberFormat is not None:
                c3_chart_details["y2format"] = y2AxisNumberFormat
            else:
                c3_chart_details["y2format"] = '.2s'
            c3.set_d3_format_y2(c3_chart_details["y2format"])

        c3.set_axis_label_simple(
            label_text=label_text
        )

        if subchart is False:
            c3.hide_subchart()
        if showLegend is True and legend:
            c3.set_name_to_data(legend)
        else:
            c3.hide_basic_legends()

        if rotate is True:
            c3.rotate_axis()

        xdata = get_x_column_from_chart_data_without_xs(chart_data, axes)
        if len(xdata) > 1:
            c3_chart_details["xdata"] = get_x_column_from_chart_data_without_xs(chart_data, axes)
            c3.set_tick_format_x()
            c3.set_tooltip_format()

        if hide_xtick is True:
            c3.hide_x_tick()

        c3_chart_details["chart_c3"] = c3.get_json()

        return c3_chart_details

    elif chart_type in ["combination"]:

        chart_data = replace_chart_data(data['data'])
        c3_chart_details['table_c3'] = chart_data

        c3 = C3Chart(
            data=chart_data,
            chart_type=chart_type,
            x_column_name=axes.get('x', 'key')
        )
        c3.set_all_basics()

        if axes.get('y', None) is not None:
            c3.set_y_axis(
                y_name=axes.get('y')
            )
            if yAxisNumberFormat is not None:
                c3_chart_details["yformat"] = yAxisNumberFormat
            else:
                c3_chart_details["yformat"] = '.2s'

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

            if y2AxisNumberFormat is not None:
                c3_chart_details["y2format"] = y2AxisNumberFormat
            else:
                c3_chart_details["y2format"] = '.2s'
            c3.set_d3_format_y2(c3_chart_details["y2format"])

        c3.set_axis_label_simple(
            label_text=label_text
        )

        if types:
            c3.add_new_chart_on_a_data_list(types)

        if axisRotation:
            c3.rotate_axis()

        if hide_xtick is True:
            c3.hide_x_tick()

        if showLegend is True and legend:
            c3.set_name_to_data(legend)
        else:
            c3.hide_basic_legends()

        xdata = get_x_column_from_chart_data_without_xs(chart_data, axes)
        if len(xdata) > 1:
            c3_chart_details["xdata"] = get_x_column_from_chart_data_without_xs(chart_data, axes)
            c3.set_tick_format_x()
            c3.set_tooltip_format()

        from api.C3Chart import config
        c3.set_basic_color_pattern(config.SECOND_FLIP_PATTERN)

        if subchart is False:
            c3.hide_subchart()

        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ["scatter"]:
        data_c3 = data['data']
        chart_data, xs = replace_chart_data(data_c3, data['axes'])
        c3_chart_details['table_c3'] = chart_data

        c3 = ScatterChart(
            data=chart_data,
            data_type='columns'
        )
        c3.set_xs(xs)

        c3.set_axis_label_simple(
            label_text=label_text
        )

        if axes.get('y', None) is not None:
            c3.set_y_axis(
                y_name=axes.get('y')
            )
            if yAxisNumberFormat is not None:
                c3_chart_details["yformat"] = yAxisNumberFormat
            else:
                c3_chart_details["yformat"] = '.2s'
        c3_chart_details["yformat"] = '.2s'

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

            if y2AxisNumberFormat is not None:
                c3_chart_details["y2format"] = y2AxisNumberFormat
            else:
                c3_chart_details["y2format"] = '.2s'
            c3.set_d3_format_y2(c3_chart_details["y2format"])

        if subchart is False:
            c3.hide_subchart()

        if showLegend is True and legend:
            c3.set_name_to_data(legend)
        else:
            c3.hide_basic_legends()

        c3.set_x_type_as_index()

        if hide_xtick is True:
            c3.hide_x_tick()

        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ["scatter_line", "scatter_bar"]:
        data_c3 = data['data']
        chart_data, xs = replace_chart_data(data_c3, data['axes'])

        c3_chart_details['table_c3'] =  chart_data
        c3 = ScatterChart(
            data=chart_data,
            data_type='columns'
        )
        c3.set_xs(xs)

        c3.set_axis_label_simple(
            label_text=label_text
        )

        if chart_type == "scatter_line":
            c3.set_line_chart()
        elif chart_type == "scatter_bar":
            c3.set_bar_chart()

        if axes.get('y', None) is not None:
            c3.set_y_axis(
                y_name=axes.get('y')
            )
            if yAxisNumberFormat is not None:
                c3_chart_details["yformat"] = yAxisNumberFormat
            else:
                c3_chart_details["yformat"] = '.2s'
        c3_chart_details["yformat"] = '.2s'

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

            if y2AxisNumberFormat is not None:
                c3_chart_details["y2format"] = y2AxisNumberFormat
            else:
                c3_chart_details["y2format"] = '.2s'
            c3.set_d3_format_y2(c3_chart_details["y2format"])

        if subchart is False:
            c3.hide_subchart()

        if showLegend is True and legend:
            c3.set_name_to_data(legend)
        else:
            c3.hide_basic_legends()

        if hide_xtick is True:
            c3.hide_x_tick()

        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ['scatter_tooltip']:
        # take from old code. tooltip related with scatter. easier to get this data
        data_c3 = data['data']
        card3_data, xs = convert_column_data_with_array_of_category_into_column_data_stright_xy(data_c3, 3)
        c3_chart_details['table_c3'] = data_c3

        c3 = ScatterChart(
            data=card3_data,
            data_type='columns'
        )
        c3.set_xs(xs)

        c3.set_axis_label_simple(
            label_text=label_text
        )

        c3.set_x_type_as_index()

        c3.add_tooltip_for_scatter()

        if axes.get('y', None) is not None:
            c3.set_y_axis(
                y_name=axes.get('y')
            )
            if yAxisNumberFormat is not None:
                c3_chart_details["yformat"] = yAxisNumberFormat
            else:
                c3_chart_details["yformat"] = '.2s'
        c3_chart_details["yformat"] = '.2s'

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

            if y2AxisNumberFormat is not None:
                c3_chart_details["y2format"] = y2AxisNumberFormat
            else:
                c3_chart_details["y2format"] = '.2s'
            c3.set_d3_format_y2(c3_chart_details["y2format"])

        if subchart is False:
            c3.hide_subchart()

        if showLegend is True and legend:
            c3.set_name_to_data(legend)
        else:
            c3.hide_basic_legends()

        if hide_xtick is True:
            c3.hide_x_tick()

        c3_chart_details["chart_c3"] = c3.get_json()
        c3_chart_details["tooltip_c3"] = [data_c3[0], data_c3[1], data_c3[2]]
        return c3_chart_details
    elif chart_type in ['donut']:
        chart_data = replace_chart_data(data['data'])
        pie_chart_data = convert_chart_data_to_pie_chart(chart_data)
        c3 = DonutChart(data=pie_chart_data)
        c3.set_all_basics()
        c3.remove_x_from_data()

        c3_chart_details['table_c3'] = pie_chart_data
        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ['pie']:
        chart_data = replace_chart_data(data['data'])
        pie_chart_data = convert_chart_data_to_pie_chart(chart_data)
        c3 = PieChart(data=pie_chart_data)
        c3.set_all_basics()

        c3_chart_details['table_c3'] = pie_chart_data
        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details



def replace_chart_data(data, axes=None):
    if isinstance(data, list):
        return convert_listed_dict_objects(data)
    elif isinstance(data, dict):
        return dict_to_list(data, axes)


def convert_chart_data_to_pie_chart(chart_data):

    pie_chart_data = zip(*chart_data)
    pie_chart_data = map(list, pie_chart_data)
    return pie_chart_data[1:]


def get_slug(name):

    from django.template.defaultfilters import slugify
    import string
    import random
    slug = slugify(str(name) + "-" + ''.join(
                random.choice(string.ascii_uppercase + string.digits) for _ in range(10)))
    return slug


def check_chart_data_format(data):
    keys = ['data', 'axes', 'label_text', 'legend', 'chart_type', 'types', 'axisRotation']

    data_keys = data.keys()

    if len(set(keys) - set(data_keys)) < 1:
        return True
    return False


def convert_according_to_legend_simple(chart_data, legend):

    for data in chart_data:
        name = legend.get(data[0], None)
        if name is not None:
            data[0] = name

    return chart_data


def convert_listed_dict_objects(json_data):
    """
    :param_json_data:  [
                        {
                            "value": 100062.04,
                            "key": "Jan-1998"
                        },
                        {
                            "value": 125248,
                            "key": "Jan-1999"
                        },
                        {
                            "value": 708180.8600000001,
                            "key": "Aug-1999"
                        },
                        {
                            "value": 1048392.7300000001,
                            "key": "Sep-1999"
                        }
                    ]
    :return: [
        ['key', "Jan-1998", "Jan-1999", "Aug-1999", "Sep-1999"],
        ['value', 100062.04, 125248, 708180.8600000001, 1048392.7300000001]
    ]
    """
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

    for d in data.keys():
        array_of_json = data[d]
        x_index = mapp[d + '_x']
        y_index = mapp[d]
        for snip in array_of_json:
            final_data[x_index].append(snip.get('date'))
            final_data[y_index].append(snip.get('val'))

    return final_data, xs


def inv_axes(axes):
    """

    :param axes:
                {
                "x": "key",
                "y": "a",
                }
    :return: {'a': 'y', 'key': 'x'}
    """
    ax = dict()
    for key in axes:
        ax[axes[key]] = key
    return ax


def dict_to_list(datas, axes=None):
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
    ],

    {
        "a": "a_x",
        "b": "b_x"
    }

    :param datas:
    :param axes:
    :return:
    """
    ar = []
    xs = dict()
    if axes.get('x', None) is None:
        raise Exception("No x in axes.")
    inverted_axes = inv_axes(axes)
    for key in datas:
        chart_data = datas[key]
        convert_data = convert_listed_dict_objects(chart_data)
        x = ""
        y = ""
        for d in convert_data:
            if inverted_axes.get(d[0], None) == 'x':
                d[0] = key + '_x'
                x = key + '_x'
            else:
                d[0] = key
                y = key
        xs[y] = x
        ar += convert_data
    return ar, xs


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

def get_x_column_from_chart_data_without_xs(chart_data, axes):
    i = None
    for index, row in enumerate(chart_data):
        if row[0] == axes.get('x', 'key'):
            i = index
            break

    if i is not None:
        return chart_data[i][1:]
    else:
        return []


def get_jobserver_status(
        instance=None
):
    job_url = instance.job.url
    if instance.status in ['SUCCESS']:
        return instance.status
    try:
        live_status = return_status_of_job_log(job_url)
        instance.status = live_status
        instance.save()
        return live_status
    except Exception as err:
        return err


def return_status_of_job_log(job_url):
    import urllib, json
    final_status = "RUNNING"
    print job_url
    check_status = urllib.urlopen(job_url)
    data = json.loads(check_status.read())
    if data.get("status") == "FINISHED":
        final_status = data.get("status")
    elif data.get("status") == "ERROR" and "startTime" in data.keys():
        final_status = data.get("status")
    elif data.get("status") == "RUNNING":
        final_status = data.get("status")
    else:
        pass

    jobserver_status = settings.JOBSERVER_STATUS

    return jobserver_status.get(final_status)


def convert_json_object_into_list_of_object(datas, order_type='dataset'):
    from django.conf import settings
    order_dict = settings.ORDER_DICT
    analysis_list = settings.ANALYSIS_LIST
    order_by = order_dict[order_type]

    brief_name = settings.BRIEF_INFO_CONFIG

    list_of_objects = []
    for key in order_by:
        if key in datas:
            temp = dict()
            temp['name'] = key
            temp['displayName'] = brief_name[key]

            if key in ['analysis_list', 'analysis list']:
                temp['value'] = [analysis_list[item] for item in datas[key]]
            else:
                temp['value'] = datas[key]
            list_of_objects.append(temp)

    return list_of_objects







