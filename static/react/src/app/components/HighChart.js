import React from "react";
import Highcharts from "highcharts";
import ReactHighstock from "react-highcharts/ReactHighstock.src"

export class HighChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
        var that = this;
        let chartData = this.props.data;
        let xDt = [];
        let dtes = chartData.data.columns;
        for(let i=1;i<dtes[0].length;i++){
            xDt.push([Date.parse(dtes[1][i]),dtes[0][i],dtes[2][i]])
        }
        // for(let i=1;i<dtes[0].length;i++){
        //     xDt.push([Date.parse(dtes[1][i]),dtes[0][i],dtes[2][i]])
        // }
        console.log(xDt)
        const config = {
            credits: {
                enabled: false
            },
                title: {
                text: chartData.title.text
            },
            navigator: {
                enabled: false
            },
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
                    style: {
                        color: "#32b5a6",
                        fontWeight: 'bold'
                    },
                    states: {
                        select: {
                            fill: "#32b5a6",
                            style: {
                                color: "white"
                            }
                        }
                    }
                }
            },
            scrollbar: {
                enabled: false
            },
            legend : chartData.legend.show,
            xAxis: {
                type: 'datetime',
                align: "left",
                labels:{
                    format:"{value:%b \'%y}"
                },
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
                labels: {
                    text: chartData.axis.y.label.text,
                    align: 'left'
                },
                height: '80%',
                resize: {
                    enabled: false
                },
                },
                {
                    labels: {
                        enabled: false
                    },
                    top:"80%",
                    height: '20%',
                    // offset: 0
                }],
        tooltip: {
            useHTML: true,
			formatter: function() {
                var s = ''
                s= "<table><thead><tr class='text-center'><th colspan=3>"+ Highcharts.dateFormat('%e %B %Y', this.x) +"</th></tr></thead><tbody><tr><td><b>Value:"+ this.y+"</b></td></tr></tbody></table>"
        	    	return s;
				}
        },
        plotOptions :{
            series:{
                color:"#0fc4b5",
                marker:{
                    enabled:false
                }
            }
        },
        series: [{
            type: 'spline',
            id:"dateseries",
            name:"Values",
            data:xDt,
            yAxis:0
        },{
            type: 'column',
            name:"date1",
            id:"dateseries1",
            data:xDt,
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