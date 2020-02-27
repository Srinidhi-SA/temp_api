//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload: "",
  OcrDataList: "",
  OcrProjectList:"",
  imageFlag: false,
  imagePath: "https://madvisor-dev.marlabsai.com/media/ocrData/gen_image.png",
  ocrS3BucketDetails: {},
  s3Uploaded: false,
  s3Loader: false,
  s3FileList:"",
  s3SelFileList:[],
  s3FileFetchErrorFlag:false,
  s3FileUploadErrorFlag:false,
  s3FileFetchSuccessFlag:false,
  s3FileFetchErrorMsg:"",
  ocrFilesSortType: null,
  ocrFilesSortOn: null,
  documentFlag:false,
  filter_status: '',
  filter_confidence: '',
  filter_assignee: '',
  checked_list: '',
  addUserPopupFlag : false,
  createUserFlag : false,
  createUserLoaderFlag : false,
  curUserSlug : "",
  newUserDetails : {},
  newUserProfileDetails : {},
  ocrUserProfileFlag : false,
  allOcrUsers : {},
  selectedOcrUsers : [],
  editOcrUserFlag:false,
  selUserSlug:"",
  selUserDetails:{},
  enableEditingFlag:false,
  editedUserDetails : {},

}, action) {
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
      break;
      case "OCR_PROJECT_LIST":
      {
        return {
          ...state,
          OcrProjectList: action.data
        }
      }
      break;
      case "OCR_PROJECT_LIST_FAIL":
      {
      throw new Error("Unable to fetch projects list!!");
      }
      
      case "OCR_UPLOADS_LIST":
      {
        return {
          ...state,
          OcrDataList: action.data
        }
      }
      break;
    case "OCR_UPLOADS_LIST_FAIL":
    {
      throw new Error("Unable to fetch uploaded images list!!");
    }
    break;
      case "SAVE_DOCUMENT_FLAG":
      {
        return {
          ...state,
          documentFlag: action.flag
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
    case "SAVE_IMAGE_FLAG":
      {
        return {
          ...state,
          imageFlag: action.flag
        }
      }
      break;
    case "SAVE_IMAGE_DETAILS":
      {
        return {
          ...state,
          imagePath: "https://madvisor-dev.marlabsai.com/media/ocrData/gen_image.png"
        }
      }
      break;
    case "OCR_FILES_SORT":
      {
        return {
          ...state,
          ocrFilesSortOn: action.ocrFilesSortOn,
          ocrFilesSortType: action.ocrFilesSortType
        }
      }
      break;
    case "FILTER_BY_STATUS":
      {
        return {
          ...state,
          filter_status: action.status,
        }
      }
      break;
    case "FILTER_BY_CONFIDENCE":
      {
        return {
          ...state,
          filter_confidence: action.confidence,
        }
      }
      break;
    case "FILTER_BY_ASSIGNEE":
      {
        return {
          ...state,
          filter_assignee: action.assignee
        }
      }
      break;

    case "UPDATE_CHECKLIST":
      {
        return {
          ...state,
          checked_list: action.list
        }
      }
      break;
//For Manage Users screen
      case "OPEN_ADD_USER_POPUP": {
        return {
          ...state,
          addUserPopupFlag : true
        }
      }
      break;
      case "CLOSE_ADD_USER_POPUP": {
        return {
          ...state,
          addUserPopupFlag : false
        }
      }
      break;
      case "SET_CREATE_USER_LOADER_FLAG": {
        return {
          ...state,
          createUserLoaderFlag : action.flag
        }
      }
      break;
      case "SAVE_NEW_USER_DETAILS": {
        let curUserDetails = state.newUserDetails;
        curUserDetails[action.name] = action.value
        return {
          ...state,
          newUserDetails : curUserDetails
        }
      }
      break;
      case "SAVE_NEW_USER_PROFILE":{
        let curUserStatus = state.newUserProfileDetails;
        curUserStatus[action.name] = action.value
        return {
          ...state,
          newUserProfileDetails : curUserStatus
        }
      }
      break;
      case "CREATE_NEW_USER_SUCCESS":{
        return {
          ...state,
          createUserFlag : action.flag,
          curUserSlug : action.slug,
        }
      }
      break;
      case "USER_PROFILE_CREATED_SUCCESS":{
        return {
          ...state,
          ocrUserProfileFlag : action.flag,
          createUserFlag : false
        }
      }
      break;
      case "SAVE_ALL_OCR_USERS_LIST":{
        return {
          ...state,
          allOcrUsers : action.json
        }
      }
      break;
      case "SAVE_SELECTED_USERS_LIST":{
        return {
          ...state,
          selectedOcrUsers : action.curSelList
        }
      }
      break;
      case "OPEN_EDIT_USER_POPUP":{
        return{
          ...state,
          editOcrUserFlag : action.flag,
          selUserSlug : action.userSlug,
          selUserDetails : action.userDt,
          editedUserDetails : action.edtDet
        }
      }
      break;
      case "CLOSE_EDIT_USER_POPUP":{
        return{
          ...state,
          editOcrUserFlag : action.flag
        }
      }
      break;
      case "ENABLE_EDITING_USER": {
        return{
          ...state,
          enableEditingFlag : action.flag
        }
      }
      break;
      case "SAVE_EDITED_USER_DETAILS": {
        let curEditedUserStatus = state.editedUserDetails;
        curEditedUserStatus[action.name] = action.val
        return {
          ...state,
          editedUserDetails : curEditedUserStatus
        }
      }
  }
  return state
}