import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Pagination,Tooltip,OverlayTrigger,Popover} from "react-bootstrap";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID4,APPNAME4} from "../../helpers/helper.js";
import {AudioFileUpload} from "./AudioFileUpload";
import {AppsLoader} from "../common/AppsLoader";
import {getAudioFile,getAudioFileList,storeAudioSearchElement,handleAudioDelete,handleAudioRename} from "../../actions/appActions";
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty,SEARCHCHARLIMIT} from "../../helpers/helper";
import {DetailOverlay} from "../common/DetailOverlay";
import Dialog from 'react-bootstrap-dialog'
import Breadcrumb from 'react-breadcrumb';

var dateFormat = require('dateformat');

@connect((store) => {
	return {login_response: store.login.login_response,
        currentAppId:store.apps.currentAppId,
        audioFileSummaryFlag:store.apps.audioFileSummaryFlag,
        audioFileSlug:store.apps.audioFileSlug,
        audioList:store.apps.audioList,
        audio_search_element:store.apps.audio_search_element
		};
})


export class AudioFileList extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount(){
	  var pageNo = 1;
	  if(this.props.history.location.pathname.indexOf("page") != -1){
			pageNo = this.props.history.location.pathname.split("page=")[1];
			this.props.dispatch(getAudioFileList(pageNo));
		}else{
			this.props.dispatch(getAudioFileList(pageNo));
		}
  }
  handleAudioDelete(slug){
	  this.props.dispatch(handleAudioDelete(slug,this.refs.dialog));
  }
  handleAudioRename(slug,name){
	  this.props.dispatch(handleAudioRename(slug,this.refs.dialog,name));
  }
  getAudioFileSummary(slug){
	 this.props.dispatch(getAudioFile(slug));
  }
  _handleKeyPress = (e) => {
	  if (e.key === 'Enter') {
		  //console.log('searching in data list');
		  if (e.target.value != "" && e.target.value != null)
		  this.props.history.push('/apps/audio?search=' + e.target.value + '')
		  this.props.dispatch(storeAudioSearchElement(e.target.value));
		  this.props.dispatch(getAudioFileList(1));

	  }
  }
	onChangeOfSearchBox(e){
		if(e.target.value==""||e.target.value==null){
			this.props.dispatch(storeAudioSearchElement(""));
			this.props.history.push('/apps/audio')
			this.props.dispatch(getAudioFileList(1));

		}else if (e.target.value.length > SEARCHCHARLIMIT) {
			this.props.history.push('/apps/audio?search=' + e.target.value + '')
			this.props.dispatch(storeAudioSearchElement(e.target.value));
			this.props.dispatch(getAudioFileList(1));
		}
	}
  render() {
    console.log("audio file list is called##########3");
    if(store.getState().apps.audioFileSummaryFlag){
        let _link = "/apps/audio/"+store.getState().apps.audioFileSlug;
        return(<Redirect to={_link}/>);
    }
    const audioList = store.getState().apps.audioList.data;
    
    if (audioList) {
		const pages = store.getState().apps.audioList.total_number_of_pages;
		const current_page = store.getState().apps.current_page;
		let addButton = null;
		let paginationTag = null
		if(current_page == 1 || current_page == 0){
			addButton = <AudioFileUpload match={this.props.match}/>
		}
		if(pages > 1){
			paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
		}
		const appsAudioList = audioList.map((data, i) => {
			var modelLink = "/apps/audio/" + data.slug;
			return (
					<div className="col-md-3 top20 list-boxes" key={i}>
					<div className="rep_block newCardStyle" name={data.name}>
					<div className="card-header"></div>
					<div className="card-center-tile">
					<div className="row">
					<div className="col-xs-9">
					<h4 className="title newCardTitle">
					<a href="javascript:void(0);" id= {data.slug} onClick={this.getAudioFileSummary.bind(this,data.slug)}><Link to={modelLink}>{data.name}</Link></a>
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
					<span className="footerTitle">{dateFormat(data.created_at, "mmm d,yyyy h:MM")}</span>
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
					<li onClick={this.handleAudioRename.bind(this,data.slug,data.name)}>
					<a className="dropdown-item" href="#renameCard" data-toggle="modal">
					<i className="fa fa-edit"></i> Rename</a>
					</li>
					<li onClick={this.handleAudioDelete.bind(this,data.slug)} >
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
				<div className="page-head">
					{/*<!-- <ol class="breadcrumb">
						<li><a href="#">Story</a></li>
						<li class="active">Sales Performance Report</li>
					</ol> -->*/}
					<div class="row">
	                <div class="col-md-12">
	                  <Breadcrumb path={[
	                    {
	                      path: '/apps',
	                      label: 'Apps'
	                    }, {
		                      path: '/apps/audio',
		                      label: 'Audio'
		                    }
	                  ]}/>
	                </div>
	              </div>
	              <div class="clearfix"></div>
	              
					<div className="row">
					<div className="col-md-8">
					 <h4>Media Files</h4>
					</div>
						<div className="col-md-4">
							<div className="input-group pull-right">

								<input type="text" name="audio_file" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Media Files" id="audio_file" className="form-control" placeholder="Search Audio files..."/>

								{/*<span className="input-group-btn">
									<button type="button" className="btn btn-default" title="Select All Card">
										<i className="fa fa-address-card-o fa-lg"></i>
									</button>
									<button type="button" data-toggle="dropdown" title="Sorting" className="btn btn-default dropdown-toggle" aria-expanded="false">
										<i className="fa fa-sort-alpha-asc fa-lg"></i>
										<span className="caret"></span>
									</button>
									<ul role="menu" className="dropdown-menu dropdown-menu-right">
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
								</span>*/}
							</div>
						</div>
					</div>

					<div class="clearfix"></div>
				</div>
				<div className="main-content">
				<div className="row">
				{addButton}
				{appsAudioList}
				<div className="clearfix"></div>
				</div>
				<div className="ma-datatable-footer"  id="idPagination">
				<div className="dataTables_paginate">
				{paginationTag}
				</div>
				</div>
				</div>
				 <Dialog ref="dialog" />
				 <AppsLoader/>
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

	  if (this.props.audio_search_element) {
		  this.props.history.push('/apps/audio?search=' + this.props.model_search_element+'?page='+eventKey+'')
	  } else
		  this.props.history.push('/apps/audio?page='+eventKey+'')

		  this.props.dispatch(getAudioFileList(eventKey));
  }
  
}
