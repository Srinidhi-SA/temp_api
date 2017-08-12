var API = "http://192.168.33.94:9000";
function getHeader(token){
	return {
		'Authorization': token,
		'Content-Type': 'application/x-www-form-urlencoded'
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
