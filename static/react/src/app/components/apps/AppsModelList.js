import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsCreateModel} from "./AppsCreateModel";
import {getAppsModelList,getAppsModelSummary,updateModelSlug,updateScoreSummaryFlag,
	updateModelSummaryFlag,handleModelDelete,handleModelRename,storeModelSearchElement,storeAppsModelSortElements} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from  "../../helpers/helper"
import {STATIC_URL} from "../../helpers/env.js";
import Dialog from 'react-bootstrap-dialog'


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
			console.log(this.props.history);

			var pageNo = 1;
			if(this.props.history.location.search.indexOf("page") != -1){
				pageNo = this.props.history.location.search.split("page=")[1];
				this.props.dispatch(getAppsModelList(pageNo));
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
					this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?search=' + e.target.value + '')

					this.props.dispatch(storeModelSearchElement(e.target.value));
				this.props.dispatch(getAppsModelList(1));

			}
		}
		onChangeOfSearchBox(e){
			if(e.target.value==""||e.target.value==null){
				this.props.dispatch(storeModelSearchElement(""));
				this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models'+'')
				this.props.dispatch(getAppsModelList(1));

			}else if (e.target.value.length > SEARCHCHARLIMIT) {
				this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?search=' + e.target.value + '')
				this.props.dispatch(storeModelSearchElement(e.target.value));
				this.props.dispatch(getAppsModelList(1));
			}
		}

	 doSorting(sortOn, type){
	     this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?sort=' + sortOn + '&type='+type);

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
			if (modelList) {
				const pages = store.getState().apps.modelList.total_number_of_pages;
				const current_page = store.getState().apps.current_page;
				let addButton = null;
				let paginationTag = null
				if(current_page == 1 || current_page == 0){
					addButton = <AppsCreateModel match={this.props.match}/>
				}
				if(pages > 1){
					paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
				}
				const appsModelList = modelList.map((data, i) => {
					var modelLink = "/apps/"+store.getState().apps.currentAppId+"/models/" + data.slug;
					return (
							<div className="col-md-3 xs-mb-15 list-boxes" key={i}>
							<div className="rep_block newCardStyle" name={data.name}>
							<div className="card-header"></div>
							<div className="card-center-tile">
							<div className="row">
							<div className="col-xs-9">
							<h4 className="title newCardTitle">
							<a href="javascript:void(0);" id= {data.slug} ><Link to={modelLink}>{data.name}</Link></a>
							</h4>
							</div>
							<div className="col-xs-3">
							<img src={ STATIC_URL + "assets/images/apps_model_icon.png" } className="img-responsive" alt="LOADING"/>
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
							<OverlayTrigger trigger="click" rootClose  placement="left" overlay={<Popover id="popover-trigger-focus"><DetailOverlay details={data}/></Popover>}><a  className="pover cursor">
							<i className="ci pe-7s-info pe-2x"></i>
							</a></OverlayTrigger>

							{/*<!-- Rename and Delete BLock  -->*/}
							<a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
							<i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
							</a>
							<ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
							<li onClick={this.handleModelRename.bind(this,data.slug,data.name)}>
							<a className="dropdown-item" href="#renameCard" data-toggle="modal">
							<i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
							</li>
							<li onClick={this.handleModelDelete.bind(this,data.slug)} >
							<a className="dropdown-item" href="#deleteCard" data-toggle="modal">
							<i className="fa fa-trash-o"></i>&nbsp;&nbsp;Delete</a>
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
						<div className="col-md-8">

						</div>
						<div className="col-md-4">
							<div className="btn-toolbar pull-right">
							<div className="input-group">

							{/*<input type="text" name="model_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="model_insights" className="form-control" placeholder="Search Model insights..."/>*/}
							
							<div className="search-wrapper">
								<form>
								<input type="text" name="model_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="model_insights" className="form-control search-box" placeholder="Search Model insights..." required />
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

						<div class="clearfix"></div>
						</div>
						<div className="main-content xs-pb-20">
						<div className="row xs-pr-10">
						{addButton}
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
