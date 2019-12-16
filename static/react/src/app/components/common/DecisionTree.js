import React from "react";
import { connect } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import {closeDtModalAction} from "../../actions/dataActions";
@connect((store) => {
  return {
    dtModelShow: store.datasets.dtModelShow,
    dtRule: store.datasets.dtRule,
  };
})

export class DecisionTree extends React.Component {
  constructor(props) {
    super(props);
    this.state={
		}
  }

  closeDTModal() {
    this.props.dispatch(closeDtModalAction());
  }

getText=()=>{
  document.getElementById("rule").innerHTML=this.props.dtRule
}

  render() {
  return (
  <div id="decisionTreePopup" role="dialog" className="modal fade modal-colored-header ">
  <Modal show={this.props.dtModelShow} onHide={this.closeDTModal.bind(this)} dialogClassName="modal-colored-header modal-md modalOpacity">
    <Modal.Header>
      <h3 className="modal-title">Prediction Rule</h3>
    </Modal.Header>
    <Modal.Body>
     <div className="row">
     <div className="col-sm-12" >
       <div ref="test"></div>
     </div>
           
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={this.closeDTModal.bind(this)}>Cancel</Button>
     
    </Modal.Footer>
    </Modal>
  </div>);}
componentDidUpdate(){
  this.refs.test.innerHTML = this.props.dtRule;
}  
}