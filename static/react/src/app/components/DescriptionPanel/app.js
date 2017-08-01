import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {getList} from "../../actions/signalActions";
import $ from "jquery";
var dateFormat = require('dateformat');

@connect((store) => {
  //return {login_response: store.login.login_response, signalList: store.signals.signalList};
})

export class Apps extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
        console.log("apps component");
  }

  render() {
      return(
        <h3>Apps component</h3>
      );
  }
}
