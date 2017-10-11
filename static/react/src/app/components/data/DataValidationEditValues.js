import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import {updateVLPopup,addComponents} from "../../actions/dataActions";




@connect((store) => {
	return {login_response: store.login.login_response,
		dataList: store.datasets.dataList,
		dataPreview: store.datasets.dataPreview,
		variableTypeListModal:store.datasets.variableTypeListModal,
		dataTransformSettings:store.datasets.dataTransformSettings,
		selectedColSlug:store.datasets.selectedColSlug,
		dataSetColumnRemoveValues:store.datasets.dataSetColumnRemoveValues,

	};
})

export class DataValidationEditValues extends React.Component {
  constructor(){
    super();
  }
  showPopup(){
	  this.props.dispatch(updateVLPopup(true))
  }
  hidePopup(){
	  this.props.dispatch(updateVLPopup(false))
  }
  componentWillMount(){
	  this.props.dispatch(addComponents());
  }
  render() {
	  /*var that = this;
	  let transformationSettings = store.getState().datasets.dataTransformSettings;
		 transformationSettings.map((columnData,columnIndex) =>{
       if(that.props.slug == columnData.slug){
     	  settingsTemplate = that.renderDropdownList(columnData.columnSetting)
       }	 
		 });*/
	  let dataSetColumnRemoveValues = this.props.dataSetColumnRemoveValues;
	  let templateTextBoxes = dataSetColumnRemoveValues.map((data,id) =>{
		  return (<div className="form-group" id={data.id}>
			<label for="fl1" className="col-sm-1 control-label"><b>{id+1}.</b></label>
			<div className="col-sm-8">
			<input  id={data.id} type="text" name={data.id}  value={data.value} className="form-control"/>
			</div>
			<div className="col-sm-1 cursor"><i className="fa fa-times"></i></div>
			</div>);
	  });
   return (
          <div id="idVariableTypeList" role="dialog" className="modal fade modal-colored-header">
      	<Modal show={store.getState().datasets.variableTypeListModal} backdrop="static" onHide={this.hidePopup.bind(this)} dialogClassName="modal-colored-header uploadData">
      	<Modal.Header closeButton>
		<h3 className="modal-title">Edit Values</h3>
		</Modal.Header>
      	
      	<Modal.Body>
      	<div className="row">
		<Tab.Container id="left-tabs-example" defaultActiveKey="Remove">
		<Row className="clearfix">
		<Col sm={3}>
		<Nav bsStyle="pills" stacked>
		<NavItem eventKey="Remove">
		Remove
		</NavItem>
		<NavItem eventKey="Replace" >
		Replace
		</NavItem>
		</Nav>
		</Col>

		<Col sm={9}>
		<Tab.Content animation>
		<Tab.Pane eventKey="Remove">
		<div className="tab-pane active cont fade in">
		<div id="removeValues">
		<form role="form" className="form-horizontal">
		{templateTextBoxes}
		<div className="dataTransformValues">
		 <Button bsStyle="primary" onClick={this.hidePopup.bind(this)}>Add More&nbsp;<i className="fa fa-plus"></i></Button>
		</div>
		</form>
		
		</div>
		</div>
		</Tab.Pane>
		<Tab.Pane eventKey="Replace">
		<div className="tab-pane active cont fade in"> Replace Values </div>
		</Tab.Pane>
		</Tab.Content>
		</Col>

		</Row>
		</Tab.Container>
		
		
	</div>
	
	 </Modal.Body>
		
		<Modal.Footer>
		<Button onClick={this.hidePopup.bind(this)}>Close</Button>
	    <Button bsStyle="primary" onClick={this.hidePopup.bind(this)}>Save</Button>
		</Modal.Footer>
		
		</Modal>
          </div>
       );
  }
}
