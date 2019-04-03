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
    deployData: store.apps.deployData,
    deployItem:store.apps.deployItem,

  };
})

export class DeployPopup extends React.Component {
  constructor(props) {
    super(props);
    console.log("DeployPopup constructor method is called...");
    this.pickValue = this.pickValue.bind(this);
    this.state = {};
    this.state.encodingRadioButton;

  }

  componentWillMount() {
    console.log("DeployPopup componentWillMount method is called...");
  }

    getDeployData(){
      if(this.props.deployData != undefined || this.props.deployData !=null){
        var slugData = this.props.deployData[this.props.deployItem];
        if(slugData != undefined && slugData.depData !=undefined){
          return JSON.parse(JSON.stringify(slugData.depData));
        }
      }
        return {};
      }
    // getDeployDataValue(name){
    //   var depData = this.getDeployData();
    //   var value = depData[name];
    //   return value;
    // }

  pickValue(event){
    this.props.parentPickValue("deployData",event);

  }

  onchangeInput(event){
    return event.target.value;
  }

  handleEncodingRadioButtonOnchange(event){
    this.state.encodingRadioButton = event.target.value;
    this.saveEncodingValues();
  }
  saveEncodingValues(){
    this.props.dispatch(saveEncodingValuesAction(this.state.encodingRadioButton));
    this.setState({ state: this.state });
  }

  render() {
    console.log("DeployPopup render method is called...");
    var depData = this.getDeployData();
    // if(){}
          return (
          <div class="modal-body">
          {/* <!-- content goes here --> */}
          <form>
            <div class="xs-m-20"></div>

            <div class="row form-group">
              <label for="dname" class="col-sm-4 control-label">Deployment name</label>
              <div class="col-sm-8">
                <input type="text" name="name" class="form-control" placeholder="Name of the deployment" defaultvalue={depData.deploytrainer} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)}/>
              </div>
            </div>
            <div class="row form-group">
              <label for="dname" class="col-sm-4 control-label">Dataset name</label>
              <div class="col-sm-8">
                <input type="text" name="datasetname" class="form-control" placeholder="Name of dataset" defaultvalue={depData.datasetname} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)}/>
              </div>
            </div>

            <div class="row form-group">
              <label for="txt_dname" class="col-sm-4 control-label">S3 bucket name</label>
              <div class="col-sm-8">
                <input type="text" name="s3Bucket" class="form-control" placeholder="s3" defaultValue={depData.s3Bucket} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)} disabled/>
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dname" class="col-sm-4 control-label">Source file name</label>
              <div class="col-sm-8">
                <input type="text" name="file_name" class="form-control" placeholder="Name of source file" defaultValue={depData.file_name} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)}/>
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dname" class="col-sm-4 control-label">Access Key</label>
              <div class="col-sm-8">
                <input type="text" name="access_key_id" class="form-control" placeholder="Enter Password" defaultValue={depData.access_key_id} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)}/>
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dname" class="col-sm-4 control-label">Secret Key</label>
              <div class="col-sm-8">
                <input type="text" name="secret_key" class="form-control" placeholder="Enter Password" defaultValue={depData.secret_key} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)}/>
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dscoring" class="col-sm-4 control-label">Frequency of scoring</label>
              <div class="col-sm-8">
                <select class="form-control" name="timing_details" defaultValue={depData.timing_details} onChange={this.pickValue}>
                <option value="hourly">Hourly</option>                  
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="none" selected>-Select-</option>
                </select>
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dsrclocation" class="col-sm-4 control-label">Target Bucket Name</label>
              <div class="col-sm-8">
                <input type="text" name="bucket" class="form-control" placeholder="Bucket name" defaultValue={depData.bucket} onInput={this.pickValue} onChange={this.onchangeInput.bind(this)} disabled/>
              </div>
            </div>
            <div className="row form-group">
            <div className="col-sm-12 text-center">
              <div className="text-danger visibilityHidden" id="fileErrorMsg"></div>
            </div>
          </div>
          </form>
        </div>
          );
        }
  }