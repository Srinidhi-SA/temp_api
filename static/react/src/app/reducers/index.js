import { combineReducers } from "redux"

import tweets from "./tweetsReducer"
import user from "./userReducer"
import login from "./loginReducers"

export default combineReducers({
  tweets,
  user,
  login,
})
