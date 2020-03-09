import React from "react";
import { connect } from "react-redux";
import { Checkbox } from "primereact/checkbox";
import { saveIRToggleValAction, setAssignDocsToAction, setDocsCountAction, saveSelectedIRListAction, saveIRSearchElemAction, clearIRSearchElemAction, setAssignRemainingIRDocsAction} from "../../../actions/ocrActions";

@connect((store) => {
  return {
    iRList : store.ocr.iRList,
    iRToggleFlag : store.ocr.iRToggleFlag,
    iRassignDocsTo : store.ocr.iRassignDocsTo,
    selectedIRList : store.ocr.selectedIRList,
    iRSearchElement : store.ocr.iRSearchElement,
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
  saveSelectedIRList(e){
    let curIRSelUsers = [...this.props.selectedIRList];
    if(e.target.checked)
        curIRSelUsers.push(e.target.value)
    else
        curIRSelUsers.splice(curIRSelUsers.indexOf(e.value), 1)
        this.props.dispatch(saveSelectedIRListAction(curIRSelUsers))
  }
  handleSelectAllIR(e){
      let nameList = [];
    if(e.target.checked){
      nameList = e.target.value.filter(i=>i.ocr_profile.role.includes(3)).map(function (el) { return el.username; });
      this.props.dispatch(saveSelectedIRListAction(nameList));
    }else{
        this.props.dispatch(saveSelectedIRListAction(nameList));
    }
  }
  saveIRSearchElem(e){
    this.props.dispatch(saveIRSearchElemAction(e.target.value));
  }
  clearIRSearchElem(e){
    $("#searchIR")[0].value = ""
    this.props.dispatch(clearIRSearchElemAction());
  }
  setAssignRemainingIRDocs(e){
    this.props.dispatch(setAssignRemainingIRDocsAction(e.target.value));
  }

  render() {
    let iReviewerTable = ""
    if(Object.keys(this.props.iRList).length === 0){
        iReviewerTable = <div className="noOcrUsers">
            <span>No Users Found<br/></span>
        </div>
    }else {
        let iRListCount = (this.props.iRList.data.filter(i=>i.ocr_profile.role.includes(3)) ).length
        iReviewerTable = 
            <table className = "table table-bordered table-hover" style={{background:"#FFF"}}>
                <thead><tr>
                    <th className="text-center xs-pr-5" style={{width:"80px"}}><Checkbox id="selectAllIR" value={this.props.iRList.data} onChange={this.handleSelectAllIR.bind(this)} checked={(iRListCount === this.props.selectedIRList.length)?true:false}/></th>
                    <th style={{width:"40%"}}>NAME</th>
                    <th>EMAIL</th>
                </tr></thead>
                <tbody>
                    {this.props.iRList.data.map((item, index) => {
                        if(item.ocr_profile.role.includes(3)){
                            return (
                                <tr>
                                    <td className="text-center"><Checkbox id={item.ocr_profile.slug} value={item.username} onChange={this.saveSelectedIRList.bind(this)} checked={this.props.selectedIRList.includes(item.username)}/></td>
                                    <td>{item.username}</td>
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
                    <h4>Reviewers ({this.props.selectedIRList.length})</h4>
                    <div className="pull-right xs-mb-10">
                        <input type="text" id="searchIR" className="form-control" style={{marginTop:"-30px"}} placeholder="Search..." onKeyUp={this.saveIRSearchElem.bind(this)} />
                        <button className="close-icon" style={{marginLeft:"15%"}} onClick={this.clearIRSearchElem.bind(this)} type="reset"></button>
                    </div>
                    <div className="clearfix"></div>
                    <div className="table-responsive">
                        {iReviewerTable}
                    </div>
                    <hr/>
                    <div className="row">
                        <div className="col-md-12">
                            <h4>How would you like to assign any remaining documents?</h4>
                            <div className="ma-radio">
                                <input type="radio" name="assignRemaningDocs" value="asn1" id="asn1" onClick={this.setAssignRemainingIRDocs.bind(this)} />
                                <label for="asn1">Continue to distribute even if limits are met</label>
                            </div>
                            <div className="ma-radio">
                                <input type="radio" name="assignRemaningDocs" value="asn2" id="asn2" onClick={this.setAssignRemainingIRDocs.bind(this)} />
                                <label for="asn2">Leave unassigned and move to backlogs</label>
                            </div>
                            <div className="ma-radio">
                                <input type="radio" name="assignRemaningDocs" value="asn3" id="asn3" onClick={this.setAssignRemainingIRDocs.bind(this)} />
                                <label for="asn3">Select reviewers to assign</label>
                            </div>
                        </div>
                    </div>
                    <hr/>
                </div>
            </div>
            </div>
            }
        </div>
    );
  }
}
