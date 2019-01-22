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
  saveBinLevelTransformationValuesAction,
} from "../../actions/featureEngineeringActions";

import { getDataSetPreview } from "../../actions/dataActions";

import { Bins } from "./Bins";
import { Levels } from "./Levels";

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

  this.buttons = {};
  this.state = {};
  this.pickValue = this.pickValue.bind(this);

}



  componentWillMount() {
    if (this.props.dataPreview == null || isEmpty(this.props.dataPreview) || this.props.dataPreview.status == 'FAILED') {
      this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
    }
console.log("FeatureEngineering componentWillMount method is called...");
    this.buttons['proceed'] = {
      url: "/data_cleansing/" + this.props.match.params.slug,
      text: "Proceed"
    };
  }
    pickValuesAndStoreLocally(slug, inputId, event){

  }
  pickValue(actionType, event){
    if(this.state[this.props.selectedItem.slug] == undefined){
      this.state[this.props.selectedItem.slug] = {}
    }
    if(this.state[this.props.selectedItem.slug][actionType] == undefined){
      this.state[this.props.selectedItem.slug][actionType] = {}
    }

    this.state[this.props.selectedItem.slug][actionType][event.target.name] = event.target.value;
  }

  handleCreateClicked(actionType, event){
    this.props.dispatch(saveBinLevelTransformationValuesAction(this.props.selectedItem.slug, actionType, this.state[this.props.selectedItem.slug][actionType]));
    this.closeBinsOrLevelsModal();
  }




  render() {
    console.log("FeatureEngineering render method is called...");
    // debugger;
    var feHtml = "";
    var binsOrLevelsPopup = "";
    var transformColumnPopup = "";
    let typeofBinningSelectBox = null;
    var binOrLevels = "";


    if (this.props.dataPreview != null) {
            feHtml = this.props.dataPreview.meta_data.scriptMetaData.columnData.map((item,key )=> {
       return (
               <tr key={key}>
                  <td> {item.name}</td>
                  <td> {item.columnType}</td>
                  <td> <Button onClick={this.openBinsOrLevelsModal.bind(this, item)} bsStyle="primary">Create { (item.columnType == "measure")? "Bins" : "Levels" }</Button></td>
                  <td> <Button onClick={this.openTransformColumnModal.bind(this,item)} bsStyle="primary">Transform</Button></td>
                </tr>  );
              })
            }

            if(this.props.selectedItem.columnType == "measure"){
              binOrLevels= <Bins parentPickValue={this.pickValue}/>
            }
            else if(this.props.selectedItem.columnType == "dimension")
            {
              binOrLevels= <Levels/>
            }
            else
            {
              binOrLevels=""
            }





    binsOrLevelsPopup =

      (

        <div class="col-md-3 xs-mb-15 list-boxes" >
            <div id="binsOrLevels" role="dialog" className="modal fade modal-colored-header">
              <Modal show={this.props.binsOrLevelsShowModal} onHide={this.closeBinsOrLevelsModal.bind(this)} dialogClassName="modal-colored-header">
                <Modal.Header closeButton>
                  <h3 className="modal-title">Create { (this.props.selectedItem.columnType == "measure")? "Bins" : "Levels" }</h3>
                </Modal.Header>
                <Modal.Body>
                  <div>
                      <h4>What you want to do?</h4>
                      {/* { (this.props.selectedItem.columnType == "measure")? <Bins /> : <Levels /> } */}
                    {binOrLevels}
                </div>
                <div id="errorMsgs" className="text-danger"></div>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.closeBinsOrLevelsModal.bind(this)}>Cancel</Button>
                <Button bsStyle="primary" onClick={this.handleCreateClicked.bind(this, "binData")}>Create</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )
    transformColumnPopup = (
      <div class="col-md-3 xs-mb-15 list-boxes" >
        <div id="transformColumnPopup" role="dialog" className="modal fade modal-colored-header">
          <Modal show={this.props.transferColumnShowModal} onHide={this.closeTransformColumnModal.bind(this)} dialogClassName="modal-colored-header">
            <Modal.Header closeButton>
              <h3 className="modal-title">Transform column</h3>
            </Modal.Header>
            <Modal.Body>
              {/* <div class="form-group">
              </div>
              <div id="errorMsgs" className="text-danger"></div> */}

              <h4>What would you like to do with  ""column?</h4>
              <p>Please select any of the options provided below that will help in transforming the chosen column into multiple new features.
                Each option will create an additional feature derived out of the original column.</p>
              <hr />



              <form class="form_withrowlabels">
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk1" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk1">Replace values where Quantity is:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <input type="text" id="txt_qnt1" class="form-control" placeholder="Value" />
                  </div>
                  <label for="txt_qValue1" class="col-md-1 col-sm-1 control-label xs-p-0 xs-mt-5 text-right">With</label>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="txt_qValue1" >
                      <option>Mean</option>
                      <option>Median</option>
                      <option>Mode</option>
                    </select>
                  </div>
                </div>


                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk6" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk6">Perform standardization:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="drp_qnt6">
                      <option selected>Min-Max Scaling</option>
                      <option>Log Transformation</option>
                    </select>
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-5 col-sm-5">
                    <div class="ma-checkbox inline">
                      <input id="qnty_chk7" type="checkbox" class="needsclick"/>
                      <label for="qnty_chk7">Transform variable using:</label>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-3">
                    <select class="form-control" id="drp_qnt7">
                      <option>Min-Max Scaling</option>
                      <option selected>Log Transformation</option>
                    </select>
                  </div>
                </div>
              </form>














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
        <div class="page-head">
          <h3 class="xs-mt-0 xs-mb-0 text-capitalize">Feature Engineering</h3>
        </div>
        {/*<!-- Page Content Area -->*/}
        {/*<!-- /.Page Title and Breadcrumbs -->*/}
        {binsOrLevelsPopup}
        {transformColumnPopup}
         <div className="main-content">
          <div class="row">
            <div class="col-md-12">





              <div class="panel box-shadow xs-m-0">
                <div class="panel-body no-border xs-p-20">
                  <h4> The dataset contains 14 columns or features (7 measures and 7 dimensions).  If you would like to transform the existing features or
                    create new features from the existing data, you can use the options provided below. </h4>
            <p class="inline-block">
            Do you want to convert all measures into dimension using binning? &nbsp;&nbsp;&nbsp;
            </p>
             <div class="ma-checkbox inline">
                    <input type="radio" id="mTod-binning1" name="mTod-binning"/>
                    <label for="mTod-binning1">Yes</label>
                  </div>
                  <div class="ma-checkbox inline">
                    <input type="radio" id="mTod-binning2" name="mTod-binning" checked="checked"/>
                    <label for="mTod-binning2">No </label>
                  </div>
            <div id="box-binning" class="xs-ml-20 block-inline"   >
              <span class="inline-block"> Number of bins : <input type="text" oninput="numberOnly(this.id);" class="test_css" maxlength="2" id="flight_number" name="number"/></span>
            </div>

                </div>
              </div>





              <div className="panel box-shadow ">
              <div class="panel-body no-border xs-p-20">
               <div className="table-responsive ">
                  <table className="table table-striped table-bordered break-if-longText">
                    <thead>
                      <tr key="trKey">
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
                                          <Button onClick={this.proceedFeatureEngineering.bind(this)} bsStyle="primary">{this.buttons.proceed.text} <i class="fa fa-angle-double-right"></i></Button>
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
    this.props.dispatch(openTransformColumnModalAction());
  }
  closeTransformColumnModal() {
    this.props.dispatch(closeTransformColumnModalAction());
  }
  handleSelect(selectedKey) {
    console.log(`selected ${selectedKey}`);
    this.props.dispatch(selectedBinsOrLevelsTabAction(selectedKey));
  }
  // createBins(slug,actionType,userData) {
  // this.props.dispatch(saveBinLevelTransformationValuesAction(slug, actionType, userData);
  // }

    createLevels(slug) {
      this.props.dispatch();
    }

  createTransferColumn() {  }
  proceedFeatureEngineering() {  }
}
