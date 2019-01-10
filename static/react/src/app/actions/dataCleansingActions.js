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
