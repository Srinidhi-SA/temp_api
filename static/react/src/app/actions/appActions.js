
import {API,EMR} from "../helpers/env";
import {PERPAGE,isEmpty,getUserDetailsOrRestart,APPSPERPAGE} from "../helpers/helper";
import store from "../store";
import {APPSLOADERPERVALUE,LOADERMAXPERVALUE,DEFAULTINTERVAL,APPSDEFAULTINTERVAL,CUSTOMERDATA,HISTORIALDATA,EXTERNALDATA,DELETEMODEL,
    RENAMEMODEL,DELETESCORE,RENAMESCORE,DELETEINSIGHT,RENAMEINSIGHT,SUCCESS,FAILED,DELETEAUDIO,RENAMEAUDIO} from "../helpers/helper";
    import {hideDataPreview,getStockDataSetPreview,showDataPreview,getDataSetPreview} from "./dataActions";
    import {getHeaderWithoutContent} from "./dataUploadActions";
    import Dialog from 'react-bootstrap-dialog';
    import React from "react";
    import { showLoading, hideLoading } from 'react-redux-loading-bar';
    import {createcustomAnalysisDetails} from './signalActions';
    
    export var appsInterval = null;
    
    function getHeader(token){
        return {
            'Authorization': token,
            'Content-Type': 'application/json'
        };
    }
    
    export function openModelPopup() {
        return {
            type: "APPS_MODEL_SHOW_POPUP",
        }
    }
    
    export function closeModelPopup() {
        return {
            type: "APPS_MODEL_HIDE_POPUP",
        }
    }
    
    export function getAppsModelList(pageNo) {
        return (dispatch) => {
            return fetchModelList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(fetchModelListSuccess(json))
                }
                else{
                    dispatch(fetchModelListError(json))
                }
            })
        }
    }
    
    function fetchModelList(pageNo,token) {
        let search_element = store.getState().apps.model_search_element;
        let apps_model_sorton =  store.getState().apps.apps_model_sorton;
        let apps_model_sorttype = store.getState().apps.apps_model_sorttype;
        if(apps_model_sorttype=='asc')
            apps_model_sorttype = ""
                else if(apps_model_sorttype=='desc')
                    apps_model_sorttype="-"
                        
                        if(search_element!=""&&search_element!=null){
                            console.log("calling for model search element!!")
                            return fetch(API+'/api/trainer/?app_id='+store.getState().apps.currentAppId+'&name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else if((apps_model_sorton!=""&& apps_model_sorton!=null) && (apps_model_sorttype!=null)){
                            return fetch(API+'/api/trainer/?app_id='+store.getState().apps.currentAppId+'&sorted_by='+apps_model_sorton+'&ordering='+apps_model_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else{
                            return fetch(API+'/api/trainer/?app_id='+store.getState().apps.currentAppId+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }
        
        
    }
    
    function fetchModelListError(json) {
        return {
            type: "MODEL_LIST_ERROR",
            json
        }
    }
    export function fetchModelListSuccess(doc){
        var data = doc;
        var current_page =  doc.current_page
        return {
            type: "MODEL_LIST",
            data,
            current_page,
        }
    }
    export function updateTrainAndTest(trainValue) {
        //var trainValue = e.target.value;
        var testValue = 100-trainValue;
        return {
            type: "UPDATE_MODEL_RANGE",
            trainValue,
            testValue,
        }
    }
    
    export function createModel(modelName,targetVariable) {
        console.log(modelName);
        console.log(targetVariable);
        return (dispatch) => {
            dispatch(openAppsLoader(APPSLOADERPERVALUE,"Please wait while mAdvisor is creating model... "));
            return triggerCreateModel(getUserDetailsOrRestart.get().userToken,modelName,targetVariable).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(createModelSuccess(json,dispatch))
                }
                else{
                    dispatch(closeAppsLoaderValue());
                    dispatch(updateModelSummaryFlag(false));
                    dispatch(createModelError(json))
                }
            })
        }
    }
    
    function triggerCreateModel(token,modelName,targetVariable) {
        var datasetSlug = store.getState().datasets.dataPreview.slug;
        var app_id=store.getState().apps.currentAppId;
        var customDetails = createcustomAnalysisDetails();

        var details = {"measures":store.getState().datasets.selectedMeasures,
                "dimension":store.getState().datasets.selectedDimensions,
                "timeDimension":store.getState().datasets.selectedTimeDimensions,
                "trainValue":store.getState().apps.trainValue,
                "testValue":store.getState().apps.testValue,
                "analysisVariable":targetVariable,
                'customAnalysisDetails':customDetails["customAnalysisDetails"],
                 'polarity':customDetails["polarity"],
                 'uidColumn':customDetails["uidColumn"]}
        return fetch(API+'/api/trainer/',{
            method: 'post',
            headers: getHeader(token),
            body:JSON.stringify({
                "name":modelName,
                "dataset":datasetSlug,
                "app_id":app_id,
                "config":details
            }),
        }).then( response => Promise.all([response, response.json()]));
    }
    function createModelSuccess(data,dispatch){
        var slug = data.slug;
        appsInterval = setInterval(function(){
            if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }
            dispatch(getAppsModelSummary(data.slug));
            return {
                type: "CREATE_MODEL_SUCCESS",
                slug,
            }
        },APPSDEFAULTINTERVAL);
        return {
            type: "CREATE_MODEL_SUCCESS",
            slug,
        }
    }
    export function getAppsScoreList(pageNo) {
        return (dispatch) => {
            return fetchScoreList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(fetchScoreListSuccess(json));
                }
                else{
                    dispatch(fetchScoreListError(json))
                }
            })
        }
    }
    
    function fetchScoreList(pageNo,token) {
        let search_element = store.getState().apps.score_search_element;
        let apps_score_sorton =  store.getState().apps.apps_score_sorton;
        let apps_score_sorttype = store.getState().apps.apps_score_sorttype;
        if(apps_score_sorttype=='asc')
            apps_score_sorttype = ""
                else if(apps_score_sorttype=='desc')
                    apps_score_sorttype="-"
                        
                        if(search_element!=""&&search_element!=null){
                            console.log("calling for score search element!!")
                            return fetch(API+'/api/score/?app_id='+store.getState().apps.currentAppId+'&name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else if((apps_score_sorton!=""&& apps_score_sorton!=null) && (apps_score_sorttype!=null)){
                            return fetch(API+'/api/score/?app_id='+store.getState().apps.currentAppId+'&sorted_by='+apps_score_sorton+'&ordering='+apps_score_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else{
                            return fetch(API+'/api/score/?app_id='+store.getState().apps.currentAppId+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }
        
        
    }
    
    function fetchScoreListError(json) {
        return {
            type: "SCORE_LIST_ERROR",
            json
        }
    }
    export function fetchScoreListSuccess(doc){
        var data = doc;
        var current_page =  doc.current_page
        return {
            type: "SCORE_LIST",
            data,
            current_page,
        }
    }
    
    export function showCreateScorePopup() {
        return {
            type: "APPS_SCORE_SHOW_POPUP",
        }
    }
    
    export function hideCreateScorePopup() {
        return {
            type: "APPS_SCORE_HIDE_POPUP",
        }
    }
    
    export function getAppsModelSummary(slug) {
        return (dispatch) => {
            return fetchModelSummary(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    if(json.status == SUCCESS){
                        clearInterval(appsInterval);
                        dispatch(fetchModelSummarySuccess(json));
                        dispatch(closeAppsLoaderValue());
                        dispatch(hideDataPreview());
                        dispatch(updateModelSummaryFlag(true));
                    }else if(json.status == FAILED){
                        bootbox.alert("Your model could not created.Please try later.",function(){
                            window.history.go(-2);
                        });
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                        dispatch(hideDataPreview());
                    }
                }
                else{
                    dispatch(closeAppsLoaderValue())
                    dispatch(fetchModelSummaryError(json));
                    dispatch(updateModelSummaryFlag(false));
                }
            })
        }
    }
    
    function fetchModelSummary(token,slug) {
        return fetch(API+'/api/trainer/'+slug+'/',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function fetchModelSummaryError(json) {
        return {
            type: "MODEL_SUMMARY_ERROR",
            json
        }
    }
    export function fetchModelSummarySuccess(doc){
        var data = doc;
        return {
            type: "MODEL_SUMMARY_SUCCESS",
            data,
        }
    }
    export function clearModelSummary(){
        return {
            type: "CLEAR_MODEL_SUMMARY",
        }
    }
    export function getListOfCards(totalCardList){
        console.log("In Apps Model Detail");
        let cardList = new Array();
        for(var i=0;i<totalCardList.length;i++){
            cardList.push(totalCardList[i].cardData)
        }
        console.log(cardList)
        return cardList;
    }
    
    export function updateSelectedAlg(name){
        return {
            type: "SELECTED_ALGORITHM",
            name,
        }
    }
    
    export function createScore(scoreName,targetVariable) {
        console.log(scoreName);
        console.log(targetVariable);
        return (dispatch) => {
            dispatch(openAppsLoader(APPSLOADERPERVALUE,"Please wait while mAdvisor is scoring your model... "));
            return triggerCreateScore(getUserDetailsOrRestart.get().userToken,scoreName,targetVariable).then(([response, json]) =>{
                if(response.status === 200){
                    
                    dispatch(createScoreSuccess(json,dispatch))
                }
                else{
                    dispatch(createScoreError(json));
                    dispatch(updateScoreSummaryFlag(false));
                    dispatch(closeAppsLoaderValue())
                }
            })
        }
    }
    
    function triggerCreateScore(token,scoreName,targetVariable) {
        var datasetSlug = store.getState().datasets.dataPreview.slug;
        var app_id=store.getState().apps.currentAppId;
        var customDetails = createcustomAnalysisDetails();
        var details = {"measures":store.getState().datasets.selectedMeasures,
                "dimension":store.getState().datasets.selectedDimensions,
                "timeDimension":store.getState().datasets.selectedTimeDimensions,
                "analysisVariable":targetVariable,
                "algorithmName":store.getState().apps.selectedAlg,
                'customAnalysisDetails':customDetails["customAnalysisDetails"],
                'polarity':customDetails["polarity"],
                'uidColumn':customDetails["uidColumn"],
                "app_id":app_id}
        return fetch(API+'/api/score/',{
            method: 'post',
            headers: getHeader(token),
            body:JSON.stringify({
                "name":scoreName,
                "dataset":datasetSlug,
                "trainer":store.getState().apps.modelSlug,
                "config":details
            }),
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function createScoreSuccess(data,dispatch){
        var slug = data.slug;
        appsInterval = setInterval(function(){
            if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }
            dispatch(getAppsScoreSummary(data.slug));
            return {
                type: "CREATE_SCORE_SUCCESS",
                slug,
            }
        },APPSDEFAULTINTERVAL);
        return {
            type: "CREATE_SCORE_SUCCESS",
            slug,
        }
    }
    
    export function getAppsScoreSummary(slug) {
        return (dispatch) => {
            return fetchScoreSummary(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    if(json.status == SUCCESS){
                        clearInterval(appsInterval);
                        dispatch(fetchScoreSummarySuccess(json));
                        dispatch(closeAppsLoaderValue());
                        dispatch(hideDataPreview());
                        dispatch(updateScoreSummaryFlag(true));
                    }else if(json.status == FAILED){
                        bootbox.alert("Your score could not created.Please try later.",function(result){
                            window.history.go(-2);
                        })
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                        dispatch(hideDataPreview());
                    }
                    
                }
                else{
                    dispatch(closeAppsLoaderValue());
                    dispatch(updateScoreSummaryFlag(false));
                    dispatch(fetchScoreSummaryError(json))
                }
            })
        }
    }
    
    function fetchScoreSummary(token,slug) {
        return fetch(API+'/api/score/'+slug+'/',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function fetchScoreSummaryError(json) {
        return {
            type: "SCORE_SUMMARY_ERROR",
            json
        }
    }
    export function fetchScoreSummarySuccess(data){
        return {
            type: "SCORE_SUMMARY_SUCCESS",
            data,
        }
    }
    export function emptyScoreCSVData(){
        var data = {};
        data.csv_data = [];
        fetchScoreSummarySuccess(data);
    }
    export function fetchScoreSummaryCSVSuccess(data){
        return {
            type: "SCORE_SUMMARY_CSV_DATA",
            data,
        }
    }
    export function getScoreSummaryInCSV(slug){
        return (dispatch) => {
            return fetchScoreSummaryInCSV(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    dispatch(fetchScoreSummaryCSVSuccess(json));
                }else{
                    dispatch(fetchScoreSummaryError(json));
                }
                
            });
            
        }
    }
    function fetchScoreSummaryInCSV(token,slug) {
        return fetch(API+'/api/get_score_data_and_return_top_n/?url='+EMR+'/'+slug+'/data.csv&count=100',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    export function updateSelectedApp(appId,appName){
        return {
            type: "SELECTED_APP_DETAILS",
            appId,
            appName,
        }
    }
    
    export function openAppsLoaderValue(value,text){
        return {
            type: "OPEN_APPS_LOADER_MODAL",
            value,
            text,
        }
    }
    export function closeAppsLoaderValue(){
        return {
            type: "HIDE_APPS_LOADER_MODAL",
        }
    }
    function createModelError(){
        return {
            type: "CREATE_MODEL_ERROR",
        }
    }
    function updateAppsLoaderValue(value){
        return {
            type: "UPDATE_APPS_LOADER_VALUE",
            value,
        }
    }
    
    export function openAppsLoader(value,text){
        return {
            type: "OPEN_APPS_LOADER_MODAL",
            value,
            text,
        }
    }
    export function updateModelSummaryFlag(flag){
        return {
            type: "UPDATE_MODEL_FLAG",
            flag,
        }
    }
    export function updateScoreSummaryFlag(flag){
        return {
            type: "UPDATE_SCORE_FLAG",
            flag,
        }
    }
    
    export function updateModelSlug(slug){
        return {
            type: "CREATE_MODEL_SUCCESS",
            slug,
        }
    }
    export function updateScoreSlug(slug){
        return {
            type: "CREATE_SCORE_SUCCESS",
            slug,
        }
    }
    
    export function getAppsRoboList(pageNo) {
        return (dispatch) => {
            return fetchRoboList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(fetchRoboListSuccess(json))
                }
                else{
                    dispatch(fetchRoboListError(json))
                }
            })
        }
    }
    
    function fetchRoboList(pageNo,token) {
        let search_element = store.getState().apps.robo_search_element;
        let robo_sorton =  store.getState().apps.robo_sorton;
        let robo_sorttype = store.getState().apps.robo_sorttype;
        if(robo_sorttype=='asc')
            robo_sorttype = ""
                else if(robo_sorttype=='desc')
                    robo_sorttype="-"
                        if(search_element!=""&&search_element!=null){
                            //console.log("calling for robo search element!!")
                            return fetch(API+'/api/robo/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else if((robo_sorton!=""&& robo_sorton!=null) && (robo_sorttype!=null)){
                            return fetch(API+'/api/robo/?sorted_by='+robo_sorton+'&ordering='+robo_sorttype+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }else{
                            return fetch(API+'/api/robo/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
                                method: 'get',
                                headers: getHeader(token)
                            }).then( response => Promise.all([response, response.json()]));
                        }
        
        
    }
    
    function fetchRoboListError(json) {
        return {
            type: "ROBO_LIST_ERROR",
            json
        }
    }
    export function fetchRoboListSuccess(doc){
        var data = doc;
        var current_page =  doc.current_page
        return {
            type: "ROBO_LIST",
            data,
            current_page,
        }
    }
    export function closeRoboDataPopup() {
        return {
            type: "APPS_ROBO_HIDE_POPUP",
        }
    }
    
    export function openRoboDataPopup() {
        return {
            type: "APPS_ROBO_SHOW_POPUP",
        }
    }
    
    export function saveFilesToStore(files,uploadData) {
        console.log(files)
        var file = files[0]
        if(uploadData == CUSTOMERDATA){
            return {
                type: "CUSTOMER_DATA_UPLOAD_FILE",
                files
            }
        }
        else if(uploadData == HISTORIALDATA){
            return {
                type: "HISTORIAL_DATA_UPLOAD_FILE",
                files
            }
        }
        else if(uploadData == EXTERNALDATA){
            return {
                type: "EXTERNAL_DATA_UPLOAD_FILE",
                files
            }
        }
        
    }
    
    
    export function uploadFiles(dialog,insightName) {
        if(!isEmpty(store.getState().apps.customerDataUpload) && !isEmpty(store.getState().apps.historialDataUpload) && !isEmpty(store.getState().apps.externalDataUpload)){
            return (dispatch) => {
                dispatch(closeRoboDataPopup());
                dispatch(openAppsLoader(APPSLOADERPERVALUE,"Please wait while mAdvisor is processing data... "));
                return triggerDataUpload(getUserDetailsOrRestart.get().userToken,insightName).then(([response, json]) =>{
                    if(response.status === 200){
                        
                        dispatch(dataUploadFilesSuccess(json,dispatch))
                    }
                    else{
                        dispatch(dataUploadFilesError(json));
                        dispatch(closeAppsLoaderValue())
                    }
                })
            }
        }else{
            dialog.showAlert("Please select Customer Data,Historial Data and External Data.");
        }
        
    }
    
    function triggerDataUpload(token,insightName) {
        var data = new FormData();
        data.append("customer_file",store.getState().apps.customerDataUpload);
        data.append("historical_file",store.getState().apps.historialDataUpload);
        data.append("market_file",store.getState().apps.externalDataUpload);
        data.append("name",insightName);
        return fetch(API+'/api/robo/',{
            method: 'post',
            headers: getHeaderWithoutContent(token),
            body:data,
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function dataUploadFilesSuccess(data,dispatch) {
        var slug = data.slug;
        appsInterval = setInterval(function(){
            if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }
            dispatch(getRoboDataset(data.slug));
        },APPSDEFAULTINTERVAL);
        return {
            type: "ROBO_DATA_UPLOAD_SUCCESS",
            slug,
        }
    }
    
    export function dataUploadFilesError(josn){
        return {
            type: "ROBO_DATA_UPLOAD_ERROR",
            json
        }
    }
    export function updateRoboSlug(slug){
        return {
            type: "ROBO_DATA_UPLOAD_SUCCESS",
            slug
        }
    }
    export function getRoboDataset(slug) {
        return (dispatch) => {
            dispatch(updateRoboSlug(slug));
            return fetchRoboDataset(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    if(json.status == SUCCESS){
                        clearInterval(appsInterval);
                        dispatch(fetchRoboSummarySuccess(json));
                        dispatch(getDataSetPreview(json.customer_dataset.slug))
                        dispatch(updateRoboAnalysisData(json,"/apps-robo"));
                        dispatch(closeAppsLoaderValue());
                        dispatch(showRoboDataUploadPreview(true));
                        //dispatch(clearDataPreview());
                        dispatch(showDataPreview());
                        //dispatch(getAppsRoboList(1));
                    }else if(json.status == FAILED){
                        bootbox.alert("Your robo insight could not created.Please try later.",function(result){
                            window.history.go(-2);
                        });
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                    }
                }
                else{
                    dispatch(closeAppsLoaderValue());
                    dispatch(showRoboDataUploadPreview(false));
                    dispatch(fetchModelSummaryError(json));
                }
            })
        }
    }
    
    function fetchRoboDataset(token,slug) {
        return fetch(API+'/api/robo/'+slug+'/',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function fetchRoboSummaryError(json) {
        return {
            type: "ROBO_SUMMARY_ERROR",
            json
        }
    }
    export function fetchRoboSummarySuccess(doc){
        var data = doc;
        return {
            type: "ROBO_SUMMARY_SUCCESS",
            data,
        }
    }
    export function showRoboDataUploadPreview(flag){
        return {
            type: "ROBO_DATA_UPLOAD_PREVIEW",
            flag,
        }
    }
    export function clearRoboDataUploadFiles() {
        return {
            type: "EMPTY_ROBO_DATA_UPLOAD_FILES",
        }
    }
    export function clearDataPreview(){
        return {
            type: "CLEAR_DATA_PREVIEW",
        }
    }
    export function updateRoboUploadTab(tabId){
        return {
            type: "UPDATE_ROBO_UPLOAD_TAB_ID",
            tabId
        }
    }
    export function updateRoboAnalysisData(roboData,urlPrefix){
        var roboSlug = roboData.slug;
        return {
            type: "ROBO_DATA_ANALYSIS",
            roboData,
            urlPrefix,
            roboSlug
        }
    }export function showDialogBox(slug,dialog,dispatch,title,msgText){
        Dialog.setOptions({
            defaultOkLabel: 'Yes',
            defaultCancelLabel: 'No',
        })
        dialog.show({
            title: title,
            body: msgText,
            actions: [
                      Dialog.CancelAction(),
                      Dialog.OKAction(() => {
                          if(title == DELETEMODEL)
                              deleteModel(slug,dialog,dispatch)
                              else if(title ==  DELETEINSIGHT)
                                  deleteInsight(slug,dialog,dispatch)
                                  else if(title ==  DELETEAUDIO)
                                      deleteAudio(slug,dialog,dispatch)
                                      else
                                          deleteScore(slug,dialog,dispatch)
                                          
                      })
                      ],
                      bsSize: 'medium',
                      onHide: (dialogBox) => {
                          dialogBox.hide()
                          console.log('closed by clicking background.')
                      }
        });
    }
    export function handleModelDelete(slug,dialog) {
        return (dispatch) => {
            showDialogBox(slug,dialog,dispatch,DELETEMODEL,"Are you sure, you want to delete model?")
        }
    }
    function deleteModel(slug,dialog,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return deleteModelAPI(slug).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsModelList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function deleteModelAPI(slug){
        return fetch(API+'/api/trainer/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                deleted:true,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    
    export function handleModelRename(slug,dialog,name){
        const customBody = (
                <div className="form-group">
                <label for="fl1" className="control-label">Enter a new Name</label>
                <input className="form-control"  id="idRenameModel" type="text" defaultValue={name}/>
                </div>
        )
        return (dispatch) => {
            showRenameDialogBox(slug,dialog,dispatch,RENAMEMODEL,customBody)
        }
    }
    function showRenameDialogBox(slug,dialog,dispatch,title,customBody){
        dialog.show({
            title: title,
            body: customBody,
            actions: [
                      Dialog.CancelAction(),
                      Dialog.OKAction(() => {
                          if(title == RENAMEMODEL)
                              renameModel(slug,dialog,$("#idRenameModel").val(),dispatch)
                              else if(title ==  RENAMEINSIGHT)
                                  renameInsight(slug,dialog,$("#idRenameInsight").val(),dispatch)
                                  else if(title ==  RENAMEAUDIO)
                                      renameAudio(slug,dialog,$("#idRenameAudio").val(),dispatch)
                                      else
                                          renameScore(slug,dialog,$("#idRenameScore").val(),dispatch)
                      })
                      ],
                      bsSize: 'medium',
                      onHide: (dialogBox) => {
                          dialogBox.hide()
                          console.log('closed by clicking background.')
                      }
        });
    }
    
    function renameModel(slug,dialog,newName,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return renameModelAPI(slug,newName).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsModelList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function renameModelAPI(slug,newName){
        return fetch(API+'/api/trainer/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                name:newName,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    
    export function handleScoreDelete(slug,dialog) {
        return (dispatch) => {
            showDialogBox(slug,dialog,dispatch,DELETESCORE,"Are you sure, you want to delete score?")
        }
    }
    function deleteScore(slug,dialog,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return deleteScoreAPI(slug).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsScoreList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function deleteScoreAPI(slug){
        return fetch(API+'/api/score/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                deleted:true,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    
    export function handleScoreRename(slug,dialog,name){
        const customBody = (
                <div className="form-group">
                <label for="fl1" className="control-label">Enter a new Name</label>
                <input className="form-control"  id="idRenameScore" type="text" defaultValue={name}/>
                </div>
        )
        return (dispatch) => {
            showRenameDialogBox(slug,dialog,dispatch,RENAMESCORE,customBody)
        }
    }
    
    function renameScore(slug,dialog,newName,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return renameScoreAPI(slug,newName).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsScoreList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function renameScoreAPI(slug,newName){
        return fetch(API+'/api/score/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                name:newName,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    export function activateModelScoreTabs(id){
        return {
            type: "APPS_SELECTED_TAB",
            id,
        }
    }
    
    export function handleInsightDelete(slug,dialog) {
        return (dispatch) => {
            showDialogBox(slug,dialog,dispatch,DELETEINSIGHT,"Are you sure, you want to delete Insight?")
        }
    }
    function deleteInsight(slug,dialog,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return deleteInsightAPI(slug).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsRoboList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function deleteInsightAPI(slug){
        return fetch(API+'/api/robo/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                deleted:true,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    
    export function handleInsightRename(slug,dialog,name){
        const customBody = (
                <div className="form-group">
                <label for="fl1" className="control-label">Enter a new Name</label>
                <input className="form-control"  id="idRenameInsight" type="text" defaultValue={name}/>
                </div>
        )
        return (dispatch) => {
            showRenameDialogBox(slug,dialog,dispatch,RENAMEINSIGHT,customBody)
        }
    }
    
    function renameInsight(slug,dialog,newName,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return renameInsightAPI(slug,newName).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAppsRoboList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function renameInsightAPI(slug,newName){
        return fetch(API+'/api/robo/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                name:newName,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    export function storeRoboSearchElement(search_element){
        return {
            type: "SEARCH_ROBO",
            search_element
        }
    }
    export function storeModelSearchElement(search_element){
        return {
            type: "SEARCH_MODEL",
            search_element
        }
    }export function storeScoreSearchElement(search_element){
        return {
            type: "SEARCH_SCORE",
            search_element
        }
    }
    export function clearRoboSummary(){
        return {
            type: "CLEAR_ROBO_SUMMARY_SUCCESS",
        }
    }
    export function showAudioFUModal(){
        return {
            type: "SHOW_AUDIO_FILE_UPLOAD",
        }
    }
    
    export function hideAudioFUModal(){
        return {
            type: "HIDE_AUDIO_FILE_UPLOAD",
        }
    }
    
    export function uploadAudioFileToStore(files){
        return {
            type: "AUDIO_UPLOAD_FILE",
            files
        }
    }
    
    export function uploadAudioFile(){
        return (dispatch) => {
            dispatch(hideAudioFUModal());
            dispatch(openAppsLoader(APPSLOADERPERVALUE,"Please wait while mAdvisor analyzes the audio file... "));
            return triggerAudioUpload(getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    
                    dispatch(audioUploadFilesSuccess(json,dispatch))
                }
                else{
                    dispatch(audioUploadFilesError(json));
                    dispatch(closeAppsLoaderValue())
                }
            })
        }
    }
    
    function triggerAudioUpload(token){
        var data = new FormData();
        data.append("input_file",store.getState().apps.audioFileUpload);
        return fetch(API+'/api/audioset/',{
            method: 'post',
            headers: getHeaderWithoutContent(token),
            body:data,
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function audioUploadFilesSuccess(data,dispatch) {
        var slug = data.slug;
        appsInterval = setInterval(function(){
            if(store.getState().apps.appsLoaderPerValue < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }
            dispatch(getAudioFile(data.slug));
        },APPSDEFAULTINTERVAL);
        return {
            type: "AUDIO_UPLOAD_SUCCESS",
            slug,
        }
    }
    
    function audioUploadFilesError(){
        return {
            type: "AUDIO_UPLOAD_ERROR",
        }
    }
    
    export function getAudioFile(slug) {
        return (dispatch) => {
            return fetchAudioFileSummary(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    if(json.status == SUCCESS){
                        dispatch(fetchAFSummarySuccess(json));
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                        dispatch(clearAudioFile());
                        dispatch(updateAudioFileSummaryFlag(true));
                    }else if(json.status == FAILED){
                        bootbox.alert("Your audio file could not analysed.Please try later.",function(result){
                            dispatch(updateAudioFileSummaryFlag(false));
                        });
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                        dispatch(clearAudioFile());
                    }
                }
                else{
                    //dispatch(closeAppsLoaderValue());
                    dispatch(fetchAFSummaryError(json));
                }
            })
        }
    }
    function fetchAudioFileSummary(token,slug){
        return fetch(API+'/api/audioset/'+slug+'/',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function fetchAFSummarySuccess(data){
        return {
            type: "AUDIO_UPLOAD_SUMMARY_SUCCESS",
            data,
        }
    }
    
    function fetchAFSummaryError(data){
        return {
            type: "AUDIO_UPLOAD_SUMMARY_ERROR",
        }
    }
    
    export function clearAudioFile(){
        return {
            type: "CLEAR_AUDIO_UPLOAD_FILE",
        }
    }
    
    export function updateAudioFileSummaryFlag(flag){
        return {
            type: "UPDATE_AUDIO_FILE_SUMMARY_FLAG",
            flag
        }
    }
    
    export function getAudioFileList(pageNo){
        return (dispatch) => {
            return fetchAudioList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    dispatch(fetchAudioListSuccess(json))
                }
                else{
                    dispatch(fetchAudioListError(json))
                }
            })
        }
    }
    
    function fetchAudioList(pageNo,token) {
        
        console.log(token)
        let search_element = store.getState().apps.audio_search_element
        console.log(search_element)
        if(search_element!=""&&search_element!=null){
            console.log("calling for search element!!")
            return fetch(API+'/api/audioset/?name='+search_element+'&page_number='+pageNo+'&page_size='+PERPAGE+'',{
                method: 'get',
                headers: getHeader(token)
            }).then( response => Promise.all([response, response.json()]));
        }else{
            return fetch(API+'/api/audioset/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
                method: 'get',
                headers: getHeader(token)
            }).then( response => Promise.all([response, response.json()]));
        }
        
        
    }
    
    function fetchAudioListError(json) {
        return {
            type: "AUDIO_LIST_ERROR",
            json
        }
    }
    export function fetchAudioListSuccess(doc){
        var data = doc;
        var current_page =  doc.current_page
        return {
            type: "AUDIO_LIST",
            data,
            current_page,
        }
    }
    export function storeAudioSearchElement(search_element){
        return {
            type: "SEARCH_AUDIO_FILE",
            search_element
        }
    }
    
//  Rename and Delete Audio files
    
    
    export function handleAudioDelete(slug,dialog) {
        return (dispatch) => {
            showDialogBox(slug,dialog,dispatch,DELETEAUDIO,"Are you sure, you want to delete media file?")
        }
    }
    function deleteAudio(slug,dialog,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return deleteAudioAPI(slug).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAudioFileList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    function deleteAudioAPI(slug){
        return fetch(API+'/api/audioset/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                deleted:true,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    
    export function handleAudioRename(slug,dialog,name){
        const customBody = (
                <div className="form-group">
                <label for="fl1" className="col-sm-6 control-label">Enter Media file name</label>
                <input className="form-control"  id="idRenameAudio" type="text" defaultValue={name}/>
                </div>
        )
        return (dispatch) => {
            showRenameDialogBox(slug,dialog,dispatch,RENAMEAUDIO,customBody)
        }
    }
    
    function renameAudio(slug,dialog,newName,dispatch){
        dispatch(showLoading());
        Dialog.resetOptions();
        return renameAudioAPI(slug,newName).then(([response, json]) =>{
            if(response.status === 200){
                dispatch(getAudioFileList(store.getState().apps.current_page));
                dispatch(hideLoading());
            }
            else{
                dialog.showAlert("Error occured , Please try after sometime.");
                dispatch(hideLoading());
            }
        })
    }
    
    function renameAudioAPI(slug,newName){
        return fetch(API+'/api/audioset/'+slug+'/',{
            method: 'put',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body:JSON.stringify({
                name:newName,
            }),
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    export function playAudioFile(){
        if(!isEmpty(store.getState().apps.audioFileUpload)){
            var audioEle =  document.getElementById("myAudio");
            audioEle.src = store.getState().apps.audioFileUpload.preview;
            $("#audioPause").addClass("show");
            $("#audioPause").removeClass("hide");
            $("#audioPlay").removeClass("show");
            $("#audioPlay").addClass("hide");
            audioEle.play();
        }else{
            bootbox.alert("Please upload audio file to play.");
        }
        
    }
    
    export function pauseAudioFile(){
        if(!isEmpty(store.getState().apps.audioFileUpload)){
            var audioEle =  document.getElementById("myAudio");
            audioEle.src = store.getState().apps.audioFileUpload.preview;
            $("#audioPlay").addClass("show");
            $("#audioPlay").removeClass("hide");
            $("#audioPause").addClass("hide");
            $("#audioPause").removeClass("show");
            audioEle.pause();
        }else{
            bootbox.alert("Please upload audio file to play.");
        }
    }
    
    export function storeRoboSortElements(roboSorton,roboSorttype){
        return {
            type: "SORT_ROBO",
            roboSorton,
            roboSorttype
        }
    }
    export function storeAppsModelSortElements(appsModelSorton,appsModelSorttype){
        return {
            type: "SORT_APPS_MODEL",
            appsModelSorton,
            appsModelSorttype
        }
    }
    export function storeAppsScoreSortElements(appsScoreSorton,appsScoreSorttype){
        return {
            type: "SORT_APPS_SCORE",
            appsScoreSorton,
            appsScoreSorttype
        }
    }
    export function updateCreateStockPopup(flag){
        return {
            type: "CREATE_STOCK_MODAL",
            flag
        }
    }
    
    export function addDefaultStockSymbolsComp(){
        return (dispatch) => {
            var stockSymbolsArray = [];
            stockSymbolsArray.push({"id":1,"name":"name1","value":""});
            stockSymbolsArray.push({"id":2,"name":"name2","value":""});
            dispatch(updateStockSymbolsArray(stockSymbolsArray))
        }
    }
    
    function updateStockSymbolsArray(stockSymbolsArray){
        return{
            type: "ADD_STOCK_SYMBOLS",
            stockSymbolsArray
        }
    }
    
    export function addMoreStockSymbols(){
        return (dispatch) => {
            var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
            var max = stockSymbolsArray.reduce(function(prev, current) {
                return (prev.id > current.id) ? prev : current
                        
            });
            let length = max.id+1;
            stockSymbolsArray.push({"id":length,"name":"name"+length,"value":""});
            dispatch(updateStockSymbolsArray(stockSymbolsArray));
        }
    }
    
    export function removeStockSymbolsComponents(data){
        return (dispatch) => {
            var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
            for (var i=0;i<stockSymbolsArray.length;i++) {
                if(stockSymbolsArray[i].id == data.id){
                    stockSymbolsArray.splice(i,1);
                    break;
                }
            }
            dispatch(updateStockSymbolsArray(stockSymbolsArray))
        }
    }
    
    export function handleInputChange(event){
        
        return (dispatch) => {
            var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs.slice();
            for (var i=0;i<stockSymbolsArray.length;i++) {
                if(stockSymbolsArray[i].id == event.target.id){
                    stockSymbolsArray[i].value = event.target.value;
                    break;
                }
            }
            dispatch(updateStockSymbolsArray(stockSymbolsArray))
        }
    }
    
    export function getAppsStockList(pageNo) {
        return (dispatch) => {
            return fetchStockList(pageNo,getUserDetailsOrRestart.get().userToken).then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(fetchStockListSuccess(json))
                }
                else{
                    dispatch(fetchStockListError(json))
                }
            })
        }
    }
    
    function fetchStockList(pageNo,token) {
        return fetch(API+'/api/stockdataset/?page_number='+pageNo+'&page_size='+PERPAGE+'',{
            method: 'get',
            headers: getHeader(getUserDetailsOrRestart.get().userToken)
        }).then( response => Promise.all([response, response.json()]));
        
    }
    
    function fetchStockListError(json) {
        return {
            type: "STOCK_LIST_ERROR",
            json
        }
    }
    
    export function fetchStockListSuccess(doc){
        var data = doc;
        var current_page =  doc.current_page
        return {
            type: "STOCK_LIST",
            data,
            current_page,
        }
    }
    
    export function crawlDataForAnalysis(url,analysisName,urlForNews){
        var found = false;
        var stockSymbolsArray = store.getState().apps.appsStockSymbolsInputs;
        for(var i = 0; i < stockSymbolsArray.length; i++) {
            if (stockSymbolsArray[i].value != '') {
                found = true;
                break;
            }
        }
        /*if(analysisName == ""){
			bootbox.alert("Please enter stock analysis name.");
		}
		else if(url == ""){
			bootbox.alert("Please enter stock analysis url.");
		}*/
        if(found){
            return (dispatch) => {
                dispatch(updateCreateStockPopup(false))
                dispatch(openAppsLoader(APPSLOADERPERVALUE,"Extracting historic stock prices.... "));
                return triggerCrawlingAPI(url,urlForNews,analysisName).then(([response, json]) => {
                    if (response.status === 200) {
                        console.log(json.slug)
                        dispatch(crawlSuccess(json, dispatch))
                    }else {
                        dispatch(crawlError(json))
                        dispatch(closeAppsLoaderValue());
                    }
                });
            }
        }else{
            bootbox.alert("Please enter text/symbols to analyze stocks")
        }
    }
    export function updateAppsLoaderText(text){
        return {
            type: "UPDATE_LOADER_TEXT",
            text,
        }
    }
    export function crawlSuccess(json, dispatch){
        var slug = json.slug;
        //dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Fetching metadata information for news portals....")) }, 10000);
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Extracting articles from news portals.....")) }, 30000);
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Creating dataset....")) }, 40000);
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE)); }, 45000);
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE)); }, 50000);
        setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE)); }, 55000);
        appsInterval = setInterval(function() {
            dispatch(getStockDataSetPreview(slug,appsInterval))
            if(store.getState().apps.appsLoaderPerValue+10 < LOADERMAXPERVALUE){
                dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
            }
            
        }, 60000);
        return {
            type: "STOCK_CRAWL_SUCCESS",
            slug,
        }
    }
    function triggerCrawlingAPI(urlForPrices,urlForNews,analysisName) {
        
        var details = {
                "url1":urlForPrices,
                "url2":urlForNews,
                "name":analysisName,
                "stock_symbols":store.getState().apps.appsStockSymbolsInputs
                
        }
        return fetch(API + '/api/stockdataset/', {
            method: 'post',
            headers: getHeader(getUserDetailsOrRestart.get().userToken),
            body: JSON.stringify({config: details})
        }).then(response => Promise.all([response, response.json()]));
        
    }
    
    export function hideDataPreviewRightPanels(){
        $("#tab_visualizations").hide();
        $("#sub_settings").hide();
        $("#dataPreviewButton").hide();
    }
    export function updateUploadStockPopup(flag){
        return {
            type: "UPLOAD_STOCK_MODAL",
            flag
        }
    }
    export function uploadStockFiles(files){
        return {
            type: "UPLOAD_STOCK_FILES",
            files
        }
    }
    export function uploadStockAnalysisFlag(flag){
        return {
            type: "UPDATE_STOCK_ANALYSIS_FLAG",
            flag
        }
    }
    
    export function uploadStockFile(slug){
        return (dispatch) => {
            dispatch(updateUploadStockPopup(false));
            dispatch(openAppsLoader(APPSLOADERPERVALUE,"Preparing data for analysis... "));
            return triggerStockUpload(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) => {
                if (response.status === 200) {
                    dispatch(triggerStockAnalysis(slug));
                }else{
                    dispatch(closeAppsLoaderValue());
                }
            });
        }
    }
    function triggerStockUpload(token,slug) {
        return fetch(API+"/api/stockdataset/"+slug+"/create_stats/",{
            method: 'put',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    export function triggerStockAnalysis(slug){
        return (dispatch) => {
            //dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE+7));
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Applying domain model for stock analysis....")) }, 10000);
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Extracting relevant entities and keywords.....")) }, 20000);
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Tagging articles to relevant concepts ....")) }, 30000);
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Performing sentiment analysis....")) }, 40000);
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Identifying key events during the selected period.....")) }, 50000);
            setTimeout(function(){ dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));dispatch(updateAppsLoaderText("Analyze the impact of concepts on stock performance....")) }, 60000);
            appsInterval = setInterval(function() {
                dispatch(getStockAnalysis(slug));
                if(store.getState().apps.appsLoaderPerValue+10 < LOADERMAXPERVALUE){
                    dispatch(updateAppsLoaderValue(store.getState().apps.appsLoaderPerValue+APPSLOADERPERVALUE));
                }
            }, 60000)
        }
    }
    export function getStockAnalysis(slug) {
        return (dispatch) => {
            return fetchStockAnalysisAPI(getUserDetailsOrRestart.get().userToken,slug).then(([response, json]) =>{
                if(response.status === 200){
                    if(json.status == SUCCESS){
                        clearInterval(appsInterval);
                        dispatch(updateRoboAnalysisData(json,"/apps-stock-advisor"));
                        dispatch(uploadStockAnalysisFlag(true));
                        dispatch(closeAppsLoaderValue());
                    }else if(json.status == FAILED){
                        bootbox.alert("Your stock analysis could not created.Please try later.",function(result){
                            window.history.go(-2);
                        });
                        clearInterval(appsInterval);
                        dispatch(closeAppsLoaderValue());
                    }
                }
                else{
                    dispatch(closeAppsLoaderValue());
                }
            })
        }
    }
    
    function fetchStockAnalysisAPI(token,slug) {
        return fetch(API+"/api/stockdataset/"+slug+"/read_stats/",{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    export function updateStockSlug(slug){
        return {
            type: "STOCK_CRAWL_SUCCESS",
            slug,
        }
    }
    
    
    
    export function getConceptsList() {
        return (dispatch) => {
            return fetchConceptList().then(([response, json]) =>{
                if(response.status === 200){
                    console.log(json)
                    dispatch(fetchConceptListSuccess(json))
                }
                else{
                    dispatch(fetchConceptListError(json))
                }
            })
        }
    }
    function fetchConceptList(){
        return fetch(API+'/api/get_concepts/',{
            method: 'get',
            headers: getHeader(getUserDetailsOrRestart.get().userToken)
        }).then( response => Promise.all([response, response.json()]));
    }
    
    function fetchConceptListSuccess(concepts) {
        return{
            type:"CONCEPTSLIST",
            concepts
        }
        
    }
    
    function fetchConceptListError(json) {
        // return {
        // 	type: "MODEL_LIST_ERROR",
        // 	json
        // }
    }
    
    export function getAppsList(token,pageNo){
        
        return (dispatch) => {
            return fetchApps(token,pageNo).then(([response, json]) =>{
                if(response.status === 200){
                    //console.log(json)
                    dispatch(fetchAppsSuccess(json))
                    // if(json.data)
                    // dispatch(updateAppsFilterList(json.data[0].tag_keywords))
                    
                }
                else{
                    dispatch(fetchAppsError(json))
                }
            })
        }
        
    }
    
    function  fetchApps(token,pageNo){
        let search_element = store.getState().apps.storeAppsSearchElement;
        let apps_sortBy = store.getState().apps.storeAppsSortByElement;
        let apps_sortType = store.getState().apps.storeAppsSortType;
        if(search_element){
            return fetch(API+'/api/apps/?app_name='+search_element+'&page_number='+pageNo+'&page_size='+APPSPERPAGE+'',{
                method: 'get',
                headers: getHeader(token)
            }).then( response => Promise.all([response, response.json()]));
        }else if((apps_sortBy!=""&&apps_sortBy!=null) && (apps_sortType!=null)){
            return fetch(API+'/api/apps/?sorted_by='+apps_sortBy+'&ordering='+apps_sortType+'&page_number='+pageNo+'&page_size='+APPSPERPAGE+'',{
                method: 'get',
                headers: getHeader(token)
            }).then( response => Promise.all([response, response.json()]));
        }
        else{
            return fetch(API+'/api/apps/?page_number='+pageNo+'&page_size='+APPSPERPAGE+'',{
                method: 'get',
                headers: getHeader(token)
            }).then( response => Promise.all([response, response.json()]));
        }
        
    }
    
    function fetchAppsSuccess(json){
        var current_page =  json.current_page
        return {
            type: "APPS_LIST",
            json,
            current_page
        }
    }
    
    
    function fetchAppsError(json) {
        //console.log("fetching list error!!",json)
        return {
            type: "APPS_LIST_ERROR",
            json
        }
    }
    export function appsStoreSearchEle(search_element){
        return {
            type: "APPS_SEARCH",
            search_element
        }
    }
    export function appsStoreSortElements(sort_by,sort_type){
        return {
            type: "APPS_SORT",
            sort_by,
            sort_type
        }
    }
    
    export function updateAppsFilterList(filter_list){
        let appList=store.getState().apps.appsList
        //console.log(appList)
        
        // if(filter_list.length==0 && appList.data )
        // filter_list=[]
        return{
            type:"UPDATE_FILTER_LIST",
            filter_list
        }
    }
    
    
    export function getAppsFilteredList(token,pageNo){
        
        return (dispatch) => {
            return fetchFilteredApps(token,pageNo).then(([response, json]) =>{
                if(response.status === 200){
                    //console.log(json)
                    dispatch(fetchAppsSuccess(json))
                    
                }
                else{
                    dispatch(fetchAppsError(json))
                }
            })
        }
        
    }
    
    function  fetchFilteredApps(token,pageNo){
        let filtered_list = store.getState().apps.app_filtered_keywords;
        //let stringify_list="[\""+filtered_list.toString().replace(/,/g ,"\",\"")+"\"]"
        //alert(stringify_list)
        return fetch(API+'/api/apps/?filter_fields='+'['+filtered_list+']'+'&page_number='+pageNo+'&page_size='+APPSPERPAGE+'',{
            method: 'get',
            headers: getHeader(token)
        }).then( response => Promise.all([response, response.json()]));
        
        
    }
