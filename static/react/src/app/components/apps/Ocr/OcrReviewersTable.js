import React, { Component } from 'react'
import {getOcrReviewersList}from '../../../actions/ocrActions'
import { connect } from "react-redux";
import store from "../../../store";
import { Pagination } from "react-bootstrap";
import { STATIC_URL } from '../../../helpers/env';
import { Checkbox } from 'primereact/checkbox';




@connect((store) => {
  return {
    OcrReviewerList: store.ocr.OcrReviewerList
  };
})

export default class OcrReviewersTable extends Component {

  componentWillMount = () => {
    this.props.dispatch(getOcrReviewersList())
 }


  render() {
    const pages = this.props.OcrReviewerList.total_number_of_pages;
    const current_page = this.props.OcrReviewerList.current_page;
    let paginationTag = null
    if (pages == 1) {
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
              {/* <Checkbox id={item.slug} value={item.slug} onChange={this.handleCheck} checked={this.state.checkedList.includes(item.slug)}></Checkbox> */}
            </td>
            <td>
              <i class="fa fa-user-o"></i>
            </td>
            {/* <td><Link to={item.name} onClick={() => { this.handleImagePageFlag(item.slug) }}>{item.name}</Link></td> */}
            <td>{item.first_name}</td>
            <td>{''}</td>
            <td>{''}</td>
            <td>{''}</td>
            <td>{''}</td>
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
    )
  }
}
