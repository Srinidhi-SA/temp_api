import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col, Tabs } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/featureEngineeringActions";

import { getDataSetPreview } from "../../actions/dataActions";

import { Bins } from "./Bins";
import { Levels } from "./Levels";
import { Transform } from "./Transform";

@connect((store) => {
return {
  login_response: store.login.login_response,
  dataPreview: store.datasets.dataPreview,
  dataSets: store.datasets.allDataSets,
  binsOrLevelsShowModal: store.datasets.binsOrLevelsShowModal,
  transferColumnShowModal: store.datasets.transferColumnShowModal,
  selectedBinsOrLevelsTab: store.datasets.selectedBinsOrLevelsTab,
  selectedItem: store.datasets.selectedItem,
  };
})

export class FeatureEngineering extends React.Component {
  constructor(props) {
  super(props);
  console.log("FeatureEngineering constructor method is called...");
  console.log(props);
  // this.buttons = {};
}

componentWillMount() {
    if (this.props.dataPreview == null || isEmpty(this.props.dataPreview) || this.props.dataPreview.status == 'FAILED') {
      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
    }
    // console.log("FeatureEngineering componentWillMount method is called...");
    // this.buttons['proceed'] = {
    //   url: "/data_cleansing/" + this.props.match.params.slug,
    //   text: "Proceed"
    // };
  }

render() {
  console.log("FeatureEngineering render method is called...");
  // debugger;
  var feHtml = "";
  var binsOrLevelsPopup = "";
  var transformColumnPopup = "";
  let typeofBinningSelectBox = null;
  var values = "";
  if (this.props.dataPreview != null){
    feHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map(item => {
     return (
       <tr>
         <td> {item.name}</td>
         <td> {item.columnType}</td>
         <td> <Button onClick={this.openBinsOrLevelsModal.bind(this, item)} bsStyle="primary">Create {(item.columnType == "measure")? "Bins" : "Levels"} </Button></td>
         <td> <Button onClick={this.openTransformColumnModal.bind(this,item)} bsStyle="primary">Transform</Button></td>
       </tr>);
    })
  }

  if(this.props.selectedItem.columnType == "measure"){
    values = <Bins/>
  }
  else if(this.props.selectedItem.columnType == "dimension"){
    values = <Levels/>
  }
  else{
    values = <Levels/>
  }

  binsOrLevelsPopup = (
    <div class="col-md-3 xs-mb-15 list-boxes" >
      <div id="binsOrLevels" role="dialog" className="modal fade modal-colored-header">
        <Modal show={this.props.binsOrLevelsShowModal} onHide={this.closeBinsOrLevelsModal.bind(this)} dialogClassName="modal-colored-header">
          <Modal.Header closeButton>
            <h3 className="modal-title">Create { (this.props.selectedItem.columnType == "measure")? "Bins" : "Levels" }</h3>
          </Modal.Header>
          <Modal.Body>
            <div><h4>What you want to do?</h4>{values}</div>
            <div id="errorMsgs" className="text-danger"></div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeBinsOrLevelsModal.bind(this)}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.createBinsorLevels.bind(this)}>Create</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )

  transformColumnPopup = (
    <div class="col-4 xs-mb-20 list-boxes" >
      <div id="transformColumnPopup" role="dialog" className="modal fade modal-colored-header">
        <Modal show={this.props.transferColumnShowModal} onHide={this.closeTransformColumnModal.bind(this)} dialogClassName="modal-colored-header">
          <Modal.Header closeButton>
            <h3 className="modal-title">Transform column</h3>
          </Modal.Header>
          <Modal.Body>
            <div class="form-group"><Transform/></div>
            <div id="errorMsgs" className="text-danger"></div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeTransformColumnModal.bind(this)}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.createTransferColumn.bind(this)}>Create</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )

  return (
   // <!-- Main Content starts with side-body -->
   <div className="side-body">
     {/* <!-- Page Title and Breadcrumbs --> */}
     <div class="page-head"><h3 class="xs-mt-0 xs-mb-0 text-capitalize">Feature Engineering</h3></div>
      {/* <!-- Page Content Area --> */}
      {/*<!-- /.Page Title and Breadcrumbs -->*/}
      {binsOrLevelsPopup}
      {transformColumnPopup}
       <div className="main-content">
        <div class="row">
          <div class="col-md-12">
            <div class="panel box-shadow xs-m-0">
              <div class="panel-body no-border xs-p-20">
                <h4> The dataset contains 14 columns or features (7 measures and 7 dimensions).  If you would like to transform the existing features or create new features from the existing data, you can use the options provided below. </h4>
                <p class="inline-block">Do you want to convert all measures into dimension using binning? &nbsp;&nbsp;&nbsp;</p>
                {/* <div class="ma-checkbox inline">
                  <input type="radio" id="mTod-binning1" name="mTod-binning"/>
                  <label for="mTod-binning1">Yes</label>
                </div>
                <div class="ma-checkbox inline">
                  <input type="radio" id="mTod-binning2" name="mTod-binning" checked="checked"/>
                  <label for="mTod-binning2">No </label>
                </div>
                <div id="box-binning" class="xs-ml-20 block-inline">
                  <span class="inline-block"> Number of bins : <input type="text" oninput="numberOnly(this.id);" class="test_css" maxlength="2" id="flight_number" name="number"/></span>
                </div> */}

              <label class="col1">ICU:</label>
              <span class="col4b"><input type="radio" name="icu" id="icu" checked="checked" title="Select your medical council" value="Y" onchange="disabStatecouncil(this.value,regiFrm);" /> Medical Council of India
                <input type="radio" name="icu" id="icu" disabled="disabled"  title="Select your medical council" value="N" onchange="disabStatecouncil(this.value,regiFrm);" /> Medical Council of India
                <label class="col1">[If yes] No. of ICU Beds:</label><? }?>
                <span class="col2"><input type="text" name="no_of_bed_icu" id="no_of_bed_icu" title="Enter your medical council" value="no_of_bed_icu" size="25" class="textbox"  />
                <input type="text" name="no_of_bed_icu" id="no_of_bed_icu" disabled="disabled" title="Enter your medical council" value="no_of_bed_icu" size="25" onfocus="this.value='';" class="textbox"  />
                </span>





              </div>
            </div>
            <div className="panel box-shadow ">
              <div class="panel-body no-border xs-p-20">
                <div className="table-responsive ">
                  <table className="table table-striped table-bordered break-if-longText">
                    <thead>
                      <tr>
                        <th>Variable name</th>
                        <th>Data type</th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="no-border-x">{feHtml}</tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="row buttonRow" id="dataPreviewButton">
              <div className="col-md-12">
                <div className="panel xs-mb-0">
                  <div className="panel-body box-shadow">
                    <div className="navbar">
                      <ul className="nav navbar-nav navbar-right">
                        <li className="text-right">
                          <Button onClick={this.proceedFeatureEngineering.bind(this)} bsStyle="primary">Proceed{/* {this.buttons.proceed.text}  */}</Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/* <!--End of Page Content Area --> */}
        </div>
      </div>
    {/* <!-- Main Content ends with side-body --> */}
    </div>
    );
  }
  openBinsOrLevelsModal(item) {
    this.props.dispatch(openBinsOrLevelsModalAction(item));
  }
  closeBinsOrLevelsModal() {
    this.props.dispatch(closeBinsOrLevelsModalAction());
  }
  openTransformColumnModal(item) {
    this.props.dispatch(openTransformColumnModalAction(item));
  }
  closeTransformColumnModal() {
    this.props.dispatch(closeTransformColumnModalAction());
  }
  handleSelect(selectedKey) {
    console.log(`selected ${selectedKey}`);
    this.props.dispatch(selectedBinsOrLevelsTabAction(selectedKey));
  }
  createBinsorLevels() {  }

  createTransferColumn() {  }
  proceedFeatureEngineering() {  }
}
