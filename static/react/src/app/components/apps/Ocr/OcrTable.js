import React from 'react'
import { Link } from 'react-router-dom';
import { getOcrUploadedFiles,saveImagePageFlag,saveDocumentPageFlag,saveImageDetails,storeOcrSortElements,updateCheckList,storeOcrFilterStatus,storeOcrFilterConfidence,storeOcrFilterAssignee,storeDocSearchElem} from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
import { Modal,Pagination,Button } from "react-bootstrap";
import { STATIC_URL } from '../../../helpers/env';
import {Checkbox} from 'primereact/checkbox';
import { getUserDetailsOrRestart } from "../../../helpers/helper"
import { OcrUpload } from "./OcrUpload";
import {API} from "../../../helpers/env"

@connect((store) => {
  return {
    login_response: store.login.login_response,
    OcrDataList: store.ocr.OcrDataList,
    documentFlag: store.ocr.documentFlag,
  };
})

export class OcrTable extends React.Component {
  constructor(props) {
    super(props)
    this.props.dispatch(getOcrUploadedFiles())
    this.state={
      checkedList:[],
      showRecognizePopup:false,
      recognized:false,
      loader:false,     
    }
  }

  componentWillUnmount(){
    this.props.dispatch(saveDocumentPageFlag(false));
  }
  getHeader = token => {
    return {
      'Authorization': token, 
      'Content-Type': 'application/json'
    };
  };
  handlePagination=(pageNo)=> {
    this.props.dispatch(getOcrUploadedFiles(pageNo))
  }

  handleImagePageFlag=(slug)=>{
    //this.props.dispatch(saveImageDetails());
    this.getImage(slug)
    this.props.dispatch(saveImagePageFlag(true));
  }
  
  getImage=(slug)=>{
    return fetch(API + '/ocr/ocrimage/get_images/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "imageslug": slug })
    }).then(response => response.json())
      .then(data => {
        this.props.dispatch(saveImageDetails(data));
      });
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
      var postData={
        'slug':this.state.checkedList
      }
    this.setState({showRecognizePopup:true,loader:true})
    return fetch(API + '/ocr/ocrimage/extract/',{
      method: "post",
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify(postData)
    }).then(response => response.json()).then(json => {
      if (json.message === "SUCCESS")
        this.setState({ loader: false,recognized:true })
    })

  }

  closePopup(){
    this.setState({showRecognizePopup:false})
  }

  handleSearchBox(){
    var searchElememt=document.getElementById('search').value.trim()
    this.props.dispatch(storeDocSearchElem(searchElememt))
    this.props.dispatch(getOcrUploadedFiles())
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

  var  ShowModel=(<div id="uploadData" role="dialog" className="modal fade modal-colored-header">
          <Modal show={this.state.showRecognizePopup} onHide={this.closePopup.bind(this)} dialogClassName="modal-colored-header">
            <Modal.Header closeButton>
              <h3 className="modal-title">recognizing Data</h3>
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
              <Button id="dataCloseBtn"  onClick={this.closePopup.bind(this)} bsStyle="primary">Cancel</Button>
              <Button id="loadDataBtn"  bsStyle="primary">Proceed</Button>
            </Modal.Footer>
          </Modal>
  </div>)

    var OcrTableHtml = (
      this.props.OcrDataList != ''? (this.props.OcrDataList.data.length!=0 ? this.props.OcrDataList.data.map((item, index) => {
        return (
        <tr id={index}>
          <td>
           <Checkbox id={item.slug} value={item.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.slug)}></Checkbox>
          </td>
           <td><Link to={item.name} onClick={()=>{this.handleImagePageFlag(item.slug)}}>{item.name}</Link></td>
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
        <div>
          <div class="row">
            <div class="col-sm-6">
                <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-arrow-circle-left"></i> Projects</a></li>
                <li class="breadcrumb-item active"><a href="#">FormReturn OMR</a></li>
                </ol> 					
						</div>
            <div class="col-sm-6 text-right">
                <div class="form-inline">
                  <OcrUpload/>
                  <div class="form-group xs-mr-5">
                    <input type="text" id="search" class="form-control btn-rounded" onKeyUp={this.handleSearchBox.bind(this)} placeholder="Search by name..."></input>   
                  </div>
                  <Button onClick={this.handleRecognise}>Recognize</Button>
                  <button class="btn btn-default btn-rounded disabled" id="btn_r2"><i class="fa fa-paper-plane"></i> Export</button>             
                </div>
            </div>
          </div>
          <div className="table-responsive noSwipe xs-pb-10">

               {/* Instead of documentFlag add new flag and use  to show either table or empty panel for */}
            {this.props.documentFlag?(<table className="tablesorter table table-condensed table-hover cst_table ocrTable">
              <thead>
                <tr>
                  <th></th>
                  <th>Name
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
            </table>):<div class="panel">
			 
       <div class="panel-body">
         <div class="xs-mt-3 xs-mb-3 text-center">
          
         <div class="icon-container">
           <div class="icon "><i class="fa fa-upload fa-2x xs-mt-10"></i></div>
           <span class="class">Add a workflow by clicking on the <a href="#" class="inline-block"><i class="fa fa-plus"></i></a> to get started</span>
         </div>
          
          
         </div>
       </div>
       </div>
       }
              {paginationTag}
              {ShowModel}
          </div>
        </div>
    )
  }
}