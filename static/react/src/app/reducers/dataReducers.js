
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
		selectedAnalysis:[],
		selectedVariablesCount:0,
		signalMeta:{},
		curUrl:"",
		dataUploadLoaderModal:false,
		dULoaderValue:10,
		data_search_element:"",
		dataSetMeasures:[],
		dataSetDimensions:[],
		dataSetTimeDimensions:[],
		ImmutableMeasures:[],
		ImmutableDimension:[],
		ImmutableTimeDimension:[],
		measureAllChecked:true,
		measureChecked:[],
		dimensionAllChecked:true,
		dimensionChecked:[],
		dateTimeChecked:[],
		dataLoaderText:"Please wait while mAdvisor is uploading your data.....",
		data_sorton:null,
		data_sorttype:null,

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
		throw new Error("Unable to fetch data list!!");
	}
	break;
	case "DATA_PREVIEW": {
		return {...state,
			dataPreview:action.dataPreview,
			dataPreviewFlag:true,
			selectedDataSet:action.slug
		}
	}
	break;
	case "DATA_PREVIEW_FOR_LOADER": {
		return {...state,
			dataPreview:action.dataPreview,
			selectedDataSet:action.slug
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
			selectedDataSet:action.slug
		}
	}
	break;

	case "DATA_ALL_LIST_ERROR":
	{
		throw new Error("Unable to fetch data list!!");
	}
	break;
	case "SELECTED_ANALYSIS_TYPE":
	{
		return{
			...state,
			selectedAnalysis:state.selectedAnalysis.concat(action.selectedAnalysis),
		}
	}
	break;
	case "UNSELECT_ANALYSIS_TYPE":
	{
		return{
     ...state,
		selectedAnalysis: state.selectedAnalysis.filter(item => action.selectedAnalysis !== item)
	  }
	}
	break;
	
	case "UNSELECT_All_ANALYSIS_TYPE":
	{
		return{
     ...state,
		selectedAnalysis: action.unselectAll
	  }
	}
	break;
	
	case "SELECTED_MEASURES":
	{
		return {
			...state,
			selectedMeasures:state.selectedMeasures.concat(action.variableName),
			selectedVariablesCount:state.selectedVariablesCount+1,
			measureChecked:action.meaChkBoxList,
			measureAllChecked:action.isAllChecked
			
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
			measureChecked:action.meaChkBoxList,
			measureAllChecked:action.isAllChecked
		
			
		}
	}
	break;
	case "SELECTED_DIMENSIONS":
	{
		return {
			...state,
			selectedDimensions:state.selectedDimensions.concat(action.variableName),
			selectedVariablesCount:state.selectedVariablesCount+1,
			dimensionAllChecked:action.isAllChecked,
			dimensionChecked:action.dimChkBoxList,
		}
	}
	break;
	case "UNSELECT_DIMENSION":
	{
		return {
			...state,
			selectedDimensions: state.selectedDimensions.filter(item => action.variableName !== item),
			selectedVariablesCount:state.selectedVariablesCount-1,
			dimensionAllChecked:action.isAllChecked,
			dimensionChecked:action.dimChkBoxList,
		}
	}
	break;
	case "SELECTED_TIMEDIMENSION":
	{
		return {
			...state,
			selectedTimeDimensions:action.variableName,
			selectedVariablesCount:state.selectedVariablesCount,
			dateTimeChecked:action.timeChkBoxList,
		}
	}
	break;
	case "UNSELECT_TIMEDIMENSION":
	{
		return {
			...state,
			selectedTimeDimensions:action.variableName,
			selectedVariablesCount:state.selectedVariablesCount-1,
			dateTimeChecked:action.timeChkBoxList,
		}
	}
	break;
	case "STORE_SIGNAL_META":
	{
		return {
			...state,
			signalMeta:action.signalMeta,
			curUrl : action.curUrl
		}
	}
	break;
	case "SELECTED_DATASET": {
		return {...state,
			selectedDataSet:action.dataset,
		}
	}
	break;
	case "RESET_VARIABLES": {
		return {...state,
			selectedDimensions:[],
			selectedTimeDimensions:[],
			selectedVariablesCount:0,
			selectedMeasures:[],
		}
	}
	break;
	case "SET_VARIABLES": {
		return {...state,
			selectedDimensions:action.dimensions,
			selectedTimeDimensions:action.timeDimension,
			selectedMeasures:action.measures,
			selectedVariablesCount:action.count,
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
	case "DATA_UPLOAD_LOADER":
	{
		return {
			...state,
			dataUploadLoaderModal:true,
		}
	}
	break;
	case "HIDE_DATA_UPLOAD_LOADER":
	{
		return {
			...state,
			dataUploadLoaderModal:false,
		}
	}
	break;
	case "DATA_UPLOAD_LOADER_VALUE":
	{
		return {
			...state,
			dULoaderValue:action.value,
		}
	}
	break;
	case "CLEAR_DATA_PREVIEW": {
		return {...state,
			dataPreview:{},
			dataPreviewFlag:false,
			selectedDataSet:""
		}
	}
	break;
	case "SEARCH_DATA":
	{
		return{
			...state,
			data_search_element:action.search_element
		}
	}
	break;
	case "DATASET_VARIABLES": {
		return {...state,
			dataSetMeasures:action.measures,
			dataSetDimensions:action.dimensions,
			dataSetTimeDimensions:action.timeDimensions,
			ImmutableMeasures:action.measures,
			ImmutableDimension:action.dimensions,
			ImmutableTimeDimension:action.timeDimensions,
			measureChecked:action.measureChkBoxList,
			dimensionChecked:action.dimChkBoxList,
			measureAllChecked:true,
			dimensionAllChecked:true,
			dateTimeChecked:action.dateTimeChkBoxList,
			
		}
	}
	break;
	
	case "SEARCH_MEASURE":
	{
		return {
			...state,
			dataSetMeasures: state.ImmutableMeasures.filter((item) => item.toLowerCase().includes(action.name.toLowerCase())),
			
		}
	}
	break;
	case "SORT_MEASURE":
	{
		return {
			...state,
			dataSetMeasures: action.measures,
			measureChecked:action.checkBoxList,
			
		}
	}
	break;
	
	case "SORT_DIMENSION":
	{
		return {
			...state,
			dataSetDimensions: action.dimensions,
			dimensionChecked:action.checkBoxList1,
			
		}
	}
	break;
	
	case "SORT_TIMEDIMENSION":
	{
		return {
			...state,
			dataSetTimeDimensions: action.timedimensions,
			dateTimeChecked:action.checkBoxList2,
			
			
		}
	}
	break;
	
	case "SEARCH_DIMENSION":
	{
		return {
			...state,
			dataSetDimensions: state.ImmutableDimension.filter((item) => item.toLowerCase().includes(action.name.toLowerCase())),
			
		}
	}
	break;
	
	case "SEARCH_TIMEDIMENSION":
	{
		return {
			...state,
			dataSetTimeDimensions: state.ImmutableTimeDimension.filter((item) => item.toLowerCase().includes(action.name.toLowerCase())),
			
		}
	}
	break;
	
	case "SELECT_ALL_MEASURES":
	{
		return {
			...state,
			selectedMeasures:action.measures,
			measureAllChecked:true,
			measureChecked:action.meaChkBoxList,
			selectedVariablesCount:state.selectedDimensions.length+action.measures.length+action.dataTimeCount,
			dataSetMeasures:action.measures
			
		}
	}
	break;
	case "UNSELECT_ALL_MEASURES":
	{
		return {
			...state,
			selectedMeasures:[],
			measureAllChecked:false,
			measureChecked:action.meaChkBoxList,
			selectedVariablesCount:state.selectedVariablesCount-state.selectedMeasures.length,
			dataSetMeasures:state.ImmutableMeasures
		}
	}
	break;
	
	case "SELECT_ALL_DIMENSION":
	{
		return {
			...state,
			selectedDimensions:action.dimension,
			dimensionAllChecked:true,
			dimensionChecked:action.diaChkBoxList,
			selectedVariablesCount:state.selectedMeasures.length+action.dimension.length+action.dataTimeCount,
			dataSetDimensions: action.dimension,
			
		}
	}
	break;
	case "UNSELECT_ALL_DIMENSION":
	{
		return {
			...state,
			selectedDimensions:[],
			dimensionAllChecked:false,
			dimensionChecked:action.diaChkBoxList,
			selectedVariablesCount:state.selectedVariablesCount-state.selectedDimensions.length,
			dataSetDimensions:state.ImmutableDimension
		}
	}
	break;	
		case "SORT_DATA":
	{
      return{
        ...state,
        data_sorton:action.sorton,
		data_sorttype:action.sorttype
      }
    }
	break;
	}
	
	return state
}
