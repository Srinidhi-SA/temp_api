export default function reducer(state = {
		appsModelShowModal:false,
		modelList: {},
		current_page:1,
}, action) {
	console.log("In APPs reducer!!");
	console.log(action);

	switch (action.type) {
	case "APPS_MODEL_SHOW_POPUP":
	{
		return {
			...state,
			appsModelShowModal:true,
		}
	}
	break;

	case "APPS_MODEL_HIDE_POPUP":
	{
		return {
			...state,
			appsModelShowModal:false,
		}
	}
	break;
	case "MODEL_LIST":
	{
		return {
			...state,
			modelList: action.data,
			current_page:action.current_page,
		}
	}
	break;

	case "MODEL_LIST_ERROR":
	{
		alert(action.json.non_field_errors);
		throw new Error("Unable to fetch model list!!");
	}
	break;
	
 }
return state
}
