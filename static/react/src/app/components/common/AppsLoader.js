import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {openAppsLoaderValue,closeAppsLoaderValue} from "../../actions/appActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {STATIC_URL} from "../../helpers/env";


@connect((store) => {
	return {login_response: store.login.login_response,
		appsLoaderModal:store.apps.appsLoaderModal,
		appsLoaderPerValue:store.apps.appsLoaderPerValue,
		appsLoaderText:store.apps.appsLoaderText,
		appsLoaderImage:store.apps.appsLoaderImage,
	};
})

export class AppsLoader extends React.Component {
  constructor(){
    super();
  }
	openModelPopup(){
  	this.props.dispatch(openAppsLoaderValue())
  }
  closeModelPopup(){
  	this.props.dispatch(closeAppsLoaderValue())
  }
  render() {
		let img_src=STATIC_URL+store.getState().apps.appsLoaderImage
   return (
          <div id="dULoader">
      	<Modal show={store.getState().apps.appsLoaderModal} backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Body>
		<div className="row">
		<div className="col-md-12">
		<div className="panel">
			<div className="panel-body no-border">
				<h4 className="text-center"><br/>
				<img src={img_src} />
				<br/>
				<br/>
				{store.getState().apps.appsLoaderText}
				</h4><br/>

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
