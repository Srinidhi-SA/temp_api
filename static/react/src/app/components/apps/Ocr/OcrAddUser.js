import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import {ToggleButton} from "primereact/togglebutton"
import store from "../../../store";
import { closeAddUserPopup, saveNewUserDetails, createNewUserAction, saveNewUserProfileDetails , submitNewUserProfileAction, fetchAllOcrUsersAction, setCreateUserLoaderFlag, fetchOcrListByReviewerType} from "../../../actions/ocrActions";
import { STATIC_URL } from "../../../helpers/env.js";
import { MultiSelect } from 'primereact/multiselect';

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag,
    createUserFlag : store.ocr.createUserFlag,
    curUserSlug : store.ocr.curUserSlug,
    newUserDetails : store.ocr.newUserDetails,
    newUserProfileDetails : store.ocr.newUserProfileDetails,
    ocrUserProfileFlag : store.ocr.ocrUserProfileFlag,
    loaderFlag : store.ocr.loaderFlag,
    ocrReviwersList : store.ocr.ocrReviwersList,
    selectedTabId : store.ocr.selectedTabId,
    appsList: store.ocr.appsList,
  };
})

export class OcrAddUser extends React.Component{
    constructor(props){
        super(props);
        this.state={
			appId:[]
		}
    }

