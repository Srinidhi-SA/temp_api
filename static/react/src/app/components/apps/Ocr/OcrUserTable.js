import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton";
import store from "../../../store";
import {fetchAllOcrUsersAction, deleteOcrUserAction, saveSelectedOcrUserList, openEditUserModalAction, closeEditUserModalAction, getReviewersListAction, enableEditingUserAction, SaveEditedUserDetailsAction, submitEditUserDetailsAction, activateOcrUserAction, deActivateOcrUserAction} from "../../../actions/ocrActions";
import { statusMessages } from "../../../helpers/helper";
import { Checkbox } from "primereact/checkbox";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    newUserDetails : store.ocr.newUserDetails,
    allOcrUsers : store.ocr.allOcrUsers,
    newUserProfileDetails : store.ocr.newUserProfileDetails,
    ocrUserProfileFlag : store.ocr.ocrUserProfileFlag,
    selectedOcrUsers : store.ocr.selectedOcrUsers,
    editOcrUserFlag : store.ocr.editOcrUserFlag,
    selUserSlug : store.ocr.selUserSlug,
    selUserDetails : store.ocr.selUserDetails,
    enableEditingFlag : store.ocr.enableEditingFlag,
    editedUserDetails : store.ocr.editedUserDetails
  };
})

export class OcrUserTable extends React.Component{
    constructor(props){
        super(props);
    }

    componentWillMount(){
        this.props.dispatch(fetchAllOcrUsersAction())
        this.props.dispatch(getReviewersListAction())
    }
    
    componentDidUpdate(){
        if(this.props.enableEditingFlag){
            $("#first_name")[0].disabled = false;
            $("#last_name")[0].disabled = false;
            $("#username")[0].disabled = false;
            $("#email")[0].disabled = false;
            $("#reviewer_type")[0].disabled = false;
            $("#is_active")[0].disabled = false;

            $("#fname")[0].classList.add("mandate")
            $("#lname")[0].classList.add("mandate")
            $("#uname")[0].classList.add("mandate")
            $("#mail")[0].classList.add("mandate")
            $("#rtype")[0].classList.add("mandate")
            $("#iactive")[0].classList.add("mandate")
        }
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
                        selUserDetails = this.props.allOcrUsers.data.filter(i=>i.ocr_profile.slug === this.props.selectedOcrUsers[0])[0]
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
    closeEditUserModal(){
        this.props.dispatch(closeEditUserModalAction(false));
        this.props.dispatch(enableEditingUserAction(false));
    }
    enableEditingUser(e){
        this.props.dispatch(enableEditingUserAction(true));
    }
    saveuserEditedDetails(e){
        let name = e.target.name;
        let val = e.target.value;
        console.log(name,val)
        this.props.dispatch(SaveEditedUserDetailsAction(name,val));
    }
    submitEditedUserDetails(e){
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if($("#first_name")[0].value === "" || $("#last_name")[0].value === "" || $("#username")[0].value === "" || $("#email")[0].value === "" || $("#reviewer_type")[0].value === "none" || $("#is_active")[0].value === "none"){
            $("#resetMsg")[0].innerText = "Please enter mandatory fields"
        }else if(!mailFormat.test($("#email")[0].value)){
            $("#resetMsg")[0].innerText = "Invalid Email"
        }else{
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(submitEditUserDetailsAction(this.props.editedUserDetails))
        }
    }
    render(){
        let manageUsersTable = ""
        if(Object.keys(this.props.allOcrUsers).length === 0){
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
                                        <td><Checkbox id={item.ocr_profile.slug} value={item.ocr_profile.slug} onChange={this.saveSelectedUser.bind(this)} checked={this.props.selectedOcrUsers.includes(item.ocr_profile.slug)}></Checkbox></td>
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
                <div className="row">
                    <div className="col-md-8">
                        <ul class="nav nav-tabs">
                            <li class="active"><a href="javascript:;">All</a></li>
                            <li><a href="javascript:;">Admin</a></li>
                            <li><a href="javascript:;">Superuser</a></li>
                            <li><a href="javascript:;">Reviewer L1</a></li>
                            <li><a href="javascript:;">Reviewer L2</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
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
                <Modal show={this.props.editOcrUserFlag} onHide={this.closeEditUserModal.bind(this)}>
                    <Modal.Header>
                        <button type="button" className="close" data-dismiss="modal" onClick={this.closeEditUserModal.bind(this)}>&times;</button>
                        <h4 className="modal-title">Edit User</h4>
                    </Modal.Header>
                    <Modal.Body id="editUsers">
                        <div className="ocrUserFormLabel">
                            <label id="fname" for="first_name">First Name</label>
                            <input type="text" id="first_name" name="first_name" placeholder="First Name" defaultValue={this.props.editedUserDetails.first_name} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                            <label id="lname" for="last_name">Last Name</label>
                            <input type="text" id="last_name" name="last_name" placeholder="Last Name" defaultValue={this.props.editedUserDetails.last_name} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                            <label id="mail" for="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="Email" defaultValue={this.props.editedUserDetails.email} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                            <label id="uname" for="username">User Name</label>
                            <input type="text" id="username" name="username" placeholder="User Name" defaultValue={this.props.editedUserDetails.username} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                            
                            <label id="rtype" for="reviewer_type">Roles</label>
                            <select name="reviewer_type" id="reviewer_type" disabled onChange={this.saveuserEditedDetails.bind(this)} >
                                <option value="none" id="none">--select--</option>
                                <option value="1" id="admin">Admin</option>
                                <option value="4" id="reviewerL1">ReviewerL1</option>
                                <option value="5" id="reviewerL2">ReviewerL2</option>
                                <option value="3" id="superUser">SuperUser</option>
                            </select>
                            <label id="iactive" for="is_active">Status</label>
                            <select name="is_active" id="is_active" disabled onChange={this.saveuserEditedDetails.bind(this)} >
                                <option value="none" id="none">--select--</option>
                                <option value="True" id="active">Active</option>
                                <option value="False" id="inactive">Inactive</option>
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div id="resetMsg"></div>
                        {!this.props.enableEditingFlag?<Button bsStyle="primary" id="editUser" onClick={this.enableEditingUser.bind(this)}>Edit</Button>:""}
                        {this.props.enableEditingFlag?<Button bsStyle="primary" id="saveEditedUser" onClick={this.submitEditedUserDetails.bind(this)}>Save</Button>:""}
                        <Button bsStyle="primary" onClick={this.closeEditUserModal.bind(this)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}