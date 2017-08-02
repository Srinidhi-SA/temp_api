import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";


@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis};
})

export class OverView extends React.Component {
  constructor() {
    super();
  }

  render() {

    console.log("overView is called$$$$$$$$$$$$$$!!");
    console.log(this.props);
    return (  <div><div className="side-body">
          <MainHeader/>
          <div className="main-content">
          in overview!!!!
          </div>
        </div>
        </div>

    );
  }
}
