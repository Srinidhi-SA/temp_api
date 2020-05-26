import React from "react";
import { connect } from "react-redux";
import { Modal, Button, } from "react-bootstrap";
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import store from "../../../store";
import { open, close } from "../../../actions/dataUploadActions";
import { getOcrProjectsList,storeProjectSearchElem,saveDocumentPageFlag,selectedProjectDetails } from '../../../actions/ocrActions';
import { API } from "../../../helpers/env";
import ReactTooltip from 'react-tooltip';
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
        <div class="xs-mt-5"></div>
        <div class="row" style={{ display: 'flex', marginBottom: '1%', alignItems: 'center' }}>
          <div class="col-md-6">
          {this.props.OcrProjectList != '' &&
          <div>
			<div className="col-md-4">
				 
				<h4 class="xs-mt-0 xs-p-5 text-center bg-white box-shadow">{store.getState().ocr.OcrProjectList.overall_info.totalProjects} <i class="fa fa-briefcase fa-1x xs-pl-5 text-light"></i> <br></br><small> PROJECTS</small></h4>
				 
			</div>
			<div className="col-md-4">
				 
				<h4 class="xs-mt-0 xs-p-5 text-center bg-white box-shadow"> {store.getState().ocr.OcrProjectList.overall_info.totalDocuments} <i class="fa fa-file-text-o fa-1x xs-pl-5 text-light"></i><br></br><small> DOCUMENTS</small></h4>
				 
			</div>
			<div className="col-md-4">
				 
				<h4 class="xs-mt-0 xs-p-5 text-center bg-white box-shadow">{store.getState().ocr.OcrProjectList.overall_info.totalReviewers} <i class="fa fa-user-o fa-1x xs-pl-5 text-light"></i><br></br><small> REVIEWERS</small></h4>
				 
			</div>			            
          </div>
          }
          </div>
          <div class="col-md-6 col-md-offset-2 text-right">
            <div class="form-inline">
			<ReactTooltip place="top" type="light"/>
              <button id="btn_ceate_project" className="btn btn-primary btn-rounded xs-mr-5 000" title="Create Project" onClick={this.openPopup.bind(this)} style={{textTransform:'none'}}><i className="fa fa-plus"></i> New Project</button>

              <span className="search-wrapper">
               <div class="form-group xs-mr-5">
                <input type="text" title="Search Project..." id="search" class="form-control btn-rounded "  onKeyUp={this.handleSearchBox.bind(this)} placeholder="Search project..."></input>
                        <button className="close-icon"  style={{position:"absolute",left:'165px',top:'7px'}}  onClick={this.clearSearchElement.bind(this)}type="reset"></button>
                        </div>
                </span>
            </div>
          </div>
          <div id="uploadData" role="dialog" className="modal fade modal-colored-header">
            <Modal backdrop="static" show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
              <Modal.Header closeButton>
                <h3 className="modal-title">Create Project</h3>
              </Modal.Header>
              <Modal.Body>
                <div className="row" style={{ margin: 0 }}>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label for="projectName" class="form-label">Project Name <span class="text-danger">*</span></label>
                        <input className="form-control" id="projectName" type="text" defaultValue={name} />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label for="projectType" class="form-label">Project Type </label>
                        <select id="projectType" class="form-control">
                          <option>Select</option>
                          <option>Financial Services</option>
                          <option>Medical, Health</option>
                          <option>Web Tech</option>
                          <option>Marketing and Customer Experience</option>
                          <option>Others</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label for="projectLead" class="form-label">Project Lead</label>
                        <input className="form-control" id="projectLead" type="text" placeHolder="Lead Name" />
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div id="resetMsg"></div>
                <Button id="Cp_dataCloseBtn" onClick={this.closePopup.bind(this)}> Close</Button>
                <Button id="Cp_loadDataBtn" onClick={this.handleSubmit.bind(this)} bsStyle="primary">Save</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}
