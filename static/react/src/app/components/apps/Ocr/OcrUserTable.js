import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import { openAddUserPopup, closeAddUserPopup, saveNewUserDetailsAction } from "../../../actions/ocrActions";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    newUserDetails : store.ocr.newUserDetails,
  };
})

export class OcrUserTable extends React.Component{
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
        this.props.dispatch(closeAddUserPopup());
    }
    saveNewUserDetails(e){
        let name = e.target.name;
        let value = e.target.value;
        this.props.dispatch(saveNewUserDetailsAction(name,value));
    }
    submitNewUserDetails(e){
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let paswdFormat=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/;
        if(Object.keys(this.props.newUserDetails).length === 0){
            $("#resetMsg")[0].innerText = "Please enter details"
        }else if($("#userName")[0].value === ""){
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
            this.props.dispatch()
        }
    }
    render(){
        return(
            <div>
                <div className="row">
                    <div className="col-md-3">
                        <h4>Manage Users</h4>
                    </div>
                    <div className="col-md-6">
                    
                    </div>
                    <div className="col-md-3">
                        <a onClick={this.openAddUserPopup.bind(this)}><i className="fa fa-user-plus fa-lg" aria-hidden="true"/></a>
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
                                <div className="createUser row">
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4 mandate" for="userName">User Name</label>
                                        <input type="text" id="userName" name="userName" placeholder="User Name" className="col-md-8 ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    </div>
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4 mandate" for="email">Email</label>
                                        <input  type="email" id="email" name="email" placeholder="Email" className="col-md-8 ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    </div>
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4 mandate" for="password">Password</label>
                                        <input type="password" id="password1" name="password1" placeholder="Password" className="col-md-8 ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    </div>
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4 mandate" for="confirmPassword">Confirm Password</label>
                                        <input type="password" id="password2" name="password2" placeholder="Confirm Password" className="col-md-8 ocrUserFormInput" onInput={this.saveNewUserDetails.bind(this)}/>
                                    </div>
                                </div>
                            }
                            {this.props.createUserFlag &&
                                <div className="createUserProfile row">
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4 mandate" for="firstName">First Name</label>
                                        <input type="text" id="firstName" name="firstName" placeholder="First Name" className="col-md-8 ocrUserFormInput"/>
                                    </div>
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <label className="col-md-4" for="lastName">Last Name</label>
                                        <input type="text" id="lastName" name="lastName" placeholder="Last Name" className="col-md-8 ocrUserFormInput"/>
                                    </div>
                                    <div className="col-md-12 ocrUserFormGroup">
                                        <div className="col-md-6">
                                            <label for="userRoles" className="mandate">Roles</label>
                                            <ul className = "list-unstyled">
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="admin"/><label for="admin">Admin</label></div>
                                                </li>
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="reviewerL1"/><label for="reviewerL1">Reviewer L1</label></div>
                                                </li>
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="reviewerL2"/><label for="reviewerL2">Reviewer L2</label></div>
                                                </li>
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="superUser"/><label for="superUser">Superuser</label></div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <label for="userRoles" className="mandate">Status</label>
                                            <ul className = "list-unstyled">
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="active"/><label for="active">Active</label></div>
                                                </li>
                                                <li><div className = "ma-radio inline">
                                                    <input type="radio" name="roleType" id="inactive"/><label for="inactive">Inactive</label></div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <div id="resetMsg"></div>
                            <Button bsStyle="primary" id="createUser" onClick={this.submitNewUserDetails.bind(this)}>Add User</Button>
                            <Button bsStyle="primary" id="addUser" style={{display:!this.props.createUserFlag?"none":""}} >Proceed</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div className = "table-responsive box-shadow">
                    <table className = "table manageUserTable">
                        <thead>
                        <tr>
                            <th>FIRST NAME</th>
                            <th>LAST NAME</th>
                            <th>EMAIL</th>
                            <th>ROLES</th>
                            <th>DATE JOINED</th>
                            <th>LAST LOGIN</th>
                            <th>STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>ABC</td>
                            <td>D</td>
                            <td>abd@mail.com</td>
                            <td>Admin</td>
                            <td>10/11/2020</td>
                            <td>8:30:00 PM</td>
                            <td>
                                <ToggleButton className="userStatusBtn" checked={this.state.checked1} onChange={(e) => this.setState({checked1: e.value})} onLabel="Active" offLabel="Inactive"/>
                            </td>
                        </tr>
                        <tr>
                            <td>EFG</td>
                            <td>H</td>
                            <td>efg@marlb.com</td>
                            <td>Superuser</td>
                            <td>10/11/2020</td>
                            <td>01:05:80 AM</td>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}