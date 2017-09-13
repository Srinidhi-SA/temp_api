import {sessionObject} from '../helpers/manageSessionStorage';
import {API} from "../helpers/env";


export function authenticateFunc(username,password) {
    return (dispatch) => {
    return fetchPosts(username,password).then(([response, json]) =>{
        if(response.status === 200){
        dispatch(fetchPostsSuccess(json))
      }
      else{
        dispatch(fetchPostsError(json))
      }
    })
  }
}

function fetchPosts(username,password) {
  // console.log("user and pass is:");
  // console.log(username+" "+password);
  return fetch(API+'/api-token-auth/',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
				username: username,
				password: password,
		 })
	}).then( response => Promise.all([response, response.json()]));
}


function fetchPostsSuccess(payload) {
  sessionObject.manageSession(payload);
  return {
    type: "AUTHENTICATE_USER",
    payload
  }
}

function fetchPostsError(json) {
  return {
    type: "ERROR",
    json
  }
}

//to fetch user Profile

export function getUserProfile(token) {
    return (dispatch) => {
    return fetchUserProfile(token).then(([response, json]) =>{
        if(response.status === 200){
        dispatch(fetchProfileSuccess(json))
      }
      else{
        dispatch(fetchProfileError(json))
      }
    })
  }
}

function fetchUserProfile(token) {
  // console.log("user and pass is:");
  // console.log(username+" "+password);
  return fetch(API+'/api/get_info/',{
		method: 'GET',
		headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
		}
	}).then( response => Promise.all([response, response.json()]));
}


function fetchProfileSuccess(profileInfo) {
  return {
    type: "PROFILE_INFO",
    profileInfo
  }
}

function fetchProfileError(json) {
  return {
    type: "PROFILE_ERROR",
    json
  }
}
