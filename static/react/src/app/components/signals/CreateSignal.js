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
		dataList: store.datasets.dataList};
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
		const dataSets = store.getState().datasets.dataList.data;
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.openSignalModal.bind(this)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-2 col-xs-offset-1"><i class="fa fa-3x">+</i></div>
				<div class="col-xs-8 col-xs-offset-0">CREATE NEW</div>
				</div>
				</div>
				<div id="newSignal"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().signals.newSignalShowModal} onHide={this.closeSignalModal.bind(this)}>
				<Modal.Header closeButton>
				<h3 className="modal-title">Create New</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
	              <label>Select an existing dataset</label>
				<select id="sel_existdataste" name="selectbasic" class="form-control">
				{dataSets.map(dataSet =>
				<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
				)}
				</select>
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeSignalModal.bind(this)}>Close</Button>
				<Link to="/data/variableSelection"><Button className="btn btn-primary md-close">Create</Button></Link>
				</Modal.Footer>
				</Modal>
				</div>
				</div>

		)
	}

}	  