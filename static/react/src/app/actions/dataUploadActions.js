import {API} from "../helpers/env";
import store from "../store";
import {FILEUPLOAD, DULOADERPERVALUE, LOADERMAXPERVALUE, DEFAULTINTERVAL, DULOADERPERMSG} from "../helpers/helper";
import {getDataList, getDataSetPreview, updateDatasetName, openDULoaderPopup} from "./dataActions";
export var dataPreviewInterval = null;

export function getHeaderWithoutContent(token) {
  return {'Authorization': token};
}
function getHeader(token) {
  return {'Authorization': token, 'Content-Type': 'application/json'};
}
export function dataUpload() {

  return (dispatch) => {
    dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
    dispatch(dataUploadLoaderMsg(DULOADERPERMSG));
    dispatch(close());
    dispatch(openDULoaderPopup());
    return triggerDataUpload(sessionStorage.userToken).then(([response, json]) => {

      // dispatch(dataUploadLoaderValue(json.message[json.message.length-1].globalCompletionPercentage));
      // dispatch()
      if (response.status === 200) {
        console.log(json.slug)
        dispatch(updateDatasetName(json.slug))
        dispatch(dataUploadSuccess(json, dispatch))
      } else {
        dispatch(dataUploadError(json))
      }
    });
  }
}

function triggerDataUpload(token) {
  if (store.getState().dataSource.selectedDataSrcType == "fileUpload") {
    var data = new FormData();
    data.append("input_file", store.getState().dataSource.fileUpload);
    console.log(data)
    return fetch(API + '/api/datasets/', {
      method: 'post',
      headers: getHeaderWithoutContent(token),
      body: data
    }).then(response => Promise.all([response, response.json()]));
  } else {
    var host = store.getState().dataSource.db_host;
    var port = store.getState().dataSource.db_port;
    var username = store.getState().dataSource.db_username;
    var password = store.getState().dataSource.db_password;
    var tablename = store.getState().dataSource.db_tablename;
    var schema = store.getState().dataSource.db_schema;
    var dataSourceDetails = {
      "host": host,
      "port": port,
      "schema": schema,
      "username": username,
      "tablename": tablename,
      "password": password,
      "datasourceType": store.getState().dataSource.selectedDataSrcType
    }
    return fetch(API + '/api/datasets/', {
      method: 'post',
      headers: getHeader(token),
      body: JSON.stringify({datasource_details: dataSourceDetails, datasource_type: store.getState().dataSource.selectedDataSrcType})
    }).then(response => Promise.all([response, response.json()]));

  }

}

function dataUploadSuccess(data, dispatch) {
  let msg = store.getState().datasets.dataLoaderText
  let loaderVal = store.getState().datasets.dULoaderValue

  dataPreviewInterval = setInterval(function() {

    let loading_message = store.getState().datasets.loading_message
    dispatch(getDataSetPreview(data.slug, dataPreviewInterval));
    if (store.getState().datasets.dULoaderValue < LOADERMAXPERVALUE) {
      if (loading_message && loading_message.length > 0) {
        msg = loading_message[loading_message.length - 1].shortExplanation
        loaderVal = loading_message[loading_message.length - 1].globalCompletionPercentage
        //alert(msg + "  " + loaderVal)
      }
      dispatch(dataUploadLoaderValue(loaderVal));
      dispatch(dataUploadLoaderMsg(msg));
    } else {
      dispatch(clearLoadingMsg())
    }

  }, DEFAULTINTERVAL);
  return {type: "HIDE_MODAL"}
}

export function dataUploadError(josn) {
  return {type: "DATA_UPLOAD_TO_SERVER_ERROR", json}
}

export function open() {
  return {type: "SHOW_MODAL"}
}

export function close() {
  return {type: "HIDE_MODAL"}
}

export function openImg() {
  return {type: "SHOW_IMG_MODAL"}
}

export function closeImg() {
  return {type: "HIDE_IMG_MODAL"}
}

export function dataUploadLoaderValue(value) {
  return {type: "DATA_UPLOAD_LOADER_VALUE", value}
}

export function dataUploadLoaderMsg(message) {
  return {type: "DATA_UPLOAD_LOADER_MSG", message}
}

//for subsetting

export function dataSubsetting(subsetRq, slug) {

  return (dispatch) => {
    dispatch(dataUploadLoaderValue(DULOADERPERVALUE));
    dispatch(dataUploadLoaderMsg(DULOADERPERMSG));
    dispatch(close());
    dispatch(openDULoaderPopup());
    return triggerDataSubsetting(subsetRq, slug).then(([response, json]) => {
      //dispatch(dataUploadLoaderValue(store.getState().datasets.dULoaderValue+DULOADERPERVALUE));
      if (response.status === 200) {
        console.log(json.slug)
        dispatch(updateDatasetName(json.slug))
        dispatch(dataUploadSuccess(json, dispatch))
        dispatch(updateSubsetSuccess(json))
      } else {
				dispatch(clearLoadingMsg())
				dispatch(dataUploadError(json))
      }
    });
  }
}

function triggerDataSubsetting(subsetRq, slug) {
  return fetch(API + '/api/datasets/' + slug + '/', {
    method: 'put',
    headers: getHeader(sessionStorage.userToken),
    body: JSON.stringify(subsetRq)
  }).then(response => Promise.all([response, response.json()]));

}
function updateSubsetSuccess(subsetRs) {
  console.log("data subset from api to store")
  //console.log(subsetRs)
  return {type: "SUBSETTED_DATASET", subsetRs}
}
export function clearDataPreview() {
  return {type: "CLEAR_DATA_PREVIEW"}
}

export function clearLoadingMsg() {
  return {type: "CLEAR_LOADING_MSG"}
}

//for image upload

export function uploadImg(){
    return (dispatch) => {
      dispatch(closeImg());
      return triggerImgUpload().then(([response, json]) => {
        if (response.status === 200) {
          dispatch(retrieveProfileImg(json.image_url))
          // dispatch(saveProfileImage(json))
          // console.log(json.slug)
              } else {
          dispatch(imgUploadError(json))
        }
      });
    }
  }
  function triggerImgUpload() {
    var data = new FormData();
    data.append("image", store.getState().dataSource.fileUpload);
    data.append("website",sessionStorage.email)
    data.append("bio","jfhsndfn")
    data.append("phone",sessionStorage.phone)

    return fetch(API + '/api/upload_photo/', {
      method: 'put',
      headers: getHeaderWithoutContent(sessionStorage.userToken),
      body: data
    }).then(response => Promise.all([response, response.json()]));

  }

  export function imgUploadError(josn) {
    return {type: "IMG_UPLOAD_TO_SERVER_ERROR", json}
  }
  function retrieveProfileImg(imgURL){
    return (dispatch) => {
    return fetchUserProfileImg(imgURL).then(([response]) =>{
        if(response.status === 200){
          console.log("in rezsponse")
          console.log(response)
        dispatch(saveProfileImage(response))
      }
      else{
        //dispatch(imgUploadError(response.body))
      }
    })
  }

  }

  function fetchUserProfileImg(imgURL){
    return fetch(API+imgURL,{
  		method: 'GET',
  		headers: getHeaderWithoutContent(sessionStorage.userToken)
  	}).then( response => Promise.all([response]));
  }



function saveProfileImage(response) {
  alert("in save profile img")
  console.log(response)
  return {
    type: "SAVE_PROFILE_IMAGE",
    imgUrl:response
  }

}
