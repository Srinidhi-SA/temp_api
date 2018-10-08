import React from "react";
import {Scrollbars} from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
//import {Redirect} from 'react-router';
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {
  hideDataPreview,
  getDataSetPreview,
  renameMetaDataColumn,
  updateTranformColumns,
  hideDataPreviewDropDown,
  popupAlertBox
} from "../../actions/dataActions";
import {dataSubsetting, clearDataPreview, clearLoadingMsg} from "../../actions/dataUploadActions"
import {Button, Dropdown, Menu, MenuItem} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import {showHideSideChart, showHideSideTable, MINROWINDATASET,toggleVisualization} from "../../helpers/helper.js"
import {isEmpty, CREATESIGNAL, CREATESCORE, CREATEMODEL} from "../../helpers/helper";
import {SubSetting} from "./SubSetting";
import {DataUploadLoader} from "../common/DataUploadLoader";
import {DataValidation} from "./DataValidation";
import {DataValidationEditValues} from "./DataValidationEditValues";
import Dialog from 'react-bootstrap-dialog';
import {checkCreateScoreToProceed, getAppDetails} from "../../actions/appActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    signalMeta: store.datasets.signalMeta,
    curUrl: store.datasets.curUrl,
    dataPreviewFlag: store.datasets.dataPreviewFlag,
    currentAppId: store.apps.currentAppId,
    roboDatasetSlug: store.apps.roboDatasetSlug,
    modelSlug: store.apps.modelSlug,
    signal: store.signals.signalAnalysis,
    subsettingDone: store.datasets.subsettingDone,
    subsettedSlug: store.datasets.subsettedSlug,
    dataTransformSettings: store.datasets.dataTransformSettings,
    scoreToProceed: store.apps.scoreToProceed,
    currentAppDetails: store.apps.currentAppDetails
  };
})

export class DataPreview extends React.Component {

  constructor(props) {
    super(props);
    console.log("in data");
    console.log(props);
    this.buttons = {};
    //this.buttonsTemplate=null;
    this.hideDataPreview = this.hideDataPreview.bind(this);
    this.chartId = "_side";
    this.firstTimeSideTable = [];
    this.firstTimeSideChart = {};
    this.firstTimeColTypeForChart = null;
    this.isSubsetted = false;
    this.new_subset = "";
    this.toggleVisualizationSlug="";
  }

  hideDataPreview() {
    this.props.dispatch(hideDataPreview());
  }
  // getPreviewData(e){
  //   this.props.dispatch(getData(e.target.id));
  // }

