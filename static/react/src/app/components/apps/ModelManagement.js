import React from "react";
import {Scrollbars} from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
//import {Redirect} from 'react-router';
import {Link, Redirect} from "react-router-dom";
import store from "../../store"
import {InputSwitch} from 'primereact/inputswitch';
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
import {updateSelectedVariables, resetSelectedVariables, setSelectedVariables,updateDatasetVariables,handleDVSearch,handelSort,handleSelectAll,checkColumnIsIgnored,deselectAllVariablesDataPrev,makeAllVariablesTrueOrFalse,DisableSelectAllCheckbox,updateVariableSelectionArray,getTotalVariablesSelected} from "../../actions/dataActions";

import {showHideSideChart, showHideSideTable, MINROWINDATASET,toggleVisualization, getRemovedVariableNames} from "../../helpers/helper.js"
import {isEmpty, CREATESIGNAL, CREATESCORE, CREATEMODEL} from "../../helpers/helper";
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog';
import {getAppsModelList,getAppsAlgoList,getAppsModelSummary,updateModelSlug,updateScoreSummaryFlag,
  updateModelSummaryFlag,handleModelDelete,handleModelRename,storeModelSearchElement,storeAppsModelSortElements,getAppDetails,refreshAppsAlgoList,refreshAppsModelList} from "../../actions/appActions";
  
import {
  missingValueTreatmentSelectedAction,
  outlierRemovalSelectedAction,
  variableSelectedAction,
  checkedAllAction,
  removeDuplicateAttributesAction,
  removeDuplicateObservationsAction,
  dataCleansingDataTypeChange
} from "../../actions/dataCleansingActions";

@connect((store) => {
  return {
    // login_response: store.login.login_response,
    algoList: store.apps.algoList,
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
    apps_regression_modelName:store.apps.apps_regression_modelName,
    currentAppDetails: store.apps.currentAppDetails,
    datasets : store.datasets,
    checkedAll: store.datasets.checkedAll
    //data_cleansing: store.datasets.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing
  };
})

export class ModelManagement extends React.Component {
  constructor(props) {
    super(props);
  }
  

  componentWillMount() {
    this.props.dispatch(refreshAppsAlgoList(this.props));

    // var pageNo = 1;
    // if(this.props.history.location.search.indexOf("page") != -1){
    //     pageNo = this.props.history.location.search.split("page=")[1];
    // }
    // if(store.getState().apps.currentAppId == ""){
    //     this.props.dispatch(getAppDetails(this.props.match.params.AppId,pageNo));
    // }else{
    //     this.props.dispatch(getAppsModelList(pageNo));
    // }
    var pageNo = 1;
    if(this.props.history.location.search.indexOf("page") != -1){
        pageNo = this.props.history.location.search.split("page=")[1];
    }
    if(store.getState().apps.currentAppId == ""){
        this.props.dispatch(getAppDetails(this.props.match.params.AppId,pageNo));
    }else{
        this.props.dispatch(getAppsAlgoList(pageNo));
    }
  }

  componentDidMount() {
    // this.props.dispatch(refreshAppsModelList(this.props));
    this.props.dispatch(refreshAppsAlgoList(this.props));

    $('#search').on('keyup', function() {
      var value = $(this).val();
      var patt = new RegExp(value, "i");
      $('#mmtable').find('tr').each(function() {
        if (!($(this).find('td').text().search(patt) >= 0)) {
          $(this).not('.myHead').hide();
        }
        if (($(this).find('td').text().search(patt) >= 0)) {
          $(this).show();
        }
      });
    });
  }

  closeModelmanagement()
  {
    var proccedUrl = this.props.match.url.replace('modelmanagement','models');
    this.props.history.push(proccedUrl);
  }

  tableSorter() {
    $(function() {
      $('#mmtable').tablesorter({
        theme: 'ice',
        headers: {
          0: {sorter: false},
          9: {sorter: false}
        }
      });
    });
  }

