//all the ocr related actions..
import {API} from "../helpers/env";
import {getUserDetailsOrRestart, statusMessages} from "../helpers/helper";
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
export function setUserTableLoaderFlag(flag){
	return {
		type:"SET_USER_TABLE_LOADER_FLAG",flag
	}
} 

export function fetchAllOcrUsersAction(pageNo){
	return (dispatch) => {
		return fetchAllOcrUsersAPI(pageNo,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(saveAllOcrUsersList(json));
				dispatch(setUserTableLoaderFlag(false));
			}else{
				bootbox.alert(statusMessages("warning","Failed to fetch","small_mascot"));
			}
		})
	}
}
export function fetchAllOcrUsersAPI(pageNo,token){
	if(pageNo === undefined){
		pageNo = 1;
	}
	let searchElement = store.getState().ocr.ocrSearchElement
	if(searchElement!=""){
		return fetch(API +'/ocr/user/?first_name='+searchElement+'&page_number=' + pageNo, {
		method: 'get',
		headers: getHeader(token)
		}).then(response => Promise.all([response, response.json()]));
	}
	else{
		return fetch(API+"/ocr/user/?page_number="+ pageNo,{
			method : "get",
			headers : getHeaderForJson(token),
		}).then(response => Promise.all([response,response.json()]));
	}
}
function saveAllOcrUsersList(json){
	return {
		type : "SAVE_ALL_OCR_USERS_LIST",
		json
	}
}

export function storeSelectedTabId(id){
	return {
		type : "SELECTED_TAB_ID",id
	}
}
export function fetchOcrListByReviewerType(id,pageNo){
	return (dispatch) => {
		return fetchOcrListByReviewerTypeAPI(id,pageNo,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(saveAllOcrUsersList(json));
				dispatch(setUserTableLoaderFlag(false));
			}else{
				bootbox.alert(statusMessages("warning","Failed to fetch","small_mascot"));
			}
		})
	}
}
function fetchOcrListByReviewerTypeAPI(id,pageNo,token){
	if(pageNo === undefined){
		pageNo = 1;
	}
	let searchElement = store.getState().ocr.ocrSearchElement
	if(searchElement!=""){
		return fetch(API+"/ocr/user/reviewer_list/?role="+id+"&first_name="+searchElement+"&page_number="+pageNo, {
		method: 'get',
		headers: getHeader(token)
		}).then(response => Promise.all([response, response.json()]));
	}
	else{
		return fetch(API+"/ocr/user/reviewer_list/?role="+id+"&page_number="+ pageNo,{
			method : "get",
			headers : getHeaderForJson(token),
		}).then(response => Promise.all([response,response.json()]));
	}
}

export function getReviewersListAction(){
	return (dispatch) => {
		return getReviewersListApi(getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200){
				dispatch(saveReviewersList(json));
			}else{
				bootbox.alert(statusMessages("warning","No roles found","small_mascot"));
			}
		})
	}
}
function getReviewersListApi(token){
	return fetch(API+"/ocr/groups/",{
		method : "get",
		headers : getHeader(token),
	}).then(response => Promise.all([response,response.json()]));
}
export function saveReviewersList(json){
	return{
		type:"SAVE_REVIEWERS_LIST",json
	}
}

export function saveNewUserDetails(name,value){
	return {
		type:"SAVE_NEW_USER_DETAILS",name,value
	}
}
export function setCreateUserLoaderFlag(flag){
	return {
		type : "SET_CREATE_USER_LOADER_FLAG",flag
	}
}
export function createNewUserAction(userDetails){
	var formdt = new FormData();
	for(let key in userDetails){
		formdt.append(key,userDetails[key]);
	}
	return (dispatch) => {
		return createNewUserAPI(formdt,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.created){
				dispatch(createNewUserSuccess(json.created,json.ocr_profile_slug));
				dispatch(setCreateUserLoaderFlag(false));
			}else if(response.status === 200 && !json.created){
				dispatch(setCreateUserLoaderFlag(false));
				bootbox.alert(statusMessages("warning","Please ensure proper details","small_mascot"));
			}else{
				bootbox.alert(statusMessages("warning","Failed","small_mascot"));
			}
		})
	}
}
function createNewUserAPI(data,token){
	return fetch(API+"/ocr/user/",{
		method : "post",
		headers : getHeader(token),
		body:data,
	}).then(response => Promise.all([response,response.json()]));
}
function createNewUserSuccess(flag,slug){
	return {
		type : "CREATE_NEW_USER_SUCCESS",flag,slug
	}
}

