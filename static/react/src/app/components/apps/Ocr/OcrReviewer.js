import React from "react";
import { connect } from "react-redux";
import OcrReviewersTable from '../../apps/Ocr/OcrReviewersTable';
import {OcrDocument} from "./OcrDocument";


@connect((store) => {
  return {
    revDocumentFlag: store.ocr.revDocumentFlag,
  };
})

export class OcrReviewer extends React.Component {
  constructor(props) {
    super(props);
  }

  render()
   { 
    var  renderComponents=null;
    renderComponents=(this.props.revDocumentFlag?
    <OcrDocument/>
    :
    <OcrReviewersTable/>
   )
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
                <li class=""><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-book fa-lg"></i> Projects</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/configure/"><i class="fa fa-sliders fa-lg"></i> Configure</a></li>
                <li class="active"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-users fa-lg"></i> Reviewers</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/manageUser/"><i class="fa fa-user fa-lg"></i> Users</a></li>
              </ul>
            </div>
            <div class="container-fluid">
            {renderComponents}
            </div>
          </section>
        </div>
      </div>
    );
  }

}
