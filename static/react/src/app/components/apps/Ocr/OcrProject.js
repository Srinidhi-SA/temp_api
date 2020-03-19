import React from "react";
import { connect } from "react-redux";
import {OcrDocument} from "./OcrDocument";
import { OcrProjectScreen } from "./OcrProjectScreen";
import { OcrImage } from "./ocrImage";
import {BreadCrumb} from "../../common/BreadCrumb";

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
      <div className="side-body">
        <div class="page-head">
          <div class="row">
            <div class="col-md-7">
              <h3 class="xs-mt-0 nText">OCR APP</h3>
            </div>
          </div>
        </div>
        <div className="main-content">
          <section class="ocr_section">
            <div class="tab-container">
            <ul class="nav nav-tabs cst_ocr_tabs">
                <li class=""><a href="/apps/ocr-mq44ewz7bp/"><i class="fa fa-tachometer fa-lg"></i> Dashboard</a></li>
                <li class="active"><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-book fa-lg"></i> Projects</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/configure/"><i class="fa fa-sliders fa-lg"></i> Configure</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-users fa-lg"></i> Reviewers</a></li>
                <li class=""><a href="/apps/ocr-mq44ewz7bp/manageUser/"><i class="fa fa-user fa-lg"></i> Users</a></li>
              </ul>
            </div>
            <div class="container-fluid">
            {renderComponents}
            </div>
          </section>
        </div>
      </div>
    );
  }

}
