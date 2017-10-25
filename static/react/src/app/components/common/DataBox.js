import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';


export class DataBox extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var dataBox = this.props.jsonData;
 let  columnsTemplates = dataBox.map((data,index)=>{
	 return (<div className="col-md-3 col-sm-6 col-xs-12 ">
	 <h3 className="text-center">{data.value}<br/><small>{data.name}</small></h3>
	 </div>);
 });
   return (
          <div className="row">
          {columnsTemplates}
          </div>
       );
  }
}
