import React from 'react'
import { Link, Redirect } from "react-router-dom";
import { saveDocumentPageFlag,saveRevDocumentPageFlag,storeProjectSearchElem, getOcrProjectsList,selectedProjectDetails,projectTablePagesize } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../../store';
import { Pagination } from "react-bootstrap";
import { OcrCreateProject } from './OcrCreateProject';
import { STATIC_URL } from '../../../helpers/env';
import ReactTooltip from 'react-tooltip';
import { getUserDetailsOrRestart } from "../../../helpers/helper";


@connect((store) => {
   return {
      OcrProjectList: store.ocr.OcrProjectList
   };
})


export class RevProjectTable extends React.Component {

   handleDocumentPageFlag (slug,name){
    this.props.dispatch(saveRevDocumentPageFlag(true));
      this.props.dispatch(selectedProjectDetails(slug,name))
   }
   componentWillMount = () => {  
      this.props.dispatch(getOcrProjectsList())
   }


   handlePagination=(pageNo)=> {
      this.props.dispatch(getOcrProjectsList(pageNo))
    }
    handlePageRow=(e)=>{
      let selectedVal= e.target.value;
      this.props.dispatch(projectTablePagesize(selectedVal));
      this.props.dispatch(getOcrProjectsList())
    }
    handleSearchBox(){
      var searchElememt=document.getElementById('searchRevProject').value.trim()
      this.props.dispatch(storeProjectSearchElem(searchElememt))
      this.props.dispatch(getOcrProjectsList())
    }
    clearSearchElement(e){
      document.getElementById('searchRevProject').value=""
      this.props.dispatch(storeProjectSearchElem(''));
      this.props.dispatch(getOcrProjectsList())
    }

   render() {
      const pages = this.props.OcrProjectList.total_number_of_pages;
      const current_page = this.props.OcrProjectList.current_page;
      let paginationTag = null
      if (pages >= 1) {
        paginationTag = (
          <div class="col-md-12 text-center">
           <div className="footer" id="Pagination">
            <div className="pagination pageRow">
            <span>Rows per page:</span>
               <select className="xs-mr-20 xs-ml-10" onChange={this.handlePageRow}>
                  <option value="12">12</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="All">All</option>
               </select>
              <Pagination ellipsis bsSize="medium" maxButtons={10} onSelect={this.handlePagination} first last next prev boundaryLinks items={pages} activePage={current_page} />
            </div>
           </div>
          </div>
        )
      }
      var OcrProjectTable = (
         this.props.OcrProjectList != '' ? (this.props.OcrProjectList.data.length != 0 ? this.props.OcrProjectList.data.map((item, index) => {
            return (
               <tr key ={index} id={index}>
            <td><Link to='/apps/ocr-mq44ewz7bp/reviewer/' onClick={() => { this.handleDocumentPageFlag(item.slug,item.name) }} title={item.name}>{item.name}</Link></td>

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
            {/* <OcrCreateProject /> */}
            <div class="table-responsive">
            <div class="col-md-10 col-md-offset-2 text-right">
            <div class="form-inline">
            {(getUserDetailsOrRestart.get().userRole == "ReviewerL1" || getUserDetailsOrRestart.get().userRole == "ReviewerL2")?
              <span className="search-wrapper">
                <input style={{marginBottom:'20px'}} type="text" title="Search Project..." id="searchRevProject" class="form-control btn-rounded " onKeyUp={this.handleSearchBox.bind(this)}  placeholder="Search project..."></input>
                <button className="close-icon"  style={{position:"absolute",left:'165px',top:'-2px'}}  onClick={this.clearSearchElement.bind(this)}type="reset"></button>
               
                </span>:""}
            </div>
          </div>
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
