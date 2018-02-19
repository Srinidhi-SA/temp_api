import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {open,close,fileUpload,dataUpload} from "../../actions/dataUploadActions";
import {saveFileToStore} from "../../actions/dataSourceListActions";
import {DataSourceList} from "./DataSourceList";

@connect((store) => {
	return {login_response: store.login.login_response, showModal:store.dataUpload.dataUploadShowModal,
	fileDataUpload:store.dataUpload.fileUpload,
	selectedDataset:store.datasets.selectedDataSet,
	 dataList: store.datasets.dataList,};
})

export class DataUpload extends React.Component {
	constructor(props) {
		super(props);
		this.props.dispatch(close());
		this.onDrop = this.onDrop.bind(this);
	}
    openPopup(){
    	this.props.dispatch(open());
    	var files = [{name:"",size:""}]
    	this.props.dispatch(saveFileToStore(files))
    	
    }
    closePopup(){
    	this.props.dispatch(close())
    }
	onDrop(files) {
		console.log("File Dropped"+this.props);
		this.props.dispatch(fileUpload(files[0]))
	}
	uploadData(){
		this.props.dispatch(dataUpload());	
	}
	render() {
	    var isDataUpload = this.props.dataList.permission_details.create_dataset;
	    let cls = "newCardStyle firstCard"
	    if(!isDataUpload){
	        cls += " disable-card"
	    }
			return (
					<div className="col-md-3 xs-mb-15 list-boxes" onClick={this.openPopup.bind(this)}>
					<div className={cls}>
					<div className="card-header"></div>
					<div className="card-center newStoryCard">					
					<div className="col-xs-12 text-center">+<br/><small>UPLOAD DATA</small> </div>
					</div>
					</div>
					<div id="uploadData"  role="dialog" className="modal fade modal-colored-header">
					<Modal show={store.getState().dataUpload.dataUploadShowModal} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header uploadData">
					<Modal.Header closeButton>
					<h3 className="modal-title">Upload Data</h3>
					</Modal.Header>
					<Modal.Body>
					<DataSourceList/>
					</Modal.Body>
					<Modal.Footer>
					<Button onClick={this.closePopup.bind(this)}>Close</Button>
				    <Button bsStyle="primary" onClick={this.uploadData.bind(this)}>Load Data</Button>
					</Modal.Footer>
					</Modal>
					</div>
					</div>

			)
		}
	
}	  