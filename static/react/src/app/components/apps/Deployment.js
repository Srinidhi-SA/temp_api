import React from "react";
import { connect } from "react-redux";
import {isEmpty} from "../../helpers/helper";
import {STATIC_URL,EMR} from "../../helpers/env.js";
import {getAppsAlgoList,refreshAppsAlgoList,handleDeploymentDeleteAction,createDeploy} from "../../actions/appActions";
import Dialog from 'react-bootstrap-dialog';
import { DeployPopup } from "./DeployPopup";
import {Button,Modal} from "react-bootstrap";
import {openDeployModalAction, closeDeployModalAction,saveDeployValueAction} from "../../actions/modelManagementActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
    deploymentList:store.apps.deploymentList,
		algoAnalysis:store.signals.algoAnalysis,
    deployShowModal: store.apps.deployShowModal,
    deployData: store.apps.deployData,
    deployItem: store.apps.deployItem,
  };
})

export class Deployment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.pickValue = this.pickValue.bind(this);
  }

  componentWillMount() {
    // this.props.dispatch(getDeploymentList(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
    

  }

  handleDeploymentDelete(slug) {
    var algoSlug= this.props.algoAnalysis.slug; 
    this.props.dispatch(handleDeploymentDeleteAction(slug,algoSlug, this.refs.dialog,));
  }

  pickValue(actionType, event){
    if(this.state[this.props.deployItem] == undefined){
      this.state[this.props.deployItem] = {}
    }
    if(event.target.type == "checkbox"){
      this.state[this.props.deployItem][event.target.name] = event.target.checked;
    }
    else{
      this.state[this.props.deployItem][event.target.name] = event.target.value;
    }
  }

  handleCreateClicked(actionType,event){
    if(actionType == "deployData"){
      this.validateDeployData(actionType,event);
    }else{
      var dataToSave = JSON.parse(JSON.stringify(this.state[this.props.deployItem][event.target.name]));
      this.props.dispatch(saveDeployValueAction(this.props.deployItem, dataToSave));
      this.closeDeployModal();
      this.props.dispatch(createDeploy(this.props.deployItem));
    }
  }

  validateDeployData(actionType,event){
    var slugData = this.state[this.props.deployItem];
    
    if(slugData != undefined && this.state[this.props.deployItem] != undefined){
      var deployData = this.state[this.props.deployItem];
      var dataToSave = JSON.parse(JSON.stringify(this.state[this.props.deployItem]));
      this.props.dispatch(saveDeployValueAction(this.props.deployItem, dataToSave));
      this.closeDeployModal();
      this.props.dispatch(createDeploy(this.props.deployItem));
    }
  }

  render() {
    if(isEmpty(this.props.deploymentList)){
			return ( 
        <div className="side-body">
          <div className="page-head">
          </div>
          <div className="main-content">
            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
          </div>
        </div>
      );
		}else{
    var deployPopup = "";
    var deployData = "";
    console.log("Deployment render method is called...");
    console.log(this.props.algoAnalysis.slug, +"+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		var deploymentList = this.props.deploymentList;
    var deploymentTable = "";
    deployData = "deployData";
      deployPopup = (
        <div class="col-md-3 xs-mb-15 list-boxes" >
          <div id="deployPopup" role="dialog" className="modal fade modal-colored-header">
            <Modal show={this.props.deployShowModal} onHide={this.closeDeployModal.bind(this)} dialogClassName="modal-colored-header">
              <Modal.Header closeButton>
                <h3 className="modal-title">Deploy Project</h3>
              </Modal.Header>
              <Modal.Body>
                <DeployPopup parentPickValue={this.pickValue}/>
              </Modal.Body> 
              <Modal.Footer>
                <Button onClick={this.closeDeployModal.bind(this)}>Cancel</Button>
                <Button bsStyle="primary" onClick={this.handleCreateClicked.bind(this,deployData)}>Deploy</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )

    if(deploymentList.data.length == 0){    
      return(
        deploymentTable = <h4 style={{textAlign:"center"}}>No Deployments Available</h4>
      );
    }
    else {
      deploymentTable = deploymentList.data.map((deploy,key )=> {
      return (
          <tr key={key} className={('all ' + deploy.name)}>
      <td>
         <label for="txt_lName1">{`${key + 1}`}&nbsp;&nbsp;&nbsp;</label>
      </td>
     <td className="text-left"> {deploy.name}</td>
     <td  className="text-left"> {deploy.name}</td>
     <td className="text-left"> {deploy.status}</td>
     <td ><span className="text-success"></span> {deploy.updated_at}</td>
     <td > {deploy.name}</td>
     <td > {deploy.name}</td>
     {/* <td > {deploy.name}</td> */}
     <td>
        <div class="pos-relative">
          <a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More..">
            <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
          </a>    
          <ul class="dropdown-menu dropdown-menu-right">
          <li><a bsStyle="cst_button">View</a></li>
            <li><a onClick={this.handleDeploymentDelete.bind(this, this.props.selectedItem)}  >Delete</a></li>       
          </ul>
        </div>
      </td>
   </tr>);
   }) 
  }
    
    return (
			<div id="deployment" class="tab-pane">
          {deployPopup} 
				<button class="btn btn-warning btn-shade4 pull-right"  onClick={this.openDeployModal.bind(this,this.props.algoAnalysis.slug)}>Add New Deployment</button><br/><br/>
					<div class="clearfix"></div>
						<table class="tablesorter table table-striped table-hover table-bordered break-if-longText">
							<thead>
								<tr className="myHead">
									<th>#</th>
									<th class="text-left"><b>Name</b></th>
									<th class="text-left"><b>Deployment Type</b></th>
									<th><b>Status</b></th>
									<th><b>Deployed On</b></th>
									<th><b>Runtime</b></th>
									<th><b>Jobs Triggered</b></th>
									<th><b>Action</b></th>
								</tr>
							</thead>
						<tbody>
							{deploymentTable}
						</tbody>
					</table>
                    <Dialog ref="dialog"/>

			  </div>
      );
    }
  }
  openDeployModal(slug) {
    console.log("open ---openDeployModal");
    this.props.dispatch(openDeployModalAction(slug));
  }
  
  closeDeployModal() {
    console.log("closeddddd ---closeDeployModal");
    this.props.dispatch(closeDeployModalAction());
  }
}