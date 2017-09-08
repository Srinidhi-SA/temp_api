import React from "react";
import { Scrollbars } from 'react-custom-scrollbars';



import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
//import {Redirect} from 'react-router';
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {hideDataPreview} from "../../actions/dataActions";
import {Button} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import {showHideSideChart,showHideSideTable} from "../../helpers/helper.js"




@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
		signalMeta: store.datasets.signalMeta,curUrl: store.datasets.curUrl,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		currentAppId:store.apps.currentAppId,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		signal: store.signals.signalAnalysis};
})



export class DataPreview extends React.Component {

	constructor(props) {
		super(props);
		console.log("checking slug");
		console.log(props);
		this.buttons={};
		//this.buttonsTemplate=null;
		this.hideDataPreview = this.hideDataPreview.bind(this);
		this.chartId = "_side";
		this.firstTimeSideTable = [];
	}

	hideDataPreview(){
		this.props.dispatch(hideDataPreview());
	}
	// getPreviewData(e){
	//   this.props.dispatch(getData(e.target.id));
	// }

	componentWillMount(){
		console.log("------------------");
		console.log(this.props);
		console.log("data prevvvvv");
		console.log(store.getState().datasets.curUrl.indexOf("models"));
		if(store.getState().datasets.curUrl){
			if(store.getState().datasets.curUrl.startsWith("/signals")){
				this.buttons['close']= {
						url : "/signals",
						text: "Close"
				};
				this.buttons['create']= {
						url : "/variableselection",
						text: "Create Signal"
				};

			}else if(store.getState().datasets.curUrl.startsWith("/data")){
				this.buttons['close']= {
						url : "/data",
						text: "Close"
				};
				this.buttons['create']= {
						url : "/data/preview/createSignal",
						text: "Create Signal"
				};

			}else if(store.getState().datasets.curUrl.startsWith("/apps")){
				if(store.getState().datasets.curUrl.indexOf("robo") != -1){
					this.buttons['close']= {
							url : "/apps/"+store.getState().apps.currentAppId+"/robo",
							text: "Close"
					};
					this.buttons['create']= {
							url :"/apps-robo/"+store.getState().apps.roboDatasetSlug+"/"+store.getState().signals.signalAnalysis.slug,
							text: "Compose Insight"
					};
				}else if(store.getState().datasets.curUrl.indexOf("models") == -1){
					this.buttons['close']= {
							url : "/apps",
							text: "Close"
					};
					this.buttons['create']= {
							url :"/apps/"+store.getState().apps.currentAppId+"/scores/dataPreview/createScore",
							text: "Create Score"
					};
				}else{
					this.buttons['close']= {
							url : "/apps",
							text: "Close"
					};
					this.buttons['create']= {
							url :"/apps/"+store.getState().apps.currentAppId+"/models/dataPreview/createModel",
							text: "Create Model"
					};
				}
				
			}
		}else{
			this.buttons['close']= {
					url : "/data",
					text: "Close"
			};
			this.buttons['create']= {
					url : "/data/preview/createSignal",
					text: "Create Signal"
			};
		}

	}


	componentDidMount() {
		//alert("working")
		$(function(){
			let initialCol= $(".cst_table td").first();
			let initialColCls = $(initialCol).attr("class");
			$(" td."+initialColCls).addClass("activeColumn");

			$(".cst_table td,.cst_table th").click(function(){
				$(".cst_table td").removeClass("activeColumn");
				let cls = $(this).attr("class");
				if(cls.indexOf(" ") !== -1){
					let tmp =[];
					tmp = cls.split(" ");
					cls = tmp[0];
				}
				$(" td."+cls).addClass("activeColumn");
			});
			
			

		});
		showHideSideTable(this.firstTimeSideTable);

	}



	setSideElements(e){
		//renderFlag=true;
		const chkClass = $(e.target).attr('class');
		let dataPrev = this.props.dataPreview.meta_data;
		dataPrev.columnData.map((item, i) => {
			 
			showHideSideChart(item.columnType); // hide side chart on datetime selection 
			
			if(chkClass.indexOf(item.slug) !== -1){
                console.log(item);
				const sideChartUpdate = item.chartData;
				const sideTableUpdate = item.columnStats;
				showHideSideTable(sideTableUpdate); // hide side table on blank or all display false
				console.log("checking side table data:; ");
				console.log(sideTableUpdate);
				$("#side-chart").empty();
				ReactDOM.render(<C3Chart classId={"_side"} data={sideChartUpdate} yformat={false} sideChart={true}/>, document.getElementById('side-chart'));

				const sideTableUpdatedTemplate=sideTableUpdate.map((tableItem,tableIndex)=>{
					if(tableItem.display){
						return(  <tr key={tableIndex}>
						<td className="item">{tableItem.displayName}</td>
						<td>{tableItem.value}</td>
						</tr>
						);
					}
				});
				$("#side-table").empty();
				ReactDOM.render( <tbody className="no-border-x no-border-y">{sideTableUpdatedTemplate}</tbody>, document.getElementById('side-table'));

			}
		});
	}

