import React from "react";
import { connect } from "react-redux";
import {OcrDocument} from "./OcrDocument";
import { OcrProjectScreen } from "./OcrProjectScreen";
import { OcrTopNavigation } from "./ocrTopNavigation";
import store from '../../../store';

@connect((store) => {
  return {
    documentFlag: store.ocr.documentFlag,
    imageFlag: store.ocr.imageFlag,
    revDocumentFlag:store.ocr.revDocumentFlag,
  };
})

export class OcrProject extends React.Component {
  constructor(props) {
    super(props);
    if(this.props.documentFlag==''&&this.props.revDocumentFlag==''&& window.location.pathname.includes('reviewer')){
    window.history.go(-1)
  }}

  render() {

    var paths=[
     { "name":"Projects","url":'#'},
     {"name":"Documents","url":"#"},
     {"name":"Image","url":"#"} 
    ]
   var  breadCrumbDetails=[paths[0]];
     if(this.props.documentFlag){
     breadCrumbDetails=[paths[0]].concat(paths[1])
     }
     else if(this.props.imageFlag)
     breadCrumbDetails=[paths[0]].concat(paths[1]).concat(paths[2])
     else
     breadCrumbDetails=[paths[0]]
  

  
   var  renderComponents=null;
   renderComponents=((this.props.documentFlag||this.props.imageFlag)?
    <OcrDocument/>
    :
    <OcrProjectScreen/>
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
