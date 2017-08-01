import React from "react";
import {Signals} from "./signals";
import {Desc_Body} from "./desc_body";
import {Desc_Header} from "./desc_header";


export default class DescriptionPanel extends React.Component {

  render() {
    console.log("in description!!");
    console.log(this.props);

        return (

        <div className="side-body">
            <Desc_Header/>
            <Desc_Body selectedComponentLocation={this.props.selectedComponentLocation}/>
        </div>
      );
  }
}
