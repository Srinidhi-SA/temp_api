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
import {getAppsRoboList, getRoboDataset, handleInsightDelete, handleInsightRename, storeRoboSearchElement,clearRoboSummary,storeRoboSortElements} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js";
import {RoboDataUpload} from "./RoboDataUpload";
import {AppsLoader} from "../common/AppsLoader";
import Dialog from 'react-bootstrap-dialog'
import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from "../../helpers/helper";
import {RoboInsightCard} from "./RoboInsightCard";
import {LatestRoboInsights} from "./LatestRoboInsights";


var dateFormat = require('dateformat');

@connect((store) => {
  return {
    login_response: store.login.login_response,
    roboList: store.apps.roboList,
    currentAppId: store.apps.currentAppId,
    showRoboDataUploadPreview: store.apps.showRoboDataUploadPreview,
    roboDatasetSlug: store.apps.roboDatasetSlug,
    roboSummary: store.apps.roboSummary,
    dataPreviewFlag: store.datasets.dataPreviewFlag,
    robo_search_element: store.apps.robo_search_element,
    customerDataset_slug:store.apps.customerDataset_slug,
	historialDataset_slug:store.apps.historialDataset_slug,
	externalDataset_slug:store.apps.externalDataset_slug,
	robo_sorton:store.apps.robo_sorton,
	robo_sorttype:store.apps.robo_sorttype
  };
})

export class RoboInsightList extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
    var pageNo = 1;
    if (this.props.history.location.search.indexOf("page") != -1) {
      pageNo = this.props.history.location.search.split("page=")[1];
      this.props.dispatch(getAppsRoboList(pageNo));
    } else
      this.props.dispatch(getAppsRoboList(pageNo));
    }
  getInsightPreview(slug) {
	this.props.dispatch(clearRoboSummary());
    this.props.dispatch(getRoboDataset(slug));
  }
  handleInsightRename(slug, name) {
    this.props.dispatch(handleInsightRename(slug, this.refs.dialog, name))
  }
  handleInsightDelete(slug) {
    this.props.dispatch(handleInsightDelete(slug, this.refs.dialog))
  }
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      //console.log('searching in data list');
      if (e.target.value != "" && e.target.value != null)
        this.props.history.push('/apps-robo?search=' + e.target.value + '')

      this.props.dispatch(storeRoboSearchElement(e.target.value));
      this.props.dispatch(getAppsRoboList(1));

    }
  }
  onChangeOfSearchBox(e) {
    if (e.target.value == "" || e.target.value == null) {
      this.props.dispatch(storeRoboSearchElement(""));
      this.props.dispatch(getAppsRoboList(1));
      this.props.history.push('/apps-robo')

    } else if (e.target.value.length > SEARCHCHARLIMIT) {
      this.props.history.push('/apps-robo?search=' + e.target.value + '')
      this.props.dispatch(storeRoboSearchElement(e.target.value));
      this.props.dispatch(getAppsRoboList(1));
    }
  }

    doSorting(sortOn, type){
        this.props.history.push('/apps-robo?sort=' + sortOn + '&type='+type);
        this.props.dispatch(storeRoboSortElements(sortOn,type));
        this.props.dispatch(getAppsRoboList(1));
  }
  render() {
    console.log("apps robo list is called##########3");
    console.log(this.props);
    //empty search element
    if (this.props.robo_search_element != "" && (this.props.location.search == "" || this.props.location.search == null)) {
      console.log("search is empty");
      this.props.dispatch(storeRoboSearchElement(""));
      let search_element = document.getElementById('robo_insights');
      if (search_element)
        document.getElementById('robo_insights').value = "";
      }
    //search element ends..
	 if(this.props.location.sort == "" || this.props.location.sort == null){
		  this.props.dispatch(storeRoboSortElements("",null));
	  }

    if (store.getState().datasets.dataPreviewFlag) {
      let _link = "/apps-robo-list/" + store.getState().apps.roboDatasetSlug+"/customer/data/"+store.getState().apps.customerDataset_slug
      return (<Redirect to={_link}/>);
    }

    const roboList = store.getState().apps.roboList.data;
    if (roboList) {
      const pages = store.getState().apps.roboList.total_number_of_pages;
      const current_page = store.getState().apps.current_page;
      let addButton = null;
      let paginationTag = null;
      const appsRoboList = <RoboInsightCard data={roboList} />;
      if (current_page == 1 || current_page == 0) {
        addButton = <RoboDataUpload match={this.props.match}/>
      }
      if (pages > 1) {
        paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
      }
      
      return (
        <div className="side-body">
        <LatestRoboInsights props={this.props}/>
          <div className="main-content">
            <div class="row">
             {/*
             <div className="col-md-8">
                <h3 className="xs-mt-0">Robo Advisor Insights</h3>
              </div>
             */} 
              <div className="col-md-12">
                <div class="btn-toolbar pull-right">				
				<div className="input-group">
				
				<div className="input-group">
					<div className="search-wrapper">
						<form>
						<input type="text" name="robo_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Robo Insights" id="robo_insights" className="form-control search-box"  placeholder="Search robo insights..." required />
						<span className="zmdi zmdi-search form-control-feedback"></span>
						<button className="close-icon" type="reset"></button>
						</form>
					</div>
				</div>
				</div>
				
				<div className="btn-group">
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
            <div className="row">
             {appsRoboList}
              <div className="clearfix"></div>
            </div>
            <div className="ma-datatable-footer" id="idPagination">
              <div className="dataTables_paginate">
                {paginationTag}
              </div>
            </div>
          </div>
          <AppsLoader match={this.props.match}/>
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
    if (this.props.robo_search_element) {
      this.props.history.push('/apps-robo?search=' + this.props.robo_search_element + '?page=' + eventKey + '')
    } else if(this.props.robo_sorton){
	     this.props.history.push('/apps-robo?sort=' + this.props.robo_sorton +'&type='+this.props.robo_sorttype+'&page=' + eventKey + '');
	}else
      this.props.history.push('/apps-robo?page=' + eventKey + '')

    this.props.dispatch(getAppsRoboList(eventKey));
  }
}
