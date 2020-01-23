import React from "react";
import { connect } from "react-redux";
import { OcrUpload } from "../apps/OcrUpload";
@connect((store) => {
  return { 
    login_response: store.login.login_response 
    };
})

export class Ocr extends React.Component {
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
                <li class="active"><a href="/apps/ocr-mq44ewz7bp/"><i class="fa fa-tachometer fa-lg"></i> Dashboard</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/document"><i class="fa fa-book fa-lg"></i> Document</a></li>
                <li class=""><a href="#"><i class="fa fa-bug fa-lg"></i> Dignostic</a></li>
              </ul>
            </div>
            <div class="container-fluid">
            </div>
          </section>
        </div>
      </div>
    );
  }

}
