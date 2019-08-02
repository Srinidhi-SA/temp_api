import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store"
import {C3Chart} from "../c3Chart";
import {openDeployModalAction, closeDeployModalAction, openModelSummaryAction, storeAlgoSearchElement,saveDeployValueAction} from "../../actions/modelManagementActions"
import {Button,Modal,Dropdown, Menu, MenuItem, Pagination} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import { Router, Route, IndexRoute } from 'react-router';
import {isEmpty, SEARCHCHARLIMIT,subTreeSetting,getUserDetailsOrRestart} from "../../helpers/helper";
import Dialog from 'react-bootstrap-dialog';
import {getAlgoAnalysis,emptyAlgoAnalysis, setSideCardListFlag, updateselectedL1} from "../../actions/signalActions";
import { DeployPopup } from "./DeployPopup";
import {getAppsAlgoList,refreshAppsAlgoList,handleAlgoDelete,handleAlgoClone,getAppDetails,getAllProjectList,getDeployPreview,createDeploy} from "../../actions/appActions";

var dateFormat = require('dateformat');
@connect((store) => {
  return {
    algoList: store.apps.algoList,
    currentAppId: store.apps.currentAppId,
    roboDatasetSlug: store.apps.roboDatasetSlug,
    algoAnalysis:store.signals.algoAnalysis,
    allProjects : store.apps.allProjects ,
    modelSlug: store.apps.modelSlug,
    currentAppDetails: store.apps.currentAppDetails,
    modelSlug: store.apps.modelSlug,
    deployShowModal: store.apps.deployShowModal,
    selectedSummary :store.summarySelected,
    algo_search_element :store.apps.algo_search_element,
    deployData: store.apps.deployData,
    deployItem:store.apps.deployItem,
  };
})

