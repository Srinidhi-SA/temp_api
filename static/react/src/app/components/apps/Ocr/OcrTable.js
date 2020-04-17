import React from 'react'
import { Link } from 'react-router-dom';
import { getOcrUploadedFiles, saveImagePageFlag, saveDocumentPageFlag, saveImageDetails,saveSelectedImageName, storeOcrSortElements, updateCheckList, storeOcrFilterStatus, storeOcrFilterConfidence, storeOcrFilterAssignee, storeDocSearchElem, tabActiveVal, storeOcrFilterFields } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import store from "../../../store";
import { Modal, Pagination, Button } from "react-bootstrap";
import { STATIC_URL } from '../../../helpers/env';
import { Checkbox } from 'primereact/checkbox';
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import { OcrUpload } from "./OcrUpload";
import { API } from "../../../helpers/env"


@connect((store) => {
  return {
    login_response: store.login.login_response,
    OcrDataList: store.ocr.OcrDataList,
    documentFlag: store.ocr.documentFlag,
    projectName: store.ocr.selected_project_name,
    revDocumentFlag: store.ocr.revDocumentFlag,
    reviewerName: store.ocr.selected_reviewer_name
  };
})

export class OcrTable extends React.Component {
  constructor(props) {
    super(props)
    this.props.dispatch(getOcrUploadedFiles())
    this.state = {
      checkedList: [],
      showRecognizePopup: false,
      recognized: false,
      loader: false,
      exportName: "",
      tab: 'pActive',
      filterVal:'',
      exportType: "json",
    }
  }

