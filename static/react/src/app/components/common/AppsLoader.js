import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import {Link} from "react-router-dom";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {openAppsLoaderValue,closeAppsLoaderValue,clearAppsCreateModel} from "../../actions/appActions";
import {hideDataPreview} from "../../actions/dataActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {STATIC_URL} from "../../helpers/env";
import {handleJobProcessing} from "../../helpers/helper";


@connect((store) => {
	return {login_response: store.login.login_response,
		appsLoaderModal:store.apps.appsLoaderModal,
		appsLoaderPerValue:store.apps.appsLoaderPerValue,
		appsLoaderText:store.apps.appsLoaderText,
		appsLoaderImage:store.apps.appsLoaderImage,
		currentAppId: store.apps.currentAppId,
    modelSlug: store.apps.modelSlug,
		updateCreateModelHideShow:store.apps.updateCreateModelHideShow
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
		this.props.dispatch(hideDataPreview());
  	this.props.dispatch(closeAppsLoaderValue());
		clearAppsCreateModel();
  }
  cancelCreateModel(){
	   this.props.dispatch(handleJobProcessing(this.props.modelSlug));
	   clearAppsCreateModel();
	   this.props.dispatch(closeAppsLoaderValue())
  }
  render() {
		let img_src=STATIC_URL+store.getState().apps.appsLoaderImage;
		if((this.props.match.url).indexOf("createModel") > 0)
		var backUrl = "/apps/"+store.getState().apps.currentAppId+"/models/data/"+this.props.match.params.slug+"/createModel";
		else
		var backUrl = "/apps/"+store.getState().apps.currentAppId+"/models";
		let modelUrl = "/apps/"+store.getState().apps.currentAppId+"/models";
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
		 {(this.props.updateCreateModelHideShow)
            ? (
		<Modal.Footer>
                <div>
                  <Link to={backUrl} style={{
                    paddingRight: "10px"
                  }} >
                    <Button onClick={this.cancelCreateModel.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to={modelUrl} >
                   <Button bsStyle="primary" onClick={this.closeModelPopup.bind(this)}>Hide</Button>
                   </Link>
                </div>
              </Modal.Footer>
			   )
            : (
              <div></div>
            )
}
		</Modal>
          </div>
       );
  }
}
