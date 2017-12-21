import React from "react";
import { Scrollbars } from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
//import {Redirect} from 'react-router';
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {hideDataPreview,getDataSetPreview,renameMetaDataColumn,updateTranformColumns} from "../../actions/dataActions";
import {dataSubsetting,clearDataPreview,clearLoadingMsg} from "../../actions/dataUploadActions"
import {Button,Dropdown,Menu,MenuItem} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import {showHideSideChart,showHideSideTable,MINROWINDATASET} from "../../helpers/helper.js"
import {isEmpty} from "../../helpers/helper";
import {SubSetting} from "./SubSetting";
import {DataUploadLoader} from "../common/DataUploadLoader";
import {DataValidation} from "./DataValidation";
import {DataValidationEditValues} from "./DataValidationEditValues";
import Dialog from 'react-bootstrap-dialog';



@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
		signalMeta: store.datasets.signalMeta,curUrl: store.datasets.curUrl,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		currentAppId:store.apps.currentAppId,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		modelSlug:store.apps.modelSlug,
		signal: store.signals.signalAnalysis,
		subsettingDone:store.datasets.subsettingDone,
		subsettedSlug:store.datasets.subsettedSlug,
		dataTransformSettings:store.datasets.dataTransformSettings};
})



export class DataPreview extends React.Component {

