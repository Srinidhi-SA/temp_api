	import {API} from "../helpers/env";
	import store from "../store";
	
	function getHeader(token){
		return {
			'Authorization': "JWT "+token,
		};
	}
	export function dataUpload() {
		var datasetsChk = store.getState().datasets.dataList.data, flag = 0;
		//console.log(this.get('datasets'));
		for(var item of datasetsChk){
			//  console.log(item.name);
			if(store.getState().dataSource.fileUpload.name == item.name){
				flag = 1
			}
		}
		if(flag){
			alert("Data Set name already exists")
		}else{
			return (dispatch) => {
				return triggerDataUpload(sessionStorage.userToken).then(([response, json]) =>{
					if(response.status === 200){
						console.log(json)
						dispatch(dataUploadSuccess(json))
					}
					else{
						dispatch(dataUploadError(json))
					}
				})
			}
		}
	
	}
	
	function triggerDataUpload(token) {
		console.log("JWT "+token)
		var data = new FormData();
		data.append("input_file",store.getState().dataSource.fileUpload);
		return fetch(API+'/api/datasets/',{
			method: 'post',
			headers: getHeader(token),
			body:data,
		}).then( response => Promise.all([response, response.json()]));
	}
	
	function dataUploadSuccess(json) {
		alert("File Uploaded Successfully")
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
	
	
	
