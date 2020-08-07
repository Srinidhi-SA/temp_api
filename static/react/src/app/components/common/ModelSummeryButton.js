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
  updateChart() {
    var that = this;
    let data = this.props.data;
    if (this.props.sideChart) {
      data['size'] = {
        height: 230
      }
    }

    if (data.data.type == "donut"){
      data.padding.top=35
    }
    if (this.props.yformat) {
      if (data.data.type == "donut")
      this.props.yformat == '.4f' ? data.donut.label.format = d3.format('.4f'):data.donut.label.format = d3.format('.2s');//If the y-format from API is .4f then making format for measure is .4f only, otherwise making it to .2s
      else if(data.data.type == "pie")
      {
      }else
      this.props.yformat == '.4f' ? data.axis.y.tick.format = d3.format('.4f'):data.axis.y.tick.format = d3.format('.2s');//If the y-format from API is .4f then making format for measure is .4f only, otherwise making it to .2s

      if (data.tooltip && data.tooltip.format){
        if(data.data.columns[0][0] == "Count" || this.props.selectedL1 == "Prediction") // setting as Integer format for the charts coming under Overview and Prediction
        data.tooltip.format.value = d3.format('');
        else if(this.props.yformat == '.4f')//If .4f is coming from API then set tooltip format is also .4f
        data.tooltip.format.value = d3.format('.4f');
        else
        data.tooltip.format.value = d3.format('.2f');
      }
    }
    else
    {
      if (data.data.type == "donut")
      data.donut.label.format = d3.format('.2s');
      else if(data.data.type == "pie"){
    //removing logic for pie formatting as profile page is failing>>> data.pie.label.format = d3.format('.2s');
      }else
      data.axis.y.tick.format = d3.format('.2s');

      if (data.tooltip && data.tooltip.format)
      data.tooltip.format.value = d3.format('.2f');
    }


    if (this.props.y2format) {
      let formats = [
        '.2s',
        '$',
        '$,.2s',
        '.2f','.4f',
        ',.0f',
        '.4r'
      ];
      if (formats.indexOf(this.props.y2format) >= 0) {
        data.axis.y2.tick.format = d3.format(this.props.y2format);
      } else {
        data.axis.y2.tick.format = d3.format('');
      }

    }

    if(store.getState().datasets.dataPreviewFlag){
      let yformat=".2s"
      if(this.props.yformat)
        yformat=this.props.yformat
    if(data.axis&&data.axis.y.tick.format){
    data.axis.y.tick.format=function(f){
      if(f>999){
        let si = d3.format(yformat);
      return String(si(f));
    }  else {
      let si = d3.format('.0f');
    return String(si(f));
      }
    }}}

    if (this.props.guage) {
      data.gauge.label.format = function(value, ratio) {
        return value;
      }
    }
    if (this.props.tooltip) {
      //alert("working");
      var tooltip = this.props.tooltip;

      window.toolData = [];
      window.toolData.push(tooltip[0]);
      window.toolData.push(tooltip[1]);
      window.toolLegend = tooltip[2];

      data.tooltip.contents = c3Functions.set_tooltip;

    }

    if (this.props.xdata) {
      let xdata = this.props.xdata;
      data.axis.x.tick.format = function(x) {
        if (xdata[x] && xdata[x].length > 13) {
          return xdata[x].substr(0, 13) + "..";
        } else {
          return xdata[x];
        }
      }

      data.tooltip.format.title = function(d) {
        return xdata[d];
      }

    }

    if(this.props.selectedL1=="Trend"&&data.data.type=="line"&&this.props.selected_signal_type=="measure"){
    
      let colors=data.color.pattern
      data.data.color= function (color, d) {
               return d.index === 0 ? colors[0] : color;
       }
    }

    this.chartData = data;
    data['bindto'] = this.getChartElement().get(0); 
   
    let chart = c3.generate(data);
    chart.destroy();

    chart = setTimeout(function() {
      return c3.generate(data);
    }, 100);

    var chartDownloadData = jQuery.extend(true, {}, data);
    if(chartDownloadData.subchart != null){
        chartDownloadData.subchart.show=false;
    }
    if(chartDownloadData.axis&&chartDownloadData.axis.x){
        chartDownloadData.axis.x.extent = null;
        if(chartDownloadData.axis.x.tick){
        chartDownloadData.axis.x.tick.fit=true;
        if(chartDownloadData.data.type=="scatter")
        chartDownloadData.axis.x.tick.fit=false;
      }
    }
    chartDownloadData['bindto'] = document.querySelector(".chartDownload"+this.props.classId)
    let chartDownload = c3.generate(chartDownloadData);

    $('.chart-area').mouseenter(function() {
      if (that.props.classId != '_side') {
        $('.chart-data-icon').css('visibility', 'visible');
      }

      if (!that.props.widthPercent) {
        $('.chart-data-icon').css('visibility', 'visible');
      }
    }).mouseleave(function() {
      $('.chart-data-icon').css('visibility', 'hidden');
    });
    if (this.props.tabledata) {
      var tabledata = this.props.tabledata;

      var collength = tabledata.length;
      var rowlength = tabledata[0].length;
      var tablehtml = "<thead><tr>",
        tablehead = "",
        tablebody = "";
      for (var i = 0; i < collength; i++) {
        tablehtml += "<th> <b>" + tabledata[i][0] + "</b></th>";
      }
      tablehtml += "</tr></thead><tbody>";

      for (var j = 1; j < rowlength; j++) {
        tablehtml += "<tr>";
        for (var k = 0; k < collength; k++) {
          tablehtml += "<td>" + tabledata[k][j] + "</td>"
        }
        tablehtml += "</tr>";
      }
      tablehtml += "</tbody></table>";

      $(".table" + this.props.classId + " table").html(tablehtml);
    }

  }
   getChartElement() {
    if (this.props.classId == '_side') {
      return $(".chart", this.element);
    } else if (this.props.widthPercent) {
      return $(".chart" + this.props.classId, this.element);
    }
    return $(".chart" + this.props.classId, this.element);
  }
	render() {
		var that = this;
		$(function() {
			that.updateChart();
		});
		return (
      <div className="col-md-12">
      <div className="xs-mb-40 clearfix">
				
				<button type="button" className="btn btn-info pull-right" onClick={this.show.bind(this)} title="Print Document"><i class="fa fa-eye"></i> View Residuals</button>
				<div className="clearfix"></div>
				<ViewChart classId={this.props.classId} click={this.downloadSVG} chartData={this.props.data} tableDownload={this.props.tabledownload}/>
				</div>
        </div>
		);

	}
}