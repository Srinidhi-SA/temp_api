//all the ocr related reducers..
export default function reducer(state = {
  OcrfileUpload: "",
  OcrDataList: "",
  OcrProjectList:"",
  imageFlag: false,
  imagePath: "http://madvisor-dev.marlabsai.com/media/ocrData/img-uw2ii50xd9_generated_image_fGw3pEk.png",
  originalImgPath: "",
  ocrImgPath:"",
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
  iRToggleFlag : true,
  iRassignDocsTo : "",
  iRDocsCount : "",
  iRList : {
    "data": [
      {
        "username": "srtestuser2",
        "first_name": "srTest",
        "last_name": "User2",
        "email": "srtestuser2@gmail.com",
        "date_joined": "2020-03-06T08:16:03.418949Z",
        "last_login": null,
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "srtestuser2-iidyjufsfr",
          "role": [
            4
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": true
      },
      {
        "username": "srtestuser1",
        "first_name": "srTest",
        "last_name": "User1",
        "email": "srtestuser1@gmail.com",
        "date_joined": "2020-03-06T08:14:32.416920Z",
        "last_login": null,
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "srtestuser1-5vp4qfc2uo",
          "role": [
            4
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": true
      },
      {
        "username": "irtestuser2",
        "first_name": "irTest",
        "last_name": "User2",
        "email": "irtestuser2@gmail.com",
        "date_joined": "2020-03-06T08:13:43.752105Z",
        "last_login": null,
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "irtestuser2-la2hr4wkaj",
          "role": [
            3
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": true
      },
      {
        "username": "irtestuser1",
        "first_name": "iRTest",
        "last_name": "user1",
        "email": "irtestuser1@gmail.com",
        "date_joined": "2020-03-06T08:12:59.439691Z",
        "last_login": null,
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "irtestuser1-5c1k5fwj3l",
          "role": [
            3
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": true
      },
      {
        "username": "test1",
        "first_name": "test",
        "last_name": "test1",
        "email": "test1@mail.com",
        "date_joined": "2020-03-06T08:00:16.509065Z",
        "last_login": null,
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "test1-j1tplbcgdq",
          "role": [
            4
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": true
      },
      {
        "username": "Dechamma",
        "first_name": "Dechamma",
        "last_name": "T",
        "email": "dechamma.thimmaiah@marlabs.com",
        "date_joined": "2020-03-04T11:03:51.542492Z",
        "last_login": null,
        "is_superuser": false,
        "ocr_profile": {
          "active": true,
          "slug": "dechamma-bbjrlyw4wf",
          "role": [
            3,
            4,
            5
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": false
      },
      {
        "username": "sejal",
        "first_name": "Sejal",
        "last_name": "S",
        "email": "sejal@gmail.com",
        "date_joined": "2020-03-04T07:24:39.155191Z",
        "last_login": null,
        "is_superuser": false,
        "ocr_profile": {
          "active": false,
          "slug": "sejal-sp7gu4qak8",
          "role": [
            3,
            4
          ],
          "user_type": "Default",
          "phone": ""
        },
        "ocr_user": false
      },
      {
        "username": "dladmin",
        "first_name": "dl",
        "last_name": "admin",
        "email": "admin@mail.com",
        "date_joined": "2020-02-20T10:54:44.044023Z",
        "last_login": "2020-03-02T06:43:42.733517Z",
        "is_superuser": true,
        "ocr_profile": {
          "active": true,
          "slug": "dladmin-nm34s740ml",
          "role": [
            1
          ],
          "user_type": "1",
          "phone": ""
        },
        "ocr_user": true
      }
    ],
    "current_item_count": 10,
    "total_number_of_pages": 1,
    "total_data_count": 10,
    "permission_details": {
      
    },
    "current_page": 1,
    "current_page_size": 10
  },
  selectedIRList : [],
  iRSearchElement : "",
  iRassignRemainingDocsAs : ""

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
          // ocrImagePath: "http://madvisor-dev.marlabsai.com/media/ocrData/img-uw2ii50xd9_generated_image_fGw3pEk.png"
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
          configureTabSelected : action.tabName
        }
      }
      break;
      case "STORE_IR_TOGGLE_FLAG":
      {
        return{
          ...state,
          iRToggleFlag : action.val
        }
      }
      break;
      case "ASSIGN_DOCS_TO":
      {
        return{
          ...state,
          iRassignDocsTo : action.val
        }
      }
      break;
      case "DOCS_COUNT_TO_DISTRIBUTE":
      {
        return{
          ...state,
          iRDocsCount : action.val
        }
      }
      break;
      case "SAVE_SEL_IR_LIST":
      {
        return {
          ...state,
          selectedIRList : action.selIRList
        }
      }
      break;
      case "STORE_IR_SEARCH_ELEMENT":
      {
        return {
          ...state,
          iRSearchElement : action.val
        }
      }
      break;
      case "CLEAR_IR_SEARCH_ELEMENT":
      {
        return {
          ...state,
          iRSearchElement : ""
        }
      }
      break;
      case "ASSIGN_REAMINING_DOCS_AS":
      {
        return {
          ...state,
          iRassignRemainingDocsAs : action.val
        }
      }
      break;
  }
  return state
}
