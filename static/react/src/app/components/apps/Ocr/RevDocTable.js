import React from 'react'
import { Link } from 'react-router-dom';
import { getRevrDocsList, saveImagePageFlag,saveImageDetails, updateCheckList, storeOcrFilterStatus, storeOcrFilterConfidence, storeOcrFilterAssignee, storeDocSearchElem } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
import { Pagination } from "react-bootstrap";
import { STATIC_URL } from '../../../helpers/env';
import { Checkbox } from 'primereact/checkbox';
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import { OcrUpload } from "./OcrUpload";
import { API } from "../../../helpers/env"

@connect((store) => {
  return {
    login_response: store.login.login_response,
    OcrRevwrDocsList: store.ocr.OcrRevwrDocsList,
    documentFlag: store.ocr.documentFlag,
    revDocumentFlag:store.ocr.revDocumentFlag,
    reviewerName: store.ocr.selected_reviewer_name
  };
})

export class RevDocTable extends React.Component {
  constructor(props) {
    super(props)
    this.props.dispatch(getRevrDocsList())
    this.state = {
      checkedList: [],
    }
  }

  getHeader = token => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  };
  handlePagination = (pageNo) => {
    this.props.dispatch(getRevrDocsList())
  }

  handleImagePageFlag = (slug) => {
    // this.getImage(slug)
    // this.props.dispatch(saveImagePageFlag(true));
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


  filterOcrList(filtertBy, filterOn) {
    // switch (filterOn) {
    //   case 'status':
    //     this.props.dispatch(storeOcrFilterStatus(filtertBy))
    //     break;
    //   case 'confidence':
    //     this.props.dispatch(storeOcrFilterConfidence(filtertBy))
    //     break;
    //   case 'assignee':
    //     this.props.dispatch(storeOcrFilterAssignee(filtertBy))
    //     break;
    // }
    // this.props.dispatch(getOcrUploadedFiles())
  }

  handleCheck = (e) => {
    let updateList = [...this.state.checkedList];
    e.checked ? updateList.push(e.value) : updateList.splice(updateList.indexOf(e.value), 1);
    this.setState({ checkedList: updateList });
  }

  render() {
    const pages = this.props.OcrRevwrDocsList.total_number_of_pages;
    const current_page = this.props.OcrRevwrDocsList.current_page;
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

    var OcrRevDocTableHtml = (
      this.props.OcrRevwrDocsList != '' ? (this.props.OcrRevwrDocsList.data.length != 0 ? this.props.OcrRevwrDocsList.data.map((item, index) => {
        return (
          <tr id={index}>
            <td>
              <Checkbox id={item.ocrImageData.slug} value={item.ocrImageData.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.ocrImageData.slug)}></Checkbox>
            </td>
            <td>
              <i class="fa fa-file-text"></i>
            </td>
            <td><Link to={item.ocrImageData.imagefile} onClick={() => { this.handleImagePageFlag(item.ocrImageData.slug) }}>{item.ocrImageData.name}</Link></td>
            <td>{item.status}</td>
            <td>{item.fields}</td>
            <td>{item.confidence}</td>
            <td>{new Date(item.created_on).toLocaleString().split(',')[0]}</td>
            <td>{new Date(item.modified_at).toLocaleString().split(',')[0]}</td>
            <td>{item.modified_by}</td>
          </tr>
        )
      }
      )
        : (<tr><td className='text-center' colSpan={9}>"No data found for your selection"</td></tr>)
      )
        : (<img id="loading" style={{ position: 'relative', left: '600px' }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
    )

    return (
      <div>
        <div class="row">
          <div class="col-sm-6">
          <ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-arrow-circle-left"></i> Reviewers</a></li>
              <li class="breadcrumb-item active"><a href="#">{this.props.reviewerName}</a></li>
            </ol>
          </div>
        </div>
            <div className="table-responsive noSwipe xs-pb-10">
          {/* if total_data_count_wf <=1 then only render table else show panel box */}
            {this.props.OcrRevwrDocsList != '' ? this.props.OcrRevwrDocsList.total_data_count>= 1 ? (
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
                <th>Created</th>
                <th>Modified</th>
                <th>Modified By</th>
              </tr>
             </thead>
             <tbody className="no-border-x">
              {OcrRevDocTableHtml}
             </tbody>
            </table>)
            :
           (<div><br/><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
            : (<img id="loading" style= {{paddingTop:0}} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
          }
          {paginationTag}
        </div>
        </div>
    )
  }
}