//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload:"",
  OcrDataList:"",
  imageFlag: false,
  ocrS3BucketDetails: {},
  s3Uploaded: false,
  s3Loader: false,
  s3FileList:"",
  s3SelFileList:[],
  s3FileFetchErrorFlag:false,
  s3FileUploadErrorFlag:false,
  s3FileFetchSuccessFlag:false,
  s3FileFetchErrorMsg:"",

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
        s3FileList : action.fileList,
        s3FileFetchErrorFlag : false,
        s3FileFetchSuccessFlag : true,
        s3Loader : false
      }
    }
    break;
    case "CLEAR_S3_DATA": {
      return {
        ...state,
        s3FileList : "",
        s3SelFileList: [],
        s3Loader: false,
        s3Uploaded: false,
        s3FileFetchErrorFlag : false,
        s3FileFetchSuccessFlag : false
      }
    }
    break;
    case "SAVE_SEL_S3_FILES": {
      return {
        ...state,
        s3SelFileList : action.fileName
      }
    }
    break;
    case "S3_FILE_ERROR_MSG": {
      return {
        ...state,
        s3FileFetchErrorFlag : action.flag,
        s3Loader : false,
      }
    }
    break;
    case "S3_FETCH_ERROR_MSG": {
      return {
        ...state,
        s3FileFetchErrorMsg : action.msg
      }
    }
    break;
    case "S3_FILE_UPLOAD_ERROR_MSG": {
      return {
        ...state,
        s3Loader : false,
        s3FileUploadErrorFlag : true,
      }
    }
    break;
    case "SET_S3_UPLOADED": {
      return {
        ...state,
        s3Uploaded : action.flag,
        s3FileList: "",
        s3SelFileList:[]
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
