import React from "react";
import ContentPanel from "../common/ContentPanel";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../store";



@connect((store) => {
  return {
       login_response: store.login.login_response};
})

export class Signals extends React.Component {
  constructor(){
    super();
  }
  render() {

    console.log("Signals is called!!");
    console.log(this.props.login_response);
    <div>
        Hi you are in Signals
    </div>
  }
}
