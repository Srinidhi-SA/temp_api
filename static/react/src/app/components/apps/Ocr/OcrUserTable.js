import React from "react";
import { connect } from "react-redux";
import { Modal, Button} from "react-bootstrap";
import store from "../../../store";
import { openAddUserPopup, closeAddUserPopup } from "../../../actions/ocrActions";

@connect((store) => {
  return {
    addUserPopupFlag : store.ocr.addUserPopupFlag
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
    render(){
        return(
            <div className="row">
                <div className="col-md-3">
                    Manage Users
                </div>
                <div className="col-md-6">
                    
                </div>
                <div className="col-md-3">
                    <a onClick={this.openAddUserPopup.bind(this)}>
                        <i className="fa fa-user-plus fa-lg" aria-hidden="true"/>
                    </a>
                </div>
                <Modal show={this.props.addUserPopupFlag} onHide={this.closeAddUserPopup.bind(this)}>
                    <Modal.Header>
                        <button type="button" className="close" data-dismiss="modal" onClick={this.closeAddUserPopup.bind(this)}>&times;</button>
                        <h4 className="modal-title">Add User</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="row">
                                <div className="form-group">
                                    <label className="col" for="userName">User Name</label>
                                    <input className="col" id="userName" type="text"/>
                                </div>
                                <div className="form-group">
                                    <label for="email">e-mail</label>
                                    <input id="email" type="email"/>
                                </div>
                                <div className="form-group">
                                    <label for="password">Password</label>
                                    <input id="password" type="password"/>
                                </div>
                                <div className="form-group">
                                    <label for="confirmPassword">Confirm Password</label>
                                    <input id="confirmPassword" type="password"/>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div id="errMsg"></div>
                        <Button bsStyle="primary" id="createUser">Proceed</Button>
                        <Button bsStyle="primary" id="addUser">Add User</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}