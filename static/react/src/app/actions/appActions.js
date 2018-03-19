import {API, EMR, STATIC_URL} from "../helpers/env";
import {PERPAGE, isEmpty, getUserDetailsOrRestart, APPSPERPAGE, statusMessages} from "../helpers/helper";
import store from "../store";
import {
  APPSLOADERPERVALUE,
  LOADERMAXPERVALUE,
  DEFAULTINTERVAL,
  APPSDEFAULTINTERVAL,
  CUSTOMERDATA,
  HISTORIALDATA,
  EXTERNALDATA,
  DELETEMODEL,
  RENAMEMODEL,
  DELETESCORE,
  RENAMESCORE,
  DELETEINSIGHT,
  RENAMEINSIGHT,
  SUCCESS,
  FAILED,
  DELETEAUDIO,
  RENAMEAUDIO,
  INPROGRESS
} from "../helpers/helper";
import {hideDataPreview, getStockDataSetPreview, showDataPreview, getDataSetPreview} from "./dataActions";
import {getHeaderWithoutContent} from "./dataUploadActions";
import Dialog from 'react-bootstrap-dialog';
import React from "react";
import {showLoading, hideLoading} from 'react-redux-loading-bar';
import {createcustomAnalysisDetails} from './signalActions';

export var appsInterval = null;
export var refreshAppsModelInterval = null;
export var refreshAppsScoresInterval = null;

function getHeader(token) {
  return {'Authorization': token, 'Content-Type': 'application/json'};
}

export function openModelPopup() {
  return {type: "APPS_MODEL_SHOW_POPUP"}
}

export function closeModelPopup() {
  return {type: "APPS_MODEL_HIDE_POPUP"}
}

export function refreshAppsModelList(props) {
  return (dispatch) => {

    refreshAppsModelInterval = setInterval(function() {
      var pageNo = window.location.href.split("=")[1];
      if (pageNo == undefined)
        pageNo = 1;
      if (window.location.pathname == "/apps/" + store.getState().apps.currentAppId + "/models")
        dispatch(getAppsModelList(parseInt(pageNo)));
      }
    , APPSDEFAULTINTERVAL);
  }
}

export function getAppsModelList(pageNo) {
  return (dispatch) => {
    return fetchModelList(pageNo, getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {
        console.log(json)
        dispatch(fetchModelListSuccess(json))
      } else {
        dispatch(fetchModelListError(json))
      }
    })
  }
}

