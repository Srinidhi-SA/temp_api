import React from "react";
import {API} from "../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED,getUserDetailsOrRestart,DEFAULTANALYSISVARIABLES} from "../helpers/helper";
import store from "../store";
import {dataPreviewInterval,dataUploadLoaderValue,clearLoadingMsg,clearDatasetPreview} from "./dataUploadActions";
import {closeAppsLoaderValue} from "./appActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import {isEmpty,RENAME,DELETE,REPLACE,DATA_TYPE,REMOVE,CURRENTVALUE,NEWVALUE,SET_VARIABLE,UNIQUE_IDENTIFIER,SET_POLARITY,handleJobProcessing,IGNORE_SUGGESTION} from "../helpers/helper";
let refDialogBox = "";
var refreshDatasetsInterval = null;
function getHeader(token){
    return {
        'Authorization': token,
        'Content-Type': 'application/json'
    };
}

export function refreshDatasets(props){
    return (dispatch) => {
        refreshDatasetsInterval = setInterval(function() {
            var pageNo = window.location.href.split("=")[1];
            if(pageNo == undefined) pageNo = 1;
            if(window.location.pathname == "/data")
                dispatch(getDataList(parseInt(pageNo)));
        },DEFAULTINTERVAL);
    }
}
export function getDataList(pageNo) {
	return (dispatch) => {
		return fetchDataList(pageNo,getUserDetailsOrRestart.get().userToken,dispatch).then(([response, json]) =>{
			if(response.status === 200){
				dispatch(hideLoading())
				dispatch(fetchDataSuccess(json))
			}
			else{
				dispatch(fetchDataError(json))
				dispatch(hideLoading())
			}
		})
	}
}

function fetchDataList(pageNo,token,dispatch) {

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
						//console.log("calling for search element!!")
						if((data_sorton!=""&& data_sorton!=null) && (data_sorttype!=null))
						{
							return fetch(API+'/api/datasets/?name='+search_element+'&sorted_by='+data_sorton+'&ordering='+data_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
								method: 'get',
								headers: getHeader(token)
							}).then( response => Promise.all([response, response.json()]));
						}else{
						return fetch(API+'/api/datasets/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
							method: 'get',
							headers: getHeader(token)
						}).then( response => Promise.all([response, response.json()]));
					}
					}else if((data_sorton!=""&& data_sorton!=null) && (data_sorttype!=null)){
						dispatch(showLoading())
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
	var latestDatasets = doc.top_3;
	return {
		type: "DATA_LIST",
		data,latestDatasets,
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
		headers: getHeader(getUserDetailsOrRestart.get().userToken)
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
        });
    }
}


