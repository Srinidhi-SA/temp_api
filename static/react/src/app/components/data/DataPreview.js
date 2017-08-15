import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {DataPreviewLeftPanel} from "./DataPreviewLeftPanel";
import {DataPreviewRightPanel} from "./DataPreviewRightPanel";
import {hideDataPreview} from "../../actions/dataActions";

//var dataPrev= {
//"metaData" : [   {"name": "Rows", "value": 30, "display":true},
//{"name": "Measures", "value": 10, "display":true},
//{"name": "Dimensions", "value": 5, "display":true},
//{"name": "Ignore Suggestion", "value": 20, "display":false}
//],

//"columnData" : [{
//"name": "Age",
//"slug": "age_a",
//"columnStats":[ {"name": "Mean", "value":100}, {"name": "Sum", "value":1000}, {"name": "Min", "value":0},
//{"name": "Max", "value":1000}	],
//"chartData" : {
//"data": {
//"columns": [
//['data1', 30, 200, 100, 400, 150, 250]

//],
//"type": 'bar'
//},
//"size": {
//"height": 200
//},
//"legend": {
//"show": false
//},
//"bar": {
//"width": {
//"ratio": 0.5
//}

//}
//},
//"columnType": "measure/dimension/datetime"
//},
//{
//"name": "Name",
//"slug": "name_a",
//"columnStats":[ {"name": "Mean", "value":200}, {"name": "Sum", "value":2000}, {"name": "Min", "value":0},
//{"name": "Max", "value":1000}	],
//"chartData" : {
//"data": {
//"columns": [
//['data1', 30, 200, 100, 400, 150, 750]

//],
//"type": 'bar'
//},
//"size": {
//"height": 200
//},
//"legend": {
//"show": false
//},
//"bar": {
//"width": {
//"ratio": 0.5
//}

//}
//},
//"columnType": "measure/dimension/datetime"
//}],
//"headers" :[
//{   "name": "Age",
//"slug" : "age_a" },
//{   "name": "Name",
//"slug" : "name_a", }

//],
//"sampleData" :[[20,30],
//[33,44],
//[24,33],
//[44,36]]
//};


@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview};
})

export class DataPreview extends React.Component {
	constructor(props) {
		super(props);
		console.log("checking slug");
		console.log(props);
		this.hideDataPreview = this.hideDataPreview.bind(this);
	}
	hideDataPreview(){
		this.props.dispatch(hideDataPreview());
	}
	render() {
		console.log("data prev is called##########3");
		let _link = "/data/"+store.getState().datasets.dataPreview.slug+"/variableSelection";
		let dataPrev = store.getState().datasets.dataPreview.meta_data;
		console.log(dataPrev)
		if (dataPrev) {
			return(
					<div className="side-body">
					<div className="page-head">
					<div className="row">
					<div className="col-md-8">
					<h2>Data Preview</h2>
					</div>
					</div>
					<div className="clearfix"></div>
					</div>
					<div className="main-content">
					<div className="row">
					<DataPreviewLeftPanel/>
					<Button className="btn btn-primary md-close pull-right" onClick={this.hideDataPreview}><Link to={_link}>Next</Link></Button>
					</div>
					</div>
					</div>
			);
		} else {
			return (
					<div>No data Available</div>
			);
		}
	}
}
