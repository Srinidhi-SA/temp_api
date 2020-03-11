import React from "react";
import { connect } from "react-redux";
import { storeSelectedConfigureTabAction, submitReviewerConfigAction, clearReviewerConfigStatesAction, fetchSeconadryReviewerList, fetchInitialReviewerList } from "../../../actions/ocrActions";
import { OcrInitialReview } from "./OcrInitialReview";
import { OcrSecondaryReview } from "./OcrSecondaryReview";
import store from "../../../store";

@connect((store) => {
  return {
    configureTabSelected : store.ocr.configureTabSelected,
    ocrReviwersList : store.ocr.ocrReviwersList,
    selectedIRList : store.ocr.selectedIRList,
    iRConfigureDetails : store.ocr.iRConfigureDetails,
    sRConfigureDetails : store.ocr.sRConfigureDetails,
  };
})

export class OcrConfigure extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.dispatch(fetchInitialReviewerList(3))
  }

  saveSelectedConfigureTab(e){
    this.props.dispatch(clearReviewerConfigStatesAction())
    this.props.dispatch(storeSelectedConfigureTabAction(e.target.name));
    if(e.target.name === "initialReview"){
      this.props.dispatch(fetchInitialReviewerList(3))
    }else{
      this.props.dispatch(fetchSeconadryReviewerList(4))
    }
  }

  submitReviewerConfig(e){
    if(this.props.configureTabSelected === "initialReview"){
      // if(!$("#assignDocsToAll")[0].checked && !$("#assignDocsToSelect")[0].checked){
      //   $("#resetMsg")[0].innerHTML = "Please Select"
      // }
      // else if($("#docsCountTo")[0].value === ""){
      //   $("#resetMsg")[0].innerHTML = "Please enter value"
      // }
      // else if(Number.isInteger(parseFloat($("#docsCountTo")[0].value))){
      //   $("#resetMsg")[0].innerHTML = "Decimals Not Allowed"
      // }
      // else if(parseFloat($("#docsCountTo")[0].value) < 1 || parseFloat($("#docsCountTo")[0].value > 25) ){
      //   $("#resetMsg")[0].innerHTML = "Allowed range is 1-25"
      // }
      // else if(this.props.selectedIRList.length === 0){
      //   $("#resetMsg")[0].innerHTML = "Please Select Reviwers"
      // }
      // else if( !$("#assignRemaningDocs")[0].checked && !$("#assignRemaningDocs1")[0].checked && !$("#assignRemaningDocs2")[0].checked ){
      //   $("#resetMsg")[0].innerHTML = "Please Select Remaining docs Assign Type"
      // }
      // else{
        $("#resetMsg")[0].innerHTML = ""
        this.props.dispatch(submitReviewerConfigAction("initialReview",this.props.iRConfigureDetails));
      // }
    }
    else if(this.props.configureTabSelected === "secondaryReview"){
      this.props.dispatch(submitReviewerConfigAction("secondaryReview",this.props.sRConfigureDetails));
    }
  }

  clearReviewerConfigStates(e){
    this.props.dispatch(clearReviewerConfigStatesAction())
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
                  <div className="row">
                      <div className="col-md-6 col-md-offset-6 text-right" style={{marginTop:"10px",marginBottom:"10px"}}>
                          <button className="btn btn-default" onClick={this.clearReviewerConfigStates.bind(this)}>Cancel</button> 
                          <button className="btn btn-primary" onClick={this.submitReviewerConfig.bind(this)}><i className="fa fa-check-circle"></i> &nbsp; Save</button>
                      </div>
                  </div>
                </div>
            </div>
            </section>
        </div>
      </div>
    );
  }

}
