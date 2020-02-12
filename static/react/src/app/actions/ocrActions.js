//all the ocr related actions..
import {API} from "../helpers/env";
import {getUserDetailsOrRestart} from "../helpers/helper";
import store from "../store";

function getHeader(token){
	return {
		Authorization: token
	};
};

export function getHeaderForJson(token) {
	return { Authorization: token, 'Content-Type': 'application/json' };
  }

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

export function getS3BucketFileList(s3BucketDetails){
	return (dispatch) => {
		return fetchS3FileDetails(s3BucketDetails,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(setS3Uploaded(true));
				dispatch(fetchs3DetailsSuccess(json))
			}else{
				dispatch(fetchs3DetailsError(true))
			}
		})
	}
}

function fetchS3FileDetails(s3BucketDetails,token){
	return fetch(API+'/ocr/ocrimage/get_s3_files/',{
		method: 'post',
		headers: getHeaderForJson(token),
		body: JSON.stringify(s3BucketDetails)
	}).then(response => Promise.all([response,response.json()]));
}

export function fetchs3DetailsSuccess(data){
	return {
		type : "SAVE_S3_FILE_LIST",data
	}
}

export function fetchs3DetailsError(errMsgFlag){
	return {
		type : "S3_FILE_ERROR_MSG",errMsgFlag
	}
}

export function saveS3SelFiles(fileName){
	return {
		type : "SAVE_SEL_S3_FILE_LIST",fileName
	}
}

export function setS3Uploaded(flag){
	return {
		type : "SET_S3_UPLOADED",flag
	}
}

export function setS3Loader(flag){
	return {
		type : "SET_S3_LOADER",flag
	}
}

export function uploadS3Files(selectedFiles){
	let data = Object.assign({"dataSourceType":"S3"},store.getState().ocr.ocrS3BucketDetails,{"file_names":selectedFiles})
	return (dispatch) => {
		return uploadS3FilesAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(setS3Uploaded(true));
				// dispatch(uploadS3FileSuccess(json))
			}else{
				dispatch(uploadS3FileError(true))
			}
		})
	}
}

function uploadS3FilesAPI(data,token){
	return fetch(API+'/ocr/ocrimage/',{
		method: 'post',
		headers: getHeaderForJson(token),
		body: JSON.stringify(data)
	}).then(response => Promise.all([response,response.json()]));
}

export function uploadS3FileSuccess(data){
	return {
		// type : "SAVE_S3_FILE_LIST"
	}
}

export function uploadS3FileError(errMsgFlag){
	return {
		// type : "S3_FILE_ERROR_MSG",errMsgFlag
	}
}