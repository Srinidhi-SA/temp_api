import React from "react";
import { connect } from "react-redux";
import { OcrUpload } from "./OcrUpload";
import { OcrTable } from "./OcrTable";
import { OcrImage } from "./ocrImage";

@connect((store) => {
  return {
    imageFlag: store.ocr.imageFlag,
  };
})

export class OcrDocument extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    return (
      <div>
      {this.props.imageFlag ?
        <OcrImage />
        :
        <div>
          <OcrUpload />
          <OcrTable />
        </div>
      }

    </div>
    );
  }

}
