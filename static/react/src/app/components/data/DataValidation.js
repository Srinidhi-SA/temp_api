import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import Dialog from 'react-bootstrap-dialog';
import {handleColumnClick,updateColSlug} from "../../actions/dataActions";
import {DATA_TYPE,isEmpty,UNIQUE_IDENTIFIER} from "../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';

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
	handleClickEvent(colSlug,colName,colStatus,event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(colSlug));
		if(event.target.name == "" || event.target.name == undefined)
		 event.target.name = event.target.htmlFor;
		//this is to prevent parent click on UInique identifier
		if(event.target.name != "uniqueBtn")
		this.props.dispatch(handleColumnClick(this.refs.dialog,event.target.name,colSlug,this.props.name,"",colStatus));
	}
	handleChangeTypeEvent(actionName,colSlug,colName,subActionName,event){
		event.stopPropagation();
		this.props.dispatch(updateColSlug(colSlug));
		this.props.dispatch(handleColumnClick(this.refs.dialog,actionName,colSlug,colName,subActionName));
	}
	componentWillMount(){
		this.props.dispatch(updateColSlug(this.props.slug));
	}
   renderDropdownList(colSlug,colName,colData){
       if(colData){
           let list = colData.map((actionNames,index)=>{
               if(actionNames.hasOwnProperty("listOfActions")){
                 return (
                <li key={index}><span>{actionNames.displayName}</span>
                <ul>{actionNames.listOfActions.map((subItem,subIndex)=>{
                    let randomNum = Math.random().toString(36).substr(2,8);
                    var id=colSlug+subIndex+randomNum;
                      return(<li key={id} className="cursor"><div key={id} className="ma-radio radio-pt-2 inlinev"><input id={id} type="radio"   onClick={this.handleChangeTypeEvent.bind(this,actionNames.actionName,colSlug,colName,subItem.name)} defaultChecked={subItem.status} name={id}  value={subItem.name} /><label  className="text-nowrap" htmlFor={id}>{subItem.displayName}</label></div></li>)
                    })}</ul>
                 </li>)
               }
               else{
                   if(actionNames.actionName == UNIQUE_IDENTIFIER)
                       return(<li  onClick={this.handleClickEvent.bind(this,colSlug,colName,actionNames.status)}  key={index}>
                               <div class="ma-radio inline cursor">
                               <input type="radio" defaultChecked={actionNames.status}  name="uniqueBtn" id={actionNames.actionName}/>
                               <label for={actionNames.actionName}><a className="inline-block">{actionNames.displayName}</a></label>
                               </div>
                       </li>)

											 else
                  return (<li onClick={this.handleClickEvent.bind(this,colSlug,colName,actionNames.status)} key={index}><a className="cursor" name={actionNames.actionName}>{actionNames.displayName}</a></li>)


               }



          })
          return list;
       }

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
