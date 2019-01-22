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
    selectedItem: store.datasets.selectedItem,
  };
})

export class Transform extends React.Component {
  constructor(props) {
    super(props);
    console.log("Transform constructor method is called...");
  }

  componentWillMount() {
    console.log("Transform componentWillMount method is called...");
  }

  render() {
    console.log("Transforms render method is called...");
    var transform = "";
    transform = (
      <Tab.Pane>
        <div className=" text-center">
          In Transform
        </div>
      </Tab.Pane>
    )

    return (
      <div>
        <Tab.Container id="left-tabs-example">
          <Row className="clearfix">
            <Col sm={15}>
              <Tab.Content animation>{transform}</Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}
