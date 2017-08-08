import React from "react";


export class BreadCrumb extends React.Component {

  render() {
    return (
        <ol className="breadcrumb">
          <li>
            <a href="#">{this.props.tabName}</a>
          </li>
          <li className="active">TODO: need to fill this</li>
        </ol>
    );
  }
}
