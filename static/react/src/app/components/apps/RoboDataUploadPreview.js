import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview} from "../../actions/dataActions";
import {clearDataPreview,updateRoboUploadTab} from "../../actions/appActions";
import {RoboDUTabsContent} from "./RoboDUTabsContent";
import {RoboDUHistorialData} from "./RoboDUHistorialData";
import {RoboDUExternalData} from "./RoboDUExternalData";

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


export class RoboDataUploadPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  this.props.dispatch(updateRoboUploadTab(1));
  }

  handleTabSelect(key){
	  this.props.dispatch(clearDataPreview());
	  this.props.dispatch(updateRoboUploadTab(key))
	  if(key == 1)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.customerDataset_slug))
	  if(key == 2)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.historialDataset_slug))
	  if(key == 3)
	  this.props.dispatch(getDataSetPreview(store.getState().apps.externalDataset_slug))
  }
 
  render() {
    console.log("apps is called##########3");
    return (
    		<div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} onSelect={this.handleTabSelect.bind(this)} id="controlled-tab-example" >
            <Tab eventKey={1} title="Customer Data"><RoboDUTabsContent /></Tab>
            <Tab eventKey={2} title="Historial Data"><RoboDUTabsContent /></Tab>
            <Tab eventKey={3} title="External Data"><RoboDUTabsContent /></Tab>
          </Tabs>
        </div>
        </div>
      );
  }
}
