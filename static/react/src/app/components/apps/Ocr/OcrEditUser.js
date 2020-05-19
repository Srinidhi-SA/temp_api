import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import store from "../../../store";
import { fetchAllOcrUsersAction, closeEditUserModalAction, enableEditingUserAction, SaveEditedUserDetailsAction, submitEditUserDetailsAction, setCreateUserLoaderFlag, submitEditedUserRolesAction, editDetailsFormAction, editRolesFormAction, fetchOcrListByReviewerType} from "../../../actions/ocrActions";
import { STATIC_URL } from "../../../helpers/env.js";

@connect((store) => {
  return {
    editOcrUserFlag : store.ocr.editOcrUserFlag,
    enableEditingFlag : store.ocr.enableEditingFlag,
    editedUserDetails : store.ocr.editedUserDetails,
    loaderFlag : store.ocr.loaderFlag,
    editUserSuccessFlag : store.ocr.editUserSuccessFlag,
    roleFormSel : store.ocr.roleFormSel,
    detailsFormSel : store.ocr.detailsFormSel,
    selUserSlug : store.ocr.selUserSlug,
    ocrReviwersList : store.ocr.ocrReviwersList,
    selectedTabId : store.ocr.selectedTabId,
  };
})

export class OcrEditUser extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidUpdate(){
        if(this.props.enableEditingFlag){
            $("#first_name")[0].disabled = false;
            $("#last_name")[0].disabled = false;
            $("#username")[0].disabled = false;
            $("#email")[0].disabled = false;
            $("#role")[0].disabled = false;
            $("#is_active")[0].disabled = false;

            $("#fname")[0].classList.add("mandate")
            $("#lname")[0].classList.add("mandate")
            $("#uname")[0].classList.add("mandate")
            $("#mail")[0].classList.add("mandate")
            $("#rtype")[0].classList.add("mandate")
            $("#iactive")[0].classList.add("mandate")
        }
    }

    closeEditUserModal(){
        this.props.selectedTabId === "none"?this.props.dispatch(fetchAllOcrUsersAction(store.getState().ocr.ocrUserPageNum)):this.props.dispatch(fetchOcrListByReviewerType(parseFloat(this.props.selectedTabId),store.getState().ocr.ocrUserPageNum));
        this.props.dispatch(enableEditingUserAction(false));
        this.props.dispatch(closeEditUserModalAction(false));
    }
    enableEditingUser(e){
        this.props.dispatch(enableEditingUserAction(true));
    }
    saveuserEditedDetails(e){
        this.props.dispatch(SaveEditedUserDetailsAction(e.target.name,e.target.value));
    }
    submitEditedForms(e){
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if($("#first_name")[0].value === "" || $("#last_name")[0].value === "" || $("#username")[0].value === "" || $("#email")[0].value === "" ){
            $("#resetMsg")[0].innerText = "Please enter mandatory fields"
        }
        else if(!mailFormat.test($("#email")[0].value)){
            $("#resetMsg")[0].innerText = "Invalid Email"
        }
        else if(!this.props.roleFormSel && !this.props.detailsFormSel){
            $("#resetMsg")[0].innerText = "No changes to save"
        }
        else if(this.props.roleFormSel && this.props.detailsFormSel){
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true))

            let allowedVariables1 = ["email","first_name","last_name","username"];
            let filteredVariables1 = Object.keys(this.props.editedUserDetails).filter(key => allowedVariables1.includes(key)).reduce((obj, key) => {
                obj[key] = this.props.editedUserDetails[key];
                return obj;
            }, {});
            this.props.dispatch(submitEditUserDetailsAction(filteredVariables1));
            let allowedVariables2 = ["role","is_active"];
            let filteredVariables2 = Object.keys(this.props.editedUserDetails).filter(key => allowedVariables2.includes(key)).reduce((obj, key) => {
                obj[key] = this.props.editedUserDetails[key];
                return obj;
            }, {});
            this.props.dispatch(submitEditedUserRolesAction(filteredVariables2,this.props.ocrReviwersList,this.props.selUserSlug));
        }
        else if(this.props.detailsFormSel){
            $("#resetMsg")[0].innerText = ""
            this.props.dispatch(setCreateUserLoaderFlag(true))
            let allowedVariables1 = ["email","first_name","last_name","username"];
            let filteredVariables1 = Object.keys(this.props.editedUserDetails).filter(key => allowedVariables1.includes(key)).reduce((obj, key) => {
                obj[key] = this.props.editedUserDetails[key];
                return obj;
            }, {});
            this.props.dispatch(submitEditUserDetailsAction(filteredVariables1));
        }
        else if(this.props.roleFormSel){
            if($("#role")[0].value === "none" || $("#is_active")[0].value === "none"){
                $("#resetMsg")[0].innerText = "Please enter mandatory fields"
            }else{
                $("#resetMsg")[0].innerText = ""
                this.props.dispatch(setCreateUserLoaderFlag(true))
                let allowedVariables = ["role","is_active"];
                let filteredVariables = Object.keys(this.props.editedUserDetails).filter(key => allowedVariables.includes(key)).reduce((obj, key) => {
                    obj[key] = this.props.editedUserDetails[key];
                    return obj;
                }, {});
                this.props.dispatch(submitEditedUserRolesAction(filteredVariables,this.props.ocrReviwersList,this.props.selUserSlug));    
            }
        }
    }

    updateFormSelected(e){
        $("#resetMsg")[0].innerText = ""
        if(e.currentTarget.id === "userProfileDetails"){
            this.props.dispatch(editDetailsFormAction(true));
        }else{
            this.props.dispatch(editRolesFormAction(true));
        }
    }

    render(){
        let optionsTemp = [];
        optionsTemp.push(<option id="none" value="none">--select--</option>);
        for(var i=0; i<this.props.ocrReviwersList.length; i++){
            optionsTemp.push(<option key={this.props.ocrReviwersList[i].name} value={this.props.ocrReviwersList[i].name}>
                        {this.props.ocrReviwersList[i].name}
                    </option>);
        }
        return(
            <Modal backdrop="static" show={this.props.editOcrUserFlag} onHide={this.closeEditUserModal.bind(this)}>
                <Modal.Header>
                    <button type="button" className="close" data-dismiss="modal" onClick={this.closeEditUserModal.bind(this)}>&times;</button>
                    <h4 className="modal-title">Edit User</h4>
                </Modal.Header>
                <Modal.Body id="editUsers">
                        {!this.props.editUserSuccessFlag &&
                            <div className="ocrUserFormLabel" style={{position:"absolute"}}>
                                <form role="form" id="userProfileDetails" onChange={this.updateFormSelected.bind(this)}>
                                    <label id="fname" for="first_name">First Name</label>
                                    <label id="lname" for="last_name" style={{marginLeft:"100px"}}>Last Name</label>
                                    <input type="text" id="first_name" name="first_name" placeholder="First Name" defaultValue={this.props.editedUserDetails.first_name} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                                    <input type="text" id="last_name" name="last_name" placeholder="Last Name" defaultValue={this.props.editedUserDetails.last_name} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                                    
                                    <label id="uname" for="username">User Name</label>
                                    <label id="mail" for="email" style={{marginLeft:"100px"}}>Email</label>
                                    <input type="text" id="username" name="username" placeholder="User Name" defaultValue={this.props.editedUserDetails.username} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                                    <input type="email" id="email" name="email" placeholder="Email" defaultValue={this.props.editedUserDetails.email} disabled onInput={this.saveuserEditedDetails.bind(this)} />
                                </form>
                                <form role="form" id="userProfileRoles" onChange={this.updateFormSelected.bind(this)}>
                                    <label id="rtype" for="role">Roles</label>
                                    <label id="iactive" for="is_active" style={{marginLeft:"100px"}}>Status</label>
                                    <select name="role" id="role" disabled onChange={this.saveuserEditedDetails.bind(this)} defaultValue={this.props.editedUserDetails.role != undefined?this.props.editedUserDetails.role:"none"}>
                                        {optionsTemp}
                                    </select>
                                    <select name="is_active" id="is_active" disabled onChange={this.saveuserEditedDetails.bind(this)} defaultValue={this.props.editedUserDetails.is_active}>
                                        <option value="none" id="none">--select--</option>
                                        <option value="True" id="active">Active</option>
                                        <option value="False" id="inactive">Inactive</option>
                                    </select>
                                </form>
                            </div>
                        }
                        {this.props.loaderFlag && !this.props.editUserSuccessFlag &&
                            <div style={{ height:"275px", background: 'rgba(0,0,0,0.1)', position: 'relative',margin:"-10px" }}>
                                <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                            </div>
                        }
                        {this.props.editUserSuccessFlag &&
                            <div className="ocrSuccess">
                                <img className="wow bounceIn" data-wow-delay=".75s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10" src={STATIC_URL + "assets/images/success_outline.png"} style={{width: 105 }} />
                                <div className="wow bounceIn" data-wow-delay=".25s" data-wow-offset="20" data-wow-duration="5s" data-wow-iteration="10">
                                    <span style={{ paddingTop: 10, color: 'rgb(50, 132, 121)', display: 'block' }}>Saved Successfully</span>
                                </div>
                            </div>
                        }
                </Modal.Body>
                <Modal.Footer>
                    <div id="resetMsg"></div>
                    {!this.props.enableEditingFlag?<Button bsStyle="primary" id="editUser" onClick={this.enableEditingUser.bind(this)}>Edit</Button>:""}
                    {this.props.enableEditingFlag && !this.props.editUserSuccessFlag?<Button bsStyle="primary" id="saveEditedUser" onClick={this.submitEditedForms.bind(this)}>Save</Button>:""}
                    <Button bsStyle="default" onClick={this.closeEditUserModal.bind(this)}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}