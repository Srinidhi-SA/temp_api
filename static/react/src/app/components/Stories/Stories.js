import React from "react";
import {MainHeader} from "../Panels/MainHeader";

export class Stories extends React.Component {
  constructor() {
    super();
  }
  render() {
    console.log("stories is called##########3");
    console.log(this.props);
    return (
        <div>
          <div className="side-body">
            <MainHeader/>
            <div className="main-content">
              Stories is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
