import React from "react";
import {connect} from "react-redux";
import {API,STATIC_URL} from "../../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED,getUserDetailsOrRestart,DEFAULTANALYSISVARIABLES,statusMessages} from "../../helpers/helper";


import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {closeModelPopup,openModelPopup,updateSelectedVariable} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta,updateDatasetName,clearDataCleansing,clearFeatureEngineering} from "../../actions/dataActions";
import {DataSourceList} from "../data/DataSourceList";
import {open,close,fileUpload,dataUpload} from "../../actions/dataUploadActions";
import {ACCESSDENIED} from "../../helpers/helper";
import { hideTargetVariable } from "../../actions/signalActions";



@connect((store) => {
	return {login_response: store.login.login_response,
		appsModelShowModal: store.apps.appsModelShowModal,
		allDataList: store.datasets.allDataSets,
		dataPreview: store.datasets.dataPreview,
		curUrl:store.datasets.curUrl,
		selectedDataset:store.datasets.selectedDataSet,
		dataPreviewFlag:store.datasets.dataPreviewFlag,
		currentAppId:store.apps.currentAppId,
		selectedDataSrcType:store.dataSource.selectedDataSrcType,
		currentAppDetails:store.apps.currentAppDetails,
		};
})

export class AppsCreateModel extends React.Component {
	constructor(props) {
		super(props);
		this.selectedData="";
		this._link = "";
		this.state={
			autoMlVal:"",
			countVal:'',
		}
	}

   getHeader(token){
		return {
			'Authorization': token,
			'Content-Type': 'application/json'
		};
	}
	componentWillMount() {
		this.props.dispatch(getAllDataList());
		this.props.dispatch(storeSignalMeta(null,this.props.match.url));
		this.props.dispatch(closeModelPopup());
		this.props.dispatch(clearDataCleansing());
		this.props.dispatch(clearFeatureEngineering());
	}
	openModelPopup(){
		debugger
		// if(store.getState().datasets.allDataSets.data)
		this.props.dispatch(openModelPopup());
		// else {
		// 	bootbox.alert("No datasets available.Please upload some data or connect to a database")
		//
		// }
    }
    closeModelPopup(){
    	this.props.dispatch(closeModelPopup())
    }
    getDataSetPreview(){
		debugger;
        if (store.getState().dataSource.selectedDataSrcType == "fileUpload") {
    	this.selectedData = $("#model_Dataset").val();
    	this.props.dispatch(getDataSetPreview(this.selectedData));
        }else{
            //this.props.dispatch(closeModelPopup())
            this.props.dispatch(dataUpload())
        }
	}
	 fetchDataAutoML(slug) {
		debugger;
		return fetch(API+'/api/datasets/'+slug+'/',{
			method: 'get',
			headers: this.getHeader(getUserDetailsOrRestart.get().userToken)
		}).then((response) => response.json())
		.then((responseJson) => {
			this.setState({
				autoMlVal:responseJson
			})
			console.log(responseJson.meta_data.uiMetaData.varibaleSelectionArray,"555555555555555555");
		})
	}
    updateDataset(e){
		debugger;
		this.selectedData = e.target.value;
		this.fetchDataAutoML(e.target.value);
		// this.levelCountsForAutoMl(e.target.value)
		// this.props.dispatch(updateDatasetName(e.target.value));
		this.levelCountsForAutoMl(e)
		console.log("sending request");
		// this.getDataSetPreview();
		console.log("Data received");

	}
	
 levelCountsForAutoMl(event) {
	 debugger;
	var selOption = event.target.childNodes[event.target.selectedIndex];
	var varType = selOption.value;
	var varText = selOption.text;
	var varSlug = selOption.getAttribute("name");
	var levelCounts = null;
	var colData = this.state.autoMlVal.meta_data.scriptMetaData.columnData;
	var colStats = [];
	if (varType == "dimension") {
	  for (var i = 0; i < colData.length; i++) {
		if (colData[i].slug == varSlug) {
		  var found = colData[i].columnStats.find(function (element) {
			return element.name == "LevelCount";
		  });
		  if (found != undefined) {
			if (found.value != null)
			//   levelCounts = Object.keys(found.value);
			  this.setState({
				countVal:Object.keys(found.value),
			  })
			//   console.log(this.state.countVal,"111111122222222222")

		  }
		}
	  }
	}
  }
  setPossibleList(event) {
	this.levelCountsForAutoMl(event);
	this.props.dispatch(updateSelectedVariable(event));
}
	render() {
	  const dataSets = store.getState().datasets.allDataSets.data;
		let renderSelectBox = null;
		let _link = "";
		let hideCreate=false
		if(store.getState().datasets.dataPreviewFlag){
			let _link = "/apps/"+store.getState().apps.currentAppDetails.slug+"/models/data/"+store.getState().datasets.selectedDataSet;
			return(<Redirect to={_link}/>);
		}
		if(dataSets){
			renderSelectBox = (<div><select id="model_Dataset" name="selectbasic"  onChange={this.updateDataset.bind(this)} class="form-control">
			<option>--Select dataset--</option>
			{dataSets.map(dataSet =>
			<option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			)}
			</select>

			{window.location.href.includes("autoML")&&
			<div>
				<label>Select target variable:</label>
				<select className="form-control" onChange={this.setPossibleList.bind(this)}>
				<option>--Select--</option>
			{
				this.state.autoMlVal!=""?
			// this.state.autoMlVal.meta_data.uiMetaData.varibaleSelectionArray.map(dataSet =>
			// <option key={dataSet.slug} value={dataSet.slug}>{dataSet.name}</option>
			// )
			this.props.currentAppDetails.app_id == 13 ?
			        this.state.autoMlVal.meta_data.uiMetaData.varibaleSelectionArray.map((metaItem, metaIndex) => {
                            if (metaItem.columnType == "measure" && !metaItem.dateSuggestionFlag && !metaItem.uidCol) {
                                return (
								<option key={metaItem.slug} name={metaItem.slug} value={metaItem.columnType}>{metaItem.name}</option>)
                            }
                        }) :
						this.state.autoMlVal.meta_data.uiMetaData.varibaleSelectionArray.map((metaItem, metaIndex) => {
                            if (metaItem.columnType != "measure" && metaItem.columnType != "datetime" && !metaItem.dateSuggestionFlag && !metaItem.uidCol) {
                                return (<option key={metaItem.slug} name={metaItem.slug} value={metaItem.columnType}>{metaItem.name}</option>)
                            }
                        })
                    
			:""}
				</select>
				</div>
				}

				{window.location.href.includes("autoML")&&
			<div>
				<label>Select subvalue:</label>
				<select className="form-control" id="createModelLevelCount">
                    <option value="">--Select--</option>
                    {this.state.countVal!=""?this.state.countVal.map((item, index) => {

                        return (<option key={item} name={item} value={item}>{item}</option>)
                    }
                    ):""}
                </select>
				</div>
				}
					</div>)
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
						<h2 class="text-center"><i class="fa fa-file-text-o fa-2x"></i> Create Model </h2>				
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
				{window.location.href.includes("autoML")?
                <Button bsStyle="primary" id="modalCreateButtonAutoML">Create Model</Button>
                :
                <Button bsStyle="primary" id="modalCreateButton" disabled={hideCreate} onClick={this.getDataSetPreview.bind(this)}>Create</Button>
                            }
				</Modal.Footer>
				</Modal>
				</div>
				</div>


		)
	}

}
