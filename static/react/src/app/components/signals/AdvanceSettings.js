import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {advanceSettingsModal} from "../../actions/signalActions";
import {selectedAnalysisList,selectedTrendSubList,setAnalysisLevel,selectedDimensionSubLevel,cancelAdvanceSettings,saveAdvanceSettings} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response,
		advanceSettingsModal:store.signals.advanceSettingsModal,
		dataPreview: store.datasets.dataPreview,
		getVarType: store.signals.getVarType,
		getVarText: store.signals.getVarText,
		dataSetAnalysisList:store.datasets.dataSetAnalysisList,
		dataSetPrevAnalysisList:store.datasets.dataSetPrevAnalysisList,
		selectedDimensionSubLevels:store.datasets.selectedDimensionSubLevels,
	};
})

export class AdvanceSettings extends React.Component {
	constructor(props){
		super(props);
		console.log(props)
		this.openAdvanceSettingsModal = this.openAdvanceSettingsModal.bind(this);
		this.dimensionSubLevel =null;
		//this.dimensionCountForMeasure = 

	}
	componentWillMount() {
		this.props.onRef(this)
	}
	componentDidUpdate(prevProps, prevState){
	    console.log("In Advance settings Component Did Update");
	    console.log(prevProps);
	    console.log(prevState);
	}
	componentWillReceiveProps(nextProps) {
		 console.log("In Advance settings Component Will Receive Props");
		 console.log(nextProps);
	}
			
	openAdvanceSettingsModal(){
		this.props.dispatch(advanceSettingsModal(true));
	}
	closeAdvanceSettingsModal(){
		this.props.dispatch(cancelAdvanceSettings());
		this.props.dispatch(advanceSettingsModal(false));
	}	
	updateAdvanceSettings(){
		this.props.dispatch(saveAdvanceSettings());
		this.props.dispatch(advanceSettingsModal(false));
		//alert("You clicked save.")
		//console.log(e.target.id);
		/*var that = this;
		var checkedElments= $('.possibleAnalysis:checked');

		var level=null, levelVal=null,analysisName="null";
		checkedElments.each(function(){

			switch($(this).val().toLowerCase()){

			case "association":
				level = $("input[name='association-level']:checked").val();
				levelVal = null;
				analysisName ="association";
				if(level.trim().toLowerCase() == "custom"){
					levelVal = $("#association-level-custom-val").val();
				}
				that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				break;

			case "performance":	  
				level = $("input[name='performance-level']:checked").val();
				levelVal = null;
				analysisName ="performance";
				if(level.trim().toLowerCase() == "custom"){
					levelVal = $("#performance-level-custom-val").val();
				}
				that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				break;

			case "influencer":
				level = $("input[name='influencer-level']:checked").val();
				levelVal = null;
				analysisName ="influencer";
				if(level.trim().toLowerCase() == "custom"){
					levelVal = $("#influencer-level-custom-val").val();
				}
				that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				break;
			}
		});

		let trendInfo={}
		if($("[value^='trend']").is(":checked") || $("[value^='Trend']").is(":checked")){
			if($("#trend-count").is(":checked")){
				trendInfo['count'] = null;
			}
			if($("#trend-specific-measure").is(":checked")){
				trendInfo['specific measure'] = $("#select-measure").val();
			}
		}
		this.props.dispatch(selectedTrendSubList(trendInfo)); 

		let dimensionSubLevel= [],tmpObj={};
		let chkedDimensionSubLevel = $(".dimension-sub-level");
		chkedDimensionSubLevel.each(function(){
			if($(this).is(":checked")){
				tmpObj[$(this).val()] = true;
				dimensionSubLevel.push(tmpObj);
				tmpObj={};
			}else{
				tmpObj[$(this).val()] = false;
				dimensionSubLevel.push(tmpObj);
				tmpObj={};
			}

		});
		this.props.dispatch(selectedDimensionSubLevel(dimensionSubLevel)); */
	}

