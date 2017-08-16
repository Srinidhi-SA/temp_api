import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {DataVariableSelection} from "../data/DataVariableSelection";



@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview};
})

export class ModelVariableSelection extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {
		console.log("Create Model Variable Selection  is called##########3");
			return(
					 <div className="side-body">
			            <div className="page-head">
			               <div className="row">
			                  <div className="col-md-8">
			                     <h2>Variable Selection</h2>
			                  </div>
			               </div>
			               <div className="clearfix"></div>
			            </div>
			            <div className="main-content">
				        <div className="panel panel-default">
				      <div className="panel-body">
				      <DataVariableSelection/>
				      </div>
				      </div>
				      </div>
						</div>
			);
	}
}
