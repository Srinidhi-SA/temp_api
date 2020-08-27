import React from 'react'
import { Link, Redirect } from "react-router-dom";
import { saveDocumentPageFlag, getOcrProjectsList,selectedProjectDetails,projectPage } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
import { Pagination } from "react-bootstrap";
import { OcrCreateProject } from './OcrCreateProject';
import { STATIC_URL } from '../../../helpers/env';
import ReactTooltip from 'react-tooltip';
import { Modal, Button, } from "react-bootstrap/";
import { API } from "../../../helpers/env";
import { getUserDetailsOrRestart, statusMessages } from "../../../helpers/helper";

@connect((store) => {
   return {
      OcrProjectList: store.ocr.OcrProjectList
   };
})


export class OcrProjectScreen extends React.Component {
   constructor(props){
      super(props);
      this.state={
         editProjectFlag: false,
         editProjectName:"",
         editProjectSlug:"",
      }
   }

   handleDocumentPageFlag (slug,name){
      this.props.dispatch(saveDocumentPageFlag(true));
      this.props.dispatch(selectedProjectDetails(slug,name))
   }
   componentWillMount = () => {
      this.props.dispatch(getOcrProjectsList())
   }

   handlePagination=(pageNo)=> {
      this.props.dispatch(projectPage(pageNo))
      this.props.dispatch(getOcrProjectsList(pageNo))
    }
    closePopup=() =>{
     this.setState({editProjectFlag:false})
    }
    openPopUp=(name,slug)=>{
      this.setState({editProjectName: name,editProjectSlug:slug, editProjectFlag:true}) 
    }
   handleNameChange=(e)=>{
      document.getElementById("resetMsg").innerText="";
      this.setState({editProjectName:e.target.value});
   }
    getHeader = (token) => {
      return {
        'Authorization': token,
        'Content-Type': 'application/json',
      }
    }

    saveProjectName=()=>{
       if(this.state.editProjectName==""){
          document.getElementById("resetMsg").innerText="Please enter project name";
          return false;
       }
       return fetch(API + '/ocr/project/' + this.state.editProjectSlug +'/',{
         method: 'put',
         headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
         body: JSON.stringify({name: this.state.editProjectName})
       }).then(response=>response.json())
       .then(data=>{
         if(data.edited=== true){
            this.closePopup(),
            bootbox.alert(statusMessages("success", "Project name changed.", "small_mascot"))
            setTimeout(()=>{
               this.props.dispatch(getOcrProjectsList())
            },1000)
         }
      else{
         document.getElementById("resetMsg").innerText= data.exception; 
      }
      })
    }

   render() {
      const pages = this.props.OcrProjectList.total_number_of_pages;
      const current_page = this.props.OcrProjectList.current_page;
      let paginationTag = null
      if (pages > 1) {
        paginationTag = (
          <div class="col-md-12 text-center">
           <div className="footer" id="Pagination">
            <div className="pagination">
              <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handlePagination} first last next prev boundaryLinks items={pages} activePage={current_page} />
            </div>
           </div>
          </div>
        )
      }
      var OcrProjectTable = (
         this.props.OcrProjectList != '' ? (this.props.OcrProjectList.data.length != 0 ? this.props.OcrProjectList.data.map((item, index) => {
            return (
               <tr  key={index} id={index}>
                  <td>
                     <Link to='/apps/ocr-mq44ewz7bp/project/' onClick={this.handleDocumentPageFlag.bind(this,item.slug,item.name)}>{item.name}</Link>
                  </td>
                  <td>{item.project_overview.workflows}</td>
                  <td>{item.project_overview.completion}%</td>
                  <td>{new Date(item.created_at).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
                  <td>{new Date(item.updated_at).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
               <td><span title="Edit Project Name" style={{cursor:'pointer'}} className="fa fa-pencil-square-o text-secondary xs-mr-5" onClick={() =>this.openPopUp(item.name,item.slug)}></span></td>
               </tr>
            )
         }
         )
            : (<tr><td className='text-center' colSpan={6}>"No data found for your selection"</td></tr>)
         )
            : (<img id="loading" style={{ position: 'relative', left: '500px' }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
      )
      return (
         <div>
            <OcrCreateProject />
            <ReactTooltip place="top" type="light"/>    
            <div class="table-responsive">
               <table class="table table-condensed table-hover cst_table ">
                  <thead>
                     <tr>
                        <th data-tip="Click here to see workflows under the respective project" >Project Name</th>
                        <th>Pages</th>
                        <th>Complete %</th>
                        <th>Created At</th>
                        <th>Last Update</th>
                        <th>Action</th>
                     </tr>
                  </thead>
                  <tbody class="no-border-x">
                     {OcrProjectTable}
                  </tbody>
               </table>
              {paginationTag}
            </div>

            <div id="editProject" role="dialog" className="modal fade modal-colored-header">
            <Modal backdrop="static" show={this.state.editProjectFlag} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
              <Modal.Header closeButton>
                <h3 className="modal-title">Edit Project</h3>
              </Modal.Header>
              <Modal.Body>
                <div className="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label for="projectName" class="form-label">Project Name <span class="text-danger">*</span></label>
                        <input className="form-control" id="projectName" type="text"  defaultValue={this.state.editProjectName} onChange={this.handleNameChange}/>
                      </div>
                    </div>
                  </div>
              </Modal.Body>
              <Modal.Footer>
                <div id="resetMsg"></div>
                <Button onClick={this.closePopup.bind(this)}> Close</Button>
                <Button bsStyle="primary" onClick={this.saveProjectName}>Save</Button>
              </Modal.Footer>
            </Modal>
          </div>
         </div>

      )
   }
}
