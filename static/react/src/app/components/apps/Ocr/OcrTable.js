import React from 'react'
import { Link } from 'react-router-dom';
import { getOcrUploadedFiles, saveImagePageFlag, saveDocumentPageFlag, saveImageDetails, storeOcrSortElements, updateCheckList, storeOcrFilterStatus, storeOcrFilterConfidence, storeOcrFilterAssignee, storeDocSearchElem } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
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
    revDocumentFlag:store.ocr.revDocumentFlag,
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

  handleImagePageFlag = (slug) => {
    this.getImage(slug)
    this.props.dispatch(saveImagePageFlag(true));
  }

  getImage = (slug) => {
    return fetch(API + '/ocr/ocrimage/get_images/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": slug })
    }).then(response => response.json())
      .then(data => {
        this.props.dispatch(saveImageDetails(data));
      });
  }
  sortOcrList(sortBy, sortOrder) {
    this.props.dispatch(storeOcrSortElements(sortBy, sortOrder))
    this.props.dispatch(getOcrUploadedFiles())
  }

  filterOcrList(filtertBy, filterOn) {
    switch (filterOn) {
      case 'status':
        this.props.dispatch(storeOcrFilterStatus(filtertBy))
        break;
      case 'confidence':
        this.props.dispatch(storeOcrFilterConfidence(filtertBy))
        break;
      case 'assignee':
        this.props.dispatch(storeOcrFilterAssignee(filtertBy))
        break;
    }
    this.props.dispatch(getOcrUploadedFiles())
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
    this.setState({ showRecognizePopup: true, loader: true,recognized:false })
    return fetch(API + '/ocr/ocrimage/extract/', {
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(postData)
    }).then(response => response.json()).then(json => {
      if (json.map(i=>i.status).includes("ready_to_verify"))
        this.setState({ loader: false, recognized: true})
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
  handleExport=()=>{
    if (this.state.checkedList.length == 0) {
      bootbox.alert("Please select the image file to export.")
      return false;
    }

    // this.props.dispatch(updateCheckList(this.state.checkedList))
    // var exportData = {
    //   'slug': this.state.checkedList,
    //   'format': 'json'
    // }
    // return fetch(API + '/ocr/ocrimage/export_data/', {
    //   method: "post",
    //   headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
    //   body: JSON.stringify(exportData)
    // }).then(response => response.json()).then(json => {
    //   console.log(json,"ppppppppppppppppp");
    // })
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
          <Button id="dataCloseBtn" onClick={this.closePopup.bind(this)} bsStyle="primary">Cancel</Button>
          <Button id="loadDataBtn" onClick={this.proceedClick.bind(this)} disabled={this.state.loader}  bsStyle="primary">Proceed</Button>
          
        </Modal.Footer>
      </Modal>
    </div>)

    var OcrTableHtml = (
      this.props.OcrDataList != '' ? (this.props.OcrDataList.data.length != 0 ? this.props.OcrDataList.data.map((item, index) => {
        return (
          <tr id={index}>
            <td>
              <Checkbox id={item.slug} value={item.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.slug)}></Checkbox>
            </td>
            <td>
              <i class="fa fa-file-text"></i>
            </td>
            <td style={item.status=="ready_to_recognize"?{cursor:'not-allowed'}: {cursor:'pointer'}}>
              <Link style={item.status=="ready_to_recognize"?{pointerEvents:'none'}:{pointerEvents:'auto'}} to={item.name} onClick={() => { this.handleImagePageFlag(item.slug) }}>{item.name}</Link>
           </td>
            <td>{item.status}</td>
            <td>{item.flag}</td>
            <td>{item.fields}</td>
            <td>{item.confidence}</td>
            <td>{item.assignee}</td>
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
          { this.props.revDocumentFlag?(<ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-arrow-circle-left"></i> Reviewers</a></li>
              <li class="breadcrumb-item active"><a href="#">{this.props.reviewerName}</a></li>
            </ol>):(<ol class="breadcrumb">
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
              <button class="btn btn-default btn-rounded" id="btn_r2" onClick={this.handleExport}><i class="fa fa-paper-plane"></i> Export</button>
            </div>
          </div>:"":""}
        </div>
        {/* <div class="tab-container">
          <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item active"><a class="nav-link" href="#pActive" data-toggle="tab" role="tab" aria-expanded="false">Active</a></li>
                <li class="nav-item "><a class="nav-link" href="#pBacklog" data-toggle="tab" onClick={()=>alert('hello')} role="tab" aria-expanded="true">Backlog</a></li>  
          </ul>

        <div class="tab-content">
          <div class="tab-pane" id="pActive" role="tabpanel">  nav link*/ }
            <div className="table-responsive noSwipe xs-pb-10">
          {/* if total_data_count_wf <=1 then only render table else show panel box */}
            {this.props.OcrDataList != '' ? this.props.OcrDataList.total_data_count_wf >= 1 ? (
            <table id="documentTable" className="tablesorter table table-condensed table-hover cst_table ocrTable">
             <thead>
              <tr>
                <th></th>
                <th><i class="fa fa-file-text-o"></i></th>
                <th>NAME
                  </th>
                <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" disable class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                    <span>STATUS</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, '', 'status')} name='all'>All</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 1, 'status')} name="ready to recognize">Ready to Recognize</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 2, 'status')} name="ready to verify">Ready to Verify</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 3, 'status')} name="ready to export">Ready to Export</a></li>
                  </ul>
                </th>
                <th>
                  Template
				      	</th>
                <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                    <span>Fields</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">

                    <li><a class="cursor" name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                    <li><a class="cursor" name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                    <li><a class="cursor" name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                  </ul>
                </th>
                <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                    <span>ACCURACY</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, '', 'confidence')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'E', 'confidence')} name="equal" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'G', 'confidence')} name="greater" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                    <li><a class="cursor" onClick={this.filterOcrList.bind(this, 'L', 'confidence')} name="less" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
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
                     <OcrUpload uploadMode={'mainPanel'}/>
                    <span class="class">Add a workflow by clicking on the above icon</span>
                  </div>
                </div>
              </div>
            </div>)
            : (<img id="loading" style= {{paddingTop:0}} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
          }
          {paginationTag}
          {ShowModel}
        </div>
        </div>
      //   </div>
      //   </div> nav link
      // </div>
    )
  }
}