import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {
    Tabs,
    Tab,
    Pagination,
    Tooltip,
    OverlayTrigger,
    Popover
} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {
    getAppsScoreList,
    getAppsScoreSummary,
    updateScoreSlug,
    handleScoreRename,
    handleScoreDelete,
    activateModelScoreTabs,
    storeScoreSearchElement,
    storeAppsScoreSortElements
} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from  "../../helpers/helper"
import Dialog from 'react-bootstrap-dialog'

var dateFormat = require('dateformat');

@connect((store) => {
    return {login_response: store.login.login_response, scoreList: store.apps.scoreList, scoreSlug: store.apps.scoreSlug, currentAppId: store.apps.currentAppId, score_search_element: store.apps.score_search_element,apps_score_sorton:store.apps.apps_score_sorton, apps_score_sorttype:store.apps.apps_score_sorttype};
})

export class AppsScoreList extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        console.log(this.props.history)
        
        var pageNo = 1;
        if (this.props.history.location.search.indexOf("page") != -1) {
            pageNo = this.props.history.location.search.split("page=")[1];
            this.props.dispatch(getAppsScoreList(pageNo));
        } else {
            this.props.dispatch(getAppsScoreList(pageNo));
            // this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores')
        }
        
    }
    getScoreSummary(slug) {
        this.props.dispatch(updateScoreSlug(slug))
    }
    handleScoreDelete(slug) {
        this.props.dispatch(handleScoreDelete(slug, this.refs.dialog));
    }
    handleScoreRename(slug, name) {
        this.props.dispatch(handleScoreRename(slug, this.refs.dialog, name));
    }
    
    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            //console.log('searching in data list');
            
            if (e.target.value != "" && e.target.value != null)
                this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores?search=' + e.target.value + '')
                
                this.props.dispatch(storeScoreSearchElement(e.target.value));
            this.props.dispatch(getAppsScoreList(1));
            
        }
    }
    onChangeOfSearchBox(e) {
        if (e.target.value == "" || e.target.value == null) {
            this.props.dispatch(storeScoreSearchElement(""));
            this.props.dispatch(getAppsScoreList(1));
            this.props.history.push('/apps/' + store.getState().apps.currentAppId + '/scores'+ '')
            
        } else if (e.target.value.length > SEARCHCHARLIMIT) {
            this.props.history.push('/apps/' + store.getState().apps.currentAppId + '/scores?search=' + e.target.value+'')
            this.props.dispatch(storeScoreSearchElement(e.target.value));
            this.props.dispatch(getAppsScoreList(1));
        }
    }
    
    doSorting(sortOn, type){
        this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores?sort=' + sortOn + '&type='+type);
        
        this.props.dispatch(storeAppsScoreSortElements(sortOn,type));
        this.props.dispatch(getAppsScoreList(1));
    }
    
    
    render() {
        console.log("apps score list is called##########3");
        //empty search element
        let search_element = document.getElementById('score_insights');
        if (this.props.score_search_element != "" && (this.props.history.location.search == "" || this.props.history.location.search == null)) {
            console.log("search is empty");
            this.props.dispatch(storeScoreSearchElement(""));
            if (search_element)
                document.getElementById('score_insights').value = "";
        }
        if (this.props.score_search_element == "" && this.props.history.location.search != "") {
            if (search_element)
                document.getElementById('score_insights').value = "";
        }
        //search element ends..
        
        if(this.props.history.location.sort == "" || this.props.history.location.sort == null){
            this.props.dispatch(storeAppsScoreSortElements("",null));
        }
        
        const scoreList = store.getState().apps.scoreList.data;
        if (scoreList) {
            const pages = store.getState().apps.scoreList.total_number_of_pages;
            const current_page = store.getState().apps.current_page;
            let paginationTag = null
            if (pages > 1) {
                paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
            }
            const appsScoreList = scoreList.map((data, i) => {
                var scoreLink = "/apps/" + store.getState().apps.currentAppId + "/scores/" + data.slug;
                return (
                        <div className="col-md-3 top20 list-boxes" key={i}>
                        <div className="rep_block newCardStyle" name={data.name}>
                        <div className="card-header"></div>
                        <div className="card-center-tile">
                        <div className="row">
                        <div className="col-xs-9">
                        <h4 className="title newCardTitle">
                        <a href="javascript:void(0);" id={data.slug} onClick={this.getScoreSummary.bind(this, data.slug)}>
                        <Link to={scoreLink}>{data.name}</Link>
                        </a>
                        </h4>
                        </div>
                        <div className="col-xs-3">
                        <img src={STATIC_URL + "assets/images/apps_score_icon.png"} className="img-responsive" alt="LOADING"/>
                            </div>
                        </div>
                        </div>
                        <div className="card-footer">
                        <div className="left_div">
                        <span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
                        <span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
                        </div>
                        
                        <div className="card-deatils">
                        {/*<!-- Popover Content link -->*/}
                        <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
                        <a className="pover cursor">
                        <i className="ci pe-7s-info pe-2x"></i>
                        </a>
                        </OverlayTrigger>
                        
                        {/*<!-- Rename and Delete BLock  -->*/}
                        <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                        <i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                        <li onClick={this.handleScoreRename.bind(this, data.slug, data.name)}>
                        <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>
                        &nbsp;&nbsp;Rename</a>
                        </li>
                        <li onClick={this.handleScoreDelete.bind(this, data.slug)}>
                        <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>
                        &nbsp;&nbsp;Delete</a>
                        </li>
                        </ul>
                        {/*<!-- End Rename and Delete BLock  -->*/}
                        </div>
                        </div>
                        </div>
                        </div>
                )
            });
            return (
                    
                    <div>
                    <div className="page-head">
                    {/*<!-- <ol class="breadcrumb">
							<li><a href="#">Story</a></li>
							<li class="active">Sales Performance Report</li>
						</ol> -->*/}
 
            <div className="row">
              <div className="col-md-8"></div>
              <div className="col-md-4">
				
				<div class="btn-toolbar pull-right">
			  
                <div className="input-group">

							{/*<input type="text" name="score_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="model_insights" className="form-control" placeholder="Search Model insights..."/>*/}
							
							<div className="search-wrapper">
								<form>
								<input type="text" name="score_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Score Insights" id="score_insights" className="form-control search-box"  placeholder="Search Score insights... " required />
								<span className="fa fa-search form-control-feedback"></span>
								<button className="close-icon" type="reset"></button>
								</form>
							</div>							
				</div>
				
				
				

                <div className="btn-group">
                    {/*<button type="button" className="btn btn-default" title="Select All Card">
                      <i className="fa fa-address-card-o fa-lg"></i>
                    </button>*/}
					
                    <button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false">
                    <i className="fa fa-sort-alpha-asc fa-lg"></i>&nbsp;<span className="caret"></span>
                    </button>
                    <ul role="menu" className="dropdown-menu dropdown-menu-right">
                    <li>
                    <a href="javascript:;" onClick={this.doSorting.bind(this,'name','asc')}><i class="fa fa-sort-alpha-asc" aria-hidden="true"></i> Name Ascending</a>
                    </li>
                    <li>
                    <a href="javascript:;" onClick={this.doSorting.bind(this,'name','desc')}><i class="fa fa-sort-alpha-desc" aria-hidden="true"></i> Name Descending</a>
                    </li>
                    <li>
                    <a href="javascript:;" onClick={this.doSorting.bind(this,'created_at','asc')}><i class="fa fa-sort-numeric-asc" aria-hidden="true"></i> Date Ascending</a>
                    </li>
                    <li>
                    <a href="javascript:;" onClick={this.doSorting.bind(this,'created_at','desc')}><i class="fa fa-sort-numeric-desc" aria-hidden="true"></i> Date Descending</a>
                    </li>
                    </ul>
                    </div>
                  
					
					</div>
					
                    </div>
                    </div>
                    
                    <div className="clearfix"></div>
                    </div>
                    <div class="main-content">
                    <div className="row">
                    {appsScoreList}
                    <div className="clearfix"></div>
                    </div>
                    <div className="ma-datatable-footer" id="idPagination">
                    <div className="dataTables_paginate">
                    {paginationTag}
                    </div>
                    </div>
                    </div>
                    <Dialog ref="dialog"/>
                        </div>
                    
            );
        } else {
            return (
                    <div>
                    <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
                    </div>
            )
        }
    }
    handleSelect(eventKey) {
        if (this.props.score_search_element) {
            this.props.history.push('/apps/' + store.getState().apps.currentAppId + '/scores?search=' + this.props.score_search_element + '?page=' + eventKey + '')
        }  else if(this.props.apps_score_sorton){
            this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/score?sort=' + this.props.apps_score_sorton +'&type='+this.props.apps_score_sorttype+'&page=' + eventKey + '');
        }else
            this.props.history.push('/apps/' + store.getState().apps.currentAppId + '/scores?page=' + eventKey + '')
            
            this.props.dispatch(activateModelScoreTabs(2));
        this.props.dispatch(getAppsScoreList(eventKey));
    }
}
