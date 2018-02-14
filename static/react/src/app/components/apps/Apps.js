import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {APPID1,APPID2,APPID3,APPNAME1,APPNAME2,APPNAME3,getUserDetailsOrRestart} from "../../helpers/helper.js"
import {activateModelScoreTabs,storeModelSearchElement,storeScoreSearchElement,getAppsModelList,getAppsScoreList,updateSelectedApp} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";

@connect((store) => {
	return {login_response: store.login.login_response,
		modelList:store.apps.modelList,currentAppId:store.apps.currentAppId,
		scoreList: store.apps.scoreList,
		activateModelScoreTabs:store.apps.activateModelScoreTabs,
		appsSelectedTabId:store.apps.appsSelectedTabId,
		};
})


export class Apps extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount(){
      /*if(this.props.match.params.AppId == APPID1){
          this.props.dispatch(updateSelectedApp(APPID1,APPNAME1)); 
      }else if(this.props.match.params.AppId == APPID2){
          this.props.dispatch(updateSelectedApp(APPID2,APPNAME2));
      }*/
      
      //checking for score and model tab
      if(this.props.match.url.indexOf("model") != -1){
          this.props.dispatch(activateModelScoreTabs("model"));
      }else if(this.props.match.url.indexOf("score") != -1){
          this.props.dispatch(activateModelScoreTabs("score"));
      }
  }
  modifyUrl(tabId){
	  this.props.dispatch(activateModelScoreTabs(tabId));
		//cleat Model Filters
		this.props.dispatch(storeModelSearchElement(""));
		this.props.dispatch(getAppsModelList(1));
		//clear score Filters
		this.props.dispatch(storeScoreSearchElement(""));
		this.props.dispatch(getAppsScoreList(1));
	  if(tabId == "score"){
		  this.props.history.push('/apps/'+this.props.match.params.AppId+'/scores')  
	  }else{
		  this.props.history.push('/apps/'+this.props.match.params.AppId+'/models')   
	  }
  }
  render() {
    console.log("apps is called##########3");
    console.log(this.props);
    if(store.getState().apps.modelSummaryFlag){
            let _link = "/apps/"+store.getState().apps.currentAppId+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
   let models = <AppsModelList history={this.props.history} match={this.props.match}/>

  let scores = <AppsScoreList history={this.props.history} match={this.props.match}/>

    return (
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey="score" activeKey={store.getState().apps.appsSelectedTabId} onSelect={this.modifyUrl.bind(this)} className="apps_list">
            <Tab  eventKey="model" id="model" title="Models">{models}</Tab>
            <Tab eventKey="score" id="score" title="Scores">{scores}</Tab>
          </Tabs>
          <AppsLoader match={this.props.match}/>
          </div>
        </div>
      );
  }
}
