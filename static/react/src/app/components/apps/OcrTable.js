import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import { getOcrUploadedFiles,saveImagePageFlag } from '../../actions/ocrActions'
import { connect } from "react-redux";
import { store } from '../../store'
import { Pagination } from "react-bootstrap";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    OcrDataList: store.ocr.OcrDataList,
  };
})

export class OcrTable extends React.Component {

  constructor(props) {
    super(props)
    this.props.dispatch(getOcrUploadedFiles())
  }

  handleSelect(pageNo) {
    this.props.dispatch(getOcrUploadedFiles(pageNo))
  }

  handleImagePageFlag=()=>{
    this.props.dispatch(saveImagePageFlag(true));
  }

  render() {
    const pages = this.props.OcrDataList.total_number_of_pages;
    const current_page = this.props.OcrDataList.current_page;
    let paginationTag = null
    if (pages > 1) {
      paginationTag = <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handleSelect.bind(this)} first last next prev boundaryLinks items={pages} activePage={current_page} />
    }

    var OcrTableHtml = (
      this.props.OcrDataList != "" ? (this.props.OcrDataList.data.map((item, index) => {
        return (<tr id={index}>
          <td>
            <div class="ma-checkbox inline">
              <input type="checkbox" className="needsclick" />
              <label for="myCheckAll"></label>
            </div>
          </td>
          <td><a href="#" onClick={this.handleImagePageFlag}>{item.name}</a></td>
          <td>{item.status}</td>
          <td></td>
          <td></td>
          <td>{item.comment}</td>
        </tr>
        )
      })) : (<div>Fetching data...</div>)
    )

    return (
      <div class="row">
        <div class="col-md-12">
          <div className="panel box-shadow ">
            <div class="panel-body no-border xs-p-20">
              <div className="table-responsive noSwipe xs-pb-10">
                <table id="dctable" className="tablesorter table table-condensed table-hover cst_table ocrTable">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown" style={{marginRight: "45px"}} class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                          <span>Status</span> <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" name="ready to verify">Ready to Verify</a></li>
                          <li><a class="cursor" name="ready to export">Ready to Export</a></li>
                        </ul>
                      </th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown" style={{marginRight: "45px"}} class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                          <span>Confidence Level</span> <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                          <li><a class="cursor" name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                          <li><a class="cursor" name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                        </ul>
                      </th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown" style={{marginRight: "45px"}} class="dropdown-toggle cursor" title="Assignee" aria-expanded="true">
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
                    {OcrTableHtml}
                  </tbody>
                </table>
                <div class="col-md-12 text-center">
                  <div className="footer" id="Pagination">
                    <div className="pagination">
                      {paginationTag}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}