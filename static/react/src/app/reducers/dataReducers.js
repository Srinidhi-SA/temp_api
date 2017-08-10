
export default function reducer(state = {
		dataList: {},
		selectedDataSet:"",
		current_page:1,
		 dataPreview:null,
}, action) {
	console.log("In DATA reducer!!");
	console.log(action);

	switch (action.type) {
	case "DATA_LIST":
	{
		return {
			...state,
			dataList: action.data,
			current_page:action.current_page,
		}
	}
	break;

	case "DATA_LIST_ERROR":
	{
		alert(action.json.non_field_errors);
		throw new Error("Unable to fetch data list!!");
	}
	break;
	case "DATA_PREVIEW": {
		return {...state,
			dataPreview:action.dataPreview
		}
	}
	break;
	case "DATA_PREVIEW_ERROR":
	{ 
		throw new Error("Fetching of Data failed!!");
	}
	break;
	}
	return state
}

