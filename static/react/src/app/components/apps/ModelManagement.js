import React from "react";
import {Scrollbars} from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
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
    currentAppDetails: store.apps.currentAppDetails
  };
})

export class ModelManagement extends React.Component {
  constructor(props) {
    super(props);
    console.log("in data");
    console.log(props);
  }

  componentWillMount() {
    if(this.props.apps_regression_modelName == "" || this.props.currentAppDetails == null){
      window.history.go(-1);
    }
    if (this.props.dataPreview == null || isEmpty(this.props.dataPreview) || this.props.dataPreview.status == 'FAILED') {
      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));

    }else{
      console.log("not updating dataPreview data from server");
    }
  }

  componentDidMount() {
  }

  componentWillUpdate() {
  }

  render() {
    return (
      // <!-- Main Content starts with side-body -->
      <div className="side-body">
        {/* <!-- Page Title and Breadcrumbs -->*/}
        <div className="page-head">
         <h1 className="xs-mt-0 xs-mb-0 text-capitalize">Modellllllllllllllllllllll Management</h1>
        </div>
        {/*<!-- /.Page Title and Breadcrumbs -->*/}
        {/*<!-- Page Content Area -->*/}
        <div className="main-content">
          <div class="row">
            <div class="col-md-12">           
              <div class="panel box-shadow">
                <div class="panel-body no-border xs-p-20">
			            <div class="row xs-mb-10">
                    <div class="col-md-12">
					            <div class="form-inline text-right">
                        <div class="form-group">
                          <label for="sdataType">Filter By: </label>
						              <input type="text" id="searchBypname" class="form-control" list="listProjectName" placeholder="Project Name"/>&nbsp;&nbsp;&nbsp;
						                <label for="sdataType">Search: </label>
							            <input type="text" id="search" class="form-control" placeholder="Search..."/>
						              </div>
              					</div>
		              		</div>
              			</div>
                    <div class="table-responsive">
                      <table class="tablesorter table table-striped table-hover table-bordered break-if-longText">
                        <thead>
                         <tr className="myHead">
              					  <th>
                            <div class="ma-checkbox inline">
                              <input id="checkAll" type="checkbox" />
                              <label for="checkAll"> </label>
                            </div>
                          </th>
                          <th>Model Id</th>
                          <th class="text-left">Project Name</th>
                          <th class="text-left">Algorithm</th>
                          <th>Status</th>
                          <th>Accuracy</th>
                          <th>Created On</th>
                          <th>Owner</th>
                          <th>Runtime</th>
                          <th>Deploy</th>
                        </tr>
                      </thead>
                      <tbody className="no-border-x">
                      </tbody>
                    </table>
                  </div>
                <div class="buttonRow text-right"> <a href="javascript:;" class="btn btn-primary">Close </a> </div>
              </div>
            </div>
            <div class="xs-p-30"></div>
           </div>
           {/* <!-- Open Column --> */}
          </div>
          {/* <!-- End Row --> */}
        </div>
        {/*<!--End of Page Content Area -->*/}
      </div>
      /* // <!-- /. Main Content ends with side-body --> */
    );
  }
}
