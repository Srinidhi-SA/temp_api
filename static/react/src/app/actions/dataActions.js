var API = "http://192.168.33.94:9000";

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
				dispatch(fetchProductList(json))
			}
			else{
				dispatch(fetchdDataError(json))
			}
		})
	}
}

function fetchDataList(pageNo,token) {
	console.log("JWT "+token)
	return fetch(API+'/api/dataset/all?userId=1&page_number='+pageNo+'&page_size=2',{
		method: 'get',
		headers: getHeader(token)
	}).then( response => Promise.all([response, response.json()]));
}


function fetchDataSuccess(dataList) {
	console.log("Data list from api to store")
	console.log(dataList);
	return {
		type: "TOTAL_DATA_LIST",
		dataList
	}
}
function fetchDataError(json) {

	return {
		type: "DATA_LIST_ERROR",
		json
	}
}
export function fetchProductList(doc){
	var data = doc;
	var current_page =  doc.current_page
	return {
		type: "DATA_LIST",
		data,
		current_page,
	}
}
