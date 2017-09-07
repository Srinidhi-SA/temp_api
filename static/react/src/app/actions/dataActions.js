import React from "react";
import {API} from "../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED} from "../helpers/helper";
import store from "../store";
import {dataPreviewInterval,dataUploadLoaderValue} from "./dataUploadActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
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
	let search_element = store.getState().datasets.data_search_element
	console.log(search_element)
	if(search_element!=""&&search_element!=null){
		console.log("calling for search element!!")
		return fetch(API+'/api/datasets/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
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
	var data = doc;
	return {
		type: "DATA_ALL_LIST",
		data,
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
		if(evt.target.checked){
			return {
				type: "SELECTED_TIMEDIMENSION",
				variableName
			}
		}else{
			return {
				type: "UNSELECT_TIMEDIMENSION",
				variableName
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
	var count = 0
	if(timeDimension != undefined){
		count = dimensions.length + measures.length + 1;
	}else{
		count = dimensions.length + measures.length;
	}
	console.log("check count::");
	console.log(dimensions)
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


export function updateDatasetVariables(measures,dimensions,timeDimensions,measureChkBoxList,dimChkBoxList){

	return {
		type: "DATASET_VARIABLES",
		measures,
		dimensions,
		timeDimensions,
		measureChkBoxList,
		dimChkBoxList
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
		return {
			type: "SORT_MEASURE",
			measures,
		}
		break;
	case "dimension":
		let dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;});
		if(sortOrder == "DESC" )
			dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.toLowerCase() > b.toLowerCase()) ? -1 : 1;});
		return {
			type: "SORT_DIMENSION",
			dimensions,
		}
		break;
	case "datetime":
		let timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;});
		if(sortOrder == "DESC" )
			timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.toLowerCase() > b.toLowerCase()) ? -1 : 1;});
		return {
			type: "SORT_TIMEDIMENSION",
			timedimensions,
		}
		break;
	}
}

export function handleSelectAll(evt){
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
			meaChkBoxList
		}
	}else{
		return {
			type: "UNSELECT_ALL_MEASURES",
			meaChkBoxList
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
    			diaChkBoxList
    		}
    	}else{
    		return {
    			type: "UNSELECT_ALL_DIMENSION",
    			diaChkBoxList
    		}
    	}

		break;
	case "datetime":

		break;
	}
}
export function getDialogRef(dialogBox){
	return {
		type: "DATA_DIALOG_BOX",
		dialogBox
	}
}
