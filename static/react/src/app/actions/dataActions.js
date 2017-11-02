import React from "react";
import {API} from "../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED,getUserDetailsOrRestart} from "../helpers/helper";
import store from "../store";
import {dataPreviewInterval,dataUploadLoaderValue,clearLoadingMsg} from "./dataUploadActions";
import {closeAppsLoaderValue} from "./appActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import {isEmpty,RENAME,DELETE,REPLACE,DATA_TYPE,REMOVE,CURRENTVALUE,NEWVALUE} from "../helpers/helper";
let refDialogBox = "";

function getHeader(token){
	return {
		'Authorization': token,
		'Content-Type': 'application/json'
	};
}


export function getDataList(pageNo) {
	return (dispatch) => {
		return fetchDataList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
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

					console.log(data_sorton+" "+data_sorttype)

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
//fetch stock dataset Preview
export function getStockDataSetPreview(slug,interval) {
	return (dispatch) => {
		return fetchStockDataPreview(slug).then(([response, json]) =>{
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
function fetchStockDataPreview(slug) {
	return fetch(API+'/api/stockdataset/'+slug+'/',{
		method: 'get',
		headers: getHeader(sessionStorage.userToken)
	}).then( response => Promise.all([response, response.json()]));
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
		headers: getHeader(getUserDetailsOrRestart.get().userToken)
	}).then( response => Promise.all([response, response.json()]));
}
//get preview data
function fetchDataPreviewSuccess(dataPreview,interval,dispatch) {
	console.log("data preview from api to store")
	console.log(dataPreview)
	var slug = "";
	if(dataPreview.status == SUCCESS){
		slug = dataPreview.slug;
		if(interval != undefined){
			clearInterval(interval);
			dispatch(dispatchDataPreview(dataPreview,slug));
			dispatch(hideDULoaderPopup());
			dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
			dispatch(closeAppsLoaderValue());
		} else{
			dispatch(dispatchDataPreview(dataPreview,slug));
		}
		dispatch(clearLoadingMsg())
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
		dispatch(clearLoadingMsg())

		return {
			type: "DATA_PREVIEW_FOR_LOADER",
			dataPreview,
			slug,
		}
	}else if(dataPreview.status == "INPROGRESS"){
		dispatch(dispatchDataPreviewLoadingMsg(dataPreview));
	}
}

function dispatchDataPreview(dataPreview,slug){
	return {
		type: "DATA_PREVIEW",
		dataPreview,
		slug,
	}
}

function dispatchDataPreviewLoadingMsg(dataPreview){
	let message = dataPreview.message
	console.log("loading message########")
	console.log(message)
	return {
		type: "CHANGE_LOADING_MSG",
		message
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
		return fetchAllDataList(getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
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
	var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
	var analysisList = [];
	var renderList = {};
	if(store.getState().signals.getVarType == "measure"){
		analysisList = totalAnalysisList.measures.analysis.slice();
	}else{
		analysisList = totalAnalysisList.dimensions.analysis.slice();
	}
	//For top level analysis update like tren,prediction,association
	if(evt.target.className == "possibleAnalysis"){
		for(var i=0;i<analysisList.length;i++){
			if(analysisList[i].name == evt.target.value)
				analysisList[i].status = evt.target.checked;
		}
	}
	
	if(store.getState().signals.getVarType == "measure"){
		totalAnalysisList.measures.analysis = analysisList
	}else{
		totalAnalysisList.dimensions.analysis = analysisList
	}
	renderList.measures = totalAnalysisList.measures;
	renderList.dimensions = totalAnalysisList.dimensions;
	return {
		type: "UPDATE_ANALYSIS_LIST",
		renderList
	}
}


export function selectAllAnalysisList(evt){
	//var selectedAnalysis = evt.target.checked;
	var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
	var analysisList = [];
	var renderList = {};
	if(store.getState().signals.getVarType == "measure"){
		analysisList = totalAnalysisList.measures.analysis.slice();
	}else{
		analysisList = totalAnalysisList.dimensions.analysis.slice();
	}
	if(evt.target.className == "allAnalysis"){
		for(var i=0;i<analysisList.length;i++){
			//if(analysisList[i].name == evt.target.value)
			analysisList[i].status = evt.target.checked;
		}
		/*if(evt.target.checked){
			return {
				type: "SELECTED_ANALYSIS_TYPE",
				selectedAnalysis
			}
		}else{
			return {
				type: "UNSELECT_ANALYSIS_TYPE",
				selectedAnalysis
			}
		}*/
		if(store.getState().signals.getVarType == "measure"){
			totalAnalysisList.measures.analysis = analysisList
		}else{
			totalAnalysisList.dimensions.analysis = analysisList
		}
		renderList.measures = totalAnalysisList.measures;
		renderList.dimensions = totalAnalysisList.dimensions;
		return {
			type: "UPDATE_ANALYSIS_LIST",
			renderList
		}
	}
}


export function setAnalysisLevel(level,levelVal, analysisName){
	var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
	var analysisList = [];
	var renderList = {};
	//var chkAnalysis = id.split("-");
	if(store.getState().signals.getVarType == "measure"){
		analysisList = totalAnalysisList.measures.analysis.slice();
	}else{
		analysisList = totalAnalysisList.dimensions.analysis.slice();
	}

	for(var i=0;i<analysisList.length;i++){
		//analysisList[i].noOfColumnsToUse
		if((analysisList[i].name == analysisName) && (analysisList[i].noOfColumnsToUse != null)){
			let noOfCols = analysisList[i].noOfColumnsToUse;
			for(var j=0; j<noOfCols.length;j++){
				if(noOfCols[j].name == level){
					noOfCols[j].status = true; 
					if(level=="custom" && levelVal != null){
						noOfCols[j].value= levelVal;
					}
				}else{
					noOfCols[j].status = false; 
					if(noOfCols[j].name=="custom"){
						noOfCols[j].value= null;
					}
				}
			}
			analysisList[i].noOfColumnsToUse = noOfCols;
		}
	}
	if(store.getState().signals.getVarType == "measure"){
		totalAnalysisList.measures.analysis = analysisList
	}else{
		totalAnalysisList.dimensions.analysis = analysisList
	}

	renderList.measures = totalAnalysisList.measures;
	renderList.dimensions = totalAnalysisList.dimensions;
	return {
		type: "UPDATE_ANALYSIS_LIST_FOR_LEVELS",
		renderList
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
		headers: getHeader(getUserDetailsOrRestart.get().userToken),
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
		headers: getHeader(getUserDetailsOrRestart.get().userToken),
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


export function updateDatasetVariables(measures,dimensions,timeDimensions,measureChkBoxList,dimChkBoxList,dateTimeChkBoxList,possibleAnalysisList){

	return {
		type: "DATASET_VARIABLES",
		measures,
		dimensions,
		timeDimensions,
		measureChkBoxList,
		dimChkBoxList,
		dateTimeChkBoxList,
		possibleAnalysisList

	}
}

export function setDimensionSubLevels(selectedDimensionSubLevels){
	return {
		type: "SELECTED_DIMENSION_SUBLEVELS",
		selectedDimensionSubLevels
	}
}
export function selectedTrendSubList(selectedTrendSub){
	//store.getState().datasets.dataSetAnalysisList
	//store.getState().datasets.getVarType
	var analysisList = store.getState().datasets.dataSetAnalysisList;

	if(store.getState().signals.getVarType == "dimension"){


		let keys = Object.keys(selectedTrendSub);

		for(var i in analysisList.dimensions.trendSettings){
			let name = analysisList.dimensions.trendSettings[i].name.toLowerCase();

			if(keys.indexOf(name) >=0){ 
				analysisList.dimensions.trendSettings[i].status = true;

				if(name.indexOf("specific measure") != -1)
					analysisList.dimensions.trendSettings[i].selectedMeasure = selectedTrendSub[name];

			}else{
				analysisList.dimensions.trendSettings[i].status = false;

				if(name.indexOf("specific measure") != -1)
					analysisList.dimensions.trendSettings[i].selectedMeasure = null;
			}
		}

	} else if(store.getState().signals.getVarType == "measure"){

		let keys = Object.keys(selectedTrendSub);

		for(var i in analysisList.measures.trendSettings){
			let name = analysisList.measures.trendSettings[i].name.toLowerCase();

			if(keys.indexOf(name) >=0){ 
				analysisList.measures.trendSettings[i].status = true;

				if(name.indexOf("specific measure") != -1)
					analysisList.measures.trendSettings[i].selectedMeasure = selectedTrendSub[name];

			}else{
				analysisList.measures.trendSettings[i].status = false;

				if(name.indexOf("specific measure") != -1)
					analysisList.measures.trendSettings[i].selectedMeasure = null;
			}
		}
	}
	console.log(analysisList);
	return {
		type: "SELECTED_TREND_SUB_LIST",
		//selectedTrendSub
		analysisList
	}

}
export function  selectedDimensionSubLevel(dimensionSubLevel){

	return {
		type: "SELECTED_DIMENSION_SUB_LEVEL",
		dimensionSubLevel
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

//Rename Metadata column
export function renameMetaDataColumn(dialog,colName,colSlug,dispatch,actionName){
	const customBody = (
			<div className="form-group">
			<label for="fl1" className="col-sm-6 control-label">Enter New Column Name : </label>
			<input className="form-control"  id="idRenameMetaCloumn" type="text" defaultValue={colName}/>
			</div>
	)

	dialog.show({
		title: 'Rename Column',
		body: customBody,
		actions: [
		          Dialog.CancelAction(),
		          Dialog.OKAction(() => {
		        	  updateColumnName(dispatch,colSlug,$("#idRenameMetaCloumn").val());
		        	  updateColumnStatus(dispatch,colSlug,$("#idRenameMetaCloumn").val(),actionName);

		          })
		          ],
		          bsSize: 'medium',
		          onHide: (dialogBox) => {
		        	  dialogBox.hide()
		        	  //console.log('closed by clicking background.')
		          }
	});
}
function updateColumnName(dispatch,colSlug,newColName){
	var metaData = store.getState().datasets.dataPreview;
	var slug = store.getState().datasets.selectedDataSet;
	var colData = metaData.meta_data.columnData;
	for(var i=0;i<colData.length;i++){
		if(colData[i].slug == colSlug){
			colData[i].name = newColName;
			break;
		}
	}
	metaData.meta_data.columnData = colData;
	let dataPreview = Object.assign({}, metaData);
	//handleColumnActions(dataPreview,slug,dispatch)
}
export function handleColumnClick(dialog,actionName,colSlug,colName,subActionName){
	return (dispatch) => {
		if(actionName == RENAME){
			renameMetaDataColumn(dialog,colName,colSlug,dispatch,actionName)
		}else if(actionName == DELETE){
			deleteMetaDataColumn(dialog,colName,colSlug,dispatch,actionName)
		}else if(actionName == DATA_TYPE){
			//dispatch(updateVLPopup(true));
			updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName);
		}else if(actionName == REPLACE){
			dispatch(updateVLPopup(true));
			dispatch(addComponents());
			//updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName);
		}
	}
}

function deleteMetaDataColumn(dialog,colName,colSlug,dispatch,actionName){

	bootbox.alert("Are you sure, you want to delete column ?",function(){
		$(".cst_table").find("thead").find("."+colSlug).first().addClass("dataPreviewUpdateCol");
		$(".cst_table").find("tbody").find("tr").find("."+colSlug).addClass("dataPreviewUpdateCol");
		updateColumnStatus(dispatch,colSlug,colName,actionName)
	})
}
export function updateVLPopup(flag){
	return{
		type: "UPDATE_VARIABLES_TYPES_MODAL",
		flag
	}
}
export function updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName){
	var transformSettings = store.getState().datasets.dataTransformSettings.slice();
	var slug = store.getState().datasets.selectedDataSet;
	for(var i =0;i<transformSettings.length;i++){
		if(transformSettings[i].slug == colSlug){
			for(var j=0;j<transformSettings[i].columnSetting.length;j++){
				if(transformSettings[i].columnSetting[j].actionName == actionName){

					if(actionName == RENAME){
						transformSettings[i].columnSetting[j].newName = colName;
						transformSettings[i].columnSetting[j].status=true;
						break;
					}else if(actionName == DELETE){
						if(transformSettings[i].columnSetting[j].status){
							transformSettings[i].columnSetting[j].status = false;
							$(".cst_table").find("thead").find("."+colSlug).first().removeClass("dataPreviewUpdateCol");
							$(".cst_table").find("tbody").find("tr").find("."+colSlug).removeClass("dataPreviewUpdateCol");
						}
						else transformSettings[i].columnSetting[j].status = true;
						break;
					}else if(actionName == DATA_TYPE){
						transformSettings[i].columnSetting[j].status=true;
						for(var k=0;k<transformSettings[i].columnSetting[j].listOfDataTypes.length;k++){
							if(transformSettings[i].columnSetting[j].listOfDataTypes[k].name == subActionName){
								transformSettings[i].columnSetting[j].listOfDataTypes[k].status = true;
							}else{
								transformSettings[i].columnSetting[j].listOfDataTypes[k].status = false;
							}
						}
						break;
					}
					else if(actionName == REPLACE){
						transformSettings[i].columnSetting[j].status=true;
						var removeValues =  store.getState().datasets.dataSetColumnRemoveValues.slice();
						var replaceValues =  store.getState().datasets.dataSetColumnReplaceValues.slice();
						replaceValues = replaceValues.concat(removeValues);
						transformSettings[i].columnSetting[j].replacementValues = replaceValues;
					}

				}
			}//end of for columnsettings
			break;
		}
	}
	dispatch(handleColumnActions(transformSettings,slug))
	dispatch(updateVLPopup(false));
	//dispatch(updateTransformSettings(transformSettings));

}
export function handleSaveEditValues(colSlug){
	return (dispatch) => {
	updateColumnStatus(dispatch,colSlug,"",REPLACE,"");
	}
}
function updateTransformSettings(transformSettings){
	return{
		type: "UPDATE_DATA_TRANSFORM_SETTINGS",
		transformSettings
	}
}

export function updateColSlug(slug){
	return{
		type: "DATASET_SELECTED_COLUMN_SLUG",
		slug
	}
}

export function handleColumnActions(transformSettings,slug) {
	return (dispatch) => {
		return fetchModifiedMetaData(transformSettings,slug).then(([response, json]) =>{
			if(response.status === 200){
				dispatch(fetchDataValidationSuccess(json))
			}
			else{
				dispatch(fetchDataPreviewError(json))
			}
		})
	}
}

function fetchModifiedMetaData(transformSettings,slug) {
	var tran_settings = {};
	tran_settings.existingColumns = transformSettings;
	return fetch(API+'/api/datasets/'+slug+'/meta_data_modifications/',{
		method: 'put',
		headers: getHeader(getUserDetailsOrRestart.get().userToken),
		body:JSON.stringify({
			config:tran_settings,
		}),
	}).then( response => Promise.all([response, response.json()]));
}

export function fetchDataValidationSuccess(dataPreview){
	return{
		type: "DATA_VALIDATION_PREVIEW",
		dataPreview
	}
}

//Need to remove this function
export function updateTranformColumns(){
	var transformSettings = store.getState().datasets.dataTransformSettings;
	$(".cst_table").find("thead").find("tr").find("th").each(function(){
		for(var i =0;i<transformSettings.length;i++){
			if(transformSettings[i].name == this.innerText && transformSettings[i].status == true){
				//$(this).addClass("dataPreviewUpdateCol");
			}
		}
	});

}

export function addComponents(editType){
	return (dispatch) => {
		var dataColumnRemoveValues = [];
		dataColumnRemoveValues.push({"id":1,"name":"remove1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
		dataColumnRemoveValues.push({"id":2,"name":"remove2","valueToReplace":"","replacedValue":"","replaceType":"contains"});
		var dataColumnReplaceValues = [];
		dataColumnReplaceValues.push({"replaceId":1,"name":"replace1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
		dataColumnReplaceValues.push({"replaceId":2,"name":"replace2","valueToReplace":"","replacedValue":"","replaceType":"contains"});
		if(editType === REMOVE){
			dispatch(updateColumnRemoveValues(dataColumnRemoveValues))
		}
		else if(editType === REPLACE){
			dispatch(updateColumnReplaceValues(dataColumnReplaceValues))
		}
		else{
			dispatch(updateColumnReplaceValues(dataColumnReplaceValues))
			dispatch(updateColumnRemoveValues(dataColumnRemoveValues))	
		}
	}

}
function updateColumnRemoveValues(removeValues){
	return{
		type: "DATA_VALIDATION_REMOVE_VALUES",
		removeValues
	}
}
function updateColumnReplaceValues(replaceValues){
	return{
		type: "DATA_VALIDATION_REPLACE_VALUES",
		replaceValues
	}
}
export function addMoreComponentsToReplace(editType){
	return (dispatch) => {
		if(editType == REMOVE){
			var dataColumnRemoveValues = store.getState().datasets.dataSetColumnRemoveValues.slice();
			var max = dataColumnRemoveValues.reduce(function(prev, current) { 
				return (prev.id > current.id) ? prev : current

			});
			let length = max.id+1;
			dataColumnRemoveValues.push({"id":length,"name":"remove"+length,"valueToReplace":"","replacedValue":"","replaceType":"contains"});
			dispatch(updateColumnRemoveValues(dataColumnRemoveValues))
		}else{
			var dataColumnReplaceValues = store.getState().datasets.dataSetColumnReplaceValues.slice();
			var max = dataColumnReplaceValues.reduce(function(prev, current) { 
				return (prev.replaceId > current.replaceId) ? prev : current

			});
			let length = max.replaceId+1;
			dataColumnReplaceValues.push({"replaceId":length,"name":"replace"+length,"valueToReplace":"","replacedValue":"","replaceType":"contains"});
			dispatch(updateColumnReplaceValues(dataColumnReplaceValues))	
		}
		
	}
}
export function removeComponents(data,editType){
	return (dispatch) => {
		if(editType == REMOVE){
		var dataColumnRemoveValues = store.getState().datasets.dataSetColumnRemoveValues.slice();
		for (var i=0;i<dataColumnRemoveValues.length;i++) {
			if(dataColumnRemoveValues[i].id == data.id){
				dataColumnRemoveValues.splice(i,1);
				break;
			}
		}
		dispatch(updateColumnRemoveValues(dataColumnRemoveValues))
		}else{
			var dataColumnReplaceValues = store.getState().datasets.dataSetColumnReplaceValues.slice();
			for (var i=0;i<dataColumnReplaceValues.length;i++) {
				if(dataColumnReplaceValues[i].replaceId == data.replaceId){
					dataColumnReplaceValues.splice(i,1);
					break;
				}
			}
			dispatch(updateColumnReplaceValues(dataColumnReplaceValues))
		}
	}
}
export function handleInputChange(event){
	return (dispatch) => {
		var dataColumnRemoveValues = store.getState().datasets.dataSetColumnRemoveValues.slice();
		for (var i=0;i<dataColumnRemoveValues.length;i++) {
			if(dataColumnRemoveValues[i].id == event.target.id){
				if(event.target.type == "text"){
					dataColumnRemoveValues[i].valueToReplace = event.target.value;
					break;
				}else {
					dataColumnRemoveValues[i].replaceType = event.target.value;
					break;
				}

			}
		}
		dispatch(updateColumnRemoveValues(dataColumnRemoveValues))
	}
}
export function handleInputChangeReplace(targetTextBox,event){
	return (dispatch) => {
		var dataSetColumnReplaceValues = store.getState().datasets.dataSetColumnReplaceValues.slice();
		for (var i=0;i<dataSetColumnReplaceValues.length;i++) {
			if(dataSetColumnReplaceValues[i].replaceId == event.target.id){
				if(targetTextBox == NEWVALUE){
					dataSetColumnReplaceValues[i].replacedValue = event.target.value;
					break;
				}	
				else if(targetTextBox == CURRENTVALUE){
					dataSetColumnReplaceValues[i].valueToReplace = event.target.value;
					break;
				}else{
					dataSetColumnReplaceValues[i].replaceType = event.target.value;
					break;
				}
			}
		}
		dispatch(updateColumnReplaceValues(dataSetColumnReplaceValues))
	}
}



