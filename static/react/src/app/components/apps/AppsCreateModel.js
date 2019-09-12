import React from "react";
import {connect} from "react-redux";
import {API,STATIC_URL} from "../../helpers/env";
import {PERPAGE,DULOADERPERVALUE,DEFAULTINTERVAL,SUCCESS,FAILED,getUserDetailsOrRestart,DEFAULTANALYSISVARIABLES,statusMessages} from "../../helpers/helper";


import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";
import {closeModelPopup,openModelPopup,updateSelectedVariable,getRegressionAppAlgorithmData,createModelSuccess,createModel,onModeSelection} from "../../actions/appActions";
import {getAllDataList,getDataSetPreview,storeSignalMeta,updateDatasetName,clearDataCleansing,clearFeatureEngineering,dispatchDataPreviewAutoML} from "../../actions/dataActions";
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
		if(window.location.href.includes("autoML")){
			this.props.dispatch(getRegressionAppAlgorithmData(this.props.match.params.slug,this.props.currentAppDetails.app_type,'autoML'));
		}


	}
	openModelPopup(){
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
        if (store.getState().dataSource.selectedDataSrcType == "fileUpload") {
    	this.selectedData = $("#model_Dataset").val();
    	this.props.dispatch(getDataSetPreview(this.selectedData));
        }else{
            //this.props.dispatch(closeModelPopup())
            this.props.dispatch(dataUpload())
        }
	}
// function triggerCreateModel(token, modelName, targetVariable, targetLevel, dispatch) {

	submitAutoMlVal(mode){
		var target=store.getState().signals.getVarText;
		var datasetSlug=model_Dataset.value;
		var app_id = store.getState().apps.currentAppId;
		var levelCount=$("#createModelLevelCount").val();
		var modelName= $("#modelName").val();
	 this.props.dispatch(createModel(modelName,target,levelCount,datasetSlug,mode))
		// console.log(val,dataset,target,levelCount,"passed the string")
//   if (store.getState().apps.currentAppDetails.app_type == "REGRESSION" || store.getState().apps.currentAppDetails.app_type == "CLASSIFICATION") {
//     if (store.getState().apps.regression_selectedTechnique == "crossValidation") {
//       var validationTechnique = {
//         "name": "kFold",
//         "displayName": "K Fold Validation",
//         "value": 2
//       }
//     }
//     else {
//       var validationTechnique = {
//         "name": "trainAndtest",
//         "displayName": "Train and Test",
//         "value": (50/100)
//       }
//     }
// 		var AlgorithmSettings = store.getState().apps.regression_algorithm_data_manual;
//     var details = {
//       "ALGORITHM_SETTING": AlgorithmSettings,
//       "validationTechnique": validationTechnique,
// 			"targetLevel": levelCount,
// 			"targetColumn":target,
//       "variablesSelection": this.state.autoMlVal.meta_data.uiMetaData.varibaleSelectionArray
//     }
//   }
//   else {
//     var details = {
//       "trainValue":50,
//       "testValue": 50,
// 			"targetColumn":target,
//       "targetLevel": levelCount,
//       "variablesSelection":this.state.autoMlVal.meta_data.uiMetaData.varibaleSelectionArray
//     }
//   }
  
// 		return fetch(API+'/api/trainer/',{
// 			method: 'POST',
// 			headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
// 			body: JSON.stringify({ "name":modelName, "dataset": dataset, "app_id":app_id, "config": details,"mode":"autoML" })
// 	}).then((response) => response.json())
// 	.then((responseJson) => {
// 	console.log(responseJson,"99999999009090909090909")
// 	if (responseJson.status === 200) {
// 		console.log(json,"pop should")
// 		dispatch(createModelSuccess(responseJson, dispatch))
// 	}
// })
		

	}
	 fetchDataAutoML(slug) {
		return fetch(API+'/api/datasets/'+slug+'/',{
			method: 'get',
			headers: this.getHeader(getUserDetailsOrRestart.get().userToken)
		}).then((response) => response.json())
		.then((responseJson) => {
			this.setState({
				autoMlVal:responseJson
			})
			
			console.log(responseJson.meta_data.uiMetaData.varibaleSelectionArray,"555555555555555555");
			this.props.dispatch(dispatchDataPreviewAutoML(responseJson,"1dnjnsj"));
		})
	}
    updateDataset(e){
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
	var selOption = event.target.childNodes[event.target.selectedIndex];
	var varText = selOption.text;
	var option = this.state.autoMlVal.meta_data.uiMetaData.columnDataUI.filter(i => i.name==varText).map(j=>j.columnStats)[0].filter(k=>k.name=="LevelCount")[0].value
	var category= Object.keys(option);	
	this.setState({countVal:category});
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
		if(store.getState().datasets.dataPreviewFlag && window.location.href.includes("analyst")){
			//Added &&, To restrict route to dataPreview page once dataPreviewFlag set true in autoML mode
			let _link = "/apps/"+store.getState().apps.currentAppDetails.slug+"/analyst/models/data/"+store.getState().datasets.selectedDataSet;
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
				<label className="pb-2 pt-10">Model Name</label>
            <input type="text" className="form-control" placeholder="model name" id="modelName"></input>
				<label className="pb-2 pt-10">Select target variable:</label>
				<select className="form-control" id="createModelTarget" onChange={this.setPossibleList.bind(this)}>
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
{this.state.countVal!=""&&
<div>
				<label className="pb-2 pt-10">Select subvalue:</label>
				<select className="form-control" id="createModelLevelCount">
                    <option value="">--Select--</option>
                    {this.state.countVal!=""?this.state.countVal.map((item, index) => {

                        return (<option key={item} name={item} value={item}>{item}</option>)
                    }
                    ):""}
                </select>
								</div>
}
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
                <Button bsStyle="primary" id="modalCreateButtonAutoML" onClick={this.submitAutoMlVal.bind(this,"autoML")}>Create Model</Button>
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