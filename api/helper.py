import md5
import time
from math import floor, log10

from django.conf import settings
import yarn_api_client

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
                   job_name=None,
                   message_slug=None,
                   app_id=None
                   ):

        job_type = {
            "metadata": "metaData",
            "master": "story",
            "model":"training",
            "score": "prediction",
            "robo": "robo",
            "subSetting": "subSetting",
            "stockAdvisor": "stockAdvisor"
        }

        return {
            "job_config": {
                "job_type": job_type[class_name],
                "job_url" : "http://{0}:{1}/api/job/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                    THIS_SERVER_DETAILS.get('port'),
                                                                    slug),
                "message_url": "http://{0}:{1}/api/messages/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                THIS_SERVER_DETAILS.get('port'),
                                                                message_slug),
                "xml_url": "http://{0}:{1}/api/xml/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                THIS_SERVER_DETAILS.get('port'),
                                                                slug),
                "error_reporting_url": "http://{0}:{1}/api/set_job_report/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                THIS_SERVER_DETAILS.get('port'),
                                                                slug),
                "job_name": job_name,
                "app_id":app_id,
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


def remove_tooltip_format_from_chart_data(chart_data):

    if 'chart_c3' in chart_data:
        if 'tooltip' in chart_data['chart_c3']:
            del chart_data['chart_c3']['tooltip']
    return chart_data

def remove_chart_height_from_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "size" in chart_data['chart_c3']:
            del chart_data['chart_c3']['size']
    return chart_data

def remove_chart_height_from_x_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "axis" in chart_data['chart_c3']:
            if "x" in chart_data['chart_c3']["axis"]:
                if "height" in chart_data['chart_c3']["axis"]["x"]:
                    del chart_data['chart_c3']["axis"]["x"]["height"]
    return chart_data

def keep_bar_width_in_ratio(chart_data):
    count_x = 0
    if 'chart_c3' in chart_data:
        if 'data' in chart_data['chart_c3']:
            if 'columns' in chart_data['chart_c3']['data']:
                columns_data = chart_data['chart_c3']['data']['columns']
                count_x = len(columns_data[0])
        if 'bar' in chart_data['chart_c3']:
            if count_x < 5:
                chart_data['chart_c3']['bar'] = {
                    'width': 20
                }
            else:
                chart_data['chart_c3']['bar'] =  {
                                "width": {
                                    "ratio": 0.5
                                }
                            }
    return chart_data

def remove_padding_from_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "padding" in chart_data['chart_c3']:
            del chart_data['chart_c3']['padding']
    return chart_data

def add_side_padding_to_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        chart_data['chart_c3']['padding'] = {
            'right': 20
        }

    return chart_data

def remove_subchart_from_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "subchart" in chart_data['chart_c3']:
            del chart_data['chart_c3']['subchart']
    return chart_data

def remove_legend_from_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "legend" in chart_data['chart_c3']:
            del chart_data['chart_c3']['legend']
    return chart_data

def remove_grid_from_chart_data(chart_data):
    if 'chart_c3' in chart_data:
        if "grid" in chart_data['chart_c3']:
            del chart_data['chart_c3']['grid']
    return chart_data

def remove_xdata_from_chart_data(chart_data):
    if 'xdata' in chart_data:
        del chart_data['xdata']
    return chart_data

def limit_chart_data_length(chart_data, limit=None):
    if limit != None:
        if 'chart_c3' in chart_data:
            tempData = []
            if "columns" in chart_data["chart_c3"]["data"]:
                for row in chart_data["chart_c3"]["data"]["columns"]:
                    tempData.append(row[:limit+1])
                    chart_data["chart_c3"]["data"]["columns"] = tempData

    return chart_data


