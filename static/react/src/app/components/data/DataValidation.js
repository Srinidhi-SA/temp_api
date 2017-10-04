import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import Dialog from 'react-bootstrap-dialog';
import {handleColumnClick,updateColSlug} from "../../actions/dataActions";
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
   renderDropdownList(colData){
	   let list = colData.map((actionNames,index)=>{
   		return (<li onClick={this.handleClickEvent.bind(this)} key={index}><a className="cursor" name={actionNames.actionName}>{actionNames.displayName}</a></li>)  
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
				
					<ul  className="dropdown-menu">
					  <Dialog ref="dialog"/>
					{settingsTemplate}</ul>
					
			)
		}

	}
}