import { getUserDetailsOrRestart } from "../helpers/helper";
import { getHeader } from "./appActions";
import { API } from "../helpers/env";

export function chartObjStore(chartObj) {
	return {
		type: "CHART_OBJECT",
		chartObj
	}
}
export function chartdate(name,value) {
	return {
		type: "C3_DATE",name,value
	}
}

export function fetchWordCloudImg(data){
	return (dispatch) => {
		return fetchWordCloudImgAPI(data,getUserDetailsOrRestart.get().userToken,dispatch).then(([response]) => {
			if(response.status === 200){
				dispatch(wordCloudImgResponse());
			}else{
				bootbox.alert(statusMessages("warning","Failed","small_mascot"));
			}
		})
	}
}
function fetchWordCloudImgAPI(data,token){
	return fetch(API+"/api/stockdataset/"+data.slug+"/fetch_word_cloud/?symbol="+data.symbol+"&data="+data.date,{
		method : "get",
		headers : getHeader(token),
	}).then(response => Promise.all([response]));
}
export function wordCloudImgResponse() {
	let jsn = {
		"slug": "stock-analysis5-puhhjfk2kg",
		"symbol": "jpm",
		"date": "2020-03-23",
		"image_url": "/media/wordcloud.png"
	}
	return {
		type: "CLOUD_IMG_RESPONSE",jsn
	}
}
