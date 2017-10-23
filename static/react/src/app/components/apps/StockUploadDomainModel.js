import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {updateUploadStockPopup} from "../../actions/appActions";


@connect((store) => {
	return {login_response: store.login.login_response, stockUploadDomainModal:store.apps.stockUploadDomainModal};
})

export class StockUploadDomainModel extends React.Component {
	constructor(props) {
		super(props);
	}
  
    updateUploadStockPopup(flag){
    	this.props.dispatch(updateUploadStockPopup(flag))
    }
	
	render() {
			return (
					
					<div id="uploadDomainModel"  role="dialog" className="modal fade modal-colored-header">
					<Modal show={store.getState().apps.stockUploadDomainModal} onHide={this.updateUploadStockPopup.bind(this,false)} dialogClassName="modal-colored-header uploadData">
					<Modal.Header closeButton>
					<h3 className="modal-title">Build Domain Model</h3>
					</Modal.Header>
					<Modal.Body>
				Testing..
					</Modal.Body>
					<Modal.Footer>
					<Button onClick={this.updateUploadStockPopup.bind(this,false)}>Close</Button>
				    <Button bsStyle="primary" onClick={this.updateUploadStockPopup.bind(this,false)}>Analyse</Button>
					</Modal.Footer>
					</Modal>
					</div>

			)
		}
	
}	  