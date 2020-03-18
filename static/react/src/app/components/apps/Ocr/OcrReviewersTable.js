import React, { Component } from 'react'
import {getOcrReviewersList,saveRevDocumentPageFlag,selectedReviewerDetails}from '../../../actions/ocrActions'
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
            <td>
              <Checkbox id={item.ocr_profile.slug} value={item.ocr_profile.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.ocr_profile.slug)}></Checkbox>
            </td>
            <td>
              <i class="fa fa-user-o"></i>
            </td>
            {/* <Link to='/apps/ocr-mq44ewz7bp/project/' onClick={this.handleDocumentPageFlag.bind(this,item.slug,item.name)}>{item.name}</Link> */}

            <td><Link to='/apps/ocr-mq44ewz7bp/reviewer/' onClick={() => { this.handleDocumentPageFlag(item.ocr_profile.slug,item.username) }}>{item.username}</Link></td>
            <td>{''}</td>
            <td>{item.ocr_data.assignments}</td>
            <td>{item.ocr_data.completionPercentage}</td>
            <td>{item.ocr_data.avgTimeperWord}</td>
            <td>{item.ocr_data.accuracyModel}</td>
            <td>{''}</td>
            <td>{''}</td>
            <td>{''}</td>
          </tr>
        )
      }
      )
        : (<tr><td className='text-center' colSpan={11}>"No data found for your selection"</td></tr>)
      )
        : (<img id="loading" style={{ position: 'relative', left: '500px' }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
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
            <div class="table-responsive">
              <table class="table table-condensed table-hover cst_table ">
               <thead>
                  <tr>
                    <th></th>
                    <th><i class="fa fa-user-o"></i></th>
                    <th>Reviewer Name</th>
                    <th>Role</th>
                    <th class="text-center">Assignment</th>
                    <th class="text-center">
                      Complete
                    </th>
                    <th class="dropdown">
                      <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Avg Time/Word" aria-expanded="true">
                      <span>Avg Time/Word</span> <b class="caret"></b>
                      </a>
                      <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                          <li><a class="cursor" name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                          <li><a class="cursor" name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
                      </ul>
                    </th>
                    <th class="dropdown">
                      <a href="#" data-toggle="dropdown" class="dropdown-toggle cursor" title="Accuracy of model" aria-expanded="true">
                      <span>ACCURACY of Model</span> <b class="caret"></b>
                      </a>
                      <ul class="dropdown-menu scrollable-menu">
                          <li><a class="cursor" name="delete" data-toggle="modal" data-target="#modal_equal">Equal</a></li>
                          <li><a class="cursor" name="rename" data-toggle="modal" data-target="#modal_equal">Greater than</a></li>
                          <li><a class="cursor" name="replace" data-toggle="modal" data-target="#modal_equal">Less than</a></li>
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
