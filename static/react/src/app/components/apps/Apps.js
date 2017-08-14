import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";
import {AppsModelList} from "./AppsModelList";


export class Apps extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("apps is called##########3");
  const models = <div id="appsModels"><AppsModelList/>
  <div className="clearfix"></div></div>
    return (
        <div>
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
            <Tab eventKey={1} title="Models">
            {models}
            </Tab>
            <Tab eventKey={2} title="Score">Score List <div class="clearfix"></div></Tab>
          </Tabs>
            </div>
          </div>
        </div>
      );
  }
}
