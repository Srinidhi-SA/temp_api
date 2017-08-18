import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {NORMALTABLE,CONFUSIONMATRIX,HEATMAPTABLE,CIRCULARCHARTTABLE} from "../../helpers/helper";
import {CircularChartTable} from "./CircularChartTable";
import {ConfusionMatrix} from "./ConfusionMatrix";

export class CardTable extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var element = this.props.jsonData;
   console.log("checking table element");
   let tableEle = "";
   if(element.tableType == CIRCULARCHARTTABLE){
	   tableEle =  <CircularChartTable  tableData={element} />;
   }
   if(element.tableType == CONFUSIONMATRIX){
	   tableEle =  <ConfusionMatrix  tableData={element} />;
   }
   return (
		      <div>
		        {tableEle}
		      </div>
		    );
  }
}
