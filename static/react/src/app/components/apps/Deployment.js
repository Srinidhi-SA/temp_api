import React from "react";
import { connect } from "react-redux";
import {isEmpty} from "../../helpers/helper";
import {STATIC_URL,EMR} from "../../helpers/env.js";


import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {refreshAppsAlgoList,getDeploymentList,getListOfCards} from "../../actions/appActions";

import {  saveEncodingValuesAction } from "../../actions/featureEngineeringActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
		deploymentList:store.apps.deploymentList,

  };
})

export class Deployment extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
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
    console.log("Deployment render method is called...");
		var deploymentList = this.props.deploymentList;
    var deploymentTable = "";

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
        <td > {deploy.name}</td>

      </tr>);
      })
    return (
      
			<div id="deployment" class="tab-pane">
				<button class="btn btn-warning btn-shade4 pull-right">Add New Deployment</button><br/><br/>
					<div class="clearfix"></div>
						<table class="tablesorter table table-striped table-hover table-bordered break-if-longText">
							<thead>
								<tr className="myHead">
									<th>#</th>
									<th class="text-left">Name</th>
									<th class="text-left">Deployment Type</th>
									<th>Status</th>
									<th>Deployed On</th>
									<th>Runtime</th>
									<th>Jobs Triggered</th>
									<th>Action</th>
								</tr>
							</thead>
						<tbody>
							{deploymentTable}
						</tbody>
					</table>
			  </div>
    );
  }
}
  }