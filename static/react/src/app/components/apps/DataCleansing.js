import React from "react";
import {Scrollbars} from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
//import {Redirect} from 'react-router';
import {Link, Redirect} from "react-router-dom";
import store from "../../store"
import {SelectButton} from 'primereact/selectbutton';
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
import {showHideSideChart, showHideSideTable, MINROWINDATASET,toggleVisualization, getRemovedVariableNames} from "../../helpers/helper.js"
import {isEmpty, CREATESIGNAL, CREATESCORE, CREATEMODEL} from "../../helpers/helper";
import {DataUploadLoader} from "../common/DataUploadLoader";
import Dialog from 'react-bootstrap-dialog';
import {checkCreateScoreToProceed, getAppDetails} from "../../actions/appActions";
import {
  missingValueTreatmentSelectedAction,
  outlierRemovalSelectedAction,
  variableSelectedAction,
  removeDuplicateAttributesAction,
  removeDuplicateObservationsAction,
  outlierRangeAction,
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
    datasets : store.datasets
    //data_cleansing: store.datasets.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing
  };
})

export class DataCleansing extends React.Component {
  constructor(props) {
    super(props);
    this.buttons = {};
    this.state = {
      value1: null,
      value2: null
    };
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

    var proccedUrl = this.props.match.url.replace('dataCleansing','featureEngineering');

    if(this.props.match.path.includes("slug")){
      this.buttons['proceed']={
        url : proccedUrl,
        text:"Proceed"};
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

missingValueTreatmentOnChange(event){

  console.log(event.target.dataset);
  this.props.dispatch(missingValueTreatmentSelectedAction(event.target.dataset["colname"],event.target.dataset["coltype"], event.target.dataset["colslug"], event.target.value));

}
outlierRemovalOnChange(event){
  this.props.dispatch(outlierRemovalSelectedAction(event.target.dataset["colname"],event.target.dataset["coltype"],event.target.dataset["colslug"], event.target.value));
}

variableCheckboxOnChange(event){
  this.props.dispatch(variableSelectedAction(event.target.dataset["colslug"], event.target.checked));
}

handleDuplicateAttributesOnChange(event){
  this.setState({value1: event.target.value})
  this.props.dispatch(removeDuplicateAttributesAction(event.target.name,event.target.value));
}

handleDuplicateObservationsOnChange(event){
  this.setState({value2: event.target.value})
  this.props.dispatch(removeDuplicateObservationsAction(event.target.name,event.target.value));
}

handleDataTypeChange(colSlug, event){
  this.props.dispatch(dataCleansingDataTypeChange(colSlug, event.target.value));
}
getUpdatedDataType(colSlug){
  // this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == slug);
  // console.log(this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == slug));
  let colType = this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == colSlug)[0].columnType
  var arr = [ "Measure","Dimension", "Datetime"]
  var optionsHtml = arr.map(item => {
    if(item.toLowerCase()== colType.toLowerCase() ){
      return <option value={item.toLowerCase()} selected>{item}</option>
    }else{
      return <option value={item.toLowerCase()} >{item}</option>
    }
  })
  return <select className="form-control"  onChange={this.handleDataTypeChange.bind(this,colSlug )} >
  {optionsHtml}
</select>
}

proceedFeatureEngineering()
{
  var proccedUrl = this.props.match.url.replace('dataCleansing','featureEngineering');
  this.props.history.push(proccedUrl);
}

getOutlierRemovalOptions(dataType, colName, colSlug){
  var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
  if (dataType in data_cleansing && "outlier_removal" in data_cleansing[dataType]){
    var dcHTML =  (data_cleansing[dataType].outlier_removal.operations.map(item =>
                        <option value={item.name} selected >{item.displayName}</option>))

<<<<<<< HEAD
    getOutlierRangeOptions(name, value){
      this.props.dispatch(outlierRangeAction( event.target.name, event.target.value));
    }

  getOutlierRemovalOptions(dataType, colName, colSlug){
    var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
    if (dataType in data_cleansing && "outlier_removal" in data_cleansing[dataType]){
      var dcHTML =  (data_cleansing[dataType].outlier_removal.operations.map(item => <option value={item.name} selected >{item.displayName}</option>))
      var selectedValue = "none";
      if(colSlug in this.props.datasets.outlierRemoval){
        selectedValue = this.props.datasets.outlierRemoval[colSlug].treatment
      }
      return (<select className="form-control" data-colName={colName}  data-colslug={colSlug} onChange={this.outlierRemovalOnChange.bind(this)} value={selectedValue} >{dcHTML}</select>);
=======
    var selectedValue = "none";
    if(colSlug  in this.props.datasets.outlierRemoval){
        selectedValue = this.props.datasets.outlierRemoval[colSlug].treatment
>>>>>>> a6579e1ec38eb6fa4dc133dd083cc1fa8e8f2382
    }


    return (<select className="form-control" data-colName={colName} data-colslug={colSlug} onChange={this.outlierRemovalOnChange.bind(this)} value={selectedValue} >{dcHTML}</select>);
  }
  else { return "";}
}

getMissingValueTreatmentOptions(dataType, colName, colSlug){
  var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
  if (dataType in data_cleansing && "missing_value_treatment" in data_cleansing[dataType]){
    var dcHTML =  (data_cleansing[dataType].missing_value_treatment.operations.map(item =>
                    <option value={item.name} selected >{item.displayName}</option>))

<<<<<<< HEAD
  getMissingValueTreatmentOptions(dataType, colName, colSlug){
    var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
    if (dataType in data_cleansing && "missing_value_treatment" in data_cleansing[dataType]){
      var dcHTML =  (data_cleansing[dataType].missing_value_treatment.operations.map(item =>
        <option value={item.name} selected >{item.displayName}</option>))
      var selectedValue = "none";
      if(colSlug in this.props.datasets.missingValueTreatment){
=======
    var selectedValue = "none";
    if(colSlug  in this.props.datasets.missingValueTreatment){
>>>>>>> a6579e1ec38eb6fa4dc133dd083cc1fa8e8f2382
        selectedValue = this.props.datasets.missingValueTreatment[colSlug].treatment
    }

    return (<select className="form-control" data-coltype={dataType}  data-colslug={colSlug} data-colname={colName} onChange={this.missingValueTreatmentOnChange.bind(this)} value={selectedValue} >{dcHTML}</select>);
  }
  else { return "";}
}



  render() {



    const options = [

      {label: 'Yes', value: 'true'},
      {label: 'No', value: 'false'},
    ];
    var cleansingHtml = <span>"Loading ... "</span>;
    if(this.props.dataPreview!=null)
    {
      var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
      var removedVariables = getRemovedVariableNames(this.props.datasets);
      cleansingHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        // console.log(item);
        if(removedVariables.indexOf(item.name)!= -1 ) return "";

        return (
          <tr>
            {/* <td><div class="ma-checkbox inline">
                <input id={item.slug} type="checkbox" class="needsclick variableToBeSelected"  data-colslug={item.slug} onChange={this.variableCheckboxOnChange.bind(this)}/>
                <label for={item.slug}> </label>
              </div></td> */}
<<<<<<< HEAD
            <td className="text-left">{item.name}</td>
            <td>  {this.getUpdatedDataType(item.slug)} </td>
            {/* using filter and map to retrive data from array inside array*/}
            <td> {item.columnStats.filter(function(items){
              return  items.name == "numberOfUniqueValues" }).map((option)=>{
                return(<span>{option.value}</span>);
              })}
            </td>
            <td>{item.columnStats.filter(function(items){
             return  items.name == "Outliers" }).map((option)=>{
               return(<span>{option.value}</span>);
             })}
           </td>
           <td>{item.columnStats.filter(function(items){
             return  items.name == "PercentageMissingValue" }).map((option)=>{
               return(<span>{option.value}</span>);
             })}
           </td>
           <td> {this.getMissingValueTreatmentOptions(item.columnType, item.name, item.slug)} </td>
           <td> {this.getOutlierRemovalOptions(item.columnType, item.name, item.slug)}</td>
           <span style={{visibility:"hidden"}}>{item.columnStats.filter(function(items){
             return  items.name == "PercentageMissingValue" }).map((option)=>{
               return(<span>{option.value}</span>);
             })}
           </span>
         </tr>
=======

          <td className="text-left">{item.name}</td>
          <td>  {this.getUpdatedDataType(item.slug)}</td>
         {/* using filter and map to retrive data from array inside array*/}
         {/* <td> */}
         <td>
             {item.columnStats.filter(function(items){
                 return  items.name == "numberOfUniqueValues" }).map((option)=>{
                   return(<span>{option.value}</span>);
               }
               )}
         </td>
         <td>
             {item.columnStats.filter(function(items){
                 return  items.name == "Outliers" }).map((option)=>{
                   return(<span>{option.value}</span>);
               }
               )}
         </td>
         <td>
             {item.columnStats.filter(function(items){
                 return  items.name == "PercentageMissingValue" }).map((option)=>{
                   return(<span>{option.value}</span>);
               }
               )}
         </td>
         <td>
              {this.getMissingValueTreatmentOptions(item.columnType, item.name, item.slug)}
         </td>
         <td>
              {this.getOutlierRemovalOptions(item.columnType, item.name, item.slug)}
         </td>

          </tr>
>>>>>>> a6579e1ec38eb6fa4dc133dd083cc1fa8e8f2382
        );
      })
    }

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
                <label for="rd1" class="col-sm-5 control-label"><i class="fa fa-angle-double-right"></i> Do you want to remove duplicate attributes/columns in the dataset?</label>
                <div class="col-sm-7">
                  <div className="content-section implementation">
                    <SelectButton id="rd1" value={this.state.value1} options={options} name="remove_duplicate_attributes"  onChange={this.handleDuplicateAttributesOnChange.bind(this)} />
                    {/* <p>Selected Value: {this.state.value1}</p> */}
                  </div>
                  {/* <SelectButton value={this.state.value1} options={options}  onChange={(e) => this.setState({value1: e.value})} />
                    <p>Selected Value: {this.state.value1}</p> */}

                </div>
              </div>

              <div class="clearfix xs-mb-5"></div>

              <div class="form-group">
                <label for="rd2" class="col-sm-5 control-label"><i class="fa fa-angle-double-right"></i> Do you want to remove duplicate observations  in the dataset?</label>
                <div class="col-sm-7">
                  <div className="content-section implementation">
                    <SelectButton id="rd2" value={this.state.value2} options={options} name="remove_duplicate_observations"  onChange={this.handleDuplicateObservationsOnChange.bind(this)} />
                    {/* <p>Selected Value: {this.state.value2}</p> */}
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
                                <input id="checkAll" type="checkbox" class="needsclick" onChange={this.handleSelectAll.bind(this)}/>
                                <label for="checkAll">All</label>
                              </div>
                            </th> */}

                            <th className="text-left"><b>Variable name</b></th>
                            <th><b>Data type</b></th>
                            <th><b>No of unique values</b></th>
                            <th><b>No of outliers</b></th>
                            <th><b>% of missing values</b></th>
                            <th><b>Missing value treatment</b></th>
                            <th><b>Outlier removal</b></th>
                            </tr>
                        </thead>
                        <tbody className="no-border-x">
                          {cleansingHtml}
                        </tbody>
                      </table>

                  </div>
  <div class="buttonRow text-right">
     <Button onClick={this.proceedFeatureEngineering.bind(this)}  bsStyle="primary">Proceed <i class="fa fa-angle-double-right"></i></Button>
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
