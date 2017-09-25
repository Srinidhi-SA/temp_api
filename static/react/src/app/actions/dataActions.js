import React from "react";
import {API} from "../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED} from "../helpers/helper";
import store from "../store";
import {dataPreviewInterval,dataUploadLoaderValue} from "./dataUploadActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import {isEmpty} from "../helpers/helper";
let refDialogBox = "";

function getHeader(token){
	return {
		'Authorization': token,
		'Content-Type': 'application/json'
	};
}


export function getDataList(pageNo) {
	return (dispatch) => {
		return fetchDataList(pageNo,sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				dispatch(fetchDataSuccess(json))
			}
			else{
				dispatch(fetchDataError(json))
			}
		})
	}
}

function fetchDataList(pageNo,token) {

	console.log(token)
	let search_element = store.getState().datasets.data_search_element;
	let data_sorton =  store.getState().datasets.data_sorton;
  let data_sorttype = store.getState().datasets.data_sorttype;
    if(data_sorttype=='asc')
		data_sorttype = ""
	else if(data_sorttype=='desc')
		data_sorttype="-"
	
	console.log(search_element)
	if(search_element!=""&&search_element!=null){
		console.log("calling for search element!!")
		return fetch(API+'/api/datasets/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
			method: 'get',
			headers: getHeader(token)
			}).then( response => Promise.all([response, response.json()]));
	}else if((data_sorton!=""&& data_sorton!=null) && (data_sorttype!=null)){
	    return fetch(API+'/api/datasets/?sorted_by='+data_sorton+'&ordering='+data_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
  }else{
		return fetch(API+'/api/datasets/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
			method: 'get',
			headers: getHeader(token)
		}).then( response => Promise.all([response, response.json()]));
	}


}

function fetchDataError(json) {
	return {
		type: "DATA_LIST_ERROR",
		json
	}
}
export function fetchDataSuccess(doc){
	var data = doc;
	var current_page =  doc.current_page
	return {
		type: "DATA_LIST",
		data,
		current_page,
	}
}


export function getDataSetPreview(slug,interval) {
	return (dispatch) => {
		return fetchDataPreview(slug).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchDataPreviewSuccess(json,interval,dispatch))
			}
			else{
				dispatch(hideDULoaderPopup());
				dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
				dispatch(fetchDataPreviewError(json))
			}
		})
	}
}

function fetchDataPreview(slug) {
	return fetch(API+'/api/datasets/'+slug+'/',{
		method: 'get',
		headers: getHeader(sessionStorage.userToken)
	}).then( response => Promise.all([response, response.json()]));
}
//get preview data
function fetchDataPreviewSuccess(dataPreview,interval,dispatch) {
	console.log("data preview from api to store")
	var slug = "";
	if(dataPreview.status == SUCCESS){
		slug = dataPreview.slug;
		if(interval != undefined){
			clearInterval(interval);
			dispatch(dispatchDataPreview(dataPreview,slug));
			dispatch(hideDULoaderPopup());
			dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
		} else{
			dispatch(dispatchDataPreview(dataPreview,slug));
		}
		return {
			type: "DATA_PREVIEW",
			dataPreview,
			slug,
		}
	}else if(dataPreview.status == FAILED){
		clearInterval(interval);
		dispatch(hideDULoaderPopup());
		 bootbox.alert("The uploaded file does not contain data in readable format. Please check the source file.")
		dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
		return {
			type: "DATA_PREVIEW_FOR_LOADER",
			dataPreview,
			slug,
		}
	}
}

function dispatchDataPreview(dataPreview,slug){
	return {
		type: "DATA_PREVIEW",
		dataPreview,
		slug,
	}
}
function fetchDataPreviewError(json) {
	console.log("fetching list error!!",json)
	return {
		type: "DATA_PREVIEW_ERROR",
		json
	}
}

export function getAllDataList(pageNo) {
	return (dispatch) => {
		return fetchAllDataList(sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchAllDataSuccess(json))
			}
			else{
				dispatch(fetchAllDataError(json))
			}
		})
	}
}


