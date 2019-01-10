'''
This file contains STATIC content required by UI:
    - Data Cleansing Page
    - Feature Engineering Page

This content will be provided on an API call.
API: /api/feature_engineering_static_content/?q='data_cleaning_static'
API: /api/feature_engineering_static_content/?q='feature_engineering_static'
'''

data_cleansing_static = {
    "top_level_options": [
        {
            "name": "remove_duplicate_attributes",
            "displayName": "Do you want to remove duplicate attributes/columns in the dataset?",
            "selected": True,
            "slug": ""
        },
        {
            "name": "remove_duplicate_observations",
            "displayName": "Do you want to remove duplicate observations  in the dataset?",
            "selected": True,
            "slug": ""
        }
    ],
    "measure": {
        "convertable_to": [
            {
                "name": "dimension",
                "displayName": "Dimension",
                "selected": False,
                "slug": ""
            },
            {
                "name": "time_dimension",
                "displayName": "Time Dimension",
                "selected": False,
                "slug": ""
            }
        ],
        "missing_value_treatment": {
            "name": "missings_value_treatment",
            "displayName": "Missing value treatment",
            "selected": False,
            "operations": [
                {
                    "name": "mean_impuration",
                    "displayName": "Mean Imputation",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "mode_imputation",
                    "displayName": "Mode Imputation",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "median_imputation",
                    "displayName": "Median Imputation",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "backward_filling",
                    "displayName": "Backward Filling",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "forward_filling",
                    "displayName": "Forward Filling",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "regression_impuration",
                    "displayName": "Regression Imputation",
                    "selected": False,
                    "slug": "",
                    "columns": []

                },
                {
                    "name": "stocastic_impuration",
                    "displayName": "Stocastic Imputation",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "remove_observations",
                    "displayName": "Remove Observations",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "none",
                    "displayName": "None",
                    "selected": False,
                    "slug": "",
                    "columns": []
                }
            ],
        },
        "outlier_removal": {
            "name": "missings_value_treatment",
            "displayName": "Missing value treatment",
            "selected": False,
            "operations": [
                {
                    "name": "remove_outliers",
                    "displayName": "Remove outliers",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "replace_with_mean",
                    "displayName": "Replace with Mean", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "replace_with_median",
                    "displayName": "Replace with Median", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "none",
                    "displayName": "None",
                    "selected": False,
                    "slug": "",
                    "columns": []
                }
            ]
        },
    },
    "dimension": {
        "convertable_to": [
            {
                "name": "measure",
                "displayName": "Measure",
                "selected": False,
                "slug": ""
            },
            {
                "name": "time_dimension",
                "displayName": "Time Dimension",
                "selected": False,
                "slug": ""
            }
        ],
        "missing_value_treatment": {
            "name": "missings_value_treatment",
            "displayName": "Missing value treatment",
            "selected": False,
            "operations": [
                {
                    "name": "mode imputation",
                    "displayName": "Mode imputation", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "logistic regression imputation",
                    "displayName": "Logistic regression imputation", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "discriminant analysis imputation",
                    "displayName": "Discriminant analysis imputation", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "knn imputation",
                    "displayName": "KNN imputation", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "backward filling",
                    "displayName": "Backward filling", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "forward filling",
                    "displayName": "Forward filling", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "remove observations",
                    "displayName": "Remove observations", "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "none",
                    "displayName": "None",
                    "selected": False,
                    "slug": "",
                    "columns": []
                }
            ],
        },

    },
    "time_dimension": {
        "convertable_to": [
            {
                "name": "measure",
                "displayName": "Measure",
                "selected": False,
                "slug": "",
            },
            {
                "name": "dimension",
                "displayName": "Dimension",
                "selected": False,
                "slug": "",
            }
        ],
        "missing_value_treatment": {
            "name": "missings_value_treatment",
            "displayName": "Missing value treatment",
            "selected": False,
            "operations": [
                {
                    "name": "replace with average based on time dimension (year/month/day)",
                    "displayName": "Replace with average based on time dimension (year/month/day)",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "remove observations",
                    "displayName": "Remove observations",
                    "selected": False,
                    "slug": "",
                    "columns": []
                },
                {
                    "name": "none",
                    "displayName": "None",
                    "selected": False,
                    "slug": "",
                    "columns": []
                }
            ]
        }
    }
}

column_format = {
                    "name": "quantity",
                    "datatype": "measure",
                    "mvt_value": 0,
                    "ol_lower_range": 0,
                    "ol_upper_range": 0,
                    "ol_lower_value": 0,
                    "ol_upper_value": 0
                }

bin_conf = {
    'column_name': "",
    'type_of_binning': [
        {
            "name": "equal_sized_bin",
            "display name": "Equal sized bin"
        },
        {
            "name": "custom_bins",
            "display name": "Custom bins"
        },
    ],
    'number_of_bins': 2,
    'specify_interval': [],
    'new_column_name': ""
}

level_conf = {
    "column_name": "",
    "drop_down_values": [],
    "type": ""
}

replace_values_where_quantity = {
    "name": "replace_values_where_quantity",
    "displayName": "Replace values where quantity is",
    "range": {
        "lower": {
            'value': None,
            'default_value': 1
        },
        "upper": {
            "value": None,
            "deafult_value": 2
        }
    },
    "valid_range": {
        "lower": None,
        "upper": None
    },
    "replace_with" : [
        {
            "name": "mean",
            "displayName": "Mean",
            "value": None
        },
        {
            "name": "median",
            "displayName": "Median",
            "value": None
        },
    ]
}

sum_operation = {
    'name': 'sum_operations',
    "displayName": 'Add specific value',
    "value": 1,
    "default_value": 1,
    "status": True
}

subtract_operation = {
    'name': 'subtract_operations',
    "displayName": 'Subtract specific value',
    "value": 1,
    "default_value": 1,
    "status": True
}

multiply_operation = {
    'name': 'multiply_operations',
    "displayName": 'Multiply specific value',
    "value": 1,
    "default_value": 1,
    "status": True
}

division_operation = {
    'name': 'division_operation',
    "displayName": 'Division specific value',
    "value": 1,
    "default_value": 1,
    "status": True
}

perform_standardization = [
    {
        'name': 'min-max scaling',
        'displayName': 'Min Max Scaling'
    },

]

transform_variable_using = [
    {
        'name': 'log-transformtion',
        'displayName': 'Log transformation'
    },
]

convert_values_into_columns = [
    {
        'name': 'one_hot_encoding',
        'displayName': 'One Hot Encoding',
        'status': True
    }
]

is_date_weekend = {
    'name': 'is_date_weekend',
    'displayName': 'Is date a weekend?',
    'status': True
}

extarct_time_based_feature = [
    {
        'name': 'day_of_week',
        'displayName': 'Day of week',
    },
    {
        'name': 'part_of_month',
        'displayName': 'Part of Month'
    }
]

time_since_specific_date = {
    'name': 'time_since_specific_date',
    'displayName': 'Time since specific date',
    'status': True,
    'default_value': None,
    'value': None
}

transform_column = [
    {

    }
]

feature_engineering_static = {}