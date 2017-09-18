import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {DataPreview} from "../data/DataPreview";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";
import {clearDataPreview,updateRoboUploadTab,updateRoboAnalysisData,getRoboDataset} from "../../actions/appActions";
import {RoboDUTabsContent} from "./RoboDUTabsContent";
import {RoboDUHistorialData} from "./RoboDUHistorialData";
import {RoboDUExternalData} from "./RoboDUExternalData";
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {isEmpty,CUSTOMER,HISTORIAL,EXTERNAL} from "../../helpers/helper";

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
		roboSummary:store.apps.roboSummary,
		};
})


export class RoboDataUploadPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
	  this.props.dispatch(storeSignalMeta(null,this.props.match.url));
	  if(isEmpty(this.props.roboSummary)){
		   if(this.props.match.params.tabName == undefined){
			   this.props.dispatch(updateRoboUploadTab(CUSTOMER));
			   this.props.dispatch(getRoboDataset(this.props.match.params.roboSlug));
		   }else{
			   this.props.dispatch(updateRoboUploadTab(this.props.match.params.tabName))
				  this.props.dispatch(getRoboDataset(this.props.match.params.roboSlug));
				  this.props.dispatch(getDataSetPreview(this.props.match.params.slug))
				  this.props.history.push("/apps-robo-list/"+this.props.match.params.roboSlug+"/"+this.props.match.params.tabName+"/data/"+this.props.match.params.slug)  
		   }
	  }
	 // this.props.dispatch(updateRoboAnalysisData(store.getState().apps.roboSummary.data,"/apps-robo"));
  }

  handleTabSelect(key){
	  this.props.dispatch(clearDataPreview());
	  this.props.dispatch(updateRoboUploadTab(key))
	  if(key == CUSTOMER){
		  this.props.match.params.slug = store.getState().apps.customerDataset_slug;
		  this.props.dispatch(getDataSetPreview(store.getState().apps.customerDataset_slug))
		   this.props.history.push("/apps-robo-list/" + store.getState().apps.roboDatasetSlug+"/customer/data/"+store.getState().apps.customerDataset_slug)
	  }
	  if(key == HISTORIAL){
		  this.props.match.params.slug = store.getState().apps.historialDataset_slug;
		  this.props.dispatch(getDataSetPreview(store.getState().apps.historialDataset_slug))  
		   this.props.history.push("/apps-robo-list/" + store.getState().apps.roboDatasetSlug+"/historial/data/"+store.getState().apps.historialDataset_slug)
	  }
	  if(key == EXTERNAL){
		  this.props.match.params.slug = store.getState().apps.externalDataset_slug;
		  this.props.history.push("/apps-robo-list/" + store.getState().apps.roboDatasetSlug+"/external/data/"+store.getState().apps.externalDataset_slug)
		  this.props.dispatch(getDataSetPreview(store.getState().apps.externalDataset_slug))
	  }
  
        $(".tab-div").empty();
        ReactDOM.render(<Provider store={store}><RoboDUTabsContent history={this.props.history} match={this.props.match}/></Provider>, document.getElementById(key));
  }
   componentDidMount(){
	    ReactDOM.render(<Provider store={store}><RoboDUTabsContent history={this.props.history} match={this.props.match}/></Provider>, document.getElementById(store.getState().apps.roboUploadTabId));
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
            <Tabs activeKey={store.getState().apps.roboUploadTabId} onSelect={this.handleTabSelect.bind(this)} id="controlled-tab-example" >
            <Tab eventKey={CUSTOMER} title="Customer Data"><div class="tab-div" id={CUSTOMER}></div></Tab>
            <Tab eventKey={HISTORIAL} title="Historial Data"><div class="tab-div" id={HISTORIAL}></div></Tab>
            <Tab eventKey={EXTERNAL} title="External Data"><div  class="tab-div" id={EXTERNAL}></div></Tab>
          </Tabs>
        </div>
        </div>
      );
  }
}
