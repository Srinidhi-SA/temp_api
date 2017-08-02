import React from "react";
import {MainHeader} from "../common/MainHeader";

export class Data extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("data is called##########3");
    console.log(this.props);
    return (
        <div>
          <div className="side-body">
            <MainHeader/>
            <div className="main-content">
              Data is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
