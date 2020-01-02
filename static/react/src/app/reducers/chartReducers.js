export default function reducer(state = {
		chartObj:{},
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
   }
	return state
}
