import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
// import $ from "jquery";
import Breadcrumb from 'react-breadcrumb';
import renderHTML from 'react-render-html';
import {Card} from "./Card";
import {STATIC_URL} from "../../helpers/env.js"
import {clearToggleValue} from "../../actions/signalActions";

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis, toggleValues: store.signals.toggleValues };
})

export class MasterSummary extends React.Component {
  constructor() {
    super();
  }

  componentDidMount(){
    this.props.dispatch(clearToggleValue());    
  }
  render() {
    let heading = this.props.signal.name;
    var noOfDimention;
    var noOfMeasures;
    var noOfTimeDimention;
    var summary;
    var mText;
    var dText;
    var tText;

    noOfDimention = this.props.signal.listOfCards[0].cardData.noOfDimensions;
    noOfMeasures = this.props.signal.listOfCards[0].cardData.noOfMeasures;
    noOfTimeDimention = this.props.signal.listOfCards[0].cardData.noOfTimeDimensions;
    summary = this.props.signal.listOfCards[0].cardData.summaryHtml;
    var quotes = this.props.signal.listOfCards[0].cardData.quotesHtml; //.toString();

    if (noOfDimention > 1) {
      dText = "Dimensions";
    } else {
      dText = "Dimension";
    }

    if (noOfMeasures > 1) {
      mText = "Measures";
    } else {
      mText = "Measure";
    }

    if (noOfTimeDimention > 1) {
      tText = "Time Dimensions";
    } else {
      tText = "Time Dimension";
    }

    let firstOverviewSlug = this.props.signal.listOfNodes[0].slug;

    const overViewLink = "/signals/" + this.props.signalId + "/" + firstOverviewSlug;
    return (
      <div className="side-body">
        <div className="page-head">
          <div class="row">
            <div class="col-md-12">
            </div>
            
          </div>
          <div class="clearfix"></div>
        </div>
        <div className="main-content">
		<div class="row">
			<div class="col-md-12">
              <h3 className="xs-mt-0 xs-mb-0 text-capitalize"> {heading}</h3>
            </div>
		</div>
		<div class="row xs-pt-50" >
		<div class="col-md-3 wow bounceIn" data-wow-offset="10"  data-wow-iteration="10">
			<img src={STATIC_URL + "assets/images/data_overview.png"} className="img-responsive xs-mt-50"/>
		</div>
		<div class="col-md-9">
			<div class="row xs-mt-30">					
						<div className="col-md-4 wow bounceIn" data-wow-offset="20"  data-wow-iteration="20">
							<div className="box-shadow xs-p-10">							
							 
								<div className="col-xs-8">
									<h4 class="xs-mt-15">
									<img src={STATIC_URL + "assets/images/s_d_carIcon.png"}/> {dText}									 
									</h4>
								</div>
								<div className="col-xs-4">
										<h2 className="text-right"> 							
										{noOfDimention}
										</h2>
								</div>
								<div className="clearfix"></div>
							</div>
						</div>
						<div className="col-md-4 wow bounceIn" data-wow-offset="20"  data-wow-iteration="20">							
							<div className="box-shadow xs-p-10">
							 
								<div className="col-xs-8">
									<h4 class="xs-mt-15"><img src={STATIC_URL + "assets/images/s_m_carIcon.png"}/> {mText}</h4>
								</div>
								<div className="col-xs-4">
										<h2 className="text-right"> 							
										{noOfMeasures}
										</h2>
								</div>
							 <div className="clearfix"></div>
							</div>
						</div>
            <div className="col-md-4 wow bounceIn" data-wow-offset="20"  data-wow-iteration="20">							
							<div className="box-shadow xs-p-10">
							 
								<div className="col-xs-9"> 
									<h4 class="xs-mt-15"><img src={STATIC_URL + "assets/images/s_timeDimension.png"}/> {tText}</h4>
								</div>
								<div className="col-xs-3">
										<h2 className="text-right"> 							
										{noOfTimeDimention}
										</h2>
								</div>
							 <div className="clearfix"></div>
							</div>
						</div>
					</div>
					
					<div class="row wow bounceIn" data-wow-offset="20"  data-wow-iteration="20">					
						<div className="col-md-12">
							<div className="xs-pt-50">
							<Card cardData={summary}/>
							</div>
						</div>
					</div>
					
					<div class="row wow bounceIn" data-wow-offset="20"  data-wow-iteration="20">					
						<div className="col-md-12">
							<div className="xs-pt-50 text-right">
							 <Link to={overViewLink} className="btn btn-primary btn-md xs-pl-20 xs-pr-20 xs-pt-10 xs-pb-10">
                         <i className="fa fa-file-text-o"></i>  View Summary
                        </Link>
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
