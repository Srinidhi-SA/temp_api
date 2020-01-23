import React from "react";
import {connect} from "react-redux";
import { Modal, Button, } from "react-bootstrap";
import {getUserDetailsOrRestart} from "../../helpers/helper"
import { STATIC_URL } from "../../helpers/env.js";
import { Scrollbars } from 'react-custom-scrollbars';
import store from "../../store";
import { open, close, fileUpload, dataUpload } from "../../actions/dataUploadActions";
import { updateSelectedDataSrc } from "../../actions/dataSourceListActions";
@connect((store) => {
  return {
    OcrfileUpload: store.ocr.OcrfileUpload,
    login_response: store.login.login_response,
    showModal: store.dataUpload.dataUploadShowModal,
    // fileDataUpload: store.dataUpload.fileUpload
  };
})

export class OcrUpload extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(close());
    this.state = {
      selectedFiles:""
    }
  }

  openPopup() {
    this.props.dispatch(open());
  }
  closePopup() {
    this.props.dispatch(close())
    this.props.dispatch(updateSelectedDataSrc("fileUpload"))
  }

  onDrop=event=>{
    // console.log()
    document.getElementById("resetMsg").innerText= "";

    if(Object.values(event.target.files).map(i=>i.type).filter(j=>j!="image/png").length!=0){
      document.getElementById("resetMsg").innerText= "Only image files are accepted. Please try again.";
      return false
    }
    console.log(event.target.files);
    this.setState({
      selectedFiles: Object.values(event.target.files),
     })
  }

  removeFile(item){
    this.setState({
      selectedFiles: Object.values(this.state.selectedFiles).filter(i=>i.name!=item),
    })
  }

  getHeader = token => {
    return {
      Authorization: token
    };
  };

  handleSubmit(acceptedFiles ){
    if(acceptedFiles.length==0){
      document.getElementById("resetMsg").innerText= "Please select files to upload.";
      return false
    }
    

    var data = new FormData();
    console.log(this.state.selectedFiles);
    for (var x = 0; x < acceptedFiles.length; x++) {
      data.append("imagefile", acceptedFiles[x]);
    }
    return fetch("https://madvisor-dev.marlabsai.com/ocr/ocrimage/", {
      method: "POST",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: data
    });
  };

  render() {
    var fileNames = this.state.selectedFiles != "" ? Object.values(this.state.selectedFiles).map(i => i.name).map((item, index) => (
      <li>{item}
        <span style={{ marginLeft: "10px" }} onClick={this.removeFile.bind(this, item)}>
          <i class="fa fa-times" aria-hidden="true" style={{ color: '#555' }}></i>
        </span>
      </li>
    ))
      : ""

  return (
    <div>
     <Button bsStyle="primary" onClick={this.openPopup.bind(this)}><i class="fa fa-upload"></i> Upload</Button>
      <div id="uploadData" role="dialog" className="modal fade modal-colored-header">
        <Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
          <Modal.Header closeButton>
            <h3 className="modal-title">Upload Data</h3>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-5 ocrUploadHeight">
                <div className="dropzoneOcr">
                  <input className="ocrUpload" type="file" accept="image/*" multiple onChange={this.onDrop} />
                  <img style={{ height: 64, width: 64, opacity: 0.4, zIndex: 0, cursor: 'pointer' }} src={STATIC_URL + "assets/images/ocrUpload.svg"} />
                  <span>Upload files</span>
                </div>
              </div>
              <div className="col-md-7 ocrUploadHeight">
                <Scrollbars>
                <ul className="list-unstyled bullets_primary ocrUploadHeight">
                  {fileNames}
                </ul>
                </Scrollbars>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div id="resetMsg"></div>
            <Button id="dataCloseBtn" bsStyle="primary" onClick={this.handleSubmit.bind(this,this.state.selectedFiles)}>Upload Data</Button>
            <Button id="loadDataBtn" bsStyle="primary" disabled>Proceed</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
  }

}
