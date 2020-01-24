import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import {getUserDetailsOrRestart} from "../../helpers/helper"


export class OcrTable extends React.Component{

  constructor(props){
    super(props)
    this.state={
      response:false
    }
  }


  getHeader = token => {
    return {
      Authorization: token
    };
  };

  

  render(){
    console.log(this.props)
    return(
      <div class="row">
      <div class="col-md-12">
        <div className="panel box-shadow ">
          <div class="panel-body no-border xs-p-20">
            <div className="table-responsive noSwipe xs-pb-10">
              <Scrollbars style={{
                height: 500
              }}>
                <table id="dctable" className="tablesorter table table-condensed table-hover table-bordered">
                <thead>
				<tr>
					<th></th>
					<th>Name</th>
					<th class="dropdown" >
					<a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Status" aria-expanded="true">
					<span>Status</span> <b class="caret"></b>
					</a>
					<ul class="dropdown-menu scrollable-menu">
					<li><a class="cursor" name="ready to verify">Ready to Verify</a></li>
					<li><a class="cursor" name="ready to export">Ready to Export</a></li>
					 
					</ul>
					</th>
					 
					<th class="dropdown" >
					<a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
					<span>Confidence Level</span> <b class="caret"></b>
					</a>
					<ul class="dropdown-menu scrollable-menu"> 
					 
					<li><a class="cursor" name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
					<li><a class="cursor" name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
					<li><a class="cursor" name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
					</ul>
					</th>
					<th class="dropdown" >
					<a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Assignee" aria-expanded="true">
					<span>Assignee</span> <b class="caret"></b>
					</a>
					<ul class="dropdown-menu scrollable-menu">
					<li><a class="cursor" name="ready to verify">Assignee 1</a></li>
					<li><a class="cursor" name="ready to export">Assignee 2</a></li>
					 
					</ul>
					</th>
					 
					<th>Notes</th>
				</tr>
				</thead>
                  <tbody className="no-border-x">
                    {/* {OcrTableHtml} */}
                  </tbody>
                </table>
              </Scrollbars>
            </div>
          </div>
          <div className="panel-body box-shadow">
          <div class="buttonRow">
              {/* <Button id="dataCleanBack" onClick={this.handleBack} bsStyle="primary"><i class="fa fa-angle-double-left"></i> Back</Button> */}
              {/* <Button id="dataCleanProceed" onClick={this.proceedFeatureEngineering.bind(this)} bsStyle="primary" style={{float:"right"}}>Proceed <i class="fa fa-angle-double-right"></i></Button> */}
          </div>
            <div class="xs-p-10"></div>
          </div>
        </div>
      </div>
    </div>
    )
  }
}