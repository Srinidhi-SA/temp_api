import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";

@connect((store) => {
	return {login_response: store.login.login_response, 
		newSignalShowModal: store.signals.newSignalShowModal,
		allDataList: store.datasets.allDataSets,};
})

export class CreateSignal extends React.Component {
	constructor(props) {
		super(props);
		this.props.dispatch(closeCreateSignalModal());
	}
	openSignalModal(){
    	this.props.dispatch(openCreateSignalModal())
    }
    closeSignalModal(){
    	this.props.dispatch(closeCreateSignalModal())
    }

	render() {
		const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;
		if(dataSets){
			renderSelectBox = <select id="signal_Dataset" name="selectbasic" class="form-control">
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
		}
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.openSignalModal.bind(this)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				 
				<div class="col-xs-12 text-center"> CREATE SIGNAL </div>
				</div>
				</div>
				<div id="newSignal"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().signals.newSignalShowModal} onHide={this.closeSignalModal.bind(this)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Create New</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
	              <label>Select an existing dataset</label>
				{renderSelectBox}
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button  onClick={this.closeSignalModal.bind(this)}>Close</Button>
				<Link to="/variableSelection" className="btn btn-primary"> Create</Link>
				</Modal.Footer>
				</Modal>
				</div>
				</div>

		)
	}

}	  