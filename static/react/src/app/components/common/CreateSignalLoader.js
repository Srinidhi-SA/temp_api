import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {openCsLoaderModal,closeCsLoaderModal} from "../../actions/createSignalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';


@connect((store) => {
	return {login_response: store.login.login_response,
		createSignalLoaderModal:store.signals.createSignalLoaderModal,
		createSignalLoaderValue:store.signals.createSignalLoaderValue,
		loaderText:store.signals.loaderText,
	};
})

export class CreateSignalLoader extends React.Component {
  constructor(){
    super();
  }
	openModelPopup(){
  	this.props.dispatch(openCsLoaderModal())
  }
  closeModelPopup(){
  	this.props.dispatch(closeCsLoaderModal())
  }
  render() {
   return (
          <div id="createSignalLoader">

      	<Modal show={store.getState().signals.createSignalLoaderModal}  backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Body>
    	<div className="row">
		<div className="col-md-12">
		<div className="panel">
			<div className="panel-body">
			
			<h4 className="text-center"><br/>
			<img src="/assets/images/brain_loading.gif" /><br/>
			<br/>
			{store.getState().signals.loaderText}
			</h4><br/>
			
			<div className="p_bar_body">
			<progress className="prg_bar" value={store.getState().signals.createSignalLoaderValue} max={95}></progress>
			<div className="progress-value"><h3>{store.getState().signals.createSignalLoaderValue} %</h3></div>
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
