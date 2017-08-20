import { combineReducers } from "redux"

import login from "./loginReducers"
import signals from "./signalReducers"

import datasets from "./dataReducers"
import dataUpload from "./dataUploadReducers"
import dataSource from "./dataSourceReducers"
import apps from "./appReducers"
import chartObject from "./chartReducers"

export default combineReducers({
  login,
  signals,
  datasets,
  dataUpload,
  dataSource,
  apps,
  chartObject,

})
