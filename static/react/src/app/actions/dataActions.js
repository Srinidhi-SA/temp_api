import {API} from "../helpers/env";
// var API = "http://34.196.204.54:9000";

function getHeader(token){
  console.log("checking token:::---");
  console.log(token);
  return {
    'Authorization': "JWT "+token,
    'Content-Type': 'application/json'
  };
}
//x-www-form-urlencoded
export function getData(slug) {
    return (dispatch) => {
    return fetchData(slug).then(([response, json]) =>{
        if(response.status === 200){
          console.log(json)
        dispatch(fetchDataSuccess(json))
      }
      else{
        dispatch(fetchDataError(json))
      }
    })
  }
}

function fetchData(slug) {
  return fetch(API+'/api/datasets/'+ slug,{
		method: 'get',
    headers: getHeader(sessionStorage.userToken)
		}).then( response => Promise.all([response, response.json()]));
}


function fetchDataSuccess(dataPreview) {
  console.log("data preview from api to store")
  console.log(dataPreview)
  return {
    type: "DATA_PREVIEW",
    dataPreview
  }
}

function fetchDataError(json) {
  console.log("fetching list error!!",json)
  return {
    type: "DATA_PREVIEW_ERROR",
    json
  }
}
