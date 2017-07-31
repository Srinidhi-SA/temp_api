import { combineReducers } from "redux"

import login from "./loginReducers"
import signals from "./signalReducers"

export default combineReducers({
  login,
  signals,
})
