import {API} from "../helpers/env";
import {CSLOADERPERVALUE,LOADERMAXPERVALUE,DEFAULTINTERVAL,PERPAGE} from "../helpers/helper";
import {connect} from "react-redux";
import store from "../store";
import {openCsLoaderModal,closeCsLoaderModal,updateCsLoaderValue} from "./createSignalActions";
import Dialog from 'react-bootstrap-dialog'
import { showLoading, hideLoading } from 'react-redux-loading-bar'

// var API = "http://34.196.204.54:9000";

// @connect((store) => {
//   return {signal: store.signals.signalAnalysis};
// })
var createSignalInterval = null;

function getHeader(token){
  return {
    'Authorization': token,
    'Content-Type': 'application/json'
  };
}
//x-www-form-urlencoded'
export function createSignal(metaData) {
    return (dispatch) => {
    return fetchCreateSignal(metaData).then(([response, json]) =>{
        if(response.status === 200){
          console.log(json)
        dispatch(fetchCreateSignalSuccess(json,dispatch))
      }
      else{
        dispatch(fetchCreateSignalError(json))
         dispatch(closeCsLoaderModal())
        dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      }
    })
  }
}

function fetchCreateSignal(metaData) {
  console.log(metaData)

  return fetch(API+'/api/signals/',{
		method: 'POST',
    headers: getHeader(sessionStorage.userToken),
    body: JSON.stringify(metaData)
		}).then( response => Promise.all([response, response.json()]));
}
function fetchCreateSignalSuccess(signalData,dispatch) {
  console.log("signal list from api to store")
   dispatch(updateCsLoaderValue(store.getState().signals.createSignalLoaderValue+CSLOADERPERVALUE))
    createSignalInterval = setInterval(function(){
    if(!signalData.analysis_done){
    	if(store.getState().signals.createSignalLoaderValue < LOADERMAXPERVALUE){
    	  dispatch(updateCsLoaderValue(store.getState().signals.createSignalLoaderValue+CSLOADERPERVALUE))
    	}
          dispatch(getSignalAnalysis(sessionStorage.userToken,signalData.slug));
    }

  },DEFAULTINTERVAL);

  return {
    type: "CREATE_SUCCESS",
    signalData
  }
}

function fetchCreateSignalError(json) {
  console.log("fetching list error!!",json)

  return {
    type: "CREATE_ERROR",
    json
  }
}

export function getList(token,pageNo,search_element) {
    return (dispatch) => {
    return fetchPosts(token,pageNo,search_element).then(([response, json]) =>{
        if(response.status === 200){
          console.log(json)
        dispatch(fetchPostsSuccess(json))
      }
      else{
        dispatch(fetchPostsError(json))
      }
    })
  }
}

function fetchPosts(token,pageNo,search_element) {
  console.log(token)
  console.log(search_element)
  if(search_element!=""&&search_element!=null){
    console.log("calling for search element!!")
    return fetch(API+'/api/signals/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
  }else{
    return fetch(API+'/api/signals/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
      method: 'get',
      headers: getHeader(token)
      }).then( response => Promise.all([response, response.json()]));
  }


}


function fetchPostsSuccess(signalList) {
  console.log("signal list from api to store")
  console.log(signalList);
  var current_page =  signalList.current_page
  return {
    type: "SIGNAL_LIST",
    signalList,
    current_page
  }
}

function fetchPostsError(json) {
  console.log("fetching list error!!",json)
  return {
    type: "SIGNAL_LIST_ERROR",
    json
  }
}

//for getting signal analysis:
export function getSignalAnalysis(token,errandId) {

    return (dispatch) => {
    return fetchPosts_analysis(token,errandId).then(([response, json]) =>{
        if(response.status === 200){

        dispatch(fetchPostsSuccess_analysis(json,errandId,dispatch))
      }
      else{
        dispatch(fetchPostsError_analysis(json));
        dispatch(closeCsLoaderModal())
        dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
      }
    })
  }
}


function fetchPosts_analysis(token,errandId) {
  console.log(token)

  return fetch(API+'/api/signals/'+errandId+"/",{
		method: 'get',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
  }).then( response => Promise.all([response, response.json()]));

}


function fetchPostsSuccess_analysis(signalAnalysis, errandId,dispatch) {
  console.log("signal analysis from api to store")
  console.log(signalAnalysis)
  console.log("3");
  if(signalAnalysis.analysis_done){
  //  alert("final done");
    clearInterval(createSignalInterval);
    dispatch(closeCsLoaderModal())
    dispatch(updateCsLoaderValue(CSLOADERPERVALUE))
  }
  return {
    type: "SIGNAL_ANALYSIS",
    signalAnalysis,
    errandId
  }
}

function fetchPostsError_analysis(json) {
  console.log("fetching list error!!",json)
  return {
    type: "SIGNAL_ANALYSIS_ERROR",
    json
  }
}


export function setPossibleAnalysisList(varType) {
	return {
		type: "SET_POSSIBLE_LIST",
		varType
	}
}
export function showPredictions(predictionSelected) {
	return {
		type: "SEL_PREDICTION",
		predictionSelected
	}
}
export function emptySignalAnalysis() {
	return {
		type: "SIGNAL_ANALYSIS_EMPTY",
	}
}

//delete signal -------------------
export function showDialogBox(slug,dialog,dispatch){
	Dialog.setOptions({
		  defaultOkLabel: 'Yes',
		  defaultCancelLabel: 'No',
		})
	dialog.show({
		  title: 'Delete Dataset',
		  body: 'Are you sure you want to delete signal?',
		  actions: [
		    Dialog.CancelAction(),
		    Dialog.OKAction(() => {
		    	deleteSignal(slug,dialog,dispatch)
		    })
		  ],
		  bsSize: 'small',
		  onHide: (dialogBox) => {
		    dialogBox.hide()
		    console.log('closed by clicking background.')
		  }
		});
}
export function handleDelete(slug,dialog) {
	return (dispatch) => {
		showDialogBox(slug,dialog,dispatch)
	}
}
function deleteSignal(slug,dialog,dispatch){
	dispatch(showLoading());
	Dialog.resetOptions();
	return deleteSignalAPI(slug).then(([response, json]) =>{
		if(response.status === 200){
			dispatch(getList(sessionStorage.userToken,store.getState().signals.signalList.current_page));
			dispatch(hideLoading());
		}
		else{
			dialog.showAlert("Error occured , Please try after sometime.");
			dispatch(hideLoading());
		}
	})
}
function deleteSignalAPI(slug){
	console.log("deleteSignalAPI(slug)");
	console.log(slug);
	return fetch(API+'/api/signals/'+slug+'/',{
		method: 'put',
		headers: getHeader(sessionStorage.userToken),
		body:JSON.stringify({
			deleted:true,
		}),
	}).then( response => Promise.all([response, response.json()]));

	}

// end of delete signal
//store search element
export function storeSearchElement(search_element){
  return {
		type: "SEARCH_SIGNAL",
		search_element
	}
}