def decode_and_convert_chart_raw_data(data):
    if not check_chart_data_format(data):
        print "chart data format not matched"
        return {}
    from api.C3Chart.c3charts import C3Chart, ScatterChart, DonutChart, PieChart
    chart_type = data['chart_type']
    title = data.get('title', "None")
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
    print chart_type
    from api.models import SaveData
    sd = SaveData()
    sd.save()
    if chart_type in ["bar", "line", "spline"]:
        chart_data = replace_chart_data(data['data'])
        c3_chart_details['table_c3'] = put_x_axis_first_chart_data(chart_data, axes.get('x', 'key'))
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
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

        c3.add_additional_grid_line_at_zero()
        if chart_type=="bar":
            c3.remove_vertical_grid_from_chart_data()

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
        # c3.add_additional_grid_line_at_zero()

        c3_chart_details["chart_c3"] = c3.get_json()

        return c3_chart_details

    elif chart_type in ["combination"]:

        chart_data = replace_chart_data(data['data'])
        c3_chart_details['table_c3'] = put_x_axis_first_chart_data(chart_data, axes.get('x', 'key'))
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
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
        c3.add_additional_grid_line_at_zero()

        from api.C3Chart import config
        c3.set_basic_color_pattern(config.SECOND_FLIP_PATTERN)

        if subchart is False:
            c3.hide_subchart()
        # c3.add_additional_grid_line_at_zero()

        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ["scatter"]:
        data_c3 = data['data']
        chart_data, xs = replace_chart_data(data_c3, data['axes'])
        c3_chart_details['table_c3'] = chart_data
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
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
        # c3.add_additional_grid_line_at_zero()
        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ["scatter_line", "scatter_bar"]:
        data_c3 = data['data']
        chart_data, xs = replace_chart_data(data_c3, data['axes'])

        c3_chart_details['table_c3'] =  chart_data
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
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
        # c3.add_additional_grid_line_at_zero()
        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details

    elif chart_type in ['scatter_tooltip']:
        # take from old code. tooltip related with scatter. easier to get this data
        data_c3 = data['data']
        card3_data, xs = convert_column_data_with_array_of_category_into_column_data_stright_xy(data_c3, 3)
        c3_chart_details['table_c3'] = data_c3
        sd.set_data(data=data_c3)
        c3_chart_details['download_url'] = sd.get_url()
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
        # c3.add_additional_grid_line_at_zero()
        c3_chart_details["chart_c3"] = c3.get_json()
        c3_chart_details["tooltip_c3"] = format_tooltip_data([data_c3[0], data_c3[1], data_c3[2]])
        return c3_chart_details
    elif chart_type in ['donut']:
        chart_data = replace_chart_data(data['data'])
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
        # pie_chart_data = convert_chart_data_to_pie_chart(chart_data)
        pie_chart_data = chart_data
        c3 = DonutChart(data=pie_chart_data,title=title,yAxisNumberFormat=yAxisNumberFormat)
        c3.set_all_basics()

        #c3.show_basic_legends()
        c3.show_legends_at_right()

        #c3.hide_basic_legends()

        if yAxisNumberFormat is not None:
            c3_chart_details["yformat"] = yAxisNumberFormat
        else:
            c3_chart_details["yformat"] = '.2s'

        c3.set_d3_format_y(c3_chart_details["yformat"])
        c3.set_basic_tooltip()
        c3.set_tooltip_format('.2s')
        c3.remove_x_from_data()
        c3.add_tooltip_for_donut()
        if len(chart_data) >= 1:
            name_list = [i[0] for i in chart_data]
            from api.C3Chart.config import PATTERN1
            color_list = PATTERN1
            length = len(name_list)
            c3_chart_details["legend_data"] = [{'name':name_list[i], 'color':color_list[i]} for i in range(length)]

        c3_chart_details['table_c3'] = pie_chart_data
        c3_chart_details["chart_c3"] = c3.get_json()
        print "final donut object",c3_chart_details

        return c3_chart_details

    elif chart_type in ['pie']:
        chart_data = replace_chart_data(data['data'])
        #pie_chart_data = convert_chart_data_to_pie_chart(chart_data)
        pie_chart_data = chart_data
        sd.set_data(data=chart_data)
        c3_chart_details['download_url'] = sd.get_url()
        c3 = PieChart(data=pie_chart_data,title=title,yAxisNumberFormat=yAxisNumberFormat)
        c3.set_all_basics()
        c3.show_basic_legends()
        if yAxisNumberFormat is not None:
            c3_chart_details["yformat"] = yAxisNumberFormat
        else:
            c3_chart_details["yformat"] = '.2s'
        c3.set_d3_format_y(c3_chart_details["yformat"])
        c3.set_basic_tooltip()
        c3.set_tooltip_format('.2s')
        c3.remove_x_from_data()
        c3.add_tooltip_for_pie()

        c3_chart_details['table_c3'] = pie_chart_data
        c3_chart_details["chart_c3"] = c3.get_json()
        return c3_chart_details


