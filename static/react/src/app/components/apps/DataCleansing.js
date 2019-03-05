import React from "react";
import {Scrollbars} from 'react-custom-scrollbars';
import {Provider} from "react-redux";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import faker from 'faker'
import SmartDataTable from 'react-smart-data-table';
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

export class DataCleansing extends React.Component {
  constructor(props) {
    super(props);
    this.buttons = {};
    this.state = {
            value1: false,
            value2: false,
            checked:true,
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
        text:"Proceed"
      };
    }
    var removedVariables = getRemovedVariableNames(this.props.datasets);
    this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
      if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag)
      return "";
        this.props.dispatch(variableSelectedAction(item.name, true));
      });   
        }

  componentDidMount() {
    $("#sdataType").change(function(){
      $("#dctable tbody tr").hide();
      $("#dctable tbody tr."+$(this).val()).show('fast');
    });

    $("#myCheckAll").click(function () {
      $('input:checkbox').not(this).prop('checked', this.checked);
  });

 
  $('#search').on('keyup', function() {
      var value = $(this).val();
      var patt = new RegExp(value, "i");
      $('#dctable').find('tr').each(function() {
        if (!($(this).find('td').text().search(patt) >= 0)) {
   		     $(this).not('.myHead').hide();
         }
         if (($(this).find('td').text().search(patt) >= 0)) {
           $(this).show();
         }
      });
    });

}
  componentWillUpdate() {
  }

  shouldComponentUpdate(nextProps) {
    return true;
  }

  onchangeMissingValueTreatment(event, variable_name){
  }

  missingValueTreatmentOnChange(event){
    this.props.dispatch(missingValueTreatmentSelectedAction(event.target.dataset["colname"],event.target.dataset["coltype"], event.target.dataset["colslug"], event.target.value));
  }

  outlierRemovalOnChange(event){
    this.props.dispatch(outlierRemovalSelectedAction(event.target.dataset["colname"],event.target.dataset["coltype"],event.target.dataset["colslug"], event.target.value));
  }

  variableCheckboxOnChange(event){
    this.props.dispatch(variableSelectedAction(event.target.dataset["colname"], event.target.checked));
    if(Object.values(this.props.datasets.selectedVariables).includes(false)){
      // this.props.checkedAll=false
      this.props.dispatch(checkedAllAction(false));
  }
  else
  {
  this.props.dispatch(checkedAllAction(true));
  }
}

  checkedAllOnChange(event){
    this.props.dispatch(checkedAllAction( event.target.checked));
    if(!event.target.checked){
      var removedVariables = getRemovedVariableNames(this.props.datasets);
      this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag)
        return "";
      this.props.dispatch(variableSelectedAction(item.name, false));
      });
     }else{
      var removedVariables = getRemovedVariableNames(this.props.datasets);
      this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag)
        return "";
      this.props.dispatch(variableSelectedAction(item.name, true));
      });
    }     
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
    let actualColType = this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == colSlug)[0].actualColumnType
    let colType = this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == colSlug)[0].columnType

    var arr = [ "Measure","Dimension", "Datetime"]
    var optionsHtml = arr.map(item => {
      if(item.toLowerCase()== colType.toLowerCase() ){
        return <option value={item.toLowerCase()} selected> {item}</option>
      }else{
        return <option value={item.toLowerCase()} > {item}</option>
      }
    })
    return <select className="form-control"  onChange={this.handleDataTypeChange.bind(this,colSlug )} > {colType} {optionsHtml} </select>
  }

  getOutlierRemovalOptions(dataType, colName, colSlug){
    var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
    if (dataType in data_cleansing && "outlier_removal" in data_cleansing[dataType]){
      var dcHTML =  (data_cleansing[dataType].outlier_removal.operations.map(item => <option value={item.name} selected >{item.displayName}</option>))
      var selectedValue = "none";
      if(colSlug in this.props.datasets.outlierRemoval){
        selectedValue = this.props.datasets.outlierRemoval[colSlug].treatment
      }
      return (
        <select className="form-control" data-coltype={dataType} data-colName={colName} data-colslug={colSlug} onChange={this.outlierRemovalOnChange.bind(this)} value={selectedValue} >{dcHTML}</select>
      );
    }
    else return ""
  }

  proceedFeatureEngineering()
  {
    var proccedUrl = this.props.match.url.replace('dataCleansing','featureEngineering');
    this.props.history.push(proccedUrl);
  }
  handelSort(variableType,sortOrder){
    this.props.dispatch(handelSort(variableType,sortOrder))
  }

  getMissingValueTreatmentOptions(dataType, colName, colSlug){
    var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
    if (dataType in data_cleansing && "missing_value_treatment" in data_cleansing[dataType]){
      var dcHTML =  (data_cleansing[dataType].missing_value_treatment.operations.map(item => <option value={item.name} selected >{item.displayName}</option>))
      var selectedValue = "none";
      if(colSlug in this.props.datasets.missingValueTreatment){
        selectedValue = this.props.datasets.missingValueTreatment[colSlug].treatment
      }
      return (
        <select className="form-control" data-coltype={dataType}  data-colslug={colSlug} data-colname={colName} onChange={this.missingValueTreatmentOnChange.bind(this)} value={selectedValue} >{dcHTML}</select>
      );
    }
    else { return "";}
  }


  dcTableSorter() {
  $(function() {
      $('#dctable').tablesorter({
        theme : 'ice',
        headers: {
           0: {sorter: false},
           6: {sorter: false},
           7: {sorter: false}
         },

      });

    });
  }


  render() {
    // this.dcTableSorter();
    var cleansingHtml = <span>"Loading..."</span>;
    var removedVariables = getRemovedVariableNames(this.props.datasets);


    var testData = [];
    this.props.dataPreview.meta_data.scriptMetaData.columnData.map(function(items){
      if(removedVariables.indexOf(items.name)!= -1|| items.ignoreSuggestionFlag )
      return "";

      return(
      testData.push({
        Variablename: items.name,
        Datatype: items.columnType,
        // No_of_unique_values: items.columnStats.filter(function(itemss){
        //   return  itemss.name == "numberOfUniqueValues" }).map((option)=>{
        //     return(<span>{option.value}</span>);
        //   }
        // ),
        // phone_number:getMissingValueTreatmentOptions(item.columnType, item.name, item.slug),
        address: {
          city: faker.address.city(),
          state: faker.address.state(),
          country: faker.address.country()
        }
      }));
    })






    if(this.props.dataPreview!=null)  {
      var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
      var removedVariables = getRemovedVariableNames(this.props.datasets);
      cleansingHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag)
          return "";
        return (
          <tr className={('all ' + item.columnType)} id="mssg">
            <td>
              <div class="ma-checkbox inline">
                <input id={item.slug} type="checkbox" className="needsclick variableToBeSelected" value={item} defaultChecked={this.state.checked} data-colname={item.name} onChange={this.variableCheckboxOnChange.bind(this)}/>
                <label for={item.slug}> </label>
              </div>
            </td>
            <td className="text-left">{item.name}</td>
            <td>  {this.getUpdatedDataType(item.slug)} </td>
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
                return  items.name == "numberOfNulls" }).map((option)=>{
                  return(<span>{option.value}</span>);
                }
               )}
            </td>
            <td> {this.getMissingValueTreatmentOptions(item.columnType, item.name, item.slug)} </td>
            <td> {this.getOutlierRemovalOptions(item.columnType, item.name, item.slug)} </td>
          </tr>
        );
      })
    }

    return (
      // <!-- Main Content starts with side-body -->
      <div className="side-body">
        {/* <!-- Page Title and Breadcrumbs -->*/}
        <div className="page-head">
          <h3 className="xs-mt-0 xs-mb-0 text-capitalize"> Data Cleansing</h3>
        </div>
        {/*<!-- /.Page Title and Breadcrumbs -->*/}
        {/*<!-- Page Content Area -->*/}
        <div className="main-content">
          <div class="row">
            <div class="col-md-12">
              <div class="panel box-shadow xs-m-0">
                <div class="panel-body no-border xs-p-20">
                  <div class="form-group">
                    <label for="rd1" class="col-sm-5 control-label"><i class="fa fa-angle-double-right"></i> Do you want to remove duplicate columns/attributes in the dataset?</label>
                    <div class="col-sm-7">
                      <div className="content-section implementation">
                        <InputSwitch id="rd1" onLabel="Yes" offLabel="No"  checked={this.state.value1}  name="remove_duplicate_attributes"  onChange={this.handleDuplicateAttributesOnChange.bind(this)} />
                      </div>
                    </div>
                  </div>
                  <div class="clearfix xs-mb-5"></div>
                    <div class="form-group">
                      <label for="rd2" class="col-sm-5 control-label"><i class="fa fa-angle-double-right"></i> Do you want to remove duplicate rows/observations  in the dataset?</label>
                      <div class="col-sm-7">
                        <div className="content-section implementation">
                          <InputSwitch id="rd2" checked={this.state.value2}  name="remove_duplicate_observations" onChange={this.handleDuplicateObservationsOnChange.bind(this)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="panel box-shadow ">
                  <div class="panel-body no-border xs-p-20">
                    <div class="row xs-mb-10">
                      <div className="col-md-3">
                        <div class="form-inline" >
							<div class="form-group">
							<label for="sdataType">Filter By: </label>
							<select id="sdataType" className="form-control cst-width">
							<option value="all">Data Type</option>
							<option value="measure">Measure</option>
							<option value="dimension">Dimension</option>
							<option value="datetime">Datetime</option>
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
                  <div className="table-responsive ">

                    <table  id="dctable" className="tablesorter table table-condensed table-hover table-bordered">
                      <thead>
                        <tr className="myHead">
                          <th>
                            <div class="ma-checkbox inline">
                              <input id="myCheckAll" type="checkbox" className="needsclick"   checked={this.props.checkedAll} defaultChecked="true"  onChange={this.checkedAllOnChange.bind(this)}/>
                              <label for="myCheckAll"></label>
                            </div>
                          </th>
                          <th><b>Variable name</b></th>
                          <th ><b>Data type</b></th>
                          <th><b>No of unique values</b></th>
                          <th><b>No of outliers</b></th>
                          <th><b>No of missing values</b></th>
                          <th><b>Missing value treatment</b></th>
                          <th><b>Outlier removal</b></th>
                        </tr>
                      </thead>
                      <tbody className="no-border-x">
                        {cleansingHtml}
                      </tbody>
                    </table>
                  </div>

                                    <SmartDataTable
                      data={testData}
                      name='test-table'
                      className='table table-condensed table-hover table-bordered'
                      perPage='10'
                      // filterValue=''
                      sortable
                    />
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