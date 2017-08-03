import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {MasterSummary} from "./MasterSummary"

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis};
})

export class Signal extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    //alert("id:" + this.props.errandId);
    console.log(store.getState().signals.signalAnalysis);
    this.props.dispatch(getSignalAnalysis(sessionStorage.userToken, this.props.match.params.slug));
  }
  render() {

    console.log("selected Signal is called$$$$$$$$$$$$$$!!");
    console.log(this.props);
    return (<MasterSummary signalId={this.props.match.params.slug}/>);
  }
}
