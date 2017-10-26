import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {NORMALTABLE,CONFUSIONMATRIX,HEATMAPTABLE,CIRCULARCHARTTABLE,DECISIONTREETABLE,TEXTHEATMAPTABLE} from "../../helpers/helper";
import {CircularChartTable} from "./CircularChartTable";
import {ConfusionMatrix} from "./ConfusionMatrix";
import {DecisionTreeTable} from "./decisionTreeTable";
import {HeatMapTable} from "./heatmap";
import {TextHeatMapTable} from "./TextHeatMapTable";
import {NormalTable} from "/NormalTable";

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
			tableEle = <ConfusionMatrix tableData={element}/>;
		}
		if(element.tableType == DECISIONTREETABLE){
			tableEle = <DecisionTreeTable tableData={element}/>;
		}
		if(element.tableType == HEATMAPTABLE){
			tableEle = <HeatMapTable tableData={element}/>;
		}
		if(element.tableType == NORMALTABLE){
			tableEle = <NormalTable tableData={element}/>;
		}if(){
			
		}
		return (
				<div>
				{tableEle}
				</div>
		);
	}
}
