import React from "react";
import {connect} from "react-redux";
import store from "../../store"
import {refreshAppsAlgoList,getDeploymentList,getListOfCards} from "../../actions/appActions";
var dateFormat = require('dateformat');
import {STATIC_URL} from "../../helpers/env.js"
import {openDeployModalAction, closeDeployModalAction, openModelSummaryAction} from "../../actions/modelManagementActions"
import {C3Chart} from "../c3Chart";
import {isEmpty, subTreeSetting,getUserDetailsOrRestart, SUCCESS,INPROGRESS} from "../../helpers/helper";
import {getAlgoAnalysis, setSideCardListFlag, updateselectedL1} from "../../actions/signalActions";
import {DecisionTree} from "../decisionTree";
import {CardHtml} from "../../components/signals/CardHtml";
import {CardTable} from "../common/CardTable";
import {DataBox} from "../common/DataBox";
import $ from "jquery";
import { Deployment } from "./Deployment";

@connect((store) => {
  return {
    login_response: store.login.login_response,
	algoList: store.apps.algoList,
    currentAppId: store.apps.currentAppId,
	algoAnalysis:store.signals.algoAnalysis,
	dataPreview: store.datasets.dataPreview,
	currentAppDetails:store.apps.currentAppDetails,
	deploymentList:store.apps.deploymentList
  };
})

export class ModelSummary extends React.Component {
  constructor(props) {
	super(props);
  }
  
