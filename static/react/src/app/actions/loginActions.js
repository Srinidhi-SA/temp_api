import {sessionObject} from './manageSessionStorage';
var API = "http://192.168.33.128:9001";

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
  return fetch(API+'/api/user/api-token-auth',{
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
