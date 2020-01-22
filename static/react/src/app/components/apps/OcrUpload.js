import React from "react";
import { connect } from "react-redux";
import { STATIC_URL } from "../../helpers/env.js";
import { Scrollbars } from 'react-custom-scrollbars';
@connect((store) => {
  return {
    OcrfileUpload: store.ocr.OcrfileUpload,

  };
})

export class OcrUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: ""
    }
  }

  onChangeHandler = event => {
    console.log(event.target.files);
    this.setState({
      selectedFiles: Object.values(event.target.files),
    })
  }

  removeFile(item) {
    this.setState({
      selectedFiles: Object.values(this.state.selectedFiles).filter(i => i.name != item),
    })

  }

  render() {
    var fileNames = this.state.selectedFiles != "" ? Object.values(this.state.selectedFiles).map(i => i.name).map((item, index) => (
      <li>{item}
        <span style={{ marginLeft: "10px" }} onClick={this.removeFile.bind(this, item)}>
          <i class="fa fa-times" aria-hidden="true" style={{ color: '#555' }}></i>
        </span>
      </li>
    ))
      : ""

    return (
      <div className="row">
        <div className="col-md-5 ocrUploadHeight">
          <div className="dropzoneOcr">
            <input className="ocrUpload" type="file" multiple onChange={this.onChangeHandler} />
            <img style={{ height: 64, width: 64, opacity: 0.4, zIndex: 0, cursor: 'pointer' }} src={STATIC_URL + "assets/images/ocrUpload.svg"} />
            <span>Upload files</span>
          </div>
        </div>

        <div className="col-md-7 ocrUploadHeight">
          <Scrollbars>
            <ul className="list-unstyled bullets_primary ocrUploadHeight">
              {fileNames}
            </ul>
          </Scrollbars>
        </div>
      </div>
    )
  }

}
