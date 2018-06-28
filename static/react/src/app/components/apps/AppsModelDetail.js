import React from "react";
import {connect} from "react-redux";
import store from "../../store";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab,Button} from "react-bootstrap";
import {AppsCreateScore} from "./AppsCreateScore";
import {Card} from "../signals/Card";
import {getListOfCards,getAppsModelSummary,updateModelSlug,handleExportAsPMMLModal,getAppDetails,updateModelSummaryFlag} from "../../actions/appActions";
import {storeSignalMeta} from "../../actions/dataActions";
import CircularProgressbar from 'react-circular-progressbar';
import {STATIC_URL} from "../../helpers/env.js"
import {isEmpty} from "../../helpers/helper";
import {Link} from "react-router-dom";
import {ExportAsPMML} from "./ExportAsPMML";

@connect((store) => {
	return {login_response: store.login.login_response,
		modelList:store.apps.modelList,modelSummary:store.apps.modelSummary,
		modelSlug:store.apps.modelSlug,
		currentAppId:store.apps.currentAppId,
		currentAppDetails:store.apps.currentAppDetails,
		};
})


export class AppsModelDetail extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		if(this.props.currentAppDetails == null)
		this.props.dispatch(getAppDetails(this.props.match.params.AppId));
		//It will trigger when refresh happens on url
		if(isEmpty(this.props.modelSummary)){
		    this.props.dispatch(getAppsModelSummary(this.props.match.params.slug));
		    this.props.dispatch(updateModelSlug(this.props.match.params.slug));
		}

	}

  print() {
    window.print();
  }
  componentDidMount() {
		window.scrollTo(0, 0);
	  if(!isEmpty(store.getState().apps.modelSummary)){
		  if(store.getState().apps.modelSummary.slug != store.getState().apps.modelSlug)
		  this.props.dispatch(getAppsModelSummary(store.getState().apps.modelSlug));
	  }

  }
  componentDidUpdate(){
      $(".chart-data-icon").next("div").next("div").removeClass("col-md-7 col-md-offset-2").addClass("col-md-10")
  }
  handleExportAsPMMLModal(flag){
      this.props.dispatch(handleExportAsPMMLModal(flag))
  }
  updateModelSummaryFlag(flag){
      this.props.dispatch(updateModelSummaryFlag(flag))
  }
	showMore(evt){
			evt.preventDefault();
			$.each(evt.target.parentElement.children,function(k1,v1){
				$.each(v1.children,function(k2,v2){
					if(v2.className == "modelSummery hidden")
					v2.className = "modelSummery";
					else if(v2.className == "modelSummery")
					v2.className = "modelSummery hidden";
				})
			});
		if(evt.target.innerHTML == "Show More")
		evt.target.innerHTML = "Show Less";
		else
		evt.target.innerHTML = "Show More";
	}
  render() {
    console.log("apps Model Detail View is called##########3");
  	const modelSummary = store.getState().apps.modelSummary;
	 	var showExportPmml = true;
		var showCreateScore = true;
    const modelLink = "/apps/"+this.props.match.params.AppId+"/models";
	if (!$.isEmptyObject(modelSummary)) {
		console.log(this.props)
        showExportPmml = modelSummary.permission_details.downlad_pmml;
		showCreateScore = modelSummary.permission_details.create_score;
		//if(this.props.currentAppDetails != null && this.props.currentAppDetails.app_type == "REGRESSION"){
			var listOfCardList = modelSummary.data.model_summary.listOfCards;
			var componentsWidth = 0;
			var cardDataList = listOfCardList.map((data, i) => {
				var clearfixClass = "col-md-"+data.cardWidth*0.12+" xs-p-30 clearfix";
				var nonClearfixClass = "col-md-"+data.cardWidth*0.12+" xs-p-30";
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
					return (<div className={clearfixClass}><Card cardData={cardDataArray} cardWidth={data.cardWidth}/>{isHideData.length>0?<a href="" onClick={this.showMore.bind(this)}>Show More</a>:""}</div>)
				}
				else{
					componentsWidth = componentsWidth+data.cardWidth;
									return (<div className={nonClearfixClass}><Card cardData={cardDataArray} cardWidth={data.cardWidth}/></div>)
							}
				});
		/*}
		else{
			var listOfCardList = getListOfCards(modelSummary.data.model_summary.listOfCards);
			var cardDataList = listOfCardList.map((data, i) => {
				if( i != 0 ){
					if(i%2 != 0)
					return (<div className="col-md-6 xs-p-30 clearfix"><Card cardData={data} /></div>)
					else
					return (<div className="col-md-6 xs-p-30"><Card cardData={data} /></div>)
				}
				else return (<Card key={i} cardData={data} />)
			});
		}*/
		
		if(listOfCardList){
			return (
			          <div className="side-body">

			          <div className="main-content">
			          <div className="row">
		                <div className="col-md-12">

		                <div className="panel panel-mAd documentModeSpacing box-shadow">
		                    <div className="panel-heading">
		                      <h3 className="xs-mt-0">{store.getState().apps.modelSummary.name}

		                      <div className="btn-toolbar pull-right">
		                        <div className="btn-group">
		                        <button type="button" className="btn btn-default" onClick={this.print.bind(this)} title="Print Document"><i className="fa fa-print"></i></button>
		                          <button type="button" className="btn btn-default" disabled = "true" title="Document Mode">
		                             <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
		                            </button>
							   <Link className="btn btn-default continue btn-close" to={modelLink} onClick={this.updateModelSummaryFlag.bind(this,false)}>

		                            <i class="zmdi zmdi-hc-lg zmdi-close"></i>

								 </Link>
		                        </div>
		                      </div>
		                     </h3>
		                      <div className="clearfix"></div>
		                    </div>
		                   <div className="panel-body no-border">
		                   <div className="row-fluid">

		                  {cardDataList}

		                    </div>
												<div class="row">
		                    <div className="col-md-12 text-right ">
												{showExportPmml?
		                    <Button bsStyle="primary" onClick={this.handleExportAsPMMLModal.bind(this,true)}>Export As PMML</Button>:""}
		                  	{showCreateScore? <AppsCreateScore match={this.props.match}/>:""}
		                   </div>
		                   </div>
		             </div>
		             <ExportAsPMML/>
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
