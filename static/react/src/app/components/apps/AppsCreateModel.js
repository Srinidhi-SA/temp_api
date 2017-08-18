import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {closeModelPopup,openModelPopup} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response, 
		appsModelShowModal: store.apps.appsModelShowModal,
		allDataList: store.datasets.allDataSets,
		dataPreview: store.datasets.dataPreview,
		curUrl:store.datasets.curUrl,
		};
})

export class AppsCreateModel extends React.Component {
	constructor(props) {
		super(props);
		this.selectedData="";
	}
	componentWillMount() {
		this.props.dispatch(getAllDataList());
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		this.props.dispatch(closeModelPopup());
	}
	openModelPopup(){
    	this.props.dispatch(openModelPopup())
    }
    closeModelPopup(){
    	this.props.dispatch(closeModelPopup())
    }
    getDataSetPreview(){
    	this.selectedData = $("#model_Dataset").val();
    	this.props.dispatch(getDataSetPreview(this.selectedData));
    }
	render() {
		 console.log("apps create model list is called##########3");
		    console.log(this.props)
		const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;
		let _link = "";
		if(store.getState().datasets.dataPreview){
		 _link = "/data/"+store.getState().datasets.dataPreview.slug;	
		}
		if(dataSets){
			renderSelectBox = <select id="model_Dataset" name="selectbasic" class="form-control">
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
		}
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.openModelPopup.bind(this)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-2 col-xs-offset-1"><i class="fa fa-3x">+</i></div>
				<div class="col-xs-8 col-xs-offset-0">CREATE MODEL</div>
				</div>
				</div>
				
				<div id="newModel"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().apps.appsModelShowModal} onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Create Model</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
	              <label>Select an existing dataset</label>
	              {renderSelectBox}
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeModelPopup.bind(this)}>Close</Button>
				<Button className="btn btn-primary md-close" onClick={this.getDataSetPreview.bind(this)}><Link to={_link}>Create</Link></Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>


		)
	}

}	  