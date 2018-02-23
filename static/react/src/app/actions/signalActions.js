import React from "react";
import {API} from "../helpers/env";
import {CSLOADERPERVALUE,LOADERMAXPERVALUE,DEFAULTINTERVAL,PERPAGE,SUCCESS,FAILED,getUserDetailsOrRestart,DIMENSION,
    MEASURE,SET_VARIABLE,PERCENTAGE,GENERIC_NUMERIC,SET_POLARITY,DYNAMICLOADERINTERVAL,UNIQUE_IDENTIFIER,handleJobProcessing} from "../helpers/helper";
import {connect} from "react-redux";
import store from "../store";
import {openCsLoaderModal, closeCsLoaderModal, updateCsLoaderValue, updateCsLoaderMsg} from "./createSignalActions";
import Dialog from 'react-bootstrap-dialog'
import {showLoading, hideLoading} from 'react-redux-loading-bar'
import {updateColumnStatus,handleDVSearch,updateStoreVariables,updateDatasetVariables,updateSelectAllAnlysis,hideDataPreview,updateTargetAnalysisList,getTotalVariablesSelected} from './dataActions';
// var API = "http://34.196.204.54:9000";

// @connect((store) => {
//   return {signal: store.signals.signalAnalysis};
// })
var createSignalInterval = null;
var refreshSignalInterval = null;

function getHeader(token) {
  return {'Authorization': token, 'Content-Type': 'application/json'};
}
export function checkIfTrendIsSelected() {
  var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
  var analysisList = [];
  var trendIsChecked = false;
  if (store.getState().signals.getVarType == MEASURE) {
    analysisList = totalAnalysisList.measures.analysis;
  } else {
    analysisList = totalAnalysisList.dimensions.analysis;
  }

  for (var i = 0; i < analysisList.length; i++) {
    if (analysisList[i].name == "trend") {
      if (analysisList[i].status) {
        trendIsChecked = true;
      }
      break;
    }
  }
  return trendIsChecked;

}

export function checkIfDateTimeIsSelected(){
    var dataSetTimeDimensions = store.getState().datasets.dataSetTimeDimensions;
    var flag = dataSetTimeDimensions.find(function(element) {
        return element.selected  == true;
      });
    return flag;
}

//x-www-form-urlencoded'
export function createSignal(metaData) {
  return (dispatch) => {
    dispatch(updateHide(false));
    dispatch(hideDataPreview())
    return fetchCreateSignal(metaData,dispatch).then(([response, json]) => {
      if (response.status === 200) {
        //console.log(json)
        dispatch(updateHide(true));
        dispatch(fetchCreateSignalSuccess(json, dispatch))
      } else {
        dispatch(fetchCreateSignalError(json))
        dispatch(closeCsLoaderModal())
        dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      }
    }).catch(function(error) {
      bootbox.alert("Connection lost. Please try again later.")
      dispatch(closeCsLoaderModal())
      dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      clearInterval(createSignalInterval);
    });
  }

}

function fetchCreateSignal(metaData,dispatch) {
  //console.log(metaData)

  return fetch(API + '/api/signals/', {
    method: 'POST',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify(metaData)
  }).then(response => Promise.all([response, response.json()]));
}

export function checkAnalysisIsChecked(){
    var isChecked = false;
     $("#analysisList").find("input:checkbox").each(function(){
         if(this.checked){
             isChecked = true;
             return false;
         }
     });
     return isChecked;
 }
