import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {isEmpty} from "../../actions/helper"
@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis};
})

export class MasterSummary extends React.Component {
  constructor() {
    super();
  }
  render() {

    console.log("MasterSummary is called!!");
    console.log(this.props);
    console.log(this.props.signal);

    if(!isEmpty(this.props.signal)){
      console.log("inside if"+this.props.signal);
    const noOfDimention = this.props.signal.get_frequency_results.narratives.vartype.Dimentions;
    const noOfMeasures = this.props.signal.get_frequency_results.narratives.vartype.Measures;
    //const summary = this.props.signal.get_frequency_results.narratives.
}
    return (
      <div className="side-body">
        <MainHeader/>
        <div className="main-content">
          <div className="row">
            <div className="col-md-12">
              <div className="panel panel-default">
                <div className="panel-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="panel-body">
                        <div className="row">
                          <div className="col-md-offset-2 col-md-4">
                            <div className="widget widget-tile">
                              <div className="icon_ovr dmn"></div>
                              <div className="data-info">
                                <div className="value">
                                  <h1>6</h1>
                                </div>
                                <div className="desc">
                                  <h3>Dimension</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="widget widget-tile">
                              <div className="icon_ovr mes"></div>
                              <div className="data-info">
                                <div className="value">
                                  <h1>17</h1>
                                </div>
                                <div className="desc">
                                  <h3>Measures</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="clearfix"></div>
                          <div className="col-md-12">
                            <p className="lead">mAdvisor has analyzed the dataset and it contains
                              <strong>16</strong>
                              variables and
                              <strong>5000</strong>
                              observations. Of these 1 variable is omitted, since it is not fit for the analysis. The consolidated dataset has 4 measures and 11 dimensions. Please click next to find the insights from our analysis of age factoring the other variables</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 v_smry">
                      <h3>
                        <em>"Sales had a phenomenal growth during Jan-Dec"</em>
                      </h3>
                      <a href="#">
                        <img src="../../../assets/images/icon_proceedformore.png" className="img-responsive" alt="Proceed for More"/>
                        View Summary
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}