function fetchDataPreview(slug) {
    return fetch(API+'/api/datasets/'+slug+'/',{
        method: 'get',
        headers: getHeader(getUserDetailsOrRestart.get().userToken)
    }).then( response => Promise.all([response, response.json()])).catch(function(error){

        dispatch(hideDULoaderPopup());
        //let msg=statusMessages("error","Unable to connect to server. Check your connection please try again.","small_mascot")
        bootbox.alert("Unable to connect to server. Check your connection please try again.")
    });
}
//get preview data
function fetchDataPreviewSuccess(dataPreview,interval,dispatch) {
    console.log("data preview from api to store")
    console.log(dataPreview)
    var  slug = dataPreview.slug;
    var dataset = slug;
    if(dataPreview.status == SUCCESS){

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
        //clearDatasetPreview()
        //dispatch(hideDataPreview())

        return {
            type: "DATA_PREVIEW_FOR_LOADER",
            dataPreview,
            slug,
        }
    }else if(dataPreview.status == "INPROGRESS"){
        dispatch(dispatchDataPreviewLoadingMsg(dataPreview));
        return {
            type: "SELECTED_DATASET",
            dataset,
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
export function saveAdvanceSettings(){
    var savedAnalysisList = jQuery.extend(true, {}, store.getState().datasets.dataSetAnalysisList);
    return {
        type: "SAVE_UPDATE_ANALYSIS_LIST",
        savedAnalysisList,
    }
}
export function cancelAdvanceSettings(){
    var prevAnalysisList = jQuery.extend(true, {}, store.getState().datasets.dataSetPrevAnalysisList);
    return {
        type: "CANCEL_UPDATE_ANALYSIS_LIST",
        prevAnalysisList
    }
}
export function checkAllAnalysisSelected(){
    return (dispatch) => {
        var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
        var analysisList = [];
        var flag = false;
        if(store.getState().signals.getVarType == "measure"){
            analysisList = totalAnalysisList.measures.analysis;
        }else{
            analysisList = totalAnalysisList.dimensions.analysis;
        }
        for(var i=0;i<analysisList.length;i++){
            if(analysisList[i].status){
                flag = true;
            }else{
                flag = false;
                break;
            }
        }
        dispatch(updateSelectAllAnlysis(flag));
    }

}
export function selectedAnalysisList(evt,noOfColumnsToUse){

    var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
    var prevAnalysisList = jQuery.extend(true, {}, store.getState().datasets.dataSetPrevAnalysisList);
    var analysisList = [];
    var renderList = {};
    var trendSettings = [];
    if(store.getState().signals.getVarType == "measure"){
        analysisList = totalAnalysisList.measures.analysis;
    }else{
        analysisList = totalAnalysisList.dimensions.analysis;
        trendSettings = totalAnalysisList.dimensions.trendSettings;
    }
    //For updating count,specific measure in trend
    if(noOfColumnsToUse == "trend" ){
        if(evt.type == "select-one"){
            for(var i in trendSettings){
                let name = trendSettings[i].name.toLowerCase();
                if(name.indexOf("specific measure") != -1)
                    trendSettings[i].selectedMeasure = $("#specific-trend-measure").val();

            }
        }
        else{
            for(var i=0;i<analysisList.length;i++){
                if(analysisList[i].name == "trend"){
                    analysisList[i].status = evt.checked;
                    break;
                }
            }
            for(var i in trendSettings){
                let name = trendSettings[i].name.toLowerCase();
                if(name == evt.value){
                    trendSettings[i].status = evt.checked;
                    if(name.indexOf("specific measure") != -1)
                        trendSettings[i].selectedMeasure = $("#specific-trend-measure").val();
                }else{
                    trendSettings[i].status = false;
                    if(name.indexOf("specific measure") != -1)
                        trendSettings[i].selectedMeasure = null
                }
            }
        }
    }//For updating low,medium,high values
    else if(noOfColumnsToUse == "noOfColumnsToUse" ){
        if(evt.type == "radio"){
            for(var i=0;i<analysisList.length;i++){
                if(analysisList[i].name == evt.name){
                    analysisList[i].status = true;
                    for(var j=0;j<analysisList[i].noOfColumnsToUse.length;j++){
                        if(analysisList[i].noOfColumnsToUse[j].name == evt.value){
                            analysisList[i].noOfColumnsToUse[j].status = true;
                        }else{
                            analysisList[i].noOfColumnsToUse[j].status = false;
                        }
                    }
                    break;
                }
            }
        }else{
            //for updating custom input value
            for(var i=0;i<analysisList.length;i++){
                if(analysisList[i].name == evt.name){
                    for(var j=0;j<analysisList[i].noOfColumnsToUse.length;j++){
                        if(analysisList[i].noOfColumnsToUse[j].name == "custom"){
                            analysisList[i].noOfColumnsToUse[j].value = $("#"+evt.id).val();
                        }
                    }
                    break;
                }
            }
        }
    }
    //For updating Bin values in Association
    else if(noOfColumnsToUse == "association" ){
        for(var i=0;i<analysisList.length;i++){
            if(analysisList[i].name == evt.name){
                if(evt.value)
                    analysisList[i].status = true;
                else
                    analysisList[i].status = false;
                for(var j=0;j<analysisList[i].binSetting.length;j++){
                    if(evt.id == j){
                        analysisList[i].binSetting[j].value = parseInt(evt.value);
                    }
                }
                break;
            }
        }

    }
    //For top level analysis update like trend,prediction,association
    else {
        if(evt.target.className == "possibleAnalysis"){
            for(var i=0;i<analysisList.length;i++){
                if(analysisList[i].name == evt.target.value){
                    analysisList[i].status = evt.target.checked;
                    if(analysisList[i].noOfColumnsToUse != null){
                        if(!evt.target.checked){
                            for(var j=0;j<analysisList[i].noOfColumnsToUse.length;j++){
                                if(analysisList[i].noOfColumnsToUse[j].name == "custom"){
                                    analysisList[i].noOfColumnsToUse[j].status = evt.target.checked;
                                    analysisList[i].noOfColumnsToUse[j].value = null;
                                }else{
                                    analysisList[i].noOfColumnsToUse[j].status = evt.target.checked;
                                }
                            }
                        }else{
                            //when main analysis is checked , low parameter should be checked as default
                            for(var j=0;j<analysisList[i].noOfColumnsToUse.length;j++){
                                if(analysisList[i].noOfColumnsToUse[j].name == DEFAULTANALYSISVARIABLES){
                                    analysisList[i].noOfColumnsToUse[j].status = evt.target.checked;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }

        //For updating trend count and specific measure when trend is unchecked
        if(evt.target.value.indexOf("trend") != -1){
            if(store.getState().signals.getVarType != "measure"){
                if(!evt.target.checked){
                    for(var i in trendSettings){
                        trendSettings[i].status = evt.target.checked;
                    }
                }else{
                    //when trend is selected , count should be selected as default
                    for(var i in trendSettings){
                        let name = trendSettings[i].name.toLowerCase();
                        if(name.indexOf("count") != -1)
                            trendSettings[i].status = evt.target.checked;
                    }
                }
            }
        }

    }

    if(store.getState().signals.getVarType == "measure"){
        totalAnalysisList.measures.analysis = analysisList
    }else{
        totalAnalysisList.dimensions.analysis = analysisList
        totalAnalysisList.dimensions.trendSettings = trendSettings;
    }
    renderList.measures = totalAnalysisList.measures;
    renderList.dimensions = totalAnalysisList.dimensions;
    return {
        type: "UPDATE_ANALYSIS_LIST",
        renderList,
        prevAnalysisList
    }
}


export function selectAllAnalysisList(flag){
    //var selectedAnalysis = evt.target.checked;
    var totalAnalysisList = store.getState().datasets.dataSetAnalysisList;
    var prevAnalysisList = store.getState().datasets.dataSetAnalysisList;
    var analysisList = [];
    var renderList = {};
    var trendSettings = [];
    if(store.getState().signals.getVarType == "measure"){
        analysisList = totalAnalysisList.measures.analysis.slice();
    }else{
        analysisList = totalAnalysisList.dimensions.analysis.slice();
        trendSettings = totalAnalysisList.dimensions.trendSettings;
    }
    for(var i=0;i<analysisList.length;i++){
        analysisList[i].status = flag;
        if(analysisList[i].noOfColumnsToUse != null){
            for(var j=0;j<analysisList[i].noOfColumnsToUse.length;j++){
                //when select all is unchecked
                if(!flag){
                    if(analysisList[i].noOfColumnsToUse[j].name == "custom"){
                        analysisList[i].noOfColumnsToUse[j].status = flag;
                        analysisList[i].noOfColumnsToUse[j].value = null;
                    }else{
                        analysisList[i].noOfColumnsToUse[j].status = flag;
                    }
                }else{
                    if(analysisList[i].noOfColumnsToUse[j].name == DEFAULTANALYSISVARIABLES){
                        analysisList[i].noOfColumnsToUse[j].status = flag;
                    }else{
                        analysisList[i].noOfColumnsToUse[j].status = false;
                    }
                }

            }
        }
    }


    if(store.getState().signals.getVarType != "measure"){
        for(var i in trendSettings){
            if(!flag){
                trendSettings[i].status = flag;
            }else{
                let name = trendSettings[i].name.toLowerCase();
                if(name.indexOf("count") != -1)
                    trendSettings[i].status = flag;
            }
        }
    }


    if(store.getState().signals.getVarType == "measure"){
        totalAnalysisList.measures.analysis = analysisList
    }else{
        totalAnalysisList.dimensions.analysis = analysisList;
        totalAnalysisList.dimensions.trendSettings = trendSettings;
    }
    renderList.measures = totalAnalysisList.measures;
    renderList.dimensions = totalAnalysisList.dimensions;
    return {
        type: "UPDATE_ANALYSIS_LIST",
        renderList,
        prevAnalysisList
    }
}

export function unselectAllPossibleAnalysis(){
    let unselectAll =[];
    return {
        type: "UNSELECT_All_ANALYSIS_TYPE",
        unselectAll
    }

}

function updateList(slug,array){
    for(var i=0;i<array.length;i++){
        if(array[i].slug == slug){
            array[i].selected = !array[i].selected;
        }
    }
    return array;
}
function updateTimeDimList(slug,array,evt){
    for(var i=0;i<array.length;i++){
    if(array[i].slug == slug){
        array[i].selected = evt.target.checked;
    }else{
        array[i].selected = !evt.target.checked;
    }
}
return array;
}

function getIsAllSelected(array){
    var isAllSelected = true;

    for(var i=0;i<array.length;i++){
        isAllSelected = array[i].selected;
        if(!isAllSelected)break;
    }

    return isAllSelected;
}

export function updateStoreVariables(measures,dimensions,timeDimensions,dimFlag,meaFlag,count) {
    return (dispatch) => {
        dispatch(updateVariables(measures,dimensions,timeDimensions,dimFlag,meaFlag,count));
        dispatch(applyFilterOnVaraibles());
    }
}

export function updateVariables(measures,dimensions,timeDimensions,dimFlag,meaFlag,count) {
    return {
        type: "UPADTE_VARIABLES_LIST",
        measures,
        dimensions,
        timeDimensions,
        dimFlag,
        meaFlag,
        count
    }
}

function applyFilterOnVaraibles(){
    return (dispatch) => {
        var evt = {};
        evt.target = {}
        if($("#measureSearch").val() != ""){
            evt.target.value = $("#measureSearch").val();
            evt.target.name = "measure"
                dispatch(handleDVSearch(evt));
        }
        if($("#dimensionSearch").val() != ""){
            evt.target.value = $("#dimensionSearch").val();
            evt.target.name = "dimension"
                dispatch(handleDVSearch(evt));
        }
        
        if($("#datetimeSearch").val() != ""){
            evt.target.value = $("#datetimeSearch").val();
            evt.target.name = "datetime"
                dispatch(handleDVSearch(evt));
        }
    }
}
export function updateSelectedVariables(evt){
    return (dispatch) => {
        var varSlug = evt.target.id;
        var dataSetMeasures = store.getState().datasets.CopyOfMeasures.slice();
        var dataSetDimensions = store.getState().datasets.CopyOfDimension.slice();
        var dataSetTimeDimensions = store.getState().datasets.CopyTimeDimension.slice();
        
        var dimFlag =  store.getState().datasets.dimensionAllChecked;
        var meaFlag = store.getState().datasets.measureAllChecked;
        var count = store.getState().datasets.selectedVariablesCount;

        if(evt.target.className == "measure"){
            if(evt.target.name != ""){
                dataSetDimensions  = updateList(varSlug,dataSetDimensions);
                dimFlag = getIsAllSelected(dataSetDimensions);
            }
            else{
                dataSetMeasures =  updateList(varSlug,dataSetMeasures);
                meaFlag = getIsAllSelected(dataSetMeasures);
            }
        }else if(evt.target.className == "dimension"){
            dataSetDimensions  = updateList(varSlug,dataSetDimensions);
            dimFlag = getIsAllSelected(dataSetDimensions);
        }
        else if(evt.target.className == "timeDimension"){
            dataSetTimeDimensions  = updateTimeDimList(varSlug,dataSetTimeDimensions,evt);
        }


        //Update selectAll checkbox and selected variables count when varaibles are checked/unchecked
        if(evt.target.className != "timeDimension"){
            if(evt.target.checked){
                count=count+1;
            }else if(!evt.target.checked){
                count = count-1;
            }
        }
        dispatch(updateStoreVariables(dataSetMeasures,dataSetDimensions,dataSetTimeDimensions,dimFlag,meaFlag,count));
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
/*export function setSelectedVariables(dimensions,measures,timeDimension){
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
}*/

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
export function showDialogBox(slug,dialog,dispatch,evt){
    var labelTxt = evt.target.text;
    Dialog.setOptions({
        defaultOkLabel: 'Yes',
        defaultCancelLabel: 'No',
    })
    dialog.show({
        title: 'Delete Dataset',
        body: 'Are you sure you want to delete the selected data set? Yes , No',
        actions: [
                  Dialog.CancelAction(),
                  Dialog.OKAction(() => {
                      if(labelTxt.indexOf("Stop") != -1)dispatch(handleJobProcessing(slug));
                      else deleteDataset(slug,dialog,dispatch)
                  })
                  ],
                  bsSize: 'medium',
                  onHide: (dialogBox) => {
                      dialogBox.hide()
                      console.log('closed by clicking background.')
                  }
    });
}
export function handleDelete(slug,dialog,evt) {
    return (dispatch) => {
        showDialogBox(slug,dialog,dispatch,evt)
    }
}
function deleteDataset(slug,dialog,dispatch){
    dispatch(showLoading());
    Dialog.resetOptions();
    return deleteDatasetAPI(slug).then(([response, json]) =>{
        if(response.status === 200){
            //bootbox.alert("The data set is deleted successfully.")
            dispatch(getDataList(store.getState().datasets.current_page));
            dispatch(hideLoading());
        }
        else{
            dispatch(hideLoading());
            dialog.showAlert("Something went wrong. Please try again later.");
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
            <label for="fl1" className="control-label">Enter a new  Name</label>
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
            dialog.showAlert("Renaming unsuccessful. Please try again later.");
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

export function storeSearchElement_data(search_element){
    storeSearchElement(search_element)
}

export function storeSortElements(sorton,sorttype){
    return {
        type: "SORT_DATA",
        sorton,
        sorttype
    }
}

export function getTotalVariablesSelected(){
   var dataPrev =  store.getState().datasets.dataPreview;
   if(dataPrev){
       var varaiblesList = store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray;
       var totalCount = 0;
       for(var i=0;i<varaiblesList.length;i++){
           if(varaiblesList[i].selected){
               totalCount = totalCount+1;
           }
       }
       return totalCount;
   }
}
export function updateDatasetVariables(measures,dimensions,timeDimensions,possibleAnalysisList,flag){
    let prevAnalysisList = jQuery.extend(true, {}, possibleAnalysisList);
    var count = getTotalVariablesSelected();


    return {
        type: "DATASET_VARIABLES",
        measures,
        dimensions,
        timeDimensions,
        possibleAnalysisList,
        prevAnalysisList,
        count,
        flag

    }
}

export function updateTargetAnalysisList(renderList){
    let prevAnalysisList = jQuery.extend(true, {}, renderList);

    return {
        type: "UPDATE_ANALYSIS_LIST",
        renderList,
        prevAnalysisList,

    }
}

export function setDimensionSubLevels(selectedDimensionSubLevels){
    return {
        type: "SELECTED_DIMENSION_SUBLEVELS",
        selectedDimensionSubLevels
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

export function handelSort(variableType,sortOrder){
    switch ( variableType ) {

    case "measure":
        let measures = store.getState().datasets.dataSetMeasures.slice().sort(function(a,b) { return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;});
        if(sortOrder == "DESC" )
            measures = store.getState().datasets.dataSetMeasures.slice().sort(function(a,b) { return (a.name.toLowerCase() > b.name.toLowerCase()) ? -1 : 1;});
        let checkBoxList = handleCheckboxes(measures,"measure")
        return {
            type: "SORT_MEASURE",
            measures,
            checkBoxList
        }
        break;
    case "dimension":
        let dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;});
        if(sortOrder == "DESC" )
            dimensions = store.getState().datasets.dataSetDimensions.slice().sort(function(a,b) { return (a.name.toLowerCase() > b.name.toLowerCase()) ? -1 : 1;});
        let checkBoxList1 = handleCheckboxes(dimensions,"dimension")
        return {
            type: "SORT_DIMENSION",
            dimensions,
            checkBoxList1
        }
        break;
    case "datetime":
        let timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1;});
        if(sortOrder == "DESC" )
            timedimensions = store.getState().datasets.dataSetTimeDimensions.slice().sort(function(a,b) { return (a.name.toLowerCase() > b.name.toLowerCase()) ? -1 : 1;});
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
function updateSelectedKey(array,IsSelected){
    for(var i=0;i<array.length;i++){
        array[i].selected = IsSelected;
    }
    return array;
}
export function handleSelectAll(evt){
    return (dispatch) => {
        var varType = evt.target.id;
        var dataSetMeasures = store.getState().datasets.CopyOfMeasures.slice();
        var dataSetDimensions = store.getState().datasets.CopyOfDimension.slice();
        var dataSetTimeDimensions = store.getState().datasets.CopyTimeDimension.slice();
        var dimFlag =  store.getState().datasets.dimensionAllChecked;
        var meaFlag = store.getState().datasets.measureAllChecked;
        var count = store.getState().datasets.selectedVariablesCount;
        var targetVariableType = store.getState().signals.getVarType;
        if(varType == "measure"){
            dataSetMeasures  = updateSelectedKey(dataSetMeasures,evt.target.checked);
            meaFlag = evt.target.checked;

        }else if(varType == "dimension"){
            dataSetDimensions  = updateSelectedKey(dataSetDimensions,evt.target.checked);
            dimFlag = evt.target.checked
        }



        if(evt.target.checked && varType == "measure" ){
            count=count+dataSetMeasures.length;
        }else if(!evt.target.checked && varType == "measure"){
            count = count-dataSetMeasures.length;
        }
        else if(evt.target.checked && varType == "dimension" ){
            count=count+dataSetDimensions.length;
        }else if(!evt.target.checked && varType == "dimension"){
            count = count-dataSetDimensions.length;
        }
        
        //When TargetVariable type and select all type are same count will be changed as target woon't be shown in select list
        if(evt.target.checked && varType == targetVariableType ){
            count=count-1
        }
        else if(!evt.target.checked && varType == targetVariableType){
            count=count+1
        }
        
        dispatch(updateStoreVariables(dataSetMeasures,dataSetDimensions,dataSetTimeDimensions,dimFlag,meaFlag,count));
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
            <label for="fl1" className="control-label">Enter a new Name</label>
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
    var colData = metaData.meta_data.uiMetaData.columnDataUI;
    for(var i=0;i<colData.length;i++){
        if(colData[i].slug == colSlug){
            colData[i].name = newColName;
            break;
        }
    }
    metaData.meta_data.uiMetaData.columnDataUI = colData;
    let dataPreview = Object.assign({}, metaData);
    //handleColumnActions(dataPreview,slug,dispatch)
}
export function handleColumnClick(dialog,actionName,colSlug,colName,subActionName,colStatus){
    return (dispatch) => {
        if(actionName == RENAME){
            renameMetaDataColumn(dialog,colName,colSlug,dispatch,actionName)
        }else if(actionName == DELETE){
            deleteMetaDataColumn(dialog,colName,colSlug,dispatch,actionName,colStatus);
        }else if(actionName == REPLACE){
            dispatch(updateVLPopup(true));
            dispatch(addComponents(colSlug));
            //updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName);
        }else if(actionName == UNIQUE_IDENTIFIER){
            if(!colStatus){
                bootbox.confirm("Setting this column as unique identifier will unset previous selection.",
                        function(result){
                    if(result){
                        $(".cst_table").find("thead").find("."+colSlug).first().find("a").addClass("text-primary");
                        updateUniqueIdentifierColumn(dispatch,actionName,colSlug,colStatus);
                    }
                });
            }else{
                updateUniqueIdentifierColumn(dispatch,actionName,colSlug,colStatus);
                $(".cst_table").find("thead").find("."+colSlug).first().find("a").removeClass("text-primary");
            }

        }else {
            updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName);
        }
    }
}

function deleteMetaDataColumn(dialog,colName,colSlug,dispatch,actionName,colStatus){
    var text = "Are you sure, you want to delete the selected column?";
    if(colStatus == true){
        text = "Are you sure, you want to undelete the selected column?"
    }
    bootbox.confirm(text,function(result){
        if(result){
            $(".cst_table").find("thead").find("."+colSlug).first().addClass("dataPreviewUpdateCol");
            $(".cst_table").find("tbody").find("tr").find("."+colSlug).addClass("dataPreviewUpdateCol");
            updateColumnStatus(dispatch,colSlug,colName,actionName)
        }
    });
}
export function updateVLPopup(flag){
    return{
        type: "UPDATE_VARIABLES_TYPES_MODAL",
        flag
    }
}
export function updateColumnStatus(dispatch,colSlug,colName,actionName,subActionName){
    dispatch(showLoading());
    var isSubsetting = false;
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
                    }else if(actionName == IGNORE_SUGGESTION){
                        if(transformSettings[i].columnSetting[j].status){
                            transformSettings[i].columnSetting[j].status = false;
                        }
                        else transformSettings[i].columnSetting[j].status = true;
                        break;
                    }else if(actionName == REPLACE){
                        transformSettings[i].columnSetting[j].status=true;
                        var removeValues =  store.getState().datasets.dataSetColumnRemoveValues.slice();
                        var replaceValues =  store.getState().datasets.dataSetColumnReplaceValues.slice();
                        replaceValues = replaceValues.concat(removeValues);
                        transformSettings[i].columnSetting[j].replacementValues = replaceValues;
                    }else{
                        transformSettings[i].columnSetting[j].status=true;
                        if(transformSettings[i].columnSetting[j].hasOwnProperty("listOfActions")){
                            for(var k=0;k<transformSettings[i].columnSetting[j].listOfActions.length;k++){
                                if(transformSettings[i].columnSetting[j].listOfActions[k].name == subActionName){
                                    transformSettings[i].columnSetting[j].listOfActions[k].status = true;
                                }else{
                                    transformSettings[i].columnSetting[j].listOfActions[k].status = false;
                                }
                            }
                            break;
                        }

                    }


                }
            }//end of for columnsettings
            break;
        }
    }
    if(actionName != SET_VARIABLE && actionName != UNIQUE_IDENTIFIER && actionName != SET_POLARITY && actionName != IGNORE_SUGGESTION){
        isSubsetting = true;
    }
    dispatch(handleColumnActions(transformSettings,slug,isSubsetting))
    dispatch(updateVLPopup(false));
    //dispatch(updateTransformSettings(transformSettings));

}

function updateUniqueIdentifierColumn(dispatch,actionName,colSlug,isChecked){
    dispatch(showLoading());
    var slug = store.getState().datasets.selectedDataSet;
    var transformSettings = store.getState().datasets.dataTransformSettings.slice();
    for(var i =0;i<transformSettings.length;i++){
        for(var j=0;j<transformSettings[i].columnSetting.length;j++){
            if(transformSettings[i].columnSetting[j].actionName == actionName){
                if(transformSettings[i].slug == colSlug){
                    transformSettings[i].columnSetting[j].status = !isChecked;
                }
                else {
                    if(transformSettings[i].columnSetting[j].status){
                        $(".cst_table").find("thead").find("."+transformSettings[i].slug).first().find("a").removeClass("text-primary")
                        transformSettings[i].columnSetting[j].status = false;
                    }
                }
            } else if(transformSettings[i].columnSetting[j].actionName == IGNORE_SUGGESTION){
                if(transformSettings[i].slug == colSlug){
                    transformSettings[i].columnSetting[j].status = false;
                }
            }
        }
    }
    dispatch(handleColumnActions(transformSettings,slug,false))
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

export function handleColumnActions(transformSettings,slug,isSubsetting) {
    return (dispatch) => {
        return fetchModifiedMetaData(transformSettings,slug).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(fetchDataValidationSuccess(json,isSubsetting));
                dispatch(hideLoading());
                dispatch(vaiableSelectionUpdate(true));
            }
            else{

                dispatch(fetchDataPreviewError(json));
                dispatch(vaiableSelectionUpdate(false));
                dispatch(hideLoading());
                bootbox.alert("Something went wrong. Please try again later.")
            }
        })
    }
}

export function vaiableSelectionUpdate(flag){
    return {type: "IS_VARIABLE_SELECTION_UPDATE", flag}
}
function fetchModifiedMetaData(transformSettings,slug) {
    var tran_settings = {};
    var uiMetaDataPrev = store.getState().datasets.dataPreview.meta_data.uiMetaData;
    tran_settings.existingColumns = transformSettings;
    return fetch(API+'/api/datasets/'+slug+'/meta_data_modifications/',{
        method: 'put',
        headers: getHeader(getUserDetailsOrRestart.get().userToken),
        body:JSON.stringify({
            config:tran_settings,
            uiMetaData:uiMetaDataPrev,
        }),
    }).then( response => Promise.all([response, response.json()]));
}

export function fetchDataValidationSuccess(uiMetaData,isSubsetting){
    var prevDataPreview = store.getState().datasets.dataPreview;
    prevDataPreview.meta_data.uiMetaData = uiMetaData;
    var dataPreview = Object.assign({}, prevDataPreview);

    return{
        type: "DATA_VALIDATION_PREVIEW",
        dataPreview,
        isSubsetting
    }
}



export function addComponents(colSlug){
    return (dispatch) => {
        var transformSettings = store.getState().datasets.dataTransformSettings.slice();
        var dataColumnRemoveValues = [];
        var dataColumnReplaceValues = [];

        for(var i =0;i<transformSettings.length;i++){
            if(transformSettings[i].slug == colSlug){
                for(var j=0;j<transformSettings[i].columnSetting.length;j++){
                    if(transformSettings[i].columnSetting[j].actionName == REPLACE){
                        var replacementValues = transformSettings[i].columnSetting[j].replacementValues;
                        for(var k=0;k<replacementValues.length;k++){
                            //Differentiate remove/replace values
                            if(replacementValues[k].name.indexOf("remove") != -1){
                                dataColumnRemoveValues.push(replacementValues[k])
                            }else{
                                dataColumnReplaceValues.push(replacementValues[k])
                            }
                        }
                    }

                }//end of for columnsettings
                break;
            }
        }

        if(dataColumnRemoveValues.length == 0){
            dataColumnRemoveValues.push({"id":1,"name":"remove1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
            dataColumnRemoveValues.push({"id":2,"name":"remove2","valueToReplace":"","replacedValue":"","replaceType":"contains"});

        }if(dataColumnReplaceValues.length == 0){
            dataColumnReplaceValues.push({"replaceId":1,"name":"replace1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
            dataColumnReplaceValues.push({"replaceId":2,"name":"replace2","valueToReplace":"","replacedValue":"","replaceType":"contains"});
        }

        dispatch(updateColumnReplaceValues(dataColumnReplaceValues))
        dispatch(updateColumnRemoveValues(dataColumnRemoveValues))

    }

}
export function setReplacementType(){
    var dataColumnReplaceValues = store.getState().datasets.dataSetColumnReplaceValues.slice();
    for(var i=0;i<dataColumnReplaceValues.length;i++){
        document.getElementById(dataColumnReplaceValues[i].replaceId).value = dataColumnReplaceValues[i].replaceType;
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
            if(dataColumnRemoveValues.length > 0){
                var max = dataColumnRemoveValues.reduce(function(prev, current) {
                    return (prev.id > current.id) ? prev : current

                });
                let length = max.id+1;
                dataColumnRemoveValues.push({"id":length,"name":"remove"+length,"valueToReplace":"","replacedValue":"","replaceType":"contains"});

            }else{
                dataColumnRemoveValues.push({"id":1,"name":"remove1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
            }

            dispatch(updateColumnRemoveValues(dataColumnRemoveValues))
        }else{
            var dataColumnReplaceValues = store.getState().datasets.dataSetColumnReplaceValues.slice();
            if(dataColumnReplaceValues.length > 0){
                var max = dataColumnReplaceValues.reduce(function(prev, current) {
                    return (prev.replaceId > current.replaceId) ? prev : current

                });
                let length = max.replaceId+1;
                dataColumnReplaceValues.push({"replaceId":length,"name":"replace"+length,"valueToReplace":"","replacedValue":"","replaceType":"contains"});
            }else{
                dataColumnReplaceValues.push({"replaceId":1,"name":"replace1","valueToReplace":"","replacedValue":"","replaceType":"contains"});
            }

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

export function updateSelectAllAnlysis(flag){
    return{
        type: "DATA_SET_SELECT_ALL_ANALYSIS",
        flag
    }
}

export function hideDataPreviewDropDown(props){
  if(props.indexOf("scores") != -1){
      $("#sub_settings").hide();
      $('.dropdown-toggle').removeAttr('data-toggle');
  }

}
export function popupAlertBox(msg,props,url){
    bootbox.alert(msg,function(){
        props.history.push(url)
    });
}