function fetchModelList(pageNo, token) {
  let search_element = store.getState().apps.model_search_element;
  let apps_model_sorton = store.getState().apps.apps_model_sorton;
  let apps_model_sorttype = store.getState().apps.apps_model_sorttype;
  if (apps_model_sorttype == 'asc')
    apps_model_sorttype = ""
  else if (apps_model_sorttype == 'desc')
    apps_model_sorttype = "-"

  if (search_element != "" && search_element != null) {
    console.log("calling for model search element!!")
    return fetch(API + '/api/trainer/?app_id=' + store.getState().apps.currentAppId + '&name=' + search_element + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else if ((apps_model_sorton != "" && apps_model_sorton != null) && (apps_model_sorttype != null)) {
    return fetch(API + '/api/trainer/?app_id=' + store.getState().apps.currentAppId + '&sorted_by=' + apps_model_sorton + '&ordering=' + apps_model_sorttype + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/trainer/?app_id=' + store.getState().apps.currentAppId + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

function fetchModelListError(json) {
  return {type: "MODEL_LIST_ERROR", json}
}
export function fetchModelListSuccess(doc) {
  var data = doc;
  var current_page = doc.current_page;
  var latestModels = doc.top_3
  return {type: "MODEL_LIST", data, latestModels, current_page}
}
export function updateTrainAndTest(trainValue) {
  //var trainValue = e.target.value;
  var testValue = 100 - trainValue;
  return {type: "UPDATE_MODEL_RANGE", trainValue, testValue}
}

export function createModel(modelName, targetVariable, targetLevel) {
  console.log(modelName);
  console.log(targetVariable);
  /*if($('#createModelAnalysisList option:selected').val() == ""){
            let msg=statusMessages("warning","Please select a variable to analyze...","small_mascot")
              bootbox.alert(msg);
            return false;
        }*/

        return (dispatch) => {
            dispatch(openAppsLoader(APPSLOADERPERVALUE,"Please wait while mAdvisor is creating model... "));
            return triggerCreateModel(getUserDetailsOrRestart.get().userToken,modelName,targetVariable,targetLevel,dispatch).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(createModelSuccess(json,dispatch))
                }
                else{
                    dispatch(closeAppsLoaderValue());
                    dispatch(updateModelSummaryFlag(false));
                    dispatch(createModelError(json))
                }
            })
        }
    }

    function triggerCreateModel(token,modelName,targetVariable,targetLevel,dispatch) {
        var datasetSlug = store.getState().datasets.dataPreview.slug;
        var app_id=store.getState().apps.currentAppId;
        var customDetails = createcustomAnalysisDetails();
        if(store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
            if(store.getState().apps.regression_selectedTechnique == "crossValidation")
            {
                var validationTechnique={
                "name":"kFold",
                "displayName":"K Fold Validation",
                "value":store.getState().apps.regression_crossvalidationvalue
                }
            }
            else
            {
                var validationTechnique={
                "name":"trainAndtest",
                "displayName":"Train and Test",
                "value":(store.getState().apps.trainValue/100)
                }
            }
            if(store.getState().apps.regression_isAutomatic == "1")
            var AlgorithmSettings = store.getState().apps.regression_algorithm_data;
            else
            var AlgorithmSettings = store.getState().apps.regression_algorithm_data_manual;

            var details = {
                "ALGORITHM_SETTING":AlgorithmSettings,
                "validationTechnique":validationTechnique,
                "targetLevel":targetLevel,
                "variablesSelection":store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray
            }
        }
        else{
        var details = {/*"measures":store.getState().datasets.selectedMeasures,
                "dimension":store.getState().datasets.selectedDimensions,
                "timeDimension":store.getState().datasets.selectedTimeDimensions,*/
      "trainValue": store.getState().apps.trainValue,
      "testValue": store.getState().apps.testValue,
      "targetLevel": targetLevel,
      "variablesSelection": store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray
      /* "analysisVariable":targetVariable,
                'customAnalysisDetails':customDetails["customAnalysisDetails"],
                 'polarity':customDetails["polarity"],
                 'uidColumn':customDetails["uidColumn"]*/
    }
  }
  return fetch(API + '/api/trainer/', {
    method: 'post',
    headers: getHeader(token),
    body: JSON.stringify({"name": modelName, "dataset": datasetSlug, "app_id": app_id, "config": details})
  }).then(response => Promise.all([response, response.json()])).catch(function(error) {
    dispatch(closeAppsLoaderValue());
    dispatch(updateModelSummaryFlag(false));
    bootbox.alert(statusMessages("error", "Unable to connect to server. Check your connection please try again.", "small_mascot"))
  });
}
function createModelSuccess(data, dispatch) {
  var slug = data.slug;
  appsInterval = setInterval(function() {
    /*if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }*/
    dispatch(getAppsModelSummary(data.slug));
    return {type: "CREATE_MODEL_SUCCESS", slug}
  }, APPSDEFAULTINTERVAL);
  return {type: "CREATE_MODEL_SUCCESS", slug}
}
export function createModelSuccessAnalysis(data) {
  return (dispatch) => {
    dispatch(createModelSuccess(data, dispatch))
  }
}
export function refreshAppsScoreList(props) {
  return (dispatch) => {
    refreshAppsScoresInterval = setInterval(function() {
      var pageNo = window.location.href.split("=")[1];
      if (pageNo == undefined)
        pageNo = 1;
      if (window.location.pathname == "/apps/" + store.getState().apps.currentAppId + "/scores")
        dispatch(getAppsScoreList(parseInt(pageNo)));
      }
    , APPSDEFAULTINTERVAL);
  }
}
export function getAppsScoreList(pageNo) {
  return (dispatch) => {
    return fetchScoreList(pageNo, getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {
        console.log(json)
        dispatch(fetchScoreListSuccess(json));
      } else {
        dispatch(fetchScoreListError(json))
      }
    })
  }
}

function fetchScoreList(pageNo, token) {
  let search_element = store.getState().apps.score_search_element;
  let apps_score_sorton = store.getState().apps.apps_score_sorton;
  let apps_score_sorttype = store.getState().apps.apps_score_sorttype;
  if (apps_score_sorttype == 'asc')
    apps_score_sorttype = ""
  else if (apps_score_sorttype == 'desc')
    apps_score_sorttype = "-"

  if (search_element != "" && search_element != null) {
    console.log("calling for score search element!!")
    return fetch(API + '/api/score/?app_id=' + store.getState().apps.currentAppId + '&name=' + search_element + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else if ((apps_score_sorton != "" && apps_score_sorton != null) && (apps_score_sorttype != null)) {
    return fetch(API + '/api/score/?app_id=' + store.getState().apps.currentAppId + '&sorted_by=' + apps_score_sorton + '&ordering=' + apps_score_sorttype + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/score/?app_id=' + store.getState().apps.currentAppId + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

function fetchScoreListError(json) {
  return {type: "SCORE_LIST_ERROR", json}
}
export function fetchScoreListSuccess(doc) {
  var data = doc;
  var current_page = doc.current_page
  var latestScores = doc.top_3;
  return {type: "SCORE_LIST", data, latestScores, current_page}
}

export function showCreateScorePopup() {
  return {type: "APPS_SCORE_SHOW_POPUP"}
}

export function hideCreateScorePopup() {
  return {type: "APPS_SCORE_HIDE_POPUP"}
}

export function getAppsModelSummary(slug) {
  return (dispatch) => {
    return fetchModelSummary(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        if (json.status == SUCCESS) {
          clearInterval(appsInterval);
          dispatch(fetchModelSummarySuccess(json));
          dispatch(closeAppsLoaderValue());
          dispatch(hideDataPreview());
          dispatch(updateModelSummaryFlag(true));
          if (store.getState().apps.currentAppDetails.app_type == "REGRESSION")
            dispatch(reSetRegressionVariables());
          }
        else if (json.status == FAILED) {
          bootbox.alert("Your model could not be created.Please try later.", function() {
            window.history.go(-2);
          });
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
          dispatch(hideDataPreview());
          if (store.getState().apps.currentAppDetails.app_type == "REGRESSION")
            dispatch(reSetRegressionVariables());
          }
        else if (json.status == INPROGRESS) {
          if (json.message !== null && json.message.length > 0) {
            dispatch(openAppsLoaderValue(json.message[0].stageCompletionPercentage, json.message[0].shortExplanation));
          }
        }
      } else {
        dispatch(closeAppsLoaderValue())
        dispatch(fetchModelSummaryError(json));
        dispatch(updateModelSummaryFlag(false));
      }
    })
  }
}

function fetchModelSummary(token, slug) {
  return fetch(API + '/api/trainer/' + slug + '/', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

function fetchModelSummaryError(json) {
  return {type: "MODEL_SUMMARY_ERROR", json}
}
export function fetchModelSummarySuccess(doc) {
  var data = doc;
  return {type: "MODEL_SUMMARY_SUCCESS", data}
}
export function clearModelSummary() {
  return {type: "CLEAR_MODEL_SUMMARY"}
}
export function getListOfCards(totalCardList) {
  console.log("In Apps Model Detail");
  let cardList = new Array();
  for (var i = 0; i < totalCardList.length; i++) {
    cardList.push(totalCardList[i].cardData)
  }
  console.log(cardList)
  return cardList;
}

export function updateSelectedAlg(name) {
  return {type: "SELECTED_ALGORITHM", name}
}

export function createScore(scoreName, targetVariable) {
  console.log(scoreName);
  console.log(targetVariable);
  return (dispatch) => {
    dispatch(openAppsLoader(APPSLOADERPERVALUE, "Please wait while mAdvisor is scoring your model... "));
    return triggerCreateScore(getUserDetailsOrRestart.get().userToken, scoreName, targetVariable).then(([response, json]) => {
      if (response.status === 200) {

        dispatch(createScoreSuccess(json, dispatch))
      } else {
        dispatch(createScoreError(json));
        dispatch(updateScoreSummaryFlag(false));
        dispatch(closeAppsLoaderValue())
      }
    })
  }
}

function triggerCreateScore(token, scoreName, targetVariable) {
  var datasetSlug = store.getState().datasets.dataPreview.slug;
  var app_id = store.getState().apps.currentAppId;
  var customDetails = createcustomAnalysisDetails();
  var details = {/*"measures":store.getState().datasets.selectedMeasures,
                "dimension":store.getState().datasets.selectedDimensions,
                "timeDimension":store.getState().datasets.selectedTimeDimensions,
                "analysisVariable":targetVariable,
                'customAnalysisDetails':customDetails["customAnalysisDetails"],
                'polarity':customDetails["polarity"],
                'uidColumn':customDetails["uidColumn"],*/
    "algorithmName": store.getState().apps.selectedAlg,
    "variablesSelection": store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray,
    "app_id": app_id
  }
  return fetch(API + '/api/score/', {
    method: 'post',
    headers: getHeader(token),
    body: JSON.stringify({"name": scoreName, "dataset": datasetSlug, "trainer": store.getState().apps.modelSlug, "config": details})
  }).then(response => Promise.all([response, response.json()]));
}

function createScoreSuccess(data, dispatch) {
  var slug = data.slug;
  appsInterval = setInterval(function() {
    /* if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }*/
    dispatch(getAppsScoreSummary(data.slug));
    return {type: "CREATE_SCORE_SUCCESS", slug}
  }, APPSDEFAULTINTERVAL);
  return {type: "CREATE_SCORE_SUCCESS", slug}
}

var dummy= {
        "listOfNodes": [
            {
                "listOfNodes": [],
                "listOfCards": [
                    {
                        "cardWidth": 100,
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": "<p class=\"txt-justify\"> The STATUS variable has only two values, i.e. Active and Churn. Active is the <b>largest</b> with 19,142 observations, whereas Churn is the <b>smallest</b> with just 6,324 observations. </p>"
                            },
                            {
                                "dataType": "c3Chart",
                                "widthPercent": 100,
                                "data": {
                                    "chart_c3": {
                                        "bar": {
                                            "width": 40
                                        },
                                        "point": null,
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "show": true,
                                            "format": {
                                                "title": ".2s"
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "grid": {
                                            "y": {
                                                "show": true
                                            },
                                            "x": {
                                                "show": false
                                            }
                                        },
                                        "subchart": null,
                                        "axis": {
                                            "y": {
                                                "tick": {
                                                    "outer": false,
                                                    "multiline": true,
                                                    "format": ".2s"
                                                },
                                                "label": {
                                                    "text": "No. of Observations",
                                                    "position": "outer-middle"
                                                }
                                            },
                                            "x": {
                                                "height": 95,
                                                "tick": {
                                                    "rotate": -45,
                                                    "multiline": false,
                                                    "fit": false,
                                                    "format": ".2s"
                                                },
                                                "type": "category",
                                                "label": {
                                                    "text": " ",
                                                    "position": "outer-center"
                                                }
                                            }
                                        },
                                        "data": {
                                            "x": "key",
                                            "axes": {
                                                "Count": "y"
                                            },
                                            "type": "bar",
                                            "columns": [
                                                [
                                                    "Count",
                                                    19142,
                                                    6324
                                                ],
                                                [
                                                    "key",
                                                    "Active",
                                                    "Churn"
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "show": false
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2s",
                                    "table_c3": [
                                        [
                                            "key",
                                            "Active",
                                            "Churn"
                                        ],
                                        [
                                            "Count",
                                            19142,
                                            6324
                                        ]
                                    ],
                                    "download_url": "/api/download_data/8tf17rukc4oj9im1",
                                    "xdata": [
                                        "Active",
                                        "Churn"
                                    ]
                                },
                                "chartInfo": []
                            },
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": "<p class = \"txt-justify\"> The segment Active accounts for 75.17% of the overall observations. </p>"
                            },
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>75.17%</span><br /><small> Active is the largest with 19,142 observations</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>24.83%</span><br /><small> Churn is the smallest with 6,324 observations</small></h2></div>"
                            }
                        ],
                        "name": "Distribution of STATUS",
                        "slug": "distribution-of-status-couw7lybzw"
                    }
                ],
                "name": "Overview",
                "slug": "overview-abcshsuscx"
            },
            {
                "listOfNodes": [
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "state-relationship-with-status-oyryt13rd2",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and STATE</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "STATE",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "Florida",
                                                            5202,
                                                            1156,
                                                            6358
                                                        ],
                                                        [
                                                            "New York",
                                                            2176,
                                                            272,
                                                            2448
                                                        ],
                                                        [
                                                            "Ohio",
                                                            3468,
                                                            1666,
                                                            5134
                                                        ],
                                                        [
                                                            "Virginia",
                                                            4556,
                                                            2142,
                                                            6698
                                                        ],
                                                        [
                                                            "Washington",
                                                            3740,
                                                            1088,
                                                            4828
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "STATE",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "Florida",
                                                            81.82,
                                                            18.18
                                                        ],
                                                        [
                                                            "New York",
                                                            88.89,
                                                            11.11
                                                        ],
                                                        [
                                                            "Ohio",
                                                            67.55,
                                                            32.45
                                                        ],
                                                        [
                                                            "Virginia",
                                                            68.02,
                                                            31.98
                                                        ],
                                                        [
                                                            "Washington",
                                                            77.46,
                                                            22.54
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> STATE is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. The top 4 STATES including segment Virginia and segment Florida account for <b> 90.4% </b>of the total observations. <b>Segment New York</b> is the smallest with <b>just 9.61%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment New York</b> (11.1%). The segment <b> Ohio</b> has the <b>highest contribution of STATUS - Churn</b> (32.5%), which is 192.1% higher than segment New York and 30.7% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Florida and segment New York</b>, which cumulatively account for <b> 34.6% of the total </b>observations, has contributed to <b> 22.6% of the segment Churn</b>. <li>The <b>segment Virginia</b> accounts for <b>26.3% of the total</b> observations, but it has contributed to <b>33.9% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment Ohio</b> seems to be the <b>least dominant segment</b> since 67.5% of its total observations are into that Active category. But,<b> segment New York</b> has the <b>highest contribution of STATUS - Active</b> (88.9%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Virginia and segment Ohio</b>, which cumulatively account for <b> 46.5% of the total </b>observations, have contributed to <b> 41.9% of the segment Active</b>. <li>The <b>segment Florida</b> accounts for <b>25.0% of the total</b> observations, but it has contributed to <b>27.2% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "STATE: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "state-distribution-of-active-hv8vc5wnsz",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across STATE</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/d1cvgi9ebo5xsmeg",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Florida",
                                                "New York",
                                                "Ohio",
                                                "Virginia",
                                                "Washington"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            81.81818181818181,
                                                            88.88888888888889,
                                                            67.54966887417218,
                                                            68.02030456852792,
                                                            77.46478873239437
                                                        ],
                                                        [
                                                            "total",
                                                            5202,
                                                            2176,
                                                            3468,
                                                            4556,
                                                            3740
                                                        ],
                                                        [
                                                            "key",
                                                            "Florida",
                                                            "New York",
                                                            "Ohio",
                                                            "Virginia",
                                                            "Washington"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Florida",
                                                    "New York",
                                                    "Ohio",
                                                    "Virginia",
                                                    "Washington"
                                                ],
                                                [
                                                    "total",
                                                    5202,
                                                    2176,
                                                    3468,
                                                    4556,
                                                    3740
                                                ],
                                                [
                                                    "percentage",
                                                    81.81818181818181,
                                                    88.88888888888889,
                                                    67.54966887417218,
                                                    68.02030456852792,
                                                    77.46478873239437
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 754.134",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and STATE."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 4 STATES(including segment Florida and segment Virginia) account for 88.6% of the observation from STATUS - Active. Being the largest contributor, Florida amounts to 5,202.0 that accounts for about 27.2% of the STATUS-Active. On the other hand, New York contributes to just 11.37% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Florida</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> CREDIT_RATING, AMOUNT_PAID_NOVEMBER and BILL_AMOUNT_DECEMBER are some of the most important factors that describe the concentration of Active from segment Florida Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>CREDIT_RATING</b>: Some of the CREDIT_RATINGS(including Near Prime(28.6%) and Deep Prime(25.4%)) account for a significant portion of STATUS - Active observations from segment Florida. They cumulatively account for about 98.4% of the STATUS - Active from segment Florida. The percentage of STATUS - Active for Near Prime and Deep Prime are 36.7% and 53.3% respectively. </li> </li> </li> <li> <b>BILL_AMOUNT_DECEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Active from segment Florida. It accounts for 60.3% of total Active from segment Florida. The percentage of STATUS - Active for Less than $1000 is 33.0%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>27.2%</span><br /><small>Overall Active comes from Florida</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>88.9%</span><br /><small>New York has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "STATE : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "state-distribution-of-churn-q03tkp2o8e",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across STATE</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/blc9glwxdf7rowtr",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Florida",
                                                "New York",
                                                "Ohio",
                                                "Virginia",
                                                "Washington"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            18.181818181818183,
                                                            11.11111111111111,
                                                            32.450331125827816,
                                                            31.97969543147208,
                                                            22.535211267605632
                                                        ],
                                                        [
                                                            "total",
                                                            1156,
                                                            272,
                                                            1666,
                                                            2142,
                                                            1088
                                                        ],
                                                        [
                                                            "key",
                                                            "Florida",
                                                            "New York",
                                                            "Ohio",
                                                            "Virginia",
                                                            "Washington"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Florida",
                                                    "New York",
                                                    "Ohio",
                                                    "Virginia",
                                                    "Washington"
                                                ],
                                                [
                                                    "total",
                                                    1156,
                                                    272,
                                                    1666,
                                                    2142,
                                                    1088
                                                ],
                                                [
                                                    "percentage",
                                                    18.181818181818183,
                                                    11.11111111111111,
                                                    32.450331125827816,
                                                    31.97969543147208,
                                                    22.535211267605632
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 754.134",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and STATE."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 4 STATES(including segment Virginia and segment Ohio) account for 95.7% of the observation from STATUS - Churn. Being the largest contributor, Virginia amounts to 2,142.0 that accounts for about 33.9% of the STATUS-Churn. On the other hand, New York contributes to just 4.3% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Virginia</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> CREDIT_RATING, AMOUNT_PAID_NOVEMBER and BILL_AMOUNT_DECEMBER are some of the most important factors that describe the concentration of Churn from segment Virginia Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>CREDIT_RATING</b>: Some of the CREDIT_RATINGS(including Near Prime(28.6%) and Deep Prime(25.4%)) account for a significant portion of STATUS - Churn observations from segment Virginia. They cumulatively account for about 98.4% of the STATUS - Churn from segment Virginia. The percentage of STATUS - Churn for Near Prime and Deep Prime are 36.7% and 53.3% respectively. </li> </li> </li> <li> <b>BILL_AMOUNT_DECEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Churn from segment Virginia. It accounts for 60.3% of total Churn from segment Virginia. The percentage of STATUS - Churn for Less than $1000 is 33.0%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>33.9%</span><br /><small>Overall Churn comes from Virginia</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>32.5%</span><br /><small>Ohio has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "STATE : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "STATE",
                        "slug": "state-xyr8qq7p7h"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "average_spend-relationship-with-status-xq9witlezm",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and AVERAGE_SPEND</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "AVERAGE_SPEND",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "Less than $1,000",
                                                            11492,
                                                            3468,
                                                            14960
                                                        ],
                                                        [
                                                            "$1,000 to $5,000",
                                                            6392,
                                                            2108,
                                                            8500
                                                        ],
                                                        [
                                                            "$5,000 to $10,000",
                                                            986,
                                                            272,
                                                            1258
                                                        ],
                                                        [
                                                            "$10,000 to $20,000",
                                                            34,
                                                            68,
                                                            102
                                                        ],
                                                        [
                                                            "More than $20,000",
                                                            238,
                                                            408,
                                                            646
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "AVERAGE_SPEND",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "Less than $1,000",
                                                            76.82,
                                                            23.18
                                                        ],
                                                        [
                                                            "$1,000 to $5,000",
                                                            75.2,
                                                            24.8
                                                        ],
                                                        [
                                                            "$5,000 to $10,000",
                                                            78.38,
                                                            21.62
                                                        ],
                                                        [
                                                            "$10,000 to $20,000",
                                                            33.33,
                                                            66.67
                                                        ],
                                                        [
                                                            "More than $20,000",
                                                            36.84,
                                                            63.16
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> AVERAGE_SPEND is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Less than $1,000 and segment $1,000 to $5,000 </b> are the two largest AVERAGE_SPENDS, accounting for <b> 92.1% </b> of the total observations. <b>Segment $10,000 to $20,000</b> is the smallest with <b>just 0.4%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment $5,000 to $10,000</b> (21.6%). The segment <b> $10,000 to $20,000</b> has the <b>highest contribution of STATUS - Churn</b> (66.7%), which is 208.3% higher than segment $5,000 to $10,000 and 168.5% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Less than $1,000</b>, which accounts for <b>58.7% of the total </b>observations, has contributed to <b>54.8% of the segment Churn</b>. <li>The <b>segment More than $20,000</b> accounts for <b>2.5% of the total</b> observations, but it has contributed to <b>6.5% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment More than $20,000</b> seems to be the <b>least dominant segment</b> since 36.8% of its total observations are into that Active category. But,<b> segment $5,000 to $10,000</b> has the <b>highest contribution of STATUS - Active</b> (78.4%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment More than $20,000 and segment $10,000 to $20,000</b>, which cumulatively account for <b> 2.9% of the total </b>observations, have contributed to <b> 1.4% of the segment Active</b>. <li>The <b>segment Less than $1,000</b> accounts for <b>58.7% of the total</b> observations, but it has contributed to <b>60.0% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "AVERAGE_SPEND: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "average_spend-distribution-of-active-5n65pkn2sr",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across AVERAGE_SPEND</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/chvsl37qx3by3l80",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1,000",
                                                "$1,000 to $5,000",
                                                "$5,000 to $10,000",
                                                "$10,000 to $20,000",
                                                "More than $20,000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            76.81818181818181,
                                                            75.2,
                                                            78.37837837837837,
                                                            33.333333333333336,
                                                            36.8421052631579
                                                        ],
                                                        [
                                                            "total",
                                                            11492,
                                                            6392,
                                                            986,
                                                            34,
                                                            238
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1,000",
                                                            "$1,000 to $5,000",
                                                            "$5,000 to $10,000",
                                                            "$10,000 to $20,000",
                                                            "More than $20,000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1,000",
                                                    "$1,000 to $5,000",
                                                    "$5,000 to $10,000",
                                                    "$10,000 to $20,000",
                                                    "More than $20,000"
                                                ],
                                                [
                                                    "total",
                                                    11492,
                                                    6392,
                                                    986,
                                                    34,
                                                    238
                                                ],
                                                [
                                                    "percentage",
                                                    76.81818181818181,
                                                    75.2,
                                                    78.37837837837837,
                                                    33.333333333333336,
                                                    36.8421052631579
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 632.755",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and AVERAGE_SPEND."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 AVERAGE_SPENDS(segment Less than $1,000 and segment $1,000 to $5,000) account for 93.4% of the observation from STATUS - Active. Being the largest contributor, Less than $1,000 amounts to 11,492.0 that accounts for about 60.0% of the STATUS-Active. On the other hand, $10,000 to $20,000 contributes to just 0.18% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Less than $1,000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, STATE and AMOUNT_PAID_NOVEMBER are some of the most important factors that describe the concentration of Active from segment Less than $1,000 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Active from segment Less than $1,000. It accounts for 95.1% of total Active from segment Less than $1,000. The percentage of STATUS - Active for Less than $1000 is 23.8%. </li> </li> <li> <b>STATE</b>: Among the STATES, Virginia has got the major chunk of STATUS - Active from segment Less than $1,000, accounting for 38.2%. The percentage of STATUS - Active for Virginia is 32.8%. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>60.0%</span><br /><small>Overall Active comes from Less than $1,000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>78.4%</span><br /><small>$5,000 to $10,000 has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "AVERAGE_SPEND : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "average_spend-distribution-of-churn-fdvit8e83q",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across AVERAGE_SPEND</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/oy8hi1kt2c5h1z98",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1,000",
                                                "$1,000 to $5,000",
                                                "$5,000 to $10,000",
                                                "$10,000 to $20,000",
                                                "More than $20,000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            23.181818181818183,
                                                            24.8,
                                                            21.62162162162162,
                                                            66.66666666666667,
                                                            63.1578947368421
                                                        ],
                                                        [
                                                            "total",
                                                            3468,
                                                            2108,
                                                            272,
                                                            68,
                                                            408
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1,000",
                                                            "$1,000 to $5,000",
                                                            "$5,000 to $10,000",
                                                            "$10,000 to $20,000",
                                                            "More than $20,000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1,000",
                                                    "$1,000 to $5,000",
                                                    "$5,000 to $10,000",
                                                    "$10,000 to $20,000",
                                                    "More than $20,000"
                                                ],
                                                [
                                                    "total",
                                                    3468,
                                                    2108,
                                                    272,
                                                    68,
                                                    408
                                                ],
                                                [
                                                    "percentage",
                                                    23.181818181818183,
                                                    24.8,
                                                    21.62162162162162,
                                                    66.66666666666667,
                                                    63.1578947368421
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 632.755",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and AVERAGE_SPEND."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 AVERAGE_SPENDS(segment Less than $1,000 and segment $1,000 to $5,000) account for 88.2% of the observation from STATUS - Churn. Being the largest contributor, Less than $1,000 amounts to 3,468.0 that accounts for about 54.8% of the STATUS-Churn. On the other hand, $10,000 to $20,000 contributes to just 1.08% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Less than $1,000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, STATE and AMOUNT_PAID_NOVEMBER are some of the most important factors that describe the concentration of Churn from segment Less than $1,000 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Churn from segment Less than $1,000. It accounts for 95.1% of total Churn from segment Less than $1,000. The percentage of STATUS - Churn for Less than $1000 is 23.8%. </li> </li> <li> <b>STATE</b>: Among the STATES, Virginia has got the major chunk of STATUS - Churn from segment Less than $1,000, accounting for 38.2%. The percentage of STATUS - Churn for Virginia is 32.8%. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>54.8%</span><br /><small>Overall Churn comes from Less than $1,000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>66.7%</span><br /><small>$10,000 to $20,000 has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "AVERAGE_SPEND : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "AVERAGE_SPEND",
                        "slug": "average_spend-skmaqfzr3g"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "credit_rating-relationship-with-status-m447ed81np",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and CREDIT_RATING</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "CREDIT_RATING",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "Deep Prime",
                                                            2108,
                                                            1088,
                                                            3196
                                                        ],
                                                        [
                                                            "Near Prime",
                                                            5066,
                                                            2108,
                                                            7174
                                                        ],
                                                        [
                                                            "Prime",
                                                            6562,
                                                            1768,
                                                            8330
                                                        ],
                                                        [
                                                            "Sub Prime",
                                                            3366,
                                                            1122,
                                                            4488
                                                        ],
                                                        [
                                                            "Super Prime",
                                                            2040,
                                                            238,
                                                            2278
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "CREDIT_RATING",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "Deep Prime",
                                                            65.96,
                                                            34.04
                                                        ],
                                                        [
                                                            "Near Prime",
                                                            70.62,
                                                            29.38
                                                        ],
                                                        [
                                                            "Prime",
                                                            78.78,
                                                            21.22
                                                        ],
                                                        [
                                                            "Sub Prime",
                                                            75,
                                                            25
                                                        ],
                                                        [
                                                            "Super Prime",
                                                            89.55,
                                                            10.45
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> CREDIT_RATING is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Prime and segment Near Prime </b> are the two largest CREDIT_RATINGS, accounting for <b> 60.9% </b> of the total observations. <b>Segment Super Prime</b> is the smallest with <b>just 8.95%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment Super Prime</b> (10.4%). The segment <b> Deep Prime</b> has the <b>highest contribution of STATUS - Churn</b> (34.0%), which is 225.8% higher than segment Super Prime and 37.1% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Super Prime and segment Prime</b>, which cumulatively account for <b> 41.7% of the total </b>observations, has contributed to <b> 31.7% of the segment Churn</b>. <li>The <b>segment Near Prime</b> accounts for <b>28.2% of the total</b> observations, but it has contributed to <b>33.3% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment Deep Prime</b> seems to be the <b>least dominant segment</b> since 66.0% of its total observations are into that Active category. But,<b> segment Super Prime</b> has the <b>highest contribution of STATUS - Active</b> (89.6%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Near Prime and segment Deep Prime</b>, which cumulatively account for <b> 40.7% of the total </b>observations, have contributed to <b> 37.5% of the segment Active</b>. <li>The <b>segment Super Prime</b> accounts for <b>8.9% of the total</b> observations, but it has contributed to <b>10.7% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "CREDIT_RATING: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "credit_rating-distribution-of-active-5sd7zgt228",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across CREDIT_RATING</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/wkmzxr00oov08cst",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Deep Prime",
                                                "Near Prime",
                                                "Prime",
                                                "Sub Prime",
                                                "Super Prime"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            65.95744680851064,
                                                            70.61611374407583,
                                                            78.77551020408163,
                                                            75,
                                                            89.55223880597015
                                                        ],
                                                        [
                                                            "total",
                                                            2108,
                                                            5066,
                                                            6562,
                                                            3366,
                                                            2040
                                                        ],
                                                        [
                                                            "key",
                                                            "Deep Prime",
                                                            "Near Prime",
                                                            "Prime",
                                                            "Sub Prime",
                                                            "Super Prime"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Deep Prime",
                                                    "Near Prime",
                                                    "Prime",
                                                    "Sub Prime",
                                                    "Super Prime"
                                                ],
                                                [
                                                    "total",
                                                    2108,
                                                    5066,
                                                    6562,
                                                    3366,
                                                    2040
                                                ],
                                                [
                                                    "percentage",
                                                    65.95744680851064,
                                                    70.61611374407583,
                                                    78.77551020408163,
                                                    75,
                                                    89.55223880597015
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 535.533",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and CREDIT_RATING."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 CREDIT_RATINGS(segment Prime and segment Near Prime) account for 60.7% of the observation from STATUS - Active. Being the largest contributor, Prime amounts to 6,562.0 that accounts for about 34.3% of the STATUS-Active. On the other hand, Super Prime contributes to just 10.66% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Prime</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> There are some key factors(PAYMENT_NOVEMBER, STATE and AMOUNT_PAID_NOVEMBER) that explain why the concentration of Active from segment Prime is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>PAYMENT_NOVEMBER</b>: Among the PAYMENT_NOVEMBER, Within Due Date has got the major chunk of STATUS - Active from segment Prime, accounting for 93.5%. The percentage of STATUS - Active for Within Due Date is 28.0%. </li> </li> <li> <b>STATE</b>: Among the STATES, the top 4 STATES, including Virginia(29.0%) and Ohio(25.8%), contribute to 96.8% of the STATUS - Active observations from segment Prime. The percentage of STATUS - Active for Virginia and Ohio are 36.7% and 41.0% respectively. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>34.3%</span><br /><small>Overall Active comes from Prime</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>89.6%</span><br /><small>Super Prime has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "CREDIT_RATING : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "credit_rating-distribution-of-churn-sjfokshpbl",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across CREDIT_RATING</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/v7h12axnmp5xngiq",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Deep Prime",
                                                "Near Prime",
                                                "Prime",
                                                "Sub Prime",
                                                "Super Prime"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            34.04255319148936,
                                                            29.38388625592417,
                                                            21.224489795918366,
                                                            25,
                                                            10.447761194029852
                                                        ],
                                                        [
                                                            "total",
                                                            1088,
                                                            2108,
                                                            1768,
                                                            1122,
                                                            238
                                                        ],
                                                        [
                                                            "key",
                                                            "Deep Prime",
                                                            "Near Prime",
                                                            "Prime",
                                                            "Sub Prime",
                                                            "Super Prime"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Deep Prime",
                                                    "Near Prime",
                                                    "Prime",
                                                    "Sub Prime",
                                                    "Super Prime"
                                                ],
                                                [
                                                    "total",
                                                    1088,
                                                    2108,
                                                    1768,
                                                    1122,
                                                    238
                                                ],
                                                [
                                                    "percentage",
                                                    34.04255319148936,
                                                    29.38388625592417,
                                                    21.224489795918366,
                                                    25,
                                                    10.447761194029852
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 535.533",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and CREDIT_RATING."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 4 CREDIT_RATINGS(including segment Near Prime and segment Prime) account for 96.2% of the observation from STATUS - Churn. Being the largest contributor, Near Prime amounts to 2,108.0 that accounts for about 33.3% of the STATUS-Churn. On the other hand, Super Prime contributes to just 3.76% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Near Prime</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> There are some key factors(PAYMENT_NOVEMBER, STATE and AMOUNT_PAID_NOVEMBER) that explain why the concentration of Churn from segment Near Prime is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>PAYMENT_NOVEMBER</b>: Among the PAYMENT_NOVEMBER, Within Due Date has got the major chunk of STATUS - Churn from segment Near Prime, accounting for 93.5%. The percentage of STATUS - Churn for Within Due Date is 28.0%. </li> </li> <li> <b>STATE</b>: Among the STATES, the top 4 STATES, including Virginia(29.0%) and Ohio(25.8%), contribute to 96.8% of the STATUS - Churn observations from segment Near Prime. The percentage of STATUS - Churn for Virginia and Ohio are 36.7% and 41.0% respectively. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>33.3%</span><br /><small>Overall Churn comes from Near Prime</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>34.0%</span><br /><small>Deep Prime has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "CREDIT_RATING : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "CREDIT_RATING",
                        "slug": "credit_rating-j0ppn2wsfv"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "bill_amount_november-relationship-with-status-e0l88vageb",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and BILL_AMOUNT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "BILL_AMOUNT_NOVEMBER",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            11560,
                                                            3740,
                                                            15300
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            6188,
                                                            2176,
                                                            8364
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            1360,
                                                            272,
                                                            1632
                                                        ],
                                                        [
                                                            "$10000 to $20000",
                                                            34,
                                                            136,
                                                            170
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "BILL_AMOUNT_NOVEMBER",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            75.56,
                                                            24.44
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            73.98,
                                                            26.02
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            83.33,
                                                            16.67
                                                        ],
                                                        [
                                                            "$10000 to $20000",
                                                            20,
                                                            80
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_NOVEMBER is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Less than $1000 </b> is the largest BILL_AMOUNT_NOVEMBER, accounting for almost<b> 60.1% of the total </b>observations. <b>Segment $10000 to $20000</b> is the smallest with <b>just 0.67%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment $5000 to $10000</b> (16.7%). The segment <b> $10000 to $20000</b> has the <b>highest contribution of STATUS - Churn</b> (80.0%), which is 3.8 times higher than segment $5000 to $10000 and 222.2% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment $5000 to $10000</b>, which accounts for <b>6.4% of the total </b>observations, has contributed to <b>4.3% of the segment Churn</b>. <li>The <b>segment $1000 to $5000</b> accounts for <b>32.8% of the total</b> observations, but it has contributed to <b>34.4% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment $1000 to $5000</b> seems to be the <b>least dominant segment</b> since 74.0% of its total observations are into that Active category. But,<b> segment $5000 to $10000</b> has the <b>highest contribution of STATUS - Active</b> (83.3%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment $1000 to $5000</b>, which accounts for <b>32.8% of the total </b>observations, has contributed to <b>32.3% of the segment Active</b>. <li>The <b>segment $5000 to $10000</b> accounts for <b>6.4% of the total</b> observations, but it has contributed to <b>7.1% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_NOVEMBER: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "bill_amount_november-distribution-of-active-v3kc0lmem8",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across BILL_AMOUNT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/dv57otkjsyl9siyd",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1000",
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "$10000 to $20000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            75.55555555555556,
                                                            73.98373983739837,
                                                            83.33333333333333,
                                                            20
                                                        ],
                                                        [
                                                            "total",
                                                            11560,
                                                            6188,
                                                            1360,
                                                            34
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1000",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "$10000 to $20000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1000",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "$10000 to $20000"
                                                ],
                                                [
                                                    "total",
                                                    11560,
                                                    6188,
                                                    1360,
                                                    34
                                                ],
                                                [
                                                    "percentage",
                                                    75.55555555555556,
                                                    73.98373983739837,
                                                    83.33333333333333,
                                                    20
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 342.99",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and BILL_AMOUNT_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top BILL_AMOUNT_NOVEMBER(segment Less than $1000) accounts for 60.4% of the observation from STATUS - Active. The segment $10000 to $20000 contributes to just 0.18% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> High concentration of STATUS - Active from segment Less than $1000 is characterized by the influence of key dimensions, such as BILL_AMOUNT_DECEMBER, AVERAGE_SPEND and STATE. Certain specific segments from those factors are more likely to explain segment Less than $1000's significant rate of STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Among the BILL_AMOUNT_DECEMBER, Less than $1000 has got the major chunk of STATUS - Active from segment Less than $1000, accounting for 97.3%. The percentage of STATUS - Active for Less than $1000 is 25.0%. </li> </li> <li> <b>AVERAGE_SPEND</b>: Among the AVERAGE_SPENDS, Less than $1,000 has got the major chunk of STATUS - Active from segment Less than $1000, accounting for 88.2%. The percentage of STATUS - Active for Less than $1,000 is 23.4%. </li> </li> <li> <b>STATE</b>: The top 4 STATES, including Virginia(35.5%) and Ohio(27.3%), account for 95.5% of the total Active observations from segment Less than $1000. The percentage of STATUS - Active for Virginia and Ohio are 33.9% and 33.3% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>60.4%</span><br /><small>Overall Active comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>83.3%</span><br /><small>$5000 to $10000 has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_NOVEMBER : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "bill_amount_november-distribution-of-churn-azuecu52re",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across BILL_AMOUNT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/cjp47k3uh0x1mhb1",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1000",
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "$10000 to $20000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            24.444444444444443,
                                                            26.016260162601625,
                                                            16.666666666666668,
                                                            80
                                                        ],
                                                        [
                                                            "total",
                                                            3740,
                                                            2176,
                                                            272,
                                                            136
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1000",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "$10000 to $20000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1000",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "$10000 to $20000"
                                                ],
                                                [
                                                    "total",
                                                    3740,
                                                    2176,
                                                    272,
                                                    136
                                                ],
                                                [
                                                    "percentage",
                                                    24.444444444444443,
                                                    26.016260162601625,
                                                    16.666666666666668,
                                                    80
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 342.99",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and BILL_AMOUNT_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 BILL_AMOUNT_NOVEMBER(segment Less than $1000 and segment $1000 to $5000) account for 93.5% of the observation from STATUS - Churn. Being the largest contributor, Less than $1000 amounts to 3,740.0 that accounts for about 59.1% of the STATUS-Churn. On the other hand, $10000 to $20000 contributes to just 2.15% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> High concentration of STATUS - Churn from segment Less than $1000 is characterized by the influence of key dimensions, such as BILL_AMOUNT_DECEMBER, AVERAGE_SPEND and STATE. Certain specific segments from those factors are more likely to explain segment Less than $1000's significant rate of STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Among the BILL_AMOUNT_DECEMBER, Less than $1000 has got the major chunk of STATUS - Churn from segment Less than $1000, accounting for 97.3%. The percentage of STATUS - Churn for Less than $1000 is 25.0%. </li> </li> <li> <b>AVERAGE_SPEND</b>: Among the AVERAGE_SPENDS, Less than $1,000 has got the major chunk of STATUS - Churn from segment Less than $1000, accounting for 88.2%. The percentage of STATUS - Churn for Less than $1,000 is 23.4%. </li> </li> <li> <b>STATE</b>: The top 4 STATES, including Virginia(35.5%) and Ohio(27.3%), account for 95.5% of the total Churn observations from segment Less than $1000. The percentage of STATUS - Churn for Virginia and Ohio are 33.9% and 33.3% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>59.1%</span><br /><small>Overall Churn comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>80.0%</span><br /><small>$10000 to $20000 has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_NOVEMBER : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "BILL_AMOUNT_NOVEMBER",
                        "slug": "bill_amount_november-09624k4nmv"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "credit_balance-relationship-with-status-93p3a9pfb1",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and CREDIT_BALANCE</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "CREDIT_BALANCE",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "300 to 4,500",
                                                            9418,
                                                            3774,
                                                            13192
                                                        ],
                                                        [
                                                            "4,500 to 8,700",
                                                            6256,
                                                            1734,
                                                            7990
                                                        ],
                                                        [
                                                            "8,700 to 12,900",
                                                            2550,
                                                            714,
                                                            3264
                                                        ],
                                                        [
                                                            "12,900 to 17,100",
                                                            680,
                                                            102,
                                                            782
                                                        ],
                                                        [
                                                            "17,100 to 21,300",
                                                            238,
                                                            0,
                                                            238
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "CREDIT_BALANCE",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "300 to 4,500",
                                                            71.39,
                                                            28.61
                                                        ],
                                                        [
                                                            "4,500 to 8,700",
                                                            78.3,
                                                            21.7
                                                        ],
                                                        [
                                                            "8,700 to 12,900",
                                                            78.13,
                                                            21.88
                                                        ],
                                                        [
                                                            "12,900 to 17,100",
                                                            86.96,
                                                            13.04
                                                        ],
                                                        [
                                                            "17,100 to 21,300",
                                                            100,
                                                            0
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> CREDIT_BALANCE is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment 300 to 4,500 </b> is the largest CREDIT_BALANCE, accounting for almost<b> 51.8% of the total </b>observations. <b>Segment 17,100 to 21,300</b> is the smallest with <b>just 0.93%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of Churn</b> is the <b> lowest for the segment 12,900 to 17,100</b> (13.0%). The segment <b> 300 to 4,500</b> has the <b>highest contribution of Churn</b> (28.6%), which is 119.3% higher than segment 12,900 to 17,100 and 15.2% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment 4,500 to 8,700 and segment 8,700 to 12,900</b>, which cumulatively account for <b>44.2% of the total </b>observations, has contributed to <b> 38.7% of total Churn</b>.</li> <li>The segment <b>300 to 4,500</b> accounts for <b>51.8% of the total</b> observations, but it has contributed to <b>59.7% of total Churn</b>. </li> <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>Active, segment 300 to 4,500</b> seems to be the <b>least dominant segment</b> since 71.4% of its total observations are into Active category. But,<b> segment 17,100 to 21,300</b> has the <b>highest contribution of Active</b> (100.0%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The segment <b> 300 to 4,500</b>, which accounts for <b>51.8% of the total </b>observations, has contributed to <b>49.2% of total Active</b>.</li> <li>The segment <b>4,500 to 8,700</b> accounts for <b>31.4% of the total</b> observations, but it has contributed to <b>32.7% of total Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "CREDIT_BALANCE: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "credit_balance-distribution-of-active-0rjmaatlpc",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across CREDIT_BALANCE</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/zgph41d4y922gmw9",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "300 to 4,500",
                                                "4,500 to 8,700",
                                                "8,700 to 12,900",
                                                "12,900 to 17,100",
                                                "17,100 to 21,300"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            71.3917525773196,
                                                            78.29787234042553,
                                                            78.125,
                                                            86.95652173913044,
                                                            100
                                                        ],
                                                        [
                                                            "total",
                                                            9418,
                                                            6256,
                                                            2550,
                                                            680,
                                                            238
                                                        ],
                                                        [
                                                            "key",
                                                            "300 to 4,500",
                                                            "4,500 to 8,700",
                                                            "8,700 to 12,900",
                                                            "12,900 to 17,100",
                                                            "17,100 to 21,300"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "300 to 4,500",
                                                    "4,500 to 8,700",
                                                    "8,700 to 12,900",
                                                    "12,900 to 17,100",
                                                    "17,100 to 21,300"
                                                ],
                                                [
                                                    "total",
                                                    9418,
                                                    6256,
                                                    2550,
                                                    680,
                                                    238
                                                ],
                                                [
                                                    "percentage",
                                                    71.3917525773196,
                                                    78.29787234042553,
                                                    78.125,
                                                    86.95652173913044,
                                                    100
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 294.842",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and CREDIT_BALANCE."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 CREDIT_BALANCES(segment 300 to 4,500 and segment 4,500 to 8,700) account for 81.9% of the total Active observations. Being the largest contributor, 300 to 4,500 amounts to 9,418.0 that accounts for about 49.2% of the total Active. On the other hand, 17,100 to 21,300 contributes to just 1.24% of the total Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing Active from 300 to 4,500</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, PAYMENT_NOVEMBER and STATE are some of the most important factors that describe the concentration of Active from segment 300 to 4,500 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Some of the BILL_AMOUNT_DECEMBER(Less than $1000(62.2%) and $1000 to $5000(36.9%)) account for a significant portion of Active observations from segment 300 to 4,500. They cumulatively account for about 99.1% of the total Active from segment 300 to 4,500. The percentage of Active for Less than $1000 and $1000 to $5000 are 29.1% and 27.3% respectively. </li> </li> <li> <b>PAYMENT_NOVEMBER</b>: Within Due Date plays a key role in explaining the high concentration of Active from segment 300 to 4,500. It accounts for 94.6% of total Active from segment 300 to 4,500. The percentage of Active for Within Due Date is 27.7%. </li> </li> <li> <b>STATE</b>: Virginia plays a key role in explaining the high concentration of Active from segment 300 to 4,500. It accounts for 38.7% of total Active from segment 300 to 4,500. The percentage of Active for Virginia is 41.4%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>49.2%</span><br /><small>Overall Active comes from 300 to 4,500</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>17,100 to 21,300 has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "CREDIT_BALANCE : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "credit_balance-distribution-of-churn-qkjpzfg9nl",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across CREDIT_BALANCE</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/8ey0khj7qzgswbad",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "300 to 4,500",
                                                "4,500 to 8,700",
                                                "8,700 to 12,900",
                                                "12,900 to 17,100",
                                                "17,100 to 21,300"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            28.608247422680414,
                                                            21.70212765957447,
                                                            21.875,
                                                            13.043478260869565,
                                                            0
                                                        ],
                                                        [
                                                            "total",
                                                            3774,
                                                            1734,
                                                            714,
                                                            102,
                                                            0
                                                        ],
                                                        [
                                                            "key",
                                                            "300 to 4,500",
                                                            "4,500 to 8,700",
                                                            "8,700 to 12,900",
                                                            "12,900 to 17,100",
                                                            "17,100 to 21,300"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "300 to 4,500",
                                                    "4,500 to 8,700",
                                                    "8,700 to 12,900",
                                                    "12,900 to 17,100",
                                                    "17,100 to 21,300"
                                                ],
                                                [
                                                    "total",
                                                    3774,
                                                    1734,
                                                    714,
                                                    102,
                                                    0
                                                ],
                                                [
                                                    "percentage",
                                                    28.608247422680414,
                                                    21.70212765957447,
                                                    21.875,
                                                    13.043478260869565,
                                                    0
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 294.842",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and CREDIT_BALANCE."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top CREDIT_BALANCE(segment 300 to 4,500) accounts for 59.7% of the total Churn observations. The segment 17,100 to 21,300 contributes to just 0.0% of the total Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing Churn from 300 to 4,500</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, PAYMENT_NOVEMBER and STATE are some of the most important factors that describe the concentration of Churn from segment 300 to 4,500 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Some of the BILL_AMOUNT_DECEMBER(Less than $1000(62.2%) and $1000 to $5000(36.9%)) account for a significant portion of Churn observations from segment 300 to 4,500. They cumulatively account for about 99.1% of the total Churn from segment 300 to 4,500. The percentage of Churn for Less than $1000 and $1000 to $5000 are 29.1% and 27.3% respectively. </li> </li> <li> <b>PAYMENT_NOVEMBER</b>: Within Due Date plays a key role in explaining the high concentration of Churn from segment 300 to 4,500. It accounts for 94.6% of total Churn from segment 300 to 4,500. The percentage of Churn for Within Due Date is 27.7%. </li> </li> <li> <b>STATE</b>: Virginia plays a key role in explaining the high concentration of Churn from segment 300 to 4,500. It accounts for 38.7% of total Churn from segment 300 to 4,500. The percentage of Churn for Virginia is 41.4%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>59.7%</span><br /><small>Overall Churn comes from 300 to 4,500</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>28.6%</span><br /><small>300 to 4,500 has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "CREDIT_BALANCE : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "CREDIT_BALANCE",
                        "slug": "credit_balance-yahg2onh73"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "amount_paid_november-relationship-with-status-l8iu3qqp7h",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and AMOUNT_PAID_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "AMOUNT_PAID_NOVEMBER",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            680,
                                                            0,
                                                            680
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            34,
                                                            0,
                                                            34
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            18428,
                                                            6324,
                                                            24752
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "AMOUNT_PAID_NOVEMBER",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            100,
                                                            0
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            100,
                                                            0
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            74.45,
                                                            25.55
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> AMOUNT_PAID_NOVEMBER is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Less than $1000 </b> is the largest AMOUNT_PAID_NOVEMBER, accounting for almost<b> 97.2% of the total </b>observations. <b>Segment $5000 to $10000</b> is the smallest with <b>just 0.13%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest(0.0%) for the segments $1000 to $5000</b> and $5000 to $10000</b>. The segment <b> Less than $1000</b> has the <b>highest contribution of STATUS - Churn</b> (25.5%), which is 2.9% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment $1000 to $5000</b>, which accounts for <b>2.7% of the total </b>observations, has contributed to <b>0.0% of the segment Churn</b>. <li>The <b>segment Less than $1000</b> accounts for <b>97.2% of the total</b> observations, but it has contributed to <b>100.0% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment Less than $1000</b> seems to be the <b>least dominant segment</b> since 74.5% of its total observations are into that Active category. But,<b> segment $1000 to $5000 and segment $5000 to $10000</b> have the <b>highest contribution of STATUS - Active</b> (100.0%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment Less than $1000</b>, which accounts for <b>97.2% of the total </b>observations, has contributed to <b>96.3% of the segment Active</b>. <li>The <b>segment $1000 to $5000</b> accounts for <b>2.7% of the total</b> observations, but it has contributed to <b>3.6% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "AMOUNT_PAID_NOVEMBER: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "amount_paid_november-distribution-of-active-vqau4bl4o0",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across AMOUNT_PAID_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/edizv9kc2e5z4jpm",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "Less than $1000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            100,
                                                            100,
                                                            74.45054945054945
                                                        ],
                                                        [
                                                            "total",
                                                            680,
                                                            34,
                                                            18428
                                                        ],
                                                        [
                                                            "key",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "Less than $1000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "Less than $1000"
                                                ],
                                                [
                                                    "total",
                                                    680,
                                                    34,
                                                    18428
                                                ],
                                                [
                                                    "percentage",
                                                    100,
                                                    100,
                                                    74.45054945054945
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 242.691",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and AMOUNT_PAID_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top AMOUNT_PAID_NOVEMBER(segment Less than $1000) accounts for 96.3% of the observation from STATUS - Active. The segment $5000 to $10000 contributes to just 0.18% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> There are some key factors(STATE, BILL_AMOUNT_DECEMBER and BILL_AMOUNT_NOVEMBER) that explain why the concentration of Active from segment Less than $1000 is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>STATE</b>: Some of the STATES(including Virginia(33.9%) and Ohio(26.3%)) account for a significant portion of STATUS - Active observations from segment Less than $1000. They cumulatively account for about 95.7% of the STATUS - Active from segment Less than $1000. The percentage of STATUS - Active for Virginia and Ohio are 32.6% and 33.6% respectively. </li> </li> <li> <b>BILL_AMOUNT_DECEMBER</b>: Some of the BILL_AMOUNT_DECEMBER(Less than $1000(59.7%) and $1000 to $5000(32.8%)) account for a significant portion of STATUS - Active observations from segment Less than $1000. They cumulatively account for about 92.5% of the STATUS - Active from segment Less than $1000. The percentage of STATUS - Active for Less than $1000 and $1000 to $5000 are 25.8% and 25.3% respectively. </li> </li> <li> <b>BILL_AMOUNT_NOVEMBER</b>: The top 2 BILL_AMOUNT_NOVEMBER, Less than $1000(59.1%) and $1000 to $5000(34.4%), account for 93.5% of the total Active observations from segment Less than $1000. The percentage of STATUS - Active for Less than $1000 and $1000 to $5000 are 25.1% and 26.9% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>96.3%</span><br /><small>Overall Active comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>$1000 to $5000 has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "AMOUNT_PAID_NOVEMBER : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "amount_paid_november-distribution-of-churn-i9buo83u5l",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across AMOUNT_PAID_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/ydqwzjdwr0s4gxcf",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "Less than $1000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            0,
                                                            0,
                                                            25.54945054945055
                                                        ],
                                                        [
                                                            "total",
                                                            0,
                                                            0,
                                                            6324
                                                        ],
                                                        [
                                                            "key",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "Less than $1000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "Less than $1000"
                                                ],
                                                [
                                                    "total",
                                                    0,
                                                    0,
                                                    6324
                                                ],
                                                [
                                                    "percentage",
                                                    0,
                                                    0,
                                                    25.54945054945055
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 242.691",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and AMOUNT_PAID_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top AMOUNT_PAID_NOVEMBER(segment Less than $1000) accounts for 100.0% of the observation from STATUS - Churn. The segment $1000 to $5000 contributes to just 0.0% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> There are some key factors(STATE, BILL_AMOUNT_DECEMBER and BILL_AMOUNT_NOVEMBER) that explain why the concentration of Churn from segment Less than $1000 is very high. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>STATE</b>: Some of the STATES(including Virginia(33.9%) and Ohio(26.3%)) account for a significant portion of STATUS - Churn observations from segment Less than $1000. They cumulatively account for about 95.7% of the STATUS - Churn from segment Less than $1000. The percentage of STATUS - Churn for Virginia and Ohio are 32.6% and 33.6% respectively. </li> </li> <li> <b>BILL_AMOUNT_DECEMBER</b>: Some of the BILL_AMOUNT_DECEMBER(Less than $1000(59.7%) and $1000 to $5000(32.8%)) account for a significant portion of STATUS - Churn observations from segment Less than $1000. They cumulatively account for about 92.5% of the STATUS - Churn from segment Less than $1000. The percentage of STATUS - Churn for Less than $1000 and $1000 to $5000 are 25.8% and 25.3% respectively. </li> </li> <li> <b>BILL_AMOUNT_NOVEMBER</b>: The top 2 BILL_AMOUNT_NOVEMBER, Less than $1000(59.1%) and $1000 to $5000(34.4%), account for 93.5% of the total Churn observations from segment Less than $1000. The percentage of STATUS - Churn for Less than $1000 and $1000 to $5000 are 25.1% and 26.9% respectively. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>100.0%</span><br /><small>Overall Churn comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>25.5%</span><br /><small>Less than $1000 has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "AMOUNT_PAID_NOVEMBER : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "AMOUNT_PAID_NOVEMBER",
                        "slug": "amount_paid_november-en2n41yuqe"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "payment_november-relationship-with-status-6c579re89e",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and PAYMENT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "PAYMENT_NOVEMBER",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "After 3 Months",
                                                            136,
                                                            204,
                                                            340
                                                        ],
                                                        [
                                                            "Within Due Date",
                                                            19006,
                                                            6120,
                                                            25126
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "PAYMENT_NOVEMBER",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "After 3 Months",
                                                            40,
                                                            60
                                                        ],
                                                        [
                                                            "Within Due Date",
                                                            75.64,
                                                            24.36
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> PAYMENT_NOVEMBER is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Within Due Date </b> is the largest PAYMENT_NOVEMBER, accounting for almost<b> 98.7% of the total </b>observations. <b>Segment After 3 Months</b> is the smallest with <b>just 1.34%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment Within Due Date</b> (24.4%). The segment <b> After 3 Months</b> has the <b>highest contribution of STATUS - Churn</b> (60.0%), which is 141.6% higher than the overall. <ul> <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment Within Due Date</b> seems to be the <b>least dominant segment</b> since 75.6% of its total observations are into that Active category. But,<b> segment Within Due Date</b> has the <b>highest contribution of STATUS - Active</b> (75.6%). <ul> <ul> </p>"
                                    }
                                ],
                                "name": "PAYMENT_NOVEMBER: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "payment_november-distribution-of-active-gjpockqf3e",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across PAYMENT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/qp0ktumq9cyajylw",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "After 3 Months",
                                                "Within Due Date"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            40,
                                                            75.64276048714478
                                                        ],
                                                        [
                                                            "total",
                                                            136,
                                                            19006
                                                        ],
                                                        [
                                                            "key",
                                                            "After 3 Months",
                                                            "Within Due Date"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "After 3 Months",
                                                    "Within Due Date"
                                                ],
                                                [
                                                    "total",
                                                    136,
                                                    19006
                                                ],
                                                [
                                                    "percentage",
                                                    40,
                                                    75.64276048714478
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 228.311",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and PAYMENT_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top PAYMENT_NOVEMBER(segment Within Due Date) accounts for 99.3% of the observation from STATUS - Active. The segment After 3 Months contributes to just 0.71% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Within Due Date</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, BILL_AMOUNT_NOVEMBER and AMOUNT_PAID_NOVEMBER are some of the most important factors that describe the concentration of Active from segment Within Due Date Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Among the BILL_AMOUNT_DECEMBER, Less than $1000 has got the major chunk of STATUS - Active from segment Within Due Date, accounting for 60.6%. The percentage of STATUS - Active for Less than $1000 is 24.9%. </li> </li> <li> <b>BILL_AMOUNT_NOVEMBER</b>: The top 2 BILL_AMOUNT_NOVEMBER, Less than $1000(60.0%) and $1000 to $5000(33.3%), account for 93.3% of the total Active observations from segment Within Due Date. The percentage of STATUS - Active for Less than $1000 and $1000 to $5000 are 24.3% and 24.8% respectively. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>99.3%</span><br /><small>Overall Active comes from Within Due Date</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>75.6%</span><br /><small>Within Due Date has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "PAYMENT_NOVEMBER : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "payment_november-distribution-of-churn-o2vuzhh2rm",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across PAYMENT_NOVEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/wmkj3fcq56iekdas",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "After 3 Months",
                                                "Within Due Date"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            60,
                                                            24.35723951285521
                                                        ],
                                                        [
                                                            "total",
                                                            204,
                                                            6120
                                                        ],
                                                        [
                                                            "key",
                                                            "After 3 Months",
                                                            "Within Due Date"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "After 3 Months",
                                                    "Within Due Date"
                                                ],
                                                [
                                                    "total",
                                                    204,
                                                    6120
                                                ],
                                                [
                                                    "percentage",
                                                    60,
                                                    24.35723951285521
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 228.311",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and PAYMENT_NOVEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top PAYMENT_NOVEMBER(segment Within Due Date) accounts for 96.8% of the observation from STATUS - Churn. The segment After 3 Months contributes to just 3.23% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Within Due Date</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER, BILL_AMOUNT_NOVEMBER and AMOUNT_PAID_NOVEMBER are some of the most important factors that describe the concentration of Churn from segment Within Due Date Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_DECEMBER</b>: Among the BILL_AMOUNT_DECEMBER, Less than $1000 has got the major chunk of STATUS - Churn from segment Within Due Date, accounting for 60.6%. The percentage of STATUS - Churn for Less than $1000 is 24.9%. </li> </li> <li> <b>BILL_AMOUNT_NOVEMBER</b>: The top 2 BILL_AMOUNT_NOVEMBER, Less than $1000(60.0%) and $1000 to $5000(33.3%), account for 93.3% of the total Churn observations from segment Within Due Date. The percentage of STATUS - Churn for Less than $1000 and $1000 to $5000 are 24.3% and 24.8% respectively. </li> </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>96.8%</span><br /><small>Overall Churn comes from Within Due Date</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>60.0%</span><br /><small>After 3 Months has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "PAYMENT_NOVEMBER : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "PAYMENT_NOVEMBER",
                        "slug": "payment_november-xx1fajqw6q"
                    },
                    {
                        "listOfNodes": [],
                        "listOfCards": [
                            {
                                "slug": "bill_amount_december-relationship-with-status-f2eo9edcgg",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Relationship between STATUS  and BILL_AMOUNT_DECEMBER</h3>"
                                    },
                                    {
                                        "dataType": "toggle",
                                        "data": {
                                            "toggleoff": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "BILL_AMOUNT_DECEMBER",
                                                            "Active",
                                                            "Churn",
                                                            "Total"
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            11254,
                                                            3774,
                                                            15028
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            6392,
                                                            2074,
                                                            8466
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            1428,
                                                            340,
                                                            1768
                                                        ],
                                                        [
                                                            "$10000 to $20000",
                                                            68,
                                                            136,
                                                            204
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            },
                                            "toggleon": {
                                                "dataType": "table",
                                                "data": {
                                                    "tableData": [
                                                        [
                                                            "BILL_AMOUNT_DECEMBER",
                                                            "Active",
                                                            "Churn"
                                                        ],
                                                        [
                                                            "Less than $1000",
                                                            74.89,
                                                            25.11
                                                        ],
                                                        [
                                                            "$1000 to $5000",
                                                            75.5,
                                                            24.5
                                                        ],
                                                        [
                                                            "$5000 to $10000",
                                                            80.77,
                                                            19.23
                                                        ],
                                                        [
                                                            "$10000 to $20000",
                                                            33.33,
                                                            66.67
                                                        ]
                                                    ],
                                                    "tableType": "heatMap"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h4>Overview</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_DECEMBER is one of <b>the most significant influencers</b> of STATUS and displays significant variation in distribution of STATUS categories. <b>Segment Less than $1000 and segment $1000 to $5000 </b> are the two largest BILL_AMOUNT_DECEMBER, accounting for <b> 92.3% </b> of the total observations. <b>Segment $10000 to $20000</b> is the smallest with <b>just 0.8%</b> of the total observations. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Churn</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> The <b>percentage contribution of STATUS - Churn</b> is the <b> lowest for the segment $5000 to $10000</b> (19.2%). The segment <b> $10000 to $20000</b> has the <b>highest contribution of STATUS - Churn</b> (66.7%), which is 246.7% higher than segment $5000 to $10000 and 168.5% higher than the overall. "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment $5000 to $10000</b>, which accounts for <b>6.9% of the total </b>observations, has contributed to <b>5.4% of the segment Churn</b>. <li>The <b>segment $10000 to $20000</b> accounts for <b>0.8% of the total</b> observations, but it has contributed to <b>2.2% of the segment Churn</b>. <ul> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key segments of STATUS - Active</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> When it comes to <b>STATUS - Active, segment Less than $1000</b> seems to be the <b>least dominant segment</b> since 74.9% of its total observations are into that Active category. But,<b> segment $5000 to $10000</b> has the <b>highest contribution of STATUS - Active</b> (80.8%). "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": "highlight",
                                        "data": " <ul> <li>The <b>segment $10000 to $20000</b>, which accounts for <b>0.8% of the total </b>observations, has contributed to <b>0.4% of the segment Active</b>. <li>The <b>segment $5000 to $10000</b> accounts for <b>6.9% of the total</b> observations, but it has contributed to <b>7.5% of the segment Active</b>.</li> <ul> </p>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_DECEMBER: Relationship with STATUS",
                                "cardWidth": 100
                            },
                            {
                                "slug": "bill_amount_december-distribution-of-active-b4e7j9or0e",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Active) across BILL_AMOUNT_DECEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/jr38ildno6b4hrh7",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1000",
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "$10000 to $20000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            74.8868778280543,
                                                            75.50200803212851,
                                                            80.76923076923077,
                                                            33.333333333333336
                                                        ],
                                                        [
                                                            "total",
                                                            11254,
                                                            6392,
                                                            1428,
                                                            68
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1000",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "$10000 to $20000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Active",
                                                        "total": "# of Active"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1000",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "$10000 to $20000"
                                                ],
                                                [
                                                    "total",
                                                    11254,
                                                    6392,
                                                    1428,
                                                    68
                                                ],
                                                [
                                                    "percentage",
                                                    74.8868778280543,
                                                    75.50200803212851,
                                                    80.76923076923077,
                                                    33.333333333333336
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 222.128",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and BILL_AMOUNT_DECEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 BILL_AMOUNT_DECEMBER(segment Less than $1000 and segment $1000 to $5000) account for 92.2% of the observation from STATUS - Active. Being the largest contributor, Less than $1000 amounts to 11,254.0 that accounts for about 58.8% of the STATUS-Active. On the other hand, $10000 to $20000 contributes to just 0.36% of the STATUS - Active. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Active from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_NOVEMBER, CREDIT_RATING and AVERAGE_SPEND are some of the most important factors that describe the concentration of Active from segment Less than $1000 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_NOVEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Active from segment Less than $1000. It accounts for 96.4% of total Active from segment Less than $1000. The percentage of STATUS - Active for Less than $1000 is 25.0%. </li> </li> <li> <b>CREDIT_RATING</b>: The top 4 CREDIT_RATINGS, including Deep Prime(28.8%) and Prime(27.9%), account for 95.5% of the total Active observations from segment Less than $1000. The percentage of STATUS - Active for Deep Prime and Prime are 34.4% and 22.8% respectively. </li> </li> <li> <b>AVERAGE_SPEND</b>: Less than $1,000 plays a key role in explaining the high concentration of STATUS - Active from segment Less than $1000. It accounts for 87.4% of total Active from segment Less than $1000. The percentage of STATUS - Active for Less than $1,000 is 23.8%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>58.8%</span><br /><small>Overall Active comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>80.8%</span><br /><small>$5000 to $10000 has the highest rate of Active</small></h2></div>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_DECEMBER : Distribution of Active",
                                "cardWidth": 100
                            },
                            {
                                "slug": "bill_amount_december-distribution-of-churn-bn2kf1gc4c",
                                "cardType": "normal",
                                "cardData": [
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<h3>Distribution of STATUS (Churn) across BILL_AMOUNT_DECEMBER</h3>"
                                    },
                                    {
                                        "dataType": "c3Chart",
                                        "widthPercent": 100,
                                        "data": {
                                            "download_url": "/api/download_data/ijg0n3r2arsdrwxv",
                                            "y2format": ".2s",
                                            "xdata": [
                                                "Less than $1000",
                                                "$1000 to $5000",
                                                "$5000 to $10000",
                                                "$10000 to $20000"
                                            ],
                                            "chart_c3": {
                                                "bar": {
                                                    "width": {
                                                        "ratio": 0.5
                                                    }
                                                },
                                                "point": null,
                                                "color": {
                                                    "pattern": [
                                                        "#005662",
                                                        "#0fc4b5",
                                                        "#148071",
                                                        "#6cba86",
                                                        "#bcf3a2"
                                                    ]
                                                },
                                                "tooltip": {
                                                    "show": true,
                                                    "format": {
                                                        "title": ".2s"
                                                    }
                                                },
                                                "padding": {
                                                    "top": 40
                                                },
                                                "grid": {
                                                    "y": {
                                                        "show": true
                                                    },
                                                    "x": {
                                                        "show": true
                                                    }
                                                },
                                                "subchart": null,
                                                "axis": {
                                                    "y": {
                                                        "tick": {
                                                            "outer": false,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Count",
                                                            "position": "outer-middle"
                                                        }
                                                    },
                                                    "x": {
                                                        "height": 95,
                                                        "tick": {
                                                            "rotate": -45,
                                                            "multiline": false,
                                                            "fit": false,
                                                            "format": ".2s"
                                                        },
                                                        "type": "category",
                                                        "label": {
                                                            "text": " ",
                                                            "position": "outer-center"
                                                        }
                                                    },
                                                    "y2": {
                                                        "show": true,
                                                        "tick": {
                                                            "count": 7,
                                                            "multiline": true,
                                                            "format": ".2s"
                                                        },
                                                        "label": {
                                                            "text": "Percentage",
                                                            "position": "outer-middle"
                                                        }
                                                    }
                                                },
                                                "data": {
                                                    "axes": {
                                                        "percentage": "y2"
                                                    },
                                                    "columns": [
                                                        [
                                                            "percentage",
                                                            25.1131221719457,
                                                            24.497991967871485,
                                                            19.23076923076923,
                                                            66.66666666666667
                                                        ],
                                                        [
                                                            "total",
                                                            3774,
                                                            2074,
                                                            340,
                                                            136
                                                        ],
                                                        [
                                                            "key",
                                                            "Less than $1000",
                                                            "$1000 to $5000",
                                                            "$5000 to $10000",
                                                            "$10000 to $20000"
                                                        ]
                                                    ],
                                                    "x": "key",
                                                    "type": "combination",
                                                    "types": {
                                                        "percentage": "line",
                                                        "total": "bar"
                                                    },
                                                    "names": {
                                                        "percentage": "% of Churn",
                                                        "total": "# of Churn"
                                                    }
                                                },
                                                "legend": {
                                                    "show": true
                                                },
                                                "size": {
                                                    "height": 340
                                                }
                                            },
                                            "yformat": ".2s",
                                            "table_c3": [
                                                [
                                                    "key",
                                                    "Less than $1000",
                                                    "$1000 to $5000",
                                                    "$5000 to $10000",
                                                    "$10000 to $20000"
                                                ],
                                                [
                                                    "total",
                                                    3774,
                                                    2074,
                                                    340,
                                                    136
                                                ],
                                                [
                                                    "percentage",
                                                    25.1131221719457,
                                                    24.497991967871485,
                                                    19.23076923076923,
                                                    66.66666666666667
                                                ]
                                            ]
                                        },
                                        "chartInfo": [
                                            "Test Type              : Chi-Square",
                                            "Chi-Square statistic   : 222.128",
                                            "P-Value                : 0.0",
                                            "Inference              : Chi-squared analysis shows a significant association between STATUS (target) and BILL_AMOUNT_DECEMBER."
                                        ]
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<p class = \"txt-justify\"> The top 2 BILL_AMOUNT_DECEMBER(segment Less than $1000 and segment $1000 to $5000) account for 92.5% of the observation from STATUS - Churn. Being the largest contributor, Less than $1000 amounts to 3,774.0 that accounts for about 59.7% of the STATUS-Churn. On the other hand, $10000 to $20000 contributes to just 2.15% of the STATUS - Churn. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <h4>Key Factors influencing STATUS - Churn from Less than $1000</h4> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> BILL_AMOUNT_NOVEMBER, CREDIT_RATING and AVERAGE_SPEND are some of the most important factors that describe the concentration of Churn from segment Less than $1000 Value category. </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": " <p class = \"txt-justify\"> <ul> <li> <b>BILL_AMOUNT_NOVEMBER</b>: Less than $1000 plays a key role in explaining the high concentration of STATUS - Churn from segment Less than $1000. It accounts for 96.4% of total Churn from segment Less than $1000. The percentage of STATUS - Churn for Less than $1000 is 25.0%. </li> </li> <li> <b>CREDIT_RATING</b>: The top 4 CREDIT_RATINGS, including Deep Prime(28.8%) and Prime(27.9%), account for 95.5% of the total Churn observations from segment Less than $1000. The percentage of STATUS - Churn for Deep Prime and Prime are 34.4% and 22.8% respectively. </li> </li> <li> <b>AVERAGE_SPEND</b>: Less than $1,000 plays a key role in explaining the high concentration of STATUS - Churn from segment Less than $1000. It accounts for 87.4% of total Churn from segment Less than $1000. The percentage of STATUS - Churn for Less than $1,000 is 23.8%. </li> </li> </p> "
                                    },
                                    {
                                        "dataType": "html",
                                        "classTag": null,
                                        "data": "<div class='col-md-6 col-xs-12'><h2 class='text-center'><span>59.7%</span><br /><small>Overall Churn comes from Less than $1000</small></h2></div><div class='col-md-6 col-xs-12'><h2 class='text-center'><span>66.7%</span><br /><small>$10000 to $20000 has the highest rate of Churn</small></h2></div>"
                                    }
                                ],
                                "name": "BILL_AMOUNT_DECEMBER : Distribution of Churn",
                                "cardWidth": 100
                            }
                        ],
                        "name": "BILL_AMOUNT_DECEMBER",
                        "slug": "bill_amount_december-c35pvc63dv"
                    }
                ],
                "listOfCards": [],
                "name": "Association",
                "slug": "association-kkxtp7m1nh"
            },
            {
                "listOfNodes": [],
                "listOfCards": [
                    {
                        "cardWidth": 100,
                        "cardType": "normal",
                        "cardData": [
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": "<h3>Predicting the Key Drivers of STATUS</h3> "
                            },
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": " <p> mAdvisor has arrived at a set of prediction rules for the data set. Here is the summary of the prediction results along with the rules for prediction </p> "
                            },
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": " <div className='col-md-3 pred_disp_block cursor'> <a> <h1>9 <small> Strong Signals </small> </h1> </a> <p> Rules leading to a single outcome More than 75% of the time. </p> </div> "
                            },
                            {
                                "dataType": "html",
                                "classTag": null,
                                "data": " <div className='col-md-3 pred_disp_block cursor'> <a> <h1>4 <small>Mixed Signals </small> </h1> </a> <p> Rules leading to multiple outcomes therefore these signals must be considered all together </p> </div>"
                            },
                            {
                                "dataType": "c3Chart",
                                "widthPercent": 45,
                                "data": {
                                    "chart_c3": {
                                        "color": {
                                            "pattern": [
                                                "#0fc4b5",
                                                "#005662",
                                                "#148071",
                                                "#6cba86",
                                                "#bcf3a2"
                                            ]
                                        },
                                        "tooltip": {
                                            "format": {
                                                "value": ".2s",
                                                "title": ""
                                            }
                                        },
                                        "padding": {
                                            "top": 40
                                        },
                                        "donut": {
                                            "width": 20,
                                            "title": "",
                                            "label": {
                                                "show": false,
                                                "format": ".2s"
                                            }
                                        },
                                        "data": {
                                            "x": null,
                                            "type": "donut",
                                            "columns": [
                                                [
                                                    "Active",
                                                    20536
                                                ],
                                                [
                                                    "Churn",
                                                    4930
                                                ]
                                            ]
                                        },
                                        "legend": {
                                            "position": "right",
                                            "show": true
                                        },
                                        "size": {
                                            "height": 340
                                        }
                                    },
                                    "yformat": ".2s",
                                    "legend_data": [
                                        {
                                            "color": "#00AEB3",
                                            "name": "Active"
                                        },
                                        {
                                            "color": "#f47b16",
                                            "name": "Churn"
                                        }
                                    ],
                                    "download_url": "/api/download_data/o8q012w4tpzspcx9",
                                    "table_c3": [
                                        [
                                            "Active",
                                            20536
                                        ],
                                        [
                                            "Churn",
                                            4930
                                        ]
                                    ]
                                },
                                "chartInfo": []
                            },
                            {
                                "dataType": "dropdown",
                                "data": [
                                    {
                                        "selected": true,
                                        "displayName": "Active",
                                        "name": "Active",
                                        "id": 1
                                    },
                                    {
                                        "selected": false,
                                        "displayName": "Churn",
                                        "name": "Churn",
                                        "id": 2
                                    }
                                ],
                                "label": "Showing prediction rules for"
                            },
                            {
                                "dataType": "table",
                                "tableWidth": 100,
                                "data": {
                                    "tableData": [
                                        [
                                            "Prediction Rule",
                                            "Probability",
                                            "Prediction",
                                            "Freq",
                                            "group",
                                            "richRules"
                                        ],
                                        [
                                            "GENDER falls among (Female), STATE falls among (Florida,Washington,New York) and TENURE_RANGE falls among (15 to 20 months,10 to 15 months)",
                                            "100%",
                                            "Active",
                                            68,
                                            "strong",
                                            "If the GENDER falls among (Female), the STATE falls among (Florida,Washington,New York) and the TENURE_RANGE falls among (15 to 20 months,10 to 15 months) then there is  <b>100%  <b>probability that the STATUS would be Active."
                                        ],
                                        [
                                            "BILL_AMOUNT_DECEMBER does not fall in ($10000 to $20000), CREDIT_RATING falls among (Super Prime), STATE falls among (Florida,Washington,New York) and AVERAGE_SPEND does not fall in ($10000 to $20000)",
                                            "97%",
                                            "Active",
                                            1224,
                                            "strong",
                                            "When the BILL_AMOUNT_DECEMBER does not fall in ($10000 to $20000), the CREDIT_RATING falls among (Super Prime), the STATE falls among (Florida,Washington,New York) and the AVERAGE_SPEND does not fall in ($10000 to $20000) the probability of Active is  <b>97 % <b>."
                                        ],
                                        [
                                            "BILL_AMOUNT_DECEMBER does not fall in ($10000 to $20000), CREDIT_RATING does not fall in (Super Prime), STATE falls among (Florida,Washington,New York) and AVERAGE_SPEND does not fall in ($10000 to $20000)",
                                            "80%",
                                            "Active",
                                            12206,
                                            "strong",
                                            "When the BILL_AMOUNT_DECEMBER does not fall in ($10000 to $20000), the CREDIT_RATING does not fall in (Super Prime), the STATE falls among (Florida,Washington,New York) and the AVERAGE_SPEND does not fall in ($10000 to $20000) the probability of Active is  <b>80 % <b>."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER falls among (After 3 Months), STATE does not fall in (Florida,Washington,New York) and AGE_CATEGORY falls among (21-30)",
                                            "100%",
                                            "Active",
                                            34,
                                            "strong",
                                            "If the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER falls among (After 3 Months), the STATE does not fall in (Florida,Washington,New York) and the AGE_CATEGORY falls among (21-30) then there is a  <b>100%  <b>probability that the STATUS is Active."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER does not fall in (After 3 Months) and EDUCATION falls among (Others,High School)",
                                            "67%",
                                            "Active",
                                            1802,
                                            "mixed",
                                            "When the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER does not fall in (After 3 Months) and the EDUCATION falls among (Others,High School) then there is  <b>67%  <b>chance that STATUS would be Active."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER does not fall in (After 3 Months) and EDUCATION does not fall in (Graduate School,High School,Others)",
                                            "75%",
                                            "Active",
                                            2176,
                                            "strong",
                                            "If the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER does not fall in (After 3 Months) and the EDUCATION does not fall in (Graduate School,High School,Others) then there is a  <b>75%  <b>probability that the STATUS is Active."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER does not fall in (After 3 Months) and EDUCATION does not fall in (Graduate School,High School,Others)",
                                            "65%",
                                            "Active",
                                            3026,
                                            "mixed",
                                            "When the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER does not fall in (After 3 Months) and the EDUCATION does not fall in (Graduate School,High School,Others) then there is  <b>65%  <b>chance that STATUS would be Active."
                                        ],
                                        [
                                            "GENDER does not fall in (Female), STATE falls among (Florida,Washington,New York) and TENURE_RANGE falls among (15 to 20 months,10 to 15 months)",
                                            "100%",
                                            "Churn",
                                            34,
                                            "strong",
                                            "If the GENDER does not fall in (Female), the STATE falls among (Florida,Washington,New York) and the TENURE_RANGE falls among (15 to 20 months,10 to 15 months) then there is a  <b>100%  <b>probability that the STATUS is Churn."
                                        ],
                                        [
                                            "STATE falls among (Florida,Washington,New York) and TENURE_RANGE does not fall in (15 to 20 months,10 to 15 months)",
                                            "100%",
                                            "Churn",
                                            68,
                                            "strong",
                                            "If the STATE falls among (Florida,Washington,New York) and the TENURE_RANGE does not fall in (15 to 20 months,10 to 15 months) then there is  <b>100%  <b>probability that the STATUS would be Churn."
                                        ],
                                        [
                                            "STATE falls among (Florida,Washington,New York) and AVERAGE_SPEND falls among ($10000 to $20000)",
                                            "100%",
                                            "Churn",
                                            34,
                                            "strong",
                                            "When the STATE falls among (Florida,Washington,New York) and the AVERAGE_SPEND falls among ($10000 to $20000) the probability of Churn is  <b>100 % <b>."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER falls among (After 3 Months), STATE does not fall in (Florida,Washington,New York) and AGE_CATEGORY does not fall in (21-30)",
                                            "50%",
                                            "Churn",
                                            68,
                                            "mixed",
                                            "When the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER falls among (After 3 Months), the STATE does not fall in (Florida,Washington,New York) and the AGE_CATEGORY does not fall in (21-30) then there is  <b>50%  <b>chance that STATUS would be Churn."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER falls among (After 3 Months) and EDUCATION does not fall in (Graduate School)",
                                            "100%",
                                            "Churn",
                                            136,
                                            "strong",
                                            "If the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER falls among (After 3 Months) and the EDUCATION does not fall in (Graduate School) then there is  <b>100%  <b>probability that the STATUS would be Churn."
                                        ],
                                        [
                                            "CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), PAYMENT_DECEMBER does not fall in (After 3 Months) and EDUCATION falls among (Graduate School,High School,Others)",
                                            "31%",
                                            "Churn",
                                            4590,
                                            "mixed",
                                            "When the CREDIT_BALANCE does not fall in (Below Average,Average,Above Average,High), the PAYMENT_DECEMBER does not fall in (After 3 Months) and the EDUCATION falls among (Graduate School,High School,Others) then there is  <b>31%  <b>chance that STATUS would be Churn."
                                        ]
                                    ],
                                    "tableType": "popupDecisionTreeTable"
                                }
                            }
                        ],
                        "name": "Predicting Key Drivers of STATUS",
                        "slug": "predicting-key-drivers-of-status-a9ceilnn5a"
                    }
                ],
                "name": "Prediction",
                "slug": "prediction-atqi7pfwn1"
            }
        ],
        "listOfCards": [],
        "name": "Churn Analysis",
        "slug": "churn-analysis-fy8at9o8t8"
    }


export function getAppsScoreSummary(slug) {
  return (dispatch) => {
    return fetchScoreSummary(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        if (json.status == SUCCESS) {
          clearInterval(appsInterval);
          if(json.data&&json.data.listOfNodes.length==0&&json.data.listOfCards.length==0)
         json.data=dummy;
          dispatch(fetchScoreSummarySuccess(json));
          dispatch(updateRoboAnalysisData(json, "/apps-regression-score"));
          dispatch(closeAppsLoaderValue());
          dispatch(hideDataPreview());
          dispatch(updateScoreSummaryFlag(true));
        } else if (json.status == FAILED) {
          bootbox.alert("Your score could not created.Please try later.", function(result) {
            window.history.go(-2);
          })
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
          dispatch(hideDataPreview());
        } else if (json.status == INPROGRESS) {
          if (json.message !== null && json.message.length > 0) {
            dispatch(openAppsLoaderValue(json.message[0].stageCompletionPercentage, json.message[0].shortExplanation));
          }
        }

      } else {
        dispatch(closeAppsLoaderValue());
        dispatch(updateScoreSummaryFlag(false));
        dispatch(fetchScoreSummaryError(json))
      }
    })
  }
}

function fetchScoreSummary(token, slug) {
  return fetch(API + '/api/score/' + slug + '/', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

function fetchScoreSummaryError(json) {
  return {type: "SCORE_SUMMARY_ERROR", json}
}
export function fetchScoreSummarySuccess(data) {
  return {type: "SCORE_SUMMARY_SUCCESS", data}
}
export function emptyScoreCSVData() {
  var data = {};
  data.csv_data = [];
  fetchScoreSummarySuccess(data);
}
export function fetchScoreSummaryCSVSuccess(data) {
  return {type: "SCORE_SUMMARY_CSV_DATA", data}
}
export function getScoreSummaryInCSV(slug) {
  return (dispatch) => {
    return fetchScoreSummaryInCSV(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        dispatch(fetchScoreSummaryCSVSuccess(json));
      } else {
        dispatch(fetchScoreSummaryError(json));
      }

    });

  }
}
function fetchScoreSummaryInCSV(token, slug) {
  return fetch(API + '/api/get_score_data_and_return_top_n/?url=' + slug + '&count=100' + '&download_csv=false', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

export function updateSelectedApp(appId, appName, appDetails) {
  return {type: "SELECTED_APP_DETAILS", appId, appName, appDetails}
}

export function openAppsLoaderValue(value, text) {
  return {type: "OPEN_APPS_LOADER_MODAL", value, text}
}
export function closeAppsLoaderValue() {
  return {type: "HIDE_APPS_LOADER_MODAL"}
}
function createModelError() {
  return {type: "CREATE_MODEL_ERROR"}
}
function updateAppsLoaderValue(value) {
  return {type: "UPDATE_APPS_LOADER_VALUE", value}
}

export function openAppsLoader(value, text) {
  return {type: "OPEN_APPS_LOADER_MODAL", value, text}
}
export function updateModelSummaryFlag(flag) {
  return {type: "UPDATE_MODEL_FLAG", flag}
}
export function updateScoreSummaryFlag(flag) {
  return {type: "UPDATE_SCORE_FLAG", flag}
}

export function updateModelSlug(slug) {
  return {type: "CREATE_MODEL_SUCCESS", slug}
}
export function updateScoreSlug(slug) {
  return {type: "CREATE_SCORE_SUCCESS", slug}
}

export function getAppsRoboList(pageNo) {
  return (dispatch) => {
    return fetchRoboList(pageNo, getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {
        console.log(json)
        dispatch(fetchRoboListSuccess(json))
      } else {
        dispatch(fetchRoboListError(json))
      }
    })
  }
}

function fetchRoboList(pageNo, token) {
  let search_element = store.getState().apps.robo_search_element;
  let robo_sorton = store.getState().apps.robo_sorton;
  let robo_sorttype = store.getState().apps.robo_sorttype;
  if (robo_sorttype == 'asc')
    robo_sorttype = ""
  else if (robo_sorttype == 'desc')
    robo_sorttype = "-"
  if (search_element != "" && search_element != null) {
    //console.log("calling for robo search element!!")
    return fetch(API + '/api/robo/?name=' + search_element + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else if ((robo_sorton != "" && robo_sorton != null) && (robo_sorttype != null)) {
    return fetch(API + '/api/robo/?sorted_by=' + robo_sorton + '&ordering=' + robo_sorttype + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/robo/?page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

function fetchRoboListError(json) {
  return {type: "ROBO_LIST_ERROR", json}
}
export function fetchRoboListSuccess(doc) {
  var data = doc;
  var current_page = doc.current_page;
  var latestRoboInsights = doc.top_3;
  return {type: "ROBO_LIST", data, current_page, latestRoboInsights}
}
export function closeRoboDataPopup() {
  return {type: "APPS_ROBO_HIDE_POPUP"}
}

export function openRoboDataPopup() {
  return {type: "APPS_ROBO_SHOW_POPUP"}
}

export function saveFilesToStore(files, uploadData) {
  console.log(files)
  var file = files[0]
  if (uploadData == CUSTOMERDATA) {
    return {type: "CUSTOMER_DATA_UPLOAD_FILE", files}
  } else if (uploadData == HISTORIALDATA) {
    return {type: "HISTORIAL_DATA_UPLOAD_FILE", files}
  } else if (uploadData == EXTERNALDATA) {
    return {type: "EXTERNAL_DATA_UPLOAD_FILE", files}
  }

}

export function uploadFiles(dialog, insightName) {
  if (!isEmpty(store.getState().apps.customerDataUpload) && !isEmpty(store.getState().apps.historialDataUpload) && !isEmpty(store.getState().apps.externalDataUpload)) {
    return (dispatch) => {
      dispatch(closeRoboDataPopup());
      dispatch(openAppsLoader(APPSLOADERPERVALUE, "Please wait while mAdvisor is processing data... "));
      return triggerDataUpload(getUserDetailsOrRestart.get().userToken, insightName).then(([response, json]) => {
        if (response.status === 200) {

          dispatch(dataUploadFilesSuccess(json, dispatch))
        } else {
          dispatch(dataUploadFilesError(json));
          dispatch(closeAppsLoaderValue())
        }
      })
    }
  } else {
    dialog.showAlert("Please select Customer Data,Historial Data and External Data.");
  }

}

function triggerDataUpload(token, insightName) {
  var data = new FormData();
  data.append("customer_file", store.getState().apps.customerDataUpload);
  data.append("historical_file", store.getState().apps.historialDataUpload);
  data.append("market_file", store.getState().apps.externalDataUpload);
  data.append("name", insightName);
  return fetch(API + '/api/robo/', {
    method: 'post',
    headers: getHeaderWithoutContent(token),
    body: data
  }).then(response => Promise.all([response, response.json()]));
}

function dataUploadFilesSuccess(data, dispatch) {
  var slug = data.slug;
  appsInterval = setInterval(function() {
    if (store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE) {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    }
    dispatch(getRoboDataset(data.slug));
  }, APPSDEFAULTINTERVAL);
  return {type: "ROBO_DATA_UPLOAD_SUCCESS", slug}
}

export function dataUploadFilesError(josn) {
  return {type: "ROBO_DATA_UPLOAD_ERROR", json}
}
export function updateRoboSlug(slug) {
  return {type: "ROBO_DATA_UPLOAD_SUCCESS", slug}
}
export function getRoboDataset(slug) {
  return (dispatch) => {
    dispatch(updateRoboSlug(slug));
    return fetchRoboDataset(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        if (json.status == SUCCESS) {
          clearInterval(appsInterval);
          dispatch(fetchRoboSummarySuccess(json));
          dispatch(getDataSetPreview(json.customer_dataset.slug))
          dispatch(updateRoboAnalysisData(json, "/apps-robo"));
          dispatch(closeAppsLoaderValue());
          dispatch(showRoboDataUploadPreview(true));
          //dispatch(clearDataPreview());
          dispatch(showDataPreview());
          //dispatch(getAppsRoboList(1));
        } else if (json.status == FAILED) {
          bootbox.alert("Your robo insight could not created.Please try later.", function(result) {
            window.history.go(-2);
          });
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
        }
      } else {
        dispatch(closeAppsLoaderValue());
        dispatch(showRoboDataUploadPreview(false));
        dispatch(fetchModelSummaryError(json));
      }
    })
  }
}

function fetchRoboDataset(token, slug) {
  return fetch(API + '/api/robo/' + slug + '/', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

function fetchRoboSummaryError(json) {
  return {type: "ROBO_SUMMARY_ERROR", json}
}
export function fetchRoboSummarySuccess(doc) {
  var data = doc;
  return {type: "ROBO_SUMMARY_SUCCESS", data}
}
export function showRoboDataUploadPreview(flag) {
  return {type: "ROBO_DATA_UPLOAD_PREVIEW", flag}
}
export function clearRoboDataUploadFiles() {
  return {type: "EMPTY_ROBO_DATA_UPLOAD_FILES"}
}
export function clearDataPreview() {
  return {type: "CLEAR_DATA_PREVIEW"}
}
export function updateRoboUploadTab(tabId) {
  return {type: "UPDATE_ROBO_UPLOAD_TAB_ID", tabId}
}
export function updateRoboAnalysisData(roboData, urlPrefix) {
  var roboSlug = roboData.slug;
  return {type: "ROBO_DATA_ANALYSIS", roboData, urlPrefix, roboSlug}
}
export function showDialogBox(slug, dialog, dispatch, title, msgText) {
  Dialog.setOptions({defaultOkLabel: 'Yes', defaultCancelLabel: 'No'})
  dialog.show({
    title: title,
    body: msgText,
    actions: [
      Dialog.CancelAction(), Dialog.OKAction(() => {
        if (title == DELETEMODEL)
          deleteModel(slug, dialog, dispatch)
        else if (title == DELETEINSIGHT)
          deleteInsight(slug, dialog, dispatch)
        else if (title == DELETEAUDIO)
          deleteAudio(slug, dialog, dispatch)
        else
          deleteScore(slug, dialog, dispatch)

      })
    ],
    bsSize: 'medium',
    onHide: (dialogBox) => {
      dialogBox.hide()
      console.log('closed by clicking background.')
    }
  });
}
export function handleModelDelete(slug, dialog) {
  return (dispatch) => {
    showDialogBox(slug, dialog, dispatch, DELETEMODEL, "Are you sure, you want to delete model?")
  }
}
function deleteModel(slug, dialog, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return deleteModelAPI(slug).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsModelList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function deleteModelAPI(slug) {
  return fetch(API + '/api/trainer/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({deleted: true})
  }).then(response => Promise.all([response, response.json()]));

}

export function handleModelRename(slug, dialog, name) {
  const customBody = (
    <div className="form-group">
      <label for="fl1" className="control-label">Enter a new Name</label>
      <input className="form-control" id="idRenameModel" type="text" defaultValue={name}/>
    </div>
  )
  return (dispatch) => {
    showRenameDialogBox(slug, dialog, dispatch, RENAMEMODEL, customBody)
  }
}
function showRenameDialogBox(slug, dialog, dispatch, title, customBody) {
  dialog.show({
    title: title,
    body: customBody,
    actions: [
      Dialog.CancelAction(), Dialog.OKAction(() => {
        if (title == RENAMEMODEL)
          renameModel(slug, dialog, $("#idRenameModel").val(), dispatch)
        else if (title == RENAMEINSIGHT)
          renameInsight(slug, dialog, $("#idRenameInsight").val(), dispatch)
        else if (title == RENAMEAUDIO)
          renameAudio(slug, dialog, $("#idRenameAudio").val(), dispatch)
        else
          renameScore(slug, dialog, $("#idRenameScore").val(), dispatch)
      })
    ],
    bsSize: 'medium',
    onHide: (dialogBox) => {
      dialogBox.hide()
      console.log('closed by clicking background.')
    }
  });
}

function renameModel(slug, dialog, newName, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return renameModelAPI(slug, newName).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsModelList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function renameModelAPI(slug, newName) {
  return fetch(API + '/api/trainer/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({name: newName})
  }).then(response => Promise.all([response, response.json()]));

}

export function handleScoreDelete(slug, dialog) {
  return (dispatch) => {
    showDialogBox(slug, dialog, dispatch, DELETESCORE, "Are you sure, you want to delete score?")
  }
}
function deleteScore(slug, dialog, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return deleteScoreAPI(slug).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsScoreList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function deleteScoreAPI(slug) {
  return fetch(API + '/api/score/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({deleted: true})
  }).then(response => Promise.all([response, response.json()]));

}

export function handleScoreRename(slug, dialog, name) {
  const customBody = (
    <div className="form-group">
      <label for="fl1" className="control-label">Enter a new Name</label>
      <input className="form-control" id="idRenameScore" type="text" defaultValue={name}/>
    </div>
  )
  return (dispatch) => {
    showRenameDialogBox(slug, dialog, dispatch, RENAMESCORE, customBody)
  }
}

function renameScore(slug, dialog, newName, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return renameScoreAPI(slug, newName).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsScoreList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function renameScoreAPI(slug, newName) {
  return fetch(API + '/api/score/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({name: newName})
  }).then(response => Promise.all([response, response.json()]));

}

export function activateModelScoreTabs(id) {
  return {type: "APPS_SELECTED_TAB", id}
}

export function handleInsightDelete(slug, dialog) {
  return (dispatch) => {
    showDialogBox(slug, dialog, dispatch, DELETEINSIGHT, "Are you sure, you want to delete Insight?")
  }
}
function deleteInsight(slug, dialog, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return deleteInsightAPI(slug).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsRoboList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function deleteInsightAPI(slug) {
  return fetch(API + '/api/robo/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({deleted: true})
  }).then(response => Promise.all([response, response.json()]));

}

export function handleInsightRename(slug, dialog, name) {
  const customBody = (
    <div className="form-group">
      <label for="fl1" className="control-label">Enter a new Name</label>
      <input className="form-control" id="idRenameInsight" type="text" defaultValue={name}/>
    </div>
  )
  return (dispatch) => {
    showRenameDialogBox(slug, dialog, dispatch, RENAMEINSIGHT, customBody)
  }
}

function renameInsight(slug, dialog, newName, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return renameInsightAPI(slug, newName).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAppsRoboList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function renameInsightAPI(slug, newName) {
  return fetch(API + '/api/robo/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({name: newName})
  }).then(response => Promise.all([response, response.json()]));

}

export function storeRoboSearchElement(search_element) {
  return {type: "SEARCH_ROBO", search_element}
}
export function storeModelSearchElement(search_element) {
  return {type: "SEARCH_MODEL", search_element}
}
export function storeScoreSearchElement(search_element) {
  return {type: "SEARCH_SCORE", search_element}
}
export function clearRoboSummary() {
  return {type: "CLEAR_ROBO_SUMMARY_SUCCESS"}
}
export function showAudioFUModal() {
  return {type: "SHOW_AUDIO_FILE_UPLOAD"}
}

export function hideAudioFUModal() {
  return {type: "HIDE_AUDIO_FILE_UPLOAD"}
}

export function uploadAudioFileToStore(files) {
  return {type: "AUDIO_UPLOAD_FILE", files}
}

export function uploadAudioFile() {
  return (dispatch) => {
    dispatch(hideAudioFUModal());
    dispatch(openAppsLoader(APPSLOADERPERVALUE, "Please wait while mAdvisor analyzes the audio file... "));
    return triggerAudioUpload(getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {

        dispatch(audioUploadFilesSuccess(json, dispatch))
      } else {
        dispatch(audioUploadFilesError(json));
        dispatch(closeAppsLoaderValue())
      }
    })
  }
}

function triggerAudioUpload(token) {
  var data = new FormData();
  data.append("input_file", store.getState().apps.audioFileUpload);
  return fetch(API + '/api/audioset/', {
    method: 'post',
    headers: getHeaderWithoutContent(token),
    body: data
  }).then(response => Promise.all([response, response.json()]));
}

function audioUploadFilesSuccess(data, dispatch) {
  var slug = data.slug;
  appsInterval = setInterval(function() {
    if (store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE) {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    }
    dispatch(getAudioFile(data.slug));
  }, APPSDEFAULTINTERVAL);
  return {type: "AUDIO_UPLOAD_SUCCESS", slug}
}

function audioUploadFilesError() {
  return {type: "AUDIO_UPLOAD_ERROR"}
}

export function getAudioFile(slug) {
  return (dispatch) => {
    return fetchAudioFileSummary(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        if (json.status == SUCCESS) {
          dispatch(fetchAFSummarySuccess(json));
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
          dispatch(clearAudioFile());
          dispatch(updateAudioFileSummaryFlag(true));
        } else if (json.status == FAILED) {
          bootbox.alert("Your audio file could not analysed.Please try later.", function(result) {
            dispatch(updateAudioFileSummaryFlag(false));
          });
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
          dispatch(clearAudioFile());
        }
      } else {
        //dispatch(closeAppsLoaderValue());
        dispatch(fetchAFSummaryError(json));
      }
    })
  }
}
function fetchAudioFileSummary(token, slug) {
  return fetch(API + '/api/audioset/' + slug + '/', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

function fetchAFSummarySuccess(data) {
  return {type: "AUDIO_UPLOAD_SUMMARY_SUCCESS", data}
}

function fetchAFSummaryError(data) {
  return {type: "AUDIO_UPLOAD_SUMMARY_ERROR"}
}

export function clearAudioFile() {
  return {type: "CLEAR_AUDIO_UPLOAD_FILE"}
}

export function updateAudioFileSummaryFlag(flag) {
  return {type: "UPDATE_AUDIO_FILE_SUMMARY_FLAG", flag}
}

export function getAudioFileList(pageNo) {
  return (dispatch) => {
    return fetchAudioList(pageNo, getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {
        dispatch(fetchAudioListSuccess(json))
      } else {
        dispatch(fetchAudioListError(json))
      }
    })
  }
}

function fetchAudioList(pageNo, token) {

  console.log(token)
  let search_element = store.getState().apps.audio_search_element
  console.log(search_element)
  if (search_element != "" && search_element != null) {
    console.log("calling for search element!!")
    return fetch(API + '/api/audioset/?name=' + search_element + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/audioset/?page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

function fetchAudioListError(json) {
  return {type: "AUDIO_LIST_ERROR", json}
}
export function fetchAudioListSuccess(doc) {
  var data = doc;
  var current_page = doc.current_page;
  var latestAudioFiles = doc.top_3;
  return {type: "AUDIO_LIST", data, current_page, latestAudioFiles}
}
export function storeAudioSearchElement(search_element) {
  return {type: "SEARCH_AUDIO_FILE", search_element}
}

//  Rename and Delete Audio files

export function handleAudioDelete(slug, dialog) {
  return (dispatch) => {
    showDialogBox(slug, dialog, dispatch, DELETEAUDIO, "Are you sure, you want to delete media file?")
  }
}
function deleteAudio(slug, dialog, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return deleteAudioAPI(slug).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAudioFileList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}
function deleteAudioAPI(slug) {
  return fetch(API + '/api/audioset/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({deleted: true})
  }).then(response => Promise.all([response, response.json()]));

}

export function handleAudioRename(slug, dialog, name) {
  const customBody = (
    <div className="form-group">
      <label for="fl1" className="col-sm-6 control-label">Enter Media file name</label>
      <input className="form-control" id="idRenameAudio" type="text" defaultValue={name}/>
    </div>
  )
  return (dispatch) => {
    showRenameDialogBox(slug, dialog, dispatch, RENAMEAUDIO, customBody)
  }
}

function renameAudio(slug, dialog, newName, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return renameAudioAPI(slug, newName).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getAudioFileList(store.getState().apps.current_page));
      dispatch(hideLoading());
    } else {
      dispatch(hideLoading());
      dialog.showAlert("Something went wrong. Please try again later.");

    }
  })
}

function renameAudioAPI(slug, newName) {
  return fetch(API + '/api/audioset/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({name: newName})
  }).then(response => Promise.all([response, response.json()]));

}

export function playAudioFile() {
  if (!isEmpty(store.getState().apps.audioFileUpload)) {
    var audioEle = document.getElementById("myAudio");
    audioEle.src = store.getState().apps.audioFileUpload.preview;
    $("#audioPause").addClass("show");
    $("#audioPause").removeClass("hide");
    $("#audioPlay").removeClass("show");
    $("#audioPlay").addClass("hide");
    audioEle.play();
  } else {
    bootbox.alert("Please upload audio file to play.");
  }

}

export function pauseAudioFile() {
  if (!isEmpty(store.getState().apps.audioFileUpload)) {
    var audioEle = document.getElementById("myAudio");
    audioEle.src = store.getState().apps.audioFileUpload.preview;
    $("#audioPlay").addClass("show");
    $("#audioPlay").removeClass("hide");
    $("#audioPause").addClass("hide");
    $("#audioPause").removeClass("show");
    audioEle.pause();
  } else {
    bootbox.alert("Please upload audio file to play.");
  }
}

export function storeRoboSortElements(roboSorton, roboSorttype) {
  return {type: "SORT_ROBO", roboSorton, roboSorttype}
}
export function storeAppsModelSortElements(appsModelSorton, appsModelSorttype) {
  return {type: "SORT_APPS_MODEL", appsModelSorton, appsModelSorttype}
}
export function storeAppsScoreSortElements(appsScoreSorton, appsScoreSorttype) {
  return {type: "SORT_APPS_SCORE", appsScoreSorton, appsScoreSorttype}
}
export function updateCreateStockPopup(flag) {
  return {type: "CREATE_STOCK_MODAL", flag}
}

export function addDefaultStockSymbolsComp() {
  return (dispatch) => {
    var stockSymbolsArray = [];
    stockSymbolsArray.push({"id": 1, "name": "name1", "value": ""});
    stockSymbolsArray.push({"id": 2, "name": "name2", "value": ""});
    dispatch(updateStockSymbolsArray(stockSymbolsArray))
  }
}

function updateStockSymbolsArray(stockSymbolsArray) {
  return {type: "ADD_STOCK_SYMBOLS", stockSymbolsArray}
}

export function addMoreStockSymbols() {
  return (dispatch) => {
    var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
    var max = stockSymbolsArray.reduce(function(prev, current) {
      return (prev.id > current.id)
        ? prev
        : current

    });
    let length = max.id + 1;
    stockSymbolsArray.push({
      "id": length,
      "name": "name" + length,
      "value": ""
    });
    dispatch(updateStockSymbolsArray(stockSymbolsArray));
  }
}

export function removeStockSymbolsComponents(data) {
  return (dispatch) => {
    var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
    for (var i = 0; i < stockSymbolsArray.length; i++) {
      if (stockSymbolsArray[i].id == data.id) {
        stockSymbolsArray.splice(i, 1);
        break;
      }
    }
    dispatch(updateStockSymbolsArray(stockSymbolsArray))
  }
}

export function handleInputChange(event) {

  return (dispatch) => {
    var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
    for (var i = 0; i < stockSymbolsArray.length; i++) {
      if (stockSymbolsArray[i].id == event.target.id) {
        stockSymbolsArray[i].value = event.target.value;
        break;
      }
    }
    dispatch(updateStockSymbolsArray(stockSymbolsArray))
  }
}

export function getAppsStockList(pageNo) {
  return (dispatch) => {
    return fetchStockList(pageNo, getUserDetailsOrRestart.get().userToken).then(([response, json]) => {
      if (response.status === 200) {
        console.log(json)
        dispatch(fetchStockListSuccess(json))
      } else {
        dispatch(fetchStockListError(json))
      }
    })
  }
}

function fetchStockList(pageNo, token) {
  return fetch(API + '/api/stockdataset/?page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
    method: 'get',
    headers: getHeader(getUserDetailsOrRestart.get().userToken)
  }).then(response => Promise.all([response, response.json()]));

}

function fetchStockListError(json) {
  return {type: "STOCK_LIST_ERROR", json}
}

export function fetchStockListSuccess(doc) {
  var data = doc;
  var current_page = doc.current_page;
  var latestStocks = doc.top_3;
  return {type: "STOCK_LIST", data, current_page, latestStocks}
}

export function crawlDataForAnalysis(url, analysisName, urlForNews) {
  var found = false;
  var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs;
  for (var i = 0; i < stockSymbolsArray.length; i++) {
    if (stockSymbolsArray[i].value != '') {
      found = true;
      break;
    }
  }
  /*if(analysisName == ""){
			bootbox.alert("Please enter stock analysis name.");
		}
		else if(url == ""){
			bootbox.alert("Please enter stock analysis url.");
		}*/
  if (found) {
    return (dispatch) => {
      dispatch(updateCreateStockPopup(false))
      dispatch(openAppsLoader(APPSLOADERPERVALUE, "Extracting historic stock prices.... "));
      return triggerCrawlingAPI(url, urlForNews, analysisName).then(([response, json]) => {
        if (response.status === 200) {
          console.log(json.slug)
          dispatch(crawlSuccess(json, dispatch))
        } else {
          dispatch(crawlError(json))
          dispatch(closeAppsLoaderValue());
        }
      });
    }
  } else {
    bootbox.alert("Please enter text/symbols to analyze stocks")
  }
}
export function updateAppsLoaderText(text) {
  return {type: "UPDATE_LOADER_TEXT", text}
}
export function crawlSuccess(json, dispatch) {
  var slug = json.slug;
  //dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    dispatch(updateAppsLoaderText("Fetching metadata information for news portals...."))
  }, 10000);
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    dispatch(updateAppsLoaderText("Extracting articles from news portals....."))
  }, 30000);
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    dispatch(updateAppsLoaderText("Creating dataset...."))
  }, 40000);
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
  }, 45000);
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
  }, 50000);
  setTimeout(function() {
    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
  }, 55000);
  appsInterval = setInterval(function() {
    dispatch(getStockDataSetPreview(slug, appsInterval))
    if (store.getState().apps.appsLoaderPerValue + 10 < LOADERMAXPERVALUE) {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
    }

  }, 60000);
  return {type: "STOCK_CRAWL_SUCCESS", slug}
}
function triggerCrawlingAPI(urlForPrices, urlForNews, analysisName) {

  var details = {
    "url1": urlForPrices,
    "url2": urlForNews,
    "name": analysisName,
    "stock_symbols": store.getState().apps.appsStockSymbolsInputs

  }
  return fetch(API + '/api/stockdataset/', {
    method: 'post',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({config: details})
  }).then(response => Promise.all([response, response.json()]));

}