	handleAnlysisListActions(e){
		this.props.dispatch(selectedAnalysisList(e))
	}
	handleSubLevelAnalysis(evt){
		var id = evt.target.childNodes[0].id;
		if(evt.target.childNodes[0].value == "custom"){
			$("#"+id+"-val").closest("div").removeClass("visibilityHidden");
		}else{
			$("#"+id+"-val").closest("div").addClass("visibilityHidden");
		}
		this.props.dispatch(selectedAnalysisList(evt.target.childNodes[0],"noOfColumnsToUse"))
	}
	handleCustomInput(evt){
		this.props.dispatch(selectedAnalysisList(evt.target,"noOfColumnsToUse"))
	}
	updateTrendSubList(e){
		this.props.dispatch(selectedTrendSubList(e));
	}
	setAnalysisLevel(e){
		console.log(e.target.id);
		if(e.target.id.indexOf("custom") < 0){
			let idOfText = e.target.id+ "-val";
			let val =  $("#"+idOfText).val();
			this.props.dispatch(setAnalysisLevel(e,val)); 
		}else{
			this.props.dispatch(setAnalysisLevel(e,null)); 
		}


	}
	renderAnalysisList(analysisList,trendSettings){
		let performancePlaceholder = "0-"+store.getState().datasets.dataSetDimensions.length;
		let influencersPlaceholder = "0-"+ (store.getState().datasets.dataSetMeasures.length -1);
		let associationPlaceholder = "0-"+ store.getState().datasets.dataSetDimensions.length;

		var that = this;
		let list =   analysisList.map((metaItem,metaIndex) =>{
			let id = "chk_analysis"+ metaIndex;

			if(metaItem.name.indexOf("trend") != -1){
				if(trendSettings){
					let trendSub = trendSettings.map((trendSubItem,trendSubIndex)=>{
						let val = trendSubItem.name;
						if(trendSubItem.name.toLowerCase() == "count"){
							return(
									<li ><div className="col-md-4"><div className="ma-checkbox inline sub-analysis"><input className="possibleSubAnalysis" id="trend-count" type="radio" value="count" name="trend-sub"  /><label htmlFor="trend-count">Count</label></div></div><div class="clearfix"></div></li>
							);
						}else if(trendSubItem.name.toLowerCase().indexOf("specific measure") != -1){
							return(
									<li ><div className="col-md-4">
									<div className="ma-checkbox inline sub-analysis"><input className="possibleSubAnalysis" id="trend-specific-measure" type="radio" value="specific measure" name="trend-sub" /><label htmlFor="trend-specific-measure">Specific Measure</label></div> 
									</div>
									<div className="col-md-8"> <select id="select-measure" className="form-control ">
									{store.getState().datasets.dataSetMeasures.map(function(item,index){
										return(<option>{item}</option>)
									})
									}
									</select>
									</div>
									</li>
							);
						}
					})
					return(
							<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisListActions.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>
							<ul className="list-unstyled">

							{trendSub}


							</ul>

							</li>);
				}else{
					return(
							<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisListActions.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>
							</li>)
				}//end of trendsetting check
			}else{

				var countOptions=null, options=[],customValueInput=null,customInputDivClass="col-md-5 md-p-0 visibilityHidden";
				if(metaItem.noOfColumnsToUse!= null){
					options = metaItem.noOfColumnsToUse.map((subItem,subIndex)=>{
						let clsName = "sub-level-analysis-count";
						let name = metaItem.name
						let idName = metaItem.name +"-level-"+subItem.name;
						let labelCls ="btn btn-default";
						let status = false;
						if(subItem.name.indexOf("custom") !=-1){
							let  customClsName = metaItem.name +"-level form-control";
							let customName = metaItem.name;
							let customIdName = metaItem.name +"-level-custom-val";
							if(subItem.status){
								customInputDivClass = "col-md-5 md-p-0";
							}
							customValueInput =   <input type="text" value={subItem.value} onChange={this.handleCustomInput.bind(this)} placeholder={associationPlaceholder} className={customClsName} id={customIdName} name={customName}/>

						}
						if(subItem.status){
							labelCls ="btn btn-default active";
							status = true;
						}
						return(
								<label key={subIndex} class={labelCls} onClick={this.handleSubLevelAnalysis.bind(this)}><input type="radio" className={clsName} id={idName} name={name} value={subItem.name} checked={status}/>{subItem.displayName}</label> 
						);
					});
					countOptions  = (function(){
						return(
								<div>
								<div className="col-md-7 md-pl-20">
								<div className="btn-group radioBtn" data-toggle="buttons">
								{options}
								</div>
								</div>
								<div className={customInputDivClass} id="divCustomInput">
								{customValueInput}
								</div>
								</div>
						);
					})();
				}

				return(
						<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisListActions.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>
						<div className="clearfix"></div>
						{countOptions}
						</li>);
			}
		});
		return list;
	}

	render() {

		$(function(){
			if($("input[value='trend']").is(":checked")){
				if(!$("#trend-specific-measure").is(":checked")){
					$("#trend-count").prop("checked",true);
				}
			}else{
				$("#trend-count").prop("checked",false);
			}
		});

		let dataPrev = store.getState().datasets.dataPreview;
		let renderPossibleAnalysis = null, renderSubList=null;
		if(dataPrev){
			let possibleAnalysis = store.getState().datasets.dataSetAnalysisList;
			let trendSettings = null;
			if(!$.isEmptyObject(possibleAnalysis)){
				if(this.props.getVarType == "dimension"){
					possibleAnalysis = possibleAnalysis.dimensions.analysis;
					trendSettings = store.getState().datasets.dataSetAnalysisList.dimensions.trendSettings;
					renderPossibleAnalysis = this.renderAnalysisList(possibleAnalysis,trendSettings);
				}else if(this.props.getVarType == "measure"){
					possibleAnalysis = possibleAnalysis.measures.analysis;
					trendSettings = store.getState().datasets.dataSetAnalysisList.measures.trendSettings;
					renderPossibleAnalysis = this.renderAnalysisList(possibleAnalysis,trendSettings);
				}

			}
		}
		return (
				<div id="idAdvanceSettings">
				<Modal show={store.getState().signals.advanceSettingsModal} backdrop="static" onHide={this.closeAdvanceSettingsModal.bind(this)} dialogClassName="modal-colored-header">
				<Modal.Header closeButton>
				<h3 className="modal-title">Advance Settings</h3>
				</Modal.Header>

				<Modal.Body>

				{this.dimensionSubLevel}
				<ul className="list-unstyled">
				{renderPossibleAnalysis}
				</ul>

				</Modal.Body>

				<Modal.Footer>
				<Button onClick={this.closeAdvanceSettingsModal.bind(this)}>Close</Button>
				<Button bsStyle="primary" onClick={this.updateAdvanceSettings.bind(this)}>Save</Button>
				</Modal.Footer>

				</Modal>
				</div>
		);
	}
}
