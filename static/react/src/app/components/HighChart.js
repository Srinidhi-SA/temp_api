import React from "react";
import store from "../store";
import {connect} from "react-redux";
import Highcharts from "highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock";
// import HighchartsReact from "highcharts-react-official";
import { showChartData, showZoomChart } from "../actions/signalActions";
import {ViewChart} from "./common/ViewChart";
import {ViewChartData} from "./common/ViewChartData";
import { downloadSVGAsPNG } from "../helpers/helper";
import { API } from "../helpers/env";
require('highcharts/modules/exporting')(Highcharts)

@connect((store) => {
    return {

    };
  })

export class HighChart extends React.Component {
    constructor(props) {
        super(props);
        this.tableDownload = "";
        this.modalCls = "modal fade chart-modal" + props.classId;
        this.tableCls = "table-responsive table-area table" + props.classId;
        this.chartData = "";
        this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2 xs-mb-20";
        this.state = { seconds: 0 };
        this.chart = {};
        this.exportChart = () => {
            console.log(this.chart);
            this.chart.exportchart();
        };
    }

    componentDidMount() {
        this.chart = this.refs.chart.chart;
      }

    openZoomChart(flag) {
        this.props.dispatch(showZoomChart(flag, this.props.classId));
    }

    openChartData(flag) {
        this.props.dispatch(showChartData(flag,this.props.classId));
    }

    downloadSVG(){
      downloadSVGAsPNG("chartDownload"+this.props.classId)
    }

    render(){
        if (this.props.tabledownload) {
            this.tableDownload = API + this.props.tabledownload;
        }
        let chartData = this.props.data;
        var axesList = [];
        for(let i=0;i<chartData.data.columns.length;i++){
            if(chartData.data.columns[i][0] != "date"){
                axesList.push([]);
                let j=1;
                let array1 = []
                axesList[axesList.length-1]["color"]=chartData.color.pattern[i+1]
                axesList[axesList.length-1]["name"]=chartData.data.columns[i][0];
                axesList[axesList.length-1]["data"]=[];
                // axesList[axesList.length-1]["yAxis"]=axesList.length-1;
                for(j=1;j<chartData.data.columns[i].length;j++){
                    axesList[axesList.length-1]["data"].push([Date.parse(this.props.xdata[j-1]),chartData.data.columns[i][j]])
                    array1.push(chartData.data.columns[i][j])
                }
                axesList[axesList.length-1]["high"] = Math.max(...array1)
                axesList[axesList.length-1]["low"] = Math.min(...array1)
            }
        }

        const config = {
            chart: { type: "spline" },
            credits: { enabled: false },
            title: { text: chartData.title.text },
            // navigator: { enabled: false },
            scrollbar: { enabled: false },
            legend : chartData.legend.show,
            rangeSelector: {
                inputEnabled:false,
                buttons: [
                    { type: 'month',count: 1,text: '1m' },
                    { type: 'month',count: 3,text: '3m' },
                    { type: 'month',count: 6,text: '6m' },
                    { type: 'month',count: 9,text: '9m' },
                    { type: 'year',count: 1,text: '1y'},
                    { type: 'all',text: 'All'}
                ],
                buttonTheme: {
                    fill: "none",
                    r:4,
                    style: { color: "#32b5a6", fontWeight: 'bold' },
                    states: {
                        select: {
                            fill: "#32b5a6",
                            style: { color: "white" }
                        }
                    }
                }
            },
            xAxis: {
                type: 'datetime',
                align: "left",
                labels:{ format:"{value:%d %b \'%y}" },
                crosshair : { width:2, color:"#525b59" },
                title: { 
                    text: "<span style=color:#333333>"+chartData.axis.x.label.text+"</span>",
                    style: {
                        fontSize:"13px",
                    },
                    offset: 20,
                },
            },
            yAxis: {
                    opposite:false,
                    crosshair : { width:2, color:"#525b59" },
                    title: { 
                        text: "<span style=color:#333333>"+chartData.axis.y.label.text+"</span>",
                        offset: 30,
                        style: {
                            fontSize:"13px",
                        }
                    }
                    // resize: { enabled: false },
                    // height: '80%',
                // {
                //     labels: { enabled: false },
                //     top:"80%",
                //     height: '20%',
                // }
            },
            tooltip: {
                useHTML: true,
                shape: 'square',
                headerShape: 'callout',
                borderWidth: 0,
                shadow: false,
                formatter: function() {
                    var htmlTip = "<table class='tooltip-table'><thead><tr class='text-center'><th colspan=4>"+ Highcharts.dateFormat('%e %B %Y', this.x) +"</th></tr></thead><tbody>"
                    $.each(this.points, function(i, point) {
                        htmlTip = htmlTip+"<tr><td><span style=color:" + point.color + ">\u25FC</span></td><td>"+ point.series.name+"</td><td> |  </td> <td>"+point.y +"</td></tr>" ;
                    });
                    htmlTip = htmlTip +"</tbody></table>"
                    return htmlTip;
                }
            },
            plotOptions :{
                series:{
                    color:"#0fc4b5",
                    marker:{ enabled:false }
                }
            },
            series : axesList,
            exporting: {
                chartOptions: {
                    chart: {
                        width: 1024,
                        height: 768
                    }
                }
            }
        };

        return(
            <div className="chart-area">
                <div className="chart-data-icon">
                    <div class="btn-group pull-right">
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <i className="fa fa-more-img" aria-hidden="true"></i>
                        </button>
                        <button id="button" onClick={this.exportChart} >Export chart</button>
                        <ul role="menu" class="dropdown-menu dropdown-menu-right">
                            <li>
                            <a href="javascript:;" onClick={this.openZoomChart.bind(this, true)} >
                                <i class="fa fa-search-plus" aria-hidden="true"></i>&nbsp;
                                Zoom Chart</a>
                            </li>
                            <li>
                            <a href="javascript:;" id="button" onClick={this.downloadSVG.bind(this)}>
                                <i class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;
                                Download as PNG</a>
                            </li>
                            <li>
                            <a href="javascript:;" onClick={this.openChartData.bind(this, true)}>
                                <i class="fa fa-eye" aria-hidden="true"></i>&nbsp;
                                View Chart Data</a>
                            </li>
                            <li>
                            <a href={this.tableDownload}>
                                <i class="fa fa-cloud-download" aria-hidden="true"></i>&nbsp;
                                Download Chart Data</a>
                            </li>
                        </ul>
                    </div>
                    <div className="clearfix"></div>
                </div>
                {/* chart data Popup */}
                <div id="" className={this.modalCls} role="dialog">
                    <div className="modal-colored-header uploadData modal-dialog ">
                        <ViewChartData tabledata={this.props.tabledata} tableCls={this.tableCls} classId={this.props.classId} tableDownload={this.tableDownload}/>
                        <ViewChart classId={this.props.classId} click={this.downloadSVG} chartData={this.props.data}/>
                    </div>
                </div>
                <div className="highChartArea">
                    <ReactHighstock config={config} constructorType={"chart"} ref={"chart"}/>
                </div>
            </div>
        );
    }
}