import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {getList} from "../../actions/signalActions";
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
  constructor() {
    super();
  }
  componentWillMount() {
    this.props.dispatch(getList(sessionStorage.userToken));
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



  render() {
    console.log("signals is called##########3");
	document.body.className = "";

    // let parametersForBreadCrumb = [];
    // parametersForBreadCrumb.push({name:"Signals"});

    console.log(this.props);
    // console.log(store.getState().signals.signalList.errands)

    const data = this.props.signalList;

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
                      <Link to={signalLink} id={story.slug}>
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
                  <span className="footerTitle">{dateFormat(story.created_at, "mmm d,yyyy h:MM")}</span>
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
        <div>
          <div className="side-body">
            {/* <MainHeader/>*/}
			<div class="page-head">
            <Breadcrumb path={[{
                path: '/signals',
                label: 'Signals'
              }
            ]}/>
			</div>
            <div className="main-content">
				<div className="row">
					<CreateSignal url={this.props.match.url}/>
					{storyList} 
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
