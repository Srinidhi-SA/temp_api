import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {
  getList,
  emptySignalAnalysis,
  handleDelete,
  handleRename,
  storeSearchElement,
  storeSortElements,
  fetchCreateSignalSuccess,
  triggerSignalAnalysis,
  emptySignalData,
  refreshSignals,
  updateHide
} from "../../actions/signalActions";
import {
  Pagination,
  Tooltip,
  OverlayTrigger,
  Popover,
  Modal,
  Button
} from "react-bootstrap";
//import {BreadCrumb} from "../common/BreadCrumb";
import Breadcrumb from 'react-breadcrumb';
//import $ from "jquery";
var dateFormat = require('dateformat');
import {CreateSignal} from "./CreateSignal";
import {STATIC_URL} from "../../helpers/env";
import {SEARCHCHARLIMIT, getUserDetailsOrRestart, isEmpty, SUCCESS,INPROGRESS} from "../../helpers/helper"
import Dialog from 'react-bootstrap-dialog';
import {DetailOverlay} from "../common/DetailOverlay";
import {getAllDataList, hideDataPreview} from "../../actions/dataActions";
import {openCsLoaderModal, closeCsLoaderModal} from "../../actions/createSignalActions";
import {CreateSignalLoader} from "../common/CreateSignalLoader";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    signalList: store.signals.signalList.data,
    selectedSignal: store.signals.signalAnalysis,
    signal_search_element: store.signals.signal_search_element,
    signal_sorton: store.signals.signal_sorton,
    signal_sorttype: store.signals.signal_sorttype,
    signalAnalysis: store.signals.signalAnalysis
  };
})

