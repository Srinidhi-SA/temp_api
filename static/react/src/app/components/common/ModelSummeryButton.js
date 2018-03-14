import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import {ViewChart} from "../common/ViewChart";
import {showZoomChart, showChartData} from "../../actions/signalActions";
import {renderC3ChartInfo,downloadSVGAsPNG} from "../../helpers/helper";

@connect((store) => {
  return { selPrediction: store.signals.selectedPrediction};
})

export class ModelSummeryButton extends React.Component {
	constructor(props){
		super(props);
	}
	show(){
		this.props.dispatch(showZoomChart(true,this.props.classId));
	}
	downloadSVG(){
      downloadSVGAsPNG("chartDownload"+this.props.classId)
  }
//Used in Stock Sense
	render() {
		var dataBox = this.props.jsonData;
		return (
				<div>
				<button type="button" className="btn btn-primary col-md-offset-8" onClick={this.show.bind(this)} title="Print Document">View Residuals</button>
				<ViewChart classId={this.props.classId} click={this.downloadSVG} chartData={dataBox.chart_c3}/>
				</div>
		);

	}
}