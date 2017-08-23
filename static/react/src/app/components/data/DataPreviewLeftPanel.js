import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Redirect} from 'react-router';
import store from "../../store";
import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';


@connect((store) => {
	return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview};
})

export class DataPreviewLeftPanel extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		$(function(){
			let initialCol= $(".cst_table td").first();
			let initialColCls = $(initialCol).attr("class");
			$(" td."+initialColCls).addClass("activeColumn");

			$(".cst_table td,.cst_table th").click(function(){
				$(".cst_table td").removeClass("activeColumn");
				let cls = $(this).attr("class");
				if(cls.indexOf(" ") !== -1){
					let tmp =[];
					tmp = cls.split(" ");
					cls = tmp[0];
				}
				$(" td."+cls).addClass("activeColumn");
			});

		});

	}
	setSideElements(e){
		//renderFlag=true;
		const chkClass = $(e.target).attr('class');
		let dataPrev = this.props.dataPreview.meta_data;
		dataPrev.columnData.map((item, i) => {
			if(chkClass.indexOf(item.slug) !== -1){

				const sideChartUpdate = item.chartData;
				const sideTableUpdate = item.columnStats;
				$("#side-chart").empty();
				ReactDOM.render(<C3Chart classId={"_side"} data={sideChartUpdate} yformat={false} sideChart={true}/>, document.getElementById('side-chart'));

				const sideTableUpdatedTemplate=sideTableUpdate.map((tableItem,tableIndex)=>{
					return(  <tr key={tableIndex}>
					<td className="item">{tableItem.name}</td>
					<td>{tableItem.value}</td>
					</tr>
					);
				});
				$("#side-table").empty();
				ReactDOM.render( <tbody className="no-border-x no-border-y">{sideTableUpdatedTemplate}</tbody>, document.getElementById('side-table'));

			}
		});
	}
	render() {
		console.log("data preview Left panel is called##########3");
		let dataPrev = this.props.dataPreview.meta_data;
			const topInfo = dataPrev.metaData.map((item, i) => {
				if(item.display){
					return(
							<div key={i} className="col-md-3 col-xs-6">
							<h3>
							{item.value}
							<small>{item.name}</small>
							</h3>
							</div>

					);
				}
			});

			const tableThTemplate=dataPrev.columnData.map((thElement, thIndex) => {
				const cls = thElement.slug + " dropdown";
				const anchorCls =thElement.slug + " dropdown-toggle";
				return(
						<th key={thIndex} className={cls} onClick={this.setSideElements.bind(this)}>
						<a href="#" data-toggle="dropdown" className={anchorCls}><i className="fa fa-clock-o"></i> {thElement.name}</a>
						</th>
				);
			});
			const tableRowsTemplate = dataPrev.sampleData.map((trElement, trIndex) => {
				const tds=trElement.map((tdElement, tdIndex) => {
					return(
							<td key={tdIndex} className={dataPrev.columnData[tdIndex].slug} onClick={this.setSideElements.bind(this)}>{tdElement}</td>
					);
				});
				return (
						<tr key={trIndex}>
						{tds}
						</tr>

				);
			});
			return(
					<div className="col-md-9">
					<div className="panel panel-borders">
					{topInfo}
					<div className="clearfix"></div>
					<div className="table-responsive noSwipe">
					<table className="table table-condensed table-hover table-bordered table-striped cst_table">
					<thead>
					<tr>
					{tableThTemplate}
					</tr>
					</thead>
					<tbody className="no-border-x">
					{tableRowsTemplate}
					</tbody>
					</table>
					</div>
					</div>
					</div>
			);

		}
}
