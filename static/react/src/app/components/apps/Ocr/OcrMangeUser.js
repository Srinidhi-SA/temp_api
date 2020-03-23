import React from "react";
import { connect } from "react-redux";
import { OcrUserTable } from "./OcrUserTable";
import { OcrTopNavigation } from "./ocrTopNavigation";
@connect((store) => {
  return { 
    };
})

export class OcrManageUser extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="side-body main-content">
        <OcrTopNavigation/>
          <section class="ocr_section">
            <div class="container-fluid">
              <OcrUserTable/>
            </div>
          </section>
      </div>
    );
  }

}
