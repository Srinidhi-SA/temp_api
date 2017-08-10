import {API} from "../helpers/env";
// var API = "http://34.196.204.54:9000";

function getHeader(token){
  return {
    'Authorization': "JWT "+token,
    'Content-Type': 'application/json'
  };
}
//x-www-form-urlencoded'
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
  console.log("JWT "+token)

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
          console.log(json)
        dispatch(fetchPostsSuccess_analysis(json,errandId))
      }
      else{
        dispatch(fetchPostsError_analysis(json))
      }
    })
  }
}


function fetchPosts_analysis(token,errandId) {
  console.log("JWT "+token)

  return fetch(API+'/api/signals/'+errandId+"/",{
		method: 'get',
		headers: {
			'Authorization': "JWT "+token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
  }).then( response => Promise.all([response, response.json()]));

}


function fetchPostsSuccess_analysis(signalAnalysis, errandId) {
  console.log("signal analysis from api to store")
  console.log(signalAnalysis)
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
