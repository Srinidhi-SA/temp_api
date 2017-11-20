import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import $ from "jquery";
import {
  Pagination,
  Tooltip,
  OverlayTrigger,
  Popover,
  Modal,
  Button
} from "react-bootstrap";
import store from "../../store";
import {DetailOverlay} from "../common/DetailOverlay";
import {MainHeader} from "../common/MainHeader";
import {BreadCrumb} from "../common/BreadCrumb";
import {getDataList, getDataSetPreview, storeSignalMeta, handleDelete, handleRename} from "../../actions/dataActions";
import {fetchProductList, openDULoaderPopup, closeDULoaderPopup, storeSearchElement,storeSortElements} from "../../actions/dataActions";
import {DataUpload} from "./DataUpload";
import {open, close} from "../../actions/dataUploadActions";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart} from  "../../helpers/helper"
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog'

var dateFormat = require('dateformat');

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataList: store.datasets.dataList,
    dataPreview: store.datasets.dataPreview,
    signalMeta: store.datasets.signalMeta,
    selectedDataSet: store.datasets.selectedDataSet,
    dataPreviewFlag: store.datasets.dataPreviewFlag,
    dataUploadLoaderModal: store.datasets.dataUploadLoaderModal,
    data_search_element: store.datasets.data_search_element,
	data_sorton:store.datasets.data_sorton,
	data_sorttype:store.datasets.data_sorttype,
    dialogBox:store.datasets.dataDialogBox,
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
    this.props.dispatch(storeSignalMeta(null, this.props.match.url));
    if (this.props.history.location.search.indexOf("page") != -1) {
      pageNo = this.props.history.location.search.split("page=")[1];
      this.props.dispatch(getDataList(pageNo));
    } else
      this.props.dispatch(getDataList(pageNo));
    }
  getPreviewData(e) {
    var that = this;
    this.selectedData = e.target.id;
    //alert(this.selectedData);
    this.props.dispatch(storeSignalMeta(null, that.props.match.url));
    this.props.dispatch(getDataSetPreview(this.selectedData));
  }

  openModelPopup() {
    this.props.dispatch(openDULoaderPopup())
  }
  closeModelPopup() {
    this.props.dispatch(closeDULoaderPopup())
  }
  handleDelete(slug) {
    this.props.dispatch(handleDelete(slug, this.refs.dialog));
  }
  handleRename(slug, name) {
    this.props.dispatch(handleRename(slug, this.refs.dialog, name));
  }
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      //console.log('searching in data list');
      if (e.target.value != "" && e.target.value != null)
        this.props.history.push('/data?search=' + e.target.value + '')

      this.props.dispatch(storeSearchElement(e.target.value));
      this.props.dispatch(getDataList(1));
    }
  }
  onChangeOfSearchBox(e){
    if(e.target.value==""||e.target.value==null){
      this.props.dispatch(storeSearchElement(""));
      this.props.history.push('/data');
      this.props.dispatch(getDataList(1));
    }else if (e.target.value.length > SEARCHCHARLIMIT) {
      this.props.history.push('/data?search=' + e.target.value + '')
    this.props.dispatch(storeSearchElement(e.target.value));
    this.props.dispatch(getDataList(1));
    }
  }

  doSorting(sortOn, type){
	     this.props.history.push('/data?sort=' + sortOn + '&type='+type);

	 this.props.dispatch(storeSortElements(sortOn,type));
	this.props.dispatch(getDataList(1));
  }

  render() {
    console.log("data is called");
    console.log(this.props);
		//empty search element
    if (this.props.data_search_element != "" && (this.props.location.search == "" || this.props.location.search == null)) {
    	console.log("search is empty");
    	this.props.dispatch(storeSearchElement(""));
    	let search_element = document.getElementById('search_data');
    	if (search_element)
    		document.getElementById('search_data').value = "";
    }
    if(this.props.location.sort == "" || this.props.location.sort == null){
    	this.props.dispatch(storeSortElements("",null));
    }
    //search element ends..
    if (store.getState().datasets.dataPreviewFlag) {
    	let _link = "/data/" + store.getState().datasets.selectedDataSet;
    	return (<Redirect to={_link}/>);
    }

    const dataSets = store.getState().datasets.dataList.data;
    if (dataSets) {
      const pages = store.getState().datasets.dataList.total_number_of_pages;
      const current_page = store.getState().datasets.dataList.current_page;
      let addButton = null;
      let paginationTag = null
      if (current_page == 1 || current_page == 0) {
        addButton = <DataUpload/>
      }
      if (pages > 1) {
        paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
      }
      const dataSetList = dataSets.map((data, i) => {
        var dataSetLink = "/data/" + data.slug;
        let src = STATIC_URL + "assets/images/File_Icon.png"
        if(data.datasource_type=="Hana"){
          src = STATIC_URL + "assets/images/sapHana_Icon.png"
        }else if (data.datasource_type == "Mysql") {
          src = STATIC_URL + "assets/images/mySQL_Icon.png"
        }
        return (
          <div className="col-md-3 top20 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={data.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                  <div className="col-xs-9">
                    <h4 className="title newCardTitle">
                      <a href="javascript:void(0);" id={data.slug} onClick={this.getPreviewData.bind(this)}>{data.name}</a>
                    </h4>
                  </div>
                  <div className="col-xs-3">
                    <img src={src} className="img-responsive" alt="LOADING"/>
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
                  <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> < /Popover>}>
                    <a  className="pover cursor">
                      <i className="ci pe-7s-info pe-2x"></i>
                    </a>
                  </OverlayTrigger>

                  {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <li onClick={this.handleRename.bind(this, data.slug, data.name)}>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
                    </li>
                    <li onClick={this.handleDelete.bind(this, data.slug)}>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>&nbsp;&nbsp;Delete</a>
                    </li>
                  </ul>
                  {/*<!-- End Rename and Delete BLock  -->*/}
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
                <h4>Data</h4>
              </div>
              <div class="col-md-4">
                <div class="input-group pull-right">
                  <input type="text" name="search_data" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Search Data" id="search_data" class="form-control" placeholder="Search data..."/>

                  <span class="input-group-btn">
                    {/*<button type="button" class="btn btn-default" title="Select All Card">
                      <i class="fa fa-address-card-o fa-lg"></i>
                    </button>*/}
                    <button type="button" data-toggle="dropdown" title="Sorting" class="btn btn-default dropdown-toggle" aria-expanded="false">
                      <i class="fa fa-sort-alpha-asc fa-lg"></i>&nbsp;<span class="caret"></span>
                    </button>
                    <ul role="menu" class="dropdown-menu dropdown-menu-right">
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','asc')}><i class="fa fa-sort-alpha-asc" aria-hidden="true"></i> Name Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','desc')}><i class="fa fa-sort-alpha-desc" aria-hidden="true"></i> Name Descending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','asc')}><i class="fa fa-sort-numeric-asc" aria-hidden="true"></i> Date Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','desc')}><i class="fa fa-sort-numeric-desc" aria-hidden="true"></i> Date Descending</a>
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
              {dataSetList}
              <div className="clearfix"></div>
            </div>
            <div className="ma-datatable-footer" id="idPagination">
              <div className="dataTables_paginate">
                {paginationTag}
              </div>
            </div>
            <DataUploadLoader/>
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

  handleSelect(eventKey) {
		if (this.props.data_search_element) {
      this.props.history.push('/data?search=' + this.props.data_search_element + '&page=' + eventKey + '');
    } else if(this.props.data_sorton){
	     this.props.history.push('/data?sort=' + this.props.data_sorton +'&type='+this.props.data_sorttype+'&page=' + eventKey + '');
	}else
this.props.history.push('/data?page=' + eventKey + '');

    this.props.dispatch(getDataList(eventKey));
  }
}
