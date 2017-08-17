import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
// import $ from "jquery";
import Breadcrumb from 'react-breadcrumb';
import renderHTML from 'react-render-html';
import {Card} from "./Card";


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
    let heading = this.props.signal.name;

    var noOfDimention;
    var noOfMeasures;
    var summary;


     noOfDimention = this.props.signal.listOfCards[0].cardData.noOfDimensions;
      noOfMeasures = this.props.signal.listOfCards[0].cardData.noOfMeasures;
      summary = this.props.signal.listOfCards[0].cardData.summaryHtml;
     var quotes = this.props.signal.listOfCards[0].cardData.quotesHtml.toString();
    //  var noOfDimention = 10;
    //  var noOfMeasures = 9;
    // var summary = "mAdvisor has analyzed the dataset, which contains<b> 15</b> variables and <b>5,000</b> observations. Please click next to find the insights from our analysis of <b>platform</b>, that describes how it is distributed, what drives it, and how we can predict it.";
    // var quotes = "not coming from backend!!";
    // // console.log(noOfMeasures);
    // console.log(noOfDimention);
    // console.log(summary);
    let firstOverviewSlug = this.props.signal.listOfNodes[0].slug;

    const overViewLink = "/signals/" + this.props.signalId + "/"+ firstOverviewSlug;
    return (
      <div className="side-body">
      <div className="page-head">
        <div class="row">
          <div class="col-md-12">
          <Breadcrumb path={[{
              path: '/signals',
              label: 'Signals'
            },
            {
              path:'/signals/'+this.props.signalId,
              label: heading
            }
          ]}/>
          </div>
          <div class="col-md-8">
            <h2>{heading}</h2>
          </div>
          </div>
        <div class="clearfix"></div>
      </div>
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
                            <p className="lead"><Card cardData={summary}/>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 v_smry">
                      <h3>
                        <em>{quotes}</em>
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
