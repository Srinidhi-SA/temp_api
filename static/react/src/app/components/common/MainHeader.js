import React from "react";

import {BreadCrumb} from "./BreadCrumb";

export class MainHeader extends React.Component {

  render() {
    console.log("Desc_Header")
    return (
      <div className="page-head">
        <BreadCrumb/>
        <h2>TODO: need to fill this</h2>
      </div>
    );
  }
}
