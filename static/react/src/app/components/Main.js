import React from "react";
import LeftPanel from "./common/LeftPanel";
import TopPanel from "./common/TopPanel";
import {Login} from "./Login";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../store";
import {isEmpty,setUserDetails,getUserDetailsOrRestart} from "../helpers/helper";


@connect((store) => {
  return {
       login_response: store.login.login_response};
})

export class Main extends React.Component {
  constructor(props){
    super(props);
	console.log("props in main:::");
	console.log(props);
  }
  render() {

    console.log("Main is called!!");
    console.log(this.props);
    // console.log(this.props.login_response);
    if (document.cookie.indexOf("JWT ") > 0 ) {
      return (
        <div className="main_wrapper">
          <LeftPanel/>
          <TopPanel/>
            {this.props.children}
        </div>
      );
    } else {
      console.log("Session ended!!");
      bootbox.alert("Session Timeout. Please login again to continue.")
      return(<Redirect to={"/login"} />);
    }

  }
}
