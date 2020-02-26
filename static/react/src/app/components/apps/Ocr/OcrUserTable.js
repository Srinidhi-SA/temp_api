import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import {fetchAllOcrUsersAction, deleteOcrUserAction, saveSelectedOcrUserList, openEditUserModalAction, closeEditUserModalAction} from "../../../actions/ocrActions";
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
  };
})

export class OcrUserTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            // checked: false,
            // selUsers : []
		};
    }

    componentWillMount(){
        this.props.dispatch(fetchAllOcrUsersAction())
    }

    deleteOcrUser(username){
        this.props.dispatch(deleteOcrUserAction(username))
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
            switch(e.target.value){
                case "delete":
                        this.props.dispatch(deleteOcrUserAction(this.props.selectedOcrUsers))
                    break;
                case "activate":
                    break;
                case "deactivate":
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
                                        <td>
                                            <Checkbox id={item.ocr_profile.slug} value={item.ocr_profile.slug} onChange={this.saveSelectedUser.bind(this)} checked={this.props.selectedOcrUsers.includes(item.ocr_profile.slug)}></Checkbox></td>
                                        <td onClick={this.openEditUserModal.bind(this,item)}>{item.first_name}</td>
                                        <td>{item.last_name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.ocr_profile.reviewer_type}</td>
                                        <td>{item.date_joined}</td>
                                        <td>{item.last_login}</td>
                                        <td><ToggleButton className="userStatusBtn" checked={item.ocr_profile.active} onLabel="Active" offLabel="Inactive"/></td>
                                    </tr>
                                )}
                                else{ return "" }
                            })
                        }
                    </tbody>
                </table>
        }
        return(
            <div className="ocrUserTable">
                <div className="ocrUserAction">
                    <select style={{margin:"3px"}} name="actionType" onChange={this.selectActiontype.bind(this)}>
                        <option value="none" id="none" >ACTION...</option>
                        <option value="activate" id="activate">Activate</option>
                        <option value="deactivate" id="deactivate">Deactivate</option>
                        <option value="delete" id="delete">Delete</option>
                        <option value="edit" id="edit">Edit</option>
                    </select>
                </div>
                <div className="pull-right">
                    <input type="text" id="searchOcrUser" className="form-control btn-rounded" placeholder="Search User..."/>
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
                            <label className="" for="first_name">First Name</label>
                            <input type="text" id="first_name" name="first_name" placeholder="First Name" defaultValue={this.props.selUserDetails.first_name}/>
                            <label for="last_name">Last Name</label>
                            <input type="text" id="last_name" name="last_name" placeholder="Last Name" defaultValue={this.props.selUserDetails.last_name}/>
                            <label className="" for="email">Email</label>
                            <input  type="email" id="email" name="email" placeholder="Email" defaultValue={this.props.selUserDetails.email}/>
                            <label className="mandate" for="userRoles">Roles</label>
                            <select name="reviewer_type">
                                <option value="none" id="none">--select--</option>
                                <option value="admin" id="admin">Admin</option>
                                <option value="reviewerL1" id="reviewerL1">ReviewerL1</option>
                                <option value="reviewerL2" id="reviewerL2">ReviewerL2</option>
                                <option value="superUser" id="superUser">SuperUser</option>
                            </select>
                            <label for="userRoles" className="mandate">Status</label>
                            <select name="is_active">
                                <option value="none" id="none">--select--</option>
                                <option value="True" id="active">Active</option>
                                <option value="False" id="inactive">Inactive</option>
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" id="editUser">Edit</Button>
                        <Button bsStyle="primary" onClick={this.closeEditUserModal.bind(this)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}