export class Signals extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
    var pageNo = 1;
    this.props.dispatch(hideDataPreview())
    this.props.dispatch(getAllDataList());
    this.props.dispatch(emptySignalData());
    // this.props.dispatch(emptySignalAnalysis());
    if (this.props.history.location.search.indexOf("page") != -1) {
      pageNo = this.props.history.location.search.split("page=")[1];
      this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, pageNo));
    } else{
        this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, pageNo));
    }
    
    }

  componentDidMount() {
    console.log("/checking anchor html");
    console.log($('a[rel="popover"]'));
    this.props.dispatch(refreshSignals(this.props));
    /* var tmp = setInterval(function() {
      if ($('a[rel="popover"]').html()) {
        $('a[rel="popover"]').popover({
          container: 'body',
          html: true,
          trigger: 'focus',
          placement: 'auto right',
          content: function() {
            var clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
            return clone;
          }
        }).click(function(e) {
          e.preventDefault();
        });
        clearInterval(tmp);
      }
    }, 100);*/
  }

  handleSelect(eventKey) {
    if (this.props.signal_search_element) {
      if (this.props.signal_sorton) {
        this.props.history.push('/signals?search=' + this.props.signal_search_element + '&sort=' + this.props.signal_sorton + '&page=' + eventKey + '');
      } else {
        this.props.history.push('/signals?search=' + this.props.signal_search_element + '&page=' + eventKey + '');
      }
    } else if (this.props.signal_sorton) {
      this.props.history.push('/signals?sort=' + this.props.signal_sorton + '&type=' + this.props.signal_sorttype + '&page=' + eventKey + '');
    } else
      this.props.history.push('/signals?page=' + eventKey + '');
    this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, eventKey));
  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('searching');
      if (e.target.value != "" && e.target.value != null){
        if(this.props.signal_sorton)
        this.props.history.push('/signals?search='+e.target.value+'&sort=' + this.props.signal_sorton + '&type=' + this.props.signal_sorttype)
        else
        this.props.history.push('/signals?search=' + e.target.value + '')
}
      this.props.dispatch(storeSearchElement(e.target.value));
      this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
    }
  }
  doSorting(sortOn, type) {
    if(this.props.signal_search_element)
    this.props.history.push('/signals?name='+this.props.signal_search_element+'&sort='+ sortOn + '&type=' + type)
    else
    this.props.history.push('/signals?sort=' + sortOn + '&type=' + type);

    this.props.dispatch(storeSortElements(sortOn, type));
    this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
  }

  handleDelete(slug,evt) {
    this.props.dispatch(handleDelete(slug, this.refs.dialog,evt));
  }

  handleRename(slug, name) {
    this.props.dispatch(handleRename(slug, this.refs.dialog, name));
  }

  getSignalAnalysis(e) {
    console.log("Link Onclick is called")
    console.log(e.target.id);
    this.props.dispatch(emptySignalAnalysis());
  }
  openLoaderScreen(slug, percentage, message, e) {
    var signalData = {};
    signalData.slug = slug
    this.props.dispatch(openCsLoaderModal());
    this.props.dispatch(updateHide(true))
    this.props.dispatch(emptySignalAnalysis());
    this.props.dispatch(triggerSignalAnalysis(signalData, percentage, message));
    
    //this.props.history.push('/signals/'+slug);
  }
  onChangeOfSearchBox(e) {
    if (e.target.value == "" || e.target.value == null) {
      this.props.dispatch(storeSearchElement(""));
      if(this.props.signal_sorton)
      this.props.history.push('/signals?sort=' + this.props.signal_sorton + '&type=' + this.props.signal_sorttype)
      else
      this.props.history.push('/signals');
      this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));

    } else if (e.target.value.length > SEARCHCHARLIMIT) {
      if(this.props.signal_sorton)
      this.props.history.push('/signals?search='+e.target.value+'&sort=' + this.props.signal_sorton + '&type=' + this.props.signal_sorttype)
      else
      this.props.history.push('/signals?search=' + e.target.value + '')
      this.props.dispatch(storeSearchElement(e.target.value));
      this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
    }
  }
  clearSearchElement(e){
    this.props.dispatch(storeSearchElement(""));
    if(this.props.signal_sorton)
    this.props.history.push('/signals?sort=' + this.props.signal_sorton + '&type=' + this.props.signal_sorttype)
    else
    this.props.history.push('/signals');
    this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
  }
  render() {
    console.log("signals is called##########3");
    document.body.className = "";
    // h:MM
    // let parametersForBreadCrumb = [];
    // parametersForBreadCrumb.push({name:"Signals"});

    //empty search element
    if (this.props.signal_search_element != "" && (this.props.location.search == "" || this.props.location.search == null)) {
      console.log("search is empty");
      this.props.dispatch(storeSearchElement(""));
      let search_element = document.getElementById('search_signals');
      if (search_element)
        document.getElementById('search_signals').value = "";
      }
    // if (this.props.location.sort == "" || this.props.location.sort == null) {
    //   this.props.dispatch(storeSortElements("", null));
    // }
    //search element ends..

    if (!isEmpty(store.getState().signals.signalAnalysis)) {
      let _link = "/signals/" + store.getState().signals.signalAnalysis.slug;
      return (<Redirect to={_link}/>);
    }

    console.log(this.props);
    const data = this.props.signalList;
    const pages = store.getState().signals.signalList.total_number_of_pages;
    const current_page = store.getState().signals.signalList.current_page;
    let addButton = null;
    let paginationTag = null
    if (current_page == 1 || current_page == 0) {
      addButton = <CreateSignal url={this.props.match.url}/>
    }
    if (pages > 1) {
      paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
    }

    if (data) {
      console.log("under if data condition!!")

      const storyList = data.map((story, i) => {
        var iconDetails = "";

        var signalLink = "/signals/" + story.slug;
        var signalClick = <Link to={signalLink} id={story.slug} onClick={this.getSignalAnalysis.bind(this)} className="title">
          {story.name}
          </Link>
          if(story.status == INPROGRESS){
              iconDetails =   <div class=""><i className="fa fa-circle inProgressIcon"></i><span class="inProgressIconText">{story.completed_percentage}&nbsp;%</span></div>
              signalClick = <a class="cursor" onClick={this.openLoaderScreen.bind(this,story.slug,story.completed_percentage,story.completed_message)}> {story.name}</a>
          }else if(story.status == SUCCESS && !story.viewed){
              story.completed_percentage = 100;
              iconDetails =   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">{story.completed_percentage}&nbsp;%</span></div>
          }else{
              if (story.type == "dimension") {
                  var imgLink = STATIC_URL + "assets/images/s_d_carIcon.png"
              } else {
                  var imgLink = STATIC_URL + "assets/images/s_m_carIcon.png"
              }
              iconDetails = <img src={imgLink} alt="LOADING"/>;
          }


        return (
          <div className="col-md-3 xs-mb-15 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={story.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                  <div className="col-xs-12">
                    <h5 className="title newCardTitle pull-left">
                      {signalClick}					 
                    </h5>
					
					 <div class="btn-toolbar pull-right">
						 {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
				 
                    <li onClick={this.handleRename.bind(this, story.slug, story.name)}>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>&nbsp;&nbsp;Rename</a>
                    </li>

                    <li onClick={this.handleDelete.bind(this, story.slug)}>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>&nbsp;&nbsp;{story.status == "INPROGRESS"
                          ? "Stop and Delete "
                          : "Delete"}</a>
                    </li>
                  </ul>
                  {/*<!-- End Rename and Delete BLock  -->*/}
					  </div>
					  
					  
					  <div className="clearfix"></div>					
					 
					<div class="inProgressIcon">
						   <i class="fa fa-circle"></i>
						   <span class="inProgressIconText">&nbsp;{story.completed_percentage}&nbsp;%</span>
					</div>
						
					<OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={story}/> </Popover>}>
					<a className="pover cursor">
					<div class="card_icon">
					{iconDetails}
					</div></a>
					</OverlayTrigger>
							
                  </div>
						
                {/*  <div className="col-xs-3">
                     <img src={imgLink} className="img-responsive" alt="LOADING"/>
                   <div class=""><i className="fa fa-circle inProgressIcon"></i></div>
                   <div class=""><i className="fa fa-check completedIcon"></i><span class="inProgressIconText">100%</span></div>
                  </div> */}
				  
				  
                </div>
              </div>
              <div className="card-footer">
                <div className="left_div">
                  <span className="footerTitle"></span>{story.username}
                  <span className="footerTitle footerTitle-lineh">{dateFormat(story.created_at, "mmm d,yyyy HH:MM")}</span>
                </div>

                
                {/*popover*/}

              </div>
            </div>
          </div>
        )
      });

      return (
        <div className="side-body">
          {/* <MainHeader/>*/}
          {/*<!-- Page Title and Breadcrumbs -->*/}
          <div class="page-head">
            {/*<!-- <ol class="breadcrumb">
                <li><a href="#">Story</a></li>
                <li class="active">Sales Performance Report</li>
              </ol> -->*/}

            <div class="row">
              <div class="col-md-8">
                <h3 className="xs-mt-0">Signals</h3>
              </div>
              <div class="col-md-4">
                <div class="btn-toolbar pull-right">
                  <div class="input-group">
                    <div className="search-wrapper">
                      <form>
                        <input type="text" name="search_signals" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Search Signals" id="search_signals" className="form-control search-box" placeholder="Search signals..." required/>
                        <span className="zmdi zmdi-search form-control-feedback"></span>
                        <button className="close-icon" onClick={this.clearSearchElement.bind(this)} type="reset"></button>
                      </form>
                    </div>
                  </div>
                  <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                      <i class="zmdi zmdi-hc-lg zmdi-sort-asc"></i>
                    </button>
                    <ul role="menu" class="dropdown-menu dropdown-menu-right">
                    <li>
                        <a href="#" onClick={this.doSorting.bind(this, 'name', 'asc')}>
                          <i class="zmdi zmdi-sort-amount-asc"></i>
                          &nbsp;&nbsp;Name Ascending</a>
                      </li>
                      <li>
                        <a href="#" onClick={this.doSorting.bind(this, 'name', 'desc')}>
                          <i class="zmdi zmdi-sort-amount-desc"></i>
                          &nbsp;&nbsp;Name Descending</a>
                      </li>
                      <li>
                        <a href="#" onClick={this.doSorting.bind(this, 'created_at', 'asc')}>
                          <i class="zmdi zmdi-calendar-alt"></i>
                          &nbsp;&nbsp;Date Ascending</a>
                      </li>
                      <li>
                        <a href="#" onClick={this.doSorting.bind(this, 'created_at', 'desc')}>
                          <i class="zmdi zmdi-calendar"></i>
                          &nbsp;&nbsp;Date Descending</a>
                      </li>
                    </ul>
                  </div>
                </div>
				
				</div>				
              </div>
            </div>
           

          <div className="main-content">
            <div className="row">
              {addButton}
              {
							(storyList.length>0)
							?(storyList)
							:(<div><div className="clearfix"></div><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
							}
              <div className="clearfix"></div>
            </div>

            <div className="ma-datatable-footer" id="idSignalPagination">
              <div className="dataTables_paginate">
                {paginationTag}
              </div>
            </div>
          </div>
          <Dialog ref="dialog"/>
          <CreateSignalLoader history={this.props.history}/>
        </div>
      );
    } else {
      return (
        <div><Breadcrumb path={[{
            path: '/signals',
            label: 'Signals'
          }
        ]}/>
          <div>
            <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
          </div>
        </div>
      )
    }
    }
}
