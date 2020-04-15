import React from "react";
import { connect } from "react-redux";
import { Modal, Button, } from "react-bootstrap";
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import store from "../../../store";
import { open, close } from "../../../actions/dataUploadActions";
import { getOcrProjectsList,storeProjectSearchElem,saveDocumentPageFlag,selectedProjectDetails } from '../../../actions/ocrActions';
import { API } from "../../../helpers/env";
@connect((store) => {
  return {
    login_response: store.login.login_response,
    showModal: store.dataUpload.dataUploadShowModal,
    OcrProjectList: store.ocr.OcrProjectList,
  };
})

export class OcrCreateProject extends React.Component {
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
    var projectName = document.getElementById('projectName').value
    if (projectName.trim() == "") {
      document.getElementById("resetMsg").innerText = "Please enter project name.";
      return false;
    }
    var projectLead = document.getElementById('projectLead').value
    var projectType = document.getElementById('projectType').value

    var projectDetails = {
      "name": projectName
    }

    return fetch(API + '/ocr/project/', {
      method: "POST",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(projectDetails)
    }).then(response => response.json()).then(json => {
      if (json.project_serializer_message === "SUCCESS") {
        this.closePopup()
      // this.props.dispatch(getOcrProjectsList())
      this.props.dispatch(selectedProjectDetails(json.project_serializer_data.slug,json.project_serializer_data.name))
      this.props.dispatch(saveDocumentPageFlag(true));
      }
      else
        document.getElementById("resetMsg").innerText = "Project creation failed, Please try again.";
    })
  }


  proceedClick() {
    this.closePopup()
  }

  handleSearchBox(){
    var searchElememt=document.getElementById('search').value.trim()
    this.props.dispatch(storeProjectSearchElem(searchElememt))
    this.props.dispatch(getOcrProjectsList())
  }
  clearSearchElement(e){
    document.getElementById('search').value=""
    this.props.dispatch(storeProjectSearchElem(''));
    this.props.dispatch(getOcrProjectsList())
  }

  render() {
    return (
      <div>
        <div class="xs-mt-30"></div>
        <div class="row" style={{ display: 'flex', marginBottom: '1%', alignItems: 'center' }}>
          <div class="col-sm-6">
          {this.props.OcrProjectList != '' &&
          <div>
            <h4 class="xs-mt-0 inline-block xs-mr-10 box-shadow">{store.getState().ocr.OcrProjectList.overall_info.totalProjects} <br></br><small class="text-primary">PROJECTS</small></h4>
            <h4 class="xs-mt-0 inline-block xs-mr-10 box-shadow">{store.getState().ocr.OcrProjectList.overall_info.totalDocuments} <br></br><small class="text-primary">DOCUMENETS</small></h4>
            <h4 class="xs-mt-0 inline-block box-shadow">{store.getState().ocr.OcrProjectList.overall_info.totalReviewers} <br></br><small class="text-primary">REVIEWERS</small></h4>
          </div>
          }
          </div>
          <div class="col-sm-6 text-right">
            <div class="form-inline">
              <button id="btn_ceate_project" className="btn btn-info btn-rounded xs-mr-5" onClick={this.openPopup.bind(this)}><i class="fa fa-plus"></i></button>
              <span className="search-wrapper">
               <div class="form-group xs-mr-5">
                <input type="text" id="search" class="form-control btn-rounded "  onKeyUp={this.handleSearchBox.bind(this)} placeholder="Search project..."></input>
                        <button className="close-icon"  style={{position:"absolute",left:'173px',top:'7px'}}  onClick={this.clearSearchElement.bind(this)}type="reset"></button>
                        </div>
                </span>
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
                <Button id="dataCloseBtn" onClick={this.closePopup.bind(this)}> Close</Button>
                <Button id="loadDataBtn" onClick={this.handleSubmit.bind(this)} bsStyle="primary">Save</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}
