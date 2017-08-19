import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import $ from "jquery";
import {Pagination} from "react-bootstrap";
import store from "../../store";

import {MainHeader} from "../common/MainHeader";
import {BreadCrumb} from "../common/BreadCrumb";
import {getDataList,getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";
import {fetchProductList} from "../../actions/dataActions";
import {DataUpload} from "./DataUpload";
import {open,close} from "../../actions/dataUploadActions";
var dateFormat = require('dateformat');

@connect((store) => {
	return {login_response: store.login.login_response,
		dataList: store.datasets.dataList,dataPreview: store.datasets.dataPreview,
		 signalMeta: store.datasets.signalMeta,
	};
})

export class Data extends React.Component {
	constructor(props) {
		super(props);
		this.handleSelect = this.handleSelect.bind(this);
		this.selectedData = "";
	}
	componentWillMount() {
		var pageNo = 1;
		if(this.props.history.location.pathname.indexOf("page") != -1){
			pageNo = this.props.history.location.pathname.split("page/")[1];
			this.props.dispatch(getDataList(pageNo));
		}else
			this.props.dispatch(getDataList(pageNo));
	}
	getPreviewData(e){
		var that=this;
		this.selectedData = e.target.id;
		//alert(this.selectedData);
		this.props.dispatch(storeSignalMeta(null,that.props.match.url));
	  this.props.dispatch(getDataSetPreview(this.selectedData));
	}
	render() {
		console.log("data is called");
		console.log(this.props);
		if(store.getState().datasets&&store.getState().datasets.dataPreview&&store.getState().datasets.dataPreview){
			let _link = "/data/"+this.selectedData;
			return(<Redirect to={_link}/>);
		}

		const dataSets = store.getState().datasets.dataList.data;
		if (dataSets) {
			const pages = store.getState().datasets.dataList.total_number_of_pages;
			const current_page = store.getState().datasets.dataList.current_page;
			let addButton = null;
			let paginationTag = null
			if(current_page == 1){
				addButton = <DataUpload />
			}
			if(pages > 1){
				paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
			}
			const dataSetList = dataSets.map((data, i) => {
				var dataSetLink = "/data/" + data.slug;
				return (
						<div className="col-md-3 top20 list-boxes" key={i}>
						<div className="rep_block newCardStyle" name={data.name}>
						<div className="card-header"></div>
						<div className="card-center-tile">
						<div className="row">
						<div className="col-xs-9">
						<h4 className="title newCardTitle">
						<a href="javascript:void(0);" id= {data.slug} onClick = {this.getPreviewData.bind(this)}>{data.name}</a>
						</h4>
						</div>
						<div className="col-xs-3">
						<img src="/assets/images/data_cardIcon.png" className="img-responsive" alt="LOADING"/>
						</div>
						</div>
						</div>
						<div className="card-footer">
						<div className="left_div">
						<span className="footerTitle"></span>Test
						<span className="footerTitle">{dateFormat(data.created_on, "mmmm d,yyyy h:MM")}</span>
						</div>

						<div className="card-deatils">
						{/*<!-- Popover Content link -->*/}
						<a href="#" rel="popover" className="pover" data-popover-content="#myPopover">
						<i className="ci pe-7s-info pe-2x"></i>
						</a>

						{/*<!-- Rename and Delete BLock  -->*/}
						<a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
						<i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
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

						{/*popover*/}
						<div id="myPopover" className="pop_box hide">
						<h4>Created By :
							<span className="text-primary">Harman</span>
							</h4>
							<h5>Updated on :
								<mark>10.10.2017</mark>
								</h5>
								<hr className="hr-popover"/>
								<p>
								Data Set : kk<br/>
								Variable selected : kk1<br/>
								Variable type : sale</p>
								<hr className="hr-popover"/>
								<h4 className="text-primary">Analysis List</h4>
								<ul className="list-unstyled">
								<li>
								<i className="fa fa-check"></i>
								12</li>
								</ul>
								<a href="javascript:void(0)" class="btn btn-primary pull-right">View Story</a>
								<div className="clearfix"></div>
								</div>
								</div>
								</div>
								</div>
				)
			});
			return (
					<div className="side-body">
					<div className="main-content">
					{addButton}
					{dataSetList}
					<div className="clearfix"></div>
					 
					<div className="ma-datatable-footer" id="idPagination">
					<div className="dataTables_paginate">
					{paginationTag}
					</div>
				 </div>
					</div>
					</div>
			);
		}else {
			return (
					<div>No DataSets</div>
			)
		}
	}

	handleSelect(eventKey) {
		this.props.history.push('/data/page/'+eventKey+'')
		this.props.dispatch(getDataList(eventKey));
	}
}
