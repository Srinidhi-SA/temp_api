
import {API} from "../helpers/env";
import {PERPAGE} from "../helpers/helper";
import {dataPreviewInterval} from "./dataUploadActions";

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
	return fetch(API+'/api/datasets/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
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
        dispatch(showDataPreview())
      }
      else{
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
  if(dataPreview.analysis_done){
	  console.log(dataPreview)
	  var slug = dataPreview.slug;
	  if(interval != undefined){
		  clearInterval(interval);	
		  return {
			  type: "DATA_PREVIEW",
			  dataPreview,
			  slug,
		  }
	  } else{
		  console.log(dataPreview)
		  return {
			  type: "DATA_PREVIEW",
			  dataPreview,
			  slug,
		  } 
	  }
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
export function updateSelectedVariables(evt){
	var variableName = evt.target.value;
	if(evt.target.className == "measure"){
		if(evt.target.checked){
			return {
				type: "SELECTED_MEASURES",
				variableName
			}
		}else{
			return {
				type: "UNSELECT_MEASURES",
				variableName
			}
		}
	}
	else if(evt.target.className == "dimension"){
		if(evt.target.checked){
			return {
				type: "SELECTED_DIMENSIONS",
				variableName
			}
		}else{
			return {
				type: "UNSELECT_DIMENSION",
				variableName
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
