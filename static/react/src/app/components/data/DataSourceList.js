import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {FILEUPLOAD,MYSQL,INPUT,PASSWORD} from "../../helpers/helper";

import {getDataSourceList,saveFileToStore,updateSelectedDataSrc,updateDbDetails} from "../../actions/dataSourceListActions";


@connect((store) => {
	return {login_response: store.login.login_response,
		dataSrcList:store.dataSource.dataSourceList,
		fileUpload:store.dataSource.fileUpload,
		db_host:store.dataSource.db_host,
		db_schema:store.dataSource.db_host,
		db_username:store.dataSource.db_host,
		db_port:store.dataSource.db_port,
		db_password:store.dataSource.db_host,
	};
})

export class DataSourceList extends React.Component {
	
	constructor(props) {
		super(props);
		this.onDrop = this.onDrop.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
	}
	componentWillMount() {
		this.props.dispatch(getDataSourceList());
	}
	onDrop(files) {
		this.props.dispatch(saveFileToStore(files))
	}
	popupMsg(){
		alert("Only CSV files are allowed to upload")
	}
	handleSelect(key){
		this.props.dispatch(updateSelectedDataSrc(key))
	}
	handleInputChange(event){
		this.props.dispatch(updateDbDetails(event))
	}
	render() {
		const dataSrcList = store.getState().dataSource.dataSourceList.conf;
        var fileName = store.getState().dataSource.fileUpload.name;
        var fileSize = store.getState().dataSource.fileUpload.size;
		if (dataSrcList) {
			const navTabs = dataSrcList.map((data, i) => {
				return (<NavItem eventKey={data.dataSourceType} onSelect={this.handleSelect}>
				{data.dataSourceName}
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
						<div className="dropzone">
						<Dropzone onDrop={this.onDrop} accept=".csv" onDropRejected={this.popupMsg}>
						<p>Try dropping some files here, or click to select files to upload.</p>
						</Dropzone>
						<aside>
				          <ul>
				            	<li>{fileName} - {fileSize}</li>
				          </ul>
				        </aside>
						</div>
						</div>)
					}else if(field.fieldType.toLowerCase() == INPUT.toLowerCase()){
						return(<div class="form-group" id={j}>
						<label for="fl1" class="col-sm-2 control-label">{field.labelName}</label>
						<div class="col-sm-10">
						<input id={j} type="text" name={field.labelName} placeholder={field.placeHolder} class="form-control" onChange={this.handleInputChange.bind(this)}/>
						</div>
						</div>)
					}
					else if(field.fieldType.toLowerCase() == PASSWORD.toLowerCase()){
						return(<div class="form-group" id={j}>
						<label for="fl1" class="col-sm-2 control-label">{field.labelName}</label>
						<div class="col-sm-10">
						<input  id={j} type="password" name={field.labelName}  placeholder={field.placeHolder} class="form-control" onChange={this.handleInputChange.bind(this)}/>
						</div>
						</div>)
					}

				});
				if(data.dataSourceType.toLowerCase() != FILEUPLOAD.toLowerCase()){
					formList = <div id={divId}><form role="form" class="form-horizontal">{fieldsList}</form></div>
				}else{
					formList = <div id={divId}>{fieldsList}</div>
				}
				return (<Tab.Pane eventKey={data.dataSourceType}>
				{formList}
				</Tab.Pane>)
			});
			return (
					<div>
					<Tab.Container id="left-tabs-example" defaultActiveKey="fileUpload">
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