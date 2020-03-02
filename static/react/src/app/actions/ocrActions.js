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
export function saveDocumentPageFlag(flag) {
	return {
		type: "SAVE_DOCUMENT_FLAG",
		flag
	}
}

export function saveImageDetails(data) {
	return {
		type: "SAVE_IMAGE_DETAILS",
		data
	}
}

export function getOcrProjectsList(pageNo){
	return (dispatch) => {
		return fetchProjects(pageNo,getUserDetailsOrRestart.get().userToken,dispatch).then(([response, json]) =>{
			if(response.status === 200){
			 dispatch(fetchProjectsSuccess(json))
			}
			else{
			 dispatch(fetchProjectsFail(json))
			}
		})
	}
}

function fetchProjects(pageNo=1,token){
	let search_project=store.getState().ocr.search_project
	if(search_project!=""){
		return fetch(API +'/ocr/project/?name='+search_project+'&page_number=' + pageNo, {
      method: 'get',
      headers: getHeader(token)
	}).then(response => Promise.all([response, response.json()]));
	}
	else{
	return fetch(API + '/ocr/project/?page_number=' + pageNo, {
      method: 'get',
      headers: getHeader(token)
	}).then(response => Promise.all([response, response.json()]));
}

}

export function fetchProjectsSuccess(doc){
	var data = doc;
	return {
		type: "OCR_PROJECT_LIST",
		data,
	}
}

export function fetchProjectsFail(data){
	return {
		type: "OCR_PROJECT_LIST_FAIL",
		data,
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
	let filter_assignee=store.getState().ocr.filter_assignee
	let filter_status=store.getState().ocr.filter_status
	let filter_confidence=store.getState().ocr.filter_confidence
	let search_document=store.getState().ocr.search_document
	let selected_project_slug=store.getState().ocr.selected_project_slug
	
	if(search_document==''){
		return fetch(API + '/ocr/project/'+selected_project_slug+'/all/?status='+ filter_status +'&confidence='+ filter_confidence +'&page_number=' + pageNo, {
      method: 'get',
      headers: getHeader(token)
	}).then(response => Promise.all([response, response.json()]));
}
	else{
	return fetch(API + '/ocr/project/'+selected_project_slug+'/all/?name='+search_document +'&status='+ filter_status +'&confidence='+ filter_confidence +'&page_number=' + pageNo, {
		method: 'get',
		headers: getHeader(token)
	}).then(response => Promise.all([response, response.json()]))
};
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

export function setS3Loader(flag){
	return {
		type : "SET_S3_LOADER",flag
	}
}

export function saveS3BucketDetails(name,val){
	return{
		type: "SAVE_S3_BUCKET_DETAILS",
		name,
		val,
	}
}

export function clearS3Data(){
	return {
		type : "CLEAR_S3_DATA"
	}
}

export function getS3BucketFileList(s3BucketDetails){
	return (dispatch) => {
		return fetchS3FileDetails(s3BucketDetails,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.status != "FAILED"){
				dispatch(fetchs3DetailsSuccess(json))
			}else if(response.status === 200 && json.status === "FAILED"){
				dispatch(fetchs3DetailsError(true));
				dispatch(s3FetchErrorMsg(json.message));
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
	var len = (data.file_list).length;
	let fileList = [];
	for(var i=0;i<len;i++){
		if(/\.(jpe?g|tif|png|pdf)$/i.test(data.file_list[i])){
			fileList.push(data.file_list[i]);
		}
	}
	return {
		type : "SAVE_S3_FILE_LIST",fileList
	}
}

export function fetchs3DetailsError(flag){
	return {
		type : "S3_FILE_ERROR_MSG",flag
	}
}
export function s3FetchErrorMsg(msg) {
	return{
		type : "S3_FETCH_ERROR_MSG",msg
	}
}
export function saveS3SelFiles(fileName){
	return {
		type : "SAVE_SEL_S3_FILES",fileName
	}
}

export function uploadS3Files(selectedFiles){
	let data = Object.assign({"dataSourceType":"S3"},{"file_names":selectedFiles},store.getState().ocr.ocrS3BucketDetails)
	return (dispatch) => {
		return uploadS3FilesAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.message != "FAILED"){
				dispatch(uploadS3FileSuccess(true));
			}else if(response.status === 200 && json.message === "FAILED"){
				dispatch(uploadS3FileError())
			}else{
				dispatch(uploadS3FileError())
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
export function uploadS3FileSuccess(flag){
	return {
		type : "SET_S3_UPLOADED",flag
	}
}
export function uploadS3FileError(){
	return {
		type : "S3_FILE_UPLOAD_ERROR_MSG"
	}
}
export function storeOcrSortElements(ocrFilesSortOn,ocrFilesSortType){
	return{
		type: "OCR_FILES_SORT",
		ocrFilesSortOn,
		ocrFilesSortType
	}
}
export function storeOcrFilterStatus(status){
	return{
		type: "FILTER_BY_STATUS",
		status,
	}
}
export function storeOcrFilterConfidence(confidence){
	return{
		type: "FILTER_BY_CONFIDENCE",
		confidence,
	}
}
export function storeOcrFilterAssignee(assignee){
	return{
		type: "FILTER_BY_ASSIGNEE",
		assignee
	}
}
export function updateCheckList(list){
	return{
		type:"UPDATE_CHECKLIST",
		list
	}
}
export function storeDocSearchElem(elem){
	return{
		type:"SEARCH_OCR_DOCUMENT",
		elem
	}
}
export function storeProjectSearchElem(elem){
	return{
		type:"SEARCH_OCR_PROJECT",
		elem
	}
}


export function selectedProjectSlug(slug,name){
	return{
		type:"SELECTED_PROJECT_SLUG",
		slug,name
	}
}