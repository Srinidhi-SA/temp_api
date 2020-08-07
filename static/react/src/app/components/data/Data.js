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
import {Share} from "../common/Share"
import {getDataList, getDataSetPreview, storeSignalMeta, handleDelete, handleRename,refreshDatasets,setEditModelValues,fetchModelEdit} from "../../actions/dataActions";
import {fetchProductList, openDULoaderPopup, closeDULoaderPopup, storeSearchElement,storeSortElements,getAllUsersList} from "../../actions/dataActions";
import {DataUpload} from "./DataUpload";
import {open, close,triggerDataUploadAnalysis} from "../../actions/dataUploadActions";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart,SUCCESS,INPROGRESS,HANA,MYSQL,MSSQL,HDFS,FILEUPLOAD} from  "../../helpers/helper"
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog';
import {DataCard}  from "./DataCard";
import {LatestDatasets} from "./LatestDatasets";

var dateFormat = require('dateformat');

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataList: store.datasets.dataList,
    dataPreview: store.datasets.dataPreview,
    userList:store.datasets.allUserList,
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
    this.props.dispatch(setEditModelValues("","",false));
    this.props.dispatch(fetchModelEdit(""))
    this.props.dispatch(storeSignalMeta(null, this.props.match.url));
    if (this.props.history.location.search.indexOf("page") != -1) {
      pageNo = this.props.history.location.search.split("page=")[1];
      this.props.dispatch(getDataList(pageNo));
    } else
      this.props.dispatch(getDataList(pageNo));
    }
  componentDidMount(){
     this.props.dispatch(refreshDatasets(this.props));
     this.props.dispatch(getAllUsersList(this.props));
     
  }

  openModelPopup() {
    this.props.dispatch(openDULoaderPopup())
  }
  closeModelPopup() {
    this.props.dispatch(closeDULoaderPopup())
  }
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
    }else{
        this.props.dispatch(storeSearchElement(e.target.value));
    }
  }

  doSorting(sortOn, type){
    if(this.props.data_search_element)
    this.props.history.push('/data?search='+this.props.data_search_element+'&sort='+sortOn + '&type='+type)
	  else
    this.props.history.push('/data?sort=' + sortOn + '&type='+type);

	 this.props.dispatch(storeSortElements(sortOn,type));
	this.props.dispatch(getDataList(1));
  }

  clearSearchElement(e){
    this.props.dispatch(storeSearchElement(""));
    if(this.props.data_sorton)
    this.props.history.push('/data?sort=' + this.props.data_sorton + '&type=' + this.props.data_sorttype)
    else
    this.props.history.push('/data');
    this.props.dispatch(getDataList(1));
  }

  render() {
    if (store.getState().datasets.dataPreviewFlag && this.props.dataPreview &&this.props.dataPreview.status!="FAILED") {
    	let _link = "/data/" + store.getState().datasets.selectedDataSet;
    	return (<Redirect to={_link}/>);
    }

    const dataSets = store.getState().datasets.dataList.data;
    if (dataSets) {
      const pages = store.getState().datasets.dataList.total_number_of_pages;
      const current_page = store.getState().datasets.dataList.current_page;
      let paginationTag = null;
      let dataList = <DataCard data={dataSets} match={this.props.match}/>;
      if (pages > 1) {
        paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
      }
      return (
        <div className="side-body">
        <LatestDatasets props={this.props}/>
          <div class="main-content">
            <div class="row">

              <div class="col-md-12">

			  <div class="btn-toolbar pull-right">
				<div class="input-group">
				<div className="search-wrapper">
					<input type="text" name="search_data"  value= {this.props.data_search_element} onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="type here to Search data" id="search_data" className="form-control search-box" placeholder="Search data..." required />
					<span className="zmdi zmdi-search form-control-feedback"></span>
					<button className="close-icon" type="reset" onClick={this.clearSearchElement.bind(this)}></button>
				</div>

				</div>
                  <div class="btn-group">
                    <button type="button" data-toggle="dropdown" title="Sorting" class="btn btn-default dropdown-toggle" aria-expanded="false">
                      <i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i>
                    </button>
                    <ul role="menu" class="dropdown-menu dropdown-menu-right">
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','asc')}><i class="zmdi zmdi-sort-amount-asc"></i>&nbsp;&nbsp;Name Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'name','desc')}><i class="zmdi zmdi-sort-amount-desc"></i>&nbsp;&nbsp;Name Descending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','asc')}><i class="zmdi zmdi-calendar-alt"></i>&nbsp;&nbsp;Date Ascending</a>
                        </li>
                        <li>
                          <a href="#" onClick={this.doSorting.bind(this,'created_at','desc')}><i class="zmdi zmdi-calendar"></i>&nbsp;&nbsp;Date Descending</a>
                        </li>
                    </ul>
                  </div>
				  </div>

              </div>
            </div>
            <div class="clearfix"></div>

            <div className="row">
            {dataList}
              <div className="clearfix"></div>
            </div>
            <div className="ma-datatable-footer" id="idPagination">
              <div className="dataTables_paginate">
                {paginationTag}
              </div>
            </div>
            <DataUploadLoader/>
            <Share usersList={this.props.userList}/>

        </div>
                </div>
      );
    } else {
      return (
        <div>
          <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
           <Dialog ref={(el) => { this.dialog = el }}/>
        </div>
      )
    }
  }

  handleSelect(eventKey) {
		if (this.props.data_search_element) {
      if(this.props.data_sorton)
      this.props.history.push('/data?search=' + this.props.data_search_element +'&sort='+this.props.data_sorton+ '&page=' + eventKey + '');
      else
      this.props.history.push('/data?search=' + this.props.data_search_element + '&page=' + eventKey + '');
    } else if(this.props.data_sorton){
	     this.props.history.push('/data?sort=' + this.props.data_sorton +'&type='+this.props.data_sorttype+'&page=' + eventKey + '');
	}else
this.props.history.push('/data?page=' + eventKey + '');

    this.props.dispatch(getDataList(eventKey));
  }
}
