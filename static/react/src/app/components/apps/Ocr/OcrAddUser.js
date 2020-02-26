import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import { openAddUserPopup, closeAddUserPopup, saveNewUserDetails, createNewUserAction, saveNewUserProfileDetails , submitNewUserProfileAction, fetchAllOcrUsersAction} from "../../../actions/ocrActions";

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

export class OcrAddUser extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			checked1: false
		};
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
    
    render(){
            return(
            <div className="row">
                <div className="col-md-8">
                    <h4>Manage Users</h4>
                </div>
                <div className="col-md-1">
                    <a className="btn btn-primary" onClick={this.openAddUserPopup.bind(this)}>
                        <i class="fa fa-user-plus fa-lg"></i>
                    </a>
                </div>
                {/* PopUp Content Starts Here*/}
                <Modal show={this.props.addUserPopupFlag} onHide={this.closeAddUserPopup.bind(this)}>
                    <Modal.Header>
                        <button type="button" className="close" data-dismiss="modal" onClick={this.closeAddUserPopup.bind(this)}>&times;</button>
                        <h4 className="modal-title">Add User</h4>
                    </Modal.Header>
                    <Modal.Body id="addUsers">
                        {!this.props.createUserFlag &&
                            <form className="ocrUserFormLabel" name="ocrForm" id="ocrForm">
                                <label className="mandate" for="first_name">First Name</label>
                                <input type="text" id="first_name" name="first_name" placeholder="First Name" onInput={this.saveNewUserDetails.bind(this)}/>
                                <label for="last_name">Last Name</label>
                                <input type="text" id="last_name" name="last_name" placeholder="Last Name" onInput={this.saveNewUserDetails.bind(this)}/>
                                <label className="mandate" for="username">User Name</label>
                                <input type="text" id="username" name="username" placeholder="User Name" onInput={this.saveNewUserDetails.bind(this)}/>
                                <label className="mandate" for="email">Email</label>
                                <input  type="email" id="email" name="email" placeholder="Email" onInput={this.saveNewUserDetails.bind(this)}/>
                                <label className="mandate" for="password">Password</label>
                                <input type="password" id="password1" name="password1" placeholder="Password" onInput={this.saveNewUserDetails.bind(this)}/>
                                <label className="mandate" for="confirmPassword">Confirm Password</label>
                                <input type="password" id="password2" name="password2" placeholder="Confirm Password" onInput={this.saveNewUserDetails.bind(this)}/>
                            
                                {this.props.createUserFlag &&
                                    <div>
                                        <label className="mandate" for="userRoles">Roles</label>
                                        <select>
                                            <option name="roleType" value="admin" id="admin">Admin</option>
                                            <option name="roleType" value="reviewerL1" id="reviewerL1">ReviewerL1</option>
                                            <option name="roleType" value="reviewerL2" id="reviewerL2">ReviewerL2</option>
                                            <option name="roleType" value="superUser" id="superUser">SuperUser</option>
                                        </select>
                                        <label for="userRoles" className="mandate">Status</label>
                                        <select>
                                            <option name="status" value="active" id="active">Active</option>
                                            <option name="status" value="inactive" id="inactive">Inactive</option>
                                        </select>
                                        </div>
                                }
                                {this.props.ocrUserProfileFlag && 
                                    <div>
                                        {/* OCR created message and tick image */}
                                        
                                    </div>
                                }
                            </form>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div id="resetMsg"></div>
                        <Button bsStyle="primary" id="createUserBtn" onClick={this.submitNewUserDetails.bind(this)}>Create User</Button>
                        <Button bsStyle="primary" id="addUser" disabled={this.props.createUserFlag?false:true} onClick={this.submitNewUserStatus.bind(this)}>Save</Button>
                        {/* <Button bsStyle="primary" id="addUser" style={{display:this.props.ocrUserProfileFlag?"none":""}} onClick={this.closeAddUserPopup.bind(this)}>Close</Button> */}
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}