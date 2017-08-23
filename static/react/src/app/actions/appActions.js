import {API} from "../helpers/env";
import {PERPAGE} from "../helpers/helper";
import store from "../store";

function getHeader(token){
	return {
		'Authorization': token,
		'Content-Type': 'application/json'
	};
}

export function openModelPopup() {
	return {
		type: "APPS_MODEL_SHOW_POPUP",
	}
}

export function closeModelPopup() {
	return {
		type: "APPS_MODEL_HIDE_POPUP",
	}
}

export function getAppsModelList(pageNo) {
	return (dispatch) => {
		return fetchModelList(pageNo,sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchModelListSuccess(json))
			}
			else{
				dispatch(fetchModelListError(json))
			}
		})
	}
}

function fetchModelList(pageNo,token) {
	return fetch(API+'/api/trainer/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchModelListError(json) {
	return {
		type: "MODEL_LIST_ERROR",
		json
	}
}
export function fetchModelListSuccess(doc){
	var data = doc;
	var current_page =  doc.current_page
	return {
		type: "MODEL_LIST",
		data,
		current_page,
	}
}
export function updateTrainAndTest(e) {
	var trainValue = e.target.value;
	var testValue = 100-trainValue;
	return {
		type: "UPDATE_MODEL_RANGE",
		trainValue,
		testValue,
	}
}

export function createModel(modelName,targetVariable) {
	console.log(modelName);
	console.log(targetVariable);
	  return (dispatch) => {
			return triggerCreateModel(sessionStorage.userToken,modelName,targetVariable).then(([response, json]) =>{
				if(response.status === 200){
					console.log(json)
					alert("Success")
					//dispatch(createModelSuccess(json))
				}
				else{
					alert("Error")
					//dispatch(createModelError(json))
				}
			})
		}
}

function triggerCreateModel(token,modelName,targetVariable) {
		var datasetSlug = store.getState().datasets.dataPreview.slug;
		var app_id=1;
		var details = {"measures":store.getState().datasets.selectedMeasures.join(),
			"dimension":store.getState().datasets.selectedDimensions.join(),
			"timeDimension":store.getState().datasets.selectedTimeDimensions,
			 "trainValue":store.getState().apps.trainValue,
			 "testValue":store.getState().apps.testValue,
			 "analysisVariable":targetVariable}
		return fetch(API+'/api/trainer/',{
			method: 'post',
			headers: getHeader(token),
			body:JSON.stringify({
				"name":modelName,
				"dataset":datasetSlug,
				"app_id":app_id,
				"column_data_raw":details
		 }),
		}).then( response => Promise.all([response, response.json()]));
}

export function getAppsScoreList(pageNo) {
	return (dispatch) => {
		return fetchScoreList(pageNo,sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchScoreListSuccess(json))
			}
			else{
				dispatch(fetchScoreListError(json))
			}
		})
	}
}

function fetchScoreList(pageNo,token) {
	return fetch(API+'/api/score/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchScoreListError(json) {
	return {
		type: "SCORE_LIST_ERROR",
		json
	}
}
export function fetchScoreListSuccess(doc){
	var data = doc;
	var current_page =  doc.current_page
	return {
		type: "SCORE_LIST",
		data,
		current_page,
	}
}

export function showCreateScorePopup() {
	return {
		type: "APPS_SCORE_SHOW_POPUP",
	}
}

export function hideCreateScorePopup() {
	return {
		type: "APPS_SCORE_HIDE_POPUP",
	}
}

export function getAppsModelSummary(slug) {
	return (dispatch) => {
		return fetchModelSummary(sessionStorage.userToken,slug).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchModelSummarySuccess(json))
			}
			else{
				dispatch(fetchModelSummaryError(json))
			}
		})
	}
}

function fetchModelSummary(token,slug) {
	return fetch(API+'/api/trainer/'+slug+'/',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchModelSummaryError(json) {
	return {
		type: "MODEL_SUMMARY_ERROR",
		json
	}
}
export function fetchModelSummarySuccess(doc){
	var data = doc;
	return {
		type: "MODEL_SUMMARY_SUCCESS",
		data,
	}
}
export function getListOfCards(totalCardList){
	console.log("In Apps Model Detail");
	let cardList = new Array();
	for(var i=0;i<totalCardList.length;i++){
		cardList.push(totalCardList[i].cardData)
	}
	console.log(cardList)
	return cardList;
}

export function updateSelectedAlg(name){
	return {
		type: "SELECTED_ALGORITHM",
		name,
	}
}

export function createScore(scoreName,targetVariable) {
	console.log(scoreName);
	console.log(targetVariable);
	  return (dispatch) => {
			return triggerCreateScore(sessionStorage.userToken,scoreName,targetVariable).then(([response, json]) =>{
				if(response.status === 200){
					console.log(json)
					alert("Success")
					//dispatch(createModelSuccess(json))
				}
				else{
					alert("Error")
					//dispatch(createModelError(json))
				}
			})
		}
}

function triggerCreateScore(token,scoreName,targetVariable) {
		var datasetSlug = store.getState().datasets.dataPreview.slug;
		var app_id=1;
		var details = {"measures":store.getState().datasets.selectedMeasures.join(),
			"dimension":store.getState().datasets.selectedDimensions.join(),
			"timeDimension":store.getState().datasets.selectedTimeDimensions,
			 "analysisVariable":targetVariable}
		return fetch(API+'/api/score/',{
			method: 'post',
			headers: getHeader(token),
			body:JSON.stringify({
				"name":scoreName,
				"dataset":datasetSlug,
				"trainer":store.getState().apps.modelSlug,
				"app_id":app_id,
				"column_data_raw":details
		 }),
		}).then( response => Promise.all([response, response.json()]));
}

export function getAppsScoreSummary(slug) {
	return (dispatch) => {
		return fetchScoreSummary(sessionStorage.userToken,slug).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchScoreSummarySuccess(json))
			}
			else{
				dispatch(fetchScoreSummaryError(json))
			}
		})
	}
}

function fetchScoreSummary(token,slug) {
	return fetch(API+'/api/score/'+slug+'/',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchScoreSummaryError(json) {
	return {
		type: "SCORE_SUMMARY_ERROR",
		json
	}
}
export function fetchScoreSummarySuccess(data){
	return {
		type: "SCORE_SUMMARY_SUCCESS",
		data,
	}
}