export function saveNewUserProfileDetails(name,value){
	return{
		type : "SAVE_NEW_USER_PROFILE",name,value
	}
}
export function submitNewUserProfileAction(userProfileDetails,curUserSlug){
	return (dispatch) => {
		return submitNewUserProfileAPI(userProfileDetails,curUserSlug,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.updated){
				dispatch(userProfileCreationSuccess(json.updated));
			}else if(response.status === 200 && !json.updated){
				bootbox.alert(statusMessages("warning",json.message,"small_mascot"));
			}else{
				bootbox.alert(statusMessages("warning","Failed to update roles or status","small_mascot"));
			}
		})
	}
}
function submitNewUserProfileAPI(data,slug,token){
	return fetch(API+"/ocr/userprofile/"+slug+"/",{
		method : "put",
		headers : getHeaderForJson(token),
		body:JSON.stringify(data)
	}).then(response => Promise.all([response,response.json()]));
}
function userProfileCreationSuccess(flag){
	return {
		type : "USER_PROFILE_CREATED_SUCCESS",flag
	}
}

export function saveSelectedOcrUserList(curSelList){
	return{
		type:"SAVE_SELECTED_USERS_LIST",curSelList
	}
}

export function selectAllOcrUsers(flag){
	return {
		type: "SELECT_ALL_USERS",flag
	}
}

export function deleteOcrUserAction(userNames){
	let data = {"username":userNames}
	return (dispatch) => {
		return deleteOcrActionAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.deleted){
				store.getState().ocr.selectedTabId === "none"?
					dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum))
					: dispatch(fetchOcrListByReviewerType(parseFloat(store.getState().ocr.selectedTabId),store.getState().ocr.ocrUserPageNum));
					bootbox.alert(statusMessages("success",json.message,"small_mascot"));
					dispatch(clearUserFlagAction());
			}else if(response.status === 200 && !json.deleted){
				bootbox.alert(statusMessages("warning","Unable to delete","small_mascot"));
			}else{
				bootbox.alert(statusMessages("warning","Failed to delete","small_mascot"));
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

export function activateOcrUserAction(userNames){
	let data = {"username":userNames,"is_active":"True"}
	return (dispatch) => {
		return activateOcrActionAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.updated){
				store.getState().ocr.selectedTabId === "none"?
					dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum))
					: dispatch(fetchOcrListByReviewerType(parseFloat(store.getState().ocr.selectedTabId),store.getState().ocr.ocrUserPageNum));
					bootbox.alert(statusMessages("success",json.message,"small_mascot"));
					dispatch(clearUserFlagAction());
			}else if(response.status === 200 && !json.updated){
				bootbox.alert(statusMessages("warning","Unable activate users","small_mascot"));
			}else{
				bootbox.alert(statusMessages("warning","Failed to activate","small_mascot"));
			}
		})
	}
}
function activateOcrActionAPI(data,token){
	return fetch(API+"/ocr/userprofile/edit_status/",{
		method : "post",
		headers : getHeaderForJson(token),
		body : JSON.stringify(data)
	}).then(response => Promise.all([response,response.json()]));
}

