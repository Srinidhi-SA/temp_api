from pySparkMLClassificationParams import *
from pySparkMLRegressionParams import *
from sklearnMLClassificationParams import *
from sklearnMLRegressionParams import *

ALGORITHMRANDOMSLUG = "f77631ce2ab24cf78c55bb6a5fce4db8"
MLENVIRONMENT = "python" #can be python or spark

if MLENVIRONMENT == "spark":
    ALGORITHM_LIST_REGRESSION={
        "ALGORITHM_SETTING":[
          {
            "algorithmName": "Linear Regression",
            "selected": True,
            "parameters": PYSPARK_ML_LINEAR_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"linr"
          },
          {
            "algorithmName": "Gradient Boosted Tree Regression",
            "selected": True,
            "parameters": PYSPARK_ML_GBT_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"gbtr"
          },
          {
            "algorithmName": "Decision Tree Regression",
            "selected": True,
            "parameters": PYSPARK_ML_DTREE_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"dtreer"
          },
          {
            "algorithmName": "Random Forest Regression",
            "selected": True,
            "parameters": PYSPARK_ML_RF_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"rfr"
          }
        ]
    }
    ALGORITHM_LIST_CLASSIFICATION = {
        "ALGORITHM_SETTING": [
            # {
            #     "algorithmName": "Logistic Regression",
            #     "selected": True,
            #     "parameters": PYSPARK_ML_LINEAR_REGRESSION_PARAMS,
            #     "algorithmSlug": ALGORITHMRANDOMSLUG + "linr"
            # },
            # {
            #     "algorithmName": "Random Forest",
            #     "selected": True,
            #     "parameters": PYSPARK_ML_GBT_REGRESSION_PARAMS,
            #     "algorithmSlug": ALGORITHMRANDOMSLUG + "gbtr"
            # },
            # {
            #     "algorithmName": "XGBoost",
            #     "selected": True,
            #     "parameters": PYSPARK_ML_DTREE_REGRESSION_PARAMS,
            #     "algorithmSlug": ALGORITHMRANDOMSLUG + "dtreer"
            # },
            # {
            #     "algorithmName": "SVM",
            #     "selected": True,
            #     "parameters": PYSPARK_ML_RF_REGRESSION_PARAMS,
            #     "algorithmSlug": ALGORITHMRANDOMSLUG + "rfr"
            # }
        ]
    }
else:
    ALGORITHM_LIST_REGRESSION={
        "ALGORITHM_SETTING":[
          {
            "algorithmName": "Linear Regression",
            "selected": True,
            "parameters": SKLEARN_ML_LINEAR_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"linr"
          },
          {
            "algorithmName": "Gradient Boosted Tree Regression",
            "selected": True,
            "parameters": SKLEARN_ML_GBT_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"gbtr"
          },
          {
            "algorithmName": "Decision Tree Regression",
            "selected": True,
            "parameters": SKLEARN_ML_DTREE_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"dtreer"
          },
          {
            "algorithmName": "Random Forest Regression",
            "selected": True,
            "parameters": SKLEARN_ML_RF_REGRESSION_PARAMS,
            "algorithmSlug": ALGORITHMRANDOMSLUG+"rfr"
          }
        ]
    }
    ALGORITHM_LIST_CLASSIFICATION = {
        "ALGORITHM_SETTING": [
            {
                "algorithmName": "Logistic Regression",
                "selected": True,
                "parameters": SKLEARN_ML_LOGISTIC_REGRESSION_PARAMS,
                "algorithmSlug": ALGORITHMRANDOMSLUG + "lr"
            },
            {
                "algorithmName": "Random Forest",
                "selected": True,
                "parameters": SKLEANR_ML_RF_CLASSIFICATION_PARAMS,
                "algorithmSlug": ALGORITHMRANDOMSLUG + "rf"
            },
            {
                "algorithmName": "XGBoost",
                "selected": True,
                "parameters": SKLEARN_ML_XGBOOST_CLASSIFICATION_PARAMS,
                "algorithmSlug": ALGORITHMRANDOMSLUG + "xgb"
            },
            # {
            #     "algorithmName": "SVM",
            #     "selected": False,
            #     "parameters": SKLEARN_ML_RF_REGRESSION_PARAMS,
            #     "algorithmSlug": ALGORITHMRANDOMSLUG + "rfr"
            # }
        ]
    }