export function hideDataPreviewRightPanels() {
  $("#tab_visualizations").hide();
  $("#sub_settings").hide();
  $("#dataPreviewButton").hide();
}
export function updateUploadStockPopup(flag) {
  return {type: "UPLOAD_STOCK_MODAL", flag}
}
export function uploadStockFiles(files) {
  return {type: "UPLOAD_STOCK_FILES", files}
}
export function uploadStockAnalysisFlag(flag) {
  return {type: "UPDATE_STOCK_ANALYSIS_FLAG", flag}
}

export function uploadStockFile(slug) {
  return (dispatch) => {
    dispatch(updateUploadStockPopup(false));
    dispatch(openAppsLoader(APPSLOADERPERVALUE, "Preparing data for analysis... "));
    return triggerStockUpload(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        dispatch(triggerStockAnalysis(slug));
      } else {
        dispatch(closeAppsLoaderValue());
      }
    });
  }
}
function triggerStockUpload(token, slug) {
  return fetch(API + "/api/stockdataset/" + slug + "/create_stats/", {
    method: 'put',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}
export function triggerStockAnalysis(slug) {
  return (dispatch) => {
    //dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE+7));
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Applying domain model for stock analysis...."))
    }, 10000);
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Extracting relevant entities and keywords....."))
    }, 20000);
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Tagging articles to relevant concepts ...."))
    }, 30000);
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Performing sentiment analysis...."))
    }, 40000);
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Identifying key events during the selected period....."))
    }, 50000);
    setTimeout(function() {
      dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      dispatch(updateAppsLoaderText("Analyze the impact of concepts on stock performance...."))
    }, 60000);
    appsInterval = setInterval(function() {
      dispatch(getStockAnalysis(slug));
      if (store.getState().apps.appsLoaderPerValue + 10 < LOADERMAXPERVALUE) {
        dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue + APPSLOADERPERVALUE));
      }
    }, 60000)
  }
}
export function getStockAnalysis(slug) {
  return (dispatch) => {
    return fetchStockAnalysisAPI(getUserDetailsOrRestart.get().userToken, slug).then(([response, json]) => {
      if (response.status === 200) {
        if (json.status == SUCCESS) {
          clearInterval(appsInterval);
          dispatch(updateRoboAnalysisData(json, "/apps-stock-advisor"));
          dispatch(uploadStockAnalysisFlag(true));
          dispatch(closeAppsLoaderValue());
        } else if (json.status == FAILED) {
          bootbox.alert("Your stock analysis could not created.Please try later.", function(result) {
            window.history.go(-2);
          });
          clearInterval(appsInterval);
          dispatch(closeAppsLoaderValue());
        }
      } else {
        dispatch(closeAppsLoaderValue());
      }
    })
  }
}