export function deActivateOcrUserAction(userNames){
	let data = {"username":userNames,"is_active":"False"}
	return (dispatch) => {
		return deActivateOcrActionAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.updated){
				store.getState().ocr.selectedTabId === "none"?
					dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum))
					: dispatch(fetchOcrListByReviewerType(parseFloat(store.getState().ocr.selectedTabId),store.getState().ocr.ocrUserPageNum));
					dispatch(clearUserFlagAction());
					bootbox.alert(statusMessages("success",json.message,"small_mascot"));
			}else if(response.status === 200 && !json.updated){
				bootbox.alert(statusMessages("warning","Unable deactivate users","small_mascot"));
			}else{
				bootbox.alert(statusMessages("warning","Failed to deactivate","small_mascot"));
			}
		})
	}
}
function deActivateOcrActionAPI(data,token){
	return fetch(API+"/ocr/userprofile/edit_status/",{
		method : "post",
		headers : getHeaderForJson(token),
		body : JSON.stringify(data)
	}).then(response => Promise.all([response,response.json()]));
}

export function openEditUserModalAction(flag,userSlug,userDt){
	let edtDet = store.getState().ocr.editedUserDetails;
	edtDet.first_name = userDt.first_name;
	edtDet.last_name = userDt.last_name;
	edtDet.username = userDt.username;
	edtDet.email = userDt.email;
	edtDet.role = userDt.ocr_profile.role[0];
	edtDet.is_active = userDt.ocr_profile.active?"True":"False";

	return {
		type:"OPEN_EDIT_USER_POPUP",flag,userSlug,userDt,edtDet
	}
}
export function closeEditUserModalAction(flag){
	return {
		type:"CLOSE_EDIT_USER_POPUP",flag
	}
}
export function enableEditingUserAction(flag){
	return {
		type:"ENABLE_EDITING_USER",flag
	}
}
export function SaveEditedUserDetailsAction(name,val){
	return{
		type : "SAVE_EDITED_USER_DETAILS",name,val
	}
}
export function editDetailsFormAction(flag){
	return{
		type: "FORM_DETAILS_SELECTED",flag
	}
}
export function editRolesFormAction(flag){
	return{
		type: "FORM_ROLES_SELECTED",flag
	}
}
export function submitEditUserDetailsAction(editedUserDt){
	var formdt = new FormData();
	for(let key in editedUserDt){
		formdt.append(key,editedUserDt[key]);
	}
	return (dispatch) => {
		return submitEditUserDetailsAPI(formdt,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.updated){
				dispatch(setCreateUserLoaderFlag(false));
				dispatch(editUserSuccess(true));
			}else{
				bootbox.alert(statusMessages("warning","Failed to Edit user details","small_mascot"));
			}
		})
	}
}
function submitEditUserDetailsAPI(data,token){
	return fetch(API+"/ocr/user/edit/",{
		method : "post",
		headers : getHeader(token),
		body : data,
	}).then(response => Promise.all([response,response.json()]));
}
export function submitEditedUserRolesAction(editedUserDt,slug){
	return (dispatch) => {
		return submitEditedUserRolesAPI(editedUserDt,slug,getUserDetailsOrRestart.get().userToken,dispatch).then(([response,json]) => {
			if(response.status === 200 && json.updated){
				dispatch(setCreateUserLoaderFlag(false));
				dispatch(editUserSuccess(true));
			}else{
				bootbox.alert(statusMessages("warning","Failed to edit user roles","small_mascot"));
			}
		})
	}
}
function submitEditedUserRolesAPI(data,slug,token){
	let curDt ={"is_active":data.is_active,"role":parseFloat(data.role)}
	return fetch(API+"/ocr/userprofile/"+ slug+"/",{
		method : "put",
		headers : getHeaderForJson(token),
		body : JSON.stringify(curDt),
	}).then(response => Promise.all([response,response.json()]));
}
export function editUserSuccess(flag){
	return{
		type: "EDIT_USER_SUCCESS",flag
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
export function clearUserFlagAction(){
	return {
		type : "CLEAR_USER_FLAG"
	}
}
export function saveUserSearchElementAction(val){
	return {
		type : "OCR_USER_SEARCH_ELEMENT",val
	}
}
export function saveOcrUserPageNumAction(val){
	return {
		type : "OCR_USER_PAGE_NUM",val
	}
}
export function clearUserSearchElementAction(){
	return {
		type : "CLEAR_USER_SEARCH_ELEMENT",
	}
}

export function selectedProjectSlug(slug,name){
	return{
		type:"SELECTED_PROJECT_SLUG",
		slug,name
	}
}
