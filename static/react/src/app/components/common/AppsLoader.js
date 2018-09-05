import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import {Link} from "react-router-dom";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {openAppsLoaderValue,closeAppsLoaderValue,clearAppsIntervel,updateModelSummaryFlag,reSetRegressionVariables} from "../../actions/appActions";
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
		updateCreateModelHideShow:store.apps.updateCreateModelHideShow,
		scoreSlug:store.apps.scoreSlug,
		stockSlug:store.apps.stockSlug,
		roboDatasetSlug:store.apps.roboDatasetSlug,
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
		this.props.dispatch(updateModelSummaryFlag(false));
		this.props.dispatch(hideDataPreview());
  	this.props.dispatch(closeAppsLoaderValue());
		clearAppsIntervel();
		//if(this.props.app_type == "REGRESSION")
    //this.props.dispatch(reSetRegressionVariables());
  }
  cancelCreateModel(){
		this.props.dispatch(updateModelSummaryFlag(false));
		this.props.dispatch(hideDataPreview());
		if((this.props.match.url).indexOf("/createScore") > 0 || (this.props.match.url).indexOf("/scores") > 0)
		this.props.dispatch(handleJobProcessing(this.props.scoreSlug));
		else if((this.props.match.url).indexOf("/apps-stock-advisor") >=0 )
		this.props.dispatch(handleJobProcessing(this.props.stockSlug));
		else if((this.props.match.url).indexOf("/apps-robo") >=0 )
		this.props.dispatch(handleJobProcessing(this.props.roboDatasetSlug));
		else
		this.props.dispatch(handleJobProcessing(this.props.modelSlug));
		this.props.dispatch(closeAppsLoaderValue());
		clearAppsIntervel();
	}
  render() {
		let img_src=STATIC_URL+store.getState().apps.appsLoaderImage;
		var hideUrl = "";
		if(this.props.match && (this.props.match.url).indexOf("/createModel") > 0 || this.props.match && (this.props.match.url).indexOf("/createScore") > 0)
		store.getState().apps.currentAppDetails != null ? hideUrl = "/"+store.getState().apps.currentAppDetails.app_url:hideUrl = "/apps/"+store.getState().apps.currentAppId+"/models";
		else if((this.props.match.url).includes("/apps-stock-advisor-analyze"))hideUrl = "/apps-stock-advisor";
		else
		hideUrl = this.props.match.url;
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
				{store.getState().apps.appsLoaderPerValue >= 0?<h2 class="loaderValue">{store.getState().apps.appsLoaderPerValue}%</h2>:<h5 class="loaderValue" style={{display:"block", textAlign: "center", paddingTop: "15px" }}>In Progress</h5>} 
				<br/>
				{store.getState().apps.appsLoaderText}
				</h4><br/>

				{/*store.getState().apps.appsLoaderPerValue >= 0 ?<div className="p_bar_body">
				<progress className="prg_bar" value={store.getState().apps.appsLoaderPerValue} max={95}></progress>
				<div className="progress-value"><h3>{store.getState().apps.appsLoaderPerValue} %</h3></div>
				</div>:""*/}
			</div>
		</div>
		</div>
	</div>
		</Modal.Body>
		 {(this.props.updateCreateModelHideShow)
            ? (
		<Modal.Footer>
                <div>
                  <Link to={this.props.match.url} style={{
                    paddingRight: "10px"
                  }} >
                    <Button onClick={this.cancelCreateModel.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to={hideUrl} >
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
