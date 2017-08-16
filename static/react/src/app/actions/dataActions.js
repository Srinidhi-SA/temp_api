
import {API} from "../helpers/env";
import {PERPAGE} from "../helpers/helper";

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
				console.log(json)
				dispatch(fetchDataSuccess(json))
			}
			else{
				dispatch(fetchDataError(json))
			}
		})
	}
}

function fetchDataList(pageNo,token) {
	return fetch(API+'/api/datasets?page_number='+pageNo+'&page_size='+PERPAGE+'',{
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


export function getDataSetPreview(slug) {
    return (dispatch) => {
    return fetchDataPreview(slug).then(([response, json]) =>{
        if(response.status === 200){
          console.log(json)
        dispatch(fetchDataPreviewSuccess(json))
        //dispatch(showDataPreview())
      }
      else{
        dispatch(fetchDataPreviewError(json))
      }
    })
  }
}

function fetchDataPreview(slug) {
  return fetch(API+'/api/datasets/'+ slug,{
		method: 'get',
    headers: getHeader(sessionStorage.userToken)
		}).then( response => Promise.all([response, response.json()]));
}
//get preview data
function fetchDataPreviewSuccess(dataPreview) {
  console.log("data preview from api to store")
  console.log(dataPreview)
  return {
    type: "DATA_PREVIEW",
    dataPreview
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
	return fetch(API+'/api/datasets?page_size=1000',{
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