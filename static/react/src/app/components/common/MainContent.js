import React from "react";
import {Signals} from "../signals/Signals";

export class MainContent extends React.Component {

  render() {
    console.log("Content")
        return(
        <div className="main-content">
        <Signals/>
        </div>
      );

  }
}
