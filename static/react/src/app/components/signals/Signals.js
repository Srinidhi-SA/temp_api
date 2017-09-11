import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {getList, emptySignalAnalysis, handleDelete, handleRename, storeSearchElement} from "../../actions/signalActions";
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
import {SEARCHCHARLIMIT} from  "../../helpers/helper"
import Dialog from 'react-bootstrap-dialog';
import {DetailOverlay} from "../common/DetailOverlay";
import {getAllDataList} from "../../action/dataActions";

@connect((store) => {
  return {login_response: store.login.login_response, signalList: store.signals.signalList.data, selectedSignal: store.signals.signalAnalysis, signal_search_element: store.signals.signal_search_element};
})

export class Signals extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
    var pageNo = 1;
    this.props.dispatch(getAllDataList());
    if (this.props.history.location.pathname.indexOf("page") != -1) {
      pageNo = this.props.history.location.pathname.split("page=")[1];
      this.props.dispatch(getList(sessionStorage.userToken, pageNo));
    } else
      this.props.dispatch(getList(sessionStorage.userToken, pageNo));
    }

  componentDidMount() {
    console.log("/checking anchor html");
    console.log($('a[rel="popover"]'));
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
      this.props.history.push('/signals?search=' + this.props.signal_search_element + '&page=' + eventKey + '');
    } else
      this.props.history.push('/signals?page=' + eventKey + '');
    this.props.dispatch(getList(sessionStorage.userToken, eventKey));
  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('searching');
      if (e.target.value != "" && e.target.value != null)
        this.props.history.push('/signals?search=' + e.target.value + '')

      this.props.dispatch(storeSearchElement(e.target.value));
      this.props.dispatch(getList(sessionStorage.userToken, 1));
    }
  }

  handleDelete(slug) {
    this.props.dispatch(handleDelete(slug, this.refs.dialog));
  }

  handleRename(slug, name) {
    this.props.dispatch(handleRename(slug, this.refs.dialog, name));
  }

  getSignalAnalysis(e) {
    console.log("Link Onclick is called")
    console.log(e.target.id);
    this.props.dispatch(emptySignalAnalysis());
  }
  onChangeOfSearchBox(e) {
    if (e.target.value == "" || e.target.value == null) {
      this.props.dispatch(storeSearchElement(""));
      this.props.history.push('/signals');
      this.props.dispatch(getList(sessionStorage.userToken, 1));

    } else if (e.target.value.length > SEARCHCHARLIMIT) {
      this.props.history.push('/signals?search=' + e.target.value + '')
      this.props.dispatch(storeSearchElement(e.target.value));
      this.props.dispatch(getList(sessionStorage.userToken, 1));
    }
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
    //search element ends..

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
        if (story.type == "dimension") {
          var imgLink = STATIC_URL + "assets/images/d_cardIcon.png"
        } else {
          var imgLink = STATIC_URL + "assets/images/m_carIcon.png"
        }
        var signalLink = "/signals/" + story.slug;
        return (

          <div className="col-md-3 top20 list-boxes" key={i}>
            <div className="rep_block newCardStyle" name={story.name}>
              <div className="card-header"></div>
              <div className="card-center-tile">
                <div className="row">
                  <div className="col-xs-9">
                    <h4 className="title newCardTitle">
                      <Link to={signalLink} id={story.slug} onClick={this.getSignalAnalysis.bind(this)}>
                        {story.name}
                      </Link>
                    </h4>
                  </div>
                  <div className="col-xs-3">
                    <img src={imgLink} className="img-responsive" alt="LOADING"/>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="left_div">
                  <span className="footerTitle"></span>{story.username}
                  <span className="footerTitle">{dateFormat(story.created_at, "mmm d,yyyy h:MM")}</span>
                </div>

                <div className="card-deatils">
                  {/*<!-- Popover Content link -->*/}
                  <OverlayTrigger trigger="click" rootClose placement="left" overlay={< Popover id = "popover-trigger-focus" > <DetailOverlay details={story}/> < /Popover>}>
                    <a className="pover cursor">
                      <i className="ci pe-7s-info pe-2x"></i>
                    </a>
                  </OverlayTrigger>

                  {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <li onClick={this.handleRename.bind(this, story.slug, story.name)}>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>
                        Rename</a>
                    </li>
                    <li onClick={this.handleDelete.bind(this, story.slug)}>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>
                        Delete</a>
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
          {/* <MainHeader/>*/}
          {/*<!-- Page Title and Breadcrumbs -->*/}
          <div class="page-head">
            {/*<!-- <ol class="breadcrumb">
                <li><a href="#">Story</a></li>
                <li class="active">Sales Performance Report</li>
              </ol> -->*/}

              <div class="row">
                <div class="col-md-8">
                  <h4>Signals</h4>
                </div>
                <div class="col-md-4">
                  <div class="input-group pull-right">
<div className="search-wrapper">
	<form>
                    <input type="text" name="search_signals" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Search Signals" id="search_signals" className="form-control search-box" placeholder="Search signals..." required />
                    <button className="close-icon" type="reset"></button>
					</form>
					</div>
                    {/*<span class="input-group-btn">
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
                    </span>*/}
                  </div>

                </div>
              </div>


            <div class="clearfix"></div>
          </div>

          <div className="main-content">
            <div className="row">
              {addButton}
              {storyList}
              <div className="clearfix"></div>
            </div>
            <div className="ma-datatable-footer" id="idSignalPagination">
              <div className="dataTables_paginate">
                {paginationTag}
              </div>
            </div>
          </div>
          <Dialog ref="dialog"/>
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
