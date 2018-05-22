const default_updatedSubSetting = {
  "measureColumnFilters": [],
  "dimensionColumnFilters": [],
  "timeDimensionColumnFilters": []
}
export default function reducer(state = {
  dataList: {},
  selectedDataSet: "",
  current_page: 1,
  dataPreview: null,
  allDataSets: {},
  dataPreviewFlag: false,
  selectedAnalysis: [],
  selectedVariablesCount: 0,
  signalMeta: {},
  curUrl: "",
  dataUploadLoaderModal: false,
  dULoaderValue: -1,
  data_search_element: "",
  dataSetMeasures: [],
  dataSetDimensions: [],
  dataSetTimeDimensions: [],
  CopyOfMeasures: [],
  CopyOfDimension: [],
  CopyTimeDimension: [],
  measureAllChecked: true,
  measureChecked: [],
  dimensionAllChecked: true,
  dimensionChecked: [],
  dateTimeChecked: [],
  dataLoaderText: "Preparing data for loading",
  dataSetAnalysisList: {},
  dataSetPrevAnalysisList:{},
  selectedDimensionSubLevels: null,
 // selectedTrendSub: [],
  dimensionSubLevel: [],
  updatedSubSetting: default_updatedSubSetting,
  subsettingDone: false,
  subsettedSlug: "",
  loading_message:[],
  dataTransformSettings:[],
  variableTypeListModal:false,
  selectedColSlug:"",
  data_sorton:"",
  data_sorttype:"",
  dataSetColumnRemoveValues:[],
  dataSetColumnReplaceValues:[],
  dataSetSelectAllAnalysis:false,
  isUpdate:false,
  latestDatasets:{},
  advancedAnalysisAssociation:true,
  advancedAnalysisInfluencer:true,
  advancedAnalysisPrediction:true,
  advancedAnalysisPerformance:true,

}, action) {
  console.log("In DATA reducer!!");
  console.log(action);

  switch (action.type) {
    case "DATA_LIST":
      {
        return {
          ...state,
          dataList: action.data,
          latestDatasets:action.latestDatasets,
          current_page: action.current_page
        }
      }
      break;

    case "DATA_LIST_ERROR":
      {
        throw new Error("Unable to fetch data list!!");
      }
      break;
    case "DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreview: action.dataPreview,
          dataPreviewFlag: true,
          selectedDataSet: action.slug,
          subsettedSlug: "",
          subsettingDone: false,
          dataTransformSettings:action.dataPreview.meta_data.uiMetaData.transformation_settings.existingColumns,
        }
      }
      break;
    case "DATA_PREVIEW_FOR_LOADER":
      {
        return {
          ...state,
          dataPreview: action.dataPreview,
          selectedDataSet: action.slug

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
          selectedDataSet: action.slug
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
        return {
          ...state,
          selectedAnalysis: state.selectedAnalysis.concat(action.selectedAnalysis)
        }
      }
      break;
    case "UNSELECT_ANALYSIS_TYPE":
      {
        return {
          ...state,
          selectedAnalysis: state.selectedAnalysis.filter(item => action.selectedAnalysis !== item)
        }
      }
      break;

    case "UNSELECT_All_ANALYSIS_TYPE":
      {
        return {
          ...state,
          selectedAnalysis: action.unselectAll
        }
      }
      break;

    case "SHOW_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: true
        }
      }
      break;
    case "HIDE_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: false
        }
      }
      break;

    case "STORE_SIGNAL_META":
      {
        return {
          ...state,
          signalMeta: action.signalMeta,
          curUrl: action.curUrl
        }
      }
      break;
    case "SELECTED_DATASET":
      {
        return {
          ...state,
          selectedDataSet: action.dataset
        }
      }
      break;
    case "RESET_VARIABLES":
      {
        return {
          ...state,
          dataSetMeasures: [],
          dataSetDimensions: [],
          dataSetTimeDimensions: [],
          CopyOfMeasures: [],
          CopyOfDimension: [],
          CopyTimeDimension: [],
          measureAllChecked:action.selectChk,
          dimensionAllChecked:action.selectChk,


        }
      }
      break;

    case "SHOW_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: true
        }
      }
      break;
    case "DATA_UPLOAD_LOADER":
      {
        return {
          ...state,
          dataUploadLoaderModal: true
        }
      }
      break;
    case "HIDE_DATA_UPLOAD_LOADER":
      {
        return {
          ...state,
          dataUploadLoaderModal: false
        }
      }
      break;
    case "DATA_UPLOAD_LOADER_VALUE":
      {
        return {
          ...state,
          dULoaderValue: action.value
        }
      }
      break;
    case "CLEAR_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreview: {},
          dataPreviewFlag: false,
          selectedDataSet: "",
          dataLoaderText:"Preparing data for loading",
          dULoaderValue: -1,
          loading_message:[]
        }
      }
      break;
    case "SEARCH_DATA":
      {
        return {
          ...state,
          data_search_element: action.search_element
        }
      }
      break;
    case "DATASET_VARIABLES":
      {
        return {
          ...state,
          dataSetMeasures: action.measures,
          dataSetDimensions: action.dimensions,
          dataSetTimeDimensions: action.timeDimensions,
          CopyOfMeasures: action.measures,
          CopyOfDimension: action.dimensions,
          CopyTimeDimension: action.timeDimensions,
          dataSetAnalysisList: action.possibleAnalysisList,
          dataSetPrevAnalysisList:action.prevAnalysisList,
          selectedVariablesCount:action.count,
          isUpdate:action.flag
        }
      }
      break;
    case "IS_VARIABLE_SELECTION_UPDATE":
    {
      return {
        ...state,
        isUpdate:action.flag
      }
    }
    break;
    case "SEARCH_MEASURE":
      {
        return {
          ...state,
          dataSetMeasures: state.CopyOfMeasures.filter((item) => item.name.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;
    case "SORT_MEASURE":
      {
        return {
          ...state,
          dataSetMeasures: action.measures,
          CopyOfMeasures: action.measures,
          //measureChecked: action.checkBoxList
        }
      }
      break;

    case "SORT_DIMENSION":
      {
        return {
          ...state,
          dataSetDimensions: action.dimensions,
          CopyOfDimension: action.dimensions,
         // dimensionChecked: action.checkBoxList1
        }
      }
      break;

    case "SORT_TIMEDIMENSION":
      {
        return {
          ...state,
          dataSetTimeDimensions: action.timedimensions,
          CopyTimeDimension: action.timedimensions,
         // dateTimeChecked: action.checkBoxList2
        }
      }
      break;

    case "SEARCH_DIMENSION":
      {
        return {
          ...state,
          dataSetDimensions: state.CopyOfDimension.filter((item) => item.name.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;

    case "SEARCH_TIMEDIMENSION":
      {
        return {
          ...state,
          dataSetTimeDimensions: state.CopyTimeDimension.filter((item) => item.name.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;

    case "UPADTE_VARIABLES_LIST":
    {
        return {
            ...state,
            dataSetMeasures: action.measures,
            dataSetDimensions: action.dimensions,
            dataSetTimeDimensions: action.timeDimensions,
            dimensionAllChecked: action.dimFlag,
            measureAllChecked: action.meaFlag,
            selectedVariablesCount:action.count,
            CopyOfMeasures: action.measures,
            CopyOfDimension: action.dimensions,
            CopyTimeDimension: action.timeDimensions,

        }
    }
        break;
    case "UPDATE_SELECTED_VARIABLES":
    {
        return {
            ...state,
            selectedMeasures: action.selectedMeasures,
            selectedDimensions:action.selectedDimensions,
        }
    }
    break;
    case "UPDATE_ANALYSIS_LIST":
      {
        return {
          ...state,
          dataSetAnalysisList: action.renderList,
          dataSetPrevAnalysisList:action.prevAnalysisList,
        }
      }
      break;
    case "SAVE_UPDATE_ANALYSIS_LIST":
    {
      return {
        ...state,
        dataSetPrevAnalysisList:action.savedAnalysisList,
      }
    }
    break;
    case "CANCEL_UPDATE_ANALYSIS_LIST":
    {
      return {
        ...state,
        dataSetAnalysisList:action.prevAnalysisList,
      }
    }
    break;
    case "SELECTED_DIMENSION_SUBLEVELS":
      {
        return {
          ...state,
          selectedDimensionSubLevels: action.SubLevels
        }
      }
      break;
    case "UNSELECTED_TREND_SUB_LIST":
      {
        return {
          ...state,
          selectedTrendSub: state.selectedTrendSub.filter(item => action.selectedTrendSub !== item)
        }
      }
      break;

    case "SELECTED_DIMENSION_SUB_LEVEL":
      {
        return {
          ...state,
          dimensionSubLevel: action.dimensionSubLevel
        }
      }
      break;
    case "UPDATE_SUBSETTING":
      {
        return {
          ...state,
          updatedSubSetting: action.updatedSubSetting,
          subsettingDone: true
        }
      }
      break;
    case "SUBSETTED_DATASET":
      {
        return {
          ...state,
          subsettedSlug: action.subsetRs.slug,
          updatedSubSetting: {
            "measureColumnFilters": [],
            "dimensionColumnFilters": [],
            "timeDimensionColumnFilters": []
          },
          subsettingDone: false,
          selectedDataSet: action.subsetRs.slug

        }
      }
      break;
    case "DATA_UPLOAD_LOADER_MSG":
    {
      return{
        ...state,
        dataLoaderText: action.message
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
        dULoaderValue:-1,
        dataLoaderText:"Preparing data for loading"
      }
    }
    break;
    case "UPDATE_DATA_TRANSFORM_SETTINGS":
    {
    	return{
    		...state,
    		dataTransformSettings:action.transformSettings
    	}
    }
    break;
    case "UPDATE_VARIABLES_TYPES_MODAL":
    {
         return{
        	 ...state,
        	 variableTypeListModal:action.flag,
         }
    }
    break;
    case "DATASET_SELECTED_COLUMN_SLUG":
    {
    	 return{
        	 ...state,
        	 selectedColSlug:action.slug,
         }
    }
    break;
    case "SORT_DATA":{
    	return{
    		...state,
    		data_sorton:action.sorton,
    		data_sorttype:action.sorttype
    	}
    }
    break;

    case "DATA_VALIDATION_PREVIEW":
    {
      return {
        ...state,
        dataPreview: action.dataPreview,
        subsettedSlug: "",
        subsettingDone: action.isSubsetting,
        dataTransformSettings:action.dataPreview.meta_data.uiMetaData.transformation_settings.existingColumns,
      }
    }
    break;
    case "DATA_VALIDATION_REMOVE_VALUES":
    {
      return {
        ...state,
        dataSetColumnRemoveValues:action.removeValues,
      }
    }
    break;
    case "DATA_VALIDATION_REPLACE_VALUES":
    {
      return {
        ...state,
        dataSetColumnReplaceValues:action.replaceValues,
      }
    }
    break;
    case "DATA_SET_SELECT_ALL_ANALYSIS":
    {
      return {
        ...state,
        dataSetSelectAllAnalysis:action.flag,
      }
    }
    break;
    case "UPDATE_VARIABLES_COUNT":
    {
      return {
        ...state,
        selectedVariablesCount:action.count,
      }
    }
    break;
    case "MAKE_ALL_TRUE_OR_FALSE":
    {
      return{
        ...state,
        measureAllChecked:action.value,
        dimensionAllChecked:action.value
      }
    }
    break;
    case "UPDATE_ANALYSIS_LIST_SELECT_ALL":
      {
        return {
          ...state,
          dataSetAnalysisList: action.renderList,
          dataSetPrevAnalysisList:action.renderList,
          dataSetSelectAllAnalysis:action.flag,
        }
      }
      break;
      case "ADVANCE_ANALYSIS_ASSOCIATION":
      {
        return {
          ...state,
          advancedAnalysisAssociation: action.disble,
        }
      }
      break;
      case "ADVANCE_ANALYSIS_PREDICTION":
      {
        return {
          ...state,
          advancedAnalysisPrediction: action.disble,
        }
      }
      break;
      case "ADVANCE_ANALYSIS_PERFORMANCE":
      {
        return {
          ...state,
          advancedAnalysisPerformance: action.disble,
        }
      }
      break;
      case "ADVANCE_ANALYSIS_INFLUENCER":
      {
        return {
          ...state,
          advancedAnalysisInfluencer: action.disble,
        }
      }
      break;
      case "RESET_SUBSETTED_DATASET":
      {
        return {
          ...state,
          subsettedSlug: action.slug,
          updatedSubSetting: {
            "measureColumnFilters": [],
            "dimensionColumnFilters": [],
            "timeDimensionColumnFilters": []
          },
          subsettingDone: false,
          selectedDataSet: action.slug

        }
      }
      break;
  }
  return state

}
