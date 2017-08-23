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
   let models = <div id="appsModels"><AppsModelList history={this.props.history} match={this.props.match}/>
  <div className="clearfix"></div></div>
  let score = <div id="appsScore"><AppsScoreList history={this.props.history} match={this.props.match}/>
  <div className="clearfix"></div></div>
    return (
          <div className="side-body">
            <div className="main-content">
            <div class="tab-container">
            <ul class="nav nav-tabs">
              <li class="active"><a title="models" href="#models" data-toggle="tab"><i className="pe-7s-drawer"></i>Models</a></li>
              <li><a title="score" href="#score" data-toggle="tab"><i className="pe-7s-target"></i>Score</a></li>
            </ul>
            <div class="tab-content">
              <div id="models" class="tab-pane active cont">
                {models}
              </div>
              <div id="score" class="tab-pane cont">
              {score}
                </div>
             
          </div>
            </div>
          </div>
        </div>
      );
  }
}
