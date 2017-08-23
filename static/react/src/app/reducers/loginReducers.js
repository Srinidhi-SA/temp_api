export default function reducer(state={
    login_response:{}
  }, action) {
    console.log("in reducer!!");
    console.log(action);

    switch (action.type) {
      case "AUTHENTICATE_USER": {
        return {...state,
                login_response:action.payload
              }
      }break;

      case "ERROR":
    { 
//    	  alert(action.json.non_field_errors);
      throw new Error("Authentication Failed!!");
    }break;

    }
    return state
}
