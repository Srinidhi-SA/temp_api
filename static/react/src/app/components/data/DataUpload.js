import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import {open,close} from "../../actions/dataUploadActions";
import $ from "jquery";

@connect((store) => {
	return {login_response: store.login.login_response, showModal:store.dataupload.dataUploadShowModal,
	};
})

export class DataUpload extends React.Component {
	constructor(props) {
		super(props);
		this.props.dispatch(close());
		this.onDrop = this.onDrop.bind(this);
	}
    openPopup(){
    	this.props.dispatch(open())
    }
    closePopup(){
    	this.props.dispatch(close())
    }
	onDrop(files) {
		console.log(files)
	}
	render() {
		return (
				<div className="col-md-3 top20 list-boxes" onClick={this.openPopup.bind(this)}>
				<div className="newCardStyle firstCard">
				<div className="card-header"></div>
				<div className="card-center newStoryCard">
				<div className="col-xs-2 col-xs-offset-1"><i className="fa fa-3x">+</i></div>
				<div className="col-xs-8 col-xs-offset-0">UPLOAD NEW</div>
				</div>
				</div>
				<div id="uploadData"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().dataupload.dataUploadShowModal} onHide={this.closePopup.bind(this)}>
				<Modal.Header closeButton>
				<h3 className="modal-title">Upload Data</h3>
				</Modal.Header>
				<Modal.Body>
				<Tab.Container id="left-tabs-example" defaultActiveKey="first">
				<Row className="clearfix">
				<Col sm={3}>
				<Nav bsStyle="pills" stacked>
				<NavItem eventKey="first">
				File Upload
				</NavItem>
				<NavItem eventKey="second">
				MySQL
				</NavItem>
				</Nav>
				</Col>
				<Col sm={9}>
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
				 <div className="dropzone">
		          <Dropzone onDrop={this.onDrop}>
		            <p>Try dropping some files here, or click to select files to upload.</p>
		          </Dropzone>
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
				<Button className="btn btn-primary md-close" onClick={this.closePopup.bind(this)}>Close</Button>
				<Button className="btn btn-primary md-close" onClick={this.closePopup.bind(this)}>Upload</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>

		)
	}
	
}	  