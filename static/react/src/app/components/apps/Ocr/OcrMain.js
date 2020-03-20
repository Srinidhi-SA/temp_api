import React from "react";
import { connect } from "react-redux";
import { OcrTopNavigation } from "./ocrTopNavigation";
@connect((store) => {
  return {
    login_response: store.login.login_response
  };
})

export class OcrMain extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="side-body main-content">
        <OcrTopNavigation />
        <section class="ocr_section">
          <div class="container-fluid">
           <div class="xs-mt-30"></div>
          </div>
        </section>
      </div>
    );
  }

}
