import React from "react";
import {connect} from "react-redux";
import store from "../../store"
import {refreshAppsAlgoList} from "../../actions/appActions";
import {isEmpty} from "../../helpers/helper";
var dateFormat = require('dateformat');


@connect((store) => {
  return {
    login_response: store.login.login_response,
		algoList: store.apps.algoList,
		selectedSummary:store.apps.summarySelected,
  };
})

export class ModelSummary extends React.Component {
  constructor(props) {
    super(props);
  }
	
	componentWillMount() {
		// debugger;
		if (isEmpty(this.props.selectedSummary)) {
      if (!this.props.match.path.includes("robo")) {
        let url = '/signals/'
        console.log(this.props);
        this.props.history.push(url)
      }
		}
	}

  componentDidMount() {
			this.props.dispatch(refreshAppsAlgoList(this.props));
	}


  closeModelSummary(){
	 window.history.back();
	}
  render(){
		console.log(this.props.selectedSummary,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
		var summary=this.props.selectedSummary;
		var overviewCard = "";
		var performanceCard="";
	overviewCard=(
			 <div class="row">
					<div class="col-md-6">
						<h2> Model Summary</h2>

						<table class="table table-condensed table-striped table-fw-widget">
						<tbody>
							<tr>
								<th class="text-left">Project name</th>
								<td class="text-left">{summary.name}</td>
							</tr>
							<tr>
								<th class="text-left">Algorithm</th>
								<td class="text-left">{summary.algorithm}</td>
							</tr>
							<tr>
								<th class="text-left">Training status</th>
								<td class="text-left">{summary.training_status}</td>
							</tr>
							<tr>
								<th class="text-left">Accuracy</th>
								<td class="text-left">{summary.accuracy}</td>
							</tr>
							<tr>
								<th class="text-left">Runtime</th>
								<td class="text-left">{summary.runtime}</td>
							</tr>
							<tr>
								<th class="text-left">Owner</th>
								<td class="text-left">{summary.created_by.username}</td>
							</tr>
							<tr>
						
								<th class="text-left">Created on</th>
								<td class="text-left">{dateFormat(summary.created_on, " mmm d,yyyy HH:MM")}</td>
							</tr>
							</tbody>
						</table>
					</div>
					<div class="col-md-6">
						<h2>Model Settings</h2>
						<table class="table table-condensed table-striped table-fw-widget">
						<tbody>
							<tr>
								<th class="text-left">Training dataset</th>
								<td class="text-left">Credit_churn_model.csv</td>
							</tr>
							<tr>
								<th class="text-left">Target column</th>
								<td class="text-left">Status</td>
							</tr>
							<tr>
								<th class="text-left">Target column value</th>
								<td class="text-left">Churn</td>
							</tr>
							<tr>
								<th class="text-left">Number of independent variables</th>
								<td class="text-left">20</td>
							</tr>
							<tr>
								<th class="text-left">Algorithm</th>
								<td class="text-left">Logistic Regression</td>
							</tr>
							<tr>
								<th class="text-left">Model validation</th>
								<td class="text-left">Train and test (80:20)</td>
							</tr>
							<tr>
								<th class="text-left">Fit intercept</th>
								<td class="text-left">True</td>
							</tr>
							<tr>
								<th class="text-left">Solver used</th>
								<td class="text-left">LBFGS</td>
							</tr>
							<tr>
								<th class="text-left">Multiclass option</th>
								<td class="text-left">One vs Rest</td>
							</tr>
							<tr>
								<th class="text-left">Maximum solver iterations</th>
								<td class="text-left">100</td>
							</tr>
							<tr>
								<th class="text-left">Warm start</th>
								<td class="text-left">False</td>
							</tr>
							<tr>
								<th class="text-left">Convergence tolerance of iterations</th>
								<td class="text-left">4</td>
							</tr>
							<tr>
								<th class="text-left">Inverse regularization strength</th>
								<td class="text-left">1</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>)



 performanceCard=(
 <div>
	 <div class="row ov_card_boxes">
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> 0.87<br/>
						<small>Accuracy</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> 0.8<br/>
						<small>Precision</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> 2.6<br/>
						<small>Recall</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> 0.9<br/>
						<small>F1 Score</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> 0.8<br/>
						<small>Log-loss
</small>
					</h3>
				</div>				
			  </div>
			  
			  
			  
			  
				<div class="row xs-mt-10">
					<div class="col-md-6">
						<h2>Confusion Matrix</h2>
						<img src="images/confusion_matrix.png" class="img-responsive" />
					</div>
					<div class="col-md-6">
						<h2>Lift Chart</h2>
						<img src="images/lift-chart.png" class="img-responsive" />
					</div>
				</div>
				<hr/>
				<div class="row">
					<div class="col-md-6">
						<h2>Kolmogorov Smirnov Chart</h2>
						<img src="images/kolChart.png" class="img-responsive" />
					</div>
					<div class="col-md-6">
						<h2>Gain Chart</h2>
						<img src="images/gain_chart.png" class="img-responsive" />
					</div>
				</div>
				</div>)

    return (
      // <!-- Main Content starts with side-body -->
		<div class="side-body">
      <div class="main-content">
		{/* <!-- Copy the Code From Here ////////////////////////////////////////////////// --> */}
	
    <div class="page-head">
      <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> {summary.name}<small> : {summary.algorithm}</small></h3>
    </div>
	<div class="panel panel-mAd box-shadow">
        <div class="panel-body no-border xs-p-20">
		<div id="pDetail" class="tab-container">
            <ul class="nav nav-tabs">
              <li class="active"><a href="#overview" data-toggle="tab">Overview</a></li>
              <li><a href="#performance" data-toggle="tab">Performance</a></li>
              <li><a href="#deployment" data-toggle="tab">Deployment</a></li>
            </ul>
            <div class="tab-content xs-pt-20">
              <div id="overview" class="tab-pane active cont">                
							{overviewCard}
						</div>
              <div id="performance" class="tab-pane cont">
							{performanceCard}
              </div>
              <div id="deployment" class="tab-pane">
				<button class="btn btn-warning btn-shade4 pull-right">Add New Deployment</button>
				<div class="clearfix"></div>
                <table class="tablesorter table table-striped table-hover table-bordered break-if-longText">
                  <thead>
                    <tr className="myHead">
                      <th>
                      #
                      </th>
                      <th class="text-left">Name</th>
                      <th class="text-left">Deployment Type</th>
                      <th>Status</th>
                      <th>Deployed On</th>
					  <th>Runtime</th>
					  <th>Jobs Triggered</th>
					  <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
					  <td>
						1.
					  </td>
                      <td class="text-left"><b><a href="#">LR-001-D001</a></b></td>
					  <td class="text-left">Batch Prediction</td>                      
                      <td><span class="text-success">Success</span></td>
					  <td><i class="fa fa-calendar text-info"></i> 21/12/2018</td>
					  <td><i class="fa fa-clock-o text-warning"></i> 230 s</td>
					  <td>1</td>
					  <td>
						<div class="pos-relative">
							<a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
							  <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
							</a>    
							<ul class="dropdown-menu dropdown-menu-right">
								  <li>
									  <a href="#" data-toggle="modal" data-target="#deploy_popup">View</a>
								  </li>                          
								  <li>
									  <a href="#" data-toggle="modal" data-target="#DeleteWarning">Delete</a>
								  </li>
							  </ul>
						</div>
					  </td>
            </tr>
            <tr>
					  <td>
						2.
					  </td>
            <td class="text-left"><b><a href="project_datadetail.html">LR-001-D002</a></b></td>
            <td class="text-left">Batch Prediction</td>
            <td><span class="text-success">Success</span></td>             
            <td><i class="fa fa-calendar text-info"></i> 02/02/2019</td>
			<td><i class="fa fa-clock-o text-warning"></i> 189 s</td>
            <td>0</td>
			<td>
                <div class="pos-relative">
                    <a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
                      <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
                    </a>    
                    <ul class="dropdown-menu dropdown-menu-right">
                          <li>
                              <a href="#">View</a>
                          </li>                           
                          <li>
                              <a href="#">Delete</a>
                          </li>
                      </ul>
                  </div>
            </td>
            </tr>
             </tbody>
             </table>
               
			  </div>
            </div>
			
			<div class="buttonRow text-right"> <a href="javascript:;" onClick={this.closeModelSummary.bind(this)}class="btn btn-primary">Close </a> </div>
			
          </div>
		
		
		</div>
	</div>
		
		{/* <!-- End of the Copying Code Till Here /////////////////////////////////////////// --> */}
    </div>
    </div>
    
    );
    }
  }
