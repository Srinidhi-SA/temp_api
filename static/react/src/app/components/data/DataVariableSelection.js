import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";


@connect((store) => {
	return {login_response: store.login.login_response};
})

export class DataVariableSelection extends React.Component {
	constructor(props) {
		super(props);
	}
    
	render() {
			return (
				<div>Going to Variable Selection Page</div>
			)
		}
	
}	  