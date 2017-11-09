import {applyMiddleware, createStore} from "redux"

import logger from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import reducer from "./reducers"
import {cookieObj} from './helpers/cookiesHandler';
import {redirectToLogin} from './helpers/helper';
//error handling for action
const err = (store) => (next) => (action) => {
  try {
    next(action);
  } catch (e) {
    console.log("Error", e);
    let expiredSignMsg = "Signature has expired."
    if (action.json["exception"] == expiredSignMsg) {
      bootbox.alert("Session has expired.",function(){
    	  sessionStorage.clear();
    	  cookieObj.clearCookies();
    	  window.history.replaceState(null,null,"/login");
      })
      
    }else{
    	bootbox.alert(e.message)
    }
  }
}

const middleware = applyMiddleware(promise(), thunk, logger, err)
//const middleware = applyMiddleware(promise(), thunk)

const store = createStore(reducer, middleware)

store.subscribe(() => {
  console.log("store updated", store.getState());
});

export default store;
