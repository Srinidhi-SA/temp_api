export default function reducer(state = {
	chartObj:{},
	date:{},
	cloudImgResp:{}

}, action) {

	switch (action.type) {
		case "CHART_OBJECT":
		{
			return {
				...state,
				chartObj: action.chartObj
			}
		}
		break;
		case "C3_DATE":
		{
			let curDateInfo = state.date
			curDateInfo[action.name] = action.value
			return {
				...state,
				date: curDateInfo
			}
		}
		break;
		case "CLOUD_IMG_RESPONSE":
		{
			return {
				...state,
				cloudImgResp : action.jsn
			}
		}
		break;
	}
	return state
}
