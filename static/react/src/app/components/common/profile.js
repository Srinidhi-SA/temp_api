import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import store from "../../store";
import {isEmpty} from "../../helpers/helper";
import {getUserProfile} from "../../actions/loginActions";
var dateFormat = require('dateformat');
import Breadcrumb from 'react-breadcrumb';
import {STATIC_URL} from "../../helpers/env";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';

@connect((store) => {
  return {login_response: store.login.login_response, profileInfo: store.login.profileInfo};
})

export class Profile extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
  }
  componentWillMount() {
    if (isEmpty(this.props.profileInfo))
      this.props.dispatch(getUserProfile(sessionStorage.userToken))
  }

  componentDidMount() {}

  render() {

    if (isEmpty(this.props.profileInfo)) {
      return (
        <div className="side-body">
          {/*<!-- Page Title and Breadcrumbs -->*/}
          <div className="page-head">

            <h3>User Profile</h3>

          </div>
          <div className="main-content">
            <div>
              <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
            </div>
          </div>
        </div>
      )
    } else {
      console.log("profile info!!")
      console.log(this.props)
      console.log(this.props.profileInfo.info)
      let statsList = this.props.profileInfo.info.map((analysis, i) => {
        console.log(analysis)
        return (
          <div key={i} className="col-md-2 co-sm-4 col-xs-6">
            <h2 className="text-center text-primary">{analysis.count}<br/>
              <small>{analysis.displayName}
              </small>
            </h2>
          </div>
        )
      });
      return (
        <div className="side-body">

          {/*<!-- Page Title and Breadcrumbs -->*/}
          <div className="page-head">
            {/*<!-- <ol className="breadcrumb">
            <li><a href="#">Story</a></li>
            <li className="active">Sales Performance Report</li>
          </ol> -->*/}
            <div className="row">
              <div className="col-md-8">
                <h2>User Profile</h2>
              </div>

            </div>

          </div>
          {/*<!-- /.Page Title and Breadcrumbs -->

            <!-- Page Content Area -->*/}
          <div className="main-content">

            <div className="user-profile">
              <div className="user-display xs-p-10">
                <div className="user-avatar col-md-2 text-center"><img src={STATIC_URL + "assets/images/avatar.png"} className="img-responsive img-center img-circle"/></div>
                <div className="user-info col-md-10">

                  <div className="panel-default">

                    <div className="panel-body">
                      <div className="row">
                        <div className="col-md-12">
                          <h3>{sessionStorage.userName}</h3>
                          <table className="full-table-width no-border no-strip skills">
                            <tbody className="no-border-x no-border-y full-width">
                              <tr>
                                <td className="item xs-pt-5" width="30">
                                  <span className="fa fa-envelope-o fa-lg"></span>
                                </td>
                                <td className="xs-pt-5">
                                  <b>
                                    {sessionStorage.email}</b>
                                </td>
                              </tr>
                              <tr>
                                <td className="item xs-pt-5">
                                  <span className="fa fa-phone fa-lg"></span>
                                </td>
                                <td className="xs-pt-5">
                                  <b>
                                    (999) 999-9999
                                  </b>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/*<div className="col-md-4 text-right xs-p-20">
                                 <a href="#" className="btn btn-primary">Edit Profile</a>
                               </div>*/}
                      </div>

                    </div>
                  </div>
                </div>
                <div className="clearfix"></div>

              </div>
              <div className="clearfix"></div>
              <div className="row">
                {statsList}
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="minHP">
                  <h5 class="text-center xs-pt-20">TOTAL SPACE</h5>
                  <C3Chart classId="_profile" data={this.props.profileInfo.chart_c3}/> {/*
              <img src="images/userProfileGraph.png" className="img-responsive"/>*/}
                </div>
              </div>
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-12 text-right">
                    <p className="xs-p-20">
                      First Login :
                      <b> {dateFormat(sessionStorage.date, "mmm d,yyyy")}</b>
                      {/*<br/>
                    Subscription Left :
                    <b>25 Days</b>*/}
                    </p>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-12">
                    <div className="panel xs-p-30 minHP">
                      <p>{renderHTML(this.props.profileInfo.comment)}</p>
                    </div>
                  </div>
                  {/*  <div className="col-md-4">
                  <div className="panel text-center xs-p-20 minHP">
                    <a href="#">
                      <img src="images/launch_icon.png"/><br/>
                      UPGRADE ACCOUNT SERVICE
                    </a>
                  </div>
                </div>*/}
                  <div className="clearfix"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

      );
    }

  }
}
