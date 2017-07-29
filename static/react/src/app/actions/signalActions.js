var API = "http://34.196.204.54:9000";

export function getList(token) {
    return (dispatch) => {
    return fetchPosts(token).then(([response, json]) =>{
        if(response.status === 200){
          console.log(json)
        dispatch(fetchPostsSuccess(json))
      }
      else{
        dispatch(fetchPostsError())
      }
    })
  }
}

function fetchPosts(token) {
  console.log("JWT "+token)
  return fetch(API+'/api/errand/archived?userId=13',{
		method: 'get',
		headers: {
			'Authorization': "JWT "+token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}}).then( response => Promise.all([response, response.json()]));
}


function fetchPostsSuccess(signalList) {
  console.log("signal list from api to store")
  console.log(signalList)
  return {
    type: "SIGNAL_LIST",
    signalList
  }
}

function fetchPostsError() {
  return {
    type: "SIGNAL_LIST_ERROR"
  }
}
