import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import { getOcrUploadedFiles,saveImagePageFlag ,storeOcrSortElements} from '../../actions/ocrActions'
import { connect } from "react-redux";
import { store } from '../../store'
import { Pagination } from "react-bootstrap";
import tinysort from 'tinysort';
import { STATIC_URL } from '../../helpers/env';


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

//   componentDidMount() {


//     var table = document.getElementById('dctable'),
//     tableHead = table.querySelector('thead'),
//     tableHeaders = tableHead.querySelectorAll('th'),
//     tableBody = table.querySelector('tbody');


// tableHead.addEventListener('click', function (e) {
//     var tableHeader = e.target,
//         textContent = tableHeader.textContent,
//         tableHeaderIndex, isAscending, order;
//     while (tableHeader.nodeName !== 'TH') {
//         tableHeader = tableHeader.parentNode;
//     }
//     tableHeaderIndex = Array.prototype.indexOf.call(tableHeaders, tableHeader);
//     isAscending = tableHeader.getAttribute('data-order') === 'asc';
//     order = isAscending ? 'desc' : 'asc';

//     //reset other columns
//     $('#backpackGrid').find('th').removeClass('asc desc').attr('data-order','none').attr('aria-sort','none');


//     //set order on clicked header
//     tableHeader.setAttribute('data-order', order);

//     /* accessibility */
//     //set aria sort attr
//     tableHeader.setAttribute('aria-sort', order);
//     tableHeader.setAttribute("class", order);
//     // build aria-live message
//     var sortOrder;
//     if (isAscending) {
//         sortOrder = "Ascending order";
//     } else {
//         sortOrder = "Descending order";
//     }
    
//     /* end accessibility */
    
//     // call tinysort
//     tinysort(
//     tableBody.querySelectorAll('tr'), {
//         selector: 'td:nth-child(' + (tableHeaderIndex + 1) + ')',
//         order: order
//     });
// });

//     $("#dctable").addSortWidget();



//   }

  handleSelect(pageNo) {
    this.props.dispatch(getOcrUploadedFiles(pageNo))
  }

  handleImagePageFlag=()=>{
    this.props.dispatch(saveImagePageFlag(true));
  }

  sortOcrList(sortBy,sortOrder){
    this.props.dispatch(storeOcrSortElements(sortBy,sortOrder))
    
    this.props.dispatch(getOcrUploadedFiles())
  }

  filterOcrList(filtertBy){
    alert(filtertBy,"hello")
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
                <table id="ocrSort" className="tablesorter table table-condensed table-hover cst_table ocrTable">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name<img onClick={this.sortOcrList.bind(this,'name','desc')}src={STATIC_URL+"assets/images/ice-desc.gif"}></img>
                      <img onClick={this.sortOcrList.bind(this,'name','asc')}src={STATIC_URL+"assets/images/ice-asc.gif"}></img></th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown" style={{marginRight: "45px"}} class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                          <span>Status</span> <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,'verify')} name="ready to verify">Ready to Verify</a></li>
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,'export')} name="ready to export">Ready to Export</a></li>
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