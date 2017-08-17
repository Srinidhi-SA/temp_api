import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {getAllDataList,getDataSetPreview,storeSignalMeta,showDataPreview} from "../../actions/dataActions";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";

@connect((store) => {
	return {login_response: store.login.login_response,
		newSignalShowModal: store.signals.newSignalShowModal,
		allDataList: store.datasets.allDataSets,
   	dataPreview: store.datasets.dataPreview,
	   signalMeta: store.datasets.signalMeta,
	 dataPreviewFlag:store.datasets.dataPreviewFlag};
})

//var selectedData = null;
export class CreateSignal extends React.Component {
	constructor(props) {
		super(props);

		this.props.dispatch(closeCreateSignalModal());
		// this.state={
		// 	selectedData:null
		// };
		this.selectedData = {};

	}
	componentWillMount(){
		this.props.dispatch(getAllDataList());
	}
	openSignalModal(){
    	this.props.dispatch(openCreateSignalModal())
    }
    closeSignalModal(){
    	this.props.dispatch(closeCreateSignalModal())
    }
		
		getPreviewData(e){
			//this.selectedData = e.target.id;
			this.props.dispatch(showDataPreview());
		  this.props.dispatch(getDataSetPreview(this.selectedData.name));
		}

 checkSelection(e){
	 var that = this;
  let selData = e.target.value;
	// that.state.selectedData = selData;
  //  console.log(that.state);
	 that.selectedData['name'] = selData
	 //alert(that.props.url);
	  this.props.dispatch(storeSignalMeta(that.selectedData,that.props.url));
 }
	render() {
		const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;

		if(store.getState().datasets&&store.getState().datasets.dataPreview&&store.getState().datasets.dataPreviewFlag){
			let _link = "/data/"+this.selectedData.name;
			return(<Redirect to={_link}/>);
		}
		if(dataSets){
			renderSelectBox = <select id="signal_Dataset" name="selectbasic" class="form-control" onChange={this.checkSelection.bind(this)}>
			{dataSets.map(dataSet =>
			<option key={dataSet.slug}  value={dataSet.slug} >{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
		}
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.openSignalModal.bind(this)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-2 col-xs-offset-1"><i class="fa fa-3x">+</i></div>
				<div class="col-xs-8 col-xs-offset-0">CREATE NEW</div>
				</div>
				</div>
				<div id="newSignal"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().signals.newSignalShowModal} onHide={this.closeSignalModal.bind(this)}>
				<Modal.Header closeButton>
				<h3 className="modal-title">Create New</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
	              <label>Select an existing dataset</label>
				{renderSelectBox}
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeSignalModal.bind(this)}>Close</Button>
				{/*<Link to="/variableSelection"><Button className="btn btn-primary md-close">Create</Button></Link>*/}
				<Button className="btn btn-primary md-close" onClick={this.getPreviewData.bind(this)}>Create</Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>

		)
	}

}
