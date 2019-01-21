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

export class Bins extends React.Component {



    constructor(props) {

        super(props);

        console.log("Bins constructor method is called...");



    }



    componentWillMount() {

        console.log("Bins componentWillMount method is called...");



    }



    render() {

        console.log("Bins render method is called...");



        var bins = "";



        bins =

            (<Tab.Pane>

                <div className="row form-group">

                    <label for="sel_tobg" className="col-sm-4 control-label">{"Column name"}</label>

                    <div className="col-sm-8">

                        <input type="text" title="Please Enter " name="name" value={this.props.selectedItem.name} disabled className="form-control" />

                    </div>

                </div>



                <div className="row form-group">

                    <label for="sel_tobg" className="col-sm-4 control-label">{"Type of binning"}</label>

                    <div className="col-sm-8">

                        <select id="signal_Dataset" name="selectbasic" class="form-control" >

                            <option key={"a"} value={"a"} selected>{"hiiiii"}</option>

                            <option key={"b"} value={"b"} selected>{"hellooo"}</option>

                        </select>

                    </div>

                </div>



                <div className="row form-group">

                    <label for="sel_tobg" className="col-sm-4 control-label">{"Number of bins"}</label>

                    <div className="col-sm-8">

                        <input type="text" title="Please Enter " name="numberofbins" placeholder={"placeHolder"} className="form-control" />

                    </div>

                </div>



                <div className="row form-group">

                    <label for="sel_tobg" className="col-sm-4 control-label">{"Specify intervals"}</label>

                    <div className="col-sm-8">

                        <input type="text" title="Please Enter " name="specifyintervals" placeholder={"placeHolder"} className="form-control" />

                    </div>

                </div>



                <div className="row form-group">

                    <label for="sel_tobg" className="col-sm-4 control-label">{"New column name"}</label>

                    <div className="col-sm-8">

                        <input type="text" title="Please Enter " name="newcolumnname" placeholder={"placeHolder"} className="form-control" />

                    </div>

                </div>

            </Tab.Pane>



            )



        return (

            <div>

                <Tab.Container id="left-tabs-example">

                    <Row className="clearfix">

                        <Col sm={15}>

                            <Tab.Content animation>

                                {bins}

                            </Tab.Content>

                        </Col>



                    </Row>

                </Tab.Container>

            </div>

        );



    }








}
