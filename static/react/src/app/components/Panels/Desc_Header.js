import React from "react";

export class Desc_Header extends React.Component {

  render() {
    console.log("Desc_Header")
    return (
      <div className="page-head">
        <ol className="breadcrumb">
          <li>
            <a href="#">Story</a>
          </li>
          <li className="active">Sales Performance Report</li>
        </ol>
        <h2>Sales Performance Report</h2>
      </div>
    );
  }
}
