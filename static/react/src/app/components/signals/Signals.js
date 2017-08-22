import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {getList,emptySignalAnalysis} from "../../actions/signalActions";
import {Pagination} from "react-bootstrap";
//import {BreadCrumb} from "../common/BreadCrumb";
import Breadcrumb from 'react-breadcrumb';
//import $ from "jquery";
var dateFormat = require('dateformat');
import {CreateSignal} from "./CreateSignal";
import {STATIC_URL} from "../../helpers/env";

@connect((store) => {
  return {login_response: store.login.login_response, signalList: store.signals.signalList.data, selectedSignal: store.signals.signalAnalysis};
})

export class Signals extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
	  var pageNo = 1;
	  if(this.props.history.location.pathname.indexOf("page") != -1){
		  pageNo = this.props.history.location.pathname.split("page=")[1];
		  this.props.dispatch(getList(sessionStorage.userToken,pageNo));
	  }else
		  this.props.dispatch(getList(sessionStorage.userToken,pageNo));
  }

  componentDidMount() {
    console.log("/checking anchor html");
    console.log($('a[rel="popover"]'));
    var tmp = setInterval(function() {
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
    }, 100);
  }

  
  handleSelect(eventKey) {
		this.props.history.push('/signals?page='+eventKey+'')
		this.props.dispatch(getList(sessionStorage.userToken,eventKey));	
	}

 
  getSignalAnalysis(e){
	  console.log("Link Onclick is called")
	  console.log(e.target.id);
	  this.props.dispatch(emptySignalAnalysis());
  }
  render() {
    console.log("signals is called##########3");
	document.body.className = "";
// h:MM
    // let parametersForBreadCrumb = [];
    // parametersForBreadCrumb.push({name:"Signals"});

    console.log(this.props);
    const data = this.props.signalList;
    const pages = store.getState().signals.signalList.total_number_of_pages;
	const current_page = store.getState().signals.signalList.current_page;
	let addButton = null;
	let paginationTag = null
	if(current_page == 1 || current_page == 0){
		addButton = <CreateSignal url={this.props.match.url}/>
	}
	if(pages > 1){
		paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
	}
	
    if (data) {
      console.log("under if data condition!!")
      const storyList = data.map((story, i) => {
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
                    <img src={ STATIC_URL + "assets/images/d_cardIcon.png" } className="img-responsive" alt="LOADING"/>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="left_div">
                  <span className="footerTitle"></span>{story.username}
                  <span className="footerTitle">{dateFormat(story.created_at, "mmm d,yyyy")}</span>
                </div>

                <div className="card-deatils">
                  {/*<!-- Popover Content link -->*/}
                  <a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover">
                    <i className="ci pe-7s-info pe-2x"></i>
                  </a>

                  {/*<!-- Rename and Delete BLock  -->*/}
                  <a className="dropdown-toggle more_button" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                    <i className="ci pe-7s-more pe-rotate-90 pe-2x"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <li>
                      <a className="dropdown-item" href="#renameCard" data-toggle="modal">
                        <i className="fa fa-edit"></i>  Rename</a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#deleteCard" data-toggle="modal">
                        <i className="fa fa-trash-o"></i>  Delete</a>
                    </li>
                  </ul>
                  {/*<!-- End Rename and Delete BLock  -->*/}
                </div>
                {/*popover*/}
                <div id="myPopover" className="pop_box hide">
                  <h4>Created By :
                    <span className="text-primary">{sessionStorage.userName}</span>
                  </h4>
                  <h5>Updated on :
                    <mark>10.10.2017</mark>
                  </h5>
                  <hr className="hr-popover"/>
                  <p>
                    Data Set : {story.dataset_name}<br/>
                    Variable selected : {story.variable_selected}<br/>
                    Variable type : {story.variable_type}</p>
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
            {/* <MainHeader/>*/}
			
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
            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
          </div>
        </div>
      )
    }
  }
  
	
	
}
