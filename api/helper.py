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
    def get_config(cls, slug, class_name):

        job_type = {
            "metadata": "metaData",
            "master": "story",
        }

        return {
            "job_config": {
                "job_type": job_type[class_name],
                "job_url" : "http://{0}:{1}/api/job/{2}/".format(THIS_SERVER_DETAILS.get('host'),
                                                                    THIS_SERVER_DETAILS.get('port'),
                                                                    slug),
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
          }
      }

    }


def decode_and_convert_chart_raw_data(data):

    if not check_chart_data_format(data):
        return {}
    from api.C3Chart.c3charts import C3Chart
    # import pdb;pdb.set_trace()
    chart_type = data['chart_type']
    axes = data['axes']
    label_text = data['label_text']
    legend = data['legend']
    types = data.get('types', None)
    axisRotation = data.get('axisRotation', None)

    if chart_type in ["bar", "line", "spline"]:
        chart_data = replace_chart_data(data['data'])
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

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

        c3.set_axis_label_simple(
            label_text=label_text
        )

        return {
            "chart_c3": c3.get_json(),
            "yformat": "m"
        }
    elif chart_type in ["combination"]:

        chart_data = replace_chart_data(data['data'])
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

        if axes.get('y2', None) is not None:
            c3.set_another_y_axis(
                y2_name=axes.get('y2')
            )

        c3.set_axis_label_simple(
            label_text=label_text
        )

        if types:
            c3.add_new_chart_on_a_data_list(types)

        if axisRotation:
            c3.rotate_axis()

        return {
            "chart_c3": c3.get_json(),
            "yformat": "m"
        }

    elif chart_type in ["scatter_line", "scatter"]:
        pass


def replace_chart_data(data):
    if isinstance(data, list):
        return convert_listed_dict_objects(data)
    elif isinstance(data, dict):
        pass


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

