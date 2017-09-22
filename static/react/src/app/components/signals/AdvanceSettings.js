import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {advanceSettingsModal} from "../../actions/signalActions";



@connect((store) => {
	return {login_response: store.login.login_response,
		advanceSettingsModal:store.signals.advanceSettingsModal,
	};
})

export class AdvanceSettings extends React.Component {
  constructor(props){
    super(props);
    console.log(props)
    this.openAdvanceSettingsModal = this.openAdvanceSettingsModal.bind(this);
  }
  componentWillMount() {
	  this.props.onRef(this)
	  }
  openAdvanceSettingsModal(){
	  this.props.dispatch(advanceSettingsModal(true));
  }
  closeAdvanceSettingsModal(){
	  this.props.dispatch(advanceSettingsModal(false));
  }	
  updateAdvanceSettings(){
	  alert("You clicked save.")
  }
  
  render() {
   return (
          <div id="idAdvanceSettings">
      	<Modal show={store.getState().signals.advanceSettingsModal} backdrop="static" onHide={this.closeAdvanceSettingsModal.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Header closeButton>
		<h3 className="modal-title">Advance Settings</h3>
		</Modal.Header>
		
      	<Modal.Body>
		<div className="row">
		Advance settings....
	</div>
		</Modal.Body>
		
		<Modal.Footer>
		<Button onClick={this.closeAdvanceSettingsModal.bind(this)}>Close</Button>
	    <Button bsStyle="primary" onClick={this.updateAdvanceSettings.bind(this)}>Save</Button>
		</Modal.Footer>
		
		</Modal>
          </div>
       );
  }
}
