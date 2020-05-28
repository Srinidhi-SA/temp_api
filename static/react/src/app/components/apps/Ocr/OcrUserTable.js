import React from "react";
import { connect } from "react-redux";
import { Pagination} from "react-bootstrap";
import store from "../../../store";
import {fetchAllOcrUsersAction, deleteOcrUserAction, saveSelectedOcrUserList, openEditUserModalAction, getReviewersListAction, activateOcrUserAction, deActivateOcrUserAction, openAddUserPopup, setUserTableLoaderFlag, storeSelectedTabId, fetchOcrListByReviewerType, clearUserSearchElementAction, saveUserSearchElementAction, selectAllOcrUsers, saveOcrUserPageNumAction} from "../../../actions/ocrActions";
import { statusMessages } from "../../../helpers/helper";
import { Checkbox } from "primereact/checkbox";
import { OcrAddUser } from "./OcrAddUser";
import { OcrEditUser } from "./OcrEditUser";
import { STATIC_URL } from "../../../helpers/env.js";

@connect((store) => {
  return {
    allOcrUsers : store.ocr.allOcrUsers,
    selectedOcrUsers : store.ocr.selectedOcrUsers,
    selUserDetails : store.ocr.selUserDetails,
    userTableLoaderFlag : store.ocr.userTableLoaderFlag,
    ocrReviwersList : store.ocr.ocrReviwersList,
    selectedTabId : store.ocr.selectedTabId,
    isAllCheckedFlag : store.ocr.isAllCheckedFlag,
    ocrUserPageNum : store.ocr.ocrUserPageNum,
  };
})

export class OcrUserTable extends React.Component{
    constructor(props){
        super(props);
    }

