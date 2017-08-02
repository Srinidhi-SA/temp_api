import React from "react";
import {Signals} from "../Signals/Signals";

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
