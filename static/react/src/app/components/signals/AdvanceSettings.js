import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {advanceSettingsModal} from "../../actions/signalActions";
import {selectedAnalysisList,selectedTrendSubList,setAnalysisLevel,selectedDimensionSubLevel} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response,
		advanceSettingsModal:store.signals.advanceSettingsModal,
		 dataPreview: store.datasets.dataPreview,
		 getVarType: store.signals.getVarType,
		 getVarText: store.signals.getVarText,
		 dataSetAnalysisList:store.datasets.dataSetAnalysisList,
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
  openAdvanceSettingsModal(){
	  this.props.dispatch(advanceSettingsModal(true));
  }
  closeAdvanceSettingsModal(){
	  this.props.dispatch(advanceSettingsModal(false));
  }	
  updateAdvanceSettings(){
	  //alert("You clicked save.")
	  //console.log(e.target.id);
         var that = this;
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
					//alert(level + " " + levelVal + " " + analysisName);
				     that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				  break;
				  
				  case "performance":
				 // case "performance analysis":
				  
				      level = $("input[name='performance-level']:checked").val();
					  //alert($("input[name='performance-level']:checked").val())
					  levelVal = null;
					  analysisName ="performance";
					 if(level.trim().toLowerCase() == "custom"){
						 levelVal = $("#performance-level-custom-val").val();
					 }
					 //alert(level + " " + levelVal + " " + analysisName);
					 that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				  break;
				  
				  case "influencer":
				  //case "influencers":
				  
				      level = $("input[name='influencer-level']:checked").val();
					  levelVal = null;
					  analysisName ="influencer";
					 if(level.trim().toLowerCase() == "custom"){
						 levelVal = $("#influencer-level-custom-val").val();
					 }
					 //alert(level + " " + levelVal + " " + analysisName);
				     that.props.dispatch(setAnalysisLevel(level,levelVal,analysisName));
				  break;
			  }
		  });
	   
	   
	 /* if(e.target.id.indexOf("custom") < 0){
		  let idOfText = e.target.id+ "-val";
		  let val =  $("#"+idOfText).val();
		  this.props.dispatch(setAnalysisLevel(e,val)); 
	  }else{
		  this.props.dispatch(setAnalysisLevel(e,null)); 
	  }*/
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
	    this.props.dispatch(selectedDimensionSubLevel(dimensionSubLevel)); 
  }
  
  handleAnlysisList(e){
      this.props.dispatch(selectedAnalysisList(e))
      
  }
 
  getSubAnalysisList(subAnalysis){
	  let subList = metaItem.analysisSubTypes.map((subItem,subIndex)=>{
		  <li>{subItem.name}</li>
	  });
	  return subList;
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
	/*  let list =  analysisList.map((metaItem,metaIndex) =>{
		  let id = "chk_analysis"+ metaIndex;
		return(<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div></li>); 
	  });
     return list;*/
	 
	 
	//let dimensionSize = this.props.dataSetAnalysisList.dimensions.analysis.length;
	//let measureSize = this.props.dataSetAnalysisList.dimensions.analysis.length -1;
	let performancePlaceholder = "0-"+store.getState().datasets.dataSetDimensions.length;
	let influencersPlaceholder = "0-"+ (store.getState().datasets.dataSetMeasures.length -1);
	let associationPlaceholder = "0-"+ store.getState().datasets.dataSetDimensions.length;
	console.log(store.getState().datasets.dataSetMeasures);
		
	  var that = this;
	  let list =   analysisList.map((metaItem,metaIndex) =>{
		  console.log(metaItem);
		  let id = "chk_analysis"+ metaIndex;
		  
		  if(metaItem.name.indexOf("trend") != -1){
			  
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
				<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>
					<ul className="list-unstyled">
					
					{trendSub}
					  
					 
					</ul>
				
				 </li>);
	        
		  }else{
			  
			  var countOptions=null, options=[],customValueInput=null;
			  
			  if(metaItem.noOfColumnsToUse!= null){
				  
				  options = metaItem.noOfColumnsToUse.map((subItem,subIndex)=>{
					  let clsName = metaItem.name +"-level";
					  let idName = metaItem.name +"-level-"+subItem.name;
					  let labelCls ="btn btn-default";
					  let status = false;
					  if(subIndex == 0){
						  labelCls ="btn btn-default active";
						  status = true;
					  }
					 // console.log(metaItem.name +"-level-"+subItem.name)
					  if(subItem.name.indexOf("custom") !=-1){
						  let  customClsName = metaItem.name +"-level form-control";
						  let customIdName = metaItem.name +"-level-custom-val";
						  
			          customValueInput =   <input type="text" placeholder={associationPlaceholder} className={customClsName} id={customIdName} name={customIdName}/>
					  }
					  
				      return(
					     <label key={subIndex} class={labelCls}><input type="radio" className={clsName} id={idName} name={clsName} value={subItem.name} checked={status}/>{subItem.displayName}</label> 
					  );
					  
					  
					  
				  });
				  
			  
			  
			  
			 countOptions  = (function(){
				 return(
				<div>
				   <div className="col-md-7 md-pl-20">
					<div class="btn-group radioBtn" data-toggle="buttons">
					    {options}
						
						</div>
					</div>
					<div className="col-md-5 md-p-0">
					   {customValueInput}
					</div>
		     	</div>
				);
			})();
		}
			  
	  return(
		<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>
			{/*<ul className="list-unstyled">{metaItem.analysisSubTypes.map((subItem,subIndex)=>{
			  return(<li ><div key={subIndex} className="ma-checkbox inline sub-analysis"><input id={id} type="checkbox" className="possibleSubAnalysis" value={subItem.name} /><label htmlFor={metaIndex}>{subItem.name}</label></div></li>)
			})}</ul>*/}
			<div className="clearfix"></div>
			{countOptions}
			
         </li>);
	    }
	  });
	  
	  if(this.props.getVarType=="dimension"){
	  if(this.props.selectedDimensionSubLevels != null ){
		  //let val ="sub-level";
		  let displayName = "Specify Sub-Level to Analyse";
		  
		  let subLevelLi = this.props.selectedDimensionSubLevels.map(function(item,index){
			  let key = Object.keys(item);
			  let id=null;
			  if(key[0].trim().indexOf(" ") != -1){
				  id= key[0].trim().split(" ").join("_");
			  }else{
				  id= key[0]+"_id";
			  }
			  
			  let val= key[0];
			  let chkStatus = item[id];
			  return(
			     <div key={index} className="ma-checkbox"><input id={id} type="checkbox" className="possibleSubAnalysis dimension-sub-level" value={val} checked={chkStatus}   /><label htmlFor={id}>{val}</label></div>
			  );
		  })
		  
		this.dimensionSubLevel = (function(){
			let varText = that.props.getVarText;
		   return(
			  
			  <div className="form-group">
				 <label className="col-md-4">{displayName}</label>
				 <div className="col-lg-5">
                            <div className="panel panel-primary-p1 cst-panel-shadow">
                                <div className="panel-heading"> {varText}</div>
                                <div className="panel-body">
                                    {/*  <!-- Row for select all-->*/}
                                    <div className="row">
                                        <div className="col-md-12 cst-scroll-panel">
                                            
                                                <ul className="list-unstyled">
												   {subLevelLi}
                                                </ul>
                                        </div>
                                    </div>
                                    {/*  <!-- End Row for list of variables-->*/}
                                </div>
                            </div>

                        </div>
						<div className="clearfix"></div>
			  </div>
		   );
        })();
  
		//list.unshift(displayName); 
	  }
	  }else{
		  this.dimensionSubLevel=[]
	  }
	  
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
