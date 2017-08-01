import React from "react";
import {Signals} from "../Signals/Signals";

export class Desc_Body extends React.Component {

  render() {
    console.log("Desc_Body")
        return(
        <div className="main-content">
        <Signals/>
        </div>
      );

  }
}
