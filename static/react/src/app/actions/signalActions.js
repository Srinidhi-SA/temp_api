import {API} from "../helpers/env";
import {connect} from "react-redux";
import store from "../store";
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
//  console.log(signalData);
    createSignalInterval = setInterval(function(){
    if(!signalData.analysis_done){
      console.log("checking storeeeee");
          console.log(signalData.slug);
          dispatch(getSignalAnalysis(sessionStorage.userToken,signalData.slug));
    }

  },2000);

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

export function getList(token) {
    return (dispatch) => {
    return fetchPosts(token).then(([response, json]) =>{
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

function fetchPosts(token) {
  console.log(token)

  return fetch(API+'/api/signals/',{
		method: 'get',
    headers: getHeader(token)
		}).then( response => Promise.all([response, response.json()]));
}


function fetchPostsSuccess(signalList) {
  console.log("signal list from api to store")
  console.log(signalList)
  return {
    type: "SIGNAL_LIST",
    signalList
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

        dispatch(fetchPostsSuccess_analysis(json,errandId))
      }
      else{
        dispatch(fetchPostsError_analysis(json))
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


function fetchPostsSuccess_analysis(signalAnalysis, errandId) {
  console.log("signal analysis from api to store")
  console.log(signalAnalysis)
  console.log("3");
  if(signalAnalysis.analysis_done){
  //  alert("final done");
    clearInterval(createSignalInterval);
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
