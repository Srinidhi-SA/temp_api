import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import ReactDOM from 'react-dom';
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem} from "react-bootstrap";
import store from "../../store";

import {openCreateSignalModal,closeCreateSignalModal} from "../../actions/createSignalActions";
import {selectedAnalysisList} from "../../actions/dataActions";
import {createSignal,setPossibleAnalysisList} from "../../actions/signalActions";
import {DataVariableSelection} from "../data/DataVariableSelection";


var selectedVariables = {measures:[],dimensions:[],date:null};  // pass selectedVariables to config

@connect((store) => {
	return {login_response: store.login.login_response,
		newSignalShowModal: store.signals.newSignalShowModal,
		dataList: store.datasets.dataList,
  dataPreview: store.datasets.dataPreview,
  selectedMeasures:store.datasets.selectedMeasures,
  selectedDimensions:store.datasets.selectedDimensions,
  selectedTimeDimensions:store.datasets.selectedTimeDimensions,
    selectedAnalysis:store.datasets.selectedAnalysis,
    signalData: store.signals.signalData,
    selectedSignal: store.signals.signalAnalysis,
	getVarType: store.signals.getVarType
  };
})

export class VariableSelection extends React.Component {
	constructor(props) {
		super(props);
  
    console.log("preview data check");
	this.signalFlag =true;
	this.possibleTrend = null;
	}



handleAnlysisList(e){
  this.props.dispatch(selectedAnalysisList(e))

}
createSignal(){
  console.log(this.props);
  this.signalFlag = false;
  // if($('#createSname').val().trim() != "" || $('#createSname').val().trim() != null){
  $('body').pleaseWait();
   let analysisList =[],config={}, postData={};

  config['possibleAnalysis'] = this.props.selectedAnalysis;
  config['measures'] =this.props.selectedMeasures;
  config['dimension'] =this.props.selectedDimensions;
  config['timeDimension'] =this.props.selectedTimeDimensions;
 

 postData["name"]=$("#createSname").val();
 postData["type"]=$('#signalVariableList option:selected').val();
 postData["target_column"]=$('#signalVariableList option:selected').text();
 postData["config"]=config;
 postData["dataset"]=this.props.dataPreview.slug;
 console.log(postData);

this.props.dispatch(createSignal(postData));
// }else{
//   $('#createSname').css("border","2px solid red");
// }


}

setPossibleList(e){
	
	console.log(e.target.value);
     this.props.dispatch(setPossibleAnalysisList(e.target.value));
}

	render(){
		var that= this;
     if(!$.isEmptyObject(this.props.selectedSignal) && !that.signalFlag){
       console.log("move from variable selection page");
       console.log(this.props.selectedSignal)
       $('body').pleaseWait('stop');
       let _link = "/signals/"+this.props.selectedSignal.slug;
       return(<Redirect to={_link}/>)
    ;
     }

    let dataPrev = store.getState().datasets.dataPreview;
     const metaData = dataPrev.meta_data.columnData;
     let renderSelectBox = null;
    if(metaData){
      renderSelectBox = metaData.map((metaItem,metaIndex) =>{
		  if(metaItem.columnType !="datetime"){
		  return(
		    <option key={metaIndex}  value={metaItem.columnType}>{metaItem.name}</option>
			);
		  }
	  })
    }else{
      renderSelectBox = <option>No Variables</option>
    }

	// possible analysis list -------------------------------------
	
   //const possibleAnalysis = dataPrev.meta_data.possibleAnalysis.target_variable;
    const possibleAnalysis = {"dimension": [
       {"name": "Descriptive analysis", "id": "descriptive-analysis"},
       {"name": "Dimension vs. Dimension", "id": "dimension-vs-dimension"},
       {"name": "Predictive modeling", "id": "predictive-modeling"}
   ],
       "measure": [
           {"name": "Descriptive analysis", "id": "descriptive-analysis"},
           {"name": "Measure vs. Dimension", "id": "measure-vs-dimension"},
           {"name": "Measure vs. Measure", "id": "measure-vs-measure"}
       ], };
        let renderPossibleAnalysis = null, renderSubList=null;
		
     if(possibleAnalysis){
		 if($('#signalVariableList option:selected').val() == "dimension"){	
         renderSubList = possibleAnalysis.dimension.map((metaItem,metaIndex) =>{
		   let id = "chk_analysis"+ metaIndex;
		   let trendId = metaIndex +1;
		   that.possibleTrend = "chk_analysis"+trendId;
			  
			  return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} onChange={this.handleAnlysisList.bind(this)} /><label htmlFor={id}>{metaItem.name}</label></div>);
		
       });
	 }else if($('#signalVariableList option:selected').val() == "measure"){
	    renderSubList = possibleAnalysis.measure.map((metaItem,metaIndex) =>{
		   let id = "chk_analysis"+ metaIndex;
		   let trendId = metaIndex +1;
		   that.possibleTrend = "chk_analysis"+trendId;
			  return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} onChange={this.handleAnlysisList.bind(this)} /><label htmlFor={id}>{metaItem.name}</label></div>);
		
       });
		 
	 }
	 
	 renderPossibleAnalysis= (function(){
                return( <div >
                             {renderSubList}
		                    <div  className="ma-checkbox inline"><input id={that.possibleTrend} type="checkbox" className="possibleAnalysis" value="Trend Analysis" onChange={that.handleAnlysisList.bind(this)} /><label htmlFor={that.possibleTrend}>Trend Analysis</label></div>
                          </div>
			);
        })(); 

  }else{
     renderSelectBox = <option>No Variables</option>
  }
  // end of possible analysis list ------------------------------------
	 
		return (
<div className="side-body">
      <div className="main-content">
<div className="panel panel-default">
  <div className="panel-body">

  <div className="row">
  <div className="col-lg-4">
      <div className="htmlForm-group">
	   <select className="form-control" id="signalVariableList" onChange={this.setPossibleList.bind(this)}>
           {renderSelectBox}
		  </select>
      </div>
  </div>{/*<!-- /.col-lg-4 -->*/}

  </div>{/*<!-- /.row -->*/}
  <br/>
 {/*  adding selection component */}
       <DataVariableSelection/>
 {/*---------end of selection component----------------------*/}
  <div className="row">
    <div className="col-md-12">
      <div className="panel panel-alt4 panel-borders">
        <div className="panel-heading text-center">PerhtmlForming the following Analysis</div>
         <div className="panel-body text-center" id="analysisList" >
	      {renderPossibleAnalysis}
	     </div>
	   
      </div>
    </div>
  </div>
  <div className="row">
    <div className="col-lg-4 col-lg-offset-8">
      <div className="htmlForm-group">
        <input type="text" name="createSname" id="createSname" className="htmlForm-control input-sm" placeholder="Enter a signal name"/>
      </div>
    </div>{/*<!-- /.col-lg-4 -->*/}
  </div>
  <hr/>
  <div className="row">
    <div className="col-md-12 text-right">
      <button onClick={this.createSignal.bind(this)} className="btn btn-primary">CREATE SIGNAL</button>
    </div>
  </div>


  </div>
</div>
    </div>
</div>

		)
	}

}
