import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview} from "../../actions/dataActions";
import {STATIC_URL} from "../../helpers/env.js"
import {clearDataPreview,updateRoboUploadTab} from "../../actions/appActions";

@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		customerDataset_slug:store.apps.customerDataset_slug,
		historialDataset_slug:store.apps.historialDataset_slug,
		externalDataset_slug:store.apps.externalDataset_slug,
		roboUploadTabId:store.apps.roboUploadTabId
		};
})


export class RoboDUTabsContent extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
  }
  render() {
    console.log("robo is called##########3");
    //This should be called only once
    /*if(store.getState().apps.customerDataset_slug && store.getState().apps.roboUploadTabId == 1){
		  this.props.dispatch(getDataSetPreview(store.getState().apps.customerDataset_slug));
		  this.props.dispatch(updateRoboUploadTab(2))
	  }*/
     let dataPreview = store.getState().datasets.dataPreview;
    		if(dataPreview){
    			return (   <div className="apps_tabs_content">
    	            <DataPreview history={this.props.history} match={this.props.match}/>
    	        </div>
    	        );
    		}else{
    			return (
 					   <div>
 			            <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif"} />
 			          </div>
 			);
    		}
       
      
  }
}