  componentWillMount() {
	console.log("api call start");
	this.props.dispatch(getAlgoAnalysis(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
	this.props.dispatch(getDeploymentList(this.props.match.params.slug));
	console.log("api call end");
	setInterval(function() {
	  var evt = document.createEvent('UIEvents');
	  evt.initUIEvent('resize', true, false,window,0);
	  window.dispatchEvent(evt);
	  console.log("I");
	}, 500);
  }
  
  componentDidMount() {
   }

  closeModelSummary(){
	window.history.back();
  }
  
  calculateWidth(width){
	let colWidth  = parseInt((width/100)*12);
	let divClass="col-md-"+colWidth;
	return divClass;
  }
  
  renderCardData(c3,cardWidth){
	  debugger;
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
							divClass = "col-md-12"
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
						if(this.props.currentAppId == 2){
							return (<DataBox  key={i} jsonData={story.data} type={story.dataType}/>);
						}else{
							return( 
								story.data.map((data,index)=>{
								return (<div className="col-md-5ths col-sm-8 col-xs-12 bgStockBox">
								<h3 className="text-center">{data.value}<br/><small>{data.name}</small></h3>
								<p>{data.description}</p>
								</div>);
							})
							);
						}
						break;
		}
  	});
	return htmlData;
  }

  render(){
	if(isEmpty(this.props.algoAnalysis)){
	  return (
	  	<div className="side-body">
		  <div className="page-head"></div>
		  <div className="main-content">
		  	<img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
		  </div>
		</div>
	  );
  	}else if(isEmpty(this.props.algoAnalysis.data)){
	  return (
	  	<div className="side-body">
		  <div className="page-head"></div>
		  <div className="main-content">
			<h1>There is no data</h1>
		  </div>
		</div>
	  );
    }else{
	// console.log(this.props.selectedSummary,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
		var summary=this.props.selectedSummary;
		var overviewCard = "";
		var performanceCard="";
		var algoAnalysis="";
		algoAnalysis = this.props.algoAnalysis;
		
		var deploymentList = this.props.deploymentList;
		console.log(deploymentList,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
		
		var overviewPage = this.props.algoAnalysis.data.listOfNodes.filter(row => row.name === "Overview");
		var oVtop="";
		oVtop =overviewPage.map(card => card.listOfCards);
		var th1 = oVtop.map(fun => fun[0].cardData[0])
		var tdata1 = oVtop.map(fun => fun[0].cardData[1])
		var tw1 = oVtop.map(fun => fun[0].cardWidth)[0]

		var th2 = oVtop.map(fun => fun[1].cardData[0])
		var tdata2 = oVtop.map(fun => fun[1].cardData[1])
		var tw2 = oVtop.map(fun => fun[1].cardWidth)[0]

		var performancePage = this.props.algoAnalysis.data.listOfNodes.filter(row => row.name === "Performance");
		var top="";
		top =performancePage.map(card => card.listOfCards);

		var c0 = top.map(fun => fun[0].cardData[0])
		var w0 = top.map(fun => fun[0].cardWidth)[0]

		var h1 = top.map(fun => fun[1].cardData[0])
		var c1 = top.map(fun => fun[1].cardData[1])
		var w1 = top.map(fun => fun[1].cardWidth)[0]
		
		var h2 = top.map(fun => fun[2].cardData[0])
		var c2 = top.map(fun => fun[2].cardData[1])
		var w2 = top.map(fun => fun[2].cardWidth)[0]
		
		var h3 = top.map(fun => fun[3].cardData[0])
		var c3 = top.map(fun => fun[3].cardData[1])
		var w3 = top.map(fun => fun[3].cardWidth)[0]
		
		// var h4 = top.map(fun => fun[4].cardData[0])
		// var c4 = top.map(fun => fun[4].cardData[1])
		// var w4 = top.map(fun => fun[4].cardWidth)[0]

		// var h5 = top.map(fun => fun[5].cardData[0])
		// var c5 = top.map(fun => fun[5].cardData[1])
		// var w5 = top.map(fun => fun[5].cardWidth)[0]
		
		const summaryTable = this.renderCardData(tdata1,tw1);
		const headSummaryTable = this.renderCardData(th1,tw1);
		const settingsTable = this.renderCardData(tdata2,tw2);
		const headSettingsTable = this.renderCardData(th2,tw2);
		const topCards = this.renderCardData(c0,w0);
		const headconfusionMatrix = this.renderCardData(h1,w1);
		const confusionMatrix = this.renderCardData(c1,w1);
		const headROCChart = this.renderCardData(h2,w2);
		const ROCChart = this.renderCardData(c2,w2);
		const headksChart = this.renderCardData(h3,w3);
		const ksChart = this.renderCardData(c3,w3);
		// const headgainChart = this.renderCardData(h4,w4);
		// const gainChart = this.renderCardData(c4,w4);
		// const headROCChart = this.renderCardData(h5,w5);
		// const ROCChart = this.renderCardData(c5,w5);
 
		overviewCard=(
			<div class="row">
				<div class="col-md-6">
					{headSummaryTable}
					{summaryTable}
				</div>
				<div class="col-md-6">
					{headSettingsTable}
					{settingsTable}
				</div>
			</div>
		)

		performanceCard = (
			<div>
				<div class="row ov_card_boxes">
					{topCards} 
				</div>
				<div class="row xs-mt-10">
					<div class="col-md-6">
						{headconfusionMatrix}
						{confusionMatrix}
					</div>
					<div class="col-md-6">
						{headROCChart}
						{ROCChart}
					</div>
				</div>
				<hr/>
				<div class="row xs-mt-10">
					<div class="col-md-6">
						{headksChart}
						{ksChart}
					</div>
					<div class="col-md-6">
						{/* {headgainChart} */}
						{/* {gainChart} */}
					</div>
				</div>
			</div>
		)
	}

    return (
      // <!-- Main Content starts with side-body -->
		<div class="side-body">
      <div class="main-content">
	
    <div class="page-head">
      <h3 class="xs-mt-0 xs-mb-0 text-capitalize">Model ID: {algoAnalysis.name}</h3>
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
							<div id="deployment" class="tab-pane cont">
								<Deployment/>
							</div>
              
            </div>
			
			<div class="buttonRow text-right"> <a href="javascript:;" onClick={this.closeModelSummary.bind(this)}class="btn btn-primary">Close </a> </div>
  		</div>
		
		
		</div>
	</div>
    </div>
    </div>
    
    );
		}
		openDeployModal(item) {
			console.log("open ---openDeployModal");
			this.props.dispatch(openDeployModalAction(item));
		}
	
		closeDeployModal() {
			console.log("closeddddd ---closeDeployModal");
			this.props.dispatch(closeDeployModalAction());
		}
  }
