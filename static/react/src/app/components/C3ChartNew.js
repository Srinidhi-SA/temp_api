import React from "react";
import {connect} from "react-redux";
import {chartdate, fetchWordCloudImg, setCloudImageLoader, clearCloudImgResp, clearC3Date} from "../actions/chartActions";
import {API, STATIC_URL} from "../helpers/env";
import {renderC3ChartInfo,downloadSVGAsPNG, getUserDetailsOrRestart} from "../helpers/helper";
import store from "../store";
import {ViewChart} from "./common/ViewChart";
import {ViewChartData} from "./common/ViewChartData";
import {showZoomChart, showChartData} from "../actions/signalActions";

@connect((store) => {
  return {
    selectedL1:store.signals.selectedL1,
    selectedDate : store.chartObject.date,
    cloudImgResp : store.chartObject.cloudImgResp,
    cloudImgFlag : store.chartObject.cloudImgFlag
  };
})

export class C3ChartNew extends React.Component{
  constructor(props) {
    super(props);
    this.chartData = "";
    this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2 xs-mb-20";
    this.tableDownload = "";
    this.modalCls = "modal fade chart-modal" + props.classId;
    this.tableCls = "table-responsive table-area table" + props.classId;
    
  }

  getHeader(token) {
    return { 'Authorization': token, 'Content-Type': 'application/json' };
  }

  componentWillMount() {
    if (this.props.classId == '_side') {
      this.classId = "chart";
    } else if (this.props.widthPercent) {
      this.classId = "chart" + this.props.classId;
    }
  }
  
  componentDidMount() {
    $(".chart" + this.props.classId).empty();
    this.updateChart();
    if (this.props.classId == '_side' || this.props.classId == '_profile') {
      $(".chart-data-icon").empty();
    };
    if($(".visualizeLoader")[0] != undefined)
      $(".visualizeLoader")[0].style.display = "none"
  }

  componentDidUpdate(){
    this.updateChart();
    if (this.props.classId == '_side' || this.props.classId == '_profile') {
      $(".chart-data-icon").empty();
    };
    if($(".visualizeLoader")[0] != undefined)
      $(".visualizeLoader")[0].style.display = "none"
  }

  // componentWillUnmount(){
  //   if(Object.keys(this.props.data).length != 0)
  //     this.props.dispatch(clearC3Date())
  //   if(Object.keys(this.props.cloudImgResp).length !=0)
  //     this.props.dispatch(clearCloudImgResp())
  // }

  openZoomChart(flag) {
    this.props.dispatch(showZoomChart(flag, this.props.classId));
  }
  openChartData(flag) {
    this.props.dispatch(showChartData(flag, this.props.classId))
  }
  showStatisticalInfo() {
    renderC3ChartInfo(this.props.chartInfo)
  }
  closeModal() {
    $(".chart-modal" + this.props.classId).modal('hide');
  }
  showModal() {
    $(".chart-modal" + this.props.classId).modal({keyboard: true, show: true});
  }
  downloadSVG(){
    downloadSVGAsPNG("chartDownload"+this.props.classId)
  }
  getChartElement() {
    if (this.props.classId == '_side') {
      return $(".chart", this.element);
    } else if (this.props.widthPercent) {
      return $(".chart" + this.props.classId, this.element);
    } else if(store.getState().signals.viewChartFlag){
      
      return $("."+this.props.classId, this.element);
    }
    return $(".chart" + this.props.classId, this.element);
  }

