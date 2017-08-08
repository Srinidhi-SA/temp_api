import { combineReducers } from "redux"

import login from "./loginReducers"
import signals from "./signalReducers"
import datasets from "./dataReducers"

export default combineReducers({
  login,
  signals,
  datasets,
})
