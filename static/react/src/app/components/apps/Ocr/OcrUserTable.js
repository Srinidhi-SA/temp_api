import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
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

        }
    }
    render(){
        return(
            <div className="row">
                <div className="col-md-3">
                    Manage Users
                </div>
                <div className="col-md-6">
                    
                </div>
                <div className="col-md-3">
                    <a onClick={this.openAddUserPopup.bind(this)}><i className="fa fa-user-plus fa-lg" aria-hidden="true"/></a>
                    <input type="text" id="searchUser" className="" placeholder="Search User"/>
                </div>
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
                                    <input className="col-md-8 ocrUserFormInput" id="firstName" type="text"/>
                                </div>
                                <div className="col-md-12 ocrUserFormGroup">
                                    <label className="col-md-4 mandate" for="lastName">Last Name</label>
                                    <input className="col-md-8 ocrUserFormInput" id="lastName" type="text"/>
                                </div>
                                <div className="col-md-12 ocrUserFormGroup">
                                    <div className="col-md-6">
                                        <label className="mandate" for="role">Role</label>
                                        <input className="" id="role" type="checkbox"/>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="mandate" for="status">Status</label>
                                        <input className="" id="status" type="checkbox"/>
                                    </div>
                                </div>
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div id="resetMsg"></div>
                        <Button bsStyle="primary" id="createUser" onClick={this.submitNewUserDetails.bind(this)}>Proceed</Button>
                        <Button bsStyle="primary" id="addUser" disabled={!this.props.createUserFlag?true:false}>Add User</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}