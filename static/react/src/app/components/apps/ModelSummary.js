import React from "react";
import {connect} from "react-redux";
import store from "../../store"
import {refreshAppsAlgoList,getListOfCards} from "../../actions/appActions";
import {isEmpty} from "../../helpers/helper";
var dateFormat = require('dateformat');
import {C3Chart} from "../c3Chart";
import {DecisionTree} from "../decisionTree";
import {CardHtml} from "../../components/signals/CardHtml";
import {CardTable} from "../common/CardTable";
import { Scrollbars } from 'react-custom-scrollbars';
//import Tree from 'react-tree-graph';
import {DataBox} from "../common/DataBox";
import $ from "jquery";

var data = null,
yformat = null,
cardData = {};



@connect((store) => {
  return {
    login_response: store.login.login_response,
		algoList: store.apps.algoList,
		selectedSummary:store.apps.summarySelected,
		dataPreview: store.datasets.dataPreview,
  };
})

export class ModelSummary extends React.Component {
  constructor(props) {
    super(props);
  }
	
	componentWillMount() {
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
	calculateWidth(width){
		let colWidth  = parseInt((width/100)*12)
		let divClass="col-md-"+colWidth;
		return divClass;
}
renderCardData(c3,cardWidth){

		var htmlData = c3.map((story, i) => {
				let randomNum = Math.random().toString(36).substr(2,8);
				switch (story.dataType) {
				case "html":
						if(!story.hasOwnProperty("classTag"))story.classTag ="none";
						return (<CardHtml key={randomNum} htmlElement={story.data} type={story.dataType} classTag={story.classTag}/>);
						break;
				case "c3Chart":
						//console.log("checking chart data:::::");
						let chartInfo=[]
						if(!$.isEmptyObject(story.data)){
							 if(story.chartInfo){
								 chartInfo=story.chartInfo
							 }
								if(story.widthPercent &&  story.widthPercent != 100){
									//  let width  = story.widthPercent+"%";
										let width  = parseInt((story.widthPercent/100)*12)
										let divClass="col-md-"+width;
										let sideChart=false;
										if(story.widthPercent < 50)sideChart=true;
										return (<div key={randomNum} class={divClass} style={{display:"inline-block",paddingLeft:"30px"}}><C3Chart chartInfo={chartInfo} sideChart={sideChart} classId={randomNum}  widthPercent = {story.widthPercent} data={story.data.chart_c3}  yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div>);
								}else if(story.widthPercent == 100){
										let divClass="";
										let parentDivClass = "col-md-12";
										if(!cardWidth || cardWidth > 50)
										divClass = "col-md-7 col-md-offset-2"
										else
										divClass = "col-md-12";
										let sideChart=false;
										return (<div className={parentDivClass}><div key={randomNum} class={divClass} style={{display:"inline-block",paddingLeft:"30px"}}><C3Chart chartInfo={chartInfo} sideChart={sideChart} classId={randomNum}  widthPercent = {story.widthPercent} data={story.data.chart_c3}  yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div></div>);
								}else{
										let parentDivClass = "col-md-12";
										return (<div className={parentDivClass}><div key={randomNum}><C3Chart chartInfo={chartInfo} classId={randomNum} data={story.data.chart_c3} yformat={story.data.yformat} y2format={story.data.y2format}  guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div></div>);
								}
						}
						break;
				case "tree":
						//console.log("checking tree data");
						return ( <DecisionTree key={randomNum} treeData={story.data}/>);
						break;
				case "table":
						if(!story.tableWidth)story.tableWidth = 100;
						var colClass= this.calculateWidth(story.tableWidth)
						let tableClass ="table table-bordered table-condensed table-striped table-fw-widget"
						colClass = colClass;
				 return (<div className={colClass} key={randomNum}><CardTable  jsonData={story.data} type={story.dataType}/></div>);
						break;
						case "dataBox":
						let bgStockBox = "bgStockBox"
                return (<DataBox  className= {bgStockBox} key={randomNum} jsonData={story.data} type={story.dataType}/>);
                break;
			
				}

		});
		return htmlData;
}




  render(){
		console.log(this.props.selectedSummary,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
		var summary=this.props.selectedSummary;
		var overviewCard = "";
		var performanceCard="";
		let chartInfo=[];

		var performancePage = this.props.selectedSummary.data.listOfNodes.filter(row => row.name === "Performance");
		var top="";
		top =performancePage.map(card => card.listOfCards);
		var icards ="";
		
		var overviewPage = this.props.selectedSummary.data.listOfNodes.filter(row => row.name === "Overview");
		var oVtop="";
		oVtop =overviewPage.map(card => card.listOfCards);
		
		let cardWidth = this.props.cardWidth;

		var th1 = oVtop.map(fun => fun[0].cardData[0])
		var tdata1 = oVtop.map(fun => fun[0].cardData[1])
		
		
		var th2 = oVtop.map(fun => fun[1].cardData[0])
		var tdata2 = oVtop.map(fun => fun[1].cardData[1])

		var c0 = top.map(fun => fun[0].cardData[0])

		var h1 = top.map(fun => fun[1].cardData[0])
		var c1 = top.map(fun => fun[1].cardData[1])
		var h2 = top.map(fun => fun[2].cardData[0])
		var c2 = top.map(fun => fun[2].cardData[1])
		var h3 = top.map(fun => fun[3].cardData[0])
		var c3 = top.map(fun => fun[3].cardData[1])
		var h4 = top.map(fun => fun[4].cardData[0])
		var c4 = top.map(fun => fun[4].cardData[1])
		




		const summaryTable = this.renderCardData(tdata1,cardWidth);
		const headSummaryTable = this.renderCardData(th1,cardWidth);
 
		const settingsTable = this.renderCardData(tdata2,cardWidth);
		const headSettingsTable = this.renderCardData(th2,cardWidth);


		const topCards = this.renderCardData(c0,cardWidth);
		
		const headconfusionMatrix = this.renderCardData(h1,cardWidth);
		const confusionMatrix = this.renderCardData(c1,cardWidth);
		const headksChart = this.renderCardData(h2,cardWidth);
		const ksChart = this.renderCardData(c2,cardWidth);
		const headgainChart = this.renderCardData(h3,cardWidth);
		const gainChart = this.renderCardData(c3,cardWidth);
		const headliftChart = this.renderCardData(h4,cardWidth);
		const liftChart = this.renderCardData(c4,cardWidth);
 


	overviewCard=(
			 <div class="row">
					<div class="col-md-6">
						{/* <h2> Model Summary</h2> */}
{headSummaryTable}
						{/* <table class="table table-bordered table-condensed table-striped table-fw-widget"> */}

						<tbody>
						{summaryTable}
							{/* <tr>
								<th class="text-left">Project name</th>
								<td class="text-left">{summary.project_name}</td>
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
							</tr> */}
							</tbody>
						{/* </table> */}
					</div>
					<div class="col-md-6">
						{/* <h2>Model Settings</h2> */}
						{headSettingsTable}
						{/* <table class="table table-bordered table-condensed table-striped table-fw-widget"> */}
						{/* <tbody> */}
							{/* {/* <tr>
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
							</tr> */}
								{settingsTable}
							{/* </tbody>  */}
						{/* </table> */}
					</div>
				
				
				</div>)



 performanceCard=(
 <div>

	 {topCards}
	 {/* {headtopCards} */}
	 {/* <div class="row ov_card_boxes">
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> {icards.map(i=>i[0].value)}<br/>
						<small>Accuracy</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> {icards.map(i=>i[1].value)}<br/>
						<small>Precision</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> {icards.map(i=>i[2].value)}<br/>
						<small>Recall</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center">{icards.map(i=>i[3].value)}<br/>
						<small>F1 Score</small>
					</h3>
				</div>
				<div class="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
					<h3 class="text-center"> {icards.map(i=>i[4].value)}<br/>
						<small>Log-loss
</small>
					</h3>
				</div>				
			  </div> */}
			   
				
				 {/* {headtopCards}
				 {topCards} */}
			  
				{/* {headconfusionMatrix}
				{confusionMatrix}
				{headliftChart}
				{liftChart}
				{headksChart}
				{ksChart}
				{headgainChart}
				{gainChart} */}
				<div class="row xs-mt-10">
					<div class="col-md-6">
				{headconfusionMatrix}
						{confusionMatrix}
					</div>
					<div class="col-md-6">
					{headliftChart}
						{liftChart}
					</div>
				</div>
				<hr/>
				<div class="row xs-mt-10">
					<div class="col-md-6">
						{headksChart}
						{ksChart}

					</div>
					<div class="col-md-6">
						{headgainChart}
						{gainChart}
					</div>
				</div>
				</div>)

    return (
      // <!-- Main Content starts with side-body -->
		<div class="side-body">
      <div class="main-content">
		{/* <!-- Copy the Code From Here ////////////////////////////////////////////////// --> */}
	
    <div class="page-head">
      <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> {summary.project_name}<small> : {summary.algorithm}</small></h3>
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
