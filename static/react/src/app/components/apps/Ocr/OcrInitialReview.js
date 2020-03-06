import React from "react";
import { connect } from "react-redux";
import { saveIRToggleValAction, setAssignDocsToAction, setDocsCountAction} from "../../../actions/ocrActions";

@connect((store) => {
  return {
    allOcrUsers : store.ocr.allOcrUsers,
    iRToggleFlag : store.ocr.iRToggleFlag,
    iRassignDocsTo : store.ocr.iRassignDocsTo,
  };
})

export class OcrInitialReview extends React.Component {
  constructor(props) {
    super(props);
  }

  saveInitialReviwerToggleVal(e){
    this.props.dispatch(saveIRToggleValAction(e.target.checked))
  }
  setIRAssignDocsType(e){
      this.props.dispatch(setAssignDocsToAction(e.target.value))
  }
  saveIRDocsCount(e){
      this.props.dispatch(setDocsCountAction(e.target.value));
  }

  render() {
    let iReviewerTable = ""
    if(Object.keys(this.props.allOcrUsers).length === 0){
        iReviewerTable = <div className="noOcrUsers">
            <span>No Users Found<br/></span>
        </div>
    }else {
        iReviewerTable = 
            <table className = "table table-bordered table-hover" style="background:#FFF;">
                <thead><tr>
                    <th><Checkbox id="selectAll" value="" checked/></th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                </tr></thead>
                <tbody>
                    {this.props.allOcrUsers.data.map((item, index) => {
                        if(item.ocr_user){
                            return (
                                <tr>
                                    <td><Checkbox id={item.ocr_profile.slug} value={item.username} checked/></td>
                                    <td>{item.first_name}</td>
                                    <td>{item.email}</td>
                                </tr>
                            )}
                            else{ return "" }
                        })
                    }
                </tbody>
            </table>
    }
    return (
        <div className="ocrInitialReview">
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <div className="checkbox checbox-switch switch-success">
                            <label>
                                <input type="checkbox" name="iRToggleFlag" checked={this.props.iRToggleFlag} onChange={this.saveInitialReviwerToggleVal.bind(this)}/>
                                <span></span>
                                Enable automatic reviewer assignment<br/>
                                <small>when enabled, documents that enter workflow will be assigned to reviewers according to your choices below</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <hr/>
            {this.props.iRToggleFlag && 
            <div>
                <div className="row">
                <div className="col-md-12">
                    <h4>Select how to assign documents</h4>
                    <div className="row col-md-8" style={{margin:"0px"}}>
                        <div className="ma-radio">
                            <input type="radio" name="assignDocsTo" value="all" id="assignDocsToAll" onClick={this.setIRAssignDocsType.bind(this)}/>
                            <label for="assignDocsToAll">Distribute documents randomnly and evenly to all reviewers</label>
                        </div>
                        {this.props.iRassignDocsTo === "all" &&
                            <div className="row">
                                <label className="label-control col-md-5 xs-ml-50 mandate" for="docsCountToAll">Maximum number of documents per reviewer</label>
                                <div className="col-md-3">
                                    <input type="number" className="form-control inline" id="docsCountToAll" name="docsCount" placeholder="Enter Number..." onInput={this.saveIRDocsCount.bind(this)} />
                                </div>
                            </div>
                        }
                        <div className="ma-radio">
                            <input type="radio" name="assignDocsTo" value="selected" id="assignDocsToSelect" onClick={this.setIRAssignDocsType.bind(this)}/>
                            <label for="assignDocsToSelect">Distribute documents randomnly and evenly over selected reviewers</label>
                        </div>
                        {this.props.iRassignDocsTo === "selected" &&
                            <div className="row">
                                <label className="label-control col-md-5 xs-ml-50 mandate" for="docsCountToSelect">Maximum number of documents per reviewer</label>
                                <div className="col-md-3">
                                    <input type="number" className="form-control inline" id="docsCountToSelect" name="docsCount" placeholder="Enter Number..." onInput={this.saveIRDocsCount.bind(this)} />
                                </div>
                            </div>
                        }
                    </div>
                    <div id="resetMsg"></div>
                </div>
            </div>
            <hr/>
            <div className="row">
                <div className="col-md-12">
                    <h4>Reviewers (2)
                        <div className="pull-right xs-mb-10">
                            <input type="text" className="form-control" placeholder="Search..." />
                        </div>
                    </h4>
                    <div className="clearfix"></div>
                    <div className="table-responsive">
                        {iReviewerTable}
                    </div>
                    <hr/>
                    <div className="row">
                        <div className="col-md-12">
                            <h4>How would you like to assign any remaining documents?</h4>
                            <div className="ma-radio">
                                <input type="radio" name="assign_remaning_doc" id="asn1" />
                                <label for="asn1">Continue to distribute even if limits are met</label>
                            </div>
                            <div className="ma-radio">
                                <input type="radio" name="assign_remaning_doc" id="asn2" />
                                <label for="asn2">Leave unassigned and move to backlogs</label>
                            </div>
                            <div className="ma-radio">
                                <input type="radio" name="assign_remaning_doc" id="asn3" />
                                <label for="asn3">Select reviewers to assign</label>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                    <div className="xs-mt-20"></div>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-6 text-right">
                            <button className="btn btn-default"> &nbsp; Cancel</button> 
                            <button className="btn btn-primary"><i className="fa fa-check-circle"></i> &nbsp; Save</button>
                        </div>
                    </div>
            </div>
            </div>
            }
        </div>
    );
  }
}
