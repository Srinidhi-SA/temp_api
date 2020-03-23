export default function reducer(state = {
		chartObj:{},
		date:""
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
			return {
				...state,
				date: action.date
			}
		}
		break;
   }
	return state
}
