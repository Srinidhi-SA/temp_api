import React from "react";
import store from "../../store";
import {connect} from "react-redux";

import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {Link, Redirect} from "react-router-dom";
import {updateSelectedApp,updateModelSummaryFlag,uploadStockAnalysisFlag,closeAppsLoaderValue,updateScoreSummaryFlag,clearModelSummary,showRoboDataUploadPreview,updateAudioFileSummaryFlag} from "../../actions/appActions";
import {STATIC_URL} from "../../helpers/env.js"
import {APPID1,APPID2,APPID3,APPID4,APPNAME1,APPNAME2,APPNAME3,APPNAME4,APPNAME5,APPID5} from "../../helpers/helper.js"

@connect((store) => {
	return {login_response: store.login.login_response,
		modelList: store.apps.modelList,
		modelSummaryFlag:store.apps.modelSummaryFlag,
		modelSlug:store.apps.modelSlug,
		currentAppId:store.apps.currentAppId,
		};
})

export class AppsPanel extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
  }
  gotoAppsList(appId,appName){
	  this.props.dispatch(updateSelectedApp(appId,appName));
	  this.props.dispatch(updateModelSummaryFlag(false));
	  this.props.dispatch(updateScoreSummaryFlag(false));
	  this.props.dispatch(showRoboDataUploadPreview(false));
	  this.props.dispatch(updateAudioFileSummaryFlag(false));
	  this.props.dispatch(closeAppsLoaderValue());
	  this.props.dispatch(uploadStockAnalysisFlag(false));
	  this.props.dispatch(clearModelSummary());
  }
  render() {
    console.log("Apps panel is called##########3");

    return (
          <div className="side-body">
            <div className="main-content">

            <div className="panel">
			<div className="panel-body">

				<div class="row">
					<div class="col-md-4">

						
						<div className="app-block"> 
							<Link onClick={this.gotoAppsList.bind(this,APPID1,APPNAME1)} className="app-link" to='/apps/1/models'>

							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src={STATIC_URL + "assets/images/icon_oppr.png"} className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>OPPORTUNITY SCORING</h4>
								<p>
								To predict sales opportunities that are more likely to win/lose.
								</p>
							</div>
							<div class="clearfix"></div>
							</Link>

							<div className="card-footer">
							<ul className="app_labels">
								<li><a href="#"><i className="fa fa-tag"></i> Marketing</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Sales</a></li>
							</ul>

						{/*<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>*/}
						<div id="myPopover" className="pop_box hide">
						<p>Info</p>
						</div>
						</div>
						</div>

					</div>
					<div className="col-md-4">

						<div className="app-block">
						<Link onClick={this.gotoAppsList.bind(this,APPID2,APPNAME2)} className="app-link" to="/apps/2/models">
							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src={STATIC_URL + "assets/images/icon_prediction.png"} className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>AUTOMATED PREDICTION</h4>
								<p>
								To build machine learning models to predict the outcome of any target attribute.
								</p>
							</div>
							<div class="clearfix"></div>
							</Link>
						<div className="card-footer">
							<ul className="app_labels">
								<li><a href="#"><i className="fa fa-tag"></i> Marketing</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Operations</a></li>

							</ul>
						{/*<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>*/}
						<div id="myPopover" className="pop_box hide">
						<p>Info</p>
						</div>
						</div>

						</div>

					</div>
					<div className="col-md-4">
						<div className="app-block">
						<Link onClick={this.gotoAppsList.bind(this,APPID3,APPNAME3)} className="app-link" to="/apps-robo">
							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src={STATIC_URL + "assets/images/icon_robo.png"} className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>ROBO-ADVISOR INSIGHTS</h4>
								<p>
								To help wealth managers  and investment advisors to analyze customer portfolio.
								</p>
							</div>
<div class="clearfix"></div>
							</Link>
							<div className="card-footer">
							<ul className="app_labels">
								{/* <li className="xs-p-10 text-primary"><i className="fa fa-tag fa-1x"></i></li> */}
								<li><a href="#"><i className="fa fa-tag"></i> Finance</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Wealth Management</a></li>

							</ul>

						{/*<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>*/}
						<div id="myPopover" className="pop_box hide">
						<p>Info</p>
						</div>
						</div>
						</div>

					</div>
				</div>
				<div class="clearfix xs-p-20"></div>
				<div class="row">
				<div class="col-md-4">

					
					<div className="app-block"> 
						<Link onClick={this.gotoAppsList.bind(this,APPID4,APPNAME4)} className="app-link" to='/apps/audio'>

						<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
							<img src={STATIC_URL + "assets/images/icon_speak.png"} className="img-responsive"/>
						</div>
						<div className="col-md-8 col-sm-9 col-xs-7">
							<h4>SPEECH ANALYTICS</h4>
							<p>
							To extract sentiments, emotions and context from audio/voice.
							</p>
						</div>
						<div class="clearfix"></div>
						</Link>

						<div className="card-footer">
						<ul className="app_labels">
							<li><a href="#"><i className="fa fa-tag"></i> Marketing</a></li>
							<li><a href="#"><i className="fa fa-tag"></i> Customer Service</a></li>
						</ul>

					{/*<div className="card-deatils">
							<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
					</div>*/}
					<div id="myPopover" className="pop_box hide">
					<p>Info</p>
					</div>
					</div>
					</div>

				</div>
				
				
				<div class="col-md-4">

				
				<div className="app-block"> 
					<Link onClick={this.gotoAppsList.bind(this,APPID5,APPNAME5)} className="app-link" to='/apps-stock-advisor'>

					<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
						<img src={STATIC_URL + "assets/images/apps_icon1.png"} className="img-responsive"/>
					</div>
					<div className="col-md-8 col-sm-9 col-xs-7">
						<h4>STOCK  SENSE</h4>
						<p>
						To find and analyze correlation between contents of news articles and stock prices and extract meaningful insights
						</p>
					</div>
					<div class="clearfix"></div>
					</Link>

					<div className="card-footer">
					<ul className="app_labels">
						<li><a href="#"><i className="fa fa-tag"></i> Finance</a></li>
						<li><a href="#"><i className="fa fa-tag"></i>Investment Banking</a></li>
					</ul>

				{/*<div className="card-deatils">
						<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
				</div>*/}
				<div id="myPopover" className="pop_box hide">
				<p>Info</p>
				</div>
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
