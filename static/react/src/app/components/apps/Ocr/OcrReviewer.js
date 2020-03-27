import React from "react";
import { connect } from "react-redux";
import OcrReviewersTable from '../../apps/Ocr/OcrReviewersTable';
import {OcrDocument} from "./OcrDocument";
import { OcrTopNavigation } from "./ocrTopNavigation";

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
