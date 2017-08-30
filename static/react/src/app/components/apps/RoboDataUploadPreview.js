import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview} from "../../actions/dataActions";

@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		customerDataset_slug:store.apps.customerDataset_slug,
		historialDataset_slug:store.apps.historialDataset_slug,
		externalDataset_slug:store.apps.externalDataset_slug,
		};
})


export class RoboDataUploadPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
  }
  /*componentWillMount(){
	 this.props.dispatch(getDataSetPreview(store.getState().apps.customerDataset_slug))
  }*/
  render() {
    console.log("apps is called##########3");
    console.log(this.props)
 
    return (
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} id="controlled-tab-example" >
            <Tab eventKey={1} title="Customer Data"><DataPreview /></Tab>
            <Tab eventKey={2} title="Historial Data"><DataPreview /></Tab>
            <Tab eventKey={3} title="External Data"><DataPreview /></Tab>
          </Tabs>
          </div>
        </div>
      );
  }
}
