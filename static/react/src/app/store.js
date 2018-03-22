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
    let expiredSignMsg = "Signature has expired.";
    if(action.json == undefined){
        bootbox.alert("Something went wrong.Please try again.",function(){
            window.location.assign("/signals")
        })
    }
    else if (action.json["exception"] == expiredSignMsg) {
        sessionStorage.clear();
        cookieObj.clearCookies();
        location.reload();

    }else if (action.json["exception"].indexOf("Permission")!=-1) {
    //  bootbox.alert("permission Denied: "+action.json["exception"]+"!")
    }
    else{
    	//bootbox.alert(e.message)
        sessionStorage.clear();
        cookieObj.clearCookies();
        location.reload();
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