    closeAddUserPopup(e){
        this.props.selectedTabId === "none"?this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum)):this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId),store.getState().ocr.ocrUserPageNum));
        this.props.dispatch(closeAddUserPopup());
    }
    saveNewUserDetails(e){
        $("#resetMsg")[0].innerText = ""
        let name = e.target.name;
        let value = e.target.value;
        this.props.dispatch(saveNewUserDetails(name,value));
    }
    submitNewUserDetails(e){
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let paswdFormat=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/;
        let userNameFormat= /^(?=.{8,20}$)[^\\._]?[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*[^\\._]?$/;
        let nameFormat= /^([a-zA-Z]){4,}$/;
        
        if($("#first_name")[0].value === "" || $("#last_name")[0].value === "" || $("#username")[0].value === "" || $("#email")[0].value === "" || $("#password1")[0].value === "" || $("#password2")[0].value === ""){
            $("#resetMsg")[0].innerText = "Please enter mandatory fields"
        }else if(!nameFormat.test(document.getElementById("first_name").value)){
            $("#resetMsg")[0].innerText = "First Name should have only alphabets with minimum 4 characters"
        }else if(!nameFormat.test(document.getElementById("last_name").value)){
            $("#resetMsg")[0].innerText = "Last Name should have only alphabets with minimum 4 characters"
        }else if(!userNameFormat.test(document.getElementById("username").value)){
            $("#resetMsg")[0].innerText = "Please enter valid User Name"
        }else if(!mailFormat.test($("#email")[0].value)){
            $("#resetMsg")[0].innerText = "Invalid Email Id"
        }else if(!paswdFormat.test($("#password1")[0].value)){
            $("#resetMsg")[0].innerText = "Please enter a strong password"
        }else if($("#password1")[0].value != $("#password2")[0].value){
            $("#resetMsg")[0].innerText = "Password and Confirm Passwords doesnot match"
        }else{
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true));
            this.props.dispatch(createNewUserAction(this.props.newUserDetails));
        }
    }
    saveUserStatus=(e)=>{
        let name=e.target.name;
        let value = e.target.value;
        if(name==="role")
            this.props.dispatch(saveNewUserProfileDetails(name,parseFloat(value)));
        else
            this.props.dispatch(saveNewUserProfileDetails(name,value));
    }
    submitNewUserStatus(e){
        if($("#role")[0].value === "none" || $("#is_active")[0].value === "none" || this.state.appId.length==0){
            $("#resetMsg")[0].innerText = "Please select mandatory fields"
        }else{
            this.setState({appId:[]});
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true));
            this.props.dispatch(submitNewUserProfileAction(this.props.newUserProfileDetails,this.props.curUserSlug));
        }
    }
    handleAllAppsOptions=() =>{
        var appList=this.props.appsList.map(i=>i)
          return appList.map(function (item) {
            return { "label": item.displayName, "value": item.app_id };
          });
        }
    handleAppList=()=>{
        this.props.dispatch(saveNewUserProfileDetails("app_list",this.state.appId));
    }
    render(){
        let disabledValue = this.props.createUserFlag?true:false
        let optionsTemp = [];
        optionsTemp.push(<option id="none" value="none">--select--</option>);
        for(var i=0; i<this.props.ocrReviwersList.length; i++){
            optionsTemp.push(<option key={this.props.ocrReviwersList[i].name} value={this.props.ocrReviwersList[i].id}>
                        {this.props.ocrReviwersList[i].name}
                    </option>);
        }
            return(
                <Modal className="addUserModel" backdrop="static" show={this.props.addUserPopupFlag} onHide={this.props.createUserFlag?"":this.closeAddUserPopup.bind(this)}>
                    <Modal.Header>
                        <button type="button" className="close" data-dismiss="modal" onClick={this.closeAddUserPopup.bind(this)}>&times;</button>
                        <h4 className="modal-title">Add User</h4>
                    </Modal.Header>
                    <Modal.Body id="addUsers">
                        {!this.props.ocrUserProfileFlag &&
                            <div className="ocrUserFormLabel">
                                <label className={this.props.createUserFlag?"":"mandate"} for="first_name">First Name</label>
                                <label className={this.props.createUserFlag?"":"mandate"} for="last_name" style={{marginLeft:"100px"}}>Last Name</label>
                                <input type="text" id="first_name" name="first_name" placeholder="First Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue} />
                                <input type="text" id="last_name" name="last_name" placeholder="Last Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue} />
                                
                                <label className={this.props.createUserFlag?"":"mandate"} for="username">User Name</label>
                                <label className={this.props.createUserFlag?"":"mandate"} for="email" style={{marginLeft:"100px"}}>Email</label>
                                <input type="text" id="username" name="username" placeholder="User Name" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                <input  type="email" id="email" name="email" placeholder="Email" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue}/>
                                
                                <label className={this.props.createUserFlag?"":"mandate"} for="password">Password</label>
                                <label className={this.props.createUserFlag?"":"mandate"} for="confirmPassword" style={{marginLeft:"100px"}}>Confirm Password</label>
                                <input type="password" id="password1" name="password1" placeholder="Password" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue} />
                                <input type="password" id="password2" name="password2" placeholder="Confirm Password" onInput={this.saveNewUserDetails.bind(this)} disabled={disabledValue} />
                                {this.props.createUserFlag &&
                                    <div>
                                        <label className="mandate">Select required App</label>
                                        <div className="col-sm-12 allApplist">
                                        <MultiSelect value={this.state.appId} style={{width:"98.3%",marginBottom:15}} name="app_list"
                                        options={this.handleAllAppsOptions()} onChange={(e)=> this.setState({appId: e.value},this.handleAppList)}
                                        filter={true} placeholder="Choose Apps" />
                                        </div>
                                        <label className="mandate" for="userRoles">Roles</label>
                                        <label for="userRoles" className="mandate" style={{marginLeft:"100px"}}>Status</label>
                                        <select name="role" id="role" onChange={this.saveUserStatus.bind(this)}>
                                            {optionsTemp}
                                        </select>
                                        <select name="is_active" id="is_active" onChange={this.saveUserStatus.bind(this)}>
                                            <option value="none" id="none" selected>--select--</option>
                                            <option value="True" id="active">Active</option>
                                            <option value="False" id="inactive">Inactive</option>
                                        </select>
                                      
                                    </div>
                                }
                                {!this.props.ocrUserProfileFlag && !this.props.createUserFlag &&
                                    <div style={{marginTop: "15px",marginLeft: "15px",marginBottom:0}}>
                                        <div>Please follow the below format for Username and Password.</div>
                                         <ul style={{paddingLeft:20}}>
                                             <li>Username must contain only alphanumeric character, underscore, and dot with 8-20 characters.</li>
                                             <li>Underscore and dot can not be next to each other and multiple times in a row.</li>
                                             <li>Password must contain 8-15 letters with atleast 1 number and 1 special character</li>
                                         </ul>          
                                    </div>  
                                }
                            </div>
                        }
                       {this.props.loaderFlag && !this.props.ocrUserProfileFlag &&
                            <div style={{ height:"100%",width:"100%", background: 'rgba(0,0,0,0.1)', position: 'absolute',top:0,left:0 }}>
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
                        <div id="resetMsg" style={{width:'60%'}}></div>
                        {(!this.props.createUserFlag && !this.props.ocrUserProfileFlag)?<Button bsStyle="primary" id="createUserBtn" onClick={this.submitNewUserDetails.bind(this)}>Create User</Button>:""}
                        {!this.props.ocrUserProfileFlag?<Button bsStyle="primary" id="addUser" disabled={this.props.createUserFlag?false:true} onClick={this.submitNewUserStatus.bind(this)}>Save</Button>:""}
                        {this.props.ocrUserProfileFlag?<Button bsStyle="primary" id="addUser" onClick={this.closeAddUserPopup.bind(this)}>Close</Button>:""}
                    </Modal.Footer>
                </Modal>
        );
    }
}