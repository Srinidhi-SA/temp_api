import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs, Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Button, Dropdown, Menu, MenuItem} from "react-bootstrap";

import {connect} from "react-redux";
import {
  APPID1,
  APPID2,
  APPID3,
  APPNAME1,
  APPNAME2,
  APPNAME3,
  getUserDetailsOrRestart
} from "../../helpers/helper.js"
import {
  activateModelScoreTabs,
  storeModelSearchElement,
  storeScoreSearchElement,
  getAppsModelList,
  getAppsScoreList,
  getAppsAlgoList,
  refreshAppsAlgoList,
  updateSelectedApp
} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    modelList: store.apps.modelList,
    algolist:store.algoList,
    currentAppId: store.apps.currentAppId,
    scoreList: store.apps.scoreList,
    activateModelScoreTabs: store.apps.activateModelScoreTabs,
    appsSelectedTabId: store.apps.appsSelectedTabId,
    scoreSummaryFlag: store.apps.scoreSummaryFlag,
    modelSummaryFlag: store.apps.modelSummaryFlag
  };
})

export class Apps extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  componentWillMount() {
    //checking for score and model tab
    if (this.props.match.url.indexOf("model") != -1) {
      this.props.dispatch(activateModelScoreTabs("model"));
    } else if (this.props.match.url.indexOf("score") != -1) {
      this.props.dispatch(activateModelScoreTabs("score"));
    }
  }
  modifyUrl(tabId) {
    this.props.dispatch(activateModelScoreTabs(tabId));
    //cleat Model Filters
    this.props.dispatch(storeModelSearchElement(""));
    this.props.dispatch(getAppsModelList(1));
    //clear score Filters
    this.props.dispatch(storeScoreSearchElement(""));
    this.props.dispatch(getAppsScoreList(1));
    this.props.dispatch(getAppsAlgoList(1));
    if (tabId == "score") {
      this.props.history.push('/apps/' + this.props.match.params.AppId + '/scores')
    } 
    //  else if(tabId == "algo"){
    //     this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement')
    //   }
    
    else{
      this.props.history.push('/apps/' + this.props.match.params.AppId + '/models')
    }
    // else{
    //   this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement')
    // }
  }


  proceedToModelManagement(tabId)
  {
    

    if (tabId == "score")
    {
      this.props.dispatch(getAppsAlgoList(1));
      this.props.dispatch(refreshAppsAlgoList(this.props));
     this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement');
    }else{
      this.props.dispatch(getAppsAlgoList(1));
      this.props.dispatch(refreshAppsAlgoList(this.props));
    this.props.history.push('/apps/' + this.props.match.params.AppId + '/modelManagement');
    }
  }



  render() {
    console.log("apps is called##########3");
    console.log(this.props);
    var appId = this.props.currentAppId;
    if (store.getState().apps.modelSummaryFlag) {
      let _link = "/apps/" + this.props.match.params.AppId + '/models/' + store.getState().apps.modelSlug;
      return (<Redirect to={_link}/>);
    }

    if (store.getState().apps.scoreSummaryFlag) {
      let _link1 = "/apps/" + this.props.match.params.AppId + '/scores/' + store.getState().apps.scoreSlug;
      return (<Redirect to={_link1}/>);
    }
    let models = <AppsModelList history={this.props.history} match={this.props.match}/>

    let scores = <AppsScoreList history={this.props.history} match={this.props.match}/>

    let modelManagement = ""

    if(appId==2 || appId == 13){
     modelManagement = <Button  eventKey="algo" onClick={this.proceedToModelManagement.bind(this)} onSelect={this.modifyUrl.bind(this)} bsStyle="primary">Manage Models</Button>
    }else
    {
     modelManagement = "";
    }

    return (
      <div className="side-body">
        <div className="main-content">
        <div class="buttonRow pull-right">
        {modelManagement}
            {/* <Button  eventKey="algo" onClick={this.proceedToModelManagement.bind(this)} onSelect={this.modifyUrl.bind(this)} bsStyle="warning">Manage Models</Button> */}
        </div>
          <Tabs id="apps_tab" defaultActiveKey="score" activeKey={store.getState().apps.appsSelectedTabId} onSelect={this.modifyUrl.bind(this)} className="apps_list">
            {(getUserDetailsOrRestart.get().view_trainer_permission == "true")
              ? <Tab eventKey="model"  title="Models">{models}</Tab>
              : <Tab eventKey="model" disabled title="Models">{models}</Tab>}
            {(getUserDetailsOrRestart.get().view_score_permission == "true")
              ? <Tab eventKey="score" title="Scores">{scores}</Tab>
              : <Tab eventKey="score" disabled  title="Scores">{scores}</Tab>}
          </Tabs>
          <AppsLoader match={this.props.match}/>
        </div>
      </div>
    );
  }
}
