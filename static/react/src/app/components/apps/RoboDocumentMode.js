import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getRoboDataset} from "../../actions/appActions";
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
    const roboSummary = store.getState().signals.signalAnalysis;
	 if (!$.isEmptyObject(roboSummary)) {
		let firstSlug = this.props.signal.slug;
	  let cardModeLink = "/apps-robo/" + store.getState().apps.roboDatasetSlug + "/"+ firstSlug;
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
								<h3 className="xs-mt-0">{store.getState().apps.roboSummary.name}
							  
							    <div className="btn-toolbar pull-right">
		                        <div className="btn-group btn-space">
		                        <Link className="tabs-control right grp_legends_green continue" to={cardModeLink}>
		                          <button type="button" className="btn btn-default" title="Card mode">
		                            <i class="zmdi zmdi-hc-lg zmdi-view-carousel"></i>
		                          </button>
		                          </Link>
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                              <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
		                            </button>
							   <Link className="continue" to="/apps-robo">
		                          <button type="button" className="btn btn-default">
		                            <i class="zmdi zmdi-hc-lg zmdi-close"></i>
		                          </button>
								 </Link>
		                        </div>
		                      </div>
							  </h3>
		                     	                      
		                      <div className="clearfix"></div>
		                <div className="panel panel-mAd documentModeSpacing box-shadow">

		                     
		                   <div className="panel-body no-border">
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