def replace_chart_data(data, axes=None):
    if isinstance(data, list):
        return convert_listed_dict_objects(data)
    elif isinstance(data, dict):
        return dict_to_list(data, axes)


def convert_chart_data_to_pie_chart(chart_data):
    print "chart_data",chart_data
    pie_chart_data = zip(*chart_data)
    print pie_chart_data
    pie_chart_data = map(list, pie_chart_data)
    print pie_chart_data
    return pie_chart_data[1:]

def put_x_axis_first_chart_data(chart_data, x_column=None):
    import copy
    chart_data = copy.deepcopy(chart_data)
    if x_column is None:
        return chart_data
    index = 0
    i = 0
    for data in chart_data:
        if data[0] == x_column:
            index = i
            break
        i += 1

    if index == 0:
        return chart_data
    else:
        temp = chart_data[index]
        chart_data[index] = chart_data[0]
        chart_data[0] = temp

    return chart_data





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

        # name_x = name
        name_x = name + '_'
        try:
            name_y = color_naming_scheme[name_x]
        except:
            # name_y = name + '_'
            name_y = name

        end_data.append([name_x])
        name_indexs[name_x] = i
        i += 1

        end_data.append([name_y])
        name_indexs[name_y] = i
        i += 1

        xs[name_y] = name_x

    for index, name in enumerate(columns_data[category_data_index][1:]):
        # name_x = name
        name_x = name + '_'
        try:
            name_y = color_naming_scheme[name_x]
        except:
            # name_y = name + '_'
            name_y = name

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


from celery.decorators import task


def get_db_object(model_name, model_slug):
    from django.apps import apps
    mymodel = apps.get_model('api', model_name)
    obj = mymodel.objects.get(slug=model_slug)
    return obj


@task(name='get_job_from_yarn')
def get_job_from_yarn(model_name=None,model_slug=None):

    model_instance = get_db_object(model_name=model_name,
                                   model_slug=model_slug
                                   )

    try:
        ym = yarn_api_client.resource_manager.ResourceManager(address=settings.YARN.get("host"),
                                                              port=settings.YARN.get("port"),
                                                              timeout=settings.YARN.get("timeout"))
        app_status = ym.cluster_application(model_instance.job.url)
        YarnApplicationState = app_status.data['app']["state"]

    except:
        YarnApplicationState = "FAILED"

    readable_live_status = settings.YARN_STATUS.get(YarnApplicationState, "FAILED")
    model_instance.job.status = YarnApplicationState
    model_instance.job.save()

    if readable_live_status is 'SUCCESS' and model_instance.analysis_done is False:
        model_instance.status = 'FAILED'
    else:
        model_instance.status = readable_live_status

    model_instance.save()
    return model_instance.status

def get_job_status_from_yarn(instance=None):

    try:
        ym = yarn_api_client.resource_manager.ResourceManager(address=settings.YARN.get("host"), port=settings.YARN.get("port"), timeout=settings.YARN.get("timeout"))
        app_status = ym.cluster_application(instance.job.url)


        # YarnApplicationState = (
        # (ACCEPTED, 'Application has been accepted by the scheduler.'),
        # (FAILED, 'Application which failed.'),
        # (FINISHED, 'Application which finished successfully.'),
        # (KILLED, 'Application which was terminated by a user or admin.'),
        # (NEW, 'Application which was just created.'),
        # (NEW_SAVING, 'Application which is being saved.'),
        # (RUNNING, 'Application which is currently running.'),
        # (SUBMITTED, 'Application which has been submitted.'),
        # )

        YarnApplicationState = app_status.data['app']["state"]

        # YARN_STATUS = {"RUNNING": "INPROGRESS",
        #                "ACCEPTED": "INPROGRESS",
        #                "NEW": "INPROGRESS",
        #                "NEW_SAVING": "INPROGRESS",
        #                "SUBMITTED": "INPROGRESS",
        #                "ERROR": "FAILED",
        #                "FAILED": "FAILED",
        #                "killed": "FAILED",
        #                "FINISHED": "SUCCESS",
        #                "KILLED": "FAILED",
        #                }
    except:
        YarnApplicationState = "FAILED"
    readable_live_status = settings.YARN_STATUS.get(YarnApplicationState, "FAILED")

    try:
        instance.job.status = YarnApplicationState
        instance.job.save()
    except:
        pass

    if readable_live_status is 'SUCCESS' and instance.analysis_done is False:
        instance.status = 'FAILED'
    else:
        instance.status = readable_live_status

    instance.save()
    return instance.status


