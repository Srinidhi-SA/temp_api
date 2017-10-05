import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import Dialog from 'react-bootstrap-dialog';
import {handleColumnClick,updateColSlug} from "../../actions/dataActions";
import {DATA_TYPE} from "../../helpers/helper";
@connect((store) => {
	return {
		login_response: store.login.login_response,
		dataList: store.datasets.dataList,
		dataPreview: store.datasets.dataPreview,
		dataTransformSettings:store.datasets.dataTransformSettings,
		selectedColSlug:store.datasets.selectedColSlug,
	};
})

export class DataValidation extends React.Component {
	constructor(props) {
		super(props);
	}
	handleClickEvent(event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(this.props.slug));
		this.props.dispatch(handleColumnClick(this.refs.dialog,event.target.name,this.props.name,this.props.slug));
	}
	handleChangeTypeEvent(actionName,event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(this.props.slug));
		this.props.dispatch(handleColumnClick(this.refs.dialog,actionName,this.props.name,this.props.slug,event.target.value));
	}
   renderDropdownList(colData){
	   let list = colData.map((actionNames,index)=>{
		   if(actionNames.actionName == DATA_TYPE){
			 return (
			<li key={index}><span>{actionNames.displayName}</span>
			<ul>{actionNames.listOfDataTypes.map((subItem,subIndex)=>{
				var id="dv_"+subIndex;
				  return(<li key={id} className="cursor" onClick={this.handleChangeTypeEvent.bind(this,actionNames.actionName)} ><div key={id} className="ma-radio inlinev"><input id={id} type="radio"  name="dataValidation"  value={subItem.name} /><label htmlFor={id}>{subItem.displayName}</label></div></li>)
				})}</ul>
			 </li>)     
		   }
		   else return (<li onClick={this.handleClickEvent.bind(this)} key={index}><a className="cursor" name={actionNames.actionName}>{actionNames.displayName}</a></li>)  
   	  })
   	  return list;
   }
	render() {
		let dataPrev = store.getState().datasets.dataPreview;
		let that = this;
		let settingsTemplate = null;
		console.log("In data Validation")
		if(dataPrev){
			 let transformationSettings = store.getState().datasets.dataTransformSettings;
			 transformationSettings.map((columnData,columnIndex) =>{
              if(that.props.slug == columnData.slug){
            	  settingsTemplate = that.renderDropdownList(columnData.columnSetting)
              }	 
			 });
			return (
				
					<ul  className="dropdown-menu scrollable-menu">
					  <Dialog ref="dialog"/>
					{settingsTemplate}</ul>
					
			)
		}

	}
}