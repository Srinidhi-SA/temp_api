import React from "react";
import {Desc_Header} from "../Panels/Desc_Header";

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
            <Desc_Header/>
            <div className="main-content">
              Apps is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
