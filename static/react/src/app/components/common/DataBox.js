import React from "react";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {NORMALTABLE,CONFUSIONMATRIX,HEATMAPTABLE,CIRCULARCHARTTABLE,DECISIONTREETABLE} from "../../helpers/helper";
import {CircularChartTable} from "./CircularChartTable";
import {ConfusionMatrix} from "./ConfusionMatrix";
import {DecisionTreeTable} from "./decisionTreeTable";
import {HeatMapTable} from "./heatmap";


export class DataBox extends React.Component {
	constructor(){
		super();
	}

//Used in Stock Sense
	render() {
		var dataBox = this.props.jsonData;
		let  columnsTemplates = dataBox.map((data,index)=>{
			return (<div className="col-md-4 col-sm-8 col-xs-12 bgStockBox">
			<h3 className="text-center">{data.value}<br/><small>{data.name}</small></h3>
			</div>);
		});
		return (
				<div>
				{columnsTemplates}
				</div>
		);

	}
}