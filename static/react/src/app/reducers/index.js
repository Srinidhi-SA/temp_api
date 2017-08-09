import { combineReducers } from "redux"

import login from "./loginReducers"
import signals from "./signalReducers"
import datasets from "./dataReducers"
import dataupload from "./dataUploadReducers"

export default combineReducers({
  login,
  signals,
  datasets,
  dataupload,
})
