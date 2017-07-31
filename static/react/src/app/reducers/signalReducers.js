export default function reducer(state={
    signalList:{}
  }, action) {
    console.log("in SIGNAL reducer!!");
    console.log(action);

    switch (action.type) {
      case "SIGNAL_LIST": {
        return {...state,
                signalList:action.signalList
              }
      }break;

      case "SIGNAL_LIST_ERROR":
    { alert(action.json.non_field_errors);
      throw new Error("Unable to fetch signal list!!");
    }break;

    }
    return state
}
