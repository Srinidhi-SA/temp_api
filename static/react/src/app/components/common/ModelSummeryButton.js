import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {ViewChart} from "../common/ViewChart";
import {showZoomChart} from "../../actions/signalActions";

@connect((store) => {
  return { 
  };
})

export class ModelSummeryButton extends React.Component {
	constructor(props){
		super(props);
	}
	show(){
		this.props.dispatch(showZoomChart(true,this.props.classId));
	}
	render() {
		var that = this;
		return (
      <div className="col-md-12">
        <div className="xs-mb-40 clearfix">
	  			<button type="button" className="btn btn-info pull-right" onClick={this.show.bind(this)} title="Print Document"><i class="fa fa-eye"></i> View Residuals</button>
		  		<div className="clearfix"></div>
			  	<ViewChart classId={this.props.classId} chartData={this.props.data} tableDownload={this.props.tabledownload}/>
				</div>
      </div>
		);

	}
}