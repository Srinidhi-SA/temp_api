import React from "react";
import { connect } from "react-redux";
import {OcrDocument} from "./OcrDocument";

@connect((store) => {
  return {
  };
})

export class OcrProject extends React.Component {
  constructor(props) {
    super(props);
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
                <li class="active"><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-book fa-lg"></i> Projects</a></li>
                <li class=""><a href="#"><i class="fa fa-sliders fa-lg"></i> Configure</a></li>
                <li class=""><a href="#"><i class="fa fa-linode fa-lg"></i> Reviewers</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/manageUser/"><i class="fa fa-user-o fa-lg"></i> Manage Users</a></li>
              </ul>
            </div>
            <div class="container-fluid">
             <OcrDocument/>
            </div>
          </section>
        </div>
      </div>
    );
  }

}
