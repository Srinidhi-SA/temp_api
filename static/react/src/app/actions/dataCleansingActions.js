import React from "react";
import {API,STATIC_URL} from "../helpers/env";


export function missingValueTreatmentSelectedAction(colName,colType,colSlug, treatment, dispatch){
  return {
		type: "MISSING_VALUE_TREATMENT",
		colName,
    colType,
    colSlug,
    treatment
	}
}
export function outlierRemovalSelectedAction(colName,colType,colslug, treatment, dispatch){
  return {
		type: "OUTLIER_REMOVAL",
		colName,
    colType,
    colslug,
    treatment
	}
}
export function variableSelectedAction(colSlug, selecteOrNot, dispatch){
  return {
		type: "VARIABLE_SELECTED",
		colSlug,
    selecteOrNot
	}
}


export function removeDuplicateAttributesAction(duplicate_removal_name, yesOrNo, dispatch){
     return {
		type: "REMOVE_DUPLICATE_ATTRIBUTES",
    yesOrNo,
    duplicate_removal_name
	}
}

export function removeDuplicateObservationsAction(duplicate_removal_name, yesOrNo, dispatch){
     return {
		type: "REMOVE_DUPLICATE_OBSERVATIONS",
    yesOrNo,
    duplicate_removal_name
	}
}

export function dataCleansingDataTypeChange(colSlug, newDataType, dispatch){
    return {
        type: "DATACLEANSING_DATA_TYPE_CHANGE",
        colSlug,
        newDataType
    }
}
