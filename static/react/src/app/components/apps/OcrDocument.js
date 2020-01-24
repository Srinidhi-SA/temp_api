import React from "react";
import { connect } from "react-redux";
import { OcrUpload } from "../apps/OcrUpload";
import { OcrTable } from "./OcrTable";
import {getUserDetailsOrRestart} from "../../helpers/helper"

@connect((store) => {
  return {
    login_response: store.login.login_response
  };
})

export class OcrDocument extends React.Component {
  constructor(props) {
    super(props);
    this.tableContentAPI();
    this.state={OcrTableData:""}

  }
  componentDidMount(){
  }
  getHeader = token => {
    return {
      Authorization: token
    };
  };
  tableContentAPI(){
    var data = new FormData();
    return fetch("https://madvisor-dev.marlabsai.com/ocr/ocrimage/", {
      method: "GET",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
    }).then(response => response.json()).then(json => {
      if(json.message==="SUCCESS")
      this.setState({ OcrTableData:json})})
  }

  render() {
    return (
      <div className="side-body">
        <div class="page-head">
          <div class="row">
            <div class="col-md-7">
              <h3 class="xs-mt-0 nText">OCR APP</h3>
            </div>
          </div>
        </div>
        <div className="main-content">
          <section class="ocr_section">
            <div class="tab-container">
              <ul class="nav nav-tabs cst_ocr_tabs">
                <li class=""><a href="/apps/ocr-mq44ewz7bp/"><i class="fa fa-tachometer fa-lg"></i> Dashboard</a></li>
                <li class="active"><a href="/apps/ocr-mq44ewz7bp/document"><i class="fa fa-book fa-lg"></i> Document</a></li>
                <li class=""><a href="#"><i class="fa fa-bug fa-lg"></i> Dignostic</a></li>
              </ul>
            </div>
            <div class="container-fluid">
              <OcrUpload />
              <OcrTable tableData={this.state.OcrTableData}/>
            </div>
          </section>
        </div>
      </div>
    );
  }

}
