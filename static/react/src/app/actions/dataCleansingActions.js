import React from "react";
import {API,STATIC_URL} from "../helpers/env";


export function missingValueTreatmentSelectedAction(colSlug, treatment, dispatch){
  return {
		type: "MISSING_VALUE_TREATMENT",
		colSlug,
    treatment
	}
}
export function outlierRemovalSelectedAction(colSlug, treatment, dispatch){
  return {
		type: "OUTLIER_REMOVAL",
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


 export function removeDuplicatesAction(duplicate_removal_name, yesOrNo, dispatch){
  return {
		type: "REMOVE_DUPLICATES",
    yesOrNo,
    duplicate_removal_name
	}
}
