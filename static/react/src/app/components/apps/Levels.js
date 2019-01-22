import React from "react";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Dropdown, Menu, MenuItem, Modal, Nav, NavItem, Tab, Row, Col } from "react-bootstrap";
import {
  openBinsOrLevelsModalAction,
  closeBinsOrLevelsModalAction,
  openTransformColumnModalAction,
  closeTransformColumnModalAction,
  selectedBinsOrLevelsTabAction,
} from "../../actions/dataActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataPreview: store.datasets.dataPreview,
    dataSets: store.datasets.allDataSets,
    binsOrLevelsShowModal: store.datasets.binsOrLevelsShowModal,
    transferColumnShowModal: store.datasets.transferColumnShowModal,
    selectedBinsOrLevelsTab: store.datasets.selectedBinsOrLevelsTab,
    selectedItem: store.datasets.selectedItem,
  };
})

export class Levels extends React.Component {
  constructor(props) {
    super(props);
    console.log("Levels constructor method is called...");
    this.state = { levelsArr: [{ name: "" }] };
  }

  componentWillMount() {
    console.log("Levels componentWillMount method is called...");
  }

  render() {
    console.log("Levels render method is called...");
    var levels = "";
    levels = (
      <Tab.Pane>
        {this.state.levelsArr.map((level, idx) => (
          <div className="level">
            <input type="text" placeholder={`level #${idx + 1} name`} value={level.name}/>
            <button type="button" onClick={this.handleRemoveLevel(idx).bind(this)} className="small">-</button>
          </div>
        ))}
        <div className=" text-center" onClick={this.handleAddLevel.bind(this)} >+<br/>
          <small>Add Level</small>
        </div>
      </Tab.Pane>
    )

    return (
      <div>
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>{levels}</Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
  handleLevelSubmit = evt => {

  };

  handleAddLevel = () => {
    this.setState({
      levelsArr: this.state.levelsArr.concat([{ name: "" }])
    });
  };

  handleRemoveLevel = idx => () => {
    this.setState({
      levelsArr: this.state.levelsArr.filter((s, sidx) => idx !== sidx)
    });
  };
}