export function triggerSignalAnalysis(signalData,percentage,message){
    return (dispatch) => {
        dispatch(updateCsLoaderValue(percentage));
        dispatch(updateCsLoaderMsg(message));
        fetchCreateSignalSuccess(signalData,dispatch);
        dispatch(assignSignalData(signalData));
    }
}
export function fetchCreateSignalSuccess(signalData, dispatch) {
  //console.log("signal list from api to store")
  // if(signalData.type == "dimension"){
  console.log("created in progress slug is:")
  console.log(signalData)
  let msg = store.getState().signals.loaderText
  let loaderVal = store.getState().signals.createSignalLoaderValue
  if (signalData.hasOwnProperty("proceed_for_loading") && !signalData.proceed_for_loading) {
    msg = "Your signal will be created in background...";
    dispatch(updateCsLoaderMsg(msg));
    setTimeout(function() {
      dispatch(closeCsLoaderModal())
      dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
    }, DYNAMICLOADERINTERVAL);

  } else {
    createSignalInterval = setInterval(function() {



      let loading_message = store.getState().signals.loading_message
      dispatch(getSignalAnalysis(getUserDetailsOrRestart.get().userToken, signalData.slug));
      if (store.getState().signals.createSignalLoaderValue < LOADERMAXPERVALUE) {
        if (loading_message && loading_message.length > 0) {
          //check if display is true
          if (loading_message[loading_message.length - 1].display && loading_message[loading_message.length - 1].display == true) {
            msg = loading_message[loading_message.length - 1].shortExplanation
          }
          loaderVal = loading_message[loading_message.length - 1].globalCompletionPercentage
          //alert(msg + "  " + loaderVal)
        }

        dispatch(updateCsLoaderValue(loaderVal));
        dispatch(updateCsLoaderMsg(msg));
      } else {
        dispatch(clearLoadingMsg())
      }

    }, DEFAULTINTERVAL);

  }

  return {type: "CREATE_SUCCESS", signalData}
}
export function clearCreateSignalInterval() {
  clearInterval(createSignalInterval);
}
export function emptySignalData() {
  return (dispatch) => {
    var signalData = null;
    dispatch(assignSignalData(signalData));
  }
}
export function assignSignalData(signalData) {
  return {type: "CREATE_SUCCESS", signalData}
}

function fetchCreateSignalError(json) {
  //console.log("fetching list error!!",json)

  return {type: "CREATE_ERROR", json}
}

export function getList(token, pageNo) {

  return (dispatch) => {
    return fetchPosts(token, pageNo,dispatch).then(([response, json]) => {
      if (response.status === 200) {
        //console.log(json)
        dispatch(hideLoading())
        dispatch(fetchPostsSuccess(json))
      } else {
        dispatch(fetchPostsError(json))
        dispatch(hideLoading())
      }
    })
  }
}