export class ModelManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSelect = this.handleSelect.bind(this);
    this.pickValue = this.pickValue.bind(this);

  }

 componentWillMount() {
  if(this.props.match.params.AppId=="automated-prediction-30vq9q5scd"){
    var aId=2;
  }
   else aId=13;
  
  this.props.dispatch(getAllProjectList(pageNo,aId));
  var pageNo = 1;
    if(this.props.history.location.search.indexOf("page") != -1){
        pageNo = this.props.history.location.search.split("page=")[1];
    }
    if(store.getState().apps.currentAppId == ""){
        this.props.dispatch(getAppDetails(this.props.match.params.AppId,pageNo));
    }else
    {
        this.props.dispatch(getAppsAlgoList(pageNo));
    }
  }

  componentDidMount() {
    this.props.dispatch(refreshAppsAlgoList(this.props));
  }

  closeModelmanagement()
  {
    this.clearSearchElement();
    var proccedUrl = this.props.match.url.replace('modelManagement','models');
    this.props.history.push(proccedUrl);
  }

  handleAlgoDelete(slug) {
    this.props.dispatch(handleAlgoDelete(slug, this.refs.dialog));
  }

  handleAlgoClone(slug) {
    this.props.dispatch(handleAlgoClone(slug, this.refs.dialog));
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

  getDeployPreview(e){
    var pageNo =1;
    this.selectedData = $("#project_all").val();
    this.props.dispatch(getDeployPreview(pageNo,this.selectedData));
  }
  getAllDeployPreview(){
    this.props.dispatch(getAppsAlgoList(1));
  }

  validateDeployData(actionType,event){
    var slugData = this.state[this.props.deployItem];
    if(slugData != undefined && this.state[this.props.deployItem] != undefined){
      var deployData = this.state[this.props.deployItem];
      if(deployData.name == undefined|| deployData.name == null || deployData.name == ""){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please enter deployment name");
        $("input[name='name']").focus();
        return;
      }else if(deployData.datasetname == undefined|| deployData.datasetname == null || deployData.datasetname == ""){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please enter dataset name");
        $("input[name='datasetname']").focus();
        return;
      }else if(deployData.file_name == undefined|| deployData.file_name == null || deployData.file_name == ""){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please enter filename");
        $("input[name='file_name']").focus();
        return;
      }else if(deployData.access_key_id == undefined|| deployData.access_key_id == null || deployData.access_key_id == ""){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please enter access key password");
        $("input[name='access_key_id']").focus();
        return;
      }else if(deployData.secret_key == undefined|| deployData.secret_key == null || deployData.secret_key == ""){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please enter secret key password");
        $("input[name='secret_key']").focus();
        return;
      }else if(deployData.timing_details == undefined|| deployData.timing_details == "none"){
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Please select frequency");
        $("select[name='timing_details']").focus();
        return;
      }
      var dataToSave = JSON.parse(JSON.stringify(this.state[this.props.deployItem]));
      this.props.dispatch(saveDeployValueAction(this.props.deployItem, dataToSave));
      this.closeDeployModal();
      this.props.dispatch(createDeploy(this.props.deployItem));
    }else{
      $("#fileErrorMsg").removeClass("visibilityHidden");
      $("input[name='name']").css("border-color","red");
		  $("input[name='datasetname']").css("border-color","red");
      $("input[name='file_name']").css("border-color","red");
      $("input[name='access_key_id']").css("border-color","red");
      $("input[name='secret_key']").css("border-color","red");
      $("select[name='timing_details']").css("border-color","red");
      $("#fileErrorMsg").html("Please enter Mandatory fields * ");
    }
  }

  getAlgoAnalysis(item,e) {
    console.log("Link Onclick is called")
    this.props.dispatch(emptyAlgoAnalysis());
  }

  _handleKeyPress = (e) => {
      if (e.target.value != "" && e.target.value != null)
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + e.target.value + '')
        this.props.dispatch(storeAlgoSearchElement(e.target.value));
        this.selectedData = $("#project_all").val();
        var pageNo =1;
        this.props.dispatch(getDeployPreview(pageNo,this.selectedData));
  }

  onChangeOfSearchBox(e){
    if(e.target.value==""||e.target.value==null){
      this.props.dispatch(storeAlgoSearchElement(""));
      this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement'+'')
      // this.props.dispatch(getAppsAlgoList(1));
      this.selectedData = $("#project_all").val();
      var pageNo =1;
      this.props.dispatch(getDeployPreview(pageNo,this.selectedData));
      // document.getElementById('algo_search').value= "";
    }else if (e.target.value.length > SEARCHCHARLIMIT) {
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + e.target.value + '')
        this.props.dispatch(storeAlgoSearchElement(e.target.value));
        // this.props.dispatch(getAppsAlgoList(1));
    }
    else{ 
      this.props.dispatch(storeAlgoSearchElement(e.target.value));
    }
  }

  handleSelect(eventKey) {
    if (this.props.algo_search_element) {
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + this.props.model_search_element+'?page='+eventKey+'')
    }else
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?page='+eventKey+'')
         this.selectedData = $("#project_all").val();
        this.props.dispatch(getDeployPreview(eventKey,this.selectedData));
  }

  clearSearchElement(eventKey){
    this.props.dispatch(storeAlgoSearchElement(""));
    this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement');
    // this.props.dispatch(getAppsAlgoList(1));
    this.selectedData = $("#project_all").val();
    // var pageNo =1;
    this.props.dispatch(getDeployPreview(eventKey,this.selectedData));
    document.getElementById('algo_search').value= "";
  }

  render(){
    if(isEmpty(this.props.algoList)|| isEmpty(this.props.allProjects)){
			return (
        <div className="side-body">
          <div className="page-head"></div>
          <div className="main-content">
            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
          </div>
        </div>
      );
    }else{
      console.log(this.props.allProjects,"ppppppppppppppppppppppppppppp")
      var mmTable = "";
      var deployPopup = "";
      var deployData = "";
      var Details="Details"
      const algoList = store.getState().apps.algoList.data;
      var none = none;
      const dataSets = this.props.allProjects;
      let renderSelectBox = null;
      if(dataSets != ""){
        var options= dataSets.data.filter(datacount => (datacount.count)>0).map(dataSet => 
          <option key={dataSet.slug} value={dataSet.slug} >{dataSet.name}</option>
        )
        renderSelectBox = <select className="form-control" id="project_all" name="selectbasic" onChange={this.getDeployPreview.bind(this)} class="form-control">
          <option value="">All</option>

          {options}
        </select>
      }else{
        renderSelectBox = ""
      }

      mmTable = this.props.algoList.data.map((item,key )=> {
        var AlgoLink = '/apps/' + this.props.match.params.AppId + '/modelManagement/'+  item.slug
        return (
          <tr key={key} className={('all ' + item.name)}>
          <td><label for="txt_lName1">{`${key + 1}`}&nbsp;&nbsp;&nbsp;</label></td>
          <td className="text-left"> {item.model_id}</td>
          <td class="text-left"><div class="ellipse-text" title={item.project_name}> {item.project_name}</div></td>
          <td className="text-left"> {item.algorithm}</td>
          {/* <td ><span className="text-success"></span> {item.training_status}</td> */}
          <td > {item.accuracy}</td>
          <td> {dateFormat( item.created_at, " mmm d,yyyy")}</td>
          <td> {item.deployment}</td>
          <td> {item.total_deployment}</td>
          <td> {item.runtime}</td>
          <td><Button>
            <Link to={AlgoLink} id={item.slug} onClick={this.getAlgoAnalysis.bind(this,item)} className="title">
              {Details}
            </Link></Button>
          </td>
          <td>
          <div class="pos-relative">
            <a class="btn btn-space btn-default btn-round btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="More...">
              <i class="ci zmdi zmdi-hc-lg zmdi-more-vert"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-right">
              <li><a onClick={this.handleAlgoClone.bind(this, item.slug)}>Clone</a></li>
              <li><a onClick={this.openDeployModal.bind(this,item.slug)} >Deploy</a></li>
              <li><a onClick={this.handleAlgoDelete.bind(this, item.slug)} >Delete</a></li>
              <Dialog ref="dialog"/>
            </ul>
          </div>
        </td>
      </tr>);
      })

      let tablecontent="";
      if (this.props.algoList.data.length != 0){
        let thead5 = " "
        if(this.props.currentAppId == 13){thead5 = "Root Mean Square Error";}else thead5 = "Accuracy";
        tablecontent = (
        <table id="mmtable" class="tablesorter table table-striped table-hover table-bordered break-if-longText">
          <thead>
            <tr className="myHead">
              <th>#</th>
              <th class="text-left"><b>Model ID</b></th>
              <th class="text-left"><b>Project Name</b></th>
              <th class="text-left"><b>Algorithm</b></th>
              <th><b>{thead5}</b></th>
              <th><b>Created On</b></th>
              <th><b>Active Deployment</b></th>
              <th><b>Total Deployments</b></th>
              <th><b>Runtime</b></th>
              <th><b>Summary</b></th>
              <th><b>Action</b></th>
            </tr>
          </thead>
          <tbody className="no-border-x"> {mmTable} </tbody>
        </table>
        )
      }else if(this.props.algoList.current_item_count == 0){
        tablecontent= (
          <h5><center>There are no models available for this selection</center></h5>
        )
      }else {(
        tablecontent= (
          <h5><center>There are no models available for this selection</center></h5>
        )
      )}

      deployData = "deployData";
      deployPopup = (
        <div class="col-md-3 xs-mb-15 list-boxes" >
          <div id="deployPopup" role="dialog" className="modal fade modal-colored-header">
            <Modal show={this.props.deployShowModal} onHide={this.closeDeployModal.bind(this)} dialogClassName="modal-colored-header">
              <Modal.Header closeButton>
                <h3 className="modal-title">Deploy Model</h3>
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
      
      if (algoList) {
        const pages = store.getState().apps.algoList.total_number_of_pages;
        const current_page = store.getState().apps.algoList.current_page;
        let paginationTag = null
        if(pages > 1){
          paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
        }
        let appName = this.props.currentAppDetails.displayName;
        console.log(appName);
        return (
          // <!-- Main Content starts with side-body -->
          <div class="side-body">
            {/* <!-- Page Title and Breadcrumbs --> */}
            <div class="page-head">
              <h3 class="xs-mt-0 xs-mb-0 text-capitalize"> Model Management <br></br><small>{appName}</small></h3>
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
                              <div class="input-group">
                                <span class="input-group-btn"><label for="sdataType" class="xs-pt-5 xs-pr-10">&nbsp;&nbsp;Filter By:</label></span>
                                {renderSelectBox}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-3 col-md-offset-6">
                          <div className="btn-toolbar pull-right">
                            <div className="input-group">
                              <div className="search-wrapper">
                                {/* <input type="text" id="search" className="form-control" placeholder="Search variables..."></input> */}
                                <input type="text" name="algo_search" value={this.props.model_search_element} onInput={this._handleKeyPress.bind(this)} title="Algorithm Search" id="algo_search" className="form-control search-box" placeholder="Search Algorithm..." required />
                                <span className="zmdi zmdi-search form-control-feedback"></span>
                                <button className="close-icon" type="reset" onClick={this.clearSearchElement.bind(this)}></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="table-responsive">
                        {tablecontent}                    
                        <div class="col-md-12 text-center">
                          <div className="footer"  id="idPagination">
                            <div className="algo_paginate">
                              {paginationTag}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="buttonRow pull-right">
                        <Button onClick={this.closeModelmanagement.bind(this)} bsStyle="primary">Close</Button>
                      </div>
                      <Dialog ref="dialog"/>
                    </div>
                  </div>
                </div>
              </div>
            {/* <!-- End Row --> */}
            </div>
          {/* <!-- End Main Content --> */}
          </div>
        );
      }
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
