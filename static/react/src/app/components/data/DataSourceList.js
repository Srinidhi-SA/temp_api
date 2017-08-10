import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {getDataSourceList} from "../../actions/dataSourceListActions";


@connect((store) => {
	return {login_response: store.login.login_response,
		dataSrcList:store.dataSource.dataSourceList,
	};
})

export class DataSourceList extends React.Component {
	constructor(props) {
		super(props);
		this.onDrop = this.onDrop.bind(this);
	}
	componentWillMount() {
		this.props.dispatch(this.props.dispatch(getDataSourceList()));
	}
	onDrop(files) {
		console.log(files)
	}
	render() {
		const dataSrcList = store.getState().dataSource.dataSourceList.conf;

		if (dataSrcList) {
			const navTabs = dataSrcList.map((data, i) => {
				return (<NavItem eventKey={i}>
				{data.dataSourceType}
				</NavItem>)
			});
			const navTabContent = dataSrcList.map((data, i) => {
				let fields = data.formFields;
				let formList = null;
				var divId = "data_upload_"+i;
				const fieldsList = fields.map((field,j) =>{
					if(field.fieldType == "file"){
						return(<div class="tab-pane active cont fade in">
						<h3>
						File Upload
						<div class="pull-right">
						<div class="db_images db_file_upload"></div>
						</div>
						</h3>
						<input id="thefiles" type="file" name="files" accept=".jpg, .png, image/jpeg, image/png" multiple/>
						<div className="dropzone">
						<Dropzone onDrop={this.onDrop}>
						<p>Try dropping some files here, or click to select files to upload.</p>
						</Dropzone>
						</div>
						</div>)
					}else if(field.fieldType == "Input"){
						return(<div class="form-group" id={j}>
						<label for="fl1" class="col-sm-2 control-label">{field.labelName}</label>
						<div class="col-sm-10">
						<input id={j} type="text" placeholder={field.placeHolder} class="form-control"/>
						</div>
						</div>)
					}
					else if(field.fieldType == "Password"){
						return(<div class="form-group" id={j}>
						<label for="fl1" class="col-sm-2 control-label">{field.labelName}</label>
						<div class="col-sm-10">
						<input  id={j} type="password" placeholder={field.placeHolder} class="form-control"/>
						</div>
						</div>)
					}

				});
				if(data.dataSourceType != "File Upload"){
					formList = <div id={divId}><form role="form" class="form-horizontal">{fieldsList}</form></div>
				}else{
					formList = <div id={divId}>{fieldsList}</div>
				}
				return (<Tab.Pane eventKey={i}>
				{formList}
				</Tab.Pane>)
			});
			return (
					<div>
					<Tab.Container id="left-tabs-example" defaultActiveKey={0}>
					<Row className="clearfix">
					<Col sm={3}>
					<Nav bsStyle="pills" stacked>
					{navTabs}
					</Nav>
					</Col>

					<Col sm={9}>
					<Tab.Content animation>
					{navTabContent}
					</Tab.Content>
					</Col>

					</Row>
					</Tab.Container>	
					</div>
			)
		}
		else {
			return (
					<div>No DataSource</div>
			)
		}

	}

}	  