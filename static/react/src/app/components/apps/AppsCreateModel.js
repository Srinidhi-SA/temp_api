import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {closeModelPopup,openModelPopup} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta,updateDatasetName} from "../../actions/dataActions";
import {DataSourceList} from "../data/DataSourceList";
import {open,close,fileUpload,dataUpload} from "../../actions/dataUploadActions";
import {ACCESSDENIED} from "../../helpers/helper";


@connect((store) => {
	return {login_response: store.login.login_response,
		appsModelShowModal: store.apps.appsModelShowModal,
		allDataList: store.datasets.allDataSets,
		dataPreview: store.datasets.dataPreview,
		curUrl:store.datasets.curUrl,
		selectedDataset:store.datasets.selectedDataSet,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		currentAppId:store.apps.currentAppId,
		selectedDataSrcType:store.dataSource.selectedDataSrcType
		};
})

export class AppsCreateModel extends React.Component {
	constructor(props) {
		super(props);
		this.selectedData="";
		this._link = "";
	}
	componentWillMount() {
		this.props.dispatch(getAllDataList());
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		this.props.dispatch(closeModelPopup());
	}
	openModelPopup(){
		// if(store.getState().datasets.allDataSets.data)
    	this.props.dispatch(openModelPopup())
		// else {
		// 	bootbox.alert("No datasets available.Please upload some data or connect to a database")
		//
		// }
    }
    closeModelPopup(){
    	this.props.dispatch(closeModelPopup())
    }
    getDataSetPreview(){
        if (store.getState().dataSource.selectedDataSrcType == "fileUpload") {
    	this.selectedData = $("#model_Dataset").val();
    	this.props.dispatch(getDataSetPreview(this.selectedData));
        }else{
            //this.props.dispatch(closeModelPopup())
            this.props.dispatch(dataUpload())
        }
    }
    updateDataset(e){
    	this.selectedData = e.target.value;
    	this.props.dispatch(updateDatasetName(e.target.value));
    }
	render() {
		 console.log("apps create model list is called##########3");
		    console.log(this.props)
		const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;
		let _link = "";
		let hideCreate=false
		if(store.getState().datasets.dataPreviewFlag){
			let _link = "/apps/"+store.getState().apps.currentAppId+"/models/data/"+store.getState().datasets.selectedDataSet;
			return(<Redirect to={_link}/>);
		}
		if(dataSets){
			renderSelectBox = <select id="model_Dataset" name="selectbasic" onChange={this.updateDataset.bind(this)} class="form-control">
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
			if(this.props.selectedDataSrcType=="fileUpload")
			hideCreate=true
		}
		let cls = "newCardStyle firstCard"
	    let title = "";
	    if(!this.props.isEnableCreate){
	        cls += " disable-card";
	        title= ACCESSDENIED
	    }
		return (
				<div class="col-md-3 xs-mb-15 list-boxes xs-mt-20" title={title}>
				<div className={cls} onClick={this.openModelPopup.bind(this)}>
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-12 text-center">+<br/><small>CREATE MODEL</small></div>
				</div>
				</div>

				<div id="newModel"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().apps.appsModelShowModal} onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header uploadData">
				<Modal.Header closeButton>
				<h3 className="modal-title">Create Model</h3>
				</Modal.Header>
				<Modal.Body>
				 {/* <div class="form-group">
                  <label>Select an existing dataset</label>
                  {renderSelectBox}
                </div>*/}
				<DataSourceList type="model" renderDatasets={renderSelectBox}/>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeModelPopup.bind(this)}>Close</Button>
                <Button bsStyle="primary" id="modalCreateButton" disabled={hideCreate} onClick={this.getDataSetPreview.bind(this)}>Create</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>


		)
	}

}
