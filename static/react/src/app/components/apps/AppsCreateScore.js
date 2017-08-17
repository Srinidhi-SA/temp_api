import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {showCreateScorePopup,hideCreateScorePopup} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response, 
		appsModelShowModal: store.apps.appsModelShowModal,
		allDataList: store.datasets.allDataSets,
		dataPreview: store.datasets.dataPreview,
		appsScoreShowModal:store.apps.appsScoreShowModal,
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
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		this.props.dispatch(hideCreateScorePopup());
	}
	openScorePopup(){
    	this.props.dispatch(showCreateScorePopup())
    }
    closeScorePopup(){
    	this.props.dispatch(hideCreateScorePopup())
    }
    getDataSetPreview(e){
    	this.selectedData = $("#score_Dataset").val();
    	this.props.dispatch(getDataSetPreview(this.selectedData));
    	this.props.dispatch(hideCreateScorePopup());
    }
	render() {
		const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;
		let _link = "";
		if(store.getState().datasets.dataPreview){
		 _link = "/data/"+store.getState().datasets.dataPreview.slug;	
		}
		if(dataSets){
			renderSelectBox = <select id="score_Dataset" name="selectbasic" class="form-control">
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>
		}else{
			renderSelectBox = "No Datasets"
		}
		return (
				<div class="col-md-3 top20 list-boxes" onClick={this.openScorePopup.bind(this)}>
				<div class="newCardStyle firstCard">
				<div class="card-header"></div>
				<div class="card-center newStoryCard">
				<div class="col-xs-2 col-xs-offset-1"><i class="fa fa-3x">+</i></div>
				<div class="col-xs-8 col-xs-offset-0">CREATE SCORE</div>
				</div>
				</div>
				
				<div id="newScore"  role="dialog" className="modal fade modal-colored-header">
				<Modal show={store.getState().apps.appsScoreShowModal} onHide={this.closeScorePopup.bind(this)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Create Score</h3>
				</Modal.Header>
				<Modal.Body>
				  <div class="form-group">
				  <label>Select an existing dataset</label>
	              {renderSelectBox}
				</div>
				</Modal.Body>
				<Modal.Footer>
				<Button className="btn btn-primary md-close" onClick={this.closeScorePopup.bind(this)}>Close</Button>
				<Button className="btn btn-primary md-close" onClick={this.getDataSetPreview.bind(this)}><Link to={_link}>Create</Link></Button>
				</Modal.Footer>
				</Modal>
				</div>
				</div>


		)
	}

}	  