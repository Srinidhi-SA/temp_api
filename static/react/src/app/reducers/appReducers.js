export default function reducer(state = {
		appsModelShowModal:false,
		modelList: {},
		current_page:1,
		trainValue:50,
		testValue:50,
		scoreList:{},
		appsScoreShowModal:false,
		score_current_page:1,
		modelSlug:"",
		modelSummary:{},
		algorithmsList:null,
		selectedAlg:"",
		scoreSummary:{},
		scoreSlug:"",
		currentAppId:1,
		currentAppName:"",
		appsLoaderModal:false,
		appsLoaderPerValue:0,
		appsLoaderText :"",
		modelSummaryFlag:false,
		scoreSummaryFlag:false,
		
}, action) {
	console.log("In APPs reducer!!");
	console.log(action.data);

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
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch model list!!");
	}
	break;
	case "UPDATE_MODEL_RANGE":
	{
		return {
			...state,
			trainValue: action.trainValue,
			testValue:action.testValue,
		}
	}
	break;
	
	case "SCORE_LIST":
	{
		return {
			...state,
			scoreList: action.data,
			score_current_page:action.current_page,
		}
	}
	break;

	case "SCORE_LIST_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch score list!!");
	}
	break;
	case "APPS_SCORE_SHOW_POPUP":
	{
		return {
			...state,
			appsScoreShowModal:true,
		}
	}
	break;

	case "APPS_SCORE_HIDE_POPUP":
	{
		return {
			...state,
			appsScoreShowModal:false,
		}
	}
	break;
	
	case "MODEL_SUMMARY_SUCCESS":
	{
		return {
			...state,
			modelSummary: action.data,
			algorithmsList:action.data.data.model_dropdown,
			modelSlug:action.data.slug,
		}
	}
	break;

	case "MODEL_SUMMARY_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch model summary!!");
	}
	break;
	
	case "SELECTED_ALGORITHM":
	{
		return {
			...state,
			selectedAlg:action.name,
		}
	}
	break;
	case "SCORE_SUMMARY_SUCCESS":
	{
	
		return {
			...state,
			scoreSummary: action.data,
			scoreSlug:action.data.slug,
		}
	}
	break;

	case "SCORE_SUMMARY_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch score summary!!");
	}
	break;
	case "SELECTED_APP_DETAILS":
	{
	
		return {
			...state,
			currentAppId: action.appId,
			currentAppName:action.appName,
		}
	}
	break;
	case "OPEN_APPS_LOADER_MODAL":
	{
	
		return {
			...state,
			appsLoaderModal:true,
			appsLoaderPerValue:action.value,
			appsLoaderText :action.text,
		}
	}
	break;
	case "HIDE_APPS_LOADER_MODAL":
	{
	
		return {
			...state,
			appsLoaderModal:false,
			appsLoaderPerValue:0,
			appsLoaderText :"",
		}
	}
	break;
	case "UPDATE_APPS_LOADER_VALUE":
	{
	
		return {
			...state,
			appsLoaderPerValue:action.value,
		}
	}
	break;
	case "CREATE_MODEL_SUCCESS":
	{
		return {
			...state,
			modelSlug:action.slug,
		}
	}
	break;
	case "CREATE_MODEL_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to create model!");
	}
	break;
	case "UPDATE_MODEL_FLAG":
	{
		return {
			...state,
			modelSummaryFlag:action.flag,
		}
	}
	break;
	case "CREATE_SCORE_SUCCESS":
	{
		return {
			...state,
			scoreSlug:action.slug,
		}
	}
	break;
	case "CREATE_SCORE_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to create score!");
	}
	break;
	case "UPDATE_SCORE_FLAG":
	{
		return {
			...state,
			scoreSummaryFlag:action.flag,
		}
	}
	break;
	
 }
return state
}
