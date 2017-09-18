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
            <div className="row">
              <div className="col-md-8">
                <h2>User Profile</h2>
              </div>
            </div>
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
          <div key = {i} className="col-md-2 co-sm-4 col-xs-6">
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
                
                  <div className="user-avatar col-md-2 text-center"><img src={STATIC_URL + "assets/images/avatar.png"} className="img-responsive img-center img-circle xs-p-20"/></div>
                  <div className="user-info col-md-10">

                    <div className="panel-default">

                      <div className="panel-body">
                        <div className="row">
                          <div className="col-md-12">
                            <h3>{sessionStorage.userName}</h3>
                            <table className="full-table-width no-border no-strip skills">
                              <tbody className="no-border-x no-border-y full-width">
                                <tr>
                                  <td className="item">
                                    <span className="fa fa-envelope fa-lg"></span> <b>
                                       {sessionStorage.email}</b>
                                  </td>

                                </tr>
                                <tr>
                                  <td className="item text-bold">
                                    <span className="fa fa-phone-square fa-lg"></span> <b>
                                       (999) 999-9999</b>
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
              <div className="row xs-p-10">
                {statsList}
              </div>
            </div>
            <div className="xs-p-10"></div>
            <div className="row">
            <div className="col-md-4">
            <h5 class="text-center">TOTAL SPACE</h5>
            <C3Chart classId="_profile" data={this.props.profileInfo.chart_c3}/>
              {/*
              <img src="images/userProfileGraph.png" className="img-responsive"/>*/}
            </div>
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-12 text-right">
                  <p className="xs-p-20">
                    First Login : <b> {sessionStorage.date}</b>
                    {/*<br/>
                    Subscription Left :
                    <b>25 Days</b>*/}
                  </p>
                </div>
                <div className="clearfix"></div>
                <div className="col-md-8">
                  <div className="panel xs-p-20 minHP">
                    <p>{renderHTML(this.props.profileInfo.comment)}</p>
                  </div>

                </div>
                <div className="col-md-4">
                  {/*<div className="panel text-center xs-p-20 minHP">
                    <a href="#">
                      <img src="images/launch_icon.png"/><br/>
                      UPGRADE ACCOUNT SERVICE
                    </a>
                  </div>*/}
                </div>
                <div className="clearfix"></div>
              </div>
            </div>
          </div>

          </div>
          {/*<!-- /.Page Content Area --> */}
          {/*<div className="side-body">
          <div className="main-content">
            <div className="user-profile">
              <div className="user-display">
                <div className="photo">&nbsp;</div>
                <div className="bottom">
                  <div className="user-avatar"><img src="../assets/images/avatar.png"/></div>
                  <div className="user-info">

                    <div className="info-block panel panel-default">
                      <div className="panel-heading">
                        <h4>{sessionStorage.userName}</h4>
                      </div>
                      <div className="panel-body">
                        <table className="no-border no-strip skills">
                          <tbody className="no-border-x no-border-y">
                            <tr>
                              <td className="item">
                                <span className="fa fa-envelope fa-lg"></span>{sessionStorage.email}</td>

                            </tr>
                            <tr>
                              <td className="item">
                                <span className="fa fa-user fa-lg"></span>
                                {dateFormat(sessionStorage.date, "dd mmmm yyyy")}</td>

                            </tr>
                            <tr>
                              <td className="item">
                                <span className="fa fa-phone-square fa-lg"></span>
                                (999) 999-9999</td>

                            </tr>

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>*/}
        </div>

      );
    }

  }
}
