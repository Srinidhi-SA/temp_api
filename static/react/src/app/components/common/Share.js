import React from "react";
import { connect } from "react-redux";
import { MultiSelect } from 'primereact/multiselect';
import { Button, Modal ,Tab, Row, Col } from "react-bootstrap";
import {closeShareModalAction,shareItemCall} from "../../actions/dataActions";
@connect((store) => {
  return {
    shareItemName: store.datasets.shareItem,
    shareItemSlug: store.datasets.shareItemSlug,
    shareModelShow:store.datasets.shareModelShow,
  };
})

export class Share extends React.Component {
  constructor(props) {
    super(props);
    this.state={
			names:[]
		}
  }

  closeShareModal() {
    console.log("closeddddd ---closeBinsOrLevelsModal");
    this.props.dispatch(closeShareModalAction());
  }
  getMultiSelectOptions() {
  var UserNames=Object.values(this.props.usersList.allUsersList).map(i=>i)
    return UserNames.map(function (item) {
      return { "label": item.name, "value": item.Uid };
    });
  }
  proceedToShare(names){
    shareItemCall(names,this.props.shareItemSlug);
    this.closeShareModal()
    this.setState({names:[]})

  }

  render() {
   var rendermultiselect= (this.props.usersList.allUsersList!=undefined? <div className="form-group">
       <div className="content-section implementation multiselect-demo">
       <MultiSelect  value={this.state.names}  options={this.getMultiSelectOptions()} onChange={(e) => this.setState({names: e.value})}
        style={{ minWidth: '20em' }}  filter={true} placeholder="choose" />
       </div>
       </div>:"")
    var renderOptions =
      (<Tab.Pane>
       {this.props.shareItemName}
       {rendermultiselect}
      </Tab.Pane>)

    return (
<div id="sharePopup" role="dialog" className="modal fade modal-colored-header">
  <Modal show={this.props.shareModelShow} onHide={this.closeShareModal.bind(this)} dialogClassName="modal-colored-header modal-md" style={{ overflow: 'inherit' }} >
    <Modal.Header>
      <h3 className="modal-title">Share</h3>
    </Modal.Header>
    <Modal.Body>
     <div>
      <h4>With whom you want to share?</h4>
      <Tab.Container id="left-tabs-example">
        <Row className="clearfix">
          <Col sm={15}>
            < Tab.Content animation>
              {renderOptions}
            </Tab.Content>
          </Col>
         </Row>
       </Tab.Container>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={this.closeShareModal.bind(this)}>Cancel</Button>
      <Button bsStyle="primary" form="shareForm" content="Submit" onClick={this.proceedToShare.bind(this,this.state.names)} value="Submit">Share</Button>
    </Modal.Footer>
    </Modal>
  </div>);}}