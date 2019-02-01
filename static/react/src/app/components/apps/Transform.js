import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/dataActions";
import {  saveEncodingValuesAction } from "../../actions/featureEngineeringActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
  };
})

export class Transform extends React.Component {
  constructor(props) {
    super(props);
    console.log("Transform constructor method is called...");
    this.pickValue = this.pickValue.bind(this);
    this.state = {};
    this.state.encodingRadioButton;

  }

  componentWillMount() {
    console.log("Transform componentWillMount method is called...");
  }

  getTransformationata(){
    var transformationData = {};
    if(this.props.featureEngineering != undefined || this.props.featureEngineering !=null){
      var slugData = this.props.featureEngineering[this.props.selectedItem.slug];
      if(slugData != undefined ){
        if(slugData.transformationData != undefined)
        transformationData = slugData.transformationData;
      }
    }
    return transformationData;
  }

  getTranformDataValue(name){
    var transformationData = this.getTransformationata();
    var value = transformationData[name];
    return value;
  }

  pickValue(event){
    this.props.parentPickValue("transformationData", event);
  }

  onchangeInput(event){
    return event.target.value;
  }

  handleEncodingRadioButtonOnchange(event){
    this.state.encodingRadioButton = event.target.value;
    this.saveEncodingValues();
  }
  // handleEncodingInputOnchange(event){
  //   this.state.encodingInput = event.target.value;
  //   this.saveEncodingValues();
  // }
  saveEncodingValues(){
    this.props.dispatch(saveEncodingValuesAction(this.state.encodingRadioButton));
    this.setState({ state: this.state });
  }

