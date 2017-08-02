import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {isEmpty} from "../../actions/helper";
import $ from "jquery";
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

    var noOfDimention;
    var noOfMeasures;
    var summary;

    if (!isEmpty(this.props.signal)) {
      console.log("inside if" + this.props.signal);
      noOfDimention = this.props.signal.get_frequency_results.narratives.vartype.Dimensions;
      noOfMeasures = this.props.signal.get_frequency_results.narratives.vartype.Measures;
      summary = this.props.signal.get_frequency_results.narratives.summary.toString();
      console.log(noOfMeasures);
      console.log(noOfDimention);
      console.log(summary);

    }
    const overViewLink="/signals/"+this.props.signalId+"/overview";
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
                                  <h1>{noOfDimention}</h1>
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
                                  <h1>{noOfMeasures}</h1>
                                </div>
                                <div className="desc">
                                  <h3>Measures</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="clearfix"></div>
                          <div className="col-md-12">
                            <p className="lead">${summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 v_smry">
                      <h3>
                        <em>"Sales had a phenomenal growth during Jan-Dec"</em>
                      </h3>
                      <Link to={overViewLink}>
                        <img src="../../../assets/images/icon_proceedformore.png" className="img-responsive" alt="Proceed for More"/>
                        View Summary
                      </Link>
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
