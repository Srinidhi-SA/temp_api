import React from "react";
import { connect } from "react-redux";
import OcrReviewersTable from '../../apps/Ocr/OcrReviewersTable';
import {OcrDocument} from "./OcrDocument";
import { OcrTopNavigation } from "./ocrTopNavigation";
import {saveRevDocumentPageFlag,selectedReviewerDetails}from '../../../actions/ocrActions'
import { getUserDetailsOrRestart } from "../../../helpers/helper";
import store from "../../../store";

@connect((store) => {
  return {
    revDocumentFlag: store.ocr.revDocumentFlag,
  };
})

export class OcrReviewer extends React.Component {
  constructor(props) {
   super(props);
   if(getUserDetailsOrRestart.get().userRole != ("Admin" || "Superuser")){
    this.props.dispatch(saveRevDocumentPageFlag(true));
    this.props.dispatch(selectedReviewerDetails('',getUserDetailsOrRestart.get().userName))
   }  
  }

  render()
   { 
    var  renderComponents=null;
    renderComponents=(store.getState().ocr.revDocumentFlag?
    <OcrDocument/>
    :
    <OcrReviewersTable/>
   )
    return (
      <div className="side-body main-content">
        <OcrTopNavigation/>
          <section class="ocr_section">
            <div class="container-fluid">
            {renderComponents}
            </div>
          </section>
      </div>
    );
  }

}
