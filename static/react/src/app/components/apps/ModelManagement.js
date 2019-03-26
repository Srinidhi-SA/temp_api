import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store"
import {C3Chart} from "../c3Chart";
import {openDeployModalAction, closeDeployModalAction, openModelSummaryAction, storeAlgoSearchElement} from "../../actions/modelManagementActions"
import {saveBinLevelTransformationValuesAction} from "../../actions/dataActions";
import {Button,Modal,Dropdown, Menu, MenuItem, Pagination} from "react-bootstrap";
import {STATIC_URL} from "../../helpers/env.js"
import { Router, Route, IndexRoute } from 'react-router';
import {isEmpty, SEARCHCHARLIMIT,subTreeSetting,getUserDetailsOrRestart} from "../../helpers/helper";
import Dialog from 'react-bootstrap-dialog';
import {getAlgoAnalysis,emptyAlgoAnalysis, setSideCardListFlag, updateselectedL1} from "../../actions/signalActions";
import { Deploy } from "./Deploy";
import {getAppsAlgoList,refreshAppsAlgoList,handleAlgoDelete,getAppDetails,} from "../../actions/appActions";

var dateFormat = require('dateformat');
@connect((store) => {
  return {
    algoList: store.apps.algoList,
    currentAppId: store.apps.currentAppId,
    roboDatasetSlug: store.apps.roboDatasetSlug,
		algoAnalysis:store.signals.algoAnalysis,

    modelSlug: store.apps.modelSlug,
    currentAppDetails: store.apps.currentAppDetails,
    modelSlug: store.apps.modelSlug,
    deployShowModal: store.apps.deployShowModal,
    selectedSummary :store.summarySelected,
    algo_search_element :store.apps.algo_search_element
  };
})

export class ModelManagement extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.pickValue = this.pickValue.bind(this);

  }
  
 componentWillMount() {
  this.setState({algoAnalysis:this.props.algoAnalysis});
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

    // if (isEmpty(this.props.algoList)) {
    //   if (!this.props.match.path.includes("robo")) {
    //     let url = '/signals/'
    //     console.log(this.props);
    //     this.props.history.push(url)
    //   }
    // }

    
    
  }
  componentDidMount() {
		// this.props.dispatch(getAlgoAnalysis(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
    this.props.dispatch(refreshAppsAlgoList(this.props));
  }
  
  proceedToModelSummary(item)
  {
    this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement/'+  item.slug);
    console.log(item,"item called for individual page...........................")
    this.props.dispatch(openModelSummaryAction(item));
			this.props.dispatch(getAlgoAnalysis(getUserDetailsOrRestart.get().userToken,item.slug));
      console.log(item,"item called for individual page...........................")



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

  getAlgoAnalysis(item,signalType,e) {
    this.props.dispatch(emptyAlgoAnalysis());
			this.props.dispatch(getAlgoAnalysis(getUserDetailsOrRestart.get().userToken,item.slug));

  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        //console.log('searching in data list');
        if (e.target.value != "" && e.target.value != null)
            this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + e.target.value + '')
            this.props.dispatch(storeAlgoSearchElement(e.target.value));
        this.props.dispatch(getAppsAlgoList(1));
        
    }
  }

  onChangeOfSearchBox(e){
    if(e.target.value==""||e.target.value==null){
        this.props.dispatch(storeAlgoSearchElement(""));
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement'+'')
        this.props.dispatch(getAppsAlgoList(1));
        
    }else if (e.target.value.length > SEARCHCHARLIMIT) {
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + e.target.value + '')
        this.props.dispatch(storeAlgoSearchElement(e.target.value));
        this.props.dispatch(getAppsAlgoList(1));
    }
    else{
        this.props.dispatch(storeAlgoSearchElement(e.target.value));
    }
}

  render(){

    if(isEmpty(this.props.algoList)){
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
    console.log(this.props.algoList,"@@@@@@@@@@@@@##################@@@@@@@@@@@@@@@@@")
    var mmTable = "";
    var deployPopup = "";
    var Details="Details"
    // debugger;
    const algoList = store.getState().apps.algoList.data;
      mmTable = this.props.algoList.data.map((item,key )=> {
    var AlgoLink = '/apps/' + this.props.match.params.AppId + '/modelManagement/'+  item.slug

        return (
          
        <tr key={key} className={('all ' + item.name)}>
       <td>
          <label for="txt_lName1">{`${key + 1}`}&nbsp;&nbsp;&nbsp;</label>
       </td>
      <td className="text-left"> {item.model_id}</td>
      <td  class="text-left"> <i className="fa fa-briefcase text-primary"></i> {item.project_name}</td>
      <td className="text-left"> {item.algorithm}</td>
      <td ><span className="text-success"></span> {item.training_status}</td>
      <td > {item.accuracy}</td>
      <td > <i class="fa fa-calendar text-info"></i>{dateFormat( item.created_at, " mmm d,yyyy")}</td>
      <td > {item.deployment}</td>
      <td ><i class="fa fa-clock-o text-warning"></i> {item.runtime}</td>
      {/* <td><Button   onClick={this.proceedToModelSummary.bind(this,item)}  bsStyle="primary"></Button></td> */}
      <td> <Button ><Link to={AlgoLink} id={item.slug} onClick={this.getAlgoAnalysis.bind(this,item)} className="title">
              {Details}
              </Link></Button></td>
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

      
      if (algoList) {
          const pages = store.getState().apps.algoList.total_number_of_pages;
          const current_page = store.getState().apps.algoList.current_page;
          
          let paginationTag = null
          if(pages > 1){
              paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect} first last next prev boundaryLinks items={pages} activePage={current_page}/>
          }

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
                    <div className="search-wrapper">
                      <input type="text" name="algo_search" value={this.props.model_search_element} onKeyPress={this._handleKeyPress.bind(this)} onChange={this.onChangeOfSearchBox.bind(this)} title="Algorithm Search" id="algo_search" className="form-control search-box" placeholder="Search Algorithm..." required />
                      <span className="zmdi zmdi-search form-control-feedback"></span>
                      <button className="close-icon" type="reset" onClick={this.clearSearchElement.bind(this)}></button>
                    </div>
                </div>
              </div>
              <div class="table-responsive">
                      <table  id="mmtable" class="tablesorter table table-striped table-hover table-bordered break-if-longText">
                        <thead>
                          <tr className="myHead">
                            <th>#</th>
                            <th class="text-left"><b>Model Id</b></th>
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
                    {/* <ul class="pagination pagination-lg pager" id="myPager"></ul> */}
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
  }
}
  openDeployModal(item) {
    console.log("open ---openDeployModal");
    this.props.dispatch(openDeployModalAction(item));
  }
  
  closeDeployModal() {
    console.log("closeddddd ---closeDeployModal");
    this.props.dispatch(closeDeployModalAction());
  }

  handleSelect(eventKey) {
    if (this.props.algo_search_element) {
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?search=' + this.props.model_search_element+'?page='+eventKey+'')
    }else
        this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement?page='+eventKey+'')
        this.props.dispatch(getAppsAlgoList(eventKey));
}

  clearSearchElement(e){
    this.props.dispatch(storeAlgoSearchElement(""));
    this.props.history.push('/apps/'+this.props.match.params.AppId+'/modelManagement');
    this.props.dispatch(getAppsAlgoList(1));
  }
}