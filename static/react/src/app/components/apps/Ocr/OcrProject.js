import React from "react";
import { connect } from "react-redux";
import {OcrDocument} from "./OcrDocument";
import { OcrProjectScreen } from "./OcrProjectScreen";
import { OcrTopNavigation } from "./ocrTopNavigation";

@connect((store) => {
  return {
    documentFlag: store.ocr.documentFlag,
    imageFlag: store.ocr.imageFlag,
  };
})

export class OcrProject extends React.Component {
  constructor(props) {
    super(props);
  }

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
