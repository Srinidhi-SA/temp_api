import React from "react";
import {MainHeader} from "../common/MainHeader";

export class Settings extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("settings is called##########3");
    console.log(this.props);
    return (
        <div>
          <div className="side-body">
            <MainHeader/>
            <div className="main-content">
              Settings is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
