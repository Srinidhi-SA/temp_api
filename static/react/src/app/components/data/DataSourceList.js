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
		selectedDataset:store.datasets.selectedDataSet,
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
	    if(files.length > 0){
	        if(files[0].size == 0){
	            $("#fileErrorMsg").removeClass("visibilityHidden");
	            $("#fileErrorMsg").html("The uploaded file is empty , please upload the correct file");
	         }
	         else{
	             $("#fileErrorMsg").addClass("visibilityHidden");
	             this.props.dispatch(saveFileToStore(files))
	         }     
	    }else{
	        files[0] = {"name":"","size":""};
	        this.props.dispatch(saveFileToStore(files))
	    }
	    
	}
	popupMsg(){
	    $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("File format is not supported. Please upload a CSV and retry.");
        
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
				var dataSrcType = data.dataSourceType
				const fieldsList = fields.map((field,j) =>{
					if(field.fieldType == "file"){
						if(this.props.renderDatasets){
						    return(<div><div class="form-group col-md-10 xs-pt-50 xs-pl-30">
			                  <label>Select an existing dataset</label>
			                  {this.props.renderDatasets}
			                </div><div className="clearfix"></div></div>);
						}
						else{
						    return(<div class="tab-pane active cont fade in">
						<h3>
						File Upload
						<div class="pull-right">
						<div class="db_images db_file_upload"></div>
						</div>
						</h3>
						<div className="clearfix"></div>
						<div className="xs-pt-20"></div>
						<div className="dropzone ">
						<Dropzone id={1} onDrop={this.onDrop} accept=".csv" onDropRejected={this.popupMsg}>
						<p>Try dropping some files here, or click to select files to upload.</p>
						</Dropzone>
						<aside>
				          <ul className={fileName != "" ? "list-unstyled bullets_primary":"list-unstyled"}>
				            	<li>{fileName}{fileName != "" ? " - ":""}{fileSize}{fileName != "" ? " bytes ":""}</li>
				            	<li className="text-danger visibilityHidden" id="fileErrorMsg">Please select csv file to upload.</li>
				            	</ul>
				        </aside>
				        
						</div>
						</div>)}
					}else {
						//to put default port
						let placeHolder = field.placeHolder
						return(<div className="form-group" id={j}>
						<label for="fl1" className="col-sm-3 control-label">{field.labelName}</label>
						<div className="col-sm-9">
						<input id={dataSrcType+field.fieldName} defaultValue={field.defaultValue} type={field.fieldType} required={field.required}  title={"Please Enter "+field.labelName} name={field.fieldName} onChange={this.handleInputChange.bind(this)} placeholder={placeHolder} className="form-control" maxlength={field.maxLength}/>
						</div>
						</div>)
					}
					

				});
				if(data.dataSourceType.toLowerCase() != FILEUPLOAD.toLowerCase()){
					formList = <div id={divId}><form role="form" className="form-horizontal" id={data.dataSourceType}>{fieldsList}</form></div>
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
