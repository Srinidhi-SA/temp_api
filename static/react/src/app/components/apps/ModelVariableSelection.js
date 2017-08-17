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
		let dataPrev = store.getState().datasets.dataPreview;
		 const metaData = dataPrev.meta_data.columnData;
		 let renderSelectBox = null;
		if(metaData){
			renderSelectBox =  <select className="form-control" id="createModelAnalysisList">
			{metaData.map((metaItem,metaIndex) =>
			<option key={metaIndex} value={metaItem.name}>{metaItem.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = <option>No Variables</option>
		}
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

				      <div className="row">
			          <div className="col-lg-4">
			              <div className="form-group">
			                <input type="text" name="createModelName" id="createModelName" className="form-control input-sm" placeholder="Create Model Name" />
			              </div>
			          </div>{/*<!-- /.col-lg-4 -->*/}
			          <div className="col-lg-4">
			              <div className="form-group">
			              {renderSelectBox}
			              </div>
			          </div>{/*<!-- /.col-lg-4 -->*/}
			          </div>

				      <DataVariableSelection/>
				      </div>
				      </div>
				      </div>
						</div>
			);
	}
}
