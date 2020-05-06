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
            axesList.push([]);
            let j=1;
            let array1 = []
            axesList[i]["name"]=chartData.data.columns[i][0];
            axesList[i]["data"]=[];
            for(j=1;j<chartData.data.columns[i].length;j++){
                axesList[i]["data"].push([Date.parse(this.props.xdata[j-1]),chartData.data.columns[i][j]])
                array1.push(chartData.data.columns[i][j])
            }
            axesList[i]["high"] = Math.max(...array1)
            axesList[i]["low"] = Math.min(...array1)
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
                crosshair : {
                    width:2,
                    color:"#36c4b5"
                },
            },
            yAxis: [{
                crosshair : {
                    width:2,
                    color:"#525b59"
                },
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
			formatter: function() {
                var htmlTip = "<table><thead><tr class='text-center'><th colspan=3>"+ Highcharts.dateFormat('%e %B %Y', this.x) +"</th></tr></thead><tbody><tr><td><b>Value:"+ this.points[0].y+"</b></td></tr><tr><td><b>Value1:"+ this.points[1].y+"</b></td></tr></tbody></table>"
                return htmlTip;
            }
        },
        plotOptions :{
            series:{
                color:"#0fc4b5",
                marker:{ enabled:false }
            }
        },
        series: [{
            type: 'spline',
            id:"dateseries",
            name:"Values",
            data:axesList[0]["data"],
            yAxis:0
        },{
            type: 'spline',
            id:"dateseries2",
            name:"Values2",
            data:axesList[2]["data"],
            color:"#bcf3a2"
        },{
            type: 'column',
            name:"date1",
            id:"dateseries1",
            data:axesList[0]["data"],
            color:"#148071",
            yAxis:1
        },{
            type : 'flags',
            data : [{
                x: Date.UTC(2020,2,12),
                title: "H",
                text: ""
            },{
                x: Date.UTC(2020,3,12),
                title: "L",
                text: ""
            }],
            onSeries:"dateseries",
            shape:"squarepin"
        }]
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