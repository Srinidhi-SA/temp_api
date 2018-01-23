import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID1,APPID2,APPID3,APPNAME1,APPNAME2,APPNAME3,getUserDetailsOrRestart} from "../../helpers/helper.js"
import {getAppsStockList,getStockAnalysis,updateStockSlug} from "../../actions/appActions";
import Dialog from 'react-bootstrap-dialog'
import {AppsCreateStockAnalysis} from "./AppsCreateStockAnalysis";
import {STATIC_URL} from "../../helpers/env.js";
import {DetailOverlay} from "../common/DetailOverlay";
import {AppsLoader} from "../common/AppsLoader";

var dateFormat = require('dateformat');

@connect((store) => {
	return {login_response: store.login.login_response,
		currentAppId:store.apps.currentAppId,
		stockList: store.apps.stockAnalysisList,
		 dataPreviewFlag: store.datasets.dataPreviewFlag,
		 stockAnalysisFlag:store.apps.stockAnalysisFlag,
		 stockSlug:store.apps.stockSlug,
		signal: store.signals.signalAnalysis,
	};
})

export class AppsStockAdvisorList extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props);
	}
	componentWillMount(){
		var pageNo = 1;
		if(this.props.history.location.search.indexOf("page") != -1){
			pageNo = this.props.history.location.search.split("page=")[1];
			this.props.dispatch(getAppsStockList(pageNo));
		}else{
			this.props.dispatch(getAppsStockList(pageNo));
		}
		
	}
	getPreviewData(e) {
		this.props.dispatch(updateStockSlug(e.target.id))
		this.props.dispatch(getStockAnalysis(e.target.id))
	}
	handleDelete(slug){

	}
	handleRename(slug,name){

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
	doSorting(sortOn, type){
		this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?sort=' + sortOn + '&type='+type);

		this.props.dispatch(storeAppsModelSortElements(sortOn,type));
		this.props.dispatch(getAppsModelList(1));
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

	render() {
		 if (store.getState().datasets.dataPreviewFlag) {
		    	let _link = "/apps-stock-advisor-analyze/data/" + store.getState().datasets.selectedDataSet;
		    	return (<Redirect to={_link}/>);
		    }
		 if(store.getState().apps.stockAnalysisFlag){
				let _linkAnalysis = "/apps-stock-advisor/"+store.getState().apps.stockSlug+"/"+this.props.signal.listOfNodes[0].slug;
		    	return (<Redirect to={_linkAnalysis}/>);
		 }
		const stockAnalysisList = this.props.stockList.data;
		if (stockAnalysisList) {
			const pages = this.props.stockList.total_number_of_pages;
			const current_page = this.props.stockList.current_page;
			let addButton = null;
			let paginationTag = null
			if (current_page == 1 || current_page == 0) {
				addButton = <AppsCreateStockAnalysis match={this.props.match}/>
			}
			if (pages > 1) {
				paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
			}
			const stockTemplateList = stockAnalysisList.map((data, i) => {

				return (
						<div className="col-md-3 top20 list-boxes" key={i}>
						<div className="rep_block newCardStyle" name={data.name}>
						<div className="card-header"></div>
						<div className="card-center-tile">
						<div className="row">
						
						<div className="col-xs-12">
						<h5 className="title newCardTitle pull-left">
						<a href="javascript:void(0);" id={data.slug} onClick={this.getPreviewData.bind(this)}>{data.name}</a>
						</h5>
						
						<div class="btn-toolbar pull-right">
						{/*<!-- Rename and Delete BLock  -->*/}
						<a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
						<i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
						</a>
						<ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
						<li onClick={this.handleRename.bind(this, data.slug, data.name)}>
						<a className="dropdown-item" href="#renameCard" data-toggle="modal">
						<i className="fa fa-edit"></i>
						&nbsp;&nbsp;Rename</a>
						</li>
						<li onClick={this.handleDelete.bind(this, data.slug)}>
						<a className="dropdown-item" href="#deleteCard" data-toggle="modal">
						<i className="fa fa-trash-o"></i>
						&nbsp;&nbsp;Delete</a>
						</li>
						</ul>
						{/*<!-- End Rename and Delete BLock  -->*/}
						</div>
						
						<div className="clearfix"></div>
						
						{/*	<div class="inProgressIcon">
							<i class="fa fa-circle"></i>
							<span class="inProgressIconText">&nbsp;{story.completed_percentage}&nbsp;%</span>
							</div> */}
							
						{/*<!-- Popover Content link -->*/}
						<OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
						<a  className="pover cursor">
						<div class="card_icon">
						<img  src={ STATIC_URL + "assets/images/apps_model_icon.png" } alt="LOADING"/>
						</div>
						</a>
						</OverlayTrigger>	
							
						
						</div>
						 
						
						</div>
						</div>
						<div className="card-footer">
						<div className="left_div">
						<span className="footerTitle"></span>{getUserDetailsOrRestart.get().userName}
						<span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy HH:MM")}</span>
						</div>

						 

						{/*popover*/}

						</div>
						</div>
						</div>
				)
			});
			return (
					<div className="side-body">
					<div class="page-head">
					<div class="row">
					<div class="col-md-8">					
					<h3 class="xs-mt-0">Stock Analytics</h3>
					</div>
					<div class="col-md-4">
					
					
				<div class="btn-toolbar pull-right">
                <div class="input-group">
                <div className="search-wrapper">
                    <form>
                    <input type="text" name="search_stock" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Search Stock" id="search_stock" className="form-control search-box" placeholder="Search Stock Analysis..." required />
                    <span className="zmdi zmdi-search form-control-feedback"></span>
                    <button className="close-icon" type="reset"></button>
                    </form>
                </div>
                </div>
                  <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i> </button>
                    <ul role="menu" class="dropdown-menu dropdown-menu-right">
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','asc')}><i class="zmdi zmdi-sort-amount-asc"></i> Name Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','desc')}><i class="zmdi zmdi-sort-amount-desc"></i> Name Descending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','asc')}><i class="zmdi zmdi-calendar-alt"></i> Date Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','desc')}><i class="zmdi zmdi-calendar"></i> Date Descending</a>
                        </li>
                      </ul>
                  </div>
                </div>
					
					
					 
					
					
					</div>
					</div>
					<div class="clearfix"></div>
					</div>
					<div className="main-content">
					<div className="row">
					{addButton}
					{stockTemplateList}
					<div className="clearfix"></div>
					</div>
					<div className="ma-datatable-footer" id="idPagination">
					<div className="dataTables_paginate">
					{paginationTag}
					</div>
					</div>
                    <AppsLoader/>
					<Dialog ref="dialog"/>
					</div>
					</div>
			);
		} else {
			return (
					<div>
					<img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
					<Dialog ref="dialog"/>
					</div>
			)
		}
	}


}
