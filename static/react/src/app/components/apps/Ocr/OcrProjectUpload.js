import React from "react";
import { connect } from "react-redux";
import { Modal, Button, } from "react-bootstrap";
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import store from "../../../store";
import { open, close } from "../../../actions/dataUploadActions";
import { getOcrUploadedFiles,getOcrProjectsList} from '../../../actions/ocrActions';
@connect((store) => {
  return {
    login_response: store.login.login_response,
    showModal: store.dataUpload.dataUploadShowModal,
  };
})

export class OcrProjectUpload extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(close());
    this.state = {
    }
  }

  openPopup() {
    this.props.dispatch(open());
  }

  closePopup() {
    this.props.dispatch(close())
  }

  getHeader = token => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  };

  handleSubmit() {
    var projectName=document.getElementById('projectName').value
    if(projectName.trim() == ""){
      document.getElementById("resetMsg").innerText = "Please enter project name.";
    }
    var projectLead=document.getElementById('projectLead').value
    var projectType=document.getElementById('projectType').value

    console.log(projectName,projectLead);
    var projectDetails={
      "name":projectName
    }

    return fetch("https://madvisor-dev.marlabsai.com/ocr/project/", {
      method: "POST",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(projectDetails)
    }).then(response => response.json()).then(json => {
      if (json.project_serializer_message === "SUCCESS"){
        this.closePopup()
        this.props.dispatch(getOcrProjectsList()) 
      }
      else
        document.getElementById("resetMsg").innerText = "Project creation failed, Please try again.";
    })
  }


  proceedClick() {
    this.closePopup()
  }

  render() {
    return (
     <div>
      <div class="xs-mt-30"></div>
        <div class="row">
          <div class="col-sm-6">
              <h4 class="xs-mt-0 inline-block xs-mr-10 box-shadow">10 <br></br><small class="text-primary">PROJECTS</small></h4>
              <h4 class="xs-mt-0 inline-block xs-mr-10 box-shadow">30 <br></br><small class="text-primary">DOCUMENETS</small></h4>
              <h4 class="xs-mt-0 inline-block box-shadow">15 <br></br><small class="text-primary">REVIEWERS</small></h4>
          </div>
          <div class="col-sm-6 text-right">
            <div class="form-inline">
              <Button  id="btn_ceate_project" className='btn btn-info btn-rounded xs-mr-5' onClick={this.openPopup.bind(this)}><i class="fa fa-plus"></i></Button>
              <div class="form-group xs-mr-5">
                <input type="text" id="search" class="form-control btn-rounded" placeholder="Search project..."></input>
              </div>
            </div>
          </div>
          <div id="uploadData" role="dialog" className="modal fade modal-colored-header">
            <Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
            <Modal.Header closeButton>
              <h3 className="modal-title">Create Project</h3>
            </Modal.Header>
            <Modal.Body>
              <div className="row" style={{ margin: 0 }}>
                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="pName" class="form-label">Project Name <span class="text-danger">*</span></label>						 
                        <input className="form-control" id="projectName" type="text" defaultValue={name} />
                    </div>
                  </div> 
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                    <div class="form-group">
                      <label for="uEmail" class="form-label">Project Type </label>						 
                    <select id="projectType" class="form-control">
                      <option>Select</option>
                      <option>Financial Services</option>
                      <option>Medical, Health</option>
                      <option>Web Tech</option>
                      <option>Marketing and Customer Experience</option>
                    </select>				 
                    </div>
                  </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                          <label for="pLead" class="form-label">Project Lead</label>						 
                            <input className="form-control" id="projectLead" type="text" placeHolder="Lead Name" />
                        </div>
                    </div> 
                  </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div id="resetMsg"></div>
              <Button id="dataCloseBtn"  onClick={this.closePopup.bind(this)}> Close</Button>
              <Button id="loadDataBtn" onClick={this.handleSubmit.bind(this)} bsStyle="primary">Submit</Button>
            </Modal.Footer>
            </Modal>
          </div>
        </div>
     </div>
    )
  }
}
