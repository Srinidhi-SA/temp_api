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
		dataList: store.datasets.dataList,
		dataPreview: store.datasets.dataPreview,
		dataUploadLoaderModal:store.datasets.dataUploadLoaderModal,
		dULoaderValue:store.datasets.dULoaderValue,
	};
})

export class DataUploadLoader extends React.Component {
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
      	<Modal show={store.getState().datasets.dataUploadLoaderModal} onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Body>
		<div className="row">
		<div className="col-md-12">
		<div className="panel">
			<div className="panel-body">
				<p className="text-center"><br/>
				<i className="pe-7s-science pe-spin pe-5x pe-va text-primary" ></i><br/>
				<br/>
				Please wait while<br/>mAdvisor is uploading your data.....
				</p><br/>
			
				<div className="p_bar_body">
				<progress className="prg_bar" value={store.getState().datasets.dULoaderValue} max={95}></progress>
				<div className="progress-value"><h3>{store.getState().datasets.dULoaderValue} %</h3></div>
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
