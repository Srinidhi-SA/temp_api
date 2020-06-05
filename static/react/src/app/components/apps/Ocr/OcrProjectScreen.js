import React from 'react'
import { Link, Redirect } from "react-router-dom";
import { saveDocumentPageFlag, getOcrProjectsList,selectedProjectDetails } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
import { Pagination } from "react-bootstrap";
import { OcrCreateProject } from './OcrCreateProject';
import { STATIC_URL } from '../../../helpers/env';
import ReactTooltip from 'react-tooltip';

@connect((store) => {
   return {
      OcrProjectList: store.ocr.OcrProjectList
   };
})


export class OcrProjectScreen extends React.Component {

   handleDocumentPageFlag (slug,name){
      this.props.dispatch(saveDocumentPageFlag(true));
      this.props.dispatch(selectedProjectDetails(slug,name))
   }
   componentWillMount = () => {
      this.props.dispatch(getOcrProjectsList())
   }

   handlePagination=(pageNo)=> {
      this.props.dispatch(getOcrProjectsList(pageNo))
    }

   render() {
      const pages = this.props.OcrProjectList.total_number_of_pages;
      const current_page = this.props.OcrProjectList.current_page;
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
      var OcrProjectTable = (
         this.props.OcrProjectList != '' ? (this.props.OcrProjectList.data.length != 0 ? this.props.OcrProjectList.data.map((item, index) => {
            return (
               <tr id={index}>
                  <td>
                     <Link to='/apps/ocr-mq44ewz7bp/project/' onClick={this.handleDocumentPageFlag.bind(this,item.slug,item.name)}>{item.name}</Link>
                  </td>
                  <td>{item.project_overview.workflows}</td>
                  <td>{item.project_overview.completion}%</td>
                  <td>{new Date(item.created_at).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
                  <td>{new Date(item.updated_at).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
               </tr>
            )
         }
         )
            : (<tr><td className='text-center' colSpan={6}>"No data found for your selection"</td></tr>)
         )
            : (<img id="loading" style={{ position: 'relative', left: '500px' }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />)
      )
      return (
         <div>
            <OcrCreateProject />
            <ReactTooltip place="top" type="light"/>    
            <div class="table-responsive">
               <table class="table table-condensed table-hover cst_table ">
                  <thead>
                     <tr>
                        <th data-tip="Click here to see workflows under the respective project" >Project Name</th>
                        <th>Pages</th>
                        <th>Complete %</th>
                        <th>Created At</th>
                        <th>Last Update</th>
                     </tr>
                  </thead>
                  <tbody class="no-border-x">
                     {OcrProjectTable}
                  </tbody>
               </table>
              {paginationTag}
            </div>
         </div>

      )
   }
}
