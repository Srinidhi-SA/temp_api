import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import store from "../../../store";
import {fetchAllOcrUsersAction, deleteOcrUserAction, saveSelectedOcrUserList, openEditUserModalAction, getReviewersListAction, enableEditingUserAction, activateOcrUserAction, deActivateOcrUserAction, openAddUserPopup, setUserTableLoaderFlag} from "../../../actions/ocrActions";
import { statusMessages } from "../../../helpers/helper";
import { Checkbox } from "primereact/checkbox";
import { OcrAddUser } from "./OcrAddUser";
import { OcrEditUser } from "./OcrEditUser";
import { STATIC_URL } from "../../../helpers/env.js";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    newUserDetails : store.ocr.newUserDetails,
    allOcrUsers : store.ocr.allOcrUsers,
    newUserProfileDetails : store.ocr.newUserProfileDetails,
    ocrUserProfileFlag : store.ocr.ocrUserProfileFlag,
    selectedOcrUsers : store.ocr.selectedOcrUsers,
    selUserSlug : store.ocr.selUserSlug,
    selUserDetails : store.ocr.selUserDetails,
    userTableLoaderFlag : store.ocr.userTableLoaderFlag,
  };
})

export class OcrUserTable extends React.Component{
    constructor(props){
        super(props);
    }

    componentWillMount(){
        this.props.dispatch(setUserTableLoaderFlag(true));
        this.props.dispatch(fetchAllOcrUsersAction());
        this.props.dispatch(getReviewersListAction());
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
                        let selUserDetails = ""
                        selUserDetails = this.props.allOcrUsers.data.filter(i=>i.username === this.props.selectedOcrUsers[0])[0]
                        this.props.dispatch(openEditUserModalAction(true,this.props.selectedOcrUsers[0],selUserDetails));
                    break;
                default:
                    break;
            }
        }
    }
    openEditUserModal(userData){
        this.props.dispatch(openEditUserModalAction(true,userData.ocr_profile.slug,userData));
    }
    render(){
        let manageUsersTable = ""
        if(this.props.userTableLoaderFlag){
            manageUsersTable = <div style={{ height: "150px", background: "#ffffff", position: 'relative' }}>
                                    <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                                </div>
        }else if(Object.keys(this.props.allOcrUsers).length === 0){
            manageUsersTable = <div className="noOcrUsers">
                <span>No Users Found<br/>Please Click on add icon to add users</span>
            </div>
        }else{
            manageUsersTable = 
                <table className = "table manageUserTable">
                    <thead><tr>
                        <th><Checkbox/></th>
                        <th>FIRST NAME</th><th>LAST NAME</th>
                        <th>EMAIL</th><th>ROLES</th>
                        <th>DATE JOINED</th><th>LAST LOGIN</th>
                        <th>STATUS</th>
                    </tr></thead>
                    <tbody>
                        {this.props.allOcrUsers.data.map((item, index) => {
                            if(item.ocr_user){
                                return (
                                    <tr>
                                        <td><Checkbox id={item.ocr_profile.slug} value={item.username} onChange={this.saveSelectedUser.bind(this)} checked={this.props.selectedOcrUsers.includes(item.username)}></Checkbox></td>
                                        <td onClick={this.openEditUserModal.bind(this,item)} style={{color: "#29998c"}}>{item.first_name}</td>
                                        <td>{item.last_name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.ocr_profile.reviewer_type}</td>
                                        <td>{item.date_joined.slice(0,10)}</td>
                                        <td>{item.last_login}</td>
                                        <td><label className={item.ocr_profile.active?"label-success":"label-warning"}>{item.ocr_profile.active?"Active":"Inactive"}</label></td>
                                    </tr>
                                )}
                                else{ return "" }
                            })
                        }
                    </tbody>
                </table>
        }
        return(
            <div>
                <div className="col-md-12">
                        <h4>Manage users</h4>
                    </div>
                <div className="row userActions">
                    <div className="col-md-8">
                        <ul class="nav nav-tabs">
                            <li class="active"><a href="javascript:;">All</a></li>
                            <li><a href="javascript:;">Admin</a></li>
                            <li><a href="javascript:;">Superuser</a></li>
                            <li><a href="javascript:;">Reviewer L1</a></li>
                            <li><a href="javascript:;">Reviewer L2</a></li>
                        </ul>
                    </div>
                    <div className="col-md-1">
                        <div className="btn-group ocrAddUser">
                            <a className="btn btn-info" onClick={this.openAddUserPopup.bind(this)}>
                                <i class="fa fa-user-plus fa-lg">
                                    <OcrAddUser/>
                                </i>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="btn-group actionOcrUser">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">ACTION <span class="caret"></span></button>
                            <ul role="menu" class="dropdown-menu dropdown-menu-right">
                                <li><a name="actionType" id="activate" onClick={this.selectActiontype.bind(this)}><i class="fa fa-plus-circle text-primary"></i> Activate</a></li>
                                <li><a name="actionType" id="deactivate" onClick={this.selectActiontype.bind(this)}><i class="fa fa-minus-circle text-warning"></i> Deactivate</a></li>
                                <li><a name="actionType" id="delete" onClick={this.selectActiontype.bind(this)}><i class="fa fa-trash text-danger"></i> Delete</a></li>
                                <li><a name="actionType" id="edit" onClick={this.selectActiontype.bind(this)}><i class="fa fa-pencil-square-o text-secondary"></i> Edit</a></li>
                            </ul>
                        </div>
                        <div className="pull-right searchOcrUser">
                            <input type="text" className="form-control btn-rounded" placeholder="Search User..."/>
                        </div>
                    </div>
                </div>
                <div className = "table-responsive box-shadow">
                        {manageUsersTable}
                </div>
                <OcrEditUser/>
            </div>
        );
    }
}