function fetchStockAnalysisAPI(token, slug) {
  return fetch(API + "/api/stockdataset/" + slug + "/read_stats/", {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));
}

export function updateStockSlug(slug) {
  return {type: "STOCK_CRAWL_SUCCESS", slug}
}

export function getConceptsList() {
  return (dispatch) => {
    return fetchConceptList().then(([response, json]) => {
      if (response.status === 200) {
        console.log(json)
        dispatch(fetchConceptListSuccess(json))
      } else {
        dispatch(fetchConceptListError(json))
      }
    })
  }
}
function fetchConceptList() {
  return fetch(API + '/api/get_concepts/', {
    method: 'get',
    headers: getHeader(getUserDetailsOrRestart.get().userToken)
  }).then(response => Promise.all([response, response.json()]));
}

function fetchConceptListSuccess(concepts) {
  return {type: "CONCEPTSLIST", concepts}

}

function fetchConceptListError(json) {
  // return {
  // 	type: "MODEL_LIST_ERROR",
  // 	json
  // }
}

export function getAppsList(token, pageNo) {

  return (dispatch) => {
    return fetchApps(token, pageNo).then(([response, json]) => {
      if (response.status === 200) {
        //console.log(json)
        dispatch(fetchAppsSuccess(json))
        // if(json.data)
        // dispatch(updateAppsFilterList(json.data[0].tag_keywords))

      } else {
        dispatch(fetchAppsError(json))
      }
    })
  }

}

