export default function reducer(state = {
 dataUploadShowModal:false,
}, action) {
  console.log("In DATA UPLOAD reducer!!");
  console.log(action);

  switch (action.type) {
  case "SHOW_MODAL":
  {
    return {
      ...state,
      dataUploadShowModal:true,
    }
  }
  break;
  
  case "HIDE_MODAL":
      {
        return {
          ...state,
          dataUploadShowModal:false,
        }
      }
      break;
  }
  return state
}
