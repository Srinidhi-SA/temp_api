import React from "react";
import {Signals} from "./signals";

export class Desc_Body extends React.Component {

  render() {
    console.log("Desc_Body")
    console.log(this.props);

    switch(this.props.selectedComponentLocation){
      case "/":
      return(
        <div className="main-content">
        loading...
        </div>
      );break;
      case "/signals":
      return(
        <div className="main-content">
        <Signals/>
        </div>
      );break;
    }

  }
}
