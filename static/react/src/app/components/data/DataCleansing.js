





/////////////
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

export class DataCleansing extends React.Component {

  constructor(props) {
    super(props);
    console.log("in data");
    console.log(props);
  }

  componentWillMount() {
    console.log("------------------");
    console.log(this.props);
    console.log("data prevvvvv");
    if (this.props.dataPreview == null || isEmpty(this.props.dataPreview) || this.props.dataPreview.status == 'FAILED') {
      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
    }
  }

  componentDidMount() {
  }

  componentWillUpdate() {
  }

  shouldComponentUpdate(nextProps) {

    return true;
  }

onchangeMissingValueTreatment(event, variable_name){

}

  render() {

    console.log("data clean is called##########");
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    console.log(this.props.dataPreview);
    console.log(this.props.signalMeta);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$end");

      var cleansingHtml = <h1>"cleansing html will come here"</h1>;
    if(this.props.dataPreview!=null)
    {
      cleansingHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        return (

          <tr>

            {/* <td><div class="ma-checkbox inline">
                <input id="check1" type="checkbox" class="needsclick"/>
                <label for="check1"></label>
              </div></td> */}







            <td>{item.name}</td>
          <td>  {item.actualColumnType}</td>
               {/* <td><select class="form-control">
                <option selected>{item.actualColumnType}</option>
                <option></option>
              </select></td> */}

         {/* using filter and map to retrive data from array inside array*/}
                  <td>
                    {item.columnStats.filter(function(items){
                  return  items.name == "numberOfUniqueValues" }).map((option)=>{
                    return(
                      <td >{option.value}</td>);
                }
                )}




                      </td>
                      <td>
                        {item.columnStats.filter(function(items){
                      return  items.name == "Outliers" }).map((option)=>{
                        return(
                          <td >{option.value}</td>);
                    }
                    )}




                          </td>


                          <td>
                            {item.columnStats.filter(function(items){
                          return  items.name == "PercentageMissingValue" }).map((option)=>{
                            return(
                              <td >{option.value}</td>);
                        }
                        )}




                              </td>



                   <td><select class="form-control">
                       <option selected>Mean Imputation</option>
                       <option>Discriminant Analysis</option>
                     </select></td>
                     <td><select class="form-control">
                         <option selected>Replace with Mean</option>
                         <option>Replace with Median</option>
                         <option>Using IQR</option>
                         <option>None</option>
                       </select></td>

          </tr>
        );
      })



    }




    // {
    //   cleansingHtml = this.props.dataPreview.meta_data.scriptMetaData.columnata.map((item, i) => {
    //     return (
    //       <tr>
    //         <td>{item.value}</td>
    //
    //       </tr>
    //     );
    //   })
    //
    // }

      return (

          // <!-- Main Content starts with side-body -->
         <div className="side-body">


  {/* <!-- Page Title and Breadcrumbs -->*/}
          <div class="page-head">
            <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> Data Cleansing</h3>
          </div>
          {/*<!-- /.Page Title and Breadcrumbs -->*/}


          {/*<!-- Page Content Area -->*/}

       <div className="main-content">
       <div class="row">
             <div class="col-md-12">
                 <div class="panel box-shadow xs-m-0">
                 <div class="panel-body no-border xs-p-20">
                  <div class="form-group">
                 <label for="rd1_Yes" class="col-sm-5 control-label"> Do you want to remove duplicate attributes/columns in the dataset?</label>
                   <div class="col-sm-7">
                      <div class="btn-group radioBtn" data-toggle="buttons">
                    <label class="btn btn-default active">
                      <input type="radio" id="rd1_Yes" name="rdc_dataset" value="Yes" />
                      Yes</label>
                    <label class="btn btn-default">
                      <input type="radio" id="rd1_No" name="rdc_dataset" value="No" />
                      No</label>
                  </div>
                </div>
              </div>
              <div class="clearfix xs-mb-5"></div>
              <div class="form-group">
                <label for="rd2_Yes" class="col-sm-5 control-label"> Do you want to remove duplicate observations  in the dataset?</label>
                <div class="col-sm-7">
                  <div class="btn-group radioBtn" data-toggle="buttons">
                    <label class="btn btn-default active">
                      <input type="radio" id="rd2_Yes" name="rd_odataset" value="Yes" />
                      Yes</label>
                    <label class="btn btn-default">
                      <input type="radio" id="rd2_No" name="rd_odataset" value="No" />
                      No</label>
                  </div>
                </div>
              </div>
           </div>
          </div>
                <div className="panel box-shadow ">
                    <div class="panel-body no-border xs-p-20">
                  <div className="table-responsive ">
                      <table className="table table-striped table-bordered break-if-longText">
                        <thead>
                          <tr>



                            {/* <th> <div class="ma-checkbox inline">
                                <input id="checkAll" type="checkbox" class="needsclick"/>
                                <label for="checkAll">All</label>
                              </div>
                            </th> */}


                            <th>Variable name</th>
                            <th>Data type</th>
                            <th># of unique values</th>
                            <th># of outliers</th>
                            <th>% of missing values</th>
                            <th>Missing value treatment</th>
                            <th>Outlier removal</th>
                            </tr>
                        </thead>
                        <tbody className="no-border-x">
                          {cleansingHtml}
                        </tbody>
                      </table>

                  </div>
  <div class="buttonRow text-right">
     <a href="featureEngineering.html" class="btn btn-primary">Proceed <i class="fa fa-angle-double-right"></i> </a>
   </div>
 </div>
        </div>
        <div class="xs-p-30"></div>
      </div>
    </div>


  </div>
  {/*<!--End of Page Content Area -->*/}
</div>
// <!-- /. Main Content ends with side-body -->


      );
    }
}