function fetchPosts(token, pageNo,dispatch) {
  //console.log(token)
  let search_element = store.getState().signals.signal_search_element;
  let signal_sorton = store.getState().signals.signal_sorton;
  let signal_sorttype = store.getState().signals.signal_sorttype;
  console.log(search_element)
  if (signal_sorttype == 'asc')
    signal_sorttype = ""
  else if (signal_sorttype == 'desc')
    signal_sorttype = "-"
    //console.log(search_element)
  if (search_element != "" && search_element != null) {
    //console.log("calling for search element!!")
    if ((signal_sorton != "" && signal_sorton != null) && (signal_sorttype != null)) {
      return fetch(API + '/api/signals/?name=' + search_element + '&sorted_by=' + signal_sorton + '&ordering=' + signal_sorttype + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
        method: 'get',
        headers: getHeader(token)
      }).then(response => Promise.all([response, response.json()]));
    } else {
      return fetch(API + '/api/signals/?name=' + search_element + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
        method: 'get',
        headers: getHeader(token)
      }).then(response => Promise.all([response, response.json()]));
    }
  } else if ((signal_sorton != "" && signal_sorton != null) && (signal_sorttype != null)) {
    return fetch(API + '/api/signals/?sorted_by=' + signal_sorton + '&ordering=' + signal_sorttype + '&page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  } else {
    return fetch(API + '/api/signals/?page_number=' + pageNo + '&page_size=' + PERPAGE + '', {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
  }

}

export function refreshSignals(props) {
  return (dispatch) => {
    refreshSignalInterval = setInterval(function() {

      var pageNo = window.location.href.split("=")[1];
      if (pageNo == undefined)
        pageNo = 1;
      if (window.location.pathname == "/signals")
        dispatch(getList(getUserDetailsOrRestart.get().userToken, parseInt(pageNo)));
      }
    , DEFAULTINTERVAL);

  }
}
function fetchPostsSuccess(signalList) {
  var current_page = signalList.current_page;
  var latestSignals = signalList.top_3;
  return {type: "SIGNAL_LIST", signalList,latestSignals, current_page}
}

function fetchPostsError(json) {
  //console.log("fetching list error!!",json)
  return {type: "SIGNAL_LIST_ERROR", json}
}

//for getting signal analysis:
export function getSignalAnalysis(token, errandId) {

  return (dispatch) => {
    return fetchPosts_analysis(token, errandId).then(([response, json]) => {
      if (response.status === 200) {

        dispatch(fetchPostsSuccess_analysis(json, errandId, dispatch))
      } else {
        dispatch(fetchPostsError_analysis(json));
        dispatch(closeCsLoaderModal())
        dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      }
    })
  }
}

function fetchPosts_analysis(token, errandId) {
  //console.log(token)

  return fetch(API + '/api/signals/' + errandId + "/", {
    method: 'get',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(response => Promise.all([response, response.json()])).catch(function(error) {
    bootbox.alert("Something went wrong. Please try again later.")
  });

}

function fetchPostsSuccess_analysis(signalAnalysis, errandId, dispatch) {

  if (signalAnalysis.status == SUCCESS) {
    clearInterval(createSignalInterval);
    dispatch(closeCsLoaderModal())
    dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
    dispatch(clearLoadingMsg());
  } else if (signalAnalysis.status == FAILED || signalAnalysis.status == false) {
    //bootbox.alert("Your signal could not be created. Please try later.")
    bootbox.alert("The signal could not be created. Please check the dataset and try again.")
    clearInterval(createSignalInterval);
    dispatch(closeCsLoaderModal())
    dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
    dispatch(clearLoadingMsg())
  } else if (signalAnalysis.status == "INPROGRESS") {
    dispatch(dispatchSignalLoadingMsg(signalAnalysis));
  }
  return {type: "SIGNAL_ANALYSIS", signalAnalysis, errandId}
}

function fetchPostsError_analysis(json) {
  //console.log("fetching list error!!",json)
  return {type: "SIGNAL_ANALYSIS_ERROR", json}
}
export function setPossibleAnalysisList(varType,varText,varSlug) {

    if (varType == MEASURE) {
        $(".treatAsCategorical").removeClass("hidden")
        var isVarTypeChanged = checkIfDataTypeChanges(varSlug);
        if (isVarTypeChanged) {
            varType = DIMENSION;
            $(".treatAsCategorical").find('input[type=checkbox]').prop("checked", true);
        } else {
            $(".treatAsCategorical").find('input[type=checkbox]').prop("checked", false);
        }
    } else {
        $(".treatAsCategorical").find('input[type=checkbox]').prop("checked", false);
        $(".treatAsCategorical").addClass("hidden")
    }
    return {type: "SET_POSSIBLE_LIST", varType, varText, varSlug};
}

export function updateAdvanceSettings(event){
   var variableSelection = store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray;
   var dataSetMeasures = store.getState().datasets.dataSetMeasures.slice();
   var dataSetDimensions = store.getState().datasets.dataSetDimensions.slice();
   var dataSetTimeDimensions = store.getState().datasets.dataSetTimeDimensions.slice();
   var selOption = event.target.childNodes[event.target.selectedIndex];
   var varType = selOption.value;
   var varText = selOption.text;
   var varSlug = selOption.getAttribute("name");
    return (dispatch) => {
        return triggerAdvanceSettingsAPI(variableSelection).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(updateTargetAnalysisList(json));
                dispatch(setPossibleAnalysisList(varType,varText,varSlug));
                dispatch(updateSelectAllAnlysis(false));
                //clear all analysis once target variable is changed
                 //dispatch(selectAllAnalysisList(false));
            }
        })
    }
}

function triggerAdvanceSettingsAPI(variableSelection){
    return fetch(API+'/api/datasets/'+store.getState().datasets.selectedDataSet+'/advanced_settings_modification/',{
        method: 'put',
        body:JSON.stringify({
            variableSelection
        }),
        headers: getHeader(getUserDetailsOrRestart.get().userToken)
    }).then( response => Promise.all([response, response.json()]));
}

function updateTargetVariable(slug,array){
    for(var i=0;i<array.length;i++){
    if(array[i].slug == slug){
        array[i].targetColumn = !array[i].targetColumn;
        array[i].targetColSetVarAs = null;
        return array;
    }
}

}

function handleSelectAllFlag(array){
    var selectAllFlag = true;
    for(var i=0;i<array.length;i++){
       if(array[i].selected == false && array[i].targetColumn == false){
            selectAllFlag = false;
            return selectAllFlag;
        }
    }
    
}
export function clearMeasureSearchIfTargetIsSelected(name){ 
    $("#measureSearch").val(""); 
    return { 
        type: "SEARCH_MEASURE", 
        name, 
    } 
} 
export function clearDimensionSearchIfTargetIsSelected(name){ 
    $("#dimensionSearch").val(""); 
    return { 
        type: "SEARCH_DIMENSION", 
        name, 
    } 
} 
export function hideTargetVariable(event,jobType){
    return (dispatch) => {
    var selOption = event.target.childNodes[event.target.selectedIndex];
    var varType = selOption.value;
    var varText = selOption.text;
    var varSlug = selOption.getAttribute("name");
    var prevVarSlug = store.getState().signals.selVarSlug;
    var prevVarType = store.getState().signals.getVarType;
    var prevSetVarAs = null;
  
    dispatch(clearMeasureSearchIfTargetIsSelected("")) 
    dispatch(clearDimensionSearchIfTargetIsSelected("")) 
    
    var dataSetMeasures = store.getState().datasets.dataSetMeasures.slice();
    var dataSetDimensions = store.getState().datasets.dataSetDimensions.slice();
    var dataSetTimeDimensions = store.getState().datasets.dataSetTimeDimensions.slice();
    var dimFlag =  store.getState().datasets.dimensionAllChecked;
    var meaFlag = store.getState().datasets.measureAllChecked;
    var count = store.getState().datasets.selectedVariablesCount;
    if(varType == "measure"){
        dataSetMeasures = updateTargetVariable(varSlug,dataSetMeasures);
        $("#measureSearch").val("");
    }else if(varType == "dimension"){
        dataSetDimensions = updateTargetVariable(varSlug,dataSetDimensions);
        $("#dimensionSearch").val("");
    }
    if(prevVarSlug != null){
        dataSetDimensions = updateTargetVariable(prevVarSlug,dataSetDimensions)
        dataSetMeasures = updateTargetVariable(prevVarSlug,dataSetMeasures)    
    }
    
    dimFlag = handleSelectAllFlag(dataSetDimensions);
    meaFlag = handleSelectAllFlag(dataSetMeasures);
    
    dispatch(updateStoreVariables(dataSetMeasures,dataSetDimensions,dataSetTimeDimensions,dimFlag,meaFlag,count));
    count = getTotalVariablesSelected();
    dispatch(updateVariablesCount(count));
    if(jobType == "signals"){
        dispatch(updateAdvanceSettings(event));
    }

    }

}
export function updateVariablesCount(count){
    return {type: "UPDATE_VARIABLES_COUNT", count}
}
function checkIfDataTypeChanges(varSlug) {
  var transformSettings = store.getState().datasets.dataTransformSettings;
  var isVarTypeChanged = false
  for (var i = 0; i < transformSettings.length; i++) {
    if (transformSettings[i].slug == varSlug) {
      for (var j = 0; j < transformSettings[i].columnSetting.length; j++) {
        if (transformSettings[i].columnSetting[j].actionName == SET_VARIABLE) {
          for (var k = 0; k < transformSettings[i].columnSetting[j].listOfActions.length; k++) {
            if (transformSettings[i].columnSetting[j].listOfActions[k].name != "general_numeric") {
              if (transformSettings[i].columnSetting[j].listOfActions[k].status) {
                isVarTypeChanged = true;
                break;
              }
            }
          }
        }
      }
      break;
    }
  }
  return isVarTypeChanged;
}
function updateSetVarAs(colSlug,evt){
    return (dispatch) => {
        var dataSetMeasures = store.getState().datasets.CopyOfMeasures.slice();
        var dataSetDimensions = store.getState().datasets.CopyOfDimension.slice();
        var dataSetTimeDimensions = store.getState().datasets.CopyTimeDimension.slice();
        var dimFlag =  store.getState().datasets.dimensionAllChecked;
        var meaFlag = store.getState().datasets.measureAllChecked;
        var count = store.getState().datasets.selectedVariablesCount;
        for(var i=0;i<dataSetMeasures.length;i++){
            if(dataSetMeasures[i].slug == colSlug){
                if(dataSetMeasures[i].targetColSetVarAs == null){
                    dataSetMeasures[i].targetColSetVarAs = "percentage";
                    break;
                }
                else{
                    dataSetMeasures[i].targetColSetVarAs = null;
                    break;
                }

            }
        }
        dispatch(updateStoreVariables(dataSetMeasures,dataSetDimensions,dataSetTimeDimensions,dimFlag,meaFlag,count));
    }
}
export function updateCategoricalVariables(colSlug, colName, actionName, evt) {
  return (dispatch) => {
        dispatch(updateSetVarAs(colSlug));

  }
}

export function changeSelectedVariableType(colSlug, colName, actionName, evt) {
  var varType = "dimension";
  var varText = colName;
  var varSlug = colSlug;
  if (evt.target.checked) {
    varType = "dimension";
    return {type: "SET_POSSIBLE_LIST", varType, varText, varSlug}
  } else {
    varType = "measure";
    return {type: "SET_POSSIBLE_LIST", varType, varText, varSlug}
  }

}

export function createcustomAnalysisDetails() {
  var transformSettings = store.getState().datasets.dataTransformSettings;
  var customAnalysisDetails = []
  var polarity = []
  var columnSettings = {}
  var uidColumn = {}
  for (var i = 0; i < transformSettings.length; i++) {
    //  if(transformSettings[i].slug == store.getState().signals.selVarSlug){
    for (var j = 0; j < transformSettings[i].columnSetting.length; j++) {
      if (transformSettings[i].columnSetting[j].actionName == SET_VARIABLE) {
        for (var k = 0; k < transformSettings[i].columnSetting[j].listOfActions.length; k++) {
          if (transformSettings[i].columnSetting[j].listOfActions[k].name != "general_numeric") {
            if (transformSettings[i].columnSetting[j].listOfActions[k].status) {
              // customAnalysisDetails.push({ "colName":store.getState().signals.getVarText,
              //     "colSlug":store.getState().signals.selVarSlug,
              //     "treatAs":transformSettings[i].columnSetting[j].listOfActions[k].name})
              customAnalysisDetails.push({"colName": transformSettings[i].name, "colSlug": transformSettings[i].slug, "treatAs": transformSettings[i].columnSetting[j].listOfActions[k].name})
            }
          }
        }
      } else if (transformSettings[i].columnSetting[j].actionName == SET_POLARITY) {
        for (var k = 0; k < transformSettings[i].columnSetting[j].listOfActions.length; k++) {
          if (transformSettings[i].columnSetting[j].listOfActions[k].status) {
            polarity.push({"colName": transformSettings[i].name, "colSlug": transformSettings[i].slug, "polarity": transformSettings[i].columnSetting[j].listOfActions[k].name})
          }

        }
      } else if (transformSettings[i].columnSetting[j].actionName == UNIQUE_IDENTIFIER) {
        uidColumn.colSlug = transformSettings[i].slug;
        uidColumn.colName = transformSettings[i].name;
      }
    }
    //}
  }
  return columnSettings = {
    "customAnalysisDetails": customAnalysisDetails,
    "polarity": polarity,
    "uidColumn": uidColumn
  };
}
export function showPredictions(predictionSelected) {
  return {type: "SEL_PREDICTION", predictionSelected}
}
export function emptySignalAnalysis() {
  return {type: "SIGNAL_ANALYSIS_EMPTY"}
}

//delete signal -------------------
export function showDialogBox(slug,dialog,dispatch,evt){
    var labelTxt = evt.target.text;
	Dialog.setOptions({
		  defaultOkLabel: 'Yes',
		  defaultCancelLabel: 'No',
		})
	dialog.show({
		  title: 'Delete Signal',
		  body: 'Are you sure you want to delete this Signal ? Yes , No',
		  actions: [
		    Dialog.CancelAction(),
		    Dialog.OKAction(() => {
		        if(labelTxt.indexOf("Stop") != -1)dispatch(handleJobProcessing(slug));
		        else deleteSignal(slug,dialog,dispatch)
		    })
		  ],
		  bsSize: 'medium',
		  onHide: (dialogBox) => {
		    dialogBox.hide()
		    //console.log('closed by clicking background.')
		  }
		});
}
export function handleDelete(slug,dialog,evt) {
	return (dispatch) => {
		showDialogBox(slug,dialog,dispatch,evt)
	}
}
function deleteSignal(slug, dialog, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return deleteSignalAPI(slug).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getList(getUserDetailsOrRestart.get().userToken, store.getState().signals.signalList.current_page));
      dispatch(hideLoading());
    } else {
      dialog.showAlert("The card could not be deleted. Please try again later.");
      dispatch(hideLoading());
    }
  })
}
function deleteSignalAPI(slug) {
  //console.log("deleteSignalAPI(slug)");
  //console.log(slug);
  return fetch(API + '/api/signals/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({deleted: true})
  }).then(response => Promise.all([response, response.json()]));

}

