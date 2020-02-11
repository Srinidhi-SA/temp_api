//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
  imageFlag: false,
  ocrS3BucketDetails: {},
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
    case "SAVE_S3_BUCKET_DETAILS": {
      let curS3Bucket = state.ocrS3BucketDetails;
      curS3Bucket[action.name]= action.val
      return {
        ...state,
        ocrS3BucketDetails : curS3Bucket
      }
    }
    break;
    case "SAVE_S3_FILE_LIST": {
      return {
        ...state,
        s3FileList : action.data
      }
    }
    break;
    case "S3_FILE_ERROR_MSG": {
      return {
        ...state,
        s3FileFetchErrorMsg : action.errMsg
      }
    }
    break;
  }
  return state
}
