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
      }

    }
    return state
}