// end of delete signal
//store search element
export function storeSearchElement(search_element) {
  return {type: "SEARCH_SIGNAL", search_element}
}
export function storeSortElements(sorton, sorttype) {

  return {type: "SORT_SIGNAL", sorton, sorttype}
}

export function setSideCardListFlag(sideCardListClass) {
  return {type: "SET_SIDECARDLIST_FLAG", sideCardListClass}
}

export function handleRename(slug, dialog, name) {
  return (dispatch) => {
    showRenameDialogBox(slug, dialog, dispatch, name)
  }
}
function showRenameDialogBox(slug, dialog, dispatch, name) {
  const customBody = (
    <div className="form-group">

      <label for="fl1" className="control-label">Enter a new name</label>
      <input className="form-control" id="idRenameSignal" type="text" defaultValue={name}/>
    </div>
  )

  dialog.show({
    title: 'Rename Signal',
    body: customBody,
    actions: [
      Dialog.CancelAction(), Dialog.OKAction(() => {
        renameSignal(slug, dialog, $("#idRenameSignal").val(), dispatch)
      })
    ],
    bsSize: 'medium',
    onHide: (dialogBox) => {
      dialogBox.hide()
      //console.log('closed by clicking background.')
    }
  });
}

function renameSignal(slug, dialog, newName, dispatch) {
  dispatch(showLoading());
  Dialog.resetOptions();
  return renameSignalAPI(slug, newName).then(([response, json]) => {
    if (response.status === 200) {
      dispatch(getList(getUserDetailsOrRestart.get().userToken, store.getState().datasets.current_page));
      dispatch(hideLoading());
    } else {
      dialog.showAlert("Renaming unsuccessful. Please try again later.");
      dispatch(hideLoading());
    }
  })
}
function renameSignalAPI(slug, newName) {
  return fetch(API + '/api/signals/' + slug + '/', {
    method: 'put',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify({name: newName})
  }).then(response => Promise.all([response, response.json()]));

}
export function advanceSettingsModal(flag) {
  return {type: "ADVANCE_SETTINGS_MODAL", flag}
}

