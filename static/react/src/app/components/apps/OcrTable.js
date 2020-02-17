import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import { getOcrUploadedFiles,saveImagePageFlag,saveImageDetails } from '../../actions/ocrActions'
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { getOcrUploadedFiles,saveImagePageFlag ,storeOcrSortElements,updateCheckList,storeOcrFilterStatus,storeOcrFilterConfidence,storeOcrFilterAssignee} from '../../actions/ocrActions'
import { connect } from "react-redux";
import { store } from '../../store'
import { Pagination,Button } from "react-bootstrap";
import { STATIC_URL } from '../../helpers/env';
import {Checkbox} from 'primereact/checkbox';

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
    this.state={
      checkedList:[],
    }
  }

  handlePagination=(pageNo)=> {
    this.props.dispatch(getOcrUploadedFiles(pageNo))
  }

  handleImagePageFlag=()=>{
    this.props.dispatch(saveImageDetails());
    this.props.dispatch(saveImagePageFlag(true));
  }

  sortOcrList(sortBy,sortOrder){
    this.props.dispatch(storeOcrSortElements(sortBy,sortOrder))
    this.props.dispatch(getOcrUploadedFiles())
  }

  filterOcrList(filtertBy,filterOn){
   switch(filterOn){
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

  handleCheck=(e)=>{
    let updateList = [...this.state.checkedList];
    e.checked?updateList.push(e.value):updateList.splice(updateList.indexOf(e.value), 1); 
    this.setState({checkedList: updateList});
  }

  handleRecognise=()=>{
    if(this.state.checkedList.length==0){
      bootbox.alert("Please select image files to recognize.") 
      return false;
    }
    this.props.dispatch(updateCheckList(this.state.checkedList))
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

    var OcrTableHtml = (
      this.props.OcrDataList != ''? (this.props.OcrDataList.data.length!=0 ? this.props.OcrDataList.data.map((item, index) => {
        return (
        <tr id={index}>
          <td>
           <Checkbox id={item.slug} value={item.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.slug)}></Checkbox>
          </td>
          <td><Link to={"/apps/ocr-mq44ewz7bp/document/" + item.name} onClick={this.handleImagePageFlag}>{item.name}</Link></td>
          <td>{item.status}</td>
          <td>{item.confidence}</td>
          <td>{}</td>
          <td>{item.comment}</td>
        </tr>
        )}
      ) 
      : (<tr><td className='text-center' colSpan={6}>"No data found for your selection"</td></tr>)
      )
      : (<img id="loading" style={{position:'relative',left:'500px'}} src={ STATIC_URL + "assets/images/Preloader_2.gif" } />)
    )

    return (
      <div class="row">
        <div class="col-md-12">
          <div className="panel box-shadow ">
            <div class="panel-body no-border xs-p-20">
            <Button onClick={this.handleRecognise}>Recognize</Button>
              <div className="table-responsive noSwipe xs-pb-10">
                <table id="ocrSort" className="tablesorter table table-condensed table-hover cst_table ocrTable">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name
                      {/* <img onClick={this.sortOcrList.bind(this,'name','desc')}src={STATIC_URL+"assets/images/ice-desc.gif"}></img> */}
                      {/* <img onClick={this.sortOcrList.bind(this,'name','asc')}src={STATIC_URL+"assets/images/ice-asc.gif"}></img> */}
                      </th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown" disable class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                          <span>Status</span> <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,'','status')} name='all'>All</a></li>
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,1,'status')} name="ready to recognize">Ready to Recognize</a></li>
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,2,'status')} name="ready to verify">Ready to Verify</a></li>
                          <li><a class="cursor" onClick={this.filterOcrList.bind(this,3,'status')} name="ready to export">Ready to Export</a></li>
                        </ul>              
                      </th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown"  class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                          <span>Confidence Level</span> <b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor"   onClick={this.filterOcrList.bind(this,'','confidence')}  name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                          <li><a class="cursor"   onClick={this.filterOcrList.bind(this,'E','confidence')}  name="equal" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                          <li><a class="cursor"   onClick={this.filterOcrList.bind(this,'G','confidence')}  name="greater" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                          <li><a class="cursor"   onClick={this.filterOcrList.bind(this,'L','confidence')}  name="less" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                        </ul>
                      </th>
                      <th class="dropdown" >
                        <a href="#" data-toggle="dropdown"  class="dropdown-toggle cursor" title="Assignee" aria-expanded="true">
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
                  {paginationTag}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}