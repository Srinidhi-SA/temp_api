import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {updateCreateStockPopup} from "../../actions/appActions";


@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		appsCreateStockModal:store.apps.appsCreateStockModal,
		};
})

export class AppsCreateStockAnalysis extends React.Component {
	constructor(props) {
		super(props);
		this.selectedData="";
		this._link = "";
	}
	componentWillMount() {
		this.props.dispatch(updateCreateStockPopup(false));
	}
	updateCreateStockPopup(flag){
    	this.props.dispatch(updateCreateStockPopup(flag))
    }
	render() {
		 console.log("apps create score list is called##########3");
		
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.updateCreateStockPopup.bind(this,true)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-12 text-center">Analyze</div>
				</div>
				</div>
				
				<div id="newCreateStock"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().apps.appsCreateStockModal} onHide={this.updateCreateStockPopup.bind(this,false)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Crawling Input</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
	              <label>Enter Url : </label>
	              <input type="text" name="createStock" id="createStock"  required={true} className="form-control input-sm" />
				 <br/>
	              <label>Enter Text/Symbols to Analyze:</label>
				  
	              
	              </div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.updateCreateStockPopup.bind(this,false)}>Close</Button>
                <Button bsStyle="primary" onClick={this.updateCreateStockPopup.bind(this,false)}>Create</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>


		)
	}

}	  