    componentWillMount(){
        this.props.dispatch(getReviewersListAction());
        this.props.dispatch(setUserTableLoaderFlag(true));
        this.props.selectedTabId === "none"?this.props.dispatch(fetchAllOcrUsersAction()):this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId)));
    }

    openAddUserPopup(e){
        this.props.dispatch(openAddUserPopup());
    }

    saveSelectedUser(e){
        let curSelUsers = [...this.props.selectedOcrUsers];
        if(e.target.checked)
            curSelUsers.push(e.target.value)
        else
            curSelUsers.splice(curSelUsers.indexOf(e.value), 1)
        this.props.dispatch(saveSelectedOcrUserList(curSelUsers));
        curSelUsers.length === 10 ? this.props.dispatch(selectAllOcrUsers(true)): this.props.dispatch(selectAllOcrUsers(false))
    }
    selectAllUsers(e){
        this.props.dispatch(selectAllOcrUsers(!this.props.isAllCheckedFlag));
        let curSelUsers = [...this.props.selectedOcrUsers];
        if(!this.props.isAllCheckedFlag){
            this.props.allOcrUsers.data.map((item) => {
                if(item.ocr_user)
                    curSelUsers.push(item.username)
            });
        }else{
            curSelUsers = [];
        }
        this.props.dispatch(saveSelectedOcrUserList(curSelUsers));
    }
    selectActiontype(e){
        if(this.props.selectedOcrUsers.length <= 0){
            bootbox.alert(statusMessages("warning", "Please select users", "small_mascot"));
        }else{
            switch(e.target.id){
                case "delete":
                        this.props.dispatch(deleteOcrUserAction(this.props.selectedOcrUsers));
                    break;
                case "activate":
                    this.props.dispatch(activateOcrUserAction(this.props.selectedOcrUsers));
                    break;
                case "deactivate":
                    this.props.dispatch(deActivateOcrUserAction(this.props.selectedOcrUsers));
                    break;
                case "edit":
                        if(this.props.selectedOcrUsers.length>1)
                            bootbox.alert(statusMessages("warning", "Please select only one user", "small_mascot"))
                        else{
                            let selUserDetails = ""
                            selUserDetails = this.props.allOcrUsers.data.filter(i=>i.username === this.props.selectedOcrUsers[0])[0]
                            this.props.dispatch(openEditUserModalAction(true,selUserDetails.ocr_profile.slug,selUserDetails));
                        }
                    break;
                default:
                    break;
            }
        }
    }
    openEditUserModal(userData){
        this.props.dispatch(openEditUserModalAction(true,userData.ocr_profile.slug,userData));
    }
    filterByReviewerType(e){
        this.props.dispatch(storeSelectedTabId(e.target.id));
        this.props.dispatch(setUserTableLoaderFlag(true));
        if(e.target.id === "none"){
            this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum));
        }else{
            this.props.dispatch(fetchOcrListByReviewerType(parseFloat(e.target.id),store.getState().ocr.ocrUserPageNum));
        }        
    }
    handlePagination(pageNo){
        this.props.dispatch(saveOcrUserPageNumAction(pageNo));
        this.props.selectedTabId != "none"?
            this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId),store.getState().ocr.ocrUserPageNum))
            : this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum))
    }
    handleSearchElement(e){
        this.props.dispatch(saveUserSearchElementAction(e.target.value));
        this.props.selectedTabId === "none"?this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum)):this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId),store.getState().ocr.ocrUserPageNum));
    }
    clearSearchVal(){
        document.getElementById("searchOcrUser").value=""
        this.props.dispatch(clearUserSearchElementAction());
        this.props.selectedTabId === "none"?this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum)):this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId),store.getState().ocr.ocrUserPageNum));
    }
    render(){
        let paginationTag = null;
        let manageUsersTable = ""
        if(this.props.userTableLoaderFlag){
            manageUsersTable = <div style={{ height: "150px", background: "#ffffff", position: 'relative' }}>
                                    <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                                </div>
        }else if(Object.keys(this.props.allOcrUsers).length === 0){
            manageUsersTable = <div className="noOcrUsers">
                <span>No Users Found<br/>Please Click on add icon to add users</span>
            </div>
        }else if(this.props.allOcrUsers.data.length <= 0){
            manageUsersTable = <div className="noOcrUsers">
                <span><br/>No Results Found<br/></span>
            </div>
        }else{
            const pages = store.getState().ocr.allOcrUsers.total_number_of_pages;
            const current_page = store.getState().ocr.allOcrUsers.current_page;
            if(pages > 1){
                paginationTag = <Pagination  ellipsis bsSize="medium" maxButtons={10} onSelect={this.handlePagination.bind(this)} first last next prev boundaryLinks items={pages} activePage={current_page}/>
            }
            manageUsersTable = 
                <table className = "table manageUserTable">
                    <thead><tr>
                        <td><Checkbox id="selectAll" value={this.props.allOcrUsers.data} onChange={this.selectAllUsers.bind(this)} checked={this.props.isAllCheckedFlag}/></td>
                        <td>FIRST NAME</td><td>LAST NAME</td>
                        <td>EMAIL</td><td>ROLES</td>
                        <td>DATE JOINED</td><td>LAST LOGIN</td>
                        <td>STATUS</td>
                    </tr></thead>
                    <tbody>
                        {this.props.allOcrUsers.data.map((item, index) => {
                            if(item.ocr_user){
                                return (
                                    <tr>
                                        <td><Checkbox id={item.ocr_profile.slug} value={item.username} onChange={this.saveSelectedUser.bind(this)} checked={this.props.selectedOcrUsers.includes(item.username)}></Checkbox></td>
                                        <td onClick={this.openEditUserModal.bind(this,item)} style={{color: "#29998c",cursor:"pointer"}}>{item.first_name}</td>
                                        <td>{item.last_name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.ocr_profile.role[0]}</td>
                                        <td>{new Date(item.date_joined).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")}</td>
                                        <td>{item.last_login != null? new Date(item.last_login).toLocaleString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3"):""}</td>
                                        <td><label className={item.ocr_profile.active?"label-success":"label-warning"}>{item.ocr_profile.active?"Active":"Inactive"}</label></td>
                                    </tr>
                                )}
                                else{ return "" }
                            })
                        }
                    </tbody>
                </table>
        }
        let tabOptions=[];
        tabOptions.push(<li className ="active"><a data-toggle="tab" id="none" name="none">All</a></li>);
        for(var i=0; i<this.props.ocrReviwersList.length; i++){
            tabOptions.push(<li><a data-toggle="tab" id={this.props.ocrReviwersList[i].id} name={this.props.ocrReviwersList[i].name}>{this.props.ocrReviwersList[i].name}</a></li>);
        }
        return(
            <div>
                <div>
                        <h4>Manage users</h4>
                    </div>
                <div className="row userActions">
                    <div className="col-md-8">
                        <ul className ="nav nav-tabs" onClick={this.filterByReviewerType.bind(this)} style={{cursor: "default"}}>
                            {tabOptions}
                        </ul>
                    </div>
                    
                    <div className="col-md-4 text-right">
					 <a className="btn btn-primary" onClick={this.openAddUserPopup.bind(this)} title="Add User">
                                <i className ="zmdi zmdi-account-add zmdi-hc-lg">
                                    <OcrAddUser/>
                                </i>
                            </a>
                        <div className="btn-group xs-ml-5 xs-mr-5">
						
                            <button type="button" className ="btn btn-default dropdown-toggle" data-toggle="dropdown" title="Action">ACTION <span className ="caret"></span></button>
                            <ul role="menu" className ="dropdown-menu dropdown-menu-right">
                                <li><a name="actionType" title="Activate" id="activate" onClick={this.selectActiontype.bind(this)}><i className ="fa fa-plus-circle text-primary xs-mr-5"></i> Activate</a></li>
                                <li><a name="actionType" title="Deactivate" id="deactivate" onClick={this.selectActiontype.bind(this)}><i className ="fa fa-minus-circle text-warning xs-mr-5"></i> Deactivate</a></li>
                                <li><a name="actionType" title="Delete" id="delete" onClick={this.selectActiontype.bind(this)}><i className ="fa fa-trash text-danger xs-mr-5"></i> Delete</a></li>
                                <li><a name="actionType" title="Edit" id="edit" onClick={this.selectActiontype.bind(this)}><i className ="fa fa-pencil-square-o text-secondary xs-mr-5"></i> Edit</a></li>
                            </ul>
                        </div>
                        <div className="pull-right searchOcrUser">
                            <input type="text" id="searchOcrUser" title="Search User..." className="form-control btn-rounded" placeholder="Search User..." onKeyUp={this.handleSearchElement.bind(this)} />
                            <button className="close-icon"  style={{paddingTop: "0px", marginLeft:"59%"}}  onClick={this.clearSearchVal.bind(this)}type="reset"></button>
                        </div>
                    </div>
                </div>
                <div className = "table-responsive box-shadow xs-mt-5">
                    {manageUsersTable}
                </div>
                <div className="ma-datatable-footer"  id="idPagination">
                    <div className="dataTables_paginate">
                        {paginationTag}
                    </div>
                </div>
                <OcrEditUser/>
            </div>
        );
    }
}