import React from "react";
import {MainHeader} from "../common/MainHeader";

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
            <MainHeader/>
            <div className="main-content">
              Apps is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
