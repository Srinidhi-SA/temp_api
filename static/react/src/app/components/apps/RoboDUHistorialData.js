import React from "react";
import {DataPreview} from "../data/DataPreview";
import store from "../../store";
import {connect} from "react-redux";
import {STATIC_URL} from "../../helpers/env.js"

@connect((store) => {
	return {
		dataPreview: store.datasets.dataPreview,
		customerDataset_slug:store.apps.customerDataset_slug,
		historialDataset_slug:store.apps.historialDataset_slug,
		externalDataset_slug:store.apps.externalDataset_slug,
		};
})


export class RoboDUHistorialData extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
     let dataPreview = store.getState().datasets.dataPreview;
    		if(dataPreview){
    			return (   <div className="apps_tabs_content">
    	            <DataPreview />
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
