import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {showCreateScorePopup,hideCreateScorePopup,updateSelectedAlg,updateModelSummaryFlag} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta,updateDatasetName} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response, 
		appsModelShowModal: store.apps.appsModelShowModal,
		allDataList: store.datasets.allDataSets,
		dataPreview: store.datasets.dataPreview,
		appsScoreShowModal:store.apps.appsScoreShowModal,
		selectedDataset:store.datasets.selectedDataSet,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		currentAppId:store.apps.currentAppId,
		modelSlug:store.apps.modelSlug,
		algorithmsList:store.apps.algorithmsList
		};
})

export class AppsCreateScore extends React.Component {
	constructor(props) {
		super(props);
		this.selectedData="";
	}
	componentWillMount() {
		console.log("In model summary");
		console.log(this.props.match);
		this.props.dispatch(getAllDataList());
		this.props.dispatch(storeSignalMeta(null,"/apps/"+store.getState().apps.currentAppId+"/scores"));
		this.props.dispatch(hideCreateScorePopup());
		this.props.dispatch(updateModelSummaryFlag(false));
	}
	openScorePopup(){
    	this.props.dispatch(showCreateScorePopup())
    }
    closeScorePopup(){
    	this.props.dispatch(hideCreateScorePopup())
    }
    getDataSetPreview(e){
    	this.selectedData = $("#score_Dataset").val();
    	this.props.dispatch(updateSelectedAlg($("#algorithms").val()));
    	this.props.dispatch(getDataSetPreview(this.selectedData));
    	this.props.dispatch(hideCreateScorePopup());
    }
    updateDataset(e){
    	this.props.dispatch(updateDatasetName(e.target.value));
    }
	render() {
		if(store.getState().datasets.dataPreviewFlag){
			let _link = "/apps/"+store.getState().apps.currentAppId+"/models/"+store.getState().apps.modelSlug+"/data/"+store.getState().datasets.selectedDataSet;
			return(<Redirect to={_link}/>);
		}
		const dataSets = store.getState().datasets.allDataSets.data;
		const algorithms = store.getState().apps.algorithmsList;
		let renderSelectBox = null;
		let algorithmNames = null;
		if(dataSets){
			renderSelectBox = <select id="score_Dataset" name="selectbasic" onChange={this.updateDataset.bind(this)}  class="form-control">
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
		}
		if(algorithms){
			algorithmNames = <select id="algorithms" name="selectbasic" class="form-control">
			{algorithms.map(algorithm =>
			<option key={algorithm.slug} value={algorithm.slug}>{algorithm.name} {algorithm.accuracy}</option>
			)}
			</select>
		}else{
			algorithmNames = "No Algorithms"
		}
		return (
				<span className="xs-pl-10" onClick={this.openScorePopup.bind(this)}>
				<Button bsStyle="primary">Create Score</Button>
				<div id="newScore"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().apps.appsScoreShowModal} onHide={this.closeScorePopup.bind(this)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Create Score</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
				  <label>Select an existing dataset</label>
	              {renderSelectBox}
	              <br/>
	              <label>Select an Algorithm</label>
	              {algorithmNames}
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeScorePopup.bind(this)}>Close</Button>
				<Button bsStyle="primary"  onClick={this.getDataSetPreview.bind(this)} >Create</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</span>


		)
	}

}	  