  componentWillUnmount() {
    this.props.dispatch(saveDocumentPageFlag(false));
  }
  getHeader = token => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  };
  handlePagination = (pageNo) => {
    this.props.dispatch(getOcrUploadedFiles(pageNo))
  }

  handleImagePageFlag = (slug,name) => {
    this.getImage(slug)
    this.props.dispatch(saveSelectedImageName(name));
    this.props.dispatch(saveImagePageFlag(true));
  }

  getImage = (slug) => {
    return fetch(API + '/ocr/ocrimage/' + slug + '/', {
      method: 'get',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
    }).then(response => response.json())
      .then(data => {
        this.props.dispatch(saveImageDetails(data));
      });
  }
  sortOcrList(sortBy, sortOrder) {
    this.props.dispatch(storeOcrSortElements(sortBy, sortOrder))
    this.props.dispatch(getOcrUploadedFiles())
  }

  handleFil(mode){
    this.disableInputs(mode,'')
    this.setState({filterVal:mode})
  }
 
  disableInputs(mode,reset){
     let  idList=''
     mode[0]=="C"? idList= ['CEQL','CGTE','CLTE']:idList= ['FEQL','FGTE','FLTE']
     
     let disableIds=reset!='reset'?idList.filter(i=>i!=mode):idList
 
     if(document.getElementById(mode).value.trim()!='')
     disableIds.map(i=>$(`#${i}`).attr('disabled', true))
     else
     disableIds.map(i=>$(`#${i}`).attr('disabled', false))
  }

  filterOcrList(filtertBy, filterOn,reset) {
     var filterByVal=''
     if(reset!='reset'){
       let numericVal=$(`#${this.state.filterVal}`).val().trim();
      filterByVal = (filterOn==('confidence')||(filterOn=='fields'))?numericVal!=''?(this.state.filterVal.slice(1,4)+numericVal):"":filtertBy;
      }
     switch (filterOn) {
       case 'status':
         this.props.dispatch(storeOcrFilterStatus(filterByVal))
         break;
       case 'confidence':
         this.props.dispatch(storeOcrFilterConfidence(filterByVal))
         break;
       case 'assignee':
         this.props.dispatch(storeOcrFilterAssignee(filterByVal))
         break;
       case 'fields':
         this.props.dispatch(storeOcrFilterFields(filterByVal))
         break;
     }
     this.props.dispatch(getOcrUploadedFiles())
     if(reset=='reset'){
       document.getElementById(this.state.filterVal).value=''
       this.disableInputs(this.state.filterVal,'reset')
     }
  }

  handleCheck = (e) => {
    let updateList = [...this.state.checkedList];
    e.checked ? updateList.push(e.value) : updateList.splice(updateList.indexOf(e.value), 1);
    this.setState({ checkedList: updateList });
  }

  handleRecognise = () => {
    if (this.state.checkedList.length == 0) {
      bootbox.alert("Please select the image file to recognize.")
      return false;
    }
    this.props.dispatch(updateCheckList(this.state.checkedList))
    var postData = {
      'slug': this.state.checkedList
    }
    this.setState({ showRecognizePopup: true, loader: true, recognized: false })
    return fetch(API + '/ocr/ocrimage/extract/', {
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(postData)
    }).then(response => response.json()).then(json => {
      if (json.map(i => i.status).includes("ready_to_verify"))
        this.setState({ loader: false, recognized: true })
    })

  }

  closePopup() {
    this.setState({ showRecognizePopup: false })
  }

  proceedClick() {
    this.closePopup()
    this.props.dispatch(getOcrUploadedFiles())
  }
  handleSearchBox() {
    var searchElememt = document.getElementById('search').value.trim()
    this.props.dispatch(storeDocSearchElem(searchElememt))
    this.props.dispatch(getOcrUploadedFiles())
  }

  filterByImageStatus(e) {
    this.props.dispatch(tabActiveVal(e.target.id))
    this.props.dispatch(getOcrUploadedFiles())
  }

  handleExport = () => {
    let dataList = this.props.OcrDataList.data;
    let checkList = this.state.checkedList;
    let statusList = [];
    for (var i = 0; i < checkList.length; i++) {
      let val = dataList.filter(j => j.slug == checkList[i])[0].status;
      statusList.push(val);
    }
    if (this.state.checkedList.length == 0) {
      bootbox.alert("Please select the file to export.")
      return false;
    }
    else if (this.state.checkedList.length > 1) {
      bootbox.alert("Please select only one file to export.")
      return false;
    }
    else if (statusList != "ready_to_export") {
      bootbox.alert("Please select the file with status ready to export.")
      return false;
    }

    this.props.dispatch(updateCheckList(this.state.checkedList));
    this.setState({ exportName: dataList.filter(i => i.slug == checkList)[0].name })
    var exportData = {
      'slug': this.state.checkedList,
      'format': this.state.exportType,
    }
    if(this.state.exportType==="json"){
    return fetch(API + '/ocr/ocrimage/export_data/', {
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(exportData)
    }).then(response => response.json()).then(json => {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
      var dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `${this.state.exportName}.json`);
      dlAnchorElem.click();
    })
  }
  else if(this.state.exportType==="xml"){
    return fetch(API + '/ocr/ocrimage/export_data/', {
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(exportData)
    }).then(response => response.text()).then(json => {
      var dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(json);
      var dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `${this.state.exportName}.xml`);
      dlAnchorElem.click();
    })
  }
  else if(this.state.exportType==="csv"){
    return fetch(API + '/ocr/ocrimage/export_data/', {
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(exportData)
    }).then(response => response.text()).then(json => {
      var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
      var dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `${this.state.exportName}.csv`);
      dlAnchorElem.click();
    })
  }
}
  render() {
    const pages = this.props.OcrDataList.total_number_of_pages;
    const current_page = this.props.OcrDataList.current_page;
    let paginationTag = null
    if (pages > 1) {
      paginationTag = (
        <div class="col-md-12 text-center">
          <div className="footer" id="Pagination">
            <div className="pagination">
              <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handlePagination} first last next prev boundaryLinks items={pages} activePage={current_page} />
            </div>
          </div>
        </div>
      )
    }

    var getAssigneeOptions = (this.props.OcrDataList != '' ? this.props.OcrDataList.data.length != 0 ? [...new Set(this.props.OcrDataList.data.map(i => i.assignee).filter(j => j != null))].map(item => {
      return <li><a class="cursor" onClick={this.filterOcrList.bind(this, item, 'assignee')} name="all" data-toggle="modal" data-target="#modal_equal"> {item}</a></li>
    }
    ) : '' : '')

    var ShowModel = (<div id="uploadData" role="dialog" className="modal fade modal-colored-header">
      <Modal show={this.state.showRecognizePopup} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
        <Modal.Header closeButton>
          <h3 className="modal-title">Recognize Data</h3>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }} >
          <div className="row" style={{ margin: 0 }}>
            {(this.state.loader && !this.state.recognized) &&
              <div style={{ height: 310, background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
                <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
              </div>
            }
            {this.state.recognized &&
              <div className="col-md-12 ocrSuccess">
                <img className="wow bounceIn" data-wow-delay=".75s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10" src={STATIC_URL + "assets/images/success_outline.png"} style={{ height: 105, width: 105 }} />

                <div className="wow bounceIn" data-wow-delay=".25s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10">
                  <span style={{ paddingTop: 10, color: 'rgb(50, 132, 121)', display: 'block' }}>Recognized Successfully</span></div>
              </div>
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div id="resetMsg"></div>
          <Button id="Rd_dataCloseBtn" onClick={this.closePopup.bind(this)} bsStyle="primary">Cancel</Button>
          <Button id="Rd_loadDataBtn" onClick={this.proceedClick.bind(this)} disabled={this.state.loader} bsStyle="primary">Proceed</Button>

        </Modal.Footer>
      </Modal>
    </div>)

    var OcrTableHtml = (
      this.props.OcrDataList != '' ? (this.props.OcrDataList.data.length != 0 ? this.props.OcrDataList.data.map((item, index) => {
        return (
          <tr id={index}>
            <td>
              <Checkbox id={item.slug} name={item.name} value={item.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.slug)}></Checkbox>
            </td>
            <td>
              <i class="fa fa-file-text"></i>
            </td>
            <td style={item.status == "ready_to_recognize" ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}>
              <Link style={item.status == "ready_to_recognize" ? { pointerEvents: 'none' } : { pointerEvents: 'auto' }} to={item.name} onClick={() => { this.handleImagePageFlag(item.slug,item.name) }}>{item.name}</Link>
            </td>
            <td>{item.status}</td>
            <td>{item.flag}</td>
            <td>{item.fields}</td>
            <td>{item.confidence}</td>
            {store.getState().ocr.tabActive=='active'?<td>{item.assignee}</td>:''}
            <td>{item.created_by}</td>
            <td>{item.modified_by}</td>
            <td>{new Date(item.modified_at).toLocaleString()}</td>
          </tr>
        )
      }
      )
        : (<tr><td className='text-center' colSpan={11}>"No data found for your selection"</td></tr>)
      )
        : (<img id="loading" style={{ position: 'relative', left: '600px' }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
    )

    return (
      <div>
        <div class="row">
          <div class="col-sm-6">
            <a id="downloadAnchorElem" style={{ display: 'none' }}></a>
            {this.props.revDocumentFlag ? (<ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-arrow-circle-left"></i> Reviewers</a></li>
              <li class="breadcrumb-item active"><a href="#">{this.props.reviewerName}</a></li>
            </ol>) : (<ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-arrow-circle-left"></i> Projects</a></li>
              <li class="breadcrumb-item active"><a href="#">{this.props.projectName}</a></li>
            </ol>)
            }
          </div>

          {this.props.OcrDataList != '' ? this.props.OcrDataList.total_data_count_wf >= 1 ?
            <div class="col-sm-6 text-right">
              <div class="form-inline">
                <OcrUpload uploadMode={'topPanel'} />
                <div class="form-group xs-mr-5">
                  <input type="text" id="search" class="form-control btn-rounded" onKeyUp={this.handleSearchBox.bind(this)} placeholder="Search by name..."></input>
                </div>
                <Button onClick={this.handleRecognise}>Recognize</Button>
                {/* <button class="btn btn-default btn-rounded" id="exportBtn" onClick={this.handleExport}><i class="fa fa-paper-plane"></i> Export</button> */}

                <div class="form-group pull-right ocr_highlightblock">
                  <label class="control-label xs-mb-0" for="select_export" style={{ cursor: 'pointer' }} onClick={this.handleExport}><i class="fa fa-paper-plane"></i> Export to</label>
                  <select class="form-control inline-block 1-100" id="select_export" onChange={(e) => this.setState({ exportType: e.target.value })}>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

              </div>
            </div> : "" : ""}
        </div>



        <div class="tab-container">
          {this.props.OcrDataList != '' ? this.props.OcrDataList.total_data_count_wf >= 1 ? <ul className="nav nav-tabs" onClick={this.filterByImageStatus.bind(this)} style={{ cursor: "default" }}>
            <li className="active"><a data-toggle="tab" id="backlog" name="Backlog">Backlog</a></li>
            <li className=""><a data-toggle="tab" id="active" name="Active">Active</a></li>
          </ul> : "" : ""}

          <div className="tab-content">
            <div id="nav" className={this.state.tab === "pActive" ? "tab-pane fade in active" : "tab-pane fade"}>
              <div className="table-responsive noSwipe xs-pb-10" style={{minHeight:300}}>
                {/* if total_data_count_wf <=1 then only render table else show panel box */}
                {this.props.OcrDataList != '' ? this.props.OcrDataList.total_data_count_wf >= 1 ? (
                  <table id="documentTable" className="tablesorter table table-condensed table-hover cst_table ocrTable">
                    <thead>
                      <tr>
                        <th></th>
                        <th><i class="fa fa-file-text-o"></i></th>
                        <th>NAME</th>
                        <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" disable class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                            <span>STATUS</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a class="cursor" onClick={this.filterOcrList.bind(this, '', 'status')} name='all'>All</a></li>
                            <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'R', 'status')} name="ready to recognize">Ready to Recognize</a></li>
                            <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'V', 'status')} name="ready to verify">Ready to Verify</a></li>
                            <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'E', 'status')} name="ready to export">Ready to Export</a></li>
                          </ul>
                        </th>
                        <th>
                          Template
                    </th>
                        <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Fields" aria-expanded="true">
                            <span>Fields</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterOcrList.bind(this, '', 'fields','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}} >Equal to</a> 
                             <input id='FEQL' className='fields filter_input' onChange={this.handleFil.bind(this,'FEQL')} type='number'></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}} >Greater than</a>
                             <input id='FGTE' className='fields filter_input' onChange={this.handleFil.bind(this,'FGTE')} type='number'></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input id='FLTE' className='fields filter_input'  onChange={this.handleFil.bind(this,'FLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn"  onClick={this.filterOcrList.bind(this, '', 'fields','')}><i class="fa fa-check"></i></button>
                         </ul>
                        </th>
                        <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                            <span>ACCURACY</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterOcrList.bind(this, '', 'confidence','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}}>Equal to</a>
                             <input className='confidence filter_input'  id='CEQL' onChange={this.handleFil.bind(this,'CEQL')} type='number' ></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}}>Greater than</a>
                             <input className='confidence filter_input' id='CGTE' onChange={this.handleFil.bind(this,'CGTE')} type='number' ></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input className='confidence filter_input' id='CLTE' onChange={this.handleFil.bind(this,'CLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn" onClick={this.filterOcrList.bind(this, '', 'confidence','')}><i class="fa fa-check"></i></button>
                          </ul>
                        </th>
                        {store.getState().ocr.tabActive=='active'?<th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Assignee" aria-expanded="true">
                            <span>Assignee</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a class="cursor" onClick={this.filterOcrList.bind(this, '', 'assignee')} name='all'>All</a></li>
                            {getAssigneeOptions}
                          </ul>
                        </th>:''}
                        <th>Created By</th>
                        <th>Modified By</th>
                        <th>Last Modified</th>
                      </tr>
                    </thead>
                    <tbody className="no-border-x">
                      {OcrTableHtml}
                    </tbody>
                  </table>)
                  :
                  (<div class="panel">
                    <div class="panel-body">
                      <div class="xs-mt-3 xs-mb-3 text-center">
                        <div class="icon-container">
                          <OcrUpload uploadMode={'mainPanel'} />
                          <span class="class">Add a workflow by clicking on the above icon</span>
                        </div>
                      </div>
                    </div>
                  </div>)
                  : (<img id="loading" style={{ paddingTop: 0 }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
                }
                {paginationTag}
                {ShowModel}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}