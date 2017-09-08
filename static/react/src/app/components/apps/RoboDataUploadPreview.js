import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";
import {clearDataPreview,updateRoboUploadTab,updateRoboAnalysisData} from "../../actions/appActions";
import {RoboDUTabsContent} from "./RoboDUTabsContent";
import {RoboDUHistorialData} from "./RoboDUHistorialData";
import {RoboDUExternalData} from "./RoboDUExternalData";
import ReactDOM from 'react-dom';
import {Provider} from "react-redux"

@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		dataPreview: store.datasets.dataPreview,
		customerDataset_slug:store.apps.customerDataset_slug,
		historialDataset_slug:store.apps.historialDataset_slug,
		externalDataset_slug:store.apps.externalDataset_slug,
		roboUploadTabId:store.apps.roboUploadTabId,
		signal: store.signals.signalAnalysis,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		};
})


export class RoboDataUploadPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  this.props.dispatch(updateRoboUploadTab(1));
	  this.props.dispatch(storeSignalMeta(null,this.props.match.url));
	 // this.props.dispatch(updateRoboAnalysisData(store.getState().apps.roboSummary.data,"/apps-robo"));
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
  
        $(".tab-div").empty();
        ReactDOM.render(<Provider store={store}><RoboDUTabsContent history={this.props.history}/></Provider>, document.getElementById(key));
  }
   componentDidMount(){
	    ReactDOM.render(<Provider store={store}><RoboDUTabsContent history={this.props.history}/></Provider>, document.getElementById("1"));
   }
   
   componentDidUpdate(){
	   		$(function(){
			let initialCol= $(".cst_table td").first();
			let initialColCls = $(initialCol).attr("class");
			$(" td."+initialColCls).addClass("activeColumn");

			$(".cst_table td,.cst_table th").click(function(){
				$(".cst_table td").removeClass("activeColumn");
				let cls = $(this).attr("class");
				if(cls.indexOf(" ") !== -1){
					let tmp =[];
					tmp = cls.split(" ");
					cls = tmp[0];
				}
				$(" td."+cls).addClass("activeColumn");
			});
			
			

		});
   }
  render() {
    console.log("apps is called##########3");
    return (
    		<div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} onSelect={this.handleTabSelect.bind(this)} id="controlled-tab-example" >
            <Tab eventKey={1} title="Customer Data"><div class="tab-div" id={1}></div></Tab>
            <Tab eventKey={2} title="Historial Data"><div class="tab-div" id={2}></div></Tab>
            <Tab eventKey={3} title="External Data"><div  class="tab-div" id={3}></div></Tab>
          </Tabs>
        </div>
        </div>
      );
  }
}
