import { combineReducers } from "redux"

import tweets from "./tweetsReducer"
import user from "./userReducer"
import login from "./loginReducers"
import signals from "./signalReducers"

export default combineReducers({
  tweets,
  user,
  login,
  signals,
})
