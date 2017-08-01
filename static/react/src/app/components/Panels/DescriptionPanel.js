import React from "react";
import {Desc_Body} from "./Desc_Body";
import {Desc_Header} from "./Desc_Header";


export default class DescriptionPanel extends React.Component {

  render() {
    // console.log("in description!!");
    // console.log(this.props);

        return (

        <div className="side-body">
            <Desc_Header/>
            <Desc_Body />
        </div>
      );
  }
}
