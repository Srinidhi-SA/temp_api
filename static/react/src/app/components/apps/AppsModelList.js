import React from "react";
import store from "../../store";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {AppsCreateModel} from "./AppsCreateModel";
import {getAppsModelList,getAppsModelSummary} from "../../actions/appActions";
import {DetailOverlay} from "../common/DetailOverlay";
import {STATIC_URL} from "../../helpers/env.js"


var dateFormat = require('dateformat');


@connect((store) => {
	return {login_response: store.login.login_response, 
		modelList: store.apps.modelList,
		};
})

export class AppsModelList extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
	  console.log(this.props.history)
	  var pageNo = 1;
	  if(this.props.history.location.pathname.indexOf("page") != -1){
			pageNo = this.props.history.location.pathname.split("page/")[1];
			this.props.dispatch(getAppsModelList(pageNo));
		}else
		  this.props.dispatch(getAppsModelList(pageNo));
	}
  getModelSummary(slug){
	this.props.dispatch(getAppsModelSummary(slug))
  }
  render() {
    console.log("apps model list is called##########3");
    console.log(this.props)
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
			paginationTag = <Pagination className="pull-left" ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
		}
		const appsModelList = modelList.map((data, i) => {
			var modelLink = "/apps/models/" + data.slug;
			return (
					<div className="col-md-3 top20 list-boxes" key={i}>
					<div className="rep_block newCardStyle" name={data.name}>
					<div className="card-header"></div>
					<div className="card-center-tile">
					<div className="row">
					<div className="col-xs-9">
					<h4 className="title newCardTitle">
					<a href="javascript:void(0);" id= {data.slug} onClick={this.getModelSummary.bind(this,data.slug)}><Link to={modelLink}>{data.name}</Link></a>
					</h4>
					</div>
					<div className="col-xs-3">
					<img src={ STATIC_URL + "assets/images/data_cardIcon.png" } className="img-responsive" alt="LOADING"/>
					</div>
					</div>
					</div>
					<div className="card-footer">
					<div className="left_div">
					<span className="footerTitle"></span>{sessionStorage.userName}
					<span className="footerTitle">{dateFormat(data.created_on, "mmmm d,yyyy h:MM")}</span>
					</div>

					<div className="card-deatils">
					{/*<!-- Popover Content link -->*/}
					 <OverlayTrigger trigger={['hover', 'focus']} placement="left" overlay={<Popover id="popover-trigger-focus"><DetailOverlay details={data}/></Popover>}><a href="#"  className="pover">
					<i className="fa fa-info-circle fa-lg"></i>
					</a></OverlayTrigger>

					{/*<!-- Rename and Delete BLock  -->*/}
					<a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
					<i className="fa fa-ellipsis-v fa-lg"></i>
					</a>
					<ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
					<li>
					<a className="dropdown-item" href="#renameCard" data-toggle="modal">
					<i className="fa fa-edit"></i> Rename</a>
					</li>
					<li>
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
				{addButton}
				{appsModelList}
				<div className="clearfix"></div>
				<div id="idPagination">
				{paginationTag}
				</div>
				</div>
		);
	}else {
		return (
				<div>No Models Available</div>
		)
	}
}
  handleSelect(eventKey) {
		this.props.history.push('/apps/models/page/'+eventKey+'')
		this.props.dispatch(getAppsModelList(eventKey));
	}
}
