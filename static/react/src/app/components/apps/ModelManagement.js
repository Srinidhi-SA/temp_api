import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store"
import {C3Chart} from "../c3Chart";
import {openDeployModalAction, closeDeployModalAction, openModelSummaryAction} from "../../actions/modelManagementActions"
import {saveBinLevelTransformationValuesAction} from "../../actions/dataActions";
import {Button,Modal,Dropdown, Menu, MenuItem} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import { Router, Route, IndexRoute } from 'react-router';
import {isEmpty} from "../../helpers/helper";
import Dialog from 'react-bootstrap-dialog';
import { Deploy } from "./Deploy";
import {getAppsAlgoList,refreshAppsAlgoList,handleAlgoDelete} from "../../actions/appActions";
  var dateFormat = require('dateformat');
@connect((store) => {
  return {
    algoList: store.apps.algoList,
    currentAppId: store.apps.currentAppId,
    roboDatasetSlug: store.apps.roboDatasetSlug,
    modelSlug: store.apps.modelSlug,
    currentAppDetails: store.apps.currentAppDetails,
    modelSlug: store.apps.modelSlug,
    deployShowModal: store.apps.deployShowModal,
    selectedSummary :store.summarySelected,
  };
})

export class ModelManagement extends React.Component {
  constructor(props) {
    super(props);
    this.pickValue = this.pickValue.bind(this);

  }
  
 componentWillMount() {
  // var pageNo = 1;
  //   if(this.props.history.location.search.indexOf("page") != -1){
  //       pageNo = this.props.history.location.search.split("page=")[1];
  //   }
  //   if(store.getState().apps.currentAppId == ""){
  //       this.props.dispatch(getAppDetails(this.props.match.params.AppId,pageNo));
  //   }else
  //   {
  //       this.props.dispatch(getAppsAlgoList(pageNo));
  //   }

    if (isEmpty(this.props.algoList)) {
      if (!this.props.match.path.includes("robo")) {
        let url = '/signals/'
        console.log(this.props);
        this.props.history.push(url)
      }
		}
  }

  componentDidMount() {
    this.props.dispatch(refreshAppsAlgoList(this.props));

    $('#search').on('keyup', function() {
      var value = $(this).val();
      var patt = new RegExp(value, "i");
      $('#mmtable').find('tr').each(function() {
        if (!($(this).find('td').text().search(patt) >= 0)) {
          $(this).not('.myHead').hide();
        }
        if (($(this).find('td').text().search(patt) >= 0)) {
          $(this).show();
        }
      });
    });
  }
  proceedToModelSummary(item)
  {
    this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement/modelSummary');
    console.log(item,"item called for individual page...........................")
    this.props.dispatch(openModelSummaryAction(item));

  }
  closeModelmanagement()
  {
    var proccedUrl = this.props.match.url.replace('modelManagement','models');
    this.props.history.push(proccedUrl);
  }

  handleAlgoDelete(slug) {
    this.props.dispatch(handleAlgoDelete(slug, this.refs.dialog));
}

  pickValue(actionType, event){
    if(this.state[this.props.selectedItem.slug] == undefined){
      this.state[this.props.selectedItem.slug] = {}
    }
    if(this.state[this.props.selectedItem.slug][actionType] == undefined){
      this.state[this.props.selectedItem.slug][actionType] = {}
    }
    if(event.target.type == "checkbox"){
    this.state[this.props.selectedItem.slug][actionType][event.target.name] = event.target.checked;
    }else{
    this.state[this.props.selectedItem.slug][actionType][event.target.name] = event.target.value;
    }
  }
  
  handleCreateClicked(actionType, event){
    if(actionType == "deployData"){
      this.validateTransformdata(actionType);
    }else{
      var dataToSave = JSON.parse(JSON.stringify(this.state[this.props.selectedItem.slug][actionType]));
      this.props.dispatch(saveBinLevelTransformationValuesAction(this.props.selectedItem.slug, actionType, dataToSave));
      this.closeTransformColumnModal();
    }
  }

