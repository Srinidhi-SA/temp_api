import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {connect} from "react-redux";
import {activateModelScoreTabs} from "../../actions/appActions";

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
  
  modifyUrl(tabId){
	  this.props.dispatch(activateModelScoreTabs(tabId));
	  if(tabId == "score"){
		  this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/scores?page=1')  
	  }else{
		  this.props.history.push('/apps/'+store.getState().apps.currentAppId+'/models?page=1')   
	  }
	  
      
  }
  render() {
    console.log("apps is called##########3");
    console.log(this.props)
   let models = <AppsModelList history={this.props.history} match={this.props.match}/>
  
  let scores = <AppsScoreList history={this.props.history} match={this.props.match}/>
  
    return (
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey="score" activeKey={store.getState().apps.appsSelectedTabId} onSelect={this.modifyUrl.bind(this)} >
            <Tab  eventKey="model" title="Models">{models}</Tab>
            <Tab eventKey="score" title="Scores">{scores}</Tab>
          </Tabs>
          </div>
        </div>
      );
  }
}
