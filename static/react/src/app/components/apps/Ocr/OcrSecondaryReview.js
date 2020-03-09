import React from "react";
import { connect } from "react-redux";
import { saveSRToggleValAction, setAssignSRDocsToAction, setSRDocsCountAction, saveSelectedSRListAction, clearSRSearchElemAction, setAssignRemainingSRDocsAction } from "../../../actions/ocrActions";
import { Checkbox } from "primereact/checkbox";

@connect((store) => {
    return{
        sRList : store.ocr.sRList,
        sRToggleFlag : store.ocr.sRToggleFlag,
        sRassignDocsTo : store.ocr.sRassignDocsTo,
        selectedSRList : store.ocr.selectedSRList,
        sRSearchElement : store.ocr.sRSearchElement,
    };
})

export class OcrSecondaryReview extends React.Component{
    constructor(props){
        super(props);
    }

    saveSecondaryReviwerToggleVal(e){
        this.props.dispatch(saveSRToggleValAction(e.target.checked))
      }
      setSRAssignDocsType(e){
          this.props.dispatch(setAssignSRDocsToAction(e.target.value))
      }
      saveSRDocsCount(e){
          this.props.dispatch(setSRDocsCountAction(e.target.value));
      }
      saveSelectedSRList(e){
        let curSRSelUsers = [...this.props.selectedSRList];
        if(e.target.checked)
            curSRSelUsers.push(e.target.value)
        else
            curSRSelUsers.splice(curSRSelUsers.indexOf(e.value), 1)
            this.props.dispatch(saveSelectedSRListAction(curSRSelUsers))
      }
      handleSelectAllSR(e){
          let nameList = [];
        if(e.target.checked){
          nameList = e.target.value.filter(i=>i.ocr_profile.role.includes(3)).map(function (el) { return el.username; });
          this.props.dispatch(saveSelectedSRListAction(nameList));
        }else{
            this.props.dispatch(saveSelectedSRListAction(nameList));
        }
      }
      saveSRSearchElem(e){
        this.props.dispatch(saveSRSearchElemAction(e.target.value));
      }
      clearSRSearchElem(e){
        $("#searchSR")[0].value = ""
        this.props.dispatch(clearSRSearchElemAction());
      }
      setAssignRemainingSRDocs(e){
        this.props.dispatch(setAssignRemainingSRDocsAction(e.target.value));
      }

    render() {
        let sReviewerTable = ""
        if(Object.keys(this.props.sRList).length === 0){
            sReviewerTable = <div className="noOcrUsers">
                <span>No Users Found<br/></span>
            </div>
        }else {
            let sRListCount = (this.props.sRList.data.filter(i=>i.ocr_profile.role.includes(3)) ).length
            sReviewerTable = 
                <table className = "table table-bordered table-hover" style={{background:"#FFF"}}>
                    <thead><tr>
                        <th className="text-center xs-pr-5" style={{width:"80px"}}><Checkbox id="selectAllSR" value={this.props.sRList.data} onChange={this.handleSelectAllSR.bind(this)} checked={(sRListCount === this.props.selectedSRList.length)?true:false}/></th>
                        <th style={{width:"40%"}}>NAME</th>
                        <th>EMAIL</th>
                    </tr></thead>
                    <tbody>
                        {this.props.sRList.data.map((item, index) => {
                            if(item.ocr_profile.role.includes(3)){
                                return (
                                    <tr>
                                        <td className="text-center"><Checkbox id={item.ocr_profile.slug} value={item.username} onChange={this.saveSelectedSRList.bind(this)} checked={this.props.selectedSRList.includes(item.username)}/></td>
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
            <div className="ocrSecondaryReview">
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <div className="checkbox checbox-switch switch-success">
                                <label>
                                    <input type="checkbox" name="sRToggleFlag" checked={this.props.sRToggleFlag} onChange={this.saveSecondaryReviwerToggleVal.bind(this)} />
                                    <span></span>
                                    Enable automatic reviewer assignment<br/>
                                    <small>when enabled, documents that are verified will be assigned to auditors according to your choices below</small>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                {this.props.sRToggleFlag && 
                <div>
                    <div className="row">
                    <div className="col-md-12">
                        <h4>Select sampling procedure for Audit</h4>
                        <div className="row col-md-8" style={{margin:"0px"}}>
                            <div className="ma-radio">
                                <input type="radio" name="assignSRDocsTo" value="all" id="assignSRDocsToAll" onClick={this.setSRAssignDocsType.bind(this)} />
                                <label for="assignSRDocsToAll">Distribute documents randomnly and evenly</label>
                            </div>
                            {this.props.sRassignDocsTo === "all" &&
                                <div className="row">
                                    <label className="label-control col-md-5 xs-ml-50 mandate" for="sRdocsCountToAll">Maximum number of documents per Auditor</label>
                                    <div className="col-md-3">
                                        <input type="number" className="form-control inline" id="sRdocsCountToAll" name="sRdocsCount" placeholder="Enter Number..." onInput={this.saveSRDocsCount.bind(this)} />
                                    </div>
                                </div>
                            }
                            <div className="ma-radio">
                                <input type="radio" name="assignSRDocsTo" value="selected" id="assignSRDocsToSelect" onClick={this.setSRAssignDocsType.bind(this)}/>
                                <label for="assignSRDocsToSelect">Distribute documents randomnly and evenly from each of the reviewer</label>
                            </div>
                            {this.props.sRassignDocsTo === "selected" &&
                                <div className="row">
                                    <label className="label-control col-md-5 xs-ml-50 mandate" for="sRdocsCountToSelect">Maximum number of documents per Auditor</label>
                                    <div className="col-md-3">
                                        <input type="number" className="form-control inline" id="sRdocsCountToSelect" name="sRdocsCount" placeholder="Enter Number..." onInput={this.saveSRDocsCount.bind(this)} />
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
                        <h4>Reviewers ({this.props.selectedSRList.length})</h4>
                        <div className="pull-right xs-mb-10">
                            <input type="text" id="searchSR" className="form-control" style={{marginTop:"-30px"}} placeholder="Search..." onKeyUp={this.saveSRSearchElem.bind(this)} />
                            <button className="close-icon" style={{marginLeft:"15%"}} onClick={this.clearSRSearchElem.bind(this)} type="reset"></button>
                        </div>
                        <div className="clearfix"></div>
                        <div className="table-responsive">
                            {sReviewerTable}
                        </div>
                        <hr/>
                        <div className="row">
                            <div className="col-md-12">
                                <h4>How would you like to assign any remaining documents?</h4>
                                <div className="ma-radio">
                                    <input type="radio" name="assignRemaningSRDocs" value="sr1" id="sr1" onClick={this.setAssignRemainingSRDocs.bind(this)} />
                                    <label for="sr1">Continue to distribute even if limits are met</label>
                                </div>
                                <div className="ma-radio">
                                    <input type="radio" name="assignRemaningSRDocs" value="sr2" id="sr2" onClick={this.setAssignRemainingSRDocs.bind(this)} />
                                    <label for="sr2">Leave unassigned</label>
                                </div>
                                <div className="ma-radio">
                                    <input type="radio" name="assignRemaningSRDocs" value="sr3" id="sr3" onClick={this.setAssignRemainingSRDocs.bind(this)} />
                                    <label for="sr3">Select auditors to assign</label>
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