import React from "react";
import { connect } from "react-redux";
import { storeSelectedConfigureTabAction, submitReviewerConfigAction, clearReviewerConfigStatesAction, fetchSeconadryReviewerList, fetchInitialReviewerList, setIRLoaderFlagAction, setSRLoaderFlagAction, fetchReviewersRules } from "../../../actions/ocrActions";
import { OcrInitialReview } from "./OcrInitialReview";
import { OcrSecondaryReview } from "./OcrSecondaryReview";
import store from "../../../store";
import { statusMessages } from "../../../helpers/helper";
import { OcrTopNavigation } from "./ocrTopNavigation";

@connect((store) => {
  return {
    configureTabSelected : store.ocr.configureTabSelected,
    selectedIRList : store.ocr.iRConfigureDetails.selectedIRList,
    selectedSRList : store.ocr.sRConfigureDetails.selectedSRList,
    iRConfigureDetails : store.ocr.iRConfigureDetails,
    sRConfigureDetails : store.ocr.sRConfigureDetails,
    iRToggleFlag : store.ocr.iRToggleFlag,
    sRToggleFlag : store.ocr.sRToggleFlag,
  };
})

export class OcrConfigure extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.dispatch(setIRLoaderFlagAction(true));
    this.props.dispatch(fetchReviewersRules());
    this.props.dispatch(fetchInitialReviewerList(3));
  }

  saveSelectedConfigureTab(e){
    this.props.dispatch(fetchReviewersRules());
    this.props.dispatch(clearReviewerConfigStatesAction());
    this.props.dispatch(storeSelectedConfigureTabAction(e.target.name));
    if(e.target.name === "initialReview"){
      $("#searchSR")[0].value = ""
      this.props.dispatch(setIRLoaderFlagAction(true));
      this.props.dispatch(fetchInitialReviewerList(3));
    }else{
      $("#searchIR")[0].value = ""
      this.props.dispatch(setSRLoaderFlagAction(true));
      this.props.dispatch(fetchSeconadryReviewerList(4))
    }
  }

  submitReviewerConfig(e){
    if(this.props.configureTabSelected === "initialReview"){
      if(!this.props.iRToggleFlag){
        let msg= statusMessages("warning","Enable automatic reviewer assignment, to assign documents to reviewers according to your choices.","small_mascot");
        bootbox.alert(msg);
      }else if(!$("#assigniRDocsToAll")[0].checked && !$("#assigniRDocsToSelect")[0].checked){
        let msg= statusMessages("warning","Please select how to assign documents","small_mascot");
        bootbox.alert(msg);
      }else if($("#assigniRDocsToSelect")[0].checked && this.props.selectedIRList.length === 0){
        let msg= statusMessages("warning","Please select reviewers","small_mascot");
        bootbox.alert(msg);
      }else if(($("#assignRemaningIRDocs")[0].checked || $("#assignRemaningIRDocs1")[0].checked || $("#assignRemaningIRDocs2")[0].checked)===false){
        let msg= statusMessages("warning","Please input how to assign remaining documents","small_mascot");
        bootbox.alert(msg);
      }else if($("#assigniRDocsToAll")[0].checked ){
        if($("#iRdocsCountToAll")[0].value === "" || !Number.isInteger(parseFloat($("#iRdocsCountToAll")[0].value)) || parseFloat($("#iRdocsCountToAll")[0].value) < 1 ){
          let msg= statusMessages("warning","Please enter valid input.","small_mascot");
          bootbox.alert(msg);
        }
        else{
          this.props.dispatch(submitReviewerConfigAction("initialReview",this.props.iRConfigureDetails));
        }
      }else if($("#assigniRDocsToSelect")[0].checked){
        if( $("#iRdocsCountToSelect")[0].value === "" || !Number.isInteger(parseFloat($("#iRdocsCountToSelect")[0].value)) || parseFloat($("#iRdocsCountToSelect")[0].value) < 1 ){
          let msg= statusMessages("warning","Please enter valid input.","small_mascot");
          bootbox.alert(msg);
        }
        else{
          this.props.dispatch(submitReviewerConfigAction("initialReview",this.props.iRConfigureDetails));
        }
      }
    }
    else if(this.props.configureTabSelected === "secondaryReview"){
      if(!this.props.sRToggleFlag){
        let msg= statusMessages("warning","Enable automatic reviewer assignment, to assign verified documents to auditors according to your choices.","small_mascot");
        bootbox.alert(msg);
      }
      else if(!$("#assignSRDocsToAll")[0].checked && !$("#assignSRDocsToSelect")[0].checked){
        let msg= statusMessages("warning","Please select sampling procedure for Audit","small_mascot");
        bootbox.alert(msg);
      }
      else if($("#assignSRDocsToSelect")[0].checked && this.props.selectedSRList.length === 0){
        let msg= statusMessages("warning","Please select reviewers","small_mascot");
        bootbox.alert(msg);
      }
      else if(($("#assignRemaningSRDocs")[0].checked || $("#assignRemaningSRDocs1")[0].checked || $("#assignRemaningSRDocs2")[0].checked)===false){
        let msg= statusMessages("warning","Please input how to assign remaining documents","small_mascot");
        bootbox.alert(msg);
      }
      else if($("#assignSRDocsToAll")[0].checked){
        if($("#sRdocsCountToAll")[0].value === "" || !Number.isInteger(parseFloat($("#sRdocsCountToAll")[0].value)) || parseFloat($("#sRdocsCountToAll")[0].value) < 1){
          let msg= statusMessages("warning","Please enter valid input.","small_mascot");
          bootbox.alert(msg);
        }
        else{
          this.props.dispatch(submitReviewerConfigAction("secondaryReview",this.props.sRConfigureDetails));
        }
      }
      else if($("#assignSRDocsToSelect")[0].checked){
        if($("#sRdocsCountToSelect")[0].value === "" || !Number.isInteger(parseFloat($("#sRdocsCountToSelect")[0].value)) || parseFloat($("#sRdocsCountToSelect")[0].value) < 1 ){
          let msg= statusMessages("warning","Please enter valid input.","small_mascot");
          bootbox.alert(msg);
        }
        else{
          this.props.dispatch(submitReviewerConfigAction("secondaryReview",this.props.sRConfigureDetails));
        }
      }
    }
  }

  clearReviewerConfigStates(e){
    this.props.dispatch(clearReviewerConfigStatesAction())
  }

  render() {
    return (
      <div className="side-body">
          <OcrTopNavigation/>
		  <div className="main-content">
          <section className="ocr_section box-shadow">
            <div className="container-fluid">
                <h3 className="nText">Stages</h3>
                <ul className="nav nav-tabs">
                  <li className={this.props.configureTabSelected === "initialReview"?"active":""}>
                    <a data-toggle="tab" href="#initialReview" name="initialReview" title="Initial Review" onClick={this.saveSelectedConfigureTab.bind(this)}>Initial Review</a>
                  </li>
                  <li>
                    <a data-toggle="tab" href="#secondaryReview" name="secondaryReview" title="Secondary Review" onClick={this.saveSelectedConfigureTab.bind(this)}>Secondary Review</a>
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
                          <button className="btn btn-default" title="Cancel" onClick={this.clearReviewerConfigStates.bind(this)}>Cancel</button> 
                          <button className="btn btn-primary" title="Save" onClick={this.submitReviewerConfig.bind(this)}><i className="fa fa-check-circle"></i> &nbsp; Save</button>
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