  componentWillMount() {
    console.log("------------------");
    console.log(this.props);
    console.log("data prevvvvv");
    if (this.props.dataPreview == null || isEmpty(this.props.dataPreview) || this.props.dataPreview.status == 'FAILED') {
      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
    }
    //When user refresh get current app details
    if (this.props.match.path.includes("AppId")) {
      this.props.dispatch(getAppDetails(this.props.match.params.AppId));
    }
    if (this.props.match.path.includes("models") && this.props.match.path.includes("modelSlug") && this.props.match.path.includes("slug")) {
      this.buttons['close'] = {
        url: "/apps",
        text: "Close"
      };
      this.buttons['create'] = {
        url: "/apps/" + this.props.match.params.AppId + "/models/" + this.props.match.params.modelSlug + "/data/" + this.props.match.params.slug + "/createScore",
        text: CREATESCORE
      };
    } else if (this.props.match.path.includes("models") && this.props.match.path.includes("slug")) {
      this.buttons['close'] = {
        url: "/apps",
        text: "Close"
      };
      this.buttons['create'] = {
        url: "/apps/" + this.props.match.params.AppId + "/models/data/" + this.props.match.params.slug + "/createModel",
        text: CREATEMODEL
      };
    } else if (this.props.match.path.includes("robo")) {
      this.buttons['close'] = {
        url: "/apps-robo",
        text: "Close"
      };
      this.buttons['create'] = {
        url: "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/" + store.getState().signals.signalAnalysis.slug,
        text: "Compose Insight"
      };
    } else if (this.props.match.path.includes("slug")) {
      this.buttons['close'] = {
        url: "/data",
        text: "Close"
      };
      this.buttons['create'] = {
        url: "/data/" + this.props.match.params.slug + "/createSignal",
        text: CREATESIGNAL
      };
    }
    /* console.log(store.getState().datasets.curUrl.indexOf("models"));
    if (store.getState().datasets.curUrl) {
      if (store.getState().datasets.curUrl.startsWith("/signals")) {
        this.buttons['close'] = {
          url: "/signals",
          text: "Close"
        };
        this.buttons['create'] = {
          url: "/data/" + this.props.match.params.slug + "/createSignal",
          text: CREATESIGNAL
        };

      } else if (store.getState().datasets.curUrl.startsWith("/data")) {
        this.buttons['close'] = {
          url: "/data",
          text: "Close"
        };
        this.buttons['create'] = {
          url: "/data/" + this.props.match.params.slug + "/createSignal",
          text: CREATESIGNAL
        };

      } else if (store.getState().datasets.curUrl.startsWith("/apps")) {
        if (store.getState().datasets.curUrl.indexOf("robo") != -1) {
          this.buttons['close'] = {
            url: "/apps/" + store.getState().apps.currentAppDetails.slug + "/robo",
            text: "Close"
          };
          this.buttons['create'] = {
            url: "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/" + store.getState().signals.signalAnalysis.slug,
            text: "Compose Insight"
          };
        } else if (store.getState().datasets.curUrl.indexOf("models") == -1) {
          this.buttons['close'] = {
            url: "/apps",
            text: "Close"
          };
          this.buttons['create'] = {
            url: "/apps/" + store.getState().apps.currentAppDetails.slug + "/models/" + store.getState().apps.modelSlug + "/data/" + this.props.match.params.slug + "/createScore",
            text: CREATESCORE
          };
        } else {
          this.buttons['close'] = {
            url: "/apps",
            text: "Close"
          };
          this.buttons['create'] = {
            url: "/apps/" + store.getState().apps.currentAppDetails.slug + "/models/data/" + this.props.match.params.slug + "/createModel",
            text: CREATEMODEL
          };
        }

      }
    } else {
      this.buttons['close'] = {
        url: "/data",
        text: "Close"
      };
      this.buttons['create'] = {
        url: "/data/" + this.props.match.params.slug + "/createSignal",
        text: CREATESIGNAL
      };
    }*/

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



		});*/
    }

    showHideSideTable(this.firstTimeSideTable);
    showHideSideChart(this.firstTimeColTypeForChart, this.firstTimeSideChart);
    hideDataPreviewDropDown(this.props.curUrl);
    toggleVisualization(this.toggleVisualizationSlug,this.props.dataTransformSettings);

  }

  componentWillUpdate() {
    let currentDataset = store.getState().datasets.selectedDataSet
    if (!isEmpty(this.props.dataPreview) && currentDataset != this.props.match.params.slug && this.props.dataPreview != null && this.props.dataPreview.status != 'FAILED') {
      if (!this.props.match.path.includes("robo")) {
        let url = '/data/' + currentDataset;
        console.log(this.props);
        this.props.history.push(url)
        // return (<Redirect to={url}/>)
      }
    }
    if (!isEmpty(this.props.dataPreview) && this.props.dataPreview != null && this.props.dataPreview.status == 'FAILED') {
      console.log("goitn to data url")
      this.props.dispatch(clearDataPreview())
      this.props.dispatch(clearLoadingMsg())
      let url = '/data/'
      this.props.history.push(url)
    }
  }
  setSideElements(e) {

    //renderFlag=true;
    //alert("setting side element!!")
    const chkClass = $(e.target).attr('class');
    let dataPrev = this.props.dataPreview.meta_data.scriptMetaData;
    dataPrev.columnData.map((item, i) => {

      if (chkClass.indexOf(item.slug) !== -1) {
        console.log(item);
        $("#side-chart").empty();
        showHideSideChart(item.columnType, item.chartData); // hide side chart on datetime selection
        toggleVisualization(item.slug,this.props.dataTransformSettings);
        if (!$.isEmptyObject(item.chartData)) {
          const sideChartUpdate = item.chartData.chart_c3;
          let yformat = item.chartData.yformat;
          let xdata = item.chartData.xdata;
          console.log("checking side table data:; ");
          console.log(sideTableUpdate);
          //currently hardcoding charInfo as empty
          let chartInfo = []
          $("#side-chart").empty();
          ReactDOM.render(
            <Provider store={store}><C3Chart chartInfo={chartInfo} classId={"_side"} data={sideChartUpdate} yformat={yformat} xdata={xdata} sideChart={true}/></Provider>, document.getElementById('side-chart'));
        }
        const sideTableUpdate = item.columnStats;
        let sideTableUpdatedTemplate = "";
        if (sideTableUpdate != null) {
          showHideSideTable(sideTableUpdate); // hide side table on blank or all display false
          sideTableUpdatedTemplate = sideTableUpdate.map((tableItem, tableIndex) => {
            if (tableItem.display) {
              return (
                <tr key={tableIndex}>
                  <td className="item">{tableItem.displayName}</td>
                  <td>&nbsp;:&nbsp;</td>
                  <td>
                    <span title={tableItem.value} className="stat-txtControl">{tableItem.value}</span>
                  </td>
                </tr>
              );
            }
          });
        }
        $("#side-table").empty();
        ReactDOM.render(
          <tbody className="no-border-x no-border-y">{sideTableUpdatedTemplate}</tbody>, document.getElementById('side-table'));
        if (this.props.dataPreview.permission_details.subsetting_dataset) {
          // column subsetting starts
          const sideSubsetting = item.columnStats;
          $("#sub_settings").empty();
          ReactDOM.render(
            <Provider store={store}><SubSetting item={item}/></Provider>, document.getElementById('sub_settings'));
        }
        // column subsetting ends

      }
    });
  }

  closePreview() {

    const url = this.buttons.close.url;
    //<Link to={this.buttons.close.url}>
    this.props.dispatch(hideDataPreview());
    this.props.history.push(url);

    //return(<Redirect to={url}/>);
  }

  moveToVariableSelection() {
    //alert(this.buttons.create.url);
    //check for minimum rows in datasets
    if (this.props.dataPreview.meta_data.uiMetaData.metaDataUI[0].value < MINROWINDATASET && this.buttons.create.url.indexOf("apps-robo") == -1)
      bootbox.alert("Minimum " + MINROWINDATASET + " rows are required for analysis!!")
    else if (this.props.dataPreview.meta_data.uiMetaData.varibaleSelectionArray && (this.props.dataPreview.meta_data.uiMetaData.varibaleSelectionArray.length == 0 || (this.props.dataPreview.meta_data.uiMetaData.varibaleSelectionArray.length == 1 && this.props.dataPreview.meta_data.uiMetaData.varibaleSelectionArray[0].dateSuggestionFlag == true))) {
      bootbox.alert("Not enough data to run analysis. Please upload/connect a differenct dataset.")
    } else {
      let url = this.buttons.create.url;
      if (this.buttons.create.url.indexOf("apps-robo") != -1) {
        //  $(".cst_table").find("thead").find("." + colSlug).first()
        url = "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/" + store.getState().signals.signalAnalysis.slug
        this.props.history.push(url);
      } else if (store.getState().datasets.curUrl.indexOf("scores") != -1) {
        if (store.getState().apps.scoreToProceed == true) {
          this.props.history.push(url);
        } else {
          this.props.dispatch(hideDataPreview());

          popupAlertBox("One or few variables are missing from the scoring data. Score cannot be created",this.props,url.split("/data")[0])
        }
      } else
        this.props.history.push(url);
      }
    }

  applyDataSubset() {
    //alert("working");
    this.new_subset = $("#newSubsetName").val()
    if (this.new_subset == "" || this.new_subset == null) {
      bootbox.alert("Please enter new config name!")
    }else if ( (this.new_subset != "" || this.new_subset != null) && this.new_subset.trim()==""){
      bootbox.alert("Please enter valid config name!");
      $("#newSubsetName").val("").focus();
    } else {
      let transformationSettings = {};
      transformationSettings.existingColumns = store.getState().datasets.dataTransformSettings;
      var nonDeletedColumns = 0;
      let dataPrev = this.props.dataPreview.meta_data;
      $.each(dataPrev.uiMetaData.metaDataUI,function(key,val){
        if(val.name == "noOfColumns"){
          nonDeletedColumns = val.value;
          return false;
        }
      });
      if(nonDeletedColumns == 0){
        bootbox.alert("Atleast one column is needed to create a new dataset")
        return;
      }
      let subSettingRq = {
        'filter_settings': store.getState().datasets.updatedSubSetting,
        'name': this.new_subset,
        'subsetting': true,
        'transformation_settings': transformationSettings
      };
      this.props.dispatch(dataSubsetting(subSettingRq, this.props.dataPreview.slug))
    }
  }
  shouldComponentUpdate(nextProps) {
    toggleVisualization(this.toggleVisualizationSlug,this.props.dataTransformSettings);
    return true;
  }

  render() {

    console.log("data prev is called##########3");
    //for active select in columnName
    //console.log(this.props)
    var that = this;
    $(function() {

      var idActiveColumn = false;
      $(".cst_table tbody tr").first().find("td").each(function() {

        if ($(this).hasClass("activeColumn"))
          idActiveColumn = true
      })
      if (!idActiveColumn) {
        let initialCol = $(".cst_table td").first();
        let initialColCls = $(initialCol).attr("class");
        $(" td." + initialColCls).addClass("activeColumn");

      }

      $(".cst_table td,.cst_table th").click(function() {
        $(".cst_table td").removeClass("activeColumn");
        let cls = $(this).attr("class");
        if (cls.indexOf(" ") !== -1) {
          let tmp = [];
          tmp = cls.split(" ");
          cls = tmp[0];
        }
        $(" td." + cls).addClass("activeColumn");
      });
    });

    this.isSubsetted = this.props.subsettingDone;
    //  const data = store.getState().data.dataPreview.meta_data.data;

    // const buttonsTemplate = <div className="col-md-12 text-right">
    // 			<button onClick={this.closePreview}  className="btn btn-default" > {this.buttons.close.text} </button>
    // 			<span>&nbsp;&nbsp;</span>
    // 			<button className="btn btn-primary"> {this.buttons.create.text}</button>
    // 	 </div>

    let dataPrev = this.props.dataPreview;
    let isSubsettingAllowed = false;
    let isDataValidationAllowed = false;
    let isCreateAllowed = false
    if (dataPrev && !isEmpty(dataPrev) && dataPrev.status != "FAILED") {
      dataPrev = this.props.dataPreview.meta_data;
      let permission_details = this.props.dataPreview.permission_details;
      isSubsettingAllowed = permission_details.subsetting_dataset;
      isDataValidationAllowed = permission_details.data_validation;
      if (this.buttons.create.text == CREATESIGNAL) {
        isCreateAllowed = permission_details.create_signal;

      } else if (this.buttons.create.text == CREATEMODEL) {
        isCreateAllowed = permission_details.create_trainer;
      } else if (this.buttons.create.text == CREATESCORE) {
        isCreateAllowed = permission_details.create_score;
      } else if (this.buttons.create.text == "Compose Insight") {
        //need to change in future
        isCreateAllowed = true
      }
      if (dataPrev && !isEmpty(dataPrev)) {
        const topInfo = dataPrev.uiMetaData.metaDataUI.map((item, i) => {
          if (item.display) {
            return (

              <div key={i} className="col-md-5ths col-xs-6 data_preview xs-mb-15">
                <div className="bgStockBox">
				<div className="row">					
					<div className="col-xs-8 ">
							<h4 className="xs-mt-15 xs-mr-10 xs-mb-15 xs-ml-10 xs-p-0">
							{item.displayName}				  
							</h4>
					</div>
					<div className="col-xs-4 xs-p-0 text-right">
							<h4 className="xs-mt-15 xs-mr-10 xs-mb-15 xs-ml-10 xs-p-0 text-info">
							{item.value}
							</h4>
					</div>
				</div>				
				</div>
              </div>

            );
          }
        });

        const tableThTemplate = dataPrev.uiMetaData.columnDataUI.map((thElement, thIndex) => {
          // console.log("th check::");
          // console.log(thElement);
          let cls = thElement.slug + " dropdown";
          let iconCls = null;
          let dataValidationCom = ""
          switch (thElement.columnType) {
            case "measure":
              iconCls = "mAd_icons ic_mes_s";
              break;
            case "dimension":
              iconCls = "mAd_icons ic_dime_s";
              break;
            case "datetime":
              iconCls = "pe-7s-timer pe-lg pe-va";
              break;

          }

          const anchorCls = thElement.slug + " dropdown-toggle cursor";
          if (isDataValidationAllowed)
            dataValidationCom = <DataValidation name={thElement.name} slug={thElement.slug}/>
          if (!thElement.consider) {
            cls = cls + " greyout-col";

            return (
              <th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)} title={thElement.ignoreSuggestionMsg}>
                <a href="#" data-toggle="dropdown" className={anchorCls}>
                  <i className={iconCls}></i>
                  <span>{thElement.name}</span>{this.props.match.url.indexOf('/apps-stock-advisor/')<0?<b className="caret"></b>:""}
                </a>
                {this.props.match.url.indexOf('/apps-stock-advisor/')<0?dataValidationCom:""}
              </th>
            );
          } else {
            return (
              <th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
                <a href="#" data-toggle="dropdown" id={thElement.slug} className={anchorCls} title={thElement.name}>
                  <i className={iconCls}></i>
                  <span>{thElement.name}</span> <b className="caret"></b>
                </a>
                {dataValidationCom}
              </th>
            );

          }
          // }
          {/*else{
            	   return(
   						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
   						<a href="#"  id={thElement.slug} className={anchorCls} title={thElement.name}><i className={iconCls}></i> <span>{thElement.name}</span></a>
   						</th>
   				);
               }*/
          }

        });
        //  data.splice(0,1);
        const tableRowsTemplate = dataPrev.uiMetaData.sampleDataUI.map((trElement, trIndex) => {

          const tds = trElement.map((tdElement, tdIndex) => {
            if (!dataPrev.uiMetaData.columnDataUI[tdIndex].consider) {
              let cls = dataPrev.uiMetaData.columnDataUI[tdIndex].slug + " greyout-col";
              return (
                <td key={tdIndex} className={cls} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
              );
            } else {
              return (
                <td key={tdIndex} className={dataPrev.uiMetaData.columnDataUI[tdIndex].slug} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
              );
            }

          });
          return (
            <tr key={trIndex}>
              {tds}
            </tr>

          );
        });
        let sideTableTemaplte = "";
        let firstChart = "";
        let firstTimeSubSetting = ""
        if (dataPrev.scriptMetaData.columnData[0].chartData != null) {
          const sideChart = dataPrev.scriptMetaData.columnData[0].chartData.chart_c3;
          let yformat = dataPrev.scriptMetaData.columnData[0].chartData.yformat;
          let xdata = dataPrev.scriptMetaData.columnData[0].chartData.xdata;
          console.log("chart-----------")
          const sideTable = dataPrev.scriptMetaData.columnData[0].columnStats;
          this.firstTimeSideTable = sideTable; //show hide side table
          this.firstTimeSideChart = dataPrev.scriptMetaData.columnData[0].chartData;
          this.firstTimeColTypeForChart = dataPrev.scriptMetaData.columnData[0].columnType;
          this.toggleVisualizationSlug = dataPrev.scriptMetaData.columnData[0].slug;
          if (!$.isEmptyObject(this.firstTimeSideChart)) {
            let chartInfo = [];
            firstChart = <C3Chart chartInfo={chartInfo} classId={this.chartId} data={sideChart} yformat={yformat} xdata={xdata} sideChart={true}/>;
          }
          if (!isEmpty(dataPrev.scriptMetaData.columnData[0]))
            firstTimeSubSetting = dataPrev.scriptMetaData.columnData[0]
          console.log("checking side table data:; ");
          console.log(sideTable);
          sideTableTemaplte = sideTable.map((tableItem, tableIndex) => {
            if (tableItem.display) {
              return (
                <tr key={tableIndex}>
                  <td className="item">{tableItem.displayName}</td>
                  <td>&nbsp;:&nbsp;</td>
                  <td>
                    <span title={tableItem.value} className="stat-txtControl">{tableItem.value}</span>
                  </td>
                </tr>
              );
            }
          });
        }

        return (
          <div className="side-body">
            {/* <!-- Page Title and Breadcrumbs -->*/}
            <div className="page-head">
              <div className="row">
                <div className="col-md-8">
                  <h3 className="xs-mt-0 xs-mb-0 text-capitalize"><a href="/data"><i class="zmdi zmdi-arrow-left"></i></a> Data Preview</h3>
                </div>
              </div>
              <div className="clearfix"></div>
            </div>
            {/*<!-- /.Page Title and Breadcrumbs -->*/}
            {/*<!-- Page Content Area -->*/}
            <div className="main-content">
			<div className="row">
				 
				 {topInfo}
				 
			</div>
              <div className="row">
                <div className="col-md-9 preview_content">
                  
                     
                    <div className="clearfix"></div>
                    <div className="table-responsive noSwipe xs-pb-10">

                      <Scrollbars style={{
                        height: 855
                      }}>
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
                <div className="col-md-3 preview_stats">
                  {/*<!-- Start Tab Statistics -->*/}
                  <div id="tab_statistics" className="panel-group accordion accordion-semi box-shadow">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h4 className="panel-title">
                          <a data-toggle="collapse" data-parent="#tab_statistics" href="#pnl_stc" aria-expanded="true" className="">Statistics
                            <i className="fa fa-angle-down pull-right"></i>
                          </a>
                        </h4>
                      </div>
                      <div id="pnl_stc" className="panel-collapse collapse in" aria-expanded="true">
                        <div className="xs-pt-5 xs-pr-5 xs-pb-5 xs-pl-5">
                          <table className="no-border no-strip skills" cellPadding="3" cellSpacing="0" id="side-table">
                            <tbody className="no-border-x no-border-y">
                              {sideTableTemaplte}

                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*<!-- ./ End Tab Statistics -->*/}
                  {/* <!-- Start Tab Visualizations -->*/}
                  <div id="tab_visualizations" className="panel-group accordion accordion-semi box-shadow">
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <h4 className="panel-title">
                          <a data-toggle="collapse" data-parent="#tab_visualizations" href="#pnl_visl" aria-expanded="true" className="">Visualization
                            <i className="fa fa-angle-down pull-right"></i>
                          </a>
                        </h4>
                      </div>
                      <div id="pnl_visl" className="panel-collapse collapse in" aria-expanded="true">
                        <div className="xs-pt-5 xs-pr-5 xs-pb-5 xs-pl-5">
                          <div id="side-chart" style={{
                            paddingTop: "12px"
                          }}>
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

                  {isSubsettingAllowed == true
                    ? <div id="sub_settings" className="box-shadow"><SubSetting item={firstTimeSubSetting}/>
                      </div>
                    : ""}

                  {/* End Tab Subsettings */}
                </div>
                <div className="clearfix"></div>
              </div>

              <div className="row buttonRow" id="dataPreviewButton">
                <div className="col-md-12">

                  <div className="panel xs-mb-0">
                    <div className="panel-body box-shadow">

                      <div className="navbar">
                        <ul className="nav navbar-nav navbar-right">
                          <li>
                            {(this.isSubsetted)
                              ? (
                                <div className="form-group">
                                  <input type="text" name="newSubsetName" id="newSubsetName" className="form-control input-sm col-sm-12" placeholder="New Datset Name"/>
                                </div>
                              )
                              : (<div/>)
}
                          </li>

                          <li className="text-right">
                            <Button onClick={this.closePreview.bind(this)}>
                              {this.buttons.close.text}
                            </Button>
                            {(this.isSubsetted)
                              ? (
                                <Button onClick={this.applyDataSubset.bind(this)} bsStyle="primary">Save Config</Button>
                              )
                              : (
                                <Button onClick={this.moveToVariableSelection.bind(this)} disabled={!isCreateAllowed} bsStyle="primary">
                                  {this.buttons.create.text}</Button>
                              )
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
          <div>
            <DataUploadLoader/>
            <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
            <div>
              <div className="text-center text-muted xs-mt-50">
                <h3>Data preview failed to load. Please refresh the page or try again later</h3>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div>
          <DataUploadLoader/>
          <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/> {/*<div><div className="text-center text-muted xs-mt-50"><h2>Data preview failed to load. Please refresh the page or try again later</h2></div></div>*/}
        </div>
      );
    }
  }
}
