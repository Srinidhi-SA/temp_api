export default function reducer(state = {
  signalList: {},
  signalAnalysis:{},
  selectedSignal:{},
  newSignalShowModal:false,
  signalData:null,
  createSignalLoaderModal:false,
  createSignalLoaderValue:0,
  current_page:1,
  urlPrefix:"/signals",
  signalAnalysis: {},
  selectedSignal: {},
  newSignalShowModal: false,
  signalData: null,
  createSignalLoaderModal: false,
  current_page: 1,
  signal_search_element:"",
  signal_sorton:null,
  signal_sorttype:null,
  sideCardListFlag:null,
  loaderText:"Analyzing Target Variable",
  advanceSettingsModal:false,
  getVarType:null,
  getVarText:null,
  selVarSlug:null,
  loading_message:[],
  viewChartFlag:false,
  chartClassId :"",
  showHide:false,
  viewChartDataFlag:false,
  chartDataClassId :"",
}, action) {
  console.log("in SIGNAL reducer!!");
  console.log(action);

  switch (action.type) {
    case "SIGNAL_LIST":
      {
        return {
          ...state,
          signalList: action.signalList,
          current_page: action.current_page
        }
      }
      break;

    case "SIGNAL_LIST_ERROR":
      {
        throw new Error("Unable to fetch signal list!!");
      }
      break;

    case "SIGNAL_ANALYSIS":
      {
        return {
          ...state,
          signalAnalysis: action.signalAnalysis.data,
          selectedSignal: action.errandId,
          urlPrefix:"/signals",
        }
      }
      break;

    case "SIGNAL_ANALYSIS_ERROR":
      {
        throw new Error("Unable to fetch signal list!!");
      }
      break;
    case "CREATE_SIGNAL_SHOW_MODAL":
      {
        return {
          ...state,
          newSignalShowModal: true
        }
      }
      break;

    case "CREATE_SIGNAL_HIDE_MODAL":
      {
        return {
          ...state,
          newSignalShowModal: false
        }
      }
      break;

    case "CREATE_SUCCESS":
      {
        return {
          ...state,
          signalData: action.signalData,
          loading_message:[]
        }
      }
      break;
    case "CREATE_ERROR":
      {
        throw new Error("Create Signal Failed!!");
      }
      break;
    case "SET_POSSIBLE_LIST":
      {
        return {
          ...state,
          getVarType: action.varType,
		  getVarText: action.varText,
		  selVarSlug:action.varSlug,
        }
      }
      break;
    case "SEL_PREDICTION":
      {
        return {
          ...state,
          selectedPrediction: action.predictionSelected
        }
      }
      break;
    case "HIDE_CREATE_SIGNAL_LOADER":
      {
        return {
          ...state,
          createSignalLoaderModal: false
        }
      }
      break;
    case "SHOW_CREATE_SIGNAL_LOADER":
      {
        return {
          ...state,
          createSignalLoaderModal: true
        }
      }
      break;
    case "CREATE_SIGNAL_LOADER_VALUE":
      {
        return {
          ...state,
          createSignalLoaderValue: action.value
        }
      }
      break;
    case "SIGNAL_ANALYSIS_EMPTY":
      {
        return {
          ...state,
          signalAnalysis: {}
        }
      }
      break;

    case "ROBO_DATA_ANALYSIS":
      {
        return {
          ...state,
          signalAnalysis: action.roboData.data,
          urlPrefix: action.urlPrefix,
          selectedSignal: action.roboSlug
        }
      }
      break;
    case "SEARCH_SIGNAL":
    {
      return{
        ...state,
        signal_search_element:action.search_element
      }
    }
    break;

	case "SORT_SIGNAL":
	{
      return{
        ...state,
        signal_sorton:action.sorton,
		signal_sorttype:action.sorttype
      }
    }
    break;

	case "SET_SIDECARDLIST_FLAG":
	{
		return{
			...state,
			sideCardListFlag:action.sideCardListClass
		}

	}
    break;
	case "ADVANCE_SETTINGS_MODAL":
	{
		return{
			...state,
			advanceSettingsModal:action.flag
		}

	}
    break;
    case "CHANGE_LOADING_MSG":
    {
      return {...state,
      loading_message:action.message}
    }
    break;
    case "CLEAR_LOADING_MSG":
    {
      return{
        ...state,
        loading_message:[],
        createSignalLoaderValue:0,
        loaderText:"Analyzing Target Variable"
      }
    }
    break;
    case "CREATE_SIGNAL_LOADER_MSG":
      {
        return {
          ...state,
          loaderText: action.message
        }
      }
      break;

    case "ZOOM_CHART":
    {
        return {
            ...state,
            viewChartFlag: action.flag,
            chartClassId:action.classId,
          }
    }
    break;

    case "UPDATE_HIDE":
    {
      return{
        ...state,
        showHide:action.flag
      }
    }
    break;

  case "CHART_DATA":
  {
      return {
          ...state,
          viewChartDataFlag: action.flag,
          chartDataClassId:action.classId,
        }
  }
  }
  return state
}
