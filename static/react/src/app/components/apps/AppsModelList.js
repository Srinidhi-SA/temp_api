import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsCreateModel} from "./AppsCreateModel";
import {getAppsModelList,getAppsModelSummary,updateModelSlug,updateScoreSummaryFlag,
    updateModelSummaryFlag,handleModelDelete,handleModelRename,storeModelSearchElement,storeAppsModelSortElements,getAppDetails} from "../../actions/appActions";
    import {DetailOverlay} from "../common/DetailOverlay";
    import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from  "../../helpers/helper"
    import {STATIC_URL} from "../../helpers/env.js";
    import Dialog from 'react-bootstrap-dialog'
    import {DataUploadLoader} from "../common/DataUploadLoader";
    import {ModelsCard} from "./ModelsCard";
    import {LatestModels} from "./LatestModels";
    var dateFormat = require('dateformat');
    
    
    @connect((store) => {
        return {login_response: store.login.login_response,
            modelList: store.apps.modelList,
            modelSummaryFlag:store.apps.modelSummaryFlag,
            modelSlug:store.apps.modelSlug,
            currentAppId:store.apps.currentAppId,
            model_search_element: store.apps.model_search_element,
            apps_model_sorton:store.apps.apps_model_sorton,
            apps_model_sorttype:store.apps.apps_model_sorttype
        };
    })
    
    export class AppsModelList extends React.Component {
        constructor(props) {
            super(props);
            this.handleSelect = this.handleSelect.bind(this);
        }
        componentWillMount() {
            var pageNo = 1;
            if(this.props.history.location.search.indexOf("page") != -1){
                pageNo = this.props.history.location.search.split("page=")[1];
            }
            if(store.getState().apps.currentAppId == ""){
                this.props.dispatch(getAppDetails(this.props.match.params.AppId,pageNo));
            }else{
                this.props.dispatch(getAppsModelList(pageNo));
            }
           
        }
    
        getModelSummary(slug){
            this.props.dispatch(updateModelSlug(slug))
        }
        handleModelDelete(slug){
            this.props.dispatch(handleModelDelete(slug,this.refs.dialog));
        }
        handleModelRename(slug,name){
            this.props.dispatch(handleModelRename(slug,this.refs.dialog,name));
        }
        _handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                //console.log('searching in data list');
                if (e.target.value != "" && e.target.value != null)
                    this.props.history.push('/apps/'+this.props.match.params.AppId+'/models?search=' + e.target.value + '')
                    
                    this.props.dispatch(storeModelSearchElement(e.target.value));
                this.props.dispatch(getAppsModelList(1));
                
            }
        }
        onChangeOfSearchBox(e){
            if(e.target.value==""||e.target.value==null){
                this.props.dispatch(storeModelSearchElement(""));
                this.props.history.push('/apps/'+this.props.match.params.AppId+'/models'+'')
                this.props.dispatch(getAppsModelList(1));
                
            }else if (e.target.value.length > SEARCHCHARLIMIT) {
                this.props.history.push('/apps/'+this.props.match.params.AppId+'/models?search=' + e.target.value + '')
                this.props.dispatch(storeModelSearchElement(e.target.value));
                this.props.dispatch(getAppsModelList(1));
            }
        }
        
        doSorting(sortOn, type){
            this.props.history.push('/apps/'+this.props.match.params.AppId+'/models?sort=' + sortOn + '&type='+type);
            
            this.props.dispatch(storeAppsModelSortElements(sortOn,type));
            this.props.dispatch(getAppsModelList(1));
        }
        
        render() {
            console.log("apps model list is called##########3");
            console.log(this.props);
            //empty search element
            let search_element = document.getElementById('model_insights');
            if (this.props.model_search_element != "" && (this.props.history.location.search == "" || this.props.history.location.search == null)) {
                console.log("search is empty");
                this.props.dispatch(storeModelSearchElement(""));
                if (search_element)
                    document.getElementById('model_insights').value = "";
            }
            if(this.props.model_search_element==""&&this.props.history.location.search!=""){
                if(search_element)
                    document.getElementById('model_insights').value = "";
            }
            //search element ends..
            
            if(this.props.history.location.sort == "" || this.props.history.location.sort == null){
                this.props.dispatch(storeAppsModelSortElements("",null));
            }
            
            
            const modelList = store.getState().apps.modelList.data;
            let appsModelList = null;
            if (modelList) {
                const pages = store.getState().apps.modelList.total_number_of_pages;
                const current_page = store.getState().apps.current_page;
                
                let paginationTag = null
                if(pages > 1){
                    paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
                }
                appsModelList = <ModelsCard match={this.props.match} data={modelList}/>;
                return (
                        <div>
                        <LatestModels props={this.props}/>
                        <div className="main-content">
                        <div className="row">
                        <div className="col-md-6">
                        
                        </div>
                        <div className="col-md-6">
                        <div className="btn-toolbar pull-right">
                        <div className="input-group">
                        
                        {/*<input type="text" name="model_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="model_insights" className="form-control" placeholder="Search Model insights..."/>*/}
                        
                        <div className="search-wrapper">
                        <form>
                        <input type="text" name="model_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="model_insights" className="form-control search-box" placeholder="Search Model insights..." required />
                        <span className="zmdi zmdi-search form-control-feedback"></span>
                        <button className="close-icon" type="reset"></button>
                        </form>
                        </div>
                        
                        </div>
                        <div className="btn-group">
                        {/*<button type="button" className="btn btn-default" title="Select All Card">
											<i className="fa fa-address-card-o fa-lg"></i>
										</button>*/}
                        <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false">
                        <i className="zmdi zmdi-hc-lg zmdi-sort-asc"></i>
                        </button>
                        <ul role="menu" className="dropdown-menu dropdown-menu-right">
                        <li>
                        <a href="javascript:;" onClick={this.doSorting.bind(this,'name','asc')}><i class="zmdi zmdi-sort-amount-asc"></i> Name Ascending</a>
                        </li>
                        <li>
                        <a href="javascript:;" onClick={this.doSorting.bind(this,'name','desc')}><i class="zmdi zmdi-sort-amount-desc"></i> Name Descending</a>
                        </li>
                        <li>
                        <a href="javascript:;" onClick={this.doSorting.bind(this,'created_at','asc')}><i class="zmdi zmdi-calendar-alt"></i> Date Ascending</a>
                        </li>
                        <li>
                        <a href="javascript:;" onClick={this.doSorting.bind(this,'created_at','desc')}><i class="zmdi zmdi-calendar"></i> Date Descending</a>
                        </li>
                        </ul>
                        </div>
                        
                        
                        </div>
                        </div>
                        </div>
                        
                        <div class="clearfix"></div>

                        <div className="row">
                        {appsModelList}
                        <div className="clearfix"></div>
                        </div>
                        <div className="ma-datatable-footer"  id="idPagination">
                        <div className="dataTables_paginate">
                        {paginationTag}
                        </div>
                        </div>
                        </div>
                        <Dialog ref="dialog" />
                            <DataUploadLoader/>
                        </div>
                        
                );
            }else {
                return (
                        <div>
                        <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
                        </div>
                )
            }
        }
        handleSelect(eventKey) {
            
            if (this.props.model_search_element) {
                this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?search=' + this.props.model_search_element+'?page='+eventKey+'')
            }  else if(this.props.apps_model_sorton){
                this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?sort=' + this.props.apps_model_sorton +'&type='+this.props.apps_model_sorttype+'&page=' + eventKey + '');
            }else
                this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?page='+eventKey+'')
                this.props.dispatch(getAppsModelList(eventKey));
        }
    }
