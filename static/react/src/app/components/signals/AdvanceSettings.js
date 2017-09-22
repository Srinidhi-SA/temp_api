import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {advanceSettingsModal} from "../../actions/signalActions";
import {selectedAnalysisList} from "../../actions/dataActions";


@connect((store) => {
	return {login_response: store.login.login_response,
		advanceSettingsModal:store.signals.advanceSettingsModal,
		 dataPreview: store.datasets.dataPreview,
		 getVarType: store.signals.getVarType,
		 dataSetAnalysisList:store.datasets.dataSetAnalysisList,
	};
})

export class AdvanceSettings extends React.Component {
  constructor(props){
    super(props);
    console.log(props)
    this.openAdvanceSettingsModal = this.openAdvanceSettingsModal.bind(this);
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
	  alert("You clicked save.")
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
  renderAnalysisList(analysisList){
	/*  let list =  analysisList.map((metaItem,metaIndex) =>{
		  let id = "chk_analysis"+ metaIndex;
		return(<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div></li>); 
	  });
     return list;*/
	  var that = this;
	  let list =   analysisList.map((metaItem,metaIndex) =>{
		  let id = "chk_analysis"+ metaIndex;
	  return(
		<li><div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={metaIndex}>{metaItem.displayName}</label></div>;
		<ul className="list-unstyled">{metaItem.analysisSubTypes.map((subItem,subIndex)=>{
			  return(<li>{subItem.name}</li>)
		  })}</ul>
		</li>);
	  });
	  return list;
  }
  render() {
	  let dataPrev = store.getState().datasets.dataPreview;
	  let renderPossibleAnalysis = null, renderSubList=null;
	  if(dataPrev){
		  let possibleAnalysis = store.getState().datasets.dataSetAnalysisList;
		  if(!$.isEmptyObject(possibleAnalysis)){
			  if(this.props.getVarType == "dimension"){
				  possibleAnalysis = possibleAnalysis.dimensions.analysis;
				  renderPossibleAnalysis = this.renderAnalysisList(possibleAnalysis);
			  }else{
				  possibleAnalysis = possibleAnalysis.measures.analysis;
				  renderPossibleAnalysis = this.renderAnalysisList(possibleAnalysis);
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
		<div className="model-body">
		<ul className="list-unstyled">
		{renderPossibleAnalysis}
		</ul>
	</div>
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
