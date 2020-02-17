//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
  imageFlag: false,
  imagePath:""
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
case "SAVE_IMAGE_DETAILS":
{
return{
  ...state,
  imagePath:"https://madvisor-dev.marlabsai.com/media/ocrData/gen_image.png"
}
}
break;
}
return state
}