function fetchAllDataList(token) {
	return fetch(API+'/api/datasets/all/',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchAllDataError(json) {
	return {
		type: "DATA_ALL_LIST_ERROR",
		json
	}
}
export function fetchAllDataSuccess(doc){
	var data = ""
	var slug = "";
	if(doc.data[0] != undefined){
		slug  = doc.data[0].slug;
		data = doc;
	}
	return {
		type: "DATA_ALL_LIST",
		data,
		slug
	}
}
export function selectedAnalysisList(evt){
	var selectedAnalysis = evt.target.value;
	if(evt.target.className == "possibleAnalysis"){
		if(evt.target.checked){
			return {
				type: "SELECTED_ANALYSIS_TYPE",
				selectedAnalysis
			}
		}else{
			return {
				type: "UNSELECT_ANALYSIS_TYPE",
				selectedAnalysis
			}
		}
	}
}
export function unselectAllPossibleAnalysis(){
	let unselectAll =[];
	return {
				type: "UNSELECT_All_ANALYSIS_TYPE",
				unselectAll
			}

}

export function updateSelectedVariables(evt){
	var variableName = evt.target.value;

	if(evt.target.className == "measure"){
		//Calculate whether select all should be check or not
		var meaChkBoxList = store.getState().datasets.measureChecked;
		meaChkBoxList[evt.target.name] = evt.target.checked;
		 var isAllChecked = meaChkBoxList.filter(function(c) {
	    	return c;
	    }).length === meaChkBoxList.length;

		if(evt.target.checked){
			return {
				type: "SELECTED_MEASURES",
				variableName,
				meaChkBoxList,
				isAllChecked
			}
		}else{
			return {
				type: "UNSELECT_MEASURES",
				variableName,
				meaChkBoxList,
				isAllChecked
			}
		}
	}
	else if(evt.target.className == "dimension"){
		var dimChkBoxList = store.getState().datasets.dimensionChecked;
		dimChkBoxList[evt.target.name] = evt.target.checked;
		 var isAllChecked = dimChkBoxList.filter(function(c) {
	    	return c;
	    }).length === dimChkBoxList.length;
		if(evt.target.checked){
			return {
				type: "SELECTED_DIMENSIONS",
				variableName,
				dimChkBoxList,
				isAllChecked,

			}
		}else{
			return {
				type: "UNSELECT_DIMENSION",
				variableName,
				dimChkBoxList,
				isAllChecked,
			}
		}
	}
	else if(evt.target.className == "timeDimension"){
		var timeChkBoxList = store.getState().datasets.dateTimeChecked;
		var index = evt.target.id.split("dt")[1];
		for(var i =0;i<timeChkBoxList.length;i++){
			if(i == index){
				timeChkBoxList[i] = evt.target.checked;
			}else{
				timeChkBoxList[i] = false;
			}
		}
		timeChkBoxList[evt.target.id.split("dt")[1]] = evt.target.checked;
		if(evt.target.checked){
			return {
				type: "SELECTED_TIMEDIMENSION",
				variableName,
				timeChkBoxList
			}
		}else{
			return {
				type: "UNSELECT_TIMEDIMENSION",
				variableName,
				timeChkBoxList
			}
		}
	}

}


export function showDataPreview() {
	return {
		type: "SHOW_DATA_PREVIEW",
	}
}

export function hideDataPreview() {
	return {
		type: "HIDE_DATA_PREVIEW",
	}
}

export function storeSignalMeta(signalMeta,curUrl) {
	return {
		type: "STORE_SIGNAL_META",
		signalMeta,
		curUrl
	}
}

export function updateDatasetName(dataset){
	return {
		type: "SELECTED_DATASET",
		dataset,
	}
}
export function resetSelectedVariables(){
	return {
		type: "RESET_VARIABLES",
	}
}
export function setSelectedVariables(dimensions,measures,timeDimension){
	let count = 0;
	if(timeDimension != undefined){
		count = dimensions.slice().length + measures.slice().length + 1;
	}else{
		count = dimensions.slice().length + measures.slice().length;
	}
	console.log("check count::");
	console.log(dimensions)
	console.log(count)
	return {
		type: "SET_VARIABLES",
		dimensions,
		measures,
		timeDimension,
		count,
	}
}

export function openDULoaderPopup(){
	return {
		type: "DATA_UPLOAD_LOADER",
	}
}


export function hideDULoaderPopup(){
	return {
		type: "HIDE_DATA_UPLOAD_LOADER",
	}
}
export function showDialogBox(slug,dialog,dispatch){
	Dialog.setOptions({
		defaultOkLabel: 'Yes',
		defaultCancelLabel: 'No',
	})
	dialog.show({
		title: 'Delete Dataset',
		body: 'Are you sure you want to delete dataset?',
		actions: [
		          Dialog.CancelAction(),
		          Dialog.OKAction(() => {
		        	  deleteDataset(slug,dialog,dispatch)
		          })
		          ],
		          bsSize: 'medium',
		          onHide: (dialogBox) => {
		        	  dialogBox.hide()
		        	  console.log('closed by clicking background.')
		          }
	});
}
export function handleDelete(slug,dialog) {
	return (dispatch) => {
		showDialogBox(slug,dialog,dispatch)
	}
}
function deleteDataset(slug,dialog,dispatch){
	dispatch(showLoading());
	Dialog.resetOptions();
	return deleteDatasetAPI(slug).then(([response, json]) =>{
		if(response.status === 200){
			dispatch(getDataList(store.getState().datasets.current_page));
			dispatch(hideLoading());
		}
		else{
			dialog.showAlert("Error occured , Please try after sometime.");
			dispatch(hideLoading());
		}
	})
}
function deleteDatasetAPI(slug){
	return fetch(API+'/api/datasets/'+slug+'/',{
		method: 'put',
		headers: getHeader(sessionStorage.userToken),
		body:JSON.stringify({
			deleted:true,
		}),
	}).then( response => Promise.all([response, response.json()]));

}



export function handleRename(slug,dialog,name){
	return (dispatch) => {
		showRenameDialogBox(slug,dialog,dispatch,name)
	}
}
function showRenameDialogBox(slug,dialog,dispatch,name){
	const customBody = (
			<div className="form-group">
			<label for="fl1" className="col-sm-6 control-label">Enter Dataset New Name</label>
			<input className="form-control"  id="idRenameDataset" type="text" defaultValue={name}/>
			</div>
	)

	dialog.show({
		title: 'Rename Dataset',
		body: customBody,
		actions: [
		          Dialog.CancelAction(),
		          Dialog.OKAction(() => {
		        	  renameDataset(slug,dialog,$("#idRenameDataset").val(),dispatch)
		          })
		          ],
		          bsSize: 'medium',
		          onHide: (dialogBox) => {
		        	  dialogBox.hide()
		        	  console.log('closed by clicking background.')
		          }
	});
}

function renameDataset(slug,dialog,newName,dispatch){
	dispatch(showLoading());
	Dialog.resetOptions();
	return renameDatasetAPI(slug,newName).then(([response, json]) =>{
		if(response.status === 200){
			dispatch(getDataList(store.getState().datasets.current_page));
			dispatch(hideLoading());
		}
		else{
			dialog.showAlert("Error occured , Please try after sometime.");
			dispatch(hideLoading());
		}
	})
}
function renameDatasetAPI(slug,newName){
	return fetch(API+'/api/datasets/'+slug+'/',{
		method: 'put',
		headers: getHeader(sessionStorage.userToken),
		body:JSON.stringify({
			name:newName,
		}),
	}).then( response => Promise.all([response, response.json()]));
	}

	export function storeSearchElement(search_element){
	  return {
			type: "SEARCH_DATA",
			search_element
		}
	}
	
export function storeSortElements(sorton,sorttype){
	  return {
		type: "SORT_DATA",
		sorton,
		sorttype
	}
}


export function updateDatasetVariables(measures,dimensions,timeDimensions,measureChkBoxList,dimChkBoxList,dateTimeChkBoxList){

	return {
		type: "DATASET_VARIABLES",
		measures,
		dimensions,
		timeDimensions,
		measureChkBoxList,
		dimChkBoxList,
		dateTimeChkBoxList

	}
}

export function handleDVSearch(evt){
	var name = evt.target.value;
	switch (  evt.target.name ) {
	case "measure":
		return {
		type: "SEARCH_MEASURE",
		name,
	}
		break;
	case "dimension":
		return {
		type: "SEARCH_DIMENSION",
		name,
	}
		break;
	case "datetime":
		return {
		type: "SEARCH_TIMEDIMENSION",
		name,
	}
		break;
	}

}
export function handelSort(variableType,sortOrder){
	switch ( variableType ) {

	case "measure":
		let measures = store.getState().datasets.dataSetMeasures.slice().sort(function(a,b) { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;});
		if(sortOrder == "DESC" )
			measures = store.getState().datasets.dataSetMeasures.slice().sort(function(a,b) { return (a.toLowerCase() > b.toLowerCase()) ? -1 : 1;});
		let checkBoxList = handleCheckboxes(measures,"measure")
		return {
			type: "SORT_MEASURE",
			measures,
			checkBoxList
		}
		break;
	case "dimension":
		let dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;});
		if(sortOrder == "DESC" )
			dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.toLowerCase() > b.toLowerCase()) ? -1 : 1;});
		let checkBoxList1 = handleCheckboxes(dimensions,"dimension")
		return {
			type: "SORT_DIMENSION",
			dimensions,
			checkBoxList1
		}
		break;
	case "datetime":
		let timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;});
		if(sortOrder == "DESC" )
			timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.toLowerCase() > b.toLowerCase()) ? -1 : 1;});
		let checkBoxList2 = handleCheckboxes(timedimensions,"datetime")
		return {
			type: "SORT_TIMEDIMENSION",
			timedimensions,
			checkBoxList2,
		}
		break;
	}
}
function handleCheckboxes(list,listType){
	var checkBoxList = [];
	var targetArray = store.getState().datasets.selectedDimensions;
	if(listType == "measure"){
		targetArray = store.getState().datasets.selectedMeasures;
	}else  if(listType == "dimension"){
		targetArray = store.getState().datasets.selectedDimensions;
	}else  if(listType == "datetime"){
		targetArray = [];
		targetArray[0] = store.getState().datasets.selectedTimeDimensions;
	}
	for(var i=0;i<list.length;i++){
		if($.inArray(list[i],targetArray) != -1){
			checkBoxList.push(true);
		}else 	checkBoxList.push(false);
		}
	return checkBoxList;
}
export function handleSelectAll(evt){
	var dataTimeCount = 0;
	if(store.getState().datasets.selectedTimeDimensions){
		dataTimeCount = 1;
	}
	switch ( evt.target.id ) {
	case "measure":
		$("#measureSearch").val("");
		var meaChkBoxList = store.getState().datasets.measureChecked;
		meaChkBoxList = meaChkBoxList.map(function() {
            return evt.target.checked
        })
	if(evt.target.checked){
		let measures = store.getState().datasets.ImmutableMeasures;
		return {
			type: "SELECT_ALL_MEASURES",
			measures,
			meaChkBoxList,
			dataTimeCount
		}
	}else{
		return {
			type: "UNSELECT_ALL_MEASURES",
			meaChkBoxList,
			dataTimeCount
		}
	}
		break;
	case "dimension":
		var diaChkBoxList = store.getState().datasets.dimensionChecked;
		diaChkBoxList = diaChkBoxList.map(function() {
            return evt.target.checked
        })
        if(evt.target.checked){
    		let dimension = store.getState().datasets.ImmutableDimension;
    		return {
    			type: "SELECT_ALL_DIMENSION",
    			dimension,
    			diaChkBoxList,
    			dataTimeCount
    		}
    	}else{
    		return {
    			type: "UNSELECT_ALL_DIMENSION",
    			diaChkBoxList,
    			dataTimeCount
    		}
    	}

		break;
	case "datetime":

		break;
	}
}


