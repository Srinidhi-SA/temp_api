//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload: "",
  OcrDataList: "",
  OcrProjectList:"",
  imageFlag: false,
  originalImgPath: "",
  ocrImgPath:"",
  imageSlug:"",
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
  loaderFlag : false,
  curUserSlug : "",
  newUserDetails : {},
  newUserProfileDetails : {},
  ocrUserProfileFlag : false,
  allOcrUsers : {},
  ocrReviwersList : [],
  selectedOcrUsers : [],
  isAllCheckedFlag : false,
  editOcrUserFlag:false,
  selUserSlug:"",
  selUserDetails:{},
  enableEditingFlag:false,
  editedUserDetails : {},
  userTableLoaderFlag : false,
  editUserSuccessFlag : false,
  roleFormSel : false,
  detailsFormSel : false,
  selectedTabId : "none",
  ocrSearchElement : "",
  ocrUserPageNum : 1,
  search_document:'',
  search_project:'',
  selected_project_slug:'',
  selected_project_name:'',

  configureTabSelected : "initialReview",
  iRLoaderFlag : false,
  iRToggleFlag : true,
  iRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedIRList":[],"test":""},
  iRList : {},
  iRSearchElem : "",
  sRLoaderFlag : false,
  sRToggleFlag : true,
  sRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedSRList":[],"test":""},
  sRList : {},
  sRSearchElem : ""

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
          originalImgPath: action.data.imagefile ,
          ocrImgPath: action.data.generated_image,
          imageSlug: action.data.slug,
          // ocrImagePath: "http://madvisor-dev.marlabsai.com/media/ocrData/img-uw2ii50xd9_generated_image_fGw3pEk.png"
        }
      }
      break;
      case "UPDATE_OCR_IMAGE":
        {
          return {
            ...state,
            ocrImgPath: action.data,
            originalImgPath: action.data,
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
          addUserPopupFlag : false,
          newUserDetails : {},
          newUserProfileDetails : {},
          ocrUserProfileFlag : false,
          loaderFlag : false,
          createUserFlag : false,
          curUserSlug : "",
        }
      }
      break;
      case "SET_CREATE_USER_LOADER_FLAG": {
        return {
          ...state,
          loaderFlag : action.flag
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
          allOcrUsers : action.json,
          selectedOcrUsers : [],
          isAllCheckedFlag : false
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
      case "SELECT_ALL_USERS":{
        return {
          ...state,
          isAllCheckedFlag : action.flag
        }
      }
      break;
      case "SAVE_REVIEWERS_LIST":{
        return {
          ...state,
          ocrReviwersList : action.json
        }
      }
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
          editOcrUserFlag : action.flag,
          selUserSlug : "",
          selUserDetails : {},
          editedUserDetails : {},
          detailsFormSel : false,
          roleFormSel : false,
          editUserSuccessFlag : false,
          loaderFlag : false,
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
      break;
      case "CLEAR_USER_FLAG":
      {
        return{
          ...state,
          selectedOcrUsers : [],
        }
      }
      break;
      case "SET_USER_TABLE_LOADER_FLAG":{
        return {
          ...state,
          userTableLoaderFlag : action.flag
        }
      }
      break;
      case "EDIT_USER_SUCCESS":{
        return {
          ...state,
          editUserSuccessFlag : action.flag,
        }
      }
      break;
      case "FORM_DETAILS_SELECTED":{
        return {
          ...state,
        detailsFormSel : action.flag
        }
      }
      break;
      case "FORM_ROLES_SELECTED":{
        return {
          ...state,
        roleFormSel : action.flag
        }
      }
      break;
      case "SELECTED_TAB_ID":{
        return {
          ...state,
          selectedTabId : action.id
        }
      }
      break;
      case "OCR_USER_SEARCH_ELEMENT":{
        return {
          ...state,
          ocrSearchElement : action.val
        }
      }
      break;
      case "OCR_USER_PAGE_NUM":{
        return {
          ...state,
          ocrUserPageNum : action.val
        }
      }
      case "CLEAR_USER_SEARCH_ELEMENT":{
        return {
          ...state,
          ocrSearchElement : ""
        }
      }
      break;
      case "SEARCH_OCR_DOCUMENT":
      {
        return {
          ...state,
          search_document:action.elem
        }
      }
      break;
      case "SEARCH_OCR_PROJECT":
      {
        return {
          ...state,
          search_project:action.elem
        }
      }
      break;
      case "SELECTED_PROJECT_SLUG":
      {
        return {
          ...state,
          selected_project_slug:action.slug,
          selected_project_name:action.name

        }
      }
      break;

    //Configure Tab
    case "SAVE_SEL_CONFIGURE_TAB":
      {
        return {
          ...state,
          configureTabSelected : action.selTab
        }
      }
      break;
      case "SET_IR_LOADER_FLAG":
      {
        return {
          ...state,
          iRLoaderFlag : action.flag
        }
      }
      break;
      case "SAVE_IR_LIST":
      {
        return {
          ...state,
          iRList : action.data.allUsersList
        }
      }
      break;
      case "STORE_IR_TOGGLE_FLAG":
      {
        return{
          ...state,
          iRToggleFlag : action.val,
          iRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedIRList":[],"test":""},
        }
      }
      break;
      case "SAVE_IR_DATA":{
        let curIRDetails = state.iRConfigureDetails
        curIRDetails[action.name] = action.value
        return{
          ...state,
          iRConfigureDetails : curIRDetails
        }
      }
      break;
      case "STORE_IR_SEARCH_ELEMENT" :
      {
        return {
          ...state,
          iRSearchElem : action.val
        }
      }
      break;
      case "SET_SR_LOADER_FLAG":
      {
        return {
          ...state,
          sRLoaderFlag : action.flag
        }
      }
      break;
      case "SAVE_SR_LIST":
      {
        return {
          ...state,
          sRList : action.data.allUsersList
        }
      }
      break;
      case "STORE_SR_TOGGLE_FLAG":
      {
        return{
          ...state,
          sRToggleFlag : action.val,
          sRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedSRList":[],"test":""},
        }
      }
      break;
      case "STORE_SR_SEARCH_ELEMENT" :
      {
        return {
          ...state,
          sRSearchElem : action.val
        }
      }
      break;
      case "SAVE_SR_DATA":{
        let curSRDetails = state.sRConfigureDetails
        curSRDetails[action.name] = action.value
        return{
          ...state,
          sRConfigureDetails : curSRDetails
        }
      }
      break;
      case "CLEAR_REVIEWER_CONFIG":
      {
        return {
          ...state,
          iRToggleFlag : true,
          iRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedIRList":[],"test":""},
          sRToggleFlag : true,
          sRConfigureDetails : {"active":"","max_docs_per_reviewer":"","selectedSRList":[],"test":""},
          iRSearchElem : "",
          sRSearchElem : ""
        }
      }
      break;
  }
  return state
}