	closePreview(){

		const url = this.buttons.close.url;
		//<Link to={this.buttons.close.url}>
		this.props.dispatch(hideDataPreview());
		this.props.history.push(url);

		//return(<Redirect to={url}/>);
	}

	moveToVariableSelection(){
		//alert(this.buttons.create.url);
		let url = this.buttons.create.url;
		if(this.buttons.create.url.indexOf("apps-robo") != -1){
			url = "/apps-robo/"+store.getState().apps.roboDatasetSlug+"/"+store.getState().signals.signalAnalysis.slug
		}
		this.props.history.push(url);
	}

	render() {
		
		console.log("data prev is called##########3");
		console.log(this.props);
		$('body').pleaseWait('stop');
		//  const data = store.getState().data.dataPreview.meta_data.data;

		// const buttonsTemplate = <div className="col-md-12 text-right">
		// 			<button onClick={this.closePreview}  className="btn btn-default" > {this.buttons.close.text} </button>
		// 			<span>&nbsp;&nbsp;</span>
		// 			<button className="btn btn-primary"> {this.buttons.create.text}</button>
		// 	 </div>

		let dataPrev = this.props.dataPreview.meta_data;
		if (dataPrev) {
			//  console.log(data[0]);
			//const tableThTemplate=data[0].map((thElement, thIndex) => {
			const topInfo = dataPrev.metaData.map((item, i) => {
				if(item.display){
					return(
 
							 
 
							<div key={i} className="col-md-2 co-sm-4 col-xs-6">
 
							<h3>
							{item.value} <br/><small>{item.displayName}</small>
							</h3>
							</div>

					);
				}
			});



			const tableThTemplate=dataPrev.columnData.map((thElement, thIndex) => {
				console.log("th check::");
				console.log(thElement);
				let cls = thElement.slug + " dropdown";
				let iconCls =null;
				switch(thElement.columnType){
					case "measure":
					iconCls ="mAd_icons ic_mes_s";
					break;
					case "dimension":
					iconCls = "mAd_icons ic_dime_s";
					break;
					case "datetime":
					iconCls = "pe-7s-timer pe-lg pe-va";
					break;
					
				}
				
				
				const anchorCls =thElement.slug + " dropdown-toggle";
				
				if(thElement.ignoreSuggestionFlag){
					cls = cls + " greyout-col";
				
				return(
						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)} title={thElement.ignoreSuggestionMsg}>
						<a href="#" data-toggle="dropdown" className={anchorCls}><i className={iconCls}></i> {thElement.name}</a>
						{/*<ul className="dropdown-menu">
               <li><a href="#">Ascending</a></li>
               <li><a href="#">Descending</a></li>
               <li><a href="#">Measures</a></li>
               <li><a href="#">Dimensions</a></li>
            </ul>*/}

						</th>
				);
			}else{
				return(
						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
						<a href="#" data-toggle="dropdown" className={anchorCls}><i className={iconCls}></i> {thElement.name}</a>
						{/*<ul className="dropdown-menu">
               <li><a href="#">Ascending</a></li>
               <li><a href="#">Descending</a></li>
               <li><a href="#">Measures</a></li>
               <li><a href="#">Dimensions</a></li>
            </ul>*/}

						</th>
				);
				
			}
			});
			//  data.splice(0,1);
			const tableRowsTemplate = dataPrev.sampleData.map((trElement, trIndex) => {

				const tds=trElement.map((tdElement, tdIndex) => {
					return(
							<td key={tdIndex} className={dataPrev.columnData[tdIndex].slug} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
					);
				});
				return (
						<tr key={trIndex}>
						{tds}
						</tr>

				);
			});

			const sideChart = dataPrev.columnData[0].chartData;
			console.log("chart-----------")
			const sideTable = dataPrev.columnData[0].columnStats;
			this.firstTimeSideTable = sideTable; //show hide side table
			console.log("checking side table data:; ");
			console.log(sideTable);
			const sideTableTemaplte=sideTable.map((tableItem,tableIndex)=>{
				if(tableItem.display){
					return(  <tr key={tableIndex}>
					<td className="item">{tableItem.displayName}</td>
					<td>: {tableItem.value}</td>
					</tr>
					);
				}
			});

