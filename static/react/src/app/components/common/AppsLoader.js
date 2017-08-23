import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {openDULoaderPopup,closeDULoaderPopup} from "../../actions/dataActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';


@connect((store) => {
	return {login_response: store.login.login_response,
		appsLoaderModal:store.apps.appsLoaderModal,
		appsLoaderPerValue:store.apps.appsLoaderPerValue,
		appsLoaderText:store.apps.appsLoaderText,
	};
})

export class AppsLoader extends React.Component {
  constructor(){
    super();
  }
	openModelPopup(){
  	this.props.dispatch(openDULoaderPopup())
  }
  closeModelPopup(){
  	this.props.dispatch(closeDULoaderPopup())
  }
  render() {
   return (
          <div id="dULoader">
      	<Modal show={store.getState().apps.appsLoaderModal} onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Body>
		<div className="row">
		<div className="col-md-12">
		<div className="panel">
			<div className="panel-body">
				<p className="text-center"><br/>
				<i className="pe-7s-science pe-spin pe-5x pe-va text-primary" ></i><br/>
				<br/>
				<h3>{store.getState().apps.appsLoaderText}</h3>
				</p><br/>
			
				<div className="p_bar_body">
				<progress className="prg_bar" value={store.getState().apps.appsLoaderPerValue} max={95}></progress>
				<div className="progress-value"><h3>{store.getState().apps.appsLoaderPerValue} %</h3></div>
				</div>
			</div>
		</div>
		</div>
	</div>
		</Modal.Body>
		</Modal>
          </div>
       );
  }
}
