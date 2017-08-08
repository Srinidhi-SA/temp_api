import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";

export class DataUpload extends React.Component {
	constructor() {
		super();
		this.state = {showModal: false};
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}

	close() {
		this.setState({ showModal: false });
	}

	open() {
		console.log(this.state.showModal);
		this.setState({ showModal: true });
	}
	render() {
		return (
				<div className="col-md-3 top20 list-boxes" onClick={this.open}>
				<div className="newCardStyle firstCard">
				<div className="card-header"></div>
				<div className="card-center newStoryCard">
				<div className="col-xs-2 col-xs-offset-1"><i className="fa fa-3x">+</i></div>
				<div className="col-xs-8 col-xs-offset-0">UPLOAD NEW</div>
				</div>
				</div>
				<div id="uploadData"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={this.state.showModal} onHide={this.close}>
				<Modal.Header closeButton>
				<h3 className="modal-title">Upload Data</h3>
				</Modal.Header>
				<Modal.Body>
				<Tab.Container id="left-tabs-example" defaultActiveKey="first">
				<Row className="clearfix">
				<Col sm={2}>
				<Nav bsStyle="pills" stacked>
				<NavItem eventKey="first">
				Tab 1
				</NavItem>
				<NavItem eventKey="second">
				Tab 2
				</NavItem>
				</Nav>
				</Col>
				<Col sm={10}>
				<Tab.Content animation>
				<Tab.Pane eventKey="first">
				<div id="dat_upload1" class="tab-pane active cont fade in">
				<h3>
				File Upload
				<div class="pull-right">
				<div class="db_images db_file_upload"></div>
				</div>
				</h3>
				<input id="thefiles" type="file" name="files" accept=".jpg, .png, image/jpeg, image/png" multiple/>
				<div class="form-group text-right">
				<button type="button" data-dismiss="modal" onclick="window.location.href='data_preview.html'" class="btn btn-primary md-close">Upload</button>
				</div>
				</div>
				</Tab.Pane>
				<Tab.Pane eventKey="second">
				Tab 2 content
				</Tab.Pane>
				</Tab.Content>
				</Col>
				</Row>
				</Tab.Container>

				</Modal.Body>
				<Modal.Footer>
				<Button onClick={this.close}>Close</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>

		)
	}

}	  