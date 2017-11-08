import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsModelSummary} from "../../actions/appActions";
import {storeSignalMeta} from "../../actions/dataActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";
import {Link} from "react-router-dom";

@connect((store) => {
	return {login_response: store.login.login_response, 
		modelList:store.apps.modelList,modelSummary:store.apps.modelSummary,
		modelSlug:store.apps.modelSlug,
		currentAppId:store.apps.currentAppId
		};
})


export class AppsModelDetail extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		//It will trigger when refresh happens on url
		if(isEmpty(this.props.modelSummary)){
		    this.props.dispatch(getAppsModelSummary(this.props.match.params.slug));   
		}
	}
  
  componentDidMount() {
	  if(!isEmpty(store.getState().apps.modelSummary)){
		  if(store.getState().apps.modelSummary.slug != store.getState().apps.modelSlug)
		  this.props.dispatch(getAppsModelSummary(store.getState().apps.modelSlug));
	  }else{
		  this.props.dispatch(getAppsModelSummary(store.getState().apps.modelSlug));
	  }
  }
  render() {
    console.log("apps Model Detail View is called##########3");
    const modelSummary = store.getState().apps.modelSummary;
    const modelLink = "/apps/"+store.getState().apps.currentAppId+"/models";
	if (!$.isEmptyObject(modelSummary)) {
		console.log(this.props)
		let listOfCardList = getListOfCards(modelSummary.data.model_summary.listOfCards)
		let cardDataList = listOfCardList.map((data, i) => {
			if( i != 0){
				if(i%2 != 0)
				return (<div className="col-md-6 xs-p-30 clearfix"><Card cardData={data} /></div>)
				else
				return (<div className="col-md-6 xs-p-30"><Card cardData={data} /></div>)
			}
             else return (<Card key={i} cardData={data} />)
			
		                    });
		if(listOfCardList){
			return (
			          <div className="side-body">
			          
			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
		                 
		                <div className="panel panel-mAd documentModeSpacing ">
		                    <div className="panel-heading">
		                      <h2 className="pull-left">{store.getState().apps.modelSummary.name}</h2>
		                      
		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group btn-space">
		                        
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                             <i className="fa fa-file-text-o"></i>
		                            </button>
							   <Link className="continue" to={modelLink}>
		                          <button type="button" className="btn  btn-close">
		                            <i className="fa fa-times"></i>
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
		                    <div class="row">
		                    <div className="col-md-2 col-md-offset-10">
		                   <AppsCreateScore match={this.props.match}/>
		                   </div>
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
