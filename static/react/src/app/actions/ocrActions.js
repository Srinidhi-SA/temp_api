//all the ocr related actions..
import {API} from "../helpers/env";
import {getUserDetailsOrRestart} from "../helpers/helper";
import store from "../store";
import { func, string } from "prop-types";
import { stringify } from "querystring";

function getHeader(token){
	return {
		Authorization: token
	};
};

export function getHeaderForJson(token) {
	return { Authorization: token, 'Content-Type': 'application/json' };
}

export function getHeaderForFormData(token) {
	return { Authorization: token, 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' };
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

export function saveImageDetails() {
	return {
		type: "SAVE_IMAGE_DETAILS",
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
	let filter_status=store.getState().ocr.filter_status
	let filter_confidence=store.getState().ocr.filter_confidence
	let filter_assignee=store.getState().ocr.filter_assignee

	return fetch(API + '/ocr/ocrimage/?status='+ filter_status +'&confidence='+ filter_confidence +'&page_number=' + pageNo, {
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
//Actions for Manage User screen
export function openAddUserPopup(){
	return { 
		type:"OPEN_ADD_USER_POPUP"
	}
}
export function closeAddUserPopup(){
	return { 
		type:"CLOSE_ADD_USER_POPUP"
	}
}
//Fetch All OCR Users
export function fetchAllOcrUsersAction(){
	return (dispatch) => {
		return fetchAllOcrUsersAPI(getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(saveAllOcrUsersList(json));
			}else{
				console.log("Failed")
			}
		})
	}
}
export function fetchAllOcrUsersAPI(token){
	return fetch(API+"/ocr/user/",{
		method : "get",
		headers : getHeaderForJson(token),
	}).then(response => Promise.all([response,response.json()]));
}
function saveAllOcrUsersList(json){
	return {
		type : "SAVE_ALL_OCR_USERS_LIST",
		json
	}
}
//Saving and Creating New Users for OCR
export function saveNewUserDetails(name,value){
	return {
		type:"SAVE_NEW_USER_DETAILS",name,value
	}
}
export function createNewUserAction(userDetails){
	// var formdt = new FormData();
	// for(let key in userDetails){
	// 	formdt.append(key,userDetails[key]);
	// }
	var formdt = JSON.stringify($("#ocrForm").serializeArray());
	return (dispatch) => {
		return createNewUserAPI(formdt,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.created){
				console.log("Success",json.message.username)
				createNewUserSuccess(json.created);
			}else if(response.status === 200 && !json.created){
				console.log(json.message.username)
			}else{
				console.log("Failed")
			}
		})
	}
}
function createNewUserAPI(data,token){
	return fetch(API+"/ocr/user/",{
		method : "post",
		headers : getHeaderForJson(token),
		body:data,
		dataType: "json",
	}).then(response => Promise.all([response,response.json()]));
}
function createNewUserSuccess(flag){
	return {
		type : "CREATE_NEW_USER_SUCCESS",flag
	}
}
//Saving and creating user roles and status
export function saveNewUserProfileDetails(name,value){
	return{
		type : "SAVE_NEW_USER_PROFILE",name,value
	}
}
export function submitNewUserProfileAction(userProfileDetails){
	return (dispatch) => {
		return submitNewUserProfileAPI(userProfileDetails,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.created){
				console.log("Success",json.message.username)
				userProfileCreationSuccess(json.created);
			}else if(response.status === 200 && !json.created){
				console.log(json.message.username)
			}else{
				console.log("Failed")
			}
		})
	}
}
function submitNewUserProfileAPI(data){
	return fetch(API+"/ocr/user/",{
		method : "post",
		headers : getHeaderForFormData(token),
		body:data
	}).then(response => Promise.all([response,response.json()]));
}
function userProfileCreationSuccess(flag){
	return {
		type : "USER_PROFILE_CREATED_SUCCESS",flag
	}
}
//Actions on OCR users
//Save User List
export function saveSelectedOcrUserList(val,flag){
	return{
		type:"SAVE_SELECTED_USERS_LIST",val,flag
	}
}
//Delete User
export function deleteOcrUserAction(userNames){
	let data = Object.assign({}, userNames);
	return (dispatch) => {
		return deleteOcrActionAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.deleted){
				console.log("Success",json.message)
			}else if(response.status === 200 && !json.deleted){
				console.log(json.message)
			}else{
				console.log("Failed")
			}
		})
	}
}
function deleteOcrActionAPI(data,token){
	return fetch(API+"/ocr/user/",{
		method : "delete",
		headers : getHeaderForJson(token),
		body : JSON.stringify(data)
	}).then(response => Promise.all([response,response.json()]));
}
export function openEditUserModalAction(flag,userData){
	return {
		type:"OPEN_EDIT_USER_POPUP",flag,userData
	}
}
// getMethod->ocr/user/ ->no body
//delete Method ->ocr/user/ -> body:{"userName":"abc"} ->response ->{message:"" deleted:""}
//edit Later