  updateChart() {
    let chartData = this.props.data;
    var that = this;
    if (this.props.sideChart) { chartData['size'] = { height: 230 } }
    let myData = {}
     switch(chartData.data.type){
      case "bar": 
              myData = {
                  "axis": {
                    "x": {
                      "extent": null,
                      "height": chartData.axis.x.height,
                      "label": {
                        "position": chartData.axis.x.label.position,
                        "text": chartData.axis.x.label.text,
                      },
                      "tick": {
                        "format":(chartData.axis.x.type != "category" && chartData.axis.x.tick.format!=undefined)?d3.format(chartData.axis.x.tick.format):null,
                        "fit": (chartData.axis.x.tick.fit!=undefined)?chartData.axis.x.tick.fit:"",
                        "multiline": (chartData.axis.x.tick.multiline!=undefined)?chartData.axis.x.tick.multiline:"",
                        "rotate": (chartData.axis.x.tick.rotate!=undefined)?chartData.axis.x.tick.rotate:"",
                        "values":(chartData.axis.x.tick.values!=undefined)?chartData.axis.x.tick.values:""
                      },
                      "type": chartData.axis.x.type,
                    },
                    "y": {
                      "label": {
                        "position": chartData.axis.y.label.position,
                        "text": chartData.axis.y.label.text
                      },
                      "tick": {
                        "multiline": chartData.axis.y.tick.multiline,
                        "format": (this.props.yformat!=undefined || this.props.yformat!=null)?d3.format(this.props.yformat):d3.format(".2f"),
                        "outer": false
                      }
                    },
                  },
                  "bar": {
                    "width": chartData.bar.width!=undefined?chartData.bar.width:""
                  },
                  "color": chartData.color,
                  "data": {
                    "axes": chartData.data.axes,
                    "columns": chartData.data.columns,
                    "type": chartData.data.type,
                    "x": chartData.data.x,
                  },
                  "grid": (chartData.grid===undefined)?null:{
                    "x":{
                      "show":chartData.grid.x.show,
                    },
                    "y":{
                      "show":chartData.grid.y.show,
                      "lines":(chartData.grid.y.lines===undefined)?0:
                      [{
                        "class": chartData.grid.y.lines[0].class,
                        "position": chartData.grid.y.lines[0].position,
                        "text": "",
                        "value": chartData.grid.y.lines[0].value,
                      }]
                    }
                  },
                  "legend": {
                    "show":chartData.legend.show
                  },
                  "padding": {
                    "top": chartData.padding.top
                  },
                  "point": chartData.point != null?"":null,
                  "size": (chartData.size===undefined)?null:{ 
                    "height": chartData.size.height
                  },
                  "title": {
                    "text": (chartData.title.text!=null)?chartData.title.text:null
                  },
                  "subchart":{
                    show:(chartData.subchart != undefined && chartData.subchart != null)?chartData.subchart.show:false,
                  },
                  "tooltip":{
                    "format": {
                      "title": (chartData.tooltip!=undefined && chartData.tooltip.format!=undefined)?d3.format(chartData.tooltip.format.title):""
                    },
                    "show": (chartData.tooltip!=undefined && chartData.tooltip.show!=undefined)?chartData.tooltip.show:true
                  }
                }
                break;
      case "donut":
        var col = chartData.data.columns
          var total = col.reduce(function(sum, item) {
              return sum + parseFloat(item[1])
          }, 0);
          col = col.map(function(item) {
              return [
                  item[0] + ' : ' + d3.format('.1%')(item[1] / total),
                  item[1]
              ]
          });
        myData = {
          "color": chartData.color,
          "data": {
            "columns": col,
            "type": chartData.data.type,
            "x":chartData.data.x
          },
          "donut":{
            "label":{
              "format":(chartData.donut.label!=undefined && chartData.donut.label.format!=undefined)?d3.format(chartData.donut.label.format):d3.format(".2f"),
              "show":chartData.donut.label.show
            },
            "title":chartData.donut.title,
            "width":chartData.donut.width
          },
          "padding": {
            "top": chartData.padding.top,
            "bottom":40
          },
          "legend": {
            "show":chartData.legend.show,
            "position":chartData.legend.position
          },
          "size":{
            "height":chartData.size.height
          },
          tooltip:{
            "format":{
              "title": (chartData.format !=undefined && chartData.format.title !=undefined)?chartData.format.title:"",
              "value": (this.props.selectedL1 === "Prediction" || chartData.data.columns[0][0] === "Count")?d3.format(""):d3.format(".2f")
            }
          }
      }
        break;
      case "pie": 
          var col = chartData.data.columns
          var total = col.reduce(function(sum, item) {
              return sum + item[1]
          }, 0);
          col = col.map(function(item) {
              return [
                  item[0] + ' : ' + d3.format('.1%')(item[1] / total),
                  item[1]
              ]
          });
        myData = {
          "size": { 
            "height": (chartData.size !=undefined)?chartData.size.height :null
          },
          "title": {
            "text": (chartData.title!=undefined && chartData.title.text!=null)?chartData.title.text:""
          },
          "color": chartData.color,
          "pie": {
            "label": {
              "format" : (chartData.pie !=undefined)?(
                chartData.pie.label.format!=undefined || chartData.pie.label.format!=null)
                ?d3.format(chartData.pie.label.format):d3.format(".2f"):null,
              "show": (chartData.pie!=undefined && chartData.pie.label !=undefined)? chartData.pie.label.show:true
            },
            "title":""
          },
          "padding": {
            "top": (chartData.padding!=undefined)?chartData.padding.top:null
          },
          "legend": {
            "show":(chartData.legend!=undefined)?chartData.legend.show:true
          },
          "data": {
            "columns": col,
            "type": chartData.data.type
          },
          "tooltip":{
            "format": {
              "title":(chartData.tooltip!=undefined && chartData.tooltip.format!=undefined)?chartData.tooltip.format.title:"",
              "value":(chartData.tooltip!=undefined && chartData.tooltip.format!=undefined)?d3.format(chartData.tooltip.format.value):null
            }
          }
      }
      break;
      case "combination": 
       myData = {
        "axis": {
          "rotated":chartData.axis.rotated,
          "x": {
              "height": chartData.axis.x.height,
              "label": {
                  "position": chartData.axis.x.label.position,
                  "text": chartData.axis.x.label.text,
              },
              "tick": {
                "format":(chartData.axis.x.type != "category")?d3.format(chartData.axis.x.tick.format):null,
                "multiline": chartData.axis.x.tick.multiline,
              },
              "type": chartData.axis.x.type
          },
          "y": {
            "label": {
                "position": chartData.axis.y.label.position,
                "text": chartData.axis.y.label.text
            },
            "tick": {
                "multiline": chartData.axis.y.tick.multiline,
                "format": (this.props.yformat!=undefined || this.props.yformat!=null)?d3.format(this.props.yformat):d3.format(".2f"),
                "outer": false
            },
          },
          "y2": {
            "label": {
                "position": chartData.axis.y2!=undefined?chartData.axis.y2.label.position:"",
                "text": chartData.axis.y2!=undefined?chartData.axis.y2.label.text:""
            },
            "show": chartData.axis.y2.show,
            "tick": {
                "multiline": chartData.axis.y2!=undefined?chartData.axis.y2.tick.multiline:"",
                "format": chartData.axis.y2!=undefined?d3.format(this.props.y2format):d3.format(".2f"),
                "count": chartData.axis.y2!=undefined?chartData.axis.y2.tick.count:0
            },
          },
        },
        "bar": {
          "width": (chartData.bar.width.ratio!=undefined)?chartData.bar.width:{"ratio" : chartData.bar.width.ratio}
        },
        "color": chartData.color,
        "data": {
          "axes": chartData.data.axes,
          "columns": chartData.data.columns,
          "names":chartData.data.names,
          "type": chartData.data.type,
          "types":chartData.data.types,
          "x": chartData.data.x,
        },
        "grid": {
          "x":{
            "show":chartData.grid.x.show
          },
          "y":{
            "show":chartData.grid.y.show,
            "lines":(chartData.grid.y.lines===undefined)?0:
              [{
                "class": chartData.grid.y.lines[0].class,
                "position": chartData.grid.y.lines[0].position,
                "text": chartData.grid.y.lines[0].text,
                "value": chartData.grid.y.lines[0].value,
              }]
          }
        },
        "legend": {
          "show":chartData.legend.show
        },
        "padding": {
          "top": chartData.padding.top
        },
        "point": chartData.point != null?chartData.point:null,
        "size": { 
          "height": chartData.size.height 
        },
        "subchart":{
          show:(chartData.subchart != undefined && chartData.subchart != null)?chartData.subchart.show:false,
        },
        "title": {
          "text": (chartData.title.text!=null)?chartData.title.text:""
        },
        "tooltip":{
          "format": (chartData.tooltip!=undefined && chartData.tooltip.format!=undefined)?d3.format(chartData.tooltip.format):"",
          "show" : (chartData.tooltip!=undefined && chartData.tooltip.show!=undefined)?chartData.tooltip.show:true
        }
      }
      break;
      case "line": 
        myData = {
        "axis": {
          "x": {
              "height": chartData.axis.x.height,
              "label": {
                  "position": chartData.axis.x.label.position,
                  "text": chartData.axis.x.label.text,
              },
              "type":chartData.axis.x.type,
              "tick": {
                "fit": chartData.axis.x.tick.fit,
                "format":(chartData.title.text === "Stock Performance Vs Sentiment Score" && chartData.axis.x.type === "category")?"%y-%m-%d":d3.format(chartData.axis.x.tick.format),
                "multiline": chartData.axis.x.tick.multiline,
                "rotate": chartData.axis.x.tick.rotate,
              },
          },
          "y": {
            "label": {
                "position": chartData.axis.y.label.position,
                "text": chartData.axis.y.label.text
            },
            "tick": {
                "format": (this.props.yformat!=undefined || this.props.yformat!=null)?d3.format(this.props.yformat):d3.format(".2f"),
                "multiline": chartData.axis.y.tick.multiline,
                "outer": false
            },
          },
          "y2": {
            "label": {
                "position": chartData.axis.y2!=undefined?chartData.axis.y2.label.position:"",
                "text": chartData.axis.y2!=undefined?chartData.axis.y2.label.text:""
            },
            "show": chartData.axis.y2!=undefined?chartData.axis.y2.show:"",
            "tick": {
                "multiline": chartData.axis.y2!=undefined?chartData.axis.y2.tick.multiline:"",
                "format": (chartData.axis.y2!=undefined)?d3.format(this.props.y2format):"",
                "count": chartData.axis.y2!=undefined?chartData.axis.y2.tick.count:""
            },
          },
        },
        "bar": {
          "width": (chartData.bar.width.ratio!=undefined)?chartData.bar.width:{"ratio" : chartData.bar.width.ratio}
        },
        "color": chartData.color,
        "data": {
          "axes": {
            "overallSentiment": chartData.data.axes.overallSentiment
          },
          "columns": chartData.data.columns,
          "names":chartData.data.names,
          "type": chartData.data.type,
          "x": chartData.data.x,
          // onclick: function(d){
          //   let data={
          //     date: this.internal.config.axis_x_categories[d.x],
          //     slug: store.getState().chartObject.date.slug,
          //     symbol: $(".sb_navigation li>a.active")[0].title
          //   }
          //   let myheader = { 'Authorization': getUserDetailsOrRestart.get().userToken, 'Content-Type': 'application/json'}

          //   return fetch(API+"/api/stockdataset/"+data.slug+"/fetch_word_cloud/?symbol="+data.symbol+"&date="+data.date,{
          //     method: "get",
          //     headers: myheader,
          //   }).then(response => Promise.all([response,response.json()])).then( ([response,json]) => {
          //     if (response.status === 200){
          //       alert("fetched");
          //     }
          //     else
          //       alert("Failed to fetch");
          //   })
          // }
        },
        "grid": {
          "x":{
            "show":chartData.grid.x.show
          },
          "y":{
            "show":chartData.grid.y.show,
            "lines":(chartData.grid.y.lines===undefined)?0:
            [{
              "class": chartData.grid.y.lines[0].class,
              "position": chartData.grid.y.lines[0].position,
              "text": "",
              "value": chartData.grid.y.lines[0].value,
            }]
          }
        },
        "legend": {
          "show":chartData.legend.show
        },
        "padding": {
          "top": chartData.padding.top
        },
        "point": chartData.point != null?null:null,
        "size": { 
          "height": chartData.size.height 
        },
        "subchart":{
          show:(chartData.subchart != undefined && chartData.subchart != null)?chartData.subchart.show:false,
        },
        "title": {
          "text": (chartData.title.text!=null)?chartData.title.text:""
        },
        "tooltip":{
          "format": (chartData.tooltip!=undefined && chartData.tooltip.format!=undefined)?d3.format(chartData.tooltip.format):"",
          "show" : (chartData.tooltip!=undefined && chartData.tooltip.show!=undefined)?chartData.tooltip.show:true
        },
        "onrendered": function(){
          if(window.location.pathname.includes("automated-prediction-30vq9q5scd") && window.location.pathname.includes("/modelManagement/")){
            d3.select(this.config.bindto).select(".c3-axis-x-label").attr("y", "-30px");
            if(d3.select(this.config.bindto).select(".c3-legend-item text")[0][0] !=null){
              let y = d3.select(this.config.bindto).select(".c3-legend-item text").attr("y");
              d3.select(this.config.bindto).selectAll(".c3-legend-item").attr("transform", "translate(32,-20)");
            }
          }
        }
      }
      break;
      case "scatter":
        myData = {
          axis:{
            "x": {
              "extent":null,
              "height": chartData.axis.x.height,
              "label": {
                  "position": chartData.axis.x.label.position,
                  "text": chartData.axis.x.label.text,
              },
              "tick": {
                "format":d3.format(".2f"),
                "fit": chartData.axis.x.tick.fit,
                "multiline": chartData.axis.x.tick.multiline,
                "rotate": chartData.axis.x.tick.rotate,
              },
              "type":chartData.axis.x.type,
            },
            "y": {
              "label": {
                  "position": chartData.axis.y.label.position,
                  "text": chartData.axis.y.label.text
              },
              "tick": {
                  "format": d3.format(".2f"),
                  "multiline": chartData.axis.y.tick.multiline,
                  "outer": false
              },
            }
          },
          "bar": {
            "width": (chartData.bar.width.ratio!=undefined)?chartData.bar.width:{"ratio" : chartData.bar.width.ratio}
          },
          "color": chartData.color,
          "data": {
            "axes": {
              "difference": chartData.data.axes.difference
            },
            "columns": chartData.data.columns,
            "type": chartData.data.type,
            "x": chartData.data.x,
            "xs":chartData.data.xs,
          },
          "grid": {
            "x":{
              "show":chartData.grid.x.show
            },
            "y":{
              "show":chartData.grid.y.show,
            }
          },
          "legend": {
            "show":chartData.legend.show
          },
          "padding": {
            "top": chartData.padding.top
          },
          "point": {
            "r":chartData.point.r
          },
          "size": { 
            "height": chartData.size.height 
          },
          "subchart":{
            show:(chartData.subchart != undefined && chartData.subchart != null)?chartData.subchart.show:false,
          },
          "title": {
            "text": (chartData.title.text!=null)?chartData.title.text:""
          },

        }
        break;
    }

    if(store.getState().signals.viewChartFlag && myData.subchart !=undefined){
      myData.subchart.show = false
    }

    if (this.props.xdata) {
      if(!window.location.pathname.includes("/modelManagement/") || window.location.pathname.includes("regression-app")){
      myData.axis.x.tick.rotate=-53
      myData.axis.x.tick.multiline=true
      myData.axis.x.tick.outer = false;
      }
      let longLen = this.props.xdata.reduce((a,b) => a.length >= b.length?a:b);
      longLen = longLen.length
      if(longLen <= 5){
        myData.axis.x.height=70
        myData.axis.x.tick.width=50
      }else if(longLen < 10){
        myData.axis.x.height=90
        myData.axis.x.tick.width=60
      }else{
        myData.axis.x.height=100
        myData.axis.x.tick.width=90
      }

      let xdata = this.props.xdata;
      myData.axis.x.tick.format = function(x) {
        if (xdata[x] && xdata[x].length > 20) {
         return xdata[x].substr(0,11) + "..."+xdata[x].substr(xdata[x].length-8)
        } else {
          return xdata[x];
        } 
      }
      myData.tooltip.format.title = (d) =>{
        return xdata[d];
      }

    }else if(this.props.data.data.xs!=null || this.props.data.data.xs!=undefined){
      myData.axis.x.tick.multiline = true,
      myData.axis.x.height=80,
      myData.axis.x.tick.width=60
    }
    myData.size.height = (window.location.pathname.includes("/modelManagement/") && myData.axis!=undefined && myData.axis.y.label.text === "% Count") ? 360:myData.size.height
    myData['bindto'] = this.getChartElement().get(0);
    let chart = c3.generate(myData);
    if(myData.subchart !=undefined && myData.subchart.show=== true){
      chart.zoom([0,(this.props.xdata.length-1)/2])
      chart.element.getElementsByClassName("extent")[0].innerHTML = "<title id="+"c3BrushTip"+">Move grey section to zoom and view different part of the chart<title/>"
    }

    //Modify Chart Data for Download
    var chartDownloadData = jQuery.extend(true, {}, myData);
    if(chartDownloadData.subchart != null){
        chartDownloadData.subchart.show=false;
    }
    chartDownloadData['bindto'] = document.querySelector(".chartDownload"+this.props.classId)
    let chartDownload = c3.generate(chartDownloadData);
    
  }

