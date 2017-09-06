import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {getAppsRoboList,getRoboDataset,handleInsightDelete,handleInsightRename,storeRoboSearchElement} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js";
import {RoboDataUpload} from "./RoboDataUpload";
import {AppsLoader} from "../common/AppsLoader";
import Dialog from 'react-bootstrap-dialog'
import {SEARCHCHARLIMIT} from  "../../helpers/helper"

var dateFormat = require('dateformat');


@connect((store) => {
	return {login_response: store.login.login_response,
		roboList: store.apps.roboList,
		currentAppId:store.apps.currentAppId,
		showRoboDataUploadPreview:store.apps.showRoboDataUploadPreview,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		roboSummary:store.apps.roboSummary,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		robo_search_element: store.apps.robo_search_element
	};
})

export class RoboInsightList extends React.Component {
	constructor(props) {
		super(props);
		this.handleSelect = this.handleSelect.bind(this);
	}
	componentWillMount() {
		var pageNo = 1;
		if(this.props.history.location.pathname.indexOf("page") != -1){
			pageNo = this.props.history.location.pathname.split("page=")[1];
			this.props.dispatch(getAppsRoboList(pageNo));
		}else
			this.props.dispatch(getAppsRoboList(pageNo));
	}
	getInsightPreview(slug){
		this.props.dispatch(getRoboDataset(slug));
	}
	handleInsightRename(slug,name){
		this.props.dispatch(handleInsightRename(slug,this.refs.dialog,name))
	}
	handleInsightDelete(slug){
		this.props.dispatch(handleInsightDelete(slug,this.refs.dialog))
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
	onChangeOfSearchBox(e){
		if(e.target.value==""||e.target.value==null){
			this.props.dispatch(storeRoboSearchElement(""));
			this.props.dispatch(getAppsRoboList(1));
			this.props.history.push('/apps-robo')

		}else if (e.target.value.length>SEARCHCHARLIMIT) {
			this.props.history.push('/apps-robo?search=' + e.target.value + '')
			this.props.dispatch(storeRoboSearchElement(e.target.value));
			this.props.dispatch(getAppsRoboList(1));
		}
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

		if(store.getState().datasets.dataPreviewFlag){
			let _link = "/apps-robo/"+store.getState().apps.roboDatasetSlug
			return(<Redirect to={_link}/>);
		}

		const roboList = store.getState().apps.roboList.data;
		if (roboList) {
			const pages = store.getState().apps.roboList.total_number_of_pages;
			const current_page = store.getState().apps.current_page;
			let addButton = null;
			let paginationTag = null
			if(current_page == 1 || current_page == 0){
				addButton = <RoboDataUpload match={this.props.match}/>
			}
			if(pages > 1){
				paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
			}
			const appsRoboList = roboList.map((data, i) => {
				var modelLink = "/apps-robo/" + data.slug;
				return (
						<div className="col-md-3 top20 list-boxes" key={i}>
						<div className="rep_block newCardStyle" name={data.name}>
						<div className="card-header"></div>
						<div className="card-center-tile">
						<div className="row">
						<div className="col-xs-9">
						<h4 className="title newCardTitle">
						<a href="javascript:void(0);" id= {data.slug}><Link onClick={this.getInsightPreview.bind(this,data.slug)} to={modelLink}>{data.name}</Link></a>
						</h4>
						</div>
						<div className="col-xs-3">
						<img src={ STATIC_URL + "assets/images/apps_model_icon.png" } className="img-responsive" alt="LOADING"/>
						</div>
						</div>
						</div>
						<div className="card-footer">
						<div className="left_div">
						<span className="footerTitle"></span>{sessionStorage.userName}
						<span className="footerTitle">{dateFormat(data.created_at, "mmmm d,yyyy h:MM")}</span>
						</div>

						<div className="card-deatils">
						{/*<!-- Popover Content link -->*/}
						<OverlayTrigger trigger="click" rootClose  placement="left" overlay={<Popover id="popover-trigger-focus"><DetailOverlay details={data}/></Popover>}><a href="#"  className="pover">
						<i className="ci pe-7s-info pe-2x"></i>
						</a></OverlayTrigger>

						{/*<!-- Rename and Delete BLock  -->*/}
						<a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
						<i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
						</a>
						<ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
						<li onClick={this.handleInsightRename.bind(this,data.slug,data.name)}>
						<a className="dropdown-item" href="#renameCard" data-toggle="modal">
						<i className="fa fa-edit"></i> Rename</a>
						</li>
						<li onClick={this.handleInsightDelete.bind(this,data.slug)}>
						<a className="dropdown-item" href="#deleteCard" data-toggle="modal">
						<i className="fa fa-trash-o"></i> Delete</a>
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
					<div className="side-body">
					<div class="page-head">
					{/*<!-- <ol class="breadcrumb">
							<li><a href="#">Story</a></li>
							<li class="active">Sales Performance Report</li>
						</ol> -->*/}
					<div class="row">
					<div class="col-md-8">
					<h4>Robo Advisor Insights</h4>
					</div>
					<div class="col-md-4">
					<div class="input-group pull-right">

					<input type="text" name="robo_insights" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Robo Insights" id="robo_insights" class="form-control" placeholder="Search robo insights..."/>
					<span class="input-group-btn">
					<button type="button" class="btn btn-default" title="Select All Card">
					<i class="fa fa-address-card-o fa-lg"></i>
					</button>
					<button type="button" data-toggle="dropdown" title="Sorting" class="btn btn-default dropdown-toggle" aria-expanded="false">
					<i class="fa fa-sort-alpha-asc fa-lg"></i>
					<span class="caret"></span>
					</button>
					<ul role="menu" class="dropdown-menu dropdown-menu-right">
					<li>
					<a href="#">Name Ascending</a>
					</li>
					<li>
					<a href="#">Name Descending</a>
					</li>
					<li>
					<a href="#">Date Ascending</a>
					</li>
					<li>
					<a href="#">Date Descending</a>
					</li>
					</ul>
					</span>
					</div>
					</div>
					</div>

					<div class="clearfix"></div>
					</div>
					<div className="main-content">
					<div className="row">
					{addButton}
					{appsRoboList}
					<div className="clearfix"></div>
					</div>
					<div className="ma-datatable-footer"  id="idPagination">
					<div className="dataTables_paginate">
					{paginationTag}
					</div>
					</div>
					</div>
					<AppsLoader/>
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
		if (this.props.robo_search_element) {
			this.props.history.push('/apps-robo?search=' + this.props.robo_search_element+'?page='+eventKey+'')
		} else
			this.props.history.push('/apps-robo?page='+eventKey+'')

			this.props.dispatch(getAppsRoboList(eventKey));
	}
}
