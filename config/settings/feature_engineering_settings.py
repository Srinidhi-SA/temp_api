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
      "display_name": "Do you want to remove duplicate attributes/columns in the dataset?"
    },
    {
      "name": "remove_duplicate_observations",
      "display_name": "Do you want to remove duplicate observations  in the dataset?"
    }
  ],
  "measure": {
    "convertable_to": [
      {
        "name": "dimension",
        "display_name": "Dimension"
      },
      {
        "name": "time_dimension",
        "display_name": "Time Dimension"
      }
    ],
    "missing_value_treatment": [
      {
        "name": "mean_impuration",
        "display_name": "Mean Imputation"
      },
      {
        "name": "mode_imputation",
        "display_name": "Mode Imputation"
      },
      {
        "name": "median_imputation",
        "display_name": "Median Imputation"
      },
      {
        "name": "backward_filling",
        "display_name": "Backward Filling"
      },
      {
        "name": "forward_filling",
        "display_name": "Forward Filling"
      },
      {
        "name": "regression_impuration",
        "display_name": "Regression Imputation"
      },
      {
        "name": "stocastic_impuration",
        "display_name": "Stocastic Imputation"
      },
      {
        "name": "remove_observations",
        "display_name": "Remove Observations"
      },
      {
        "name": "none",
        "display_name": "None",
        "default": True
      }
    ],
    "outlier_removal": [
      {
        "name": "remove_outliers",
        "display_name": "Remove outliers"
      },
      {
        "name": "replace_with_mean",
        "display_name": "Replace with Mean"
      },
      {
        "name": "replace_with_median",
        "display_name": "Replace with Median"
      },
      {
        "name": "none",
        "display_name": "None",
        "default": True
      }
    ]
  },
  "dimension": {
    "convertable_to": [
      {
        "name": "measure",
        "display_name": "Measure"
      },
      {
        "name": "time_dimension",
        "display_name": "Time Dimension"
      }
    ],
    "missing_value_treatment": [
      {
        "name": "mode imputation",
        "display_name": "Mode imputation"
      },
      {
        "name": "logistic regression imputation",
        "display_name": "Logistic regression imputation"
      },
      {
        "name": "discriminant analysis imputation",
        "display_name": "Discriminant analysis imputation"
      },
      {
        "name": "knn imputation",
        "display_name": "KNN imputation"
      },
      {
        "name": "backward filling",
        "display_name": "Backward filling"
      },
      {
        "name": "forward filling",
        "display_name": "Forward filling"
      },
      {
        "name": "remove observations",
        "display_name": "Remove observations"
      },
      {
        "name": "none",
        "display_name": "None",
        "default": True
      }
    ]
  },
  "time_dimension": {
    "convertable_to": [
      {
        "name": "measure",
        "display_name": "Measure"
      },
      {
        "name": "dimension",
        "display_name": "Dimension"
      }
    ],
    "missing_value_treatment": [
      {
        "name": "replace with average based on time dimension (year/month/day)",
        "display_name": "Replace with average based on time dimension (year/month/day)"
      },
      {
        "name": "remove observations",
        "display_name": "Remove observations"
      },
      {
        "name": "none",
        "display_name": "None",
        "default": True
      }
    ]
  }
}

feature_engineering_static = {}