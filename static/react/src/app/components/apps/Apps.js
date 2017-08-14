import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";

export class Apps extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("apps is called##########3");
    console.log(this.props);
    return (
        <div>
          <div className="side-body">
            <div className="main-content">
            <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
            <Tab eventKey={1} title="Models">Models List</Tab>
            <Tab eventKey={2} title="Score">Score List</Tab>
          </Tabs>
            </div>
          </div>
        </div>
      );
  }
}
