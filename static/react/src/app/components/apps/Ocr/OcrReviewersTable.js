import React, { Component } from 'react'
import {getOcrReviewersList,saveRevDocumentPageFlag,selectedReviewerDetails,ocrRevFilterTime,ocrRevFilterAccuracy}from '../../../actions/ocrActions'
import { connect } from "react-redux";
import store from "../../../store";
import { Pagination } from "react-bootstrap";
import { STATIC_URL } from '../../../helpers/env';
import { Checkbox } from 'primereact/checkbox';
import { Link, Redirect } from "react-router-dom";




@connect((store) => {
  return {
    OcrReviewerList: store.ocr.OcrReviewerList
  };
})

export default class OcrReviewersTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checkedList: [],
      filterVal:'',
    }
  }

  componentWillMount = () => {
    this.props.dispatch(getOcrReviewersList())
 }

 handleCheck = (e) => {
  let updateList = [...this.state.checkedList];
  e.checked ? updateList.push(e.value) : updateList.splice(updateList.indexOf(e.value), 1);
  this.setState({ checkedList: updateList });
}

handlePagination = (pageNo) => {
  this.props.dispatch(getOcrReviewersList(pageNo))
}

handleDocumentPageFlag (slug,name){
  this.props.dispatch(saveRevDocumentPageFlag(true));
  this.props.dispatch(selectedReviewerDetails(slug,name))
}

handleFil(mode){                 
  this.disableInputs(mode,'')
  this.setState({filterVal:mode})
}

disableInputs(mode,reset){    
  let  idList=''
  mode[0]=="C"? idList= ['CEQL','CGTE','CLTE']:idList= ['TEQL','TGTE','TLTE']
  
  let disableIds=reset!='reset'?idList.filter(i=>i!=mode):idList

  if(document.getElementById(mode).value.trim()!='')
  disableIds.map(i=>$(`#${i}`).attr('disabled', true))
  else
  disableIds.map(i=>$(`#${i}`).attr('disabled', false))
}

