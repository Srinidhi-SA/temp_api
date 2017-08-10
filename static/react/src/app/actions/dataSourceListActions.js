import {API} from "../helpers/env";
function getHeader(token){
	return {
		'Authorization': "JWT "+token,
		'Content-Type': 'application/json'
	};
}

export function getDataSourceList(){
	return (dispatch) => {
		return fetchDataSourceList(sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				dispatch(fetchDataSrcSuccess(json))
			}
			else{
				dispatch(fetchdDataSrcError(json))
			}
		})
	}
}
function fetchDataSourceList(token) {
	return fetch(API+'/api/datasource/get_config_list',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}
function fetchDataSrcSuccess(dataSrcList){

	return {
		type: "DATA_SOURCE_LIST",
		dataSrcList,
	}
}
function fetchDataSrcError(json) {	
	return {
		type: "DATA_SOURCE_LIST_ERROR",
		json
	}
}
export function fileUpload(file){
	return (dispatch) => {
		return dataUpload(sessionStorage.userToken,file).then(([response, json]) =>{
			if(response.status === 200){
				dispatch(fileUploadSuccess(json))
			}
			else{
				dispatch(fileUploadError(json))
			}
		})
	}
}
function fetchDataSourceList(token,file) {
	return fetch(API+'/api/datasource/get_config_list',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}
export function saveFileToStore(files) {
	console.log("In Data Upload ")
	console.log(files)
	var file = files[0]
	return {
		type: "DATA_UPLOAD_FILE",
		files
	}
}
export function updateSelectedDataSrc(selectedDataSrcType) {	
	return {
		type: "DATA_SOURCE_SELECTED_TYPE",
		selectedDataSrcType
	}
}
export function updateDbDetails(evt){
	alert(evt.name)
}
