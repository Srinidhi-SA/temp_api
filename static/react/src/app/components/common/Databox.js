import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {NORMALTABLE,CONFUSIONMATRIX,HEATMAPTABLE,CIRCULARCHARTTABLE,DECISIONTREETABLE} from "../../helpers/helper";
import {CircularChartTable} from "./CircularChartTable";
import {ConfusionMatrix} from "./ConfusionMatrix";
import {DecisionTreeTable} from "./decisionTreeTable";
import {HeatMapTable} from "./heatmap";

export class Databox extends React.Component {
  constructor(){
    super();
  }

  render() {
   var element = this.props.data;
   console.log("checking table element");
   let tableEle = "";
   if(element.tableType == CIRCULARCHARTTABLE){
	   tableEle =  <CircularChartTable  tableData={element} />;
   }
   if(element.tableType == CONFUSIONMATRIX){
	   tableEle = <ConfusionMatrix tableData={element}/>;
       }
   if(element.tableType == DECISIONTREETABLE){
	   tableEle = <DecisionTreeTable tableData={element}/>;
       }
	 if(element.tableType == HEATMAPTABLE){
	   tableEle = <HeatMapTable tableData={element}/>;
	 }
   return (
		      <div>
		        {tableEle}
		      </div>
		    );
  }
}
