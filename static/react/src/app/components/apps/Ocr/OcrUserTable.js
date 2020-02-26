import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import {fetchAllOcrUsersAction, deleteOcrUserAction, saveSelectedOcrUserList, openEditUserModalAction} from "../../../actions/ocrActions";
import { statusMessages } from "../../../helpers/helper";

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
    userSelForEdit : store.ocr.userSelForEdit,
  };
})

export class OcrUserTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			checked1: false
		};
    }

    componentWillMount(){
        this.props.dispatch(fetchAllOcrUsersAction())
    }

    deleteOcrUser(username){
        this.props.dispatch(deleteOcrUserAction(username))
    }
    saveSelectedUser(e){
        this.props.dispatch(saveSelectedOcrUserList(e.target.value,e.target.checked));
    }
    selectActiontype(e){
        if(this.props.selectedOcrUsers.length <= 0){
            bootbox.alert(statusMessages("warning", "Please select users to delete", "small_mascot"));
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
                    break;
                default:
                    break;
            }
        }
    }
    openEditUserModal(this,userData){
        this.props.dispatch(openEditUserModalAction(true,userData));
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
                        <th><input type="checkbox"/></th>
                        <th>FIRST NAME</th>
                        <th>LAST NAME</th>
                        <th>EMAIL</th>
                        <th>ROLES</th>
                        <th>DATE JOINED</th>
                        <th>LAST LOGIN</th>
                        <th>STATUS</th>
                    </tr></thead>
                    <tbody>
                        {this.props.allOcrUsers.data.map((item, index) => {
                            if(item.ocr_user){
                                return (
                                    <tr>
                                        <td><input type="checkbox" value={item.ocr_profile.slug} onClick={this.saveSelectedUser.bind(this)}/></td>
                                        <td><a href={this.openEditUserModal.bind(this,item)}>{item.first_name}</a></td>
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
                            <option value="none" id="none" >ACTION</option>
                            <option value="activate" id="activate">Activate</option>
                            <option value="deactivate" id="deactivate">Deactivate</option>
                            <option value="delete" id="delete">Delete</option>
                            <option value="edit" id="edit" disabled={this.props.selectedOcrUsers.length>1?"true":"false"}>Edit</option>
                        </select>
                    </div>
                    <div className="pull-right">
                        <input type="text" id="searchOcrUser" className="form-control btn-rounded" placeholder="Search User..."/>
                    </div>
                <div className = "table-responsive box-shadow">
                    {manageUsersTable}
                </div>
                {/* {this.props} */}
            </div>
        );
    }
}