import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {getAppsScoreList,getAppsScoreSummary,updateScoreSlug,handleScoreRename,handleScoreDelete,activateModelScoreTabs} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js"
import Dialog from 'react-bootstrap-dialog'

var dateFormat = require('dateformat');


@connect((store) => {
	return {login_response: store.login.login_response, 
		scoreList: store.apps.scoreList,
		scoreSlug:store.apps.scoreSlug,
		currentAppId:store.apps.currentAppId,
	};
})

export class AppsScoreList extends React.Component {
	constructor(props) {
		super(props);
		this.handleSelect = this.handleSelect.bind(this);
	}
	componentWillMount() {
		console.log(this.props.history)
		var pageNo = 1;
		if(this.props.history.location.pathname.indexOf("page") != -1){
			pageNo = this.props.history.location.pathname.split("page=")[1];
			this.props.dispatch(getAppsScoreList(pageNo));
		}else{
			this.props.dispatch(getAppsScoreList(pageNo));
			// this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores')
		}
			
	}
	getScoreSummary(slug){
		this.props.dispatch(updateScoreSlug(slug))
	}
	  handleScoreDelete(slug){
		  this.props.dispatch(handleScoreDelete(slug,this.refs.dialog));
	  }
	  handleScoreRename(slug){
		  this.props.dispatch(handleScoreRename(slug,this.refs.dialog));
	  }
	 
	render() {
		console.log("apps score list is called##########3");
		const scoreList = store.getState().apps.scoreList.data;
		if (scoreList) {
			const pages = store.getState().apps.scoreList.total_number_of_pages;
			const current_page = store.getState().apps.score_current_page;
			let paginationTag = null
			if(pages > 1){
				paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
			}
			const appsScoreList = scoreList.map((data, i) => {
				var scoreLink = "/apps/"+store.getState().apps.currentAppId+"/scores/"+data.slug;
				return (
						<div className="col-md-3 top20 list-boxes" key={i}>
						<div className="rep_block newCardStyle" name={data.name}>
						<div className="card-header"></div>
						<div className="card-center-tile">
						<div className="row">
						<div className="col-xs-9">
						<h4 className="title newCardTitle">
						<a href="javascript:void(0);" id= {data.slug} onClick={this.getScoreSummary.bind(this,data.slug)}><Link to={scoreLink}>{data.name}</Link></a>
						</h4>
						</div>
						<div className="col-xs-3">
						<img src={ STATIC_URL + "assets/images/apps_score_icon.png" } className="img-responsive" alt="LOADING"/>
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
						<li onClick={this.handleScoreRename.bind(this,data.slug)}>
						<a className="dropdown-item" href="#renameCard" data-toggle="modal">
						<i className="fa fa-edit"></i> Rename</a>
						</li>
						<li onClick={this.handleScoreDelete.bind(this,data.slug)} >
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
					
					<div>
					<div className="row">
					{appsScoreList}
					<div className="clearfix"></div>
					</div>
					<div className="ma-datatable-footer"  id="idPagination">
					<div className="dataTables_paginate">
					{paginationTag}
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
		this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores?page='+eventKey+'')
		this.props.dispatch(getAppsScoreList(eventKey));
		this.props.dispatch(activateModelScoreTabs(2));
	}
}
