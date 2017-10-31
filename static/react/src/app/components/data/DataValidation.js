import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import Dialog from 'react-bootstrap-dialog';
import {handleColumnClick,updateColSlug} from "../../actions/dataActions";
import {DATA_TYPE,isEmpty} from "../../helpers/helper";
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
	handleClickEvent(colSlug,colName,event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(colSlug));
		this.props.dispatch(handleColumnClick(this.refs.dialog,event.target.name,colSlug,colName));
	}
	handleChangeTypeEvent(actionName,colSlug,colName,subActionName,event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(colSlug));
		this.props.dispatch(handleColumnClick(this.refs.dialog,actionName,colSlug,colName,subActionName));
	}
   renderDropdownList(colSlug,colName,colData){
	   let list = colData.map((actionNames,index)=>{
		   if(actionNames.actionName == DATA_TYPE){
			 return (
			<li key={index}><span>{actionNames.displayName}</span>
			<ul>{actionNames.listOfDataTypes.map((subItem,subIndex)=>{
				var id=colSlug+subIndex;
				  return(<li key={id} className="cursor"><div key={id} className="ma-radio inlinev"><input id={id} type="radio"   onClick={this.handleChangeTypeEvent.bind(this,actionNames.actionName,colSlug,colName,subItem.name)} checked={subItem.status} name={colSlug}  value={subItem.name} /><label htmlFor={id}>{subItem.displayName}</label></div></li>)
				})}</ul>
			 </li>)     
		   }
		   else return (<li onClick={this.handleClickEvent.bind(this,colSlug,colName)} key={index}><a className="cursor" name={actionNames.actionName}>{actionNames.displayName}</a></li>)  
   	  })
   	  return list;
   }
	render() {
		let dataPrev = store.getState().datasets.dataPreview;
		let that = this;
		let settingsTemplate = null;
		if(dataPrev){
			 let transformationSettings = store.getState().datasets.dataTransformSettings;
			 if(transformationSettings != undefined){
				 transformationSettings.map((columnData,columnIndex) =>{
		              if(that.props.slug == columnData.slug){
		            	settingsTemplate = that.renderDropdownList(columnData.slug,columnData.name,columnData.columnSetting)
		              }	 
					 }); 
			 }
			return (
				
					<ul  className="dropdown-menu scrollable-menu">
					  <Dialog ref="dialog"/>
					{settingsTemplate}</ul>
					
			)
		}

	}
}