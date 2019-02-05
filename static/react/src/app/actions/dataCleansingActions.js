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
export function outlierRemovalSelectedAction(colName,colType,colSlug, treatment, dispatch){
  return {
		type: "OUTLIER_REMOVAL",
		colName,
    colType,
    colSlug,
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


export function removeDuplicateAttributesAction(duplicate_attribute_removal, yesOrNo, dispatch){
     return {
		type: "REMOVE_DUPLICATE_ATTRIBUTES",
    yesOrNo,
    duplicate_attribute_removal
	}
}

export function removeDuplicateObservationsAction(duplicate_observation_removal, yesOrNo, dispatch){
     return {
		type: "REMOVE_DUPLICATE_OBSERVATIONS",
    yesOrNo,
    duplicate_observation_removal
	}
}

export function dataCleansingDataTypeChange(colSlug, newDataType, dispatch){
    return {
        type: "DATACLEANSING_DATA_TYPE_CHANGE",
        colSlug,
        newDataType
    }
}
