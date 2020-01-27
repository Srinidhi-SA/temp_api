//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
},action) {
switch (action.type) {
case "OCR_UPLOAD_FILE":
{
  return {
    ...state,
    OcrfileUpload:action.files,
  }
}
break;
case "CLEAR_OCR_UPLOAD_FILES":
{
  return {
    ...state,
    OcrfileUpload:{},
  }
}

case "OCR_UPLOADS_LIST":
{
return{
  ...state,
  OcrDataList:action.data
}
}
break;
}
return state
}
