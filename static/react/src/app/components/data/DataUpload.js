import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {open,close,fileUpload,dataUpload} from "../../actions/dataUploadActions";
import {DataSourceList} from "./DataSourceList";

@connect((store) => {
	return {login_response: store.login.login_response, showModal:store.dataUpload.dataUploadShowModal,
	fileDataUpload:store.dataUpload.fileUpload};
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
		console.log("File Dropped"+this.props);
		this.props.dispatch(fileUpload(files[0]))
	}
	uploadData(){
		this.props.dispatch(dataUpload())
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
					<Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)}>
					<Modal.Header closeButton>
					<h3 className="modal-title">Upload Data</h3>
					</Modal.Header>
					<Modal.Body>
					<DataSourceList/>
					</Modal.Body>
					<Modal.Footer>
					<Button className="btn btn-primary md-close" onClick={this.closePopup.bind(this)}>Close</Button>
					<Button className="btn btn-primary md-close" onClick={this.uploadData.bind(this)}>Upload</Button>
					</Modal.Footer>
					</Modal>
					</div>
					</div>

			)
		}
	
}	  