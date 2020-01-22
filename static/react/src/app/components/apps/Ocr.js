import React from "react";
import { connect } from "react-redux";
import { OcrUpload } from "../apps/OcrUpload";
@connect((store) => {
  return { 
    login_response: store.login.login_response 
    };
})

export class Ocr extends React.Component {
  constructor(props) {
    super(props);
    
  }
  
  render() {
    return (
      <div className="side-body">
        <div className="main-content">
           <OcrUpload />     
        </div>
      </div>
    );
  }

}
