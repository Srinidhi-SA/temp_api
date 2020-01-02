import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
import store from "../../store";
import {C3Chart} from "../c3Chart";

@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview};
})

export class DataPreviewRightPanel extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		let dataPrev = this.props.dataPreview.meta_data;
		const sideChart = dataPrev.columnData[0].chartData;
		const sideTable = dataPrev.columnData;
		const sideTableTemaplte=sideTable.map((tableItem,tableIndex)=>{
			return(  <tr key={tableIndex}>
			<td className="item">{tableItem.name}</td>
			<td>: {tableItem.slug}</td>
			</tr>
			);
		});

		let chartInfo=[]

		return(
				<div className="col-md-3 preview_stats">
				<div id="tab_statistics" className="panel-group accordion accordion-semi">
				<div className="panel panel-default">
				<div className="panel-heading">
				<h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_statistics" href="#pnl_stc" aria-expanded="true" className="">Statistics <i className="fa fa-angle-down pull-right"></i></a></h4>
				</div>
				<div id="pnl_stc" className="panel-collapse collapse in" aria-expanded="true">
				<div className="panel-body" >
				<table className="no-border no-strip skills" cellpadding="3" cellspacing="0" id="side-table">
				<tbody className="no-border-x no-border-y" >
				{sideTableTemaplte}
				</tbody>
				</table>
				</div>
				</div>
				</div>
				</div>
				<div id="tab_visualizations" className="panel-group accordion accordion-semi">
				<div className="panel panel-default">
				<div className="panel-heading">
				<h4 className="panel-title"><a data-toggle="collapse" data-parent="#tab_visualizations" href="#pnl_visl" aria-expanded="true" className="">Visualizations <i className="fa fa-angle-down pull-right"></i></a></h4>
				</div>
				<div id="pnl_visl" className="panel-collapse collapse in" aria-expanded="true">
				<div className="panel-body" id="side-chart">
				{/*<img src="../assets/images/data_preview_graph.png" className="img-responsive" />*/}
				<C3Chart chartInfo={chartInfo} classId={"_side"} data={sideChart} yformat={false} sideChart={true}/>
				<div className="clearfix"></div>
				</div>
				</div>
				</div>
				</div>
				</div>
		);
}
}
