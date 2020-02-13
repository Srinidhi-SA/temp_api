import React from "react";
import { connect } from "react-redux";
import { Modal, Button, } from "react-bootstrap";
import { getUserDetailsOrRestart } from "../../helpers/helper"
import { STATIC_URL } from "../../helpers/env.js";
import { Scrollbars } from 'react-custom-scrollbars';
import store from "../../store";
import { open, close } from "../../actions/dataUploadActions";
import {getOcrUploadedFiles, saveS3BucketDetails, getS3BucketFileList, setS3Uploaded, setS3Loader, fetchs3DetailsSuccess, saveS3SelFiles, uploadS3Files} from '../../actions/ocrActions'
import {MultiSelect} from "primereact/multiselect";

@connect((store) => {
  return {
    OcrfileUpload: store.ocr.OcrfileUpload,
    login_response: store.login.login_response,
    showModal: store.dataUpload.dataUploadShowModal,
    ocrS3BucketDetails: store.ocr.ocrS3BucketDetails,
    s3Uploaded: store.ocr.s3Uploaded,
    s3Loader: store.ocr.s3Loader,
    s3FileList: store.ocr.s3FileList,
    s3FileFetchErrorFlag: store.ocr.s3FileFetchErrorFlag,
    s3FileFetchSuccessFlag : store.ocr.s3FileFetchSuccessFlag,
    s3SelFileList : store.ocr.s3SelFileList
  };
})

