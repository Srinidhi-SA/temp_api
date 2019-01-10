import React from "react";
import {API,STATIC_URL} from "../helpers/env";


export function missingValueTreatmentSelectedAction(colName, treatment, dispatch){
  return {
		type: "MISSING_VALUE_TREATMENT",
		colName,
    treatment
	}
}
