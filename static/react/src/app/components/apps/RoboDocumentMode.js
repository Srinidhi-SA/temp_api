import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsModelSummary,getRoboDataset} from "../../actions/appActions";
import {storeSignalMeta,hideDataPreview} from "../../actions/dataActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";

@connect((store) => {
	return {login_response: store.login.login_response, 
		currentAppId:store.apps.currentAppId,
		roboUploadTabId:store.apps.roboUploadTabId,
		signal: store.signals.signalAnalysis,
		roboDatasetSlug:store.apps.roboDatasetSlug,
		};
})


export class RoboDocumentMode extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
		this.props.dispatch(hideDataPreview());
		  if (isEmpty(this.props.signal)) {
			  this.props.dispatch(getRoboDataset(this.props.match.params.slug));
		}
	}

  render() {
    console.log("apps Robo Detail View is called##########3");
 
    
    const roboSummary = store.getState().signals.signalAnalysis;
	if (!$.isEmptyObject(roboSummary)) {
		let firstSlug = this.props.signal.slug;
	    let cardModeLink = "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/"+ firstSlug;
		console.log(this.props)
		let listOfCardList = getListOfCards(roboSummary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
			 return (<Card key={i} cardData={data} />)
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd documentModeSpacing ">
		                    <div className="panel-heading">
		                      <h2>{store.getState().apps.roboSummary.name}</h2>
		                     
		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group btn-space">
		                        <Link className="tabs-control right grp_legends_green continue" to={cardModeLink}>
		                          <button type="button" className="btn btn-default" title="Card mode">
		                            <i class="zmdi zmdi-hc-lg zmdi-view-stream"></i>
		                          </button>
		                          </Link>
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                              <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
		                            </button>
							   <Link className="continue" to="/apps-robo">
		                          <button type="button" className="btn btn-close">
		                            <i class="fa zmdi-hc-lg fa-times"></i>
		                          </button>
								 </Link>
		                        </div>
		                      </div>
		                      
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

		                    </div>
		                   
		             </div>
		                    </div>
		                  </div>
		                </div>
		              </div>
		  
		             
			           
			          </div>
			      );	
		}
	}

	else{
		return (
	
		      <div className="side-body">
		        <div className="page-head">
		        </div>
		        <div className="main-content">
		          <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
		        </div>
		      </div>
		    );
	}
    
  }
}
