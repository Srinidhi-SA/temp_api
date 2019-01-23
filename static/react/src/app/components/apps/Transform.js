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

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
  };
})

export class Transform extends React.Component {
  constructor(props) {
    super(props);
    console.log("Transform constructor method is called...");
    this.pickValue = this.pickValue.bind(this);

  }

  componentWillMount() {
    console.log("Transform componentWillMount method is called...");
  }

  pickValue(event){
    this.props.parentPickValue("transformationData", event);
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
                      <input id="replace_values_with" name="replace_values_with" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="replace_values_with">Replace Values With:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="replace_values_with_input" class="form-control" placeholder="Value" onInput={this.pickValue}/>
                  </div>
                  <label for="replace_values_with_selected" class="col-md-1 col-sm-1 control-label xs-p-0 xs-mt-5 text-right">With</label>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="replace_values_with_selected" name="replace_values_with_selected" onChange={this.pickValue}>
                      <option>Mean</option>
                      <option>Median</option>
                      <option>Mode</option>
                    </select>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="add_specific_value" name="add_specific_value" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="add_specific_value">Add Specific value:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="add_specific_value_input" class="form-control" placeholder="Value" onInput={this.pickValue}/>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="subtract_specific_value" name="subtract_specific_value" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="subtract_specific_value">Subtract Specific value:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="subtract_specific_value_input" class="form-control" placeholder="Value" onInput={this.pickValue}/>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="multiply_specific_value" name="multiply_specific_value" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="multiply_specific_value">Multiply Specific value:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="multiply_specific_value_input" class="form-control" placeholder="Value" onInput={this.pickValue}/>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="divide_specific_value" name="divide_specific_value" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="divide_specific_value">Divide Specific value:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="divide_specific_value_input" class="form-control" placeholder="Value" onInput={this.pickValue}/>
                  </div>
                </div>
                  <div class="row form-group">
                    <div class="col-md-5 col-sm-5">
                      <div class="ma-checkbox inline">
                        <input id="perform_standardization" name="perform_standardization" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                        <label for="perform_standardization">Perform Standardization:</label>
                      </div>
                    </div>
                    <div class="col-md-4 col-sm-4">
                      <select class="form-control" id="perform_standardization_select" name="perform_standardization_select" onChange={this.pickValue}>
                        <option selected>Min-Max Scaling</option>
                        <option>Log Transformation</option>
                      </select>
                    </div>
                  </div>
                  <div class="row form-group">
                    <div class="col-md-5 col-sm-5">
                      <div class="ma-checkbox inline">
                        <input id="variable_transformation" name="variable_transformation" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                        <label for="variable_transformation">Variable Transformation:</label>
                      </div>
                    </div>
                    <div class="col-md-4 col-sm-3">
                      <select class="form-control" id="variable_transformation_select" name="variable_transformation_select" onChange={this.pickValue}>
                        <option>Min-Max Scaling</option>
                        <option selected>Log Transformation</option>
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
                      <input id="encoding_dimensions" name="encoding_dimensions" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="encoding_dimensions">Perform Encoding:</label>
                    </div>
                  </div>
                  <div class="col-md-7 col-sm-6">
                    <div class="ma-checkbox inline">
                      <input type="radio" id="one_hot_encoding" name="one_hot_encoding" checked="checked" onChange={this.pickValue}/>
                      <label for="one_hot_encoding">One hot encoding</label>
                    </div>
                    <div class="ma-checkbox inline">
                      <input type="radio" id="label_encoding" name="label_encoding" onChange={this.pickValue}/>
                      <label for="label_encoding">Label encoding</label>
                    </div>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="return_character_count" name="return_character_count" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="return_character_count">return Character Count</label>
                    </div>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="is_custom_string_in" name="is_custom_string_in" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="is_custom_string_in">Is custom string in:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" id="is_custom_string_in_input" name="is_custom_string_in_input" class="form-control" placeholder="Please Type" onInput={this.pickValue}/>
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
                      <input id="is_date_weekend" name="is_date_weekend" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="is_date_weekend">Is Date Weekend or Not?</label>
                    </div>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="extract_time_feature" name="extract_time_feature" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="extract_time_feature">Extract Time Feature:</label>
                    </div>
                  </div>
                  <div class="col-md-4 col-sm-3">
                    <select class="form-control" name="extract_time_feature_select" onChange={this.pickValue}>
                      <option selected>Day of week</option>
                      <option>Month of Year</option>
                    </select>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="time_since" name="time_since" type="checkbox" class="needsclick" onChange={this.pickValue}/>
                      <label for="time_since">Time Since Some Event:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" name="time_since_input" class="form-control" placeholder="Please Type" onInput={this.pickValue}/>
                  </div>
                </div>
              </form>
            </div>
          );
        }
  }
}
