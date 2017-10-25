import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {updateUploadStockPopup,uploadStockFiles,triggerStockAnalysis} from "../../actions/appActions";


@connect((store) => {
	return {login_response: store.login.login_response, 
		stockUploadDomainModal:store.apps.stockUploadDomainModal,
		stockUploadDomainFiles:store.apps.stockUploadDomainFiles,
		stockSlug:store.apps.stockSlug};
})

export class StockUploadDomainModel extends React.Component {
	constructor(props) {
		super(props);
		this.onDrop = this.onDrop.bind(this);
	}
  
    updateUploadStockPopup(flag){
    	this.props.dispatch(updateUploadStockPopup(flag))
    }
    triggerStockAnalysis(){
    	this.props.dispatch(triggerStockAnalysis(store.getState().apps.stockSlug))
    }
    onDrop(files) {
	 this.props.dispatch(uploadStockFiles(files))
	}
	
	render() {
		var fileName = "";
		var fileSize = "";
		if(this.props.stockUploadDomainFiles[0]){
			fileName = this.props.stockUploadDomainFiles[0].name;
			fileSize = this.props.stockUploadDomainFiles[0].size;	
		}
			return (
					
					<div id="uploadDomainModel"  role="dialog" className="modal fade modal-colored-header">
					<Modal show={store.getState().apps.stockUploadDomainModal} onHide={this.updateUploadStockPopup.bind(this,false)} dialogClassName="modal-colored-header uploadData">
					<Modal.Header closeButton>
					<h3 className="modal-title">Build Domain Model</h3>
					</Modal.Header>
					<Modal.Body>
				    <div className="row">
					<div className="col-md-9">
				    <div className="xs-pt-20"></div>
					<div className="stockDropzone">
					<Dropzone id={1} onDrop={this.onDrop} accept=".csv" >
					<p>Try dropping some files here, or click to select files to upload.</p>
					</Dropzone>
					<aside>
			          <ul className={fileName != "" ? "list-unstyled bullets_primary":"list-unstyled"}>
			            	<li>{fileName}{fileName != "" ? " - ":""}{fileSize}{fileName != "" ? " bytes ":""}</li>
			          </ul>
			        </aside>
					</div>
					</div>
					{/*  <div className="col-md-2 xs-pt-20">
					<Button>Upload</Button>
					</div> */}
				</div>
					</Modal.Body>
					<Modal.Footer>
					<Button onClick={this.updateUploadStockPopup.bind(this,false)}>Close</Button>
				    <Button bsStyle="primary" onClick={this.triggerStockAnalysis.bind(this)}>Analyse</Button>
					</Modal.Footer>
					</Modal>
					</div>

			)
		}
	
}	  