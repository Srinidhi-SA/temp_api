import React from "react";
import Highcharts from "highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock.src"

export class HighChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
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
                axesList[axesList.length-1]["yAxis"]=0;
                for(j=1;j<chartData.data.columns[i].length;j++){
                    axesList[axesList.length-1]["data"].push([Date.parse(this.props.xdata[j-1]),chartData.data.columns[i][j]])
                    array1.push(chartData.data.columns[i][j])
                }
                axesList[axesList.length-1]["high"] = Math.max(...array1)
                axesList[axesList.length-1]["low"] = Math.min(...array1)
            }
        }

        const config = {
            credits: { enabled: false },
            title: { text: chartData.title.text },
            navigator: { enabled: false },
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
                labels:{ format:"{value:%b \'%y}" },
                crosshair : { width:2, color:"#525b59" },

            },
            yAxis: [{
                crosshair : { width:2, color:"#525b59" },
                labels: { text: chartData.axis.y.label.text, align: 'left' },
                height: '80%',
                resize: { enabled: false },
                },
                {
                    labels: { enabled: false },
                    top:"80%",
                    height: '20%',
                }
            ],
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
        series : axesList
      };
      return(
        <div className="chart-area">
          <div className="highChartArea">
            <ReactHighstock config={config} />
          </div>
        </div>
      );
  }
}