import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
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
    // console.log(this.props);
    // console.log(this.props.signal);

    var noOfDimention;
    var noOfMeasures;
    var summary;

  //  console.log("inside if" + this.props.signal);
    var noOfDimention = this.props.signal.get_frequency_results.narratives.vartype.Dimensions;
    var noOfMeasures = this.props.signal.get_frequency_results.narratives.vartype.Measures;
    var summary = this.props.signal.get_frequency_results.narratives.summary.toString();
    // console.log(noOfMeasures);
    // console.log(noOfDimention);
    // console.log(summary);

    const overViewLink = "/signals/" + this.props.signalId + "/overview";
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
                          <div className="col-md-4 col-md-offset-1">
                            <div className="widget widget-tile">
								<div class="col-xs-4 icon_ovr">
									<img src="../assets/images/icon_dimension.png" class="img-responsive" />
								</div>
								<div class="col-xs-8 text-right data-info">
								<h1>{noOfDimention}</h1>
								<h3>Dimension</h3>
								</div>   
<div class="clearfix"></div>								
                            </div>
                          </div>
                          <div className="col-md-4 col-md-offset-1">
                            <div className="widget widget-tile">
								<div class="col-xs-4 icon_ovr ms">
									<img src="../assets/images/icon_measure.png" class="img-responsive" />
								</div>
								<div class="col-xs-8 text-right data-info">
								<h1>{noOfMeasures}</h1>
								<h3>Measures</h3>
								</div>
                               
                            </div>
                          </div>
                          <div className="clearfix"></div>
                          <div className="col-md-12">
                            <p className="lead">{summary}
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
