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
	let sortBy = store.getState().ocr.ocrFilesSortOn;
	let sortOrder = store.getState().ocr.ocrFilesSortType;
    return fetch(API+'/ocr/ocrimage/?page_number=' + pageNo, {
			// return fetch(API + '/ocr/ocrimage/?sorted_by=' + sortBy + '&ordering='+ sortOrder + '&page_number=' + pageNo,{
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

export function storeOcrSortElements(ocrFilesSortOn,ocrFilesSortType){
	return{
		type: "OCR_FILES_SORT",
		ocrFilesSortOn,
		ocrFilesSortType
	}

}