function fetchApps(token, pageNo) {
  let search_element = store.getState().apps.storeAppsSearchElement;
  let apps_sortBy = store.getState().apps.storeAppsSortByElement;
  let apps_sortType = store.getState().apps.storeAppsSortType;
  if (search_element) {
    return fetch(API + '/api/apps/?app_name=' + search_element + '&page_number=' + pageNo + '&page_size=' + APPSPERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else if ((apps_sortBy != "" && apps_sortBy != null) && (apps_sortType != null)) {
    return fetch(API + '/api/apps/?sorted_by=' + apps_sortBy + '&ordering=' + apps_sortType + '&page_number=' + pageNo + '&page_size=' + APPSPERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/apps/?page_number=' + pageNo + '&page_size=' + APPSPERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

function fetchAppsSuccess(json) {
  var current_page = json.current_page
  return {type: "APPS_LIST", json, current_page}
}

function fetchAppsError(json) {
  //console.log("fetching list error!!",json)
  return {type: "APPS_LIST_ERROR", json}
}
export function appsStoreSearchEle(search_element) {
  return {type: "APPS_SEARCH", search_element}
}
export function appsStoreSortElements(sort_by, sort_type) {
  return {type: "APPS_SORT", sort_by, sort_type}
}

export function updateAppsFilterList(filter_list) {
  let appList = store.getState().apps.appsList
  //console.log(appList)

  // if(filter_list.length==0 && appList.data )
  // filter_list=[]
  return {type: "UPDATE_FILTER_LIST", filter_list}
}

export function getAppsFilteredList(token, pageNo) {

  return (dispatch) => {
    return fetchFilteredApps(token, pageNo).then(([response, json]) => {
      if (response.status === 200) {
        //console.log(json)
        dispatch(fetchAppsSuccess(json))

      } else {
        dispatch(fetchAppsError(json))
      }
    })
  }

}

function fetchFilteredApps(token, pageNo) {
  let filtered_list = store.getState().apps.app_filtered_keywords;
  //let stringify_list="[\""+filtered_list.toString().replace(/,/g ,"\",\"")+"\"]"
  //alert(stringify_list)
  return fetch(API + '/api/apps/?filter_fields=' + '[' + filtered_list + ']' + '&page_number=' + pageNo + '&page_size=' + APPSPERPAGE + '', {
    method: 'get',
    headers: getHeader(token)
  }).then(response => Promise.all([response, response.json()]));

}

export function handleExportAsPMMLModal(flag) {
  return {type: "EXPORT_AS_PMML_MODAL", flag}
}

export function updateSelectedVariable(event) {
  var selOption = event.target.childNodes[event.target.selectedIndex];
  var varType = selOption.value;
  var varText = selOption.text;
  var varSlug = selOption.getAttribute("name");
  return {type: "SET_POSSIBLE_LIST", varType, varText, varSlug};
}

export function checkCreateScoreToProceed(selectedDataset) {
  var modelSlug = store.getState().apps.modelSlug;
  var response = "";
  return (dispatch) => {
    return triggerAPI(modelSlug, selectedDataset).then(([response, json]) => {
      if (response.status === 200) {
        dispatch(scoreToProceed(json.proceed));
      }
    });
  }

}

function triggerAPI(modelSlug, selectedDataset) {
  return fetch(API + '/api/trainer/' + modelSlug + '/comparision/?score_datatset_slug=' + selectedDataset + '', {
    method: 'get',
    headers: getHeader(getUserDetailsOrRestart.get().userToken)
  }).then(response => Promise.all([response, response.json()]));
}

function scoreToProceed(flag) {
  return {type: "SCORE_TO_PROCEED", flag};
}

export function showLevelCountsForTarget(event) {
  var selOption = event.target.childNodes[event.target.selectedIndex];
  var varType = selOption.value;
  var varText = selOption.text;
  var varSlug = selOption.getAttribute("name");
  var levelCounts = null;
  var colData = store.getState().datasets.dataPreview.meta_data.scriptMetaData.columnData;
  var colStats = [];
  if (varType == "dimension") {
    for (var i = 0; i < colData.length; i++) {
      if (colData[i].slug == varSlug) {
        var found = colData[i].columnStats.find(function(element) {
          return element.name == "LevelCount";
        });
        if (found != undefined) {
          if (found.value != null)
            levelCounts = Object.keys(found.value);
          }
        }
    }
  }
  return {type: "SET_TARGET_LEVEL_COUNTS", levelCounts}
}
export function updateTargetLevel(value) {
  return {type: "SET_TARGET_LEVEL_COUNTS", value}
}
export function clearAppsIntervel() {
  clearInterval(appsInterval)
}

export function getAppDetails(appSlug, pageNo) {
  return (dispatch) => {
    return triggerAppDetailsAPI(appSlug).then(([response, json]) => {
      if (response.status === 200) {
        dispatch(updateSelectedApp(json.app_id, json.name, json));
        if (pageNo != undefined) {
          dispatch(getAppsModelList(pageNo));
          dispatch(getAppsScoreList(pageNo));
        }

      }
    });
  }

}

function triggerAppDetailsAPI(appSlug) {
  return fetch(API + '/api/apps/' + appSlug + '/', {
    method: 'get',
    headers: getHeader(getUserDetailsOrRestart.get().userToken)
  }).then(response => Promise.all([response, response.json()]));
}

export function createScoreSuccessAnalysis(data) {
  return (dispatch) => {
    dispatch(createScoreSuccess(data, dispatch))
  }
}

export function saveSelectedValuesForModel(modelName, targetType, levelCount) {
  return {type: "SAVE_SELECTED_VALES_FOR_MODEL", modelName, targetType, levelCount}
}

export function getRegressionAppAlgorithmData() {
  return (dispatch) => {
    return triggerRegressionAppAlgorithmAPI().then(([response, json]) => {
      if (response.status === 200) {
        dispatch(saveRegressionAppAlgorithmData(json));
      }
    });
  }
}

function triggerRegressionAppAlgorithmAPI() {
  return fetch(API + '/api/regression_app/get_algorithm_config_list', {
    method: 'get',
    headers: getHeader(getUserDetailsOrRestart.get().userToken)
  }).then(response => Promise.all([response, response.json()]));
}
export function saveRegressionAppAlgorithmData(data) {
  return {type: "SAVE_REGRESSION_ALGORITHM_DATA", data}
}
export function updateAlgorithmData(algSlug, parSlug, parVal) {
  var AlgorithmCopy = jQuery.extend(true, [], store.getState().apps.regression_algorithm_data_manual);

  var newAlgorithm = $.each(AlgorithmCopy, function(key, val) {
    if (val.algorithmSlug == algSlug) {
      if (parSlug === undefined && parVal === undefined) {
        val.selected = !val.selected;
      } else {
        let paramerterList = val.parameters;
        $.each(paramerterList, function(key1, val1) {
          if (val1.name == parSlug) {
            if (val1.paramType == 'number' || val1.paramType == 'textbox') {
              val1.defaultValue = parVal;
            } else if (val1.paramType == 'list') {
              let allValues = val1.defaultValue;
              $.each(allValues, function(i, dat) {
                if (dat.name == parVal)
                  dat.selected = true;
                else
                  dat.selected = false;
                }
              );
            } else {
              val1.defaultValue = parVal;
            }
          }
        })
      }
    }
  });
  return {type: "UPDATE_REGRESSION_ALGORITHM_DATA", newAlgorithm}

}
export function setDefaultAutomatic(data) {
  return {type: "SET_REGRESSION_DEFAULT_AUTOMATIC", data}
}
export function updateRegressionTechnique(name) {
  return {type: "UPDATE_REGRESSION_TECHNIQUE", name}
}
export function updateCrossValidationValue(val) {
  return {type: "UPDATE_CROSS_VALIDATION_VALUE", val}
}
export function reSetRegressionVariables() {
  return {type: "RESET_REGRESSION_VARIABLES"}
}
export function checkAtleastOneSelected(){
        let isSelected = false;
        if(store.getState().apps.regression_isAutomatic == 0){
            let algorithmData = store.getState().apps.regression_algorithm_data_manual;
            $.each(algorithmData,function(i,dat){
                if(dat.selected == true)
                isSelected = true;
            });
        }
        else
        isSelected = true;

        return isSelected;
    }
