//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
  imageFlag: false,
  ocrS3BucketDetails: {},
  s3Uploaded: false,
  s3Loader: false,
  s3FileList:"",
  s3FileFetchErrorFlag:false,
  s3SelFileList:[]

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
        s3FileList : action.data.file_list,
        s3FileFetchSuccessFlag : true
      }
    }
    break;
    case "SAVE_SEL_S3_FILE_LIST": {
      let curSelFiles = [];
      curSelFiles.push(action.fileName)
      return {
        ...state,
        s3SelFileList : curSelFiles[0]
      }
    }
    break;
    case "S3_FILE_ERROR_MSG": {
      return {
        ...state,
        s3FileFetchErrorFlag : action.errMsgFlag,
        s3Loader : false,
      //Below Line To Success
        s3FileFetchSuccessFlag : true
      }
    }
    break;
    case "SET_S3_UPLOADED": {
      return {
        ...state,
        s3Uploaded : action.flag
      }
    }
    break;
    case "SET_S3_LOADER": {
      return {
        ...state,
        s3Loader : action.flag
      }
    }
    break;
  }
  return state
}