export function updateSubSetting(updatedSubSetting){

	return {
		type: "UPDATE_SUBSETTING",
		updatedSubSetting

	}
}

//data subsetting actions
export function getSubSettedDataset(subset,slug) {
    return (dispatch) => {
    return fetchsubset(subset,slug).then(([response, json]) =>{
        if(response.status){
          //console.log(json)
        dispatch(fetchsubsetSuccess(json))
      }
      else{
        dispatch(fetchfetchsubsetError(json))
      }
    })
  }
}

let json_dummy = {
    "input_file": "/media/datasets/myTestFile_bwsVTG8.csv",
    "name": "testin g2",
    "slug": "",
    "auto_update": false,
    "auto_update_duration": 99999,
    "datasource_type": "fileUpload",
    "datasource_details": {},
    "preview": {},
    "meta_data": {
        "advanced_settings": {
            "measures": {
                "analysis": [
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [],
                        "displayName": "Overview",
                        "name": "overview"
                    },
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Factors that drive up",
                                "name": "factors that drive up"
                            },
                            {
                                "status": false,
                                "displayName": "Factors that drive down",
                                "name": "factors that drive down"
                            },
                            {
                                "status": false,
                                "displayName": "Forecast",
                                "name": "forecast"
                            }
                        ],
                        "displayName": "Trend Analysis",
                        "name": "trend analysis"
                    },
                    {
                        "status": false,
                        "variableCount": [
                            {
                                "status": true,
                                "name": "Low",
                                "value": 3
                            },
                            {
                                "status": false,
                                "name": "Medium",
                                "value": 5
                            },
                            {
                                "status": false,
                                "name": "High",
                                "value": 10
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Top Sublevel",
                                "name": "Top Sublevel"
                            },
                            {
                                "status": false,
                                "displayName": "Trend for top Sublevel",
                                "name": "Trend for top Sublevel"
                            }
                        ],
                        "displayName": "Performance Analysis",
                        "name": "Performance Analysis"
                    },
                    {
                        "status": false,
                        "variableCount": [
                            {
                                "status": true,
                                "name": "Low",
                                "value": 3
                            },
                            {
                                "status": false,
                                "name": "Medium",
                                "value": 5
                            },
                            {
                                "status": false,
                                "name": "High",
                                "value": 10
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Key areas of Impact",
                                "name": "Key areas of Impact"
                            },
                            {
                                "status": false,
                                "displayName": "Trend analysis",
                                "name": "Trend analysis"
                            }
                        ],
                        "displayName": "Influencers",
                        "name": "influencers"
                    },
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [],
                        "displayName": "Prediction",
                        "name": "Prediction"
                    }
                ]
            },
            "dimensions": {
                "analysis": [
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [],
                        "displayName": "Overview",
                        "name": "overview"
                    },
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Factors that drive up",
                                "name": "factors that drive up"
                            },
                            {
                                "status": false,
                                "displayName": "Factors that drive down",
                                "name": "factors that drive down"
                            },
                            {
                                "status": false,
                                "displayName": "Forecast",
                                "name": "forecast"
                            }
                        ],
                        "displayName": "Trend Analysis",
                        "name": "trend analysis"
                    },
                    {
                        "status": false,
                        "variableCount": [
                            {
                                "status": true,
                                "name": "Low",
                                "value": 3
                            },
                            {
                                "status": false,
                                "name": "Medium",
                                "value": 5
                            },
                            {
                                "status": false,
                                "name": "High",
                                "value": 10
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Top Sublevel",
                                "name": "Top Sublevel"
                            },
                            {
                                "status": false,
                                "displayName": "Trend for top Sublevel",
                                "name": "Trend for top Sublevel"
                            }
                        ],
                        "displayName": "Performance Analysis",
                        "name": "Performance Analysis"
                    },
                    {
                        "status": false,
                        "variableCount": [
                            {
                                "status": true,
                                "name": "Low",
                                "value": 3
                            },
                            {
                                "status": false,
                                "name": "Medium",
                                "value": 5
                            },
                            {
                                "status": false,
                                "name": "High",
                                "value": 10
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": false,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": false,
                                "displayName": "Key areas of Impact",
                                "name": "Key areas of Impact"
                            },
                            {
                                "status": false,
                                "displayName": "Trend analysis",
                                "name": "Trend analysis"
                            }
                        ],
                        "displayName": "Influencers",
                        "name": "influencers"
                    },
                    {
                        "status": false,
                        "variableCount": [],
                        "analysisSubTypes": [],
                        "displayName": "Prediction",
                        "name": "Prediction"
                    }
                ]
            }
        }
    },
    "created_at": "2017-09-23T09:35:48.093986Z",
    "deleted": false,
    "bookmarked": false,
    "file_remote": "hdfs",
    "analysis_done": false,
    "status": "INPROGRESS",
    "created_by": {
        "username": "marlabs",
        "first_name": "Ankush",
        "last_name": "Patel",
        "email": "ankush.patel@marlabs.com",
        "date_joined": "2017-08-16T11:46:35Z"
    },
    "job": 1177
}
function fetchsubset(subset,slug) {

    return fetch(API+'/datasets/'+slug+'/subsetting/',{
      method: 'PUT',
      headers: getHeader(sessionStorage.userToken),
			body: JSON.stringify(subset)
		}).then( response => Promise.all([response, json_dummy]));

}


function fetchsubsetSuccess(subsetRs) {
//alert("success")
console.log(subsetRs)
  return {
    type: "SUBSETTED_DATASET",
		subsetRs

  }
}

function fetchsubsetError(json) {
console.log("fetching list error!!",json)
  // return {
  //   type: "SIGNAL_LIST_ERROR",
  //   json
  // }
}
