
export default function reducer(state = {
  signalList: {},
  signalAnalysis:{},
  selectedSignal:{},
  newSignalShowModal:false,
  signalData:null,
  createSignalLoaderModal:false,
  createSignalLoaderValue:10,
  current_page:1,
  urlPrefix:"signals",
  // variableType:""
}, action) {
  console.log("in SIGNAL reducer!!");
  console.log(action);

  switch (action.type) {
    case "SIGNAL_LIST":
      {
        return {
          ...state,
          signalList: action.signalList,
          current_page:action.current_page,
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
          selectedSignal: action.errandId
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
			newSignalShowModal:true,
		}
	}
	break;

	case "CREATE_SIGNAL_HIDE_MODAL":
	{
		return {
			...state,
			newSignalShowModal:false,
		}
	}
	break;

  case "CREATE_SUCCESS":
  {
    return {
      ...state,
      signalData:action.signalData,
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
      getVarType:action.varType,
    }
  }
  break;
   case "SEL_PREDICTION":
    {
    return {
      ...state,
      selectedPrediction:action.predictionSelected,
    }
  }
  break;
 case "HIDE_CREATE_SIGNAL_LOADER":
	{
		return {
			...state,
			createSignalLoaderModal:false,
		}
	}
	break;
	case "SHOW_CREATE_SIGNAL_LOADER":
	{
		return {
			...state,
			createSignalLoaderModal:true,
		}
	}
	break;
	case "CREATE_SIGNAL_LOADER_VALUE":
	{
		return {
			...state,
			createSignalLoaderValue:action.value,
		}
	}
	break;
	case "SIGNAL_ANALYSIS_EMPTY":
    {
      return {
        ...state,
        signalAnalysis: {},
      }
    }
    break;
    
	 case "ROBO_DATA_ANALYSIS":
     {
       return {
         ...state,
         signalAnalysis: action.roboData.data,
         urlPrefix:action.urlPrefix,
         selectedSignal:action.roboSlug,
       }
     }
     break;
     
  }
  return state
}
