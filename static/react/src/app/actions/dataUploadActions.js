import {API} from "../helpers/env";
import store from "../store";
import {FILEUPLOAD,DULOADERPERVALUE,LOADERMAXPERVALUE,DEFAULTINTERVAL} from "../helpers/helper";
import {getDataList,getDataSetPreview,updateDatasetName,openDULoaderPopup} from "./dataActions";
export var dataPreviewInterval = null;

export function getHeaderWithoutContent(token){
	return {
		'Authorization': token,
	};
}
function getHeader(token){
	return {
		'Authorization': token,
		'Content-Type': 'application/json'
	};
}
export function dataUpload() {
	
	return (dispatch) => {
		dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
		dispatch(close());
		dispatch(openDULoaderPopup());
		return triggerDataUpload(sessionStorage.userToken).then(([response, json]) =>{
			dispatch(dataUploadLoaderValue(store.getState().datasets.dULoaderValue+DULOADERPERVALUE));
			if(response.status === 200){
				console.log(json.slug)
				dispatch(updateDatasetName(json.slug))
				dispatch(dataUploadSuccess(json,dispatch))
			}
			else{
				dispatch(dataUploadError(json))
			}
		});
	}
}

function triggerDataUpload(token) {
	if(store.getState().dataSource.selectedDataSrcType == "fileUpload"){
		var data = new FormData();
		data.append("input_file",store.getState().dataSource.fileUpload);
		return fetch(API+'/api/datasets/',{
			method: 'post',
			headers: getHeaderWithoutContent(token),
			body:data,
		}).then( response => Promise.all([response, response.json()]));
	}else{
		var host = store.getState().dataSource.db_host;
		var port = store.getState().dataSource.db_port;
		var username = store.getState().dataSource.db_username;
		var password = store.getState().dataSource.db_password;
		var tablename = store.getState().dataSource.db_tablename;
		var schema = store.getState().dataSource.db_schema;
		var dataSourceDetails = {"host":host,"port":port,"schema":schema,"username":username,"tablename":tablename,"password":password, "datasourceType":store.getState().dataSource.selectedDataSrcType}
		return fetch(API+'/api/datasets/',{
			method: 'post',
			headers: getHeader(token),
            body: JSON.stringify( {
                datasource_details: dataSourceDetails,
                datasource_type: store.getState().dataSource.selectedDataSrcType

            }),

		}).then( response => Promise.all([response, response.json()]));

	}



}

function dataUploadSuccess(data,dispatch) {
	dataPreviewInterval = setInterval(function(){
			if(store.getState().datasets.dULoaderValue < LOADERMAXPERVALUE){
				dispatch(dataUploadLoaderValue(store.getState().datasets.dULoaderValue+DULOADERPERVALUE));
			}
			dispatch(getDataSetPreview(data.slug,dataPreviewInterval));
	},DEFAULTINTERVAL);
	return {
		type: "HIDE_MODAL",
	}
}

export function dataUploadError(josn){
	return {
		type: "DATA_UPLOAD_TO_SERVER_ERROR",
		json
	}
}


export function open() {
	return {
		type: "SHOW_MODAL",
	}
}

export function close() {
	return {
		type: "HIDE_MODAL",
	}
}

export function dataUploadLoaderValue(value){
	return {
		type: "DATA_UPLOAD_LOADER_VALUE",
		value,
	}
}