  render() {
    console.log("Transforms render method is called...");
    // var transformHtml = this.props.dataPreview.meta_data.uiMetaData.fe_config.fe;
    // var mtransform = transformHtml.measure.transformation_settings.operations.map(item => {
    //   if(item.display){
    //     return (
    //       <div class="ma-checkbox inline">
    //         <input id={item.name} name={item.name} type="checkbox" class="needsclick" onInput={this.pickValue} onChange={this.pickValue}/>
    //         <label for={item.name}>{item.name}:</label>
    //       </div>
    //
    //     );
    //   }
    //   else{
    //     return "";
    //   }
    // })
    if(this.props.selectedItem.columnType == "measure"){
      return (
        <div class="modal-body">
          <h4>What would you like to do with {this.props.selectedItem.name} column?</h4>
          <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
            Each option will create an additional feature derived out of the original column.</p>
          <hr/>
          {/* <!-- content goes here --> */}
          <form class="form_withrowlabels">
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="replace_values_with" name="replace_values_with" defaultChecked={this.getTranformDataValue("replace_values_with")} type="checkbox" class="needsclick" onChange={this.pickValue}/>
                  <label for="replace_values_with">Replace Values With:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="number" name="replace_values_with_input" class="form-control" placeholder="Value" defaultValue={this.getTranformDataValue("replace_values_with_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
              <label for="replace_values_with_selected" class="col-md-1 col-sm-1 control-label xs-p-0 xs-mt-5 text-right">With</label>
              <div class="col-md-3 col-sm-3">
                <select class="form-control" id="replace_values_with_selected" name="replace_values_with_selected" defaultValue={this.getTranformDataValue("replace_values_with_selected")}    onChange={this.pickValue}>
                  <option value="None" > None</option>
                  <option value="Mean">Mean</option>
                  <option value="Median">Median</option>
                  <option value="Mode" >Mode</option>
                </select>
              </div>
            </div>
            {/* <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="add_specific_value" name="add_specific_value" type="checkbox"  defaultChecked={this.getTranformDataValue("add_specific_value")} class="needsclick" onChange={this.pickValue}/>
                  <label for="add_specific_value">Add Specific value:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" name="add_specific_value_input" class="form-control" placeholder="Value" defaultValue={this.getTranformDataValue("add_specific_value_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="subtract_specific_value" name="subtract_specific_value" type="checkbox" defaultChecked={this.getTranformDataValue("subtract_specific_value")} class="needsclick" onChange={this.pickValue}/>
                  <label for="subtract_specific_value">Subtract Specific value:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" name="subtract_specific_value_input" class="form-control" placeholder="Value" defaultValue={this.getTranformDataValue("subtract_specific_value_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="multiply_specific_value" name="multiply_specific_value" type="checkbox" defaultChecked={this.getTranformDataValue("multiply_specific_value")} class="needsclick" onChange={this.pickValue}/>
                  <label for="multiply_specific_value">Multiply Specific value:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" name="multiply_specific_value_input" class="form-control" placeholder="Value" defaultValue={this.getTranformDataValue("multiply_specific_value_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="divide_specific_value" name="divide_specific_value" type="checkbox" defaultChecked={this.getTranformDataValue("divide_specific_value")} class="needsclick" onChange={this.pickValue}/>
                  <label for="divide_specific_value">Divide Specific value:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" name="divide_specific_value_input" class="form-control" placeholder="Value" defaultValue={this.getTranformDataValue("divide_specific_value_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div> */}
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="perform_standardization" name="perform_standardization" type="checkbox" defaultChecked={this.getTranformDataValue("perform_standardization")} class="needsclick" onChange={this.pickValue}/>
                  <label for="perform_standardization">Perform Standardization:</label>
                </div>
              </div>
              <div class="col-md-4 col-sm-4">

                <select class="form-control" id="perform_standardization_select" name="perform_standardization_select" defaultValue={this.getTranformDataValue("perform_standardization_select")} onChange={this.pickValue}>
                  <option value="None" selected> None</option>
                  <option value="normalization">Normalization</option>
                  <option value="standardization">Standardization</option>
                </select>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="variable_transformation" name="variable_transformation" defaultChecked={this.getTranformDataValue("variable_transformation")} type="checkbox" class="needsclick" onChange={this.pickValue}/>
                  <label for="variable_transformation">Variable Transformation:</label>
                </div>
              </div>
              <div class="col-md-4 col-sm-3">
                <select class="form-control" id="variable_transformation_select" name="variable_transformation_select" value={this.getTranformDataValue("variable_transformation_select")} onChange={this.pickValue}>
                  <option value="log_transform">Log</option>
                  <option value="square_root_transform">Square root</option>
                  <option value="cube_root_transform">Cube root</option>
                  <option value="modulus_transform">Modulus</option>
                  <option selected >None</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      );
    }
    else if(this.props.selectedItem.columnType == "dimension"){
      return (
        <div class="modal-body">
          <h4>What would you like to do with {this.props.selectedItem.name} column?</h4>
          <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
            Each option will create an additional feature derived out of the original column.</p>
          <hr />
          {/* <!-- content goes here --> */}
          <form class="form_withrowlabels">
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="encoding_dimensions" name="encoding_dimensions" type="checkbox" defaultChecked={this.getTranformDataValue("encoding_dimensions")} class="needsclick" onChange={this.onchangeInput.bind(this)}  onInput={this.pickValue}/>
                  <label for="encoding_dimensions">Perform Encoding:</label>
                </div>
              </div>
              <span onChange={this.onchangeInput.bind(this)} className="inline">
                <div class="col-md-7 col-sm-6">
                  <div class="ma-checkbox inline">
                    <input type="radio" id="one_hot_encoding" name="encoding_type" value="one_hot_encoding"  defaultChecked={this.getTranformDataValue("encoding_type") === "one_hot_encoding" } onChange={this.pickValue}/>
                    <label for="one_hot_encoding">One hot encoding</label>
                  </div>
                  <div class="ma-checkbox inline">
                    <input type="radio" id="label_encoding" name="encoding_type"  value="label_encoding" defaultChecked={this.getTranformDataValue("encoding_type") === "label_encoding"} onChange={this.pickValue}/>
                    <label for="label_encoding">Label encoding</label>
                  </div>
                </div>
              </span>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="return_character_count" name="return_character_count" type="checkbox" defaultChecked={this.getTranformDataValue("return_character_count")} class="needsclick" onChange={this.pickValue}/>
                  <label for="return_character_count">return Character Count</label>
                </div>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="is_custom_string_in" name="is_custom_string_in" type="checkbox" defaultChecked={this.getTranformDataValue("is_custom_string_in")} class="needsclick" onChange={this.pickValue}/>
                  <label for="is_custom_string_in">Is custom string in:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" id="is_custom_string_in_input" name="is_custom_string_in_input" class="form-control" placeholder="Please Type" defaultValue={this.getTranformDataValue("is_custom_string_in_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div>
          </form>
        </div>
      );
    }
    else{
      return (
        <div class="modal-body">
          <h4>What would you like to do with {this.props.selectedItem.name} column?</h4>
          <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
            Each option will create an additional feature derived out of the original column.</p>
          <hr/>
          {/* <!-- content goes here --> */}
          <form class="form_withrowlabels">
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="is_date_weekend" name="is_date_weekend" type="checkbox" defaultChecked={this.getTranformDataValue("is_date_weekend")} class="needsclick" onChange={this.pickValue}/>
                  <label for="is_date_weekend">Is Date Weekend or Not?</label>
                </div>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="extract_time_feature" name="extract_time_feature" type="checkbox" defaultChecked={this.getTranformDataValue("extract_time_feature")} class="needsclick" onChange={this.pickValue}/>
                  <label for="extract_time_feature">Extract Time Feature:</label>
                </div>
              </div>
              <div class="col-md-4 col-sm-3">
                <select class="form-control" name="extract_time_feature_select" value={this.getTranformDataValue("extract_time_feature_select")} onChange={this.pickValue}>
                  <option value="day_of_week">Day of week</option>
                  <option value="month_of_year">Month of Year</option>
                  <option selected value="">None</option>
                </select>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-5 col-sm-5">
                <div class="ma-checkbox inline">
                  <input id="time_since" name="time_since" type="checkbox" defaultChecked={this.getTranformDataValue("time_since")} class="needsclick" onChange={this.pickValue}/>
                  <label for="time_since">Time Since Some Event:</label>
                </div>
              </div>
              <div class="col-md-3 col-sm-3">
                <input type="text" name="time_since_input" class="form-control" placeholder="Please Type" defaultValue={this.getTranformDataValue("time_since_input")} onChange={this.onchangeInput.bind(this)} onInput={this.pickValue}/>
              </div>
            </div>
          </form>
        </div>
      );
    }
  }
}
