'''
C3Charts is a python wrapper for c3.js charts. It has no dependencies other than standard python libraries.

Usage:
=====

    import C3Chart
    C3Chart.generate(config)
'''

__author__ = 'Ankush Patel'

import json


class C3Chart(object):

    def __init__(self, data=None,
                 chart_type='line',
                 x_type='category',
                 title='Unamed Chart',
                 data_type='columns',
                 x_column_name='x'):

        self._data = None
        self._axis = None
        self._grid = None
        self._region = None
        self._legend = None
        self._tooltip = None
        self._subchart = None
        self._point = None
        self._zoom = None
        self._color = None
        self._type = chart_type
        self._x_column_name = x_column_name
        self._data_data = data
        self._data_type = data_type
        self.set_data_and_type()
        self._x_type = x_type
        self._x_height = 50
        self._x_label_rotation = -10
        self.set_basic_chart_setting()
        self._title = {'text': title}

        self._subchart_threshold = 14
        self.subchart_extent = None

    def _set_title(self, title):
        self._title = {'text': title}

    def set_data_and_type(self):

        self._data = {
            self._data_type: self._data_data,
            'type': self._type,
            'x': self._x_column_name
        }
        if self._data_type == 'json':
            self.set_keys_in_data_field()
        self.other_useful_info()

    def other_useful_info(self):
        self._x_max_string_length = self.find_and_set_length_of_max_string_in_x()
        self._x_index_in_column_data = self.find_x_index_in_column_data()
        self._number_of_x_ticks = self.find_and_set_number_of_x_ticks()

    def set_keys_in_data_field(self):

        keys = []
        for data in self._data_data:
            keys = list(set(keys + data.keys()))

        keys.remove(self._x_column_name)
        self._axis['keys'] = keys

    def set_x_axis(self, column_name):
        self._data['x'] = column_name

    def set_basic_chart_setting(self):
        self._padding = {
            'top': 30,
            # 'right': 100,
            # 'bottom': 40,
            # 'left': 100
        }

    def set_basic_axis(self):

        self._axis = {
            'x':
                {
                    'tick':
                        {
                            # 'centered': True,
                            'fit': True,
                            'rotate': self._x_label_rotation,
                            'multiline': False
                        },
                    'height': self._x_height,
                    'label':
                        {
                            'text': 'Your X-Axis',
                            'position': 'outer-center'
                        },
                    'type': self._x_type
                },
            'y':
                {
                    'tick':
                        {
                            'outer':True,
                        },
                    'label':
                        {
                            'text': 'Your Y-Axis',
                            'position': 'outer-middle'
                        }
                }
        }

    def set_basic_legends(self):
        self._legend = {
            'show': False
        }

    def set_basic_grid_lines(self):
        self._grid = {
            'y': {
                'show': True
            },
            'x': {
                'show': True,
            }
        }

    def set_basic_color_pattern(self):
        self._color = {
            'pattern': [
                '#00AEB3', '#f47b16', '#7c5bbb',
                '#dd2e1f', '#00a0dc', '#efb920',
                '#e2247f', '#7cb82f', '#86898c'
            ]
        }

    def set_basic_subchart(self):
        self._subchart = {
            'show': True
        }
        self._axis['x']['extent'] = [0,5]

    def set_basic_tooltip(self):
        self._tooltip = {
            'show': True
        }

    def set_height_between_legend_and_x_axis(self):
        absolute_rotation = abs(self._x_label_rotation)%90
        max_length = self._x_max_string_length
        # self._x_height = absolute_rotation*max_length/5 + 40
        self._x_height = 56

    def find_and_set_length_of_max_string_in_x(self):
        data = self._data_data
        if self._data_type == 'json':
            return max([len(d.get(self)) for d in data])
        elif self._data_type == 'column':
            return max([len(str(d)) for d in data])

    def find_and_set_number_of_x_ticks(self):
        data = self._data_data
        if self._data_type == 'json':
            return len(data)
        elif self._data_type == 'columns':
            return len(data[self._x_index_in_column_data])

    def find_x_index_in_column_data(self):
        for index, data in enumerate(self._data_data):
            if data[0] == self._x_column_name:
                return index

    def set_subchart_after(self):
        if self._number_of_x_ticks > self._subchart_threshold:
            self.set_basic_subchart()

    def set_all_basics(self):
        self.set_height_between_legend_and_x_axis()
        self.set_basic_axis()
        self.set_basic_legends()
        self.set_basic_grid_lines()
        self.set_basic_color_pattern()
        self.set_basic_tooltip()
        self.set_subchart_after()

    def get_json(self):

        return {
            'data': self._data,
            'axis': self._axis,
            'tooltip': self._tooltip,
            'grid': self._grid,
            'legend': self._legend,
            'color': self._color,
            'padding': self._padding,
            'title': self._title,
            'subchart':self._subchart
        }