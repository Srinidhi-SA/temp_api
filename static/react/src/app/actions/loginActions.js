var API = "http://34.196.204.54:9000";

export function authenticateFunc() {
    return (dispatch) => {
    return fetchPosts().then(([response, json]) =>{
        if(response.status === 200){
        dispatch(fetchPostsSuccess(json))
      }
      else{
        dispatch(fetchPostsError())
      }
    })
  }
}

function fetchPosts() {
  return fetch(API+'/api/user/api-token-auth',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
				username: 'harman',
				password: 'password123',
		 })
	}).then( response => Promise.all([response, response.json()]));
}


function fetchPostsSuccess(payload) {
  return {
    type: "AUTHENTICATE_USER",
    payload
  }
}

function fetchPostsError() {
  return {
    type: "AUTHENTICATE_USER_ERROR"
  }
}
