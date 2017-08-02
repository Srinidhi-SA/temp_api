import React from "react";

import {BreadCrumb} from "./BreadCrumb";

export class MainHeader extends React.Component {

  render() {
    console.log("Desc_Header")
    return (
      <div className="page-head">
        <div class="row">
          <div class="col-md-12">
            <BreadCrumb/>
          </div>
          <div class="col-md-8">
            <h2>TODO: need to fill this</h2>
          </div>
          <div class="col-md-4">
            <div class="input-group pull-right">
              <input type="text" name="search_signals" title="Search Signals" id="search_signals" class="form-control" placeholder="Search signals..."/>
              <span class="input-group-addon">
                <i class="fa fa-search fa-lg"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
    );
  };
}
