import React from "react";
import { connect } from "react-redux";
import { storeSelectedConfigureTabAction } from "../../../actions/ocrActions";
import { OcrInitialReview } from "./OcrInitialReview";
import { OcrSecondaryReview } from "./OcrSecondaryReview";

@connect((store) => {
  return {
    configureTabSelected : store.ocr.configureTabSelected,
  };
})

export class OcrConfigure extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount(){
    
  }

  saveSelectedConfigureTab(e){
    this.props.dispatch(storeSelectedConfigureTabAction(e.target.name));
  }

  render() {
    return (
      <div className="side-body">
        <div className="page-head">
          <div className="row">
            <div className="col-md-7">
              <h3 className="xs-mt-0 nText">OCR APP</h3>
            </div>
          </div>
        </div>
        <div className="main-content">
          <section className="ocr_section">
            <div className="tab-container">
            <ul className="nav nav-tabs cst_ocr_tabs">
                <li className=""><a href="/apps/ocr-mq44ewz7bp/"><i className="fa fa-tachometer fa-lg"></i> Dashboard</a></li>
                <li className=""><a href="/apps/ocr-mq44ewz7bp/project/"><i className="fa fa-book fa-lg"></i> Projects</a></li>
                <li className="active"><a href="/apps/ocr-mq44ewz7bp/configure/"><i className="fa fa-sliders fa-lg"></i> Configure</a></li>
                <li className=""><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i className="fa fa-linode fa-lg"></i> Reviewers</a></li>
                <li className=""><a href="/apps/ocr-mq44ewz7bp/manageUser/"><i className="fa fa-user-o fa-lg"></i> Users</a></li>
              </ul>
            </div>
            <div className="container-fluid">
                <h4 className="nText">Stages</h4>
                <ul className="nav nav-tabs">
                  <li className={this.props.configureTabSelected === "initialReview"?"active":""}>
                    <a data-toggle="tab" href="#initialReview" name="initialReview" onClick={this.saveSelectedConfigureTab.bind(this)}>Initial Review</a>
                  </li>
                  <li>
                    <a data-toggle="tab" href="#secondaryReview" name="secondaryReview" onClick={this.saveSelectedConfigureTab.bind(this)}>Secondary Review</a>
                  </li>
                </ul>
                <div className="tab-content">
                  <div id="initialReview" className={this.props.configureTabSelected === "initialReview"?"tab-pane fade in active":"tab-pane fade"}>
                    <OcrInitialReview/>
                  </div>
                  <div id="secondaryReview" className="tab-pane fade">
                    <OcrSecondaryReview/>
                  </div>
                </div>
            </div>
            </section>
        </div>
      </div>
    );
  }

}
