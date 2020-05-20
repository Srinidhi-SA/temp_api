import React from 'react'
import { Link } from 'react-router-dom';
import { getRevrDocsList, saveImagePageFlag,saveImageDetails,saveSelectedImageName,saveRevDocumentPageFlag,ocrRdFilterFields,ocrRdFilterConfidence,ocrRdFilterStatus,clearImageDetails} from '../../../actions/ocrActions';
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
      filterVal:'',
    }
  }
  componentWillUnmount() {
  this.props.dispatch(saveRevDocumentPageFlag(false));
  }

  getHeader = token => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  };

  handlePagination(pageNo){
    this.props.dispatch(getRevrDocsList(pageNo))
  }

  handleImagePageFlag = (slug,name) => {
    this.getImage(slug)
    this.props.dispatch(saveSelectedImageName(name));
    this.props.dispatch(saveImagePageFlag(true));
  }

  getImage = (slug) => {
    // return fetch(API + '/ocr/ocrimage/get_images/', {
    //   method: 'post',
    //   headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
    //   body: JSON.stringify({ "slug": slug })
    // }).then(response => response.json())
    //   .then(data => {
    //     this.props.dispatch(saveImageDetails(data));
    //   });
    return fetch(API + '/ocr/ocrimage/'+ slug +'/', {
      method: 'get',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
    }).then(response => response.json())
      .then(data => {
        this.props.dispatch(saveImageDetails(data));
      });
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

  filterRevDocrList(filtertBy, filterOn,reset ) {
    var filterByVal=''
    if(reset!='reset'){
      filterByVal = (filterOn==('confidence')||(filterOn=='fields'))?$(`#${this.state.filterVal}`).val().trim()!=''?(this.state.filterVal.slice(1,4)+$(`#${this.state.filterVal}`).val().trim()):"":filtertBy;
    }
    // filterByVal = (filterOn==('confidence')||(filterOn=='fields'))?(this.state.filterVal.slice(1,4)+$(`#${this.state.filterVal}`).val()):filtertBy
    switch (filterOn) {
      case 'status':
      this.props.dispatch(ocrRdFilterStatus(filterByVal))
      break;
      case 'confidence':
      this.props.dispatch(ocrRdFilterConfidence(filterByVal))
      break;
      case 'fields':
      this.props.dispatch(ocrRdFilterFields(filterByVal))
      break;
    }
    this.props.dispatch(getRevrDocsList())
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

  render() {
    const pages = this.props.OcrRevwrDocsList.total_number_of_pages;
    const current_page = this.props.OcrRevwrDocsList.current_page;
    let paginationTag = null
    let breadcrumb=null;
    if (pages > 1) {
      paginationTag = (
        <div class="col-md-12 text-center">
          <div className="footer" id="Pagination">
            <div className="pagination">
              <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handlePagination.bind(this)} first last next prev boundaryLinks items={pages} activePage={current_page} />
            </div>
          </div>
        </div>
      )
    }

   if(getUserDetailsOrRestart.get().userRole == "Admin" || getUserDetailsOrRestart.get().userRole == "Superuser"){
   breadcrumb= (
    <div class="row">
    <div class="col-sm-6">
          <ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-arrow-circle-left"></i> Reviewers</a></li>
              <li class="breadcrumb-item active"><a style={{'cursor':'default'}}>{this.props.reviewerName}</a></li>
            </ol>
          </div>
          </div>)
   }
    var OcrRevDocTableHtml = (
      this.props.OcrRevwrDocsList != '' ? (this.props.OcrRevwrDocsList.data.length != 0 ? this.props.OcrRevwrDocsList.data.map((item, index) => {
        return (
          <tr id={index}>
            <td><Link to={`/apps/ocr-mq44ewz7bp/reviewer/${item.ocrImageData.name}`}onClick={() => { this.handleImagePageFlag(item.ocrImageData.slug,item.ocrImageData.name) }} title={item.ocrImageData.name}>{item.ocrImageData.name}</Link></td>
             <td>{item.status}</td>
            <td>{item.ocrImageData.fields}</td>
            <td>{item.ocrImageData.confidence}</td>
            <td>{new Date(item.created_on).toLocaleString().split(',')[0]}</td>
            <td>{new Date(item.modified_at).toLocaleString()}</td>
            <td>{item.ocrImageData.modified_by}</td>
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
       {breadcrumb}
            <div className="table-responsive noSwipe xs-pb-10">
          {/* if total_data_count_wf <=1 then only render table else show panel box */}
            {this.props.OcrRevwrDocsList != '' ? 
            // this.props.OcrRevwrDocsList.total_data_count>= 1 ?
             (
            <table id="documentTable" className="tablesorter table table-condensed table-hover cst_table ocrTable">
             <thead>
              <tr>
                <th>NAME
                  </th>
                <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" disable class="dropdown-toggle cursor" title="Status" aria-expanded="true">
                    <span>STATUS</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this,'', 'status')} name='all'>All</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 'pending', 'status')} name="pending">Review Pending</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 'reviewed', 'status')} name="reviewed">Review Completed</a></li>
                  </ul>
                </th>
                <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Fields" aria-expanded="true">
                            <span>Fields</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterRevDocrList.bind(this, '', 'fields','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}} >Equal to</a> 
                             <input id='FEQL' className='fields filter_input' onChange={this.handleFil.bind(this,'FEQL')} type='number'></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}} >Greater than</a>
                             <input id='FGTE' className='fields filter_input' onChange={this.handleFil.bind(this,'FGTE')} type='number'></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input id='FLTE' className='fields filter_input'  onChange={this.handleFil.bind(this,'FLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn"  onClick={this.filterRevDocrList.bind(this, '', 'fields','')}><i class="fa fa-check"></i></button>
                         </ul>
                        </th>
                {/* <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Fields" aria-expanded="true">
                    <span>Fields</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, '', 'fields')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 3, 'fields')} name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 3, 'fields')} name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 3, 'fields')} name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                  </ul>
                </th> */}
                       <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                            <span>ACCURACY</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterRevDocrList.bind(this, '', 'confidence','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}}>Equal to</a>
                             <input className='confidence filter_input'  id='CEQL' onChange={this.handleFil.bind(this,'CEQL')} type='number' ></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}}>Greater than</a>
                             <input className='confidence filter_input' id='CGTE' onChange={this.handleFil.bind(this,'CGTE')} type='number' ></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input className='confidence filter_input' id='CLTE' onChange={this.handleFil.bind(this,'CLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn" onClick={this.filterRevDocrList.bind(this, '', 'confidence','')}><i class="fa fa-check"></i></button>
                          </ul>
                        </th>
                {/* <th class="dropdown" >
                  <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                    <span>ACCURACY</span> <b class="caret"></b>
                  </a>
                  <ul class="dropdown-menu scrollable-menu">
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, '', 'confidence')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 'E', 'confidence')} name="equal" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 'G', 'confidence')} name="greater" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                    <li><a class="cursor" onClick={this.filterRevDocrList.bind(this, 'L', 'confidence')} name="less" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                  </ul>
                </th> */}
                <th>Created</th>
                <th>Modified</th>
                <th>Modified By</th>
              </tr>
             </thead>
             <tbody className="no-border-x">
              {OcrRevDocTableHtml}
             </tbody>
            </table>)
          //   :
          //  (<div><br/><div className="text-center text-muted xs-mt-50"><h2>No results found..</h2></div></div>)
            : (<img id="loading" style= {{paddingTop:0}} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
          }
          {paginationTag}
         </div>
        </div>
    )
  }
  componentWillUnmount = () => {
    this.props.dispatch(clearImageDetails());
  }
}