  render(){
    console.log(this.props.algoList,"@@@@@@@@@@@@@##################@@@@@@@@@@@@@@@@@")
    var mmTable = "";
    var deployPopup = "";
    // debugger;
    const algoList = store.getState().apps.algoList.data;
      mmTable = this.props.algoList.data.map((item,key )=> {
        return (
          
        <tr  className={('all ' + item.name)}>
       <td>
          <label for="txt_lName1">{`${key + 1}`}&nbsp;&nbsp;&nbsp;</label>
       </td>
      <td className="text-left"> {item.model_id}</td>
      <td> <i className="fa fa-briefcase text-primary"></i> {item.project_name}</td>
      <td className="text-left"> {item.algorithm}</td>
      <td ><span className="text-success"></span> {item.training_status}</td>
      <td > {item.accuracy}</td>
      <td > <i class="fa fa-calendar text-info"></i>{dateFormat( item.Created_on, " mmm d,yyyy HH:MM")}</td>
      <td > {item.deployment}</td>
      <td ><i class="fa fa-clock-o text-warning"></i> {item.runtime}</td>
      <td><Button   onClick={this.proceedToModelSummary.bind(this,item)} bsStyle="primary"> Details</Button></td>
      <td>
        <div class="pos-relative">
          <a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
            <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
          </a>    
          <ul class="dropdown-menu dropdown-menu-right">
          <li><a bsStyle="cst_button">Clone</a></li>
            <li><a onClick={this.openDeployModal.bind(this,item)} bsStyle="cst_button">Deploy</a></li>
            <li><a onClick={this.handleAlgoDelete.bind(this, item.slug)} >Delete</a></li>       
          </ul>
        </div>
      </td>
    </tr>);
    })

    deployPopup = (
      <div class="col-md-3 xs-mb-15 list-boxes" >
        <div id="deployPopup" role="dialog" className="modal fade modal-colored-header">
          <Modal show={this.props.deployShowModal} onHide={this.closeDeployModal.bind(this)} dialogClassName="modal-colored-header">
            <Modal.Header closeButton>
              <h3 className="modal-title">Deploy Project</h3>
            </Modal.Header>
            <Modal.Body>
              <Deploy /*parentPickValue={this.pickValue}*//>
            </Modal.Body> 
            <Modal.Footer>
              <Button onClick={this.closeDeployModal.bind(this)}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.handleCreateClicked.bind(this,"deployData")}>Deploy</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    )


    return (
      // <!-- Main Content starts with side-body -->
      <div class="side-body">
    
        {/* <!-- Page Title and Breadcrumbs --> */}
        <div class="page-head">
          <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> Model Management <br></br><small>Automated Prediction</small></h3>
        </div>
        {/* <!-- /.Page Title and Breadcrumbs --> */}
    
        {/* <!-- Page Content Area --> */}
        {deployPopup}
        <div class="main-content">
      
        <div class="row">
            <div class="col-md-12">           
              <div class="panel box-shadow">
                <div class="panel-body no-border xs-p-20">
             <div class="row xs-mb-10">
              <div className="col-md-3">
                <div class="form-inline" >
                  <div class="form-group">
                    <label for="sdataType">Filter By: </label>
                      <input type="text" id="searchBypname" class="form-control" list="listProjectName" placeholder="Project Name"></input>
                        <datalist id="listProjectName">
                           <option value="Credit Churn Prediction"></option>
                           <option value="Ecommerce Predict"></option>
                           <option value="Call Volume"></option>
                           <option value="Student Performance"></option>								
                        </datalist> &nbsp;&nbsp;&nbsp;
                   </div>
						    </div>
               </div>
                <div class="col-md-3 col-md-offset-6">
                   <div class="form-inline" >
                      <div class="form-group pull-right">
                          <input type="text" id="search" className="form-control" placeholder="Search variables..."></input>
                      </div>
                   </div>
               </div>
            </div>
             <div class="table-responsive">
                    <table  id="mmtable" class="tablesorter table table-striped table-hover table-bordered break-if-longText">
                      <thead>
                        <tr className="myHead">
                          <th>#</th>
                          <th><b>Model Id</b></th>
                          <th class="text-left"><b>Project Name</b></th>
                          <th class="text-left"><b>Algorithm</b></th>
                          <th><b>Status</b></th>
                          <th><b>Accuracy</b></th>
                          <th><b>Created On</b></th>
                          <th><b>Deployment</b></th>
                          <th><b>Runtime</b></th>
                          <th><b>Summary</b></th>
                          <th><b>Action</b></th>
                        </tr>
                      </thead>

                      <tbody className="no-border-x">
                        {mmTable}
                      </tbody>
                    </table>
                    <div class="col-md-12 text-center">
                  <ul class="pagination pagination-lg pager" id="myPager"></ul>
              </div>
                  </div>
                  <div class="buttonRow pull-right">
                    <Button onClick={this.closeModelmanagement.bind(this)} bsStyle="primary">Close</Button>
                  </div>
                  <Dialog ref="dialog"/>
                </div>
              </div>
              <div class="xs-p-30"></div>
            </div>
            {/* <!-- Open Column --> */}
          </div>
          {/* <!-- End Row --> */}
    
    
      {/* <!-- End of the Copying Code Till Here /////////////////////////////////////////// --> */}
    
        </div>
        {/* <!-- End Main Content --> */}
      </div>
    
    );
    }
  
  openDeployModal(item) {
    console.log("open ---openTransformColumnModal");
    this.props.dispatch(openDeployModalAction(item));
  }

  closeDeployModal() {
    console.log("closeddddd ---closeTransformColumnModal");
    this.props.dispatch(closeDeployModalAction());
  }
}