function dispatchSignalLoadingMsg(signalAnalysis) {
  let message = signalAnalysis.message
  console.log("loading message########")
  console.log(message)
  return {type: "CHANGE_LOADING_MSG", message}
}
export function clearLoadingMsg() {
  return {type: "CLEAR_LOADING_MSG"}
}
export function handleDecisionTreeTable(evt) {
  var probability = "";
  var probabilityCond = true;
  var noDataFlag = true;
  //triggered when probability block is clicked to select and unselect
  if (evt) {
    selectProbabilityBlock(evt);
  }
  if ($(".pred_disp_block").find(".selected").length > 0)
    probability = $(".pred_disp_block").find(".selected")[0].innerText.toLowerCase();

  $(".popupDecisionTreeTable").find("tr").each(function() {
    if (this.rowIndex != 0) {
      if (probability)
        probabilityCond = probability.indexOf(this.cells[4].innerText.toLowerCase()) != -1;
      if (this.cells[2].innerText.toLowerCase().trim() == store.getState().signals.selectedPrediction.toLowerCase().trim() && probabilityCond) {
        $(this).removeClass("hidden");
        noDataFlag = false;
      } else {
        $(this).addClass("hidden");
      }
    }
  })
  if (noDataFlag) {
    $(".popupDecisionTreeTable").addClass("hidden");
  } else {
    $(".popupDecisionTreeTable").removeClass("hidden");
  }
}
export function handleTopPredictions() {
  var noDataFlag = true;
  $(".topPredictions").find("tr").each(function() {
    if (this.rowIndex != 0) {
      if (this.cells[2].innerText.toLowerCase().trim() == store.getState().signals.selectedPrediction.toLowerCase().trim()) {
        $(this).removeClass("hidden");
        noDataFlag = false;
      } else {
        $(this).addClass("hidden");
      }

    }
  })
  if (noDataFlag) {
    $(".topPredictions").addClass("hidden");
  } else {
    $(".topPredictions").removeClass("hidden");
  }
}
export function selectProbabilityBlock(evt) {
  $(".pred_disp_block").each(function() {
    if (!$(this).find("a").hasClass("selected")) {
      if ($(this).find("a")[0].innerText.toLowerCase().indexOf(evt.target.innerText.toLowerCase()) != -1) {
        $(this).find("a").addClass("selected");
      } else {
        $(this).find("a").removeClass("selected");
      }
    } else {
      $(this).find("a").removeClass("selected");
    }

  })

}
export function showZoomChart(flag, classId) {
  return {type: "ZOOM_CHART", flag, classId}
}

export function updateHide(flag) {
  return {type: "UPDATE_HIDE", flag}
}

export function showChartData(flag, classId) {
  return {type: "CHART_DATA", flag, classId}
}

export function updateselectedL1(selectedL1){
  return{
    type:"SELECTED_L1",
    selectedL1
  }
}
export function resetSelectedTargetVariable(){
    var varType = null;
    var varText = null;
    var varSlug = null;
    return {type: "SET_POSSIBLE_LIST", varType, varText, varSlug}
}
