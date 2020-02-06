//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
  ocrFilesSortType:null,
  ocrFilesSortOn:null,
  imageFlag: false
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
case "SAVE_IMAGE_FLAG":
{
return{
  ...state,
  imageFlag:action.flag
}
}
break;
case "OCR_FILES_SORT":
{
    return{
        ...state,
        ocrFilesSortOn:action.ocrFilesSortOn,
        ocrFilesSortType:action.ocrFilesSortType
    }
}
break;
}
return state
}
