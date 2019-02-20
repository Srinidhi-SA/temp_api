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
    datasets : store.datasets
    //data_cleansing: store.datasets.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing
  };
})

export class DataCleansing extends React.Component {
  constructor(props) {
    super(props);
    this.buttons = {};
    this.state = {
            value1: false,
            value2: false
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
  }

  // componentDidMount() {
  // }

  componentDidMount() {
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
    let actualColType = this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == colSlug)[0].actualColumnType
    let colType = this.props.dataPreview.meta_data.uiMetaData.columnDataUI.filter(item => item.slug == colSlug)[0].columnType

    var arr = [ "Measure","Dimension", "Datetime"]
    var optionsHtml = arr.map(item => {
      if(item.toLowerCase()== colType.toLowerCase() ){
        return <option value={item.toLowerCase()} selected>{item}</option>
      }else{
        return <option value={item.toLowerCase()} >{item}</option>
      }
    })
    return <select className="form-control"  onChange={this.handleDataTypeChange.bind(this,colSlug )} > {actualColType} {optionsHtml} </select>
  }

  proceedFeatureEngineering()
  {
    var proccedUrl = this.props.match.url.replace('dataCleansing','featureEngineering');
    this.props.history.push(proccedUrl);
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
handelSort(variableType,sortOrder){
  this.props.dispatch(handelSort(variableType,sortOrder))
}
getMissingValueTreatmentOptions(dataType, colName, colSlug){
  var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
  if (dataType in data_cleansing && "missing_value_treatment" in data_cleansing[dataType]){
    var dcHTML =  (data_cleansing[dataType].missing_value_treatment.operations.map(item =>
                    <option value={item.name} selected >{item.displayName}</option>))

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
    $.tablesorter.filter.types.start = function( config, data ) {
  if ( /^\^/.test( data.iFilter ) ) {
    return data.iExact.indexOf( data.iFilter.substring(1) ) === 0;
  }
  return null;
};

// search for a match at the end of a string
// "a$" matches "Llama" but not "aardvark"
$.tablesorter.filter.types.end = function( config, data ) {
  if ( /\$$/.test( data.iFilter ) ) {
    var filter = data.iFilter,
      filterLength = filter.length - 1,
      removedSymbol = filter.substring(0, filterLength),
      exactLength = data.iExact.length;
    return data.iExact.lastIndexOf(removedSymbol) + filterLength === exactLength;
  }
  return null;
};


    $(function() {
      $('#dctable').tablesorter({
        theme: 'ice',
        headers: {
          0: {sorter: false,filter:false},
          // 2: {sorter: false , filter:false},
          6: {sorter: false ,filter:false},
          7: {sorter: false,filter:false}
        },
        widgets: [ 'filter'],
        widgetOptions: {
              filter_reset : 'button.reset',
            filter_functions : {
                  //   3 : {
                  //   "< 10"      : function(e, n, f, i, $r, c, data) { return n < 10; },
                  //   "10 - 100" : function(e, n, f, i, $r, c, data) { return n >= 10 && n <=100; },
                  //   "> 100"     : function(e, n, f, i, $r, c, data) { return n > 100; }
                  // },
                  1 : {
                     "A - D" : function(e, n, f, i, $r, c, data) { return /^[A-D]/.test(e); },
                     "E - H" : function(e, n, f, i, $r, c, data) { return /^[E-H]/.test(e); },
                     "I - L" : function(e, n, f, i, $r, c, data) { return /^[I-L]/.test(e); },
                     "M - P" : function(e, n, f, i, $r, c, data) { return /^[M-P]/.test(e); },
                     "Q - T" : function(e, n, f, i, $r, c, data) { return /^[Q-T]/.test(e); },
                     "U - X" : function(e, n, f, i, $r, c, data) { return /^[U-X]/.test(e); },
                     "Y - Z" : function(e, n, f, i, $r, c, data) { return /^[Y-Z]/.test(e); }
                   },
                   2 : {
                      "Dimension" : function(e, n, f, i, $r, c, data) { return /^[di]{2}/.test(e); },
                      "Measure" : function(e, n, f, i, $r, c, data) { return /^[m]/.test(e); },
                      "Datetime" : function(e, n, f, i, $r, c, data) { return /^[da]{2}/.test(e); }

                    },
                      },



            }
      });
      // $("#dim").click();
    });
  }

  render() {
    this.dcTableSorter();
    var cleansingHtml = <span>"Loading ... "</span>;


    if(this.props.dataPreview!=null)
    {
      var data_cleansing = this.props.dataPreview.meta_data.uiMetaData.fe_config.data_cleansing ;
      var removedVariables = getRemovedVariableNames(this.props.datasets);
      cleansingHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
        if(removedVariables.indexOf(item.name)!= -1|| item.ignoreSuggestionFlag)
          return "";
          let checked=true

        return (
          <tr>
            <td>
              <div class="ma-checkbox inline">
              <input id={item.slug} type="checkbox" className="needsclick variableToBeSelected" value={item} defaultChecked={checked} data-colslug={item.slug} onChange={this.variableCheckboxOnChange.bind(this)}/>
              {/* <input id={item.slug} type="checkbox" class="needsclick variableToBeSelected"  data-colslug={item.slug} /> */}

              <label for={item.slug}> </label>
              </div>
            </td>
            <td className="text-left">{item.name}</td>
            {/* <td>{item.actualColumnType}</td> */}

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
                    {/* <SelectButton id="rd1" value={this.state.value1} options={options} name="remove_duplicate_attributes"  onChange={this.handleDuplicateAttributesOnChange.bind(this)} /> */}
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

                    {/* <SelectButton id="rd2" value={this.state.value2} options={options} name="remove_duplicate_observations"  onChange={this.handleDuplicateObservationsOnChange.bind(this)} /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
                <div className="panel box-shadow ">
                    <div class="panel-body no-border xs-p-20">

                              <div class="row xs-mb-10">
                                <div class="col-md-3 col-md-offset-9">
                                  <div class="form-inline" >
                                    <div class="form-group pull-right">
                                      {/* <button type="button" className="btn btn-default btn-md reset ">Reeeset filter</button> */}

                                      {/* <label class="col-sm-3 xs-pt-5">	Search</label> */}
                                       <input type="text" id="search" className="form-control" placeholder="Search variables..."></input>
                                    </div>
                                  </div>
                                	</div>
                                </div>
                        <div className="table-responsive ">
                      <table  id="dctable" className="tablesorter table table-condensed table-hover table-bordered">
                        <thead>
                          <tr className="myHead">
                            <th> <div class="ma-checkbox inline">
                                {/* <input id="checkAll" type="checkbox" class="needsclick" onChange={this.handleSelectAll.bind(this)}/> */}
                                <input id="checkAll" type="checkbox" class="needsclick" checked="checked" />

                                 <label for="checkAll"></label>
                              </div>
                            </th>
                            <th class="filter-select filter-exact" data-placeholder="" ><b>Vaaariable name</b></th>
                            <th class="filter-select filter-exact" data-placeholder="" ><b>Data type</b></th>
                            {/* <th class="filter-select filter-exact" data-placeholder=""><b>Convert Data type to</b></th> */}

                            <th class="filter-select filter-exact" data-placeholder=""><b>No of unique values</b></th>
                            <th class="filter-select filter-exact" data-placeholder="" ><b>No of outliers</b></th>
                            <th  ><b>No of missing values</b></th>
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
