import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/dataActions";
import {  saveEncodingValuesAction } from "../../actions/featureEngineeringActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    selectedItem: store.datasets.selectedItem,
    featureEngineering:store.datasets.featureEngineering,
  };
})

export class Deployment extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    console.log("Deployment render method is called...");
    return (
			<div id="deployment" class="tab-pane">
				<button class="btn btn-warning btn-shade4 pull-right">Add New Deployment</button>
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
							aueakjfl
						</tbody>
					</table>
			  </div>
    );
  }
  }