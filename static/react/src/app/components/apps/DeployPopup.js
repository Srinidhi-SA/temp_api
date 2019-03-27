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
      var deployData = {};
        return deployData;
      }

    getDeployDataValue(name){
      var deployData = this.getDeployData();
      var value = deployData[name];
      return value;
    }

  pickValue(event){
    this.props.parentPickValue("deployData", event);

  }

  onchangeInput(event){
    //disable CREATEMODEL
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
    var deployData = this.getDeployData();
          return (
          <div class="modal-body">
          {/* <!-- content goes here --> */}
          <form>
            <div class="xs-m-20"></div>
            <div class="row form-group">
              <label for="txt_dname" class="col-sm-4 control-label">Deployment name</label>
              <div class="col-sm-8">
                <input type="text" id="txt_dname" class="form-control" placeholder="Name of the deployment" />
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dsrclocation" class="col-sm-4 control-label">Input data source location</label>
              <div class="col-sm-8">
                <input type="text" id="txt_dsrclocation" class="form-control" placeholder="Input location URL" />
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dfname" class="col-sm-4 control-label">Input data sources folder name</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" id="txt_dfname" placeholder="Input folder name" />
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_dscoring" class="col-sm-4 control-label">Frequency of scoring</label>
              <div class="col-sm-8">
                <select class="form-control" id="txt_dscoring">
                <option>Weekly</option>
                <option>Monthly</option>
                </select>
              </div>
            </div>
            {/* <div class="row form-group">
              <label for="txt_dolurl" class="col-sm-4 control-label">Scored output location</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" id="txt_dolurl" placeholder="Output location URL" />
              </div>
            </div>
            <div class="row form-group">
              <label for="txt_ofname" class="col-sm-4 control-label">Scored output folder name</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" id="txt_ofname" placeholder="Output folder name" />
              </div>
            </div> */}
          </form>
        </div>
          );
        }
  }