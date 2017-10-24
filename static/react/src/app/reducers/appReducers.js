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
		modelTargetVariable:"",
		roboList:{},
		appsRoboShowModal:false,
		customerDataUpload:{},
		historialDataUpload:{},
		externalDataUpload:{},
		roboDatasetSlug:"",
		roboSummary:{},
		showRoboDataUploadPreview:false,
		customerDataset_slug :"",
		historialDataset_slug:"",
		externalDataset_slug:"",
		roboUploadTabId:"customer",
		robo_search_element:"",
		model_search_element:"",
		score_search_element:"",
		appsSelectedTabId:"model",
		audioFileUploadShowFlag:false,
		audioFileUpload:{},
		appsLoaderImage:"pe-7s-science pe-spin pe-5x pe-va text-primary",
		audioFileSummary:{},
		audioFileSlug :"",
		audioFileSummaryFlag:false,
		audioList:{},
		audio_search_element:"",
		robo_sorton:null,
		robo_sorttype:null,
		apps_model_sorton:null,
		apps_model_sorttype:null,
		apps_score_sorton:null,
		apps_score_sorttype:null,
		appsCreateStockModal:false,
		appsStockSymbolsInputs:[],
		stockAnalysisList:{},
		stockUploadDomainModal:false,
		stockUploadDomainFiles:[],
		stockSlug:"",
		stockAnalysisFlag:false,


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
			current_page:action.current_page,
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
			modelTargetVariable:action.data.data.config.target_variable[0],
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
	case "ROBO_LIST":
	{
		return {
			...state,
			roboList: action.data,
			current_page:action.current_page,
		}
	}
	break;

	case "ROBO_LIST_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch robo list!!");
	}
	break;
	case "APPS_ROBO_SHOW_POPUP":
	{
		return {
			...state,
			appsRoboShowModal:true,
		}
	}
	break;

	case "APPS_ROBO_HIDE_POPUP":
	{
		return {
			...state,
			appsRoboShowModal:false,
		}
	}
	break;
	case "CUSTOMER_DATA_UPLOAD_FILE":
	{
		return {
			...state,
			customerDataUpload:action.files[0],
		}
	}
	break;
	case "HISTORIAL_DATA_UPLOAD_FILE":
	{
		return {
			...state,
			historialDataUpload:action.files[0],
		}
	}
	break;

	case "EXTERNAL_DATA_UPLOAD_FILE":
	{
		return {
			...state,
			externalDataUpload:action.files[0],
		}
	}
	break;
	case "ROBO_DATA_UPLOAD_SUCCESS":
	{
		return {
			...state,
			roboDatasetSlug:action.slug,
		}
	}
	break;

	case "ROBO_DATA_UPLOAD_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to upload robo data files!!");
	}
	break;
	case "ROBO_SUMMARY_SUCCESS":
	{
		return {
			...state,
			roboSummary: action.data,
			roboDatasetSlug:action.data.slug,
			customerDataset_slug:action.data.customer_dataset.slug,
			historialDataset_slug:action.data.historical_dataset.slug,
			externalDataset_slug:action.data.market_dataset.slug,
		}
	}
	break;
	case "ROBO_DATA_UPLOAD_PREVIEW":
	{
		return {
			...state,
			showRoboDataUploadPreview: action.flag,
		}
	}
	break;
	case "ROBO_SUMMARY_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch robo summary!!");
	}
	break;
	case "EMPTY_ROBO_DATA_UPLOAD_FILES":
	{
		return {
			...state,
			historialDataUpload:{},
			customerDataUpload:{},
			externalDataUpload:{},

		}
	}
	break;
	case "UPDATE_ROBO_UPLOAD_TAB_ID":
	{
		return {
			...state,

			roboUploadTabId:action.tabId,
		}
	}
	break;
	case "APPS_SELECTED_TAB":
	{
		return {
			...state,
			appsSelectedTabId:action.id,
		}
	}
	break;
	case "SEARCH_ROBO":
	{
		return{
			...state,
			robo_search_element:action.search_element
		}
	}
	break;
	case "SEARCH_MODEL":
	{
		return{
			...state,
			model_search_element:action.search_element
		}
	}
	break;
	case "SEARCH_SCORE":
	{
		return{
			...state,
			score_search_element:action.search_element
		}
	}
	break;
	case "ROBO_SUMMARY_SUCCESS":
	{
		return {
			...state,
			roboSummary: {},
			roboDatasetSlug:"",
			customerDataset_slug:"",
			historialDataset_slug:"",
			externalDataset_slug:"",
			roboUploadTabId:"customer",
		}
	}
	break;
	case "SHOW_AUDIO_FILE_UPLOAD":
	{
		return{
			...state,
			audioFileUploadShowFlag:true,
		}
	}
	break;
	case "HIDE_AUDIO_FILE_UPLOAD":
	{
		return{
			...state,
			audioFileUploadShowFlag:false,
		}
	}
	break;
	case "AUDIO_UPLOAD_FILE":
	{
		console.log(action.files[0])
		return{
			...state,
			audioFileUpload:action.files[0],
		}
	}
	break;
	case "AUDIO_UPLOAD_SUCCESS":
	{
		return{
			...state,
			audioFileSlug:action.slug,
		}
	}
	break;
	case "AUDIO_UPLOAD_ERROR":
	{
		throw new Error("Unable to upload audio files!!");
	}
	break;
	case "AUDIO_UPLOAD_SUMMARY_SUCCESS":
	{
		return{
			...state,
			audioFileSummary:action.data,
		}
	}
	break;
	case "AUDIO_UPLOAD_SUMMARY_ERROR":
	{
		throw new Error("Unable to get audio file preview!!");
	}
	break;
	case "CLEAR_AUDIO_UPLOAD_FILE":
	{
		return{
			...state,
			audioFileUpload:{},
		}
	}
	break;
	case "UPDATE_AUDIO_FILE_SUMMARY_FLAG":
	{
		return{
			...state,
			audioFileSummaryFlag:action.flag,
		}
	}
	break;

	case "AUDIO_LIST":
	{
		return {
			...state,
			audioList: action.data,
			current_page:action.current_page,
		}
	}
	break;

	case "AUDIO_LIST_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch audio list!!");
	}
	break;
	case "SEARCH_AUDIO_FILE":
	{
		return{
			...state,
			audio_search_element:action.search_element
		}
	}
	break;

	case "SORT_ROBO":
	{
		return{
			...state,
			robo_sorton:action.roboSorton,
			robo_sorttype:action.roboSorttype
		}
	}
	break;	case "SORT_APPS_MODEL":
	{
		return{
			...state,
			apps_model_sorton:action.appsModelSorton,
			apps_model_sorttype:action.appsModelSorttype
		}
	}
	break;
	case "SORT_APPS_SCORE":
	{
		return{
			...state,
			apps_score_sorton:action.appsScoreSorton,
			apps_score_sorttype:action.appsScoreSorttype
		}
	}
	break;

	case "CREATE_STOCK_MODAL":
	{
		return{
			...state,
			appsCreateStockModal:action.flag

		}
	}
	break;
	case "ADD_STOCK_SYMBOLS":
	{
		return{
			...state,
			appsStockSymbolsInputs:action.stockSymbolsArray

		}
	}
	break;


	case "STOCK_LIST":
	{
		return {
			...state,
			stockAnalysisList: action.data,
			current_page:action.current_page,
		}
	}
	break;

	case "STOCK_LIST_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to fetch stock list!!");
	}
	break;
	case "UPLOAD_STOCK_MODAL":
	{
		return{
			...state,
			stockUploadDomainModal:action.flag

		}
	}
	break;
	case "UPLOAD_STOCK_FILES":
	{
		return{
			...state,
			stockUploadDomainFiles:action.files

		}
	}
	break;
	case "CRAWL_ERROR":
	{
		//alert(action.json.non_field_errors);
		throw new Error("Unable to crawl data!!");
	}
	break;
	
	case "STOCK_CRAWL_SUCCESS":
	{
		return{
			...state,
			stockSlug:action.slug,
		}
	}
	break;
	case "UPDATE_STOCK_ANALYSIS_FLAG":
	{
		return{
			...state,
			stockAnalysisFlag:action.flag,
		}
	}
	break;
	}
	return state
}
