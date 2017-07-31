var API = "http://34.196.204.54:9000";

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
  console.log("user and pass is:");
  console.log(username+" "+password);
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