export class OcrUpload extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(close());
    this.state = {
      selectedFiles: "",
      uploaded: false,
      loader: false,
      s3FileList1:[],
    }
  }

  componentDidUpdate(){
    if(this.props.s3FileFetchErrorFlag){
      $("#fetchS3FileBtn").show();
      document.getElementById("resetMsg").innerText = "Failed to fetch files, Please try again";
    }
  }
  openPopup() {
    this.setState({
      selectedFiles: "",
      loader: false,
      uploaded: false,
    })
    this.props.dispatch(open());
  }


  closePopup() {
    this.props.dispatch(close())
    this.props.dispatch(getOcrUploadedFiles())
    this.props.dispatch(setS3Uploaded(false));
    this.props.dispatch(setS3Loader(false));
  }

  onDrop = event => {
    document.getElementById("resetMsg").innerText = "";
    var allowType = ['image/png', 'image/jpeg', 'image/jpg', 'image/tif']
    var formatErr = Object.values(event.target.files).map(i => i.type).map((i, ind) => {
      return allowType.includes(i)
    })


    if (formatErr.includes(false)) {
      document.getElementById("resetMsg").innerText = "Only image files are accepted. Please try again.";
      return false
    }
    this.setState({ selectedFiles: Object.values(event.target.files), })
  }

  removeFile(item) {
    this.setState({
      selectedFiles: Object.values(this.state.selectedFiles).filter(i => i.name != item),
    })
  }

  getHeader = token => {
    return {
      Authorization: token
    };
  };

  saveFileForUpload(e){
    let fileName = e.target.value;
    this.setState({s3FileList1: fileName})
    this.props.dispatch(saveS3SelFiles(fileName));
    document.getElementById("resetMsg").innerText = "";
  }

  validateAndFetchS3Files(){
    if($(".bucket_name")[0].value === "" || $(".bucket_name")[0].value === undefined){
      document.getElementById("resetMsg").innerText = "Please Enter Bucket Name";
      return false;
    }else if($(".access_key_id")[0].value === "" || $(".access_key_id")[0].value === undefined){
      document.getElementById("resetMsg").innerText = "Please Enter Access Key";
      return false;
    }else if($(".secret_key")[0].value === "" || $(".secret_key")[0].value === undefined){
      document.getElementById("resetMsg").innerText = "Please Enter Secret Key";
      return false;
    }else{
      $("#fetchS3FileBtn").hide();
      document.getElementById("resetMsg").innerText = "";
      this.props.dispatch(setS3Loader(true));
      this.props.dispatch(getS3BucketFileList(this.props.ocrS3BucketDetails));
    }
  }

  handleSubmit(acceptedFiles) {
    let activeTab = $(".tab-content").find(".active");
    let activeId = activeTab.attr('id');

    if(activeId === "ocrImage"){
      if (acceptedFiles.length == 0) {
        document.getElementById("resetMsg").innerText = "Please select files to upload.";
        return false
      }
      $("#dataCloseBtn").hide()
      this.setState({ loader: true })
      var data = new FormData();
    for (var x = 0; x < acceptedFiles.length; x++) {
      data.append("imagefile", acceptedFiles[x]);
      data.append("dataSourceType", "fileUpload");
    }

    return fetch("https://madvisor-dev.marlabsai.com/ocr/ocrimage/", {
      method: "POST",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: data
    }).then(response => response.json()).then(json => {
      if (json.message === "SUCCESS")
        this.setState({ uploaded: true })
    })
    }
    else if(activeId === "ocrS3"){
      if($(".p-multiselect-label")[0].innerHTML === "Choose"){
        document.getElementById("resetMsg").innerText = "Please select files to upload.";
        return false
      }
      document.getElementById("resetMsg").innerText = "";
      $("#dataCloseBtn").hide()
      this.props.dispatch(setS3Loader(true));
      this.props.dispatch(uploadS3Files(this.props.s3SelFileList));
    }
  }

  proceedClick() {
    this.closePopup()
    this.props.dispatch(getOcrUploadedFiles())
  }

  getS3Details(e){
    document.getElementById("resetMsg").innerText = "";
    let name = e.target.name;
    let value = e.target.value;
    this.props.dispatch(saveS3BucketDetails(name,value));
  }

  render() {
    var fileNames = this.state.selectedFiles != "" ? Object.values(this.state.selectedFiles).map(i => i.name).map((item, index) => (
      <li>{item}
        <span style={{ marginLeft: "15px" }} onClick={this.removeFile.bind(this, item)}>
          <i class="fa fa-times" aria-hidden="true" style={{ color: '#555', cursor: 'pointer' }}></i>
        </span>
      </li>
    ))
      : <div /*style={{textAlign:"center",paddingLeft:"20px"}}*/>No files chosen.<br/>Please select file to proceed.</div>
    let optionsTemp = [];
    for(var i=0; i<this.props.s3FileList.length; i++){
      optionsTemp.push({"value":this.props.s3FileList[i],"label":this.props.s3FileList[i]});
    }
    return (
      <div>
        <Button bsStyle="primary" onClick={this.openPopup.bind(this)} style={{ marginBottom: 20 }}><i class="fa fa-upload"></i> Upload</Button>
        <div id="uploadData" role="dialog" className="modal fade modal-colored-header">
          <Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
            <Modal.Header closeButton>
              <h3 className="modal-title">Upload Data</h3>
            </Modal.Header>
            <Modal.Body style={{ padding: 0, height:"300px"}} >
            <div className="tab-container">
                <ul className="ocrUploadTabs nav-tab">
                  <li className="active"><a className="nav-link" data-toggle="tab" href="#ocrImage">Image Files</a></li>
                  <li><a className="nav-link" data-toggle="tab" href="#ocrS3">s3 Files</a></li>
                </ul>
            </div>
            <div className="tab-content" style={{padding:"0px"}}>
              <div id="ocrImage" className="tab-pane active row">
                {!this.state.uploaded &&
                  <div>
                    <div className="col-md-5 ocrUploadHeight">
                      <div className="dropzoneOcr">
                        <input className="ocrUpload" type="file" multiple onChange={this.onDrop} title=" " />
                        <img style={{ height: 64, width: 64, opacity: 0.4, zIndex: 0, cursor: 'pointer' }} src={STATIC_URL + "assets/images/ocrUpload.svg"} />
                        <span>Upload files</span>
                      </div>
                    </div>
                    <div className="col-md-7">
                      <Scrollbars className="ocrUploadHeight">
                        <ul className="list-unstyled bullets_primary" style={{ display: 'table-cell', margin: 'auto', height: 250, verticalAlign: 'middle' }}>
                          {fileNames}
                        </ul>
                      </Scrollbars>
                    </div>
                  </div>
                }

                {(this.state.loader && !this.state.uploaded) &&
                  <div style={{ height: 300, background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
                    <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                  </div>
                }

                {this.state.uploaded &&
                  <div className="col-md-12 ocrSuccess">
                    <img className="wow bounceIn" data-wow-delay=".75s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10" src={STATIC_URL + "assets/images/success_outline.png"} style={{ height: 105, width: 105 }} />

                    <div className="wow bounceIn" data-wow-delay=".25s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10">
                      <span style={{ paddingTop: 10, color: 'rgb(50, 132, 121)', display: 'block' }}>Uploaded Successfully</span></div>
                  </div>
                }
              </div>

              <div id="ocrS3" className="tab-pane row">
              {!this.props.s3Uploaded &&
                <div style={{paddingLeft:"60px",paddingTop:"10px"}}>
                  <div className="form-group row">
                    <label className="col-sm-3 control-label mandate">Bucket Name</label>
                    <div className="col-sm-6">
                      <input type="text" name="bucket_name" onInput={this.getS3Details.bind(this)} className="form-control bucket_name"/>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-sm-3 control-label mandate">Access key</label>
                    <div className="col-sm-6">
                      <input type="text" name="access_key_id" onInput={this.getS3Details.bind(this)} className="form-control access_key_id"/>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-sm-3 control-label mandate">Secret key</label>
                    <div className="col-sm-6">
                      <input type="text" name="secret_key" onInput={this.getS3Details.bind(this)} className="form-control secret_key"/>
                    </div>
                  </div>
                  <Button id="fetchS3FileBtn" bsStyle="primary" onClick={this.validateAndFetchS3Files.bind(this)} style={{marginBottom: "25px", marginTop: "10px"}}>Fetch Files</Button>
                </div>
              }
              {this.props.s3Loader && !this.props.s3Uploaded &&
                  <div /*style={{ height: 300, background: 'rgba(0,0,0,0.1)', position: 'relative' }}*/>
                    <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                  </div>
              }
              {!this.props.s3Uploaded && this.props.s3FileFetchSuccessFlag && (this.props.s3FileList != "") &&
                    <div className="form-group row" style={{paddingLeft:"60px"}}>
                      <label className="col-sm-3 control-label mandate">Select Files</label>
                      <div className="col-sm-6 for_multiselect">
                        <MultiSelect value={this.state.s3FileList1} options={optionsTemp} style={{minWidth:'12em'}} onChange={this.saveFileForUpload.bind(this)} placeholder="Choose" className="form-control single"/>
                      </div>
                    </div>
              }
              {this.props.s3Uploaded &&
                <div className="ocrSuccess">
                <img className="wow bounceIn" data-wow-delay=".75s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10" src={STATIC_URL + "assets/images/success_outline.png"} style={{ height: 105, width: 105 }} />

                <div className="wow bounceIn" data-wow-delay=".25s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10">
                  <span style={{ paddingTop: 10, color: 'rgb(50, 132, 121)', display: 'block' }}>Uploaded Successfully</span></div>
              </div>
              }
              </div>
            </div>
            </Modal.Body>
            <Modal.Footer>
              <div id="resetMsg"></div>
              <Button id="dataCloseBtn" bsStyle="primary" onClick={this.handleSubmit.bind(this, this.state.selectedFiles)}>Upload Data</Button>
              <Button id="loadDataBtn" bsStyle="primary" onClick={this.proceedClick.bind(this)} disabled={!this.state.uploaded || !this.props.s3Uploaded}>Proceed</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    )
  }

}
