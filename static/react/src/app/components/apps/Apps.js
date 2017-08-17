import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";
import {AppsScoreList} from "./AppsScoreList";

export class Apps extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("apps is called##########3");
   let models = <div id="appsModels"><AppsModelList history={this.props.history}/>
  <div className="clearfix"></div></div>
  let score = <div id="appsScore"><AppsScoreList history={this.props.history}/>
  <div className="clearfix"></div></div>
    return (
        <div>
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
            <Tab eventKey={1} title="Models">
            {models}
            </Tab>
            <Tab eventKey={2} title="Score">{score}</Tab>
          </Tabs>
            </div>
          </div>
        </div>
      );
  }
}
