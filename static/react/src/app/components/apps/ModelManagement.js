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
import {checkCreateScoreToProceed, getAppDetails} from "../../actions/appActions";
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


  componentDidMount() {

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
  render(){
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
          <div class="row">
              <div class="col-md-12">           
                <div class="panel box-shadow">
                  <div class="panel-body no-border xs-p-20">
                    <div class="row xs-mb-10">
                      <div className="col-md-3">
                        <div class="form-inline" >
                          <div class="form-group">
                            <label for="sdataType">Filter By: </label>
                            <select id="sdataType" className="form-control cst-width">
                              <option value="all">All Projects</option>
                              <option value="measure"></option>
                              <option value="dimension"></option>
                              <option value="datetime"></option>
                            </select>
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
                          <th>Model Id</th>
                          <th class="text-left">Project Name</th>
                          <th class="text-left">Algorithm</th>
                          <th>Status</th>
                          <th>Accuracy</th>
                          <th>Created On</th>
                          <th>Deployment</th>
                          <th>Runtime</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody className="no-border-x">
                        {/* {cleansingHtml} */}
                      </tbody>
                      {/* <tbody>
                        <tr>
                          <td>LR-000</td>
                          <td class="text-left"><a href="project_datadetail.html">Credit Churn Prediction</a></td>
                          <td class="text-left">Logistic Regression</td>
                          <td><span class="text-success">Completed</span></td>
                          <td>0.97</td>
                          <td>21/12/2018</td>
                          <td>Marlabs</td>
                <td>230 s</td>
                <td>
                <a href="#" class="btn btn-cst_button" data-toggle="modal" data-target="#deploy_popup">Deploy</a>
                </td>
                        </tr>
                        <tr>
                <td>
                <div class="ma-checkbox inline">
                  <input id="row2" type="checkbox" />
                  <label for="row2"> </label>
                </div>
                </td>
                          <td>RF-001</td>
                          <td class="text-left">Ecommerce Predict</td>
                          <td class="text-left">Random Forest</td>
                          <td>Completed</td>
                          <td>0.86</td>
                          <td>02/02/2019</td>
                          <td>Marlabs</td>
                <td>189 s</td>
                <td><button type="button" class="btn btn-cst_button">Deploy</button></td>
                        </tr>
                        <tr>
                <td>
                <div class="ma-checkbox inline">
                  <input id="row3" type="checkbox" />
                  <label for="row3"> </label>
                </div>
                </td>
                          <td>XG-003</td>
                          <td class="text-left">Call Volume</td>
                          <td class="text-left">XG Boost</td>
                          <td>Completed</td>
                          <td>0.79</td>
                          <td>31/12/2018</td>
                          <td>Marlabs</td>
                <td>340 s</td>
                <td><button type="button" class="btn btn-cst_button">Deploy</button></td>
                        </tr>
                        <tr>
                <td>
                <div class="ma-checkbox inline">
                  <input id="row4" type="checkbox" />
                  <label for="row4"> </label>
                </div>
                </td>
                          <td>NB-004</td>
                          <td class="text-left">Student Performance</td>
                          <td class="text-left">Naïve Bayes</td>
                          <td>Completed</td>
                          <td>0.72</td>
                          <td>12/09/2018</td>
                          <td>Marlabs</td>
                <td>679 s</td>
                <td><button type="button" class="btn btn-cst_button">Deploy</button></td>
                        </tr>
                      </tbody> */}
                    </table>
                    <div class="col-md-12 text-center">
           <ul class="pagination pagination-lg pager" id="myPager"></ul>
       </div>
                  </div>
                  <div class="buttonRow pull-right">
                    <Button variant="outline-success"  onClick={this.closeModelmanagement.bind(this)} bsStyle="primary">Close</Button>
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
