import React from "react";
import {Desc_Header} from "../Panels/Desc_Header";

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
            <Desc_Header/>
            <div className="main-content">
              Settings is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
