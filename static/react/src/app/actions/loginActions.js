import store from "../store";
import {sessionObject} from '../helpers/manageSessionStorage';
import {API} from "../helpers/env";
import {USERDETAILS} from "../helpers/env";
import { sessionService } from 'redux-react-session';
import { browserHistory } from 'react-router';
import {cookieObj} from '../helpers/cookiesHandler';

export function getHeaderWithoutContent(token) {
  return {'Authorization': token};
}


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
var token = payload.token;
//sessionObject.manageSession(payload);
cookieObj.storeCookies(payload)
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
export function openImg() {
  return {type: "SHOW_IMG_MODAL"}
}

export function closeImg() {
  return {type: "HIDE_IMG_MODAL"}
}


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
//for image upload

export function uploadImg(){
    return (dispatch) => {
      //dispatch(closeImg());
      //dispatch(clearImageURL());
      return triggerImgUpload().then(([response, json]) => {
        if (response.status === 200) {
        //  dispatch(retrieveProfileImg(json.image_url))
           dispatch(saveProfileImage(json.image_url))
           console.log(json)
           dispatch(closeImg());
              } else {
          dispatch(imgUploadError(json))
        }
      });
    }
  }

  function clearImageURL(){
    return{
      type:"CLEAR_PROFILE_IMAGE"

    }

  }
  function triggerImgUpload() {
    var data = new FormData();
    data.append("image", store.getState().dataSource.fileUpload);
    // data.append("website",sessionStorage.email)
    // data.append("bio","jfhsndfn")
    // data.append("phone",sessionStorage.phone)

    return fetch(API + '/api/upload_photo/', {
      method: 'put',
      headers: getHeaderWithoutContent(USERDETAILS.userToken),
      body: data
    }).then(response => Promise.all([response, response.json()]));

  }

  export function imgUploadError(josn) {
    return {type: "IMG_UPLOAD_TO_SERVER_ERROR", json}
  }

  // function retrieveProfileImg(imgURL){
  //   return (dispatch) => {
  //   return fetchUserProfileImg(imgURL).then(([response]) =>{
  //       if(response.status === 200){
  //         console.log("in rezsponse")
  //         console.log(response)
  //       dispatch(saveProfileImage(response))
  //     }
  //     else{
  //       //dispatch(imgUploadError(response.body))
  //     }
  //   })
  // }
  //
  // }
  //
  // function fetchUserProfileImg(imgURL){
  //   return fetch(API+imgURL,{
  // 		method: 'GET',
  // 		headers: getHeaderWithoutContent(sessionStorage.userToken)
  // 	}).then( response => Promise.all([response]));
  // }



export function saveProfileImage(imageURL) {
//  alert("in save profile img")
  console.log(imageURL)
//  imageURL = "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAyCAAAAJGQ4YTE4MDc2LTZmNjgtNDIxZC1iMTA2LTVjMDkyNjZjNGFkOA.jpg"

  return {
    type: "SAVE_PROFILE_IMAGE",
    imgUrl:imageURL
  }

}
