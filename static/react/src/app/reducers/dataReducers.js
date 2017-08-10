export default function reducer(state={
    dataPreview:null
  }, action) {
    console.log("in reducer!!");
    console.log(action);

    switch (action.type) {
      case "DATA_PREVIEW": {
        return {...state,
                dataPreview:action.dataPreview
              }
      }break;

      case "DATA_PREVIEW_ERROR":
    { console.log(action.json);
      alert("Fetching of Data failed!!");
      throw new Error("Fetching of Data failed!!");
    }break;

    }
    return state
}
