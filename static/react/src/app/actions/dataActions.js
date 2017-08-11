
import {API} from "../helpers/env";
var perPage = 2;

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
				dispatch(fetchdDataError(json))
			}
		})
	}
}

function fetchDataList(pageNo,token) {
	console.log(token)
	return fetch(API+'/api/datasets?page_number='+pageNo+'&page_size='+perPage+'',{
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

//get preview data
