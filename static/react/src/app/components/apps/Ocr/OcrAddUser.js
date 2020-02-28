import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import { openAddUserPopup, closeAddUserPopup, saveNewUserDetails, createNewUserAction, saveNewUserProfileDetails , submitNewUserProfileAction, fetchAllOcrUsersAction, setCreateUserLoaderFlag} from "../../../actions/ocrActions";
import { STATIC_URL } from "../../../helpers/env.js";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    curUserSlug : store.ocr.curUserSlug,
    newUserDetails : store.ocr.newUserDetails,
    allOcrUsers : store.ocr.allOcrUsers,
    newUserProfileDetails : store.ocr.newUserProfileDetails,
    ocrUserProfileFlag : store.ocr.ocrUserProfileFlag,
    createUserLoaderFlag : store.ocr.createUserLoaderFlag,
  };
})

export class OcrAddUser extends React.Component{
    constructor(props){
        super(props);
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
        let paswdFormat=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/;
        
        if($("#first_name")[0].value === "" || $("#last_name")[0].value === "" || $("#username")[0].value === "" || $("#email")[0].value === "" || $("#password1")[0].value === "" || $("#password2")[0].value === ""){
            $("#resetMsg")[0].innerText = "Please enter mandatory fields"
        }else if(!mailFormat.test($("#email")[0].value)){
            $("#resetMsg")[0].innerText = "Invalid Email Format"
        }else if(!paswdFormat.test($("#password1")[0].value)){
            $("#resetMsg")[0].innerText = "Password must contain atleast 1 number and a special character"
        }else if($("#password1")[0].value != $("#password2")[0].value){
            $("#resetMsg")[0].innerText = "Password and Confirm Passwords doesnot match"
        }else{
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true));
            this.props.dispatch(createNewUserAction(this.props.newUserDetails));
        }
    }
    saveUserStatus(e){
        let name=e.target.name;
        let value = e.target.value;
        if(name==="reviewer_type")
            this.props.dispatch(saveNewUserProfileDetails(name,parseFloat(value)));
        else
            this.props.dispatch(saveNewUserProfileDetails(name,value));
    }
    submitNewUserStatus(e){
        if($("#reviewer_type")[0].value === "none" || $("#is_active")[0].value === "none"){
            $("#resetMsg")[0].innerText = "Please select mandatory fields"
        }else{
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true));
            this.props.dispatch(submitNewUserProfileAction(this.props.newUserProfileDetails,this.props.curUserSlug));
        }
    }
    
    render(){
        let disabledValue = this.props.createUserFlag?true:false
            return(
                <Modal show={this.props.addUserPopupFlag} onHide={this.closeAddUserPopup.bind(this)}>
                    <Modal.Header>
                        <button type="button" className="close" data-dismiss="modal" onClick={this.closeAddUserPopup.bind(this)}>&times;</button>
                        <h4 className="modal-title">Add User</h4>
                    </Modal.Header>
                    <Modal.Body id="addUsers">
                        {!this.props.ocrUserProfileFlag &&
                            <div className="ocrUserFormLabel" style={{position:"absolute"}}>
                                <label className="mandate" for="first_name">First Name</label>
                                <input type="text" id="first_name" name="first_name" placeholder="First Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <label for="last_name">Last Name</label>
                                <input type="text" id="last_name" name="last_name" placeholder="Last Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <label className="mandate" for="username">User Name</label>
                                <input type="text" id="username" name="username" placeholder="User Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <label className="mandate" for="email">Email</label>
                                <input  type="email" id="email" name="email" placeholder="Email" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <label className="mandate" for="password">Password</label>
                                <input type="password" id="password1" name="password1" placeholder="Password" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <label className="mandate" for="confirmPassword">Confirm Password</label>
                                <input type="password" id="password2" name="password2" placeholder="Confirm Password" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                
                                {this.props.createUserFlag &&
                                    <div>
                                        <label className="mandate" for="userRoles">Roles</label>
                                        <select name="reviewer_type" id="reviewer_type" onChange={this.saveUserStatus.bind(this)}>
                                            <option value="none" id="none">--Select--</option>
                                            <option value="1" id="admin">Admin</option>
                                            <option value="4" id="reviewerL1">ReviewerL1</option>
                                            <option value="6" id="reviewerL2">ReviewerL2</option>
                                            <option value="3" id="superUser">SuperUser</option>
                                        </select>
                                        <label for="userRoles" className="mandate">Status</label>
                                        <select name="is_active" id="is_active" onChange={this.saveUserStatus.bind(this)}>
                                            <option value="none" id="none" selected>--select--</option>
                                            <option value="True" id="active">Active</option>
                                            <option value="False" id="inactive">Inactive</option>
                                        </select>
                                    </div>
                                }
                            </div>
                        }
                        {this.props.createUserLoaderFlag && !this.props.ocrUserProfileFlag &&
                            <div style={{ height:"350px", background: 'rgba(0,0,0,0.1)', position: 'relative',margin:"-10px" }}>
                                <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                            </div>
                        }
                        {this.props.ocrUserProfileFlag && 
                            <div className="col-md-12 ocrSuccess">
                                <img className="wow bounceIn" data-wow-delay=".75s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10" src={STATIC_URL + "assets/images/success_outline.png"} style={{ height: 105, width: 105, marginTop:"75px" }} />
                                <div className="wow bounceIn" data-wow-delay=".25s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10">
                                    <span style={{ paddingTop: 10, color: 'rgb(50, 132, 121)', display: 'block' }}>User Added Successfully</span>
                                </div>
                            </div>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div id="resetMsg"></div>
                        {(!this.props.createUserFlag && !this.props.ocrUserProfileFlag)?<Button bsStyle="primary" id="createUserBtn" onClick={this.submitNewUserDetails.bind(this)}>Create User</Button>:""}
                        {!this.props.ocrUserProfileFlag?<Button bsStyle="primary" id="addUser" disabled={this.props.createUserFlag?false:true} onClick={this.submitNewUserStatus.bind(this)}>Save</Button>:""}
                        {this.props.ocrUserProfileFlag?<Button bsStyle="primary" id="addUser" onClick={this.closeAddUserPopup.bind(this)}>Close</Button>:""}
                    </Modal.Footer>
                </Modal>
        );
    }
}