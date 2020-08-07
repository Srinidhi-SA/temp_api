import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsScoreSummary,getScoreSummaryInCSV,updateScoreSlug,getAppDetails,updateScoreSummaryFlag} from "../../actions/appActions";
import {Button} from "react-bootstrap";
import {STATIC_URL,EMR} from "../../helpers/env.js";
import {isEmpty} from "../../helpers/helper";
import {API} from "../../helpers/env";
import {Link,Redirect} from "react-router-dom";


@connect((store) => {
	return {login_response: store.login.login_response,
		scoreList:store.apps.scoreList,scoreSummary:store.apps.scoreSummary,
		scoreSlug:store.apps.scoreSlug,
		currentAppDetails:store.apps.currentAppDetails,
		};
})


export class AppsScoreDetail extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
      //It will trigger when refresh happens on url
      this.props.dispatch(getAppDetails(this.props.match.params.AppId));
      if(isEmpty(this.props.scoreSummary)){
          this.props.dispatch(getAppsScoreSummary(this.props.match.params.slug));
          this.props.dispatch(updateScoreSlug(this.props.match.params.slug))
      }
  }
  componentDidMount() {
		window.scrollTo(0, 0);
	  if(!isEmpty(store.getState().apps.scoreSummary)){
		  if(store.getState().apps.scoreSummary.slug != store.getState().apps.scoreSlug)
		  this.props.dispatch(getAppsScoreSummary(store.getState().apps.scoreSlug));
	  }
  }
  gotoScoreData(){
      this.props.dispatch(getScoreSummaryInCSV(store.getState().apps.scoreSlug))
  }
  updateScoreSummaryFlag(){
      this.props.dispatch(updateScoreSummaryFlag(false));
  }
  render() {
	let scoreSummary = store.getState().apps.scoreSummary;
	let slink = window.location.pathname.includes("analyst")?"/analyst":"/autoML";
		let scoreLink = "/apps/"+this.props.match.params.AppId+ slink +"/scores";
		var scoreSlugtoDownload=(store.getState().apps.scoreSlugShared==null||store.getState().apps.scoreSlugShared==undefined)?store.getState().apps.scoreSlug:store.getState().apps.scoreSlugShared		
    let scoreDataLink = "/apps/"+this.props.match.params.AppId+ slink +"/scores/"+scoreSlugtoDownload+"/dataPreview";
    var showViewButton = true;
    var showDownloadButton = true;
		if (!$.isEmptyObject(scoreSummary)) {
	
		showViewButton = scoreSummary.permission_details.download_score;
		showDownloadButton = scoreSummary.permission_details.download_score;
		if(this.props.currentAppDetails != null && this.props.currentAppDetails.app_type == "REGRESSION"){
			var listOfCardList = scoreSummary.data.listOfCards;
			var componentsWidth = 0;
			var cardDataList = listOfCardList.map((data, i) => {
				var clearfixClass = "col-md-"+data.cardWidth*0.12+" clearfix";
				var nonClearfixClass = "col-md-"+data.cardWidth*0.12;
				if(data.centerAlign){
					var clearfixClass = "col-md-"+data.cardWidth*0.12+" clearfix cardKpi ov_card_boxes";
				var nonClearfixClass = "col-md-"+data.cardWidth*0.12+" cardKpi ov_card_boxes";
				}
				var cardDataArray = data.cardData;
				var isHideData = $.grep(cardDataArray,function(val,key){
					return(val.dataType == "html" && val.classTag == "hidden");
				});
				if(data.cardWidth == 100){
					componentsWidth = 0;
					return (<div className={clearfixClass}><Card cardData={cardDataArray} cardWidth={data.cardWidth}/></div>)
				}
				else if(componentsWidth == 0 || componentsWidth+data.cardWidth > 100){
					componentsWidth = data.cardWidth;
					return (<div className={clearfixClass}><Card cardData={cardDataArray} cardWidth={data.cardWidth}/></div>)
				}
				else{
					componentsWidth = componentsWidth+data.cardWidth;
									return (<div className={nonClearfixClass}><Card cardData={cardDataArray} cardWidth={data.cardWidth}/></div>)
							}
				});
		}
		else
		{
		var listOfCardList = getListOfCards(scoreSummary.data.listOfCards);
		
		var cardDataList = listOfCardList.map((data, i) => {

            return (<Card key={i} cardData={data} />)

		                    });
		}
		if(listOfCardList){
			let downloadURL=API+'/api/get_score_data_and_return_top_n/?url='+scoreSlugtoDownload+'&download_csv=true&count=100'
			return (
			          <div className="side-body">

			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">
							
							<h3 className="xs-mt-0">{store.getState().apps.scoreSummary.name}

							<div className="btn-toolbar pull-right">
							<div className="btn-group">

							<button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
							<i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
							</button>
							<Link className="continue btn btn-default" to={scoreLink} onClick={this.updateScoreSummaryFlag.bind(this,false)}>

							<i class="zmdi zmdi-hc-lg zmdi-close"></i>

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
		                    <div className="row">
		                    <div className="col-md-12 text-right">
		                   	{showViewButton?<Link to={scoreDataLink} onClick={this.gotoScoreData.bind(this)} className="btn btn-primary xs-pr-10"> View </Link>:""}
		                    {showDownloadButton?<a  href={downloadURL} id="download" className="btn btn-primary" download>Download</a>:""}
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
