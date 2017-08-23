import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {Link, Redirect} from "react-router-dom";
import {updateSelectedApp,updateModelSummaryFlag} from "../../actions/appActions";
import {connect} from "react-redux";


export class AppsPanel extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
  }
  gotoAppsList(appId,appName){
	// this.props.dispatch(updateSelectedApp(appId,appName));
	 //this.props.dispatch(updateModelSummaryFlag(false));
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
							<a onClick={this.gotoAppsList.bind(this,2,"Opportunity Scoring")} className="app-link" ><Link  to="/apps/2/models">
							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src="../assets/images/icon_oppr.png" className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>OPPORTUNITY SCORING</h4>
								<p>
									Business Goals by understading the top-level business goals, we can infer the investment climate.
								</p>
							</div>
							</Link>
							</a>
							<div className="card-footer">
							<ul className="app_labels">
								<li className="xs-p-10 text-primary"><i className="fa fa-tag fa-1x"></i></li>
								<li><a href="#"><i className="fa fa-tag"></i> Business</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Climate</a></li>
							</ul>
						
						<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>
						<div id="myPopover" className="pop_box hide">
						<p>Info</p>
						</div>
						</div>
						</div>
						
					</div>
					<div className="col-md-4">
						
						<div className="app-block">
						<a  onClick={this.gotoAppsList.bind(this,1,"Automation Prediction")} className="app-link"><Link  to="/apps/1/models">
							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src="../assets/images/icon_prediction.png" className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>AUTOMATED PREDICTION</h4>
								<p>
									Machine-learning alogrithms are applied to explore the relation between significant flares and...
								</p>
							</div>
							</Link>
						</a>
						<div className="card-footer">
							<ul className="app_labels">
								<li className="xs-p-10 text-primary"><i className="fa fa-tag fa-1x"></i></li>
								<li><a href="#"><i className="fa fa-tag"></i> Business</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Climate</a></li>
							 
							</ul>							
						<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>
						<div id="myPopover" className="pop_box hide">
						<p>Info</p>
						</div>
						</div>
						
						</div>
						
					</div>
					<div className="col-md-4">							
						<div className="app-block">
							<a href="#" className="app-link disabled" >
							<div className="col-md-4 col-sm-3 col-xs-5 xs-p-20">
								<img src="../assets/images/icon_robo.png" className="img-responsive"/>
							</div>
							<div className="col-md-8 col-sm-9 col-xs-7">
								<h4>ROBO-ADVISOR INSIGHTS</h4>
								<p>
									Machine-learning alogrithms are applied to explore the relation between significant flares and...
								</p>
							</div>	
							</a>
							<div className="card-footer">
							<ul className="app_labels">
								<li className="xs-p-10 text-primary"><i className="fa fa-tag fa-1x"></i></li>
								<li><a href="#"><i className="fa fa-tag"></i> Business</a></li>
								<li><a href="#"><i className="fa fa-tag"></i> Climate</a></li>
							 
							</ul>
						
						<div className="card-deatils">
								<a href="javascript:void(0);" rel="popover" className="pover" data-popover-content="#myPopover" data-original-title="" title=""><i className="ci pe-7s-info pe-2x"></i></a>
						</div>
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
