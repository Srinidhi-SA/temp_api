import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";
import {Link, Redirect} from "react-router-dom";

export class Apps extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    console.log("apps is called##########3");
    console.log(this.props)
   let models = <div id="appsModels"><AppsModelList history={this.props.history} match={this.props.match}/>
  <div className="clearfix"></div></div>
  let scores = <div id="appsScore"><AppsScoreList history={this.props.history} match={this.props.match}/>
  <div className="clearfix"></div></div>
    return (
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
            <Tab eventKey={1} title="Models">{models}</Tab>
            <Tab eventKey={2} title="Scores">{scores}</Tab>
          </Tabs>
          </div>
        </div>
      );
  }
}
