import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {updateVLPopup} from "../../actions/dataActions";




@connect((store) => {
	return {login_response: store.login.login_response,
		dataList: store.datasets.dataList,
		dataPreview: store.datasets.dataPreview,
		variableTypeListModal:store.datasets.variableTypeListModal,
		dataTransformSettings:store.datasets.dataTransformSettings,
		selectedColSlug:store.datasets.selectedColSlug,

	};
})

export class DataValidationVariableTypes extends React.Component {
  constructor(){
    super();
  }
  showPopup(){
	  this.props.dispatch(updateVLPopup(true))
  }
  hidePopup(){
	  this.props.dispatch(updateVLPopup(false))
  }
  render() {
   return (
          <div id="idVariableTypeList">
      	<Modal show={store.getState().datasets.variableTypeListModal} backdrop="static" onHide={this.hidePopup.bind(this)} dialogClassName="modal-colored-header">
      	<Modal.Body>
		<div className="row">
		<div className="col-md-12">
	List
		</div>
	</div>
		</Modal.Body>
		
		<Modal.Footer>
		<Button onClick={this.hidePopup.bind(this)}>Close</Button>
	    <Button bsStyle="primary" onClick={this.hidePopup.bind(this)}>Load Data</Button>
		</Modal.Footer>
		
		</Modal>
          </div>
       );
  }
}
