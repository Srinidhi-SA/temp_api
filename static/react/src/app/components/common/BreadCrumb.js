import React from "react";
import {NavLink} from "react-router-dom";

export class BreadCrumb extends React.Component {
  constructor() {
    super();
  }

  render() {
    let data = this.props.parameters;

    if (data) {
      let breadcrumb = data.map((page, i) => {
        if (page.url) {
          return (
              <li key = {i}>
                <NavLink to={page.url}>{page.name}</NavLink>
              </li>
          );
        } else {
          return (
              <li key = {i}>
                {page.name}
              </li>
          );
        }

      });

      return (
        <div>
         <ol className="breadcrumb">
        {breadcrumb}
        </ol>
        </div>

      );
    }
  }
}
