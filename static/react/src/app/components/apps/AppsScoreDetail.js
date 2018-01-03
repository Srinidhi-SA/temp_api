import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsScoreSummary,getScoreSummaryInCSV} from "../../actions/appActions";
import {Button} from "react-bootstrap";
import {STATIC_URL,EMR} from "../../helpers/env.js";
import {isEmpty} from "../../helpers/helper";
import {API} from "../../helpers/env";
import {Link} from "react-router-dom";


@connect((store) => {
	return {login_response: store.login.login_response, 
		scoreList:store.apps.scoreList,scoreSummary:store.apps.scoreSummary,
		scoreSlug:store.apps.scoreSlug,
		};
})


export class AppsScoreDetail extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
      //It will trigger when refresh happens on url
      if(isEmpty(this.props.scoreSummary)){
          this.props.dispatch(getAppsScoreSummary(this.props.match.params.slug));   
      }
  }
  componentDidMount() {
	  if(!isEmpty(store.getState().apps.scoreSummary)){
		  if(store.getState().apps.scoreSummary.slug != store.getState().apps.scoreSlug)
		  this.props.dispatch(getAppsScoreSummary(store.getState().apps.scoreSlug));
	  }else{
		  this.props.dispatch(getAppsScoreSummary(store.getState().apps.scoreSlug));
	  }
	
  }
  gotoScoreData(){
      this.props.dispatch(getScoreSummaryInCSV(store.getState().apps.scoreSlug))
  }
  render() {
    console.log("apps Score Detail View is called##########3");
    const scoreSummary = store.getState().apps.scoreSummary;
    const scoreLink = "/apps/"+store.getState().apps.currentAppId+"/scores";
    const scoreDataLink = "/apps/"+store.getState().apps.currentAppId+"/scores/"+store.getState().apps.scoreSlug+"/dataPreview";
    console.log(scoreSummary)
	if (!$.isEmptyObject(scoreSummary)) {
		console.log(this.props)
		let listOfCardList = getListOfCards(scoreSummary.data.listOfCards)
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
		                      <h2 className="pull-left">{store.getState().apps.scoreSummary.name}</h2>
		                      
		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group btn-space">
		                        
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                               <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
		                            </button>
							   <Link className="continue btn btn-default" to={scoreLink}>
		                          
		                            <i class="zmdi zmdi-hc-lg zmdi-close"></i>
		                          
								 </Link>
		                        </div>
		                      </div>
		                      
		                      
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body no-border">
		                   <div className="row-fluid"> 
		           
		                  {cardDataList}

		                    </div>
		                    
		                    
		                    <div className="row">		                   
		                    <div className="col-md-12 text-right">
		                   	<Link to={scoreDataLink} onClick={this.gotoScoreData.bind(this)} className="btn btn-primary xs-pr-10"> View </Link>
		                    	<a  href={''+EMR+'/'+store.getState().apps.scoreSlug+'/data.csv'}id="download" className="btn btn-primary" download>Download</a>
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