def get_job_status_from_jobserver(instance=None):
    if instance is None:

        return "no instance ---!!"

    if instance.job is None:
        print "no job---!!"
        return ""
    job_url = instance.job.url
    if instance.status in ['SUCCESS', 'FAILED']:
        return instance.status
    try:
        live_status = return_status_of_job_log(job_url)
        instance.status = live_status
        instance.save()
        return live_status
    except Exception as err:
        return err

def get_job_status(instance=None):

    if instance.status in ['SUCCESS', 'FAILED']:
        return instance.status

    if settings.SUBMIT_JOB_THROUGH_YARN:
        get_job_from_yarn.delay(
            type(instance).__name__,
            instance.slug
        )
    else:
        get_job_status_from_jobserver(instance)


def normalize_job_status_for_yarn(status):
    if "RUNNING" == status :
        return settings.job_status.RUNNING
    elif "ERROR" == status:
        return settings.job_status.ERROR
    elif "FAILED" == status:
        return settings.job_status.ERROR
    elif "FINISHED" == status:
        return settings.job_status.SUCCESS


def return_status_of_job_log(job_url):
    import urllib, json
    final_status = "RUNNING"
    print job_url
    check_status = urllib.urlopen(job_url)
    data = json.loads(check_status.read())
    if data.get("status") == "FINISHED":
        final_status = data.get("status")
    elif data.get("status") == "ERROR" and "startTime" in data.keys():
        #print data.get("status")
        final_status = data.get("status")
    elif data.get("status") == "RUNNING":
        final_status = data.get("status")
    elif data.get("status") == "KILLED":
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


def convert_to_humanize(size):
    size_name = {
        1: 'B',
        2: 'KB',
        3: 'MB',
        4: 'GB',
        5: 'TB'
    }
    i = 1
    while size/1024 > 0:
        i += 1
        size = size/1024

    return str(size) + " " + size_name[i]


def convert_to_GB(size):

    count = 3

    while count > 0:
        size = float(size)/1024
        count -= 1

    return size


def format_tooltip_data(datas):

    for data in datas:
        for index, value in enumerate(data):
            if type(value) in ['int', 'float']:
                data[index] = round_sig(value)

    return datas


def round_sig(x, sig=3):
    try:
        if abs(x)>=1:
            x = round(x,sig)
        else:
            x = round(x, sig-int(floor(log10(abs(x))))-1)
    except:
        pass
    return x


def get_message(instance):
    from api.redis_access import AccessFeedbackMessage
    ac = AccessFeedbackMessage()
    return ac.get_using_obj(instance)


from django.http import JsonResponse


def auth_for_ml(func):

    def another_function(*args, **kwargs):
        request = args[0]
        key1 = request.GET['key1']
        key2 = request.GET['key2']
        signature = request.GET['signature']
        generationTime = float(request.GET['generated_at'])
        currentTime = time.time()
        timeDiff = currentTime-generationTime
        #print timeDiff
        if timeDiff < settings.SIGNATURE_LIFETIME:
            json_obj = {
                "key1": key1,
                "key2": key2
            }
            generated_key = generate_signature(json_obj)
            if signature == generated_key:
                return func(*args, **kwargs)
            else:
                return JsonResponse({'Message': 'Auth failed'})
        else:
            return JsonResponse({'Message': 'Signature Expired'})

    return another_function


def generate_signature(json_obj):
    """
    json_obj = json obj with {"key1":"DSDDD","key2":"DASDAA","signature":None}
    secretKey = secret key kknown to ML and API Codebase
    """
    secretKey = settings.ML_SECRET_KEY
    existing_key = json_obj["key1"]+"|"+json_obj["key2"]+"|"+secretKey
    newhash = md5.new()
    newhash.update(existing_key)
    value = newhash.hexdigest()
    return value

def generate_pmml_name(slug):
    return slug + "_" + 'pmml'