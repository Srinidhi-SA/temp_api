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

    def __init__(self, data=None, data_type='column', subchart=False):
        config = {
            "data": {
                "columns": [],

            }
        }

    def set_data_and_type(self,data,type):
        data = dict()
        data[type] = data
        return data

    def set_axis(self):
        axis = \
            {
                'x':
                    {
                        'tick':
                            {
                                'centered':True,
                                'fit':True,
                                'rotate':-10
                            },
                        'height': 20,
                        'label':
                            {
                                'text': 'Your X-Axis',
                                'position': 'outer-center'
                            }
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
                                'position'
                            }
                    }
            }
