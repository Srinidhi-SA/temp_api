export default function reducer(state = {
		chartObj:{},
}, action) {
	console.log("In chart reducer!!");
	console.log(action);

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
