import { combineReducers } from "redux"

import login from "./loginReducers"
import signals from "./signalReducers"
import data from "./dataReducers"

export default combineReducers({
  login,
  signals,
  data,
})
