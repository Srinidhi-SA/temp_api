var API = "http://192.168.33.94:9000";
//var API = "http://192.168.33.128:9001";
var perPage = 2;
function getHeader(token){
	return {
		'Authorization': "JWT "+token,
		'Content-Type': 'application/x-www-form-urlencoded'
	};
}

export function getDataList(pageNo) {
	return (dispatch) => {
		return fetchDataList(pageNo,sessionStorage.userToken).then(([response, json]) =>{
			if(response.status === 200){
				console.log(json)
				dispatch(fetchDataSuccess(json))
			}
			else{
				dispatch(fetchdDataError(json))
			}
		})
	}
}

function fetchDataList(pageNo,token) {
	console.log("JWT "+token)
	return fetch(API+'/api/dataset/all?userId='+sessionStorage.userId+'&page_number='+pageNo+'&page_size='+perPage+'',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}

function fetchDataError(json) {

	return {
		type: "DATA_LIST_ERROR",
		json
	}
}
export function fetchDataSuccess(doc){
	var data = doc;
	var current_page =  doc.current_page
	return {
		type: "DATA_LIST",
		data,
		current_page,
	}
}
