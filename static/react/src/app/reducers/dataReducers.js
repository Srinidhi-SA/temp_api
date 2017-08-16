
export default function reducer(state = {
		dataList: {},
		selectedDataSet:"",
		current_page:1,
		dataPreview:null,
		allDataSets:{},
		selectedDimensions:[],
		selectedMeasures:[],
		selectedTimeDimensions:"",
		dataPreviewFlag:false,
		selectedVariablesCount:0,
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
			dataPreview:action.dataPreview,
			dataPreviewFlag:true,
		}
	}
	break;
	case "DATA_PREVIEW_ERROR":
	{ 
		throw new Error("Fetching of Data failed!!");
	}
	break;
	case "DATA_ALL_LIST":
	{
		return {
			...state,
			allDataSets: action.data,
		}
	}
	break;

	case "DATA_ALL_LIST_ERROR":
	{
		alert(action.json.non_field_errors);
		throw new Error("Unable to fetch data list!!");
	}
	break;
	case "SELECTED_MEASURES":
	{
		return {
			...state,
			selectedMeasures:state.selectedMeasures.concat(action.variableName),
			selectedVariablesCount:state.selectedVariablesCount+1,
		}
	}
	break;
	case "SHOW_DATA_PREVIEW":
	{
		return {
			...state,
			dataPreviewFlag:true,
		}
	}
	break;
	case "HIDE_DATA_PREVIEW":
	{
		return {
			...state,
			dataPreviewFlag:false,
		}
	}
	break;
	case "UNSELECT_MEASURES":
	{
		return {
			...state,
			selectedMeasures: state.selectedMeasures.filter(item => action.variableName !== item),
			selectedVariablesCount:state.selectedVariablesCount-1,
		}
	}
	break;
	case "SELECTED_DIMENSIONS":
	{
		return {
			...state,
			selectedDimensions:state.selectedDimensions.concat(action.variableName),
			selectedVariablesCount:state.selectedVariablesCount+1,
		}
	}
	break;
	case "UNSELECT_DIMENSION":
	{
		return {
			...state,
			selectedDimensions: state.selectedDimensions.filter(item => action.variableName !== item),
			selectedVariablesCount:state.selectedVariablesCount-1,
		}
	}
	break;
	case "SELECTED_TIMEDIMENSION":
	{
		return {
			...state,
			selectedTimeDimensions:action.variableName,
			selectedVariablesCount:state.selectedVariablesCount+1,
		}
	}
	break;
	case "UNSELECT_TIMEDIMENSION":
	{
		return {
			...state,
			selectedTimeDimensions:action.variableName,
			selectedVariablesCount:state.selectedVariablesCount-1,
		}
	}
	break;
	}
	return state
}