filterRevList(filtertBy, filterOn,reset) {
  var filterByVal=''

  if(reset!='reset'){
    filterByVal = (filterOn==('time')||(filterOn=='accuracy'))?$(`#${this.state.filterVal}`).val().trim()!=''?(this.state.filterVal.slice(1,4)+$(`#${this.state.filterVal}`).val().trim()):"":filtertBy;
    }
  switch (filterOn) {
    case 'time':
    this.props.dispatch(ocrRevFilterTime(filterByVal))
    break;
    case 'accuracy':
    this.props.dispatch(ocrRevFilterAccuracy(filterByVal))
    break;
  }
  this.props.dispatch(getOcrReviewersList())
  if(reset=='reset'){
    document.getElementById(this.state.filterVal).value=''
    this.disableInputs(this.state.filterVal,'reset')
  }
}
  render() {
    const pages = this.props.OcrReviewerList.total_number_of_pages;
    const current_page = this.props.OcrReviewerList.current_page;
    let paginationTag = null
    if (pages>1) {
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

    var reviewersTable = (
      this.props.OcrReviewerList != '' ? (this.props.OcrReviewerList.data.length != 0 ? this.props.OcrReviewerList.data.map((item, index) => {
        return (
          <tr id={index}>
            {/* <td>
              <Checkbox id={item.ocr_profile.slug} value={item.ocr_profile.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.ocr_profile.slug)}></Checkbox>
            </td> */}
            <td>
              <i class="fa fa-user-o"></i>
            </td>
            {/* <Link to='/apps/ocr-mq44ewz7bp/project/' onClick={this.handleDocumentPageFlag.bind(this,item.slug,item.name)}>{item.name}</Link> */}

            <td><Link to='/apps/ocr-mq44ewz7bp/reviewer/' onClick={() => { this.handleDocumentPageFlag(item.ocr_profile.slug,item.username) }} title={item.username}>{item.username}</Link></td>
            <td>{item.ocr_profile.role[0]}</td>
            <td>{item.ocr_data.assignments}</td>
            <td>{item.ocr_data.completionPercentage}%</td>
            {/* <td>{item.ocr_data.avgTimeperWord}</td> */}
            <td>{item.ocr_data.accuracyModel}</td>
            <td>{new Date(item.last_login).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
            <td><label className={item.ocr_profile.active?"label-success":"label-warning"}>{item.ocr_profile.active?"Active":"Inactive"}</label></td>
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
        <div class="col-md-3 col-sm-12">
           <h4 class="nText">Reviewers</h4>
        </div>
        <div class="col-md-9 col-sm-12 text-right xs-mb-5">   
        </div>
      </div>
      <div class="xs-mt-20"></div>   
        <div class="row">
          <div class="col-sm-12">
            <div class="table-responsive" style={{overflowX:'inherit'}}>
              <table class="table table-condensed table-hover cst_table ">
               <thead>
                  <tr>
                    <th><i class="fa fa-user-o"></i></th>
                    <th>Reviewer Name</th>
                    <th>Role</th>
                    <th class="text-center">Assignment</th>
                    <th class="text-center">
                      Complete %
                    </th>
                    {/* <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Avg Time/Word" aria-expanded="true">
                            <span>Avg Time/Word</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterRevList.bind(this, '', 'time','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}}>Equal to</a>
                             <input className='confidence filter_input'  id='TEQL' onChange={this.handleFil.bind(this,'TEQL')} type='number' ></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}}>Greater than</a>
                             <input className='confidence filter_input' id='TGTE' onChange={this.handleFil.bind(this,'TGTE')} type='number' ></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input className='confidence filter_input' id='TLTE' onChange={this.handleFil.bind(this,'TLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn" onClick={this.filterRevList.bind(this, '', 'time','')}><i class="fa fa-check"></i></button>
                          </ul>
                        </th> */}
                    {/* <th class="dropdown">
                      <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Accuracy of model" aria-expanded="true">
                      <span>ACCURACY of Model</span> <b class="caret"></b>
                      </a>
                      <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" name="all"      onClick={this.filterRevList.bind(this, '', 'accuracy')}  data-toggle="modal" data-target="#modal_equal">All</a></li>
                          <li><a class="cursor" name="delete"   onClick={this.filterRevList.bind(this, 'E', 'accuracy')}data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                          <li><a class="cursor" name="rename"   onClick={this.filterRevList.bind(this, 'G', 'accuracy')}data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                          <li><a class="cursor" name="replace"  onClick={this.filterRevList.bind(this, 'L', 'accuracy')} data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                      </ul>
                    </th> */}
                    <th class="dropdown" >
                          <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Confidence Level" aria-expanded="true">
                            <span>ACCURACY of Model</span> <b class="caret"></b>
                          </a>
                          <ul class="dropdown-menu scrollable-menu">
                            <li><a className="cursor" onClick={this.filterRevList.bind(this, '', 'accuracy','reset')} name="all" data-toggle="modal" data-target="#modal_equal">All</a></li>
                            <li><a className="equal" style={{display:'inline-block',width:101}}>Equal to</a>
                             <input className='confidence filter_input'  id='CEQL' onChange={this.handleFil.bind(this,'CEQL')} type='number' ></input></li>
                            <li><a className="greater" style={{display:'inline-block',width:101}}>Greater than</a>
                             <input className='confidence filter_input' id='CGTE' onChange={this.handleFil.bind(this,'CGTE')} type='number' ></input></li>
                            <li><a className="less" style={{display:'inline-block',width:101}}>Less than</a>
                             <input className='confidence filter_input' id='CLTE' onChange={this.handleFil.bind(this,'CLTE')} type='number'></input></li>
                            <button className="btn btn-primary filterCheckBtn" onClick={this.filterRevList.bind(this, '', 'accuracy','')}><i class="fa fa-check"></i></button>
                          </ul>
                        </th>
                    <th class="text-center">Last Login</th>
                    <th class="text-center">Status</th>
                  </tr>
               </thead>
               <tbody class="no-border-x">
                  {reviewersTable}
               </tbody>
            </table>
            {paginationTag}
            </div>
           </div>
         </div>
    </div>
    )
  }
}
