//all the ocr related actions..
import {API} from "../helpers/env";
import {getUserDetailsOrRestart} from "../helpers/helper";
import store from "../store";

function getHeader(token){
	return {
		Authorization: token
	};
};

export function saveOcrFilesToStore(files) {
	return {
		type: "OCR_UPLOAD_FILE",
		files
	}
}

export function saveImagePageFlag(flag) {
	return {
		type: "SAVE_IMAGE_FLAG",
		flag
	}
}

export function getOcrUploadedFiles(pageNo){
	return (dispatch) => {
		return fetchUploadedFiles(pageNo,getUserDetailsOrRestart.get().userToken,dispatch).then(([response, json]) =>{
			if(response.status === 200){
			 dispatch(fetchUploadsSuccess(json))
			}
			else{
			 dispatch(fetchUploadsFail(json))
			}
		})
	}
}

function fetchUploadedFiles(pageNo=1,token){
    return fetch(API+'/ocr/ocrimage/?page_number=' + pageNo, {
      method: 'get',
      headers: getHeader(token)
    }).then(response => Promise.all([response, response.json()]));
}

export function fetchUploadsSuccess(doc){
	var data = doc;
	return {
		type: "OCR_UPLOADS_LIST",
		data,
	}
}

export function fetchUploadsFail(data){
	return {
		type: "OCR_UPLOADS_LIST_FAIL",
		data,
	}
}

export function saveS3BucketDetails(name,val){
	return{
		type: "SAVE_S3_BUCKET_DETAILS",
		name,
		val,
	}
}

export function getS3BucketFileList(){
	return (dispatch) => {
		return fetchS3FileDetails(getUserDetailsOrRestart.get().userToken,dispatch).then((response,json) => {
			if(response.status === 200){
				dispatch(fetchs3DetailsSuccess(json))
			}else{
				dispatch(fetchs3DetailsError(json))
			}
		})
	}
}

function fetchS3FileDetails(token){
	return fetch(API,{
		method: 'get',
		headers: getHeader(token)
	}).then(response => Promise.all([response,response.json()]));
}

function fetchs3DetailsSuccess(data){
	return {
		type : "SAVE_S3_FILE_LIST",
		data
	}
}

function fetchs3DetailsError(errMsg){
	return {
		type : "S3_FILE_ERROR_MSG",
		errMsg
	}
}
