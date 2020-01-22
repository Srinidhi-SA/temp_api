import React from "react";
import {connect} from "react-redux";
import {Modal,Button,} from "react-bootstrap";
import store from "../../store";
import $ from "jquery";
import {open, close, fileUpload, dataUpload} from "../../actions/dataUploadActions";
import {updateSelectedDataSrc} from "../../actions/dataSourceListActions";
import {OcrUpload} from "../apps/OcrUpload";

@connect((store) => {
  return {login_response: store.login.login_response, showModal: store.dataUpload.dataUploadShowModal, fileDataUpload: store.dataUpload.fileUpload};
})

export class Ocr extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(close());
    this.onDrop = this.onDrop.bind(this);
  }
  openPopup() {
    this.props.dispatch(open());
  }
  closePopup() {
    this.props.dispatch(close())
    this.props.dispatch(updateSelectedDataSrc("fileUpload"))
  }
  onDrop(files) {
    this.props.dispatch(fileUpload(files[0]))
  }
  uploadData() {
    this.props.dispatch(dataUpload());
  }
  render() {
return(
      <div className="side-body">
        <div className="main-content">
          <div class="row">
              <Button style={{marginLeft:"35px"}} bsStyle="primary" onClick={this.openPopup.bind(this)}>Upload</Button>  
              <div id="uploadData" role="dialog" className="modal fade modal-colored-header">
                <Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header uploadData">
                <Modal.Header closeButton>
                  <h3 className="modal-title">Upload Data</h3>
                </Modal.Header>
                <Modal.Body>
                  <OcrUpload/>
                </Modal.Body>
                <Modal.Footer>
                  <Button id="dataCloseBtn" onClick={this.closePopup.bind(this)}>Close</Button>
                  <Button id="loadDataBtn" bsStyle="primary" onClick={this.uploadData.bind(this)}>Load Data</Button>
                </Modal.Footer>
                </Modal>
              </div>                   
          </div>
        </div>
      </div>
);
  }

}