	constructor(props) {
		super(props);
		console.log("in data");
		console.log(props);
		this.buttons={};
		//this.buttonsTemplate=null;
		this.hideDataPreview = this.hideDataPreview.bind(this);
		this.chartId = "_side";
		this.firstTimeSideTable = [];
		this.firstTimeSideChart = {};
		this.firstTimeColTypeForChart = null;
		this.isSubsetted = false;
		this.new_subset = ""
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
		 if (this.props.dataPreview == null || isEmpty(this.props.dataPreview)||this.props.dataPreview.status == 'FAILED') {
			 				      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
		    }
		console.log("data prevvvvv");
		console.log(store.getState().datasets.curUrl.indexOf("models"));
		if(store.getState().datasets.curUrl){
			if(store.getState().datasets.curUrl.startsWith("/signals")){
				this.buttons['close']= {
						url : "/signals",
						text: "Close"
				};
				this.buttons['create']= {
						url : "/data/"+this.props.match.params.slug+"/createSignal",
						text: "Create Signal"
				};

			}else if(store.getState().datasets.curUrl.startsWith("/data")){
				this.buttons['close']= {
						url : "/data",
						text: "Close"
				};
				this.buttons['create']= {
						url : "/data/"+this.props.match.params.slug+"/createSignal",
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
							url :"/apps/"+store.getState().apps.currentAppId+"/models/"+store.getState().apps.modelSlug+"/data/"+this.props.match.params.slug+"/createScore",
							text: "Create Score"
					};
				}else{
					this.buttons['close']= {
							url : "/apps",
							text: "Close"
					};
					this.buttons['create']= {
							url :"/apps/"+store.getState().apps.currentAppId+"/models/data/"+this.props.match.params.slug+"/createModel",
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
					url : "/data/"+this.props.match.params.slug+"/createSignal",
					text: "Create Signal"
			};
		}

	}


	componentDidMount() {
		{/*}$(function(){
			console.log($(".cst_table"));
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



		});*/}

		showHideSideTable(this.firstTimeSideTable);
		showHideSideChart(this.firstTimeColTypeForChart,this.firstTimeSideChart);

	}
	setSideElements(e){

		//renderFlag=true;
		//alert("setting side element!!")
		const chkClass = $(e.target).attr('class');
		let dataPrev = this.props.dataPreview.meta_data;
		dataPrev.columnData.map((item, i) => {

			if(chkClass.indexOf(item.slug) !== -1){
                console.log(item);
				$("#side-chart").empty();
				showHideSideChart(item.columnType,item.chartData); // hide side chart on datetime selection
				if(!$.isEmptyObject(item.chartData)){
				const sideChartUpdate = item.chartData.chart_c3;
				let yformat = item.chartData.yformat;
				let  xdata= item.chartData.xdata;
				console.log("checking side table data:; ");
				console.log(sideTableUpdate);
				$("#side-chart").empty();
				ReactDOM.render(<Provider store={store}><C3Chart classId={"_side"} data={sideChartUpdate} yformat={yformat} xdata={xdata} sideChart={true}/></Provider>, document.getElementById('side-chart'));
                }
				const sideTableUpdate = item.columnStats;
				let sideTableUpdatedTemplate = "";
				if(sideTableUpdate != null){
					showHideSideTable(sideTableUpdate); // hide side table on blank or all display false
					sideTableUpdatedTemplate=sideTableUpdate.map((tableItem,tableIndex)=>{
						if(tableItem.display){
							return(  <tr key={tableIndex}>
							<td className="item">{tableItem.displayName}</td>
							<td>&nbsp; : &nbsp;</td>
							<td>&nbsp;&nbsp;{tableItem.value}</td>
							</tr>
							);
						}
					});
				}
				$("#side-table").empty();
				ReactDOM.render( <tbody className="no-border-x no-border-y">{sideTableUpdatedTemplate}</tbody>, document.getElementById('side-table'));

				// column subsetting starts
				const sideSubsetting = item.columnStats;
				$("#sub_settings").empty();
				ReactDOM.render(<Provider store={store}><SubSetting item = {item}/></Provider>, document.getElementById('sub_settings'));

				// column subsetting ends

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
		//check for minimum rows in datasets

		if (this.props.dataPreview.meta_data.metaData[0].value<MINROWINDATASET)
		bootbox.alert("Minimum "+MINROWINDATASET+" rows are required for analysis!!")
		else{
		let url = this.buttons.create.url;
		if(this.buttons.create.url.indexOf("apps-robo") != -1){$(".cst_table").find("thead").find("."+colSlug).first()
			url = "/apps-robo/"+store.getState().apps.roboDatasetSlug+"/"+store.getState().signals.signalAnalysis.slug
		}
		this.props.history.push(url);
	}
}

	applyDataSubset(){
		//alert("working");
		this.new_subset = $("#newSubsetName").val()
		//alert(this.new_subset)
		if(this.new_subset==""||this.new_subset==null){
			bootbox.alert("Please enter new config name!")
		}else{
		let transformationSettings = {};
		transformationSettings.existingColumns = store.getState().datasets.dataTransformSettings;
		let subSettingRq = {'filter_settings':store.getState().datasets.updatedSubSetting,
													'name':this.new_subset,'subsetting':true,
													'transformation_settings':transformationSettings};
		this.props.dispatch(dataSubsetting(subSettingRq,this.props.dataPreview.slug))
	}
}
	shouldComponentUpdate(nextProps) {
     return true;
    }


	render() {

		console.log("data prev is called##########3");
		//for active select in columnName
		//console.log(this.props)
		$(function(){
		    var idActiveColumn = false
		    $(".cst_table tbody tr").first().find("td").each(function(){

		        if($(this).hasClass("activeColumn"))idActiveColumn=true
		    })
		    if(!idActiveColumn){
		        let initialCol= $(".cst_table td").first();
		        let initialColCls = $(initialCol).attr("class");
		        $(" td."+initialColCls).addClass("activeColumn");

		    }


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


		let currentDataset = store.getState().datasets.selectedDataSet
		if(!isEmpty(this.props.dataPreview)&&currentDataset!=this.props.match.params.slug&&this.props.dataPreview!=null&&this.props.dataPreview.status!='FAILED'){
			let url = '/data/'+currentDataset
			return(<Redirect to={url}/> )
			}
				if(!isEmpty(this.props.dataPreview)&&this.props.dataPreview!=null&&this.props.dataPreview.status=='FAILED'){
						console.log("goitn to data url")
						this.props.dispatch(clearDataPreview())
						this.props.dispatch(clearLoadingMsg())
						let url = '/data/'
				return(<Redirect to={url}/> )
			}
		$('body').pleaseWait('stop');
		this.isSubsetted = this.props.subsettingDone;
		//  const data = store.getState().data.dataPreview.meta_data.data;

		// const buttonsTemplate = <div className="col-md-12 text-right">
		// 			<button onClick={this.closePreview}  className="btn btn-default" > {this.buttons.close.text} </button>
		// 			<span>&nbsp;&nbsp;</span>
		// 			<button className="btn btn-primary"> {this.buttons.create.text}</button>
		// 	 </div>

		let dataPrev = this.props.dataPreview;
		if (dataPrev && !isEmpty(dataPrev)) {
			dataPrev = this.props.dataPreview.meta_data
			//  console.log(data[0]);
			//const tableThTemplate=data[0].map((thElement, thIndex) => {
			const topInfo = dataPrev.metaData.map((item, i) => {
				if(item.display){
					return(



							<div key={i} className="col-md-2 co-sm-4 col-xs-6">
							<h3 className="text-center">
							{item.value} <br/><small>{item.displayName}</small>
							</h3>
							</div>

					);
				}
			});



			const tableThTemplate=dataPrev.columnData.map((thElement, thIndex) => {
				// console.log("th check::");
				// console.log(thElement);
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


				const anchorCls =thElement.slug + " dropdown-toggle cursor";
               if(thElement.chartData != null){
            		if(thElement.ignoreSuggestionFlag){
    					cls = cls + " greyout-col";

    				return(
    						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)} title={thElement.ignoreSuggestionMsg}>
    						<a href="#" data-toggle="dropdown" className={anchorCls}><i className={iconCls}></i> {thElement.name}<b className="caret"></b></a>
                             <DataValidation name={thElement.name} slug={thElement.slug} />
    						</th>
    				);
    			}else{
    				return(
    						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
    						<a href="#" data-toggle="dropdown" id={thElement.slug} className={anchorCls}><i className={iconCls}></i> {thElement.name}<b className="caret"></b></a>
    						<DataValidation name={thElement.name} slug={thElement.slug} />
    						</th>
    				);

    			}
               }else{
            	   return(
   						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
   						<a href="#"  id={thElement.slug} className={anchorCls}><i className={iconCls}></i> {thElement.name}</a>
   						</th>
   				);
               }

			});
			//  data.splice(0,1);
			const tableRowsTemplate = dataPrev.sampleData.map((trElement, trIndex) => {

				const tds=trElement.map((tdElement, tdIndex) => {
					if(dataPrev.columnData[tdIndex].ignoreSuggestionFlag){
						let cls = dataPrev.columnData[tdIndex].slug + " greyout-col";
						return(
							<td key={tdIndex} className={cls} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
					   );
					}else{
						return(
							<td key={tdIndex} className={dataPrev.columnData[tdIndex].slug} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
					);
					}

				});
				return (
						<tr key={trIndex}>
						{tds}
						</tr>

				);
			});
			let  sideTableTemaplte = "";
			let firstChart = "";
			 let firstTimeSubSetting = ""
            if(dataPrev.columnData[0].chartData != null){
            	const sideChart = dataPrev.columnData[0].chartData.chart_c3;
    			let yformat = dataPrev.columnData[0].chartData.yformat;
    			let xdata = dataPrev.columnData[0].chartData.xdata;
    			console.log("chart-----------")
    			const sideTable = dataPrev.columnData[0].columnStats;
    			this.firstTimeSideTable = sideTable; //show hide side table
    			this.firstTimeSideChart = dataPrev.columnData[0].chartData;
    			this.firstTimeColTypeForChart = dataPrev.columnData[0].columnType;
    			 if(!$.isEmptyObject(this.firstTimeSideChart)){
    				 firstChart = <C3Chart classId={this.chartId} data={sideChart} yformat={yformat} xdata={xdata} sideChart={true}/> ;
    			 }
    			 if(!isEmpty(dataPrev.columnData[0]))
    			 firstTimeSubSetting = dataPrev.columnData[0]
    			console.log("checking side table data:; ");
    			console.log(sideTable);
    			sideTableTemaplte=sideTable.map((tableItem,tableIndex)=>{
    				if(tableItem.display){
    					return(  <tr key={tableIndex}>
    					<td className="item">{tableItem.displayName}</td>
    					<td>&nbsp; : &nbsp;&nbsp;{tableItem.value}</td>
    					</tr>
    					);
    				}
    			});
            }



			return(
					<div className="side-body">
					{/* <!-- Page Title and Breadcrumbs -->*/}
					<div className="page-head">
					<div className="row">
					<div className="col-md-8">
					<h3 className="xs-mt-0 text-capitalize">Data Preview</h3>
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

					<Scrollbars style={{ height: 779 }}>
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
					 <div className="xs-pt-5 xs-pr-5 xs-pb-5 xs-pl-5">
					<table className="no-border no-strip skills" cellpadding="3" cellspacing="0" id="side-table">
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
					<h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_visualizations" href="#pnl_visl" aria-expanded="true" className="">Visualization <i className="fa fa-angle-down pull-right"></i></a></h4>
					</div>
					<div id="pnl_visl" className="panel-collapse collapse in" aria-expanded="true">
					<div className="xs-pt-5 xs-pr-5 xs-pb-5 xs-pl-5">
					<div id="side-chart">
					{/*<img src="../assets/images/data_preview_graph.png" className="img-responsive" />*/}
						{firstChart}
						<div className="clearfix"></div>
					</div>
					</div>
					</div>
					</div>
					</div>
					{/*<!-- ./ End Tab Visualizations -->*/}

					{/*<!-- Start Tab Subsettings -->*/}
					<div id = "sub_settings">
					<SubSetting item = {firstTimeSubSetting}/>
					</div>
					{/* End Tab Subsettings */}
					</div>
					<div className="clearfix"></div>
					</div>

					<div className="row buttonRow" id="dataPreviewButton">
					<div className="col-md-12">

					<div className="panel">
					<div className="panel-body">

					<div className="navbar">
						<ul className="nav navbar-nav navbar-right">
						<li>
							{
							(this.isSubsetted)
							?(  <div className="form-group">
							<input type="text" name="newSubsetName" id="newSubsetName" className="form-control input-sm col-sm-12" placeholder="New Datset Name"/>
							</div>)
							:(<div/>)
							}
						</li>

						<li className="text-right">
							<Button onClick={this.closePreview.bind(this)}> {this.buttons.close.text} </Button>
							{
							(this.isSubsetted)
							?(<Button onClick={this.applyDataSubset.bind(this)} bsStyle="primary">Save Config</Button>)
							:(<Button onClick={this.moveToVariableSelection.bind(this)} bsStyle="primary"> {this.buttons.create.text}</Button>)
							}
						</li>
						</ul>
						</div>


					<DataUploadLoader/>
					</div>
					</div>
					</div>


					</div>

					</div>
					{/*<!-- /.Page Content Area --> */}
					<DataValidationEditValues/>
					  <Dialog ref="dialog"/>
					 </div>
			);
		} else {
			return (
					 <div>	<DataUploadLoader/>
			            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
									{/*<div><div className="text-center text-muted xs-mt-50"><h2>Data preview failed to load. Please refresh the page or try again later</h2></div></div>*/}
			          </div>
			);
		}
	}
}
