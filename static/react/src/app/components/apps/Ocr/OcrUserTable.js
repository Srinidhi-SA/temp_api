import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import { openAddUserPopup, closeAddUserPopup, saveNewUserDetails, createNewUserAction, saveNewUserProfileDetails , submitNewUserProfileAction, deleteOcrUserAction, fetchAllOcrUsersAction} from "../../../actions/ocrActions";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    newUserDetails : store.ocr.newUserDetails,
    allOcrUsers : store.ocr.allOcrUsers,
    newUserProfileDetails : store.ocr.newUserProfileDetails,
    ocrUserProfileFlag : store.ocr.ocrUserProfileFlag,
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

    openAddUserPopup(e){
        this.props.dispatch(openAddUserPopup());
    }
    closeAddUserPopup(e){
        this.props.dispatch(fetchAllOcrUsersAction());
        this.props.dispatch(closeAddUserPopup());
    }
    saveNewUserDetails(e){
        let name = e.target.name;
        let value = e.target.value;
        this.props.dispatch(saveNewUserDetails(name,value));
    }
    submitNewUserDetails(e){
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let paswdFormat=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
        if(Object.keys(this.props.newUserDetails).length === 0){
            $("#resetMsg")[0].innerText = "Please enter details"
        }else if($("#first_name")[0].value === ""){
            $("#resetMsg")[0].innerText = "Enter Firstname"
        }else if($("#last_name")[0].value === ""){
            $("#resetMsg")[0].innerText = "Enter Lastname"
        }else if($("#username")[0].value === ""){
            $("#resetMsg")[0].innerText = "Enter Username"
        }else if($("#email")[0].value === ""){
            $("#resetMsg")[0].innerText = "Enter Email"
        }else if($("#email")[0].value != "" && !mailFormat.test($("#email")[0].value)){
            $("#resetMsg")[0].innerText = "Invalid Email"
        }else if($("#password1")[0].value === ""){
            $("#resetMsg")[0].innerText = "Enter Password"
        }else if($("#password1")[0].value != "" && !paswdFormat.test($("#password1")[0].value)){
            $("#resetMsg")[0].innerText = "Password must contain atleast 1 number and a special character"
        }else if($("#password2")[0].value === ""){
            $("#resetMsg")[0].innerText = "Please Confirm Password"
        }else if($("#password1")[0].value != $("#password2")[0].value){
            $("#resetMsg")[0].innerText = "Password and Confirm Passwords doesnot match"
        }else{
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(createNewUserAction(this.props.newUserDetails));
        }
    }
    saveUserStatus(e){
        let name=e.target.name;
        let value = e.target.id;
        this.props.dispatch(saveNewUserProfileDetails(name,value));
    }
    submitNewUserStatus(e){
        // Validation for roles and status 
        this.props.dispatch(submitNewUserProfileAction(this.props.newUserStatus));
    }
    deleteOcrUser(username){
        this.props.dispatch(deleteOcrUserAction(username))
    }
    render(){
        let manageUsersTable = "Loading..."
        if(Object.keys(this.props.allOcrUsers).length === 0){
            manageUsersTable = "No Users"
        }else{
            manageUsersTable = this.props.allOcrUsers.data.map((item, index) => {
                if(item.ocr_user){
                  return (
                      <tr>
                          <td>{item.first_name}</td>
                          <td>{item.last_name}</td>
                          <td>{item.username}</td>
                          <td>{item.email}</td>
                          <td>{item.ocr_profile.reviewer_type}</td>
                          <td>{item.date_joined}</td>
                          <td>{item.last_login}</td>
                          <td>
                              <ToggleButton className="userStatusBtn" checked={item.ocr_profile.active} /*onChange={(e) => this.setState({checked1: e.value})}*/ onLabel="Active" offLabel="Inactive"/>
                          </td>
                          <td>
                              <a onClick={this.deleteOcrUser.bind(this,item.username)}>
                                  <i className="fa fa-trash fa-lg"/>
                              </a>
                          </td>
                      </tr>
                  )}
                else{ return "" }
            });
        }
        return(
            <div>
                <div className="row">
                    <div className="col-md-3">
                        <h4>Manage Users</h4>
                    </div>
                    <div className="col-md-6"></div>
                    <div className="col-md-3">
                        <a className="btn btn-primary addUserBtn" onClick={this.openAddUserPopup.bind(this)}>
                            <i class="fa fa-user-plus fa-lg"></i>
                        </a>
                        <div className="pull-right">
                            <input type="text" id="searchUser" className="form-control btn-rounded" placeholder="Search User..."/>
                        </div>
                    </div>
                    {/* PopUp Content Starts Here*/}
                    <Modal show={this.props.addUserPopupFlag} onHide={this.closeAddUserPopup.bind(this)}>
                        <Modal.Header>
                            <button type="button" className="close" data-dismiss="modal" onClick={this.closeAddUserPopup.bind(this)}>&times;</button>
                            <h4 className="modal-title">Add User</h4>
                        </Modal.Header>
                        <Modal.Body id="addUsers">
                            {!this.props.createUserFlag &&
                                <div>
                                    <label className="col-md-6 mandate" for="first_name">First Name</label>
                                    <label className="col-md-6 mandate" for="last_name">Last Name</label>
                                    <input type="text" id="first_name" name="first_name" placeholder="First Name" className="ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    <input type="text" id="last_name" name="last_name" placeholder="Last Name" className="ocrUserFormInput ocrUserFormInput2" onInput={this.saveNewUserDetails.bind(this)}/>
                                    
                                    <label className="col-md-6 mandate" for="username">User Name</label>
                                    <label className="col-md-6 mandate" for="email">Email</label>
                                    <input type="text" id="username" name="username" placeholder="User Name" className="ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    <input  type="email" id="email" name="email" placeholder="Email" className="ocrUserFormInput ocrUserFormInput2" onInput={this.saveNewUserDetails.bind(this)}/>
                                    
                                    <label className="col-md-6 mandate" for="password">Password</label>
                                    <label className="col-md-6 mandate" for="confirmPassword">Confirm Password</label>
                                    <input type="password" id="password1" name="password1" placeholder="Password" className="ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    <input type="password" id="password2" name="password2" placeholder="Confirm Password" className="ocrUserFormInput ocrUserFormInput2" onInput={this.saveNewUserDetails.bind(this)}/>
                                   
                                   {this.props.createUserFlag &&
                                        <div className="col-md-12">
                                            <div className="col-md-3">
                                                <label for="userRoles" className="mandate">Roles</label>
                                                <ul className = "list-unstyled">
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="roleType" id="admin" onClick={this.saveUserStatus.bind(this)}/><label for="admin">Admin</label></div>
                                                    </li>
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="roleType" id="reviewerL1" onClick={this.saveUserStatus.bind(this)}/><label for="reviewerL1">Reviewer L1</label></div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-md-3">
                                                <ul className = "list-unstyled">
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="roleType" id="reviewerL2" onClick={this.saveUserStatus.bind(this)}/><label for="reviewerL2">Reviewer L2</label></div>
                                                    </li>
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="roleType" id="superUser" onClick={this.saveUserStatus.bind(this)}/><label for="superUser">Superuser</label></div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-md-6">
                                                <label for="userRoles" className="mandate">Status</label>
                                                <ul className = "list-unstyled">
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="status" id="active" onClick={this.saveUserStatus.bind(this)}/><label for="active">Active</label></div>
                                                    </li>
                                                    <li><div className = "ma-radio inline">
                                                        <input type="radio" name="status" id="inactive" onClick={this.saveUserStatus.bind(this)}/><label for="inactive">Inactive</label></div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    }
                                    {this.props.ocrUserProfileFlag && 
                                        <div>
                                            {/* OCR created message and tick image */}
                                            
                                        </div>
                                    }
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <div id="resetMsg"></div>
                            <Button bsStyle="primary" id="createUserBtn" onClick={this.submitNewUserDetails.bind(this)}>Create User</Button>
                            <Button bsStyle="primary" id="addUser" disabled={this.props.createUserFlag?false:true} onClick={this.submitNewUserStatus.bind(this)}>Save</Button>
                            <Button bsStyle="primary" id="addUser" style={{display:this.props.ocrUserProfileFlag?"none":""}} onClick={this.closeAddUserPopup.bind(this)}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div className = "table-responsive box-shadow">
                    <table className = "table manageUserTable">
                        <thead>
                        <tr>
                            <th>FIRST NAME</th>
                            <th>LAST NAME</th>
                            <th>USER NAME</th>
                            <th>EMAIL</th>
                            <th>ROLES</th>
                            <th>DATE JOINED</th>
                            <th>LAST LOGIN</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                        </thead>
                        <tbody>
                            {manageUsersTable}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}