  handleDocumentmodeTooltips(arr,target){
    var shortListdata=""
      for(var i=0;i<arr.length;i++){
        for(var j=0;j<arr[i].length;j++){
          for(var k=0;k<arr[i][j].cardData.length;k++){
           if(arr[i][j].cardData[k].dataType=="html"){ 
            if(arr[i][j].cardData[k].data.replace(/<[^>]*>?/gm, '').replace(/ /g,'').includes(target.replace(/ /g,''))){
            shortListdata=arr[i][j].cardData.filter(item=>item.dataType=="c3Chart")[0].data.xdata      
            }
           }
          }    
        }
      }
      return shortListdata
  } 
  render(){
    let that = this;
    window.onmouseover = function(event){

    var graphs=document.getElementsByClassName('c3-axis-y-label')
     for(var i=0;i<graphs.length;i++){
       graphs[i].classList.add("graph"+i)
       var label = d3.select(".graph"+i);
       if( label.text().length>32){
        var word1=label.text().substring(28,"");
        var word2=label.text().substring(28);
        label.text("");
        label.append("tspan").text(word1).attr("dx", graphs[i].getAttribute('dx')).attr("dy", parseFloat(graphs[i].getAttribute('dy'))-12).attr("x",graphs[i].getAttribute('x'));
        label.append("tspan").text(word2).attr("dx", graphs[i].getAttribute('dx')).attr("dy", parseFloat(graphs[i].getAttribute('dy'))+59).attr("x",graphs[i].getAttribute('x'));
       }
       
       if(graphs[i].innerHTML=="Residuals"){
        d3.selectAll('.c3')[0][i].classList.add("residual")
      }
     }

      if(event.target.tagName==="tspan" && event.target.parentElement!=null && event.target.parentElement.parentElement.getAttribute("class") === "tick" &&event.target.parentElement.parentElement.parentElement.getAttribute("class")==="c3-axis c3-axis-x"){ //isNaN(event.target.innerHTML)
        let str = that.props.xdata
        let stockData = store.getState().signals.signalAnalysis.listOfNodes;

        if(this.location.pathname.includes('signaldocumentMode') && event.target.parentElement.children.length>1){
          var selectedElement =""
          for(let i=0;i<event.target.parentElement.children.length;i++){
            selectedElement= selectedElement.concat(event.target.parentElement.children[i].innerHTML.replace(/&amp/g, "&"))
          }
          if(selectedElement.includes("...")){
           let documentModeData=store.getState().signals.documentModeConfig;
           var target=event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.previousElementSibling.innerText
           str= that.handleDocumentmodeTooltips(documentModeData,target)
          }         
        }
          if(event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstChild.innerText.includes("Influence of Key Features")){
            str=store.getState().apps.modelSummary.data.model_summary.listOfCards[3].cardData[1].data.xdata
          }
        switch(event.target.parentElement.parentElement.parentElement.parentElement.parentElement.lastChild.innerHTML){
          case "Articles by Stock": 
            str = stockData[0].listOfCards[0].cardData[1].data.xdata
            break;
          case "Top Sources":
            str = stockData[0].listOfCards[0].cardData[4].data.xdata
            break;
          case "Sentiment Score by Stocks":
            str = stockData[0].listOfCards[0].cardData[5].data.xdata
            break;
          case "Sentiment Score by Source":
              str = stockData[1].listOfNodes[0].listOfCards[0].cardData[1].data.xdata
              break;
          case "Sentiment Score by Concept":
              str = stockData[1].listOfNodes[0].listOfCards[0].cardData[2].data.xdata
              break;
          case "Feature Importance":
              str=store.getState().apps.modelSummary.data.model_summary.listOfCards[2].cardData[0].data.xdata
        }    
        let tooltip= "";
        if(str != undefined){
          str = str.map(i=>i.replace(/&amp/g, "&")) 
          for(let i=0;i<event.target.parentElement.children.length;i++){
            tooltip = tooltip.concat(event.target.parentElement.children[i].innerHTML.replace(/&amp/g, "&"))
          }

          if(tooltip.includes("...")){
            var splitWords=tooltip.split('...')
            for(let i=0;i<str.length;i++){
              if(str[i].replace(/[^A-Z0-9\&\-]/ig, "").includes(splitWords[0].replace(/[^A-Z0-9\&\-]/ig, "")) && str[i].replace(/[^A-Z0-9\&\-]/ig, "").includes(splitWords[1].replace(/[^A-Z0-9\&\-]/ig, ""))){
              tooltip = str[i]
              }
            }
          }
          else{
            
            tooltip =tooltip.includes('&lt')||tooltip.includes('&gt')? (tooltip.replace('&lt','<').replace('&gt', '>')).replace(';',''):tooltip   //.replace(/[^A-Z0-9\&\-]/ig, "")         
          for(let i=0;i<str.length;i++){
            if(str[i]==tooltip){
            tooltip = str[i]
            }
          }
        }       
        }else{
          if(event.target.parentElement.children.length>1){
            let ar=[]
            for(let i=0;i<(event.target.parentElement.children).length;i++){
              ar.push((event.target.parentElement.children)[i].innerHTML.replace(/&amp/g, "&"))
            }
            tooltip = ar.join(" ")
          }
          else if(event.target.parentElement.children.length==1){
            tooltip= event.target.parentElement.children[0].innerHTML.replace('&lt','<').replace(';',"").replace('&gt','>')
          }
        }
        
        var divi = d3.select("body").append("div").attr("class", "c3axistooltip").style("opacity", 0);
        divi.transition().duration(200).style("opacity", .9);
        divi.html(tooltip)
          .style("left",(window.event.pageX) + "px")
          .style("top", (window.event.pageY - 28) + "px"); 
      }
    }
    window.onmouseout = function(){
      if($(".c3axistooltip")[0]!=undefined){
        $(".c3axistooltip").remove()
      }
    }
    if(store.getState().signals.viewChartFlag){
      return(
        <div className={this.props.classId}></div>
      )
    }else{
      if (this.props.classId != '_side' && !this.props.widthPercent) {
        this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2  xs-mb-20";
        this.modalCls = "modal fade chart-modal" + this.props.classId;
        this.tableCls = "table-responsive table-area table" + this.props.classId;
      }
      if (that.props.tabledownload) {
        that.tableDownload = API + that.props.tabledownload;
      }
     var chartDownloadCls = "chartDownload"+this.props.classId;
      return (
        <div className="chart-area">
          <div className={this.classId} style={{margin:"10px 10px 0px 0px"}}></div>
         <div className={chartDownloadCls} style={{display:"none"}}></div>
          {(!window.location.pathname.includes("/data/") && this.props.classId != "_side") &&
          <div className="chart-data-icon">
            <div class="btn-group pull-right">
              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                <i className="fa fa-more-img" aria-hidden="true"></i>
              </button>
              <ul role="menu" class="dropdown-menu dropdown-menu-right">
                {this.props.chartInfo.length > 0
                  ? <li>
                      <a href="javascript:;" onClick={this.showStatisticalInfo.bind(this)}>
                        <i class="fa fa-info-circle" aria-hidden="true"></i>&nbsp;
                        Statistical Info</a>
                    </li>
                  : ""}
                <li>
                  <a href="javascript:;" onClick={this.openZoomChart.bind(this, true)}>
                    <i class="fa fa-search-plus" aria-hidden="true"></i>&nbsp;
                    Zoom Chart</a>
                </li>
                <li>
                  <a href="javascript:;" onClick={this.downloadSVG.bind(this)}>
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
          }
          <div className={this.modalCls} role="dialog">
            <div className="modal-colored-header uploadData modal-dialog ">
              <ViewChartData tabledata={this.props.tabledata} tableCls={this.tableCls} classId={this.props.classId} tableDownload={this.tableDownload}/>
              <ViewChart classId={this.props.classId} click={this.downloadSVG} chartData={this.props.data} xdata={this.props.xdata} yformat={this.props.yformat} y2format={this.props.y2format} tabledata={this.props.tabledata}/>
            </div>
          </div>
          {/*this.props.data.title != null && this.props.data.title.text === "Stock Performance Vs Sentiment Score" &&
            <div style={{padding:"10px"}} >Note: Hover on the graph points to view Cloud Image of respective dates</div>
          }
          {this.props.data.title != null && this.props.data.title.text === "Stock Performance Vs Sentiment Score" && !this.props.cloudImgFlag && Object.keys(this.props.cloudImgResp).length !=0 && this.props.cloudImgResp.image_url != null &&
              <img id="cloudImage" style={{ display:"block", marginLeft:"auto", marginRight: "auto"}} src={API+"/"+this.props.cloudImgResp.image_url} />
          }
          {this.props.data.title != null && this.props.data.title.text === "Stock Performance Vs Sentiment Score" && !this.props.cloudImgFlag && Object.keys(this.props.cloudImgResp).length !=0 && this.props.cloudImgResp.image_url === null &&
            <div className="error"> Cloud Image for date {this.props.cloudImgResp.date} is not available</div>
          }
          {this.props.data.title != null && this.props.data.title.text === "Stock Performance Vs Sentiment Score" && this.props.cloudImgFlag &&
            <div style={{ height: "150px", background: "#ffffff", position: 'relative' }}>
                <img className="ocrLoader" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
            </div>
        */}
        </div>
      );
    }
  }
}