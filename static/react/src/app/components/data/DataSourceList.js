import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {
  Modal,
  Button,
  Tab,
  Row,
  Col,
  Nav,
  NavItem
} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";

import {FILEUPLOAD, MYSQL, INPUT, PASSWORD, bytesToSize,statusMessages} from "../../helpers/helper";

import {getDataSourceList, saveFileToStore, updateSelectedDataSrc, updateDbDetails} from "../../actions/dataSourceListActions";
import {getAllDataList} from "../../actions/dataActions";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataSrcList: store.dataSource.dataSourceList,
    fileUpload: store.dataSource.fileUpload,
    db_host: store.dataSource.db_host,
    db_schema: store.dataSource.db_host,
    db_username: store.dataSource.db_host,
    db_port: store.dataSource.db_port,
    db_password: store.dataSource.db_host,
    selectedDataset: store.datasets.selectedDataSet,
    allDataList:store.datasets.allDataSets,
    datasets:store.datasets.dataList.data,
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
    this.props.dispatch(getAllDataList());
  }
  onDrop(files) {
    var duplicateName="";
    if (files.length > 0) {
      if(this.props.datasets.length>0){
        this.props.datasets.map(dataset=>dataset.name.toLowerCase()).includes(files[0].name.toLowerCase().split('.').slice(0, -1).join('.'))?
      duplicateName=true:"";     
      }
    if(this.props.allDataList!=""){
     this.props.allDataList.data.map(dataset=>dataset.name.toLowerCase()).includes(files[0].name.toLowerCase().split('.').slice(0, -1).join('.'))?
      duplicateName=true:"";  

            }

      if (files[0].size == 0) {
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("The uploaded file is empty, please upload the correct file");
      }
      else if(duplicateName){
        files[0] = {
          "name": "",
          "size": ""
        };
        this.props.dispatch(saveFileToStore(files))
        $("#fileErrorMsg").removeClass("visibilityHidden");
        $("#fileErrorMsg").html("Dataset with this name already exists");
      }
       else {
        $("#fileErrorMsg").addClass("visibilityHidden");
        this.props.dispatch(saveFileToStore(files))
      }
    } else {
      files[0] = {
        "name": "",
        "size": ""
      };
      this.props.dispatch(saveFileToStore(files))
    }
  }
  popupMsg() {
    $("#fileErrorMsg").removeClass("visibilityHidden");
    $("#fileErrorMsg").html("The file format is not supported. Please try again with a csv file.");

  }
  handleSelect(key) {
    this.props.dispatch(updateSelectedDataSrc(key))
  }
  handleInputChange(event) {
    updateDbDetails(event);
  }

  render() {
    const dataSrcList = store.getState().dataSource.dataSourceList.conf;
    var fileName = store.getState().dataSource.fileUpload.name;
    val => ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'][Math.floor(Math.log2(val) / 10)]

    var fileSize = store.getState().dataSource.fileUpload.size;
    if (store.getState().dataSource.fileUpload.size)
      fileSize = bytesToSize(store.getState().dataSource.fileUpload.size);
    if (dataSrcList) {
      const navTabs = dataSrcList.map((data, i) => {
        return (
          <NavItem eventKey={data.dataSourceType} onSelect={this.handleSelect}>
            {data.dataSourceName}
          </NavItem>
        )
      });
      const navTabContent = dataSrcList.map((data, i) => {
        let fields = data.formFields;
        let formList = null;
        var divId = "data_upload_" + i;
        var dataSrcType = data.dataSourceType
				let msg=<div><label className="pb-2">Select an existing dataset</label>{this.props.renderDatasets}</div>
				if(this.props.renderDatasets == "No Datasets")
				msg=<div><label>No datasets available.Please upload some data or connect to a database</label></div>
        const fieldsList = fields.map((field, j) => {
          if (field.fieldType == "file") {
            if (this.props.renderDatasets) {
              return (
                <div>
                  <div class="form-group col-md-12 pt-10">
                    {msg}
                  </div>
                  <div className="clearfix"></div>
                </div>
              );
            } else {
              return (
                <div class="tab-pane active cont fade in">
                  <h4>
                    File Upload
                    <div class="pull-right">
                      <div class="db_images db_file_upload"></div>
                    </div>
                  </h4>
                  <div className="clearfix"></div>
                  <div className="xs-pt-20"></div>
                  <div className="dropzone ">
                    <Dropzone id={1} onDrop={this.onDrop} accept=".csv" multiple={false} onDropRejected={this.popupMsg}>
                      <p>Please drag and drop your file here or browse.</p>
                    </Dropzone>
                    <aside>
                      <ul className={fileName != ""
                        ? "list-unstyled bullets_primary"
                        : "list-unstyled"}>
                        <li>{fileName}{fileName != ""
                            ? " - "
                            : ""}{fileSize}</li>
                        <li className="text-danger visibilityHidden" id="fileErrorMsg">Please select csv file to upload.</li>
                      </ul>
                    </aside>

                  </div>
                </div>
              )
            }
          } else {
            //to put default port
            let placeHolder = field.placeHolder
            return (
              <div className="form-group" id={j}>
                <label for="fl1" className="col-sm-3 control-label">{field.labelName}</label>
                <div className="col-sm-9">
                  <input id={dataSrcType + field.fieldName} defaultValue={field.defaultValue} type={field.fieldType} required={field.required} title={"Please Enter " + field.labelName} name={field.fieldName} onChange={this.handleInputChange.bind(this)} placeholder={placeHolder} className="form-control" maxLength={field.maxLength}/>
                </div>
              </div>
            )
          }

        });
        if (data.dataSourceType.toLowerCase() != FILEUPLOAD.toLowerCase()) {
          formList = <div id={divId}>
            <form role="form" className="form-horizontal" id={data.dataSourceType}>{fieldsList}</form>
          </div>
        } else {
          formList = <div id={divId}>{fieldsList}</div>
        }
        return (
          <Tab.Pane eventKey={data.dataSourceType}>
            {formList}
          </Tab.Pane>
        )
      });
      return (
        <div>
          <Tab.Container id="left-tabs-example" defaultActiveKey="fileUpload">
		  <div className="container-fluid">
      <Row className="clearfix">
        {(window.location.href.includes("autoML"))?
          ""
          :
          <Col sm={3}>
            <Nav bsStyle="pills" stacked>
              {navTabs}
            </Nav>
          </Col>
        }
        {(window.location.href.includes("autoML"))?
            <Col sm={12}>
            <Tab.Content animation>
              {navTabContent}
            </Tab.Content>
          </Col>
            :
              <Col sm={9}>
                <Tab.Content animation>
                  {navTabContent}
                </Tab.Content>
              </Col>
        }
            </Row>
			</div>
          </Tab.Container>
        </div>
      )
    } else {
      return (
        <div>No DataSource</div>
      )
    }

  }

}
