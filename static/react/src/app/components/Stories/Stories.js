import React from "react";
import {Desc_Header} from "../Panels/Desc_Header";

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
            <Desc_Header/>
            <div className="main-content">
              Stories is called!!!!!
            </div>
          </div>
        </div>
      );
  }
}
