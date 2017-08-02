import React from "react";
import LeftPanel from "./Panels/LeftPanel";
import TopPanel from "./Panels/TopPanel";
import ContentPanel from "./Panels/ContentPanel";
import {Login} from "./Login";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../store";



@connect((store) => {
  return {
       login_response: store.login.login_response};
})

export class Main extends React.Component {
  constructor(){
    super();
  }
  render() {

    console.log("Main is called!!");
    console.log(this.props);
    console.log(this.props.login_response);
    if (sessionStorage.userToken) {
      console.log("authorized!!!");
      return (
        <div className="main_wrapper">
          <LeftPanel/>
          <TopPanel/>
            {this.props.children}
        </div>
      );
    } else {
      alert("Session ended!!");
      return(<Redirect to={"/login"} />);
    }

  }
}