  render(){
    this.tableSorter();
    // console.log(this.props.data,"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log(this.props.algoList,"@@@@@@@@@@@@@##################@@@@@@@@@@@@@@@@@")
var mmTable = "";
// var algoListData=this.props.algoList;




mmTable = this.props.algoList.data.map((item,key )=> {
  // if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag || unselectedvar.indexOf(item.name)!= -1 )
  // return "";
  // if(item.columnType == "measure")
  //   numberOfSelectedMeasures +=1;
  // else
  //   numberOfSelectedDimensions +=1;
  return (
    <tr  className={('all ' + item.name)}>
      <td className="text-left"> {item.model_id}</td>
      <td className="text-left"> {item.name}</td>
      <td className="text-left"> {item.algorithm}</td>
      <td className="text-left"> {item.status}</td>
      <td className="text-left"> {item.accuracy}</td>
      <td className="text-left"> {item.created_on}</td>
      <td className="text-left"> {item.deployment}</td>
      <td className="text-left"> {item.runtime}</td>


      





    </tr>
  );
})

    return (
      // <!-- Main Content starts with side-body -->
      <div class="side-body">
    
        {/* <!-- Page Title and Breadcrumbs --> */}
        <div class="page-head">
          <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> Model Management <br></br><small>Automated Prediction</small></h3>
        </div>
        {/* <!-- /.Page Title and Breadcrumbs --> */}
    
        {/* <!-- Page Content Area --> */}
        <div class="main-content">
    
        {/* <!-- Copy the Code From Here ////////////////////////////////////////////////// --> */}
    
        <div class="row">
            <div class="col-md-12">           
              <div class="panel box-shadow">
                <div class="panel-body no-border xs-p-20">
             <div class="row xs-mb-10">
              <div className="col-md-3">
                <div class="form-inline" >
                  <div class="form-group">
                    <label for="sdataType">Filter By: </label>
                      <input type="text" id="searchBypname" class="form-control" list="listProjectName" placeholder="Project Name"></input>
                        <datalist id="listProjectName">
                           <option value="Credit Churn Prediction"></option>
                           <option value="Ecommerce Predict"></option>
                           <option value="Call Volume"></option>
                           <option value="Student Performance"></option>								
                        </datalist> &nbsp;&nbsp;&nbsp;
                   </div>
						    </div>
               </div>
                <div class="col-md-3 col-md-offset-6">
                   <div class="form-inline" >
                      <div class="form-group pull-right">
                          <input type="text" id="search" className="form-control" placeholder="Search variables..."></input>
                      </div>
                   </div>
               </div>
            </div>
             <div class="table-responsive">
                    <table  id="mmtable" class="tablesorter table table-striped table-hover table-bordered break-if-longText">
                      <thead>
                        <tr className="myHead">
                {/* <th>
                      #
                      </th> */}
                          <th><b>Model Id</b></th>
                          <th class="text-left"><b>Project Name</b></th>
                          <th class="text-left"><b>Algorithm</b></th>
                          <th><b>Status</b></th>
                          <th><b>Accuracy</b></th>
                          <th><b>Created On</b></th>
                          <th><b>Deployment</b></th>
                <th><b>Runtime</b></th>
                <th><b>Action</b></th>
                        </tr>
                      </thead>

                      <tbody className="no-border-x">
                        {mmTable}
                      </tbody>
                    </table>
                    <div class="col-md-12 text-center">
           <ul class="pagination pagination-lg pager" id="myPager"></ul>
       </div>
                  </div>
                  <div class="buttonRow pull-right">
                    <Button   onClick={this.closeModelmanagement.bind(this)} bsStyle="primary">Close</Button>
                  </div>
                </div>
              </div>
              <div class="xs-p-30"></div>
            </div>
            {/* <!-- Open Column --> */}
          </div>
          {/* <!-- End Row --> */}
    
    
      {/* <!-- End of the Copying Code Till Here /////////////////////////////////////////// --> */}
    
        </div>
        {/* <!-- End Main Content --> */}
      </div>
    
    );
    }
  }