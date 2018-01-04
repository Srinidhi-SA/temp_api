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
import {getDataList, getDataSetPreview, storeSignalMeta, handleDelete, handleRename,refreshDatasets} from "../../actions/dataActions";
import {fetchProductList, openDULoaderPopup, closeDULoaderPopup, storeSearchElement,storeSortElements} from "../../actions/dataActions";
import {DataUpload} from "./DataUpload";
import {open, close,triggerDataUploadAnalysis} from "../../actions/dataUploadActions";
import {STATIC_URL} from "../../helpers/env.js"
import {SEARCHCHARLIMIT,getUserDetailsOrRestart,SUCCESS,INPROGRESS} from  "../../helpers/helper"
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
  componentDidMount(){
      this.props.dispatch(refreshDatasets(this.props));
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
  openDataLoaderScreen(slug, percentage, message, e){
      var dataUpload = {};
      dataUpload.slug = slug
      this.props.dispatch(openDULoaderPopup());
      this.props.dispatch(triggerDataUploadAnalysis(dataUpload, percentage, message));
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
    // if(this.props.location.sort == "" || this.props.location.sort == null){
    // 	this.props.dispatch(storeSortElements("",null));
    // }
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
          
          var iconDetails = "";
          var dataSetLink = "/data/" + data.slug;
          
          var dataClick = <Link to={dataSetLink} id={data.slug} onClick={this.getPreviewData.bind(this)}>
            {data.name}
            </Link>
            if(data.status == INPROGRESS){
                iconDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">{data.completed_percentage}&nbsp;%</span></div>
                dataClick = <a class="cursor" onClick={this.openDataLoaderScreen.bind(this,data.slug,data.completed_percentage,data.completed_message)}> {data.name}</a>
            }else if(data.status == SUCCESS && !data.viewed){
                data.completed_percentage = 100;
                iconDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">{data.completed_percentage}&nbsp;%</span></div>
            }else{
                let src = STATIC_URL + "assets/images/File_Icon.png"
                if(data.datasource_type == "Hana"){
                  src = STATIC_URL + "assets/images/sapHana_Icon.png"
                }else if (data.datasource_type == "Mysql") {
                  src = STATIC_URL + "assets/images/mySQL_Icon.png"
                }
                iconDetails = <img src={src} className="img-responsive" alt="LOADING"/>;
            }
            
        
        
        return (
          <div className="col-md-3 xs-mb-15 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={data.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                  <div className="col-xs-9">
                    <h4 className="title newCardTitle">
                     {dataClick}
                    </h4>
                  </div>
                  <div className="col-xs-3">
                    {iconDetails}
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
                  <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={data}/> </Popover>}>
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
                        <i className="fa fa-trash-o"></i>&nbsp;&nbsp;{data.status == "INPROGRESS"
                            ? "Stop and Delete "
                                    : "Delete"}</a>
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
                <h3 className="xs-mt-0">Data</h3>
              </div>
              <div class="col-md-4">

			  <div class="btn-toolbar pull-right">
				<div class="input-group">
				{/*   <input type="text" name="search_data" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Search Data" id="search_data" class="form-control" placeholder="Search data..."/>*/}
				<div className="search-wrapper">
					<form>
					<input type="text" name="search_data" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Model Insights" id="search_data" className="form-control search-box" placeholder="Search data..." required />
					<span className="zmdi zmdi-search form-control-feedback"></span>
					<button className="close-icon" type="reset" onClick={this.clearSearchElement.bind(this)}></button>
					</form>
				</div>

				</div>
                  <div class="btn-group">
					{/*<button type="button" class="btn btn-default" title="Select All Card">
                      <i class="fa fa-address-card-o fa-lg"></i>
                    </button>*/}
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
          </div>
          <div className="main-content">
            <div className="row">
              {addButton}
              {
							(dataSetList.length>0)
							?(dataSetList)
							:(<div><div className="clearfix"></div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
							}

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
