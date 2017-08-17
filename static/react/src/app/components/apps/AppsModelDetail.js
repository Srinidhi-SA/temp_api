import React from "react";
import {MainHeader} from "../common/MainHeader";
import {Tabs,Tab} from "react-bootstrap";

export class AppsModelDetail extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("apps Model Detail View is called##########3");
 
    return (
          <div className="side-body">
            <div className="main-content">
             Apps Model List
            </div>
          </div>
      );
  }
}