			return(
					<div className="side-body">
					{/* <!-- Page Title and Breadcrumbs -->*/}
					<div className="page-head">
					<div className="row">
					<div className="col-md-8">
					<h2>Data Preview</h2>
					</div>
					</div>
					<div className="clearfix"></div>
					</div>
					{ /*<!-- /.Page Title and Breadcrumbs -->*/ }
					{ /*<!-- Page Content Area -->*/}
					<div className="main-content">
					<div className="row">
					<div className="col-md-9">
					<div className="panel panel-borders">
					{topInfo}

					<div className="clearfix"></div>
					<div className="table-responsive noSwipe">
					
					<Scrollbars>
					<table className="table table-condensed table-hover table-bordered table-striped cst_table">
					<thead>
					<tr>
					{tableThTemplate}
					</tr>
					</thead>
					<tbody className="no-border-x">
					{tableRowsTemplate}
					</tbody>

					</table>
					</Scrollbars>
					</div>
					</div>
					</div>
					<div className="col-md-3 preview_stats">
					{ /*<!-- Start Tab Statistics -->*/}
					<div id="tab_statistics" className="panel-group accordion accordion-semi">
					<div className="panel panel-default">
					<div className="panel-heading">
					<h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_statistics" href="#pnl_stc" aria-expanded="true" className="">Statistics <i className="fa fa-angle-down pull-right"></i></a></h4>
					</div>
					<div id="pnl_stc" className="panel-collapse collapse in" aria-expanded="true">
					<div className="panel-body" >
					<table className="no-border no-strip skills"id="side-table">
					<tbody className="no-border-x no-border-y" >
					{sideTableTemaplte}

					</tbody>
					</table>
					</div>
					</div>
					</div>
					</div>
					{  /*<!-- ./ End Tab Statistics -->*/}
					{ /* <!-- Start Tab Visualizations -->*/}
					<div id="tab_visualizations" className="panel-group accordion accordion-semi">
					<div className="panel panel-default">
					<div className="panel-heading">
					<h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_visualizations" href="#pnl_visl" aria-expanded="true" className="">Visualizations <i className="fa fa-angle-down pull-right"></i></a></h4>
					</div>
					<div id="pnl_visl" className="panel-collapse collapse in" aria-expanded="true">
					<div className="panel-body" id="side-chart">
					{/*<img src="../assets/images/data_preview_graph.png" className="img-responsive" />*/}
					<C3Chart classId={this.chartId} data={sideChart} yformat={false} sideChart={true}/>
					</div>
					</div>
					</div>
					</div>
					{/*<!-- ./ End Tab Visualizations -->*/}

					{/*<!-- Start Tab Subsettings - ->*/}
					{/*<div id="tab_subsettings" className="panel-group accordion accordion-semi">
                 <div className="panel panel-default">
                    <div className="panel-heading">
                       <h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_subsettings" href="#pnl_tbset" aria-expanded="true" className="">Sub Setting <i className="fa fa-angle-down pull-right"></i></a></h4>
                    </div>
                    <div id="pnl_tbset" className="panel-collapse collapse in" aria-expanded="true">
                       <div className="panel-body">
                       <div className="row">
                          <div className="col-xs-4">
                             <input type="text" className="form-control" id="from_value" value="0" />
                          </div>
                          <div className="col-xs-3">
                             <label>To</label>
                          </div>
                          <div className="col-xs-4">
                             <input type="text" className="form-control" id="to_value" value="10" />
                          </div>
                       </div>
                       <div className="form-group">
                          <input type="text" data-slider-value="[250,450]" data-slider-step="5" data-slider-max="1000" data-slider-min="10" value="" className="bslider form-control"/>
                       </div>
                    </div>
                    </div>
                 </div>
              </div>*/}
					{/*<!-- ./ End Tab Subsettings -->*/}
					</div>
					</div>
					<div className="row buttonRow">
					<div className="col-md-12 text-right">
 
					<div className="panel">
					<div className="panel-body">
					<Button onClick={this.closePreview.bind(this)}> {this.buttons.close.text} </Button>
					<Button onClick={this.moveToVariableSelection.bind(this)} bsStyle="primary"> {this.buttons.create.text}</Button>
					</div>
					</div>
					</div>

 
					</div>
 
					</div>

					 
					{/*<!-- /.Page Content Area --> */}
					 </div>
			);
		} else {
			return (
					 <div>
			            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
			          </div>
			);
		}
	}
}