import React from "react";
import {API} from "../helpers/env";
import {CSLOADERPERVALUE,LOADERMAXPERVALUE,DEFAULTINTERVAL,PERPAGE,SUCCESS,FAILED,getUserDetailsOrRestart,DIMENSION,
    MEASURE,SET_VARIABLE,PERCENTAGE,GENERIC_NUMERIC,SET_POLARITY,DYNAMICLOADERINTERVAL,UNIQUE_IDENTIFIER} from "../helpers/helper";
import {connect} from "react-redux";
import store from "../store";
import {openCsLoaderModal,closeCsLoaderModal,updateCsLoaderValue,updateCsLoaderMsg} from "./createSignalActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import {updateColumnStatus} from './dataActions';
// var API = "http://34.196.204.54:9000";

// @connect((store) => {
//   return {signal: store.signals.signalAnalysis};
// })
var createSignalInterval = null;
var refreshSignalInterval = null;

function getHeader(token){
  return {
    'Authorization': token,
    'Content-Type': 'application/json'
  };
}
export function checkIfDateTimeIsSelected(){
    var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
    var analysisList = [];
    var trendIsChecked = false;
    if(store.getState().signals.getVarType == MEASURE){
        analysisList = totalAnalysisList.measures.analysis;
    }else{
        analysisList = totalAnalysisList.dimensions.analysis;
    }

    for(var i=0;i<analysisList.length;i++){
    if(analysisList[i].name == "trend"){
       if( analysisList[i].status){
           trendIsChecked = true;
       }
       break;
    }
}
   return  trendIsChecked;

}

//x-www-form-urlencoded'
export function createSignal(metaData) {
   return (dispatch) => {
         return fetchCreateSignal(metaData).then(([response, json]) =>{
             if(response.status === 200){
               //console.log(json)
             dispatch(fetchCreateSignalSuccess(json,dispatch))
           }
           else{
             dispatch(fetchCreateSignalError(json))
              dispatch(closeCsLoaderModal())
             dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
           }
         })
     }

  }

function fetchCreateSignal(metaData) {
  //console.log(metaData)

  return fetch(API+'/api/signals/',{
		method: 'POST',
    headers: getHeader(getUserDetailsOrRestart.get().userToken),
    body: JSON.stringify(metaData)
		}).then( response => Promise.all([response, response.json()]));
}

export function triggerSignalAnalysis(signalData,percentage,message){
    return (dispatch) => {
        dispatch(updateCsLoaderValue(percentage));
        dispatch(updateCsLoaderMsg(message));
        fetchCreateSignalSuccess(signalData,dispatch);
        dispatch(assignSignalData(signalData));
    }
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
export function fetchCreateSignalSuccess(signalData, dispatch) {
  //console.log("signal list from api to store")
  // if(signalData.type == "dimension"){
    console.log("created in progress slug is:")
    console.log(signalData)
     let msg = store.getState().signals.loaderText
    let loaderVal = store.getState().signals.createSignalLoaderValue
    if(signalData.hasOwnProperty("proceed_for_loading") && !signalData.proceed_for_loading){
        msg = "Your signal will be created in background...";
        dispatch(updateCsLoaderMsg(msg));
        setTimeout(function() {
            dispatch(closeCsLoaderModal())
            dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
        },DYNAMICLOADERINTERVAL);

    }

    else{
        createSignalInterval = setInterval(function() {

            let loading_message = store.getState().signals.loading_message
            dispatch(getSignalAnalysis(getUserDetailsOrRestart.get().userToken,signalData.slug));
            if(store.getState().signals.createSignalLoaderValue < LOADERMAXPERVALUE){
              if (loading_message && loading_message.length > 0) {
                //check if display is true
                if(loading_message[loading_message.length - 1].display&&loading_message[loading_message.length - 1].display==true){
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

  return {
    type: "CREATE_SUCCESS",
    signalData
  }
}
export function clearCreateSignalInterval(){
    clearInterval(createSignalInterval);
}
export function emptySignalData(){
    return (dispatch) => {
    var signalData = null;
    dispatch(assignSignalData(signalData));
    }
}
export function assignSignalData(signalData){
    return {
        type: "CREATE_SUCCESS",
        signalData
      }
}

function fetchCreateSignalError(json) {
  //console.log("fetching list error!!",json)

  return {
    type: "CREATE_ERROR",
    json
  }
}

export function getList(token,pageNo) {

    return (dispatch) => {
    return fetchPosts(token,pageNo).then(([response, json]) =>{
        if(response.status === 200){
          //console.log(json)
        dispatch(fetchPostsSuccess(json))
      }
      else{
        dispatch(fetchPostsError(json))
      }
    })
  }
}

function fetchPosts(token,pageNo) {
  //console.log(token)
  let search_element = store.getState().signals.signal_search_element;
  let signal_sorton =  store.getState().signals.signal_sorton;
  let signal_sorttype = store.getState().signals.signal_sorttype;
  console.log(search_element)
    if(signal_sorttype=='asc')
		signal_sorttype = ""
	else if(signal_sorttype=='desc')
		signal_sorttype="-"
  //console.log(search_element)
  if(search_element!=""&&search_element!=null){
    //console.log("calling for search element!!")
    if((signal_sorton!=""&&signal_sorton!=null) && (signal_sorttype!=null)){
      return fetch(API+'/api/signals/?name='+search_element+'&sorted_by='+signal_sorton+'&ordering='+signal_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
    }else{
    return fetch(API+'/api/signals/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
    }
  }else if((signal_sorton!=""&&signal_sorton!=null) && (signal_sorttype!=null)){
	    return fetch(API+'/api/signals/?sorted_by='+signal_sorton+'&ordering='+signal_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
  }else{
    return fetch(API+'/api/signals/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
  }


}

export function refreshSignals(props){
    return (dispatch) => {
        refreshSignalInterval = setInterval(function() {

           var pageNo = window.location.href.split("=")[1];
            if(pageNo == undefined) pageNo = 1;
            if(window.location.pathname == "/signals")
            dispatch(getList(getUserDetailsOrRestart.get().userToken, parseInt(pageNo)));
        },DEFAULTINTERVAL);

    }
}
function fetchPostsSuccess(signalList) {
  //console.log("signal list from api to store")
  //console.log(signalList);
  var current_page =  signalList.current_page
  return {
    type: "SIGNAL_LIST",
    signalList,
    current_page
  }
}

function fetchPostsError(json) {
  //console.log("fetching list error!!",json)
  return {
    type: "SIGNAL_LIST_ERROR",
    json
  }
}

//for getting signal analysis:
export function getSignalAnalysis(token,errandId) {

    return (dispatch) => {
    return fetchPosts_analysis(token,errandId).then(([response, json]) =>{
        if(response.status === 200){

        dispatch(fetchPostsSuccess_analysis(json,errandId,dispatch))
      }
      else{
        dispatch(fetchPostsError_analysis(json));
        dispatch(closeCsLoaderModal())
        dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      }
    })
  }
}


function fetchPosts_analysis(token,errandId) {
  //console.log(token)

  return fetch(API+'/api/signals/'+errandId+"/",{
		method: 'get',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
  }).then( response => Promise.all([response, response.json()])).catch(function(error){
    bootbox.alert("Something went wrong. Please try again later.")
  });

}


function fetchPostsSuccess_analysis(signalAnalysis, errandId,dispatch) {

  if(signalAnalysis.status == SUCCESS){
    clearInterval(createSignalInterval);
    dispatch(closeCsLoaderModal())
    dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
    dispatch(clearLoadingMsg());
  }else if(signalAnalysis.status == FAILED||signalAnalysis.status == false){
	  //bootbox.alert("Your signal could not be created. Please try later.")
    bootbox.alert("The signal could not be created. Please check the dataset and try again.")
	    clearInterval(createSignalInterval);
	    dispatch(closeCsLoaderModal())
	    dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      dispatch(clearLoadingMsg())
  }else if(signalAnalysis.status == "INPROGRESS"){
		dispatch(dispatchSignalLoadingMsg(signalAnalysis));
	}
  return {
    type: "SIGNAL_ANALYSIS",
    signalAnalysis,
    errandId
  }
}

function fetchPostsError_analysis(json) {
  //console.log("fetching list error!!",json)
  return {
    type: "SIGNAL_ANALYSIS_ERROR",
    json
  }
}
export function setPossibleAnalysisList(event) {
    var selOption  = event.target.childNodes[event.target.selectedIndex];
    var varType = selOption.value;
    var varText = selOption.text;
    var varSlug = selOption.getAttribute("name");
   if(varType == MEASURE){
       //$(".treatAsCategorical").show();
       $(".treatAsCategorical").removeClass("hidden")
       var isVarTypeChanged = checkIfDataTypeChanges(varSlug);
       if(isVarTypeChanged){
           varType = DIMENSION ;
           $(".treatAsCategorical").find('input[type=checkbox]').prop("checked",true);
       }else{
           $(".treatAsCategorical").find('input[type=checkbox]').prop("checked",false);
       }
   }else{
       $(".treatAsCategorical").find('input[type=checkbox]').prop("checked",false);
       $(".treatAsCategorical").addClass("hidden")
   }
	return {
		type: "SET_POSSIBLE_LIST",
		varType,
		varText,
		varSlug
	}
}
function checkIfDataTypeChanges(varSlug){
    var transformSettings = store.getState().datasets.dataTransformSettings;
    var isVarTypeChanged = false
    for(var i =0;i<transformSettings.length;i++){
        if(transformSettings[i].slug == varSlug){
            for(var j=0;j<transformSettings[i].columnSetting.length;j++){
                if(transformSettings[i].columnSetting[j].actionName == SET_VARIABLE){
                    for(var k=0;k<transformSettings[i].columnSetting[j].listOfActions.length;k++){
                        if(transformSettings[i].columnSetting[j].listOfActions[k].name != "general_numeric"){
                            if(transformSettings[i].columnSetting[j].listOfActions[k].status){
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
export function updateCategoricalVariables(colSlug,colName,actionName,evt){
    return (dispatch) => {
   if(evt.target.checked){
       updateColumnStatus(dispatch,colSlug,colName,actionName,PERCENTAGE)
   }else{
       updateColumnStatus(dispatch,colSlug,colName,actionName,GENERIC_NUMERIC)
   }
    }
}
export function changeSelectedVariableType(colSlug,colName,actionName,evt){
    var varType = "dimension";
    var varText = colName;
    var varSlug = colSlug;
    if(evt.target.checked){
        varType = "dimension";
        return {
            type: "SET_POSSIBLE_LIST",
            varType,
            varText,
            varSlug
        }
    }else{
        varType = "measure";
        return {
            type: "SET_POSSIBLE_LIST",
            varType,
            varText,
            varSlug
        }
    }

}
export function createcustomAnalysisDetails(){
    var transformSettings = store.getState().datasets.dataTransformSettings;
    var customAnalysisDetails = []
    var polarity=[]
    var columnSettings = {}
    var uidColumn = {}
    for(var i =0;i<transformSettings.length;i++){
  //  if(transformSettings[i].slug == store.getState().signals.selVarSlug){
        for(var j=0;j<transformSettings[i].columnSetting.length;j++){
            if(transformSettings[i].columnSetting[j].actionName == SET_VARIABLE){
                for(var k=0;k<transformSettings[i].columnSetting[j].listOfActions.length;k++){
                    if(transformSettings[i].columnSetting[j].listOfActions[k].name != "general_numeric"){
                        if(transformSettings[i].columnSetting[j].listOfActions[k].status){
                            // customAnalysisDetails.push({ "colName":store.getState().signals.getVarText,
                            //     "colSlug":store.getState().signals.selVarSlug,
                            //     "treatAs":transformSettings[i].columnSetting[j].listOfActions[k].name})
                            customAnalysisDetails.push({ "colName":transformSettings[i].name,
                                "colSlug":transformSettings[i].slug,
                                "treatAs":transformSettings[i].columnSetting[j].listOfActions[k].name})
                        }
                    }
                }
            }else if (transformSettings[i].columnSetting[j].actionName == SET_POLARITY) {
              for(var k=0;k<transformSettings[i].columnSetting[j].listOfActions.length;k++){
                      if(transformSettings[i].columnSetting[j].listOfActions[k].status){
                          polarity.push({  "colName":transformSettings[i].name,
                              "colSlug":transformSettings[i].slug,
                              "polarity":transformSettings[i].columnSetting[j].listOfActions[k].name})
                      }

              }
            }else if(transformSettings[i].columnSetting[j].actionName ==  UNIQUE_IDENTIFIER){
                uidColumn.colSlug = transformSettings[i].slug;
                uidColumn.colName = transformSettings[i].name;
            }
        }
    //}
}
    return columnSettings={"customAnalysisDetails":customAnalysisDetails,
                            "polarity":polarity,"uidColumn":uidColumn};
}
export function showPredictions(predictionSelected) {
	return {
		type: "SEL_PREDICTION",
		predictionSelected
	}
}
export function emptySignalAnalysis() {
	return {
		type: "SIGNAL_ANALYSIS_EMPTY",
	}
}

//delete signal -------------------
export function showDialogBox(slug,dialog,dispatch){
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
		    	deleteSignal(slug,dialog,dispatch)
		    })
		  ],
		  bsSize: 'medium',
		  onHide: (dialogBox) => {
		    dialogBox.hide()
		    //console.log('closed by clicking background.')
		  }
		});
}
export function handleDelete(slug,dialog) {
	return (dispatch) => {
		showDialogBox(slug,dialog,dispatch)
	}
}
function deleteSignal(slug,dialog,dispatch){
	dispatch(showLoading());
	Dialog.resetOptions();
	return deleteSignalAPI(slug).then(([response, json]) =>{
		if(response.status === 200){
			dispatch(getList(getUserDetailsOrRestart.get().userToken,store.getState().signals.signalList.current_page));
			dispatch(hideLoading());
		}
		else{
			dialog.showAlert("The card could not be deleted. Please try again later.");
			dispatch(hideLoading());
		}
	})
}
function deleteSignalAPI(slug){
	//console.log("deleteSignalAPI(slug)");
	//console.log(slug);
	return fetch(API+'/api/signals/'+slug+'/',{
		method: 'put',
		headers: getHeader(getUserDetailsOrRestart.get().userToken),
		body:JSON.stringify({
			deleted:true,
		}),
	}).then( response => Promise.all([response, response.json()]));

	}

// end of delete signal
//store search element
export function storeSearchElement(search_element){
  return {
		type: "SEARCH_SIGNAL",
		search_element
	}
}
export function storeSortElements(sorton,sorttype){
	  return {
		type: "SORT_SIGNAL",
		sorton,
		sorttype
	}
}

export function setSideCardListFlag(sideCardListClass){
	 return {
		type: "SET_SIDECARDLIST_FLAG",
		sideCardListClass
	}
}


export function handleRename(slug,dialog,name){
	return (dispatch) => {
		showRenameDialogBox(slug,dialog,dispatch,name)
	}
}
function showRenameDialogBox(slug,dialog,dispatch,name){
	 const customBody = (
		      <div className="form-group">

		      <label for="fl1" className="control-label">Enter a new name</label>
		      <input className="form-control"  id="idRenameSignal" type="text" defaultValue={name}/>
		      </div>
		    )

	dialog.show({
		  title: 'Rename Signal',
		  body: customBody,
		  actions: [
		    Dialog.CancelAction(),
		    Dialog.OKAction(() => {
		    	renameSignal(slug,dialog,$("#idRenameSignal").val(),dispatch)
		    })
		  ],
		  bsSize: 'medium',
		  onHide: (dialogBox) => {
		    dialogBox.hide()
		    //console.log('closed by clicking background.')
		  }
		});
}

function renameSignal(slug,dialog,newName,dispatch){
	dispatch(showLoading());
	Dialog.resetOptions();
	return renameSignalAPI(slug,newName).then(([response, json]) =>{
		if(response.status === 200){
			dispatch(getList(getUserDetailsOrRestart.get().userToken,store.getState().datasets.current_page));
			dispatch(hideLoading());
		}
		else{
			dialog.showAlert("Renaming unsuccessful. Please try again later.");
			dispatch(hideLoading());
		}
	})
}
function renameSignalAPI(slug,newName){
	return fetch(API+'/api/signals/'+slug+'/',{
		method: 'put',
		headers: getHeader(getUserDetailsOrRestart.get().userToken),
		body:JSON.stringify({
			name:newName,
		}),
	}).then( response => Promise.all([response, response.json()]));

}
export function advanceSettingsModal(flag){
	 return {
			type: "ADVANCE_SETTINGS_MODAL",
		    flag
		}
}

function dispatchSignalLoadingMsg(signalAnalysis){
	let message = signalAnalysis.message
	console.log("loading message########")
	console.log(message)
	return {
		type: "CHANGE_LOADING_MSG",
		message
	}
}
export function clearLoadingMsg() {
  return {type: "CLEAR_LOADING_MSG"}
}
export function handleDecisionTreeTable(evt){
    var probability = "";
    var probabilityCond = true;
    var noDataFlag = true;
    //triggered when probability block is clicked to select and unselect
    if(evt){
        selectProbabilityBlock(evt);
    }
    if($(".pred_disp_block").find(".selected").length > 0)
        probability = $(".pred_disp_block").find(".selected")[0].innerText.toLowerCase();

    $(".popupDecisionTreeTable").find("tr").each(function(){
        if(this.rowIndex != 0 ){
            if(probability)  probabilityCond = probability.indexOf(this.cells[4].innerText.toLowerCase()) != -1;
            if(this.cells[2].innerText.toLowerCase().trim() == store.getState().signals.selectedPrediction.toLowerCase().trim() && probabilityCond){
                $(this).removeClass("hidden");
                noDataFlag = false;
            }else{
                $(this).addClass("hidden");
            }
        }
    })
    if(noDataFlag){
        $(".popupDecisionTreeTable").addClass("hidden");
    }else{
        $(".popupDecisionTreeTable").removeClass("hidden");
    }
}
export function handleTopPredictions(){
    var noDataFlag = true;
    $(".topPredictions").find("tr").each(function(){
        if(this.rowIndex != 0 ){
            if(this.cells[2].innerText.toLowerCase().trim() == store.getState().signals.selectedPrediction.toLowerCase().trim()){
                $(this).removeClass("hidden");
                noDataFlag = false;
            }else{
                $(this).addClass("hidden");
            }

        }
    })
    if(noDataFlag){
        $(".topPredictions").addClass("hidden");
    }else{
        $(".topPredictions").removeClass("hidden");
    }
}
export function selectProbabilityBlock(evt){
    $(".pred_disp_block").each(function(){
        if(!$(this).find("a").hasClass("selected")){
            if($(this).find("a")[0].innerText.toLowerCase().indexOf(evt.target.innerText.toLowerCase()) != -1){
                $(this).find("a").addClass("selected");
            }else{
                $(this).find("a").removeClass("selected");
            }
        }else{
            $(this).find("a").removeClass("selected");
        }

    })

}
export function showZoomChart(flag,classId){
    return {
        type: "ZOOM_CHART",
        flag,
        classId
    }
}
