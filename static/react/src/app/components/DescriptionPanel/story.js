import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {getList} from "../../actions/signalActions";
import $ from "jquery";
var dateFormat = require('dateformat');

@connect((store) => {
  //return {login_response: store.login.login_response, signalList: store.signals.signalList};
})

export class Stories extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
        console.log("story component");
  }

  render() {
      return(
        <h3>Story component</h3>
      );
  }
}
