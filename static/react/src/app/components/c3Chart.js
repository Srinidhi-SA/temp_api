import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";
import {chartdate, fetchWordCloudImg, setCloudImageLoader, clearCloudImgResp, clearC3Date} from "../actions/chartActions";
import {Scrollbars} from 'react-custom-scrollbars';
import {API, STATIC_URL} from "../helpers/env";
import {renderC3ChartInfo,downloadSVGAsPNG} from "../helpers/helper";
import store from "../store";
import {ViewChart} from "./common/ViewChart";
import {ViewChartData} from "./common/ViewChartData";
import ReactTooltip from 'react-tooltip'
import {showZoomChart, showChartData} from "../actions/signalActions";

@connect((store) => {
  return {
    sideCardListFlag: store.signals.sideCardListFlag,
    selectedL1:store.signals.selectedL1,
    selected_signal_type:store.signals.selected_signal_type,
    selectedDate : store.chartObject.date,
    cloudImgResp : store.chartObject.cloudImgResp,
    cloudImgFlag : store.chartObject.cloudImgFlag
  };
})

export class C3Chart extends React.Component {
  constructor(props) {

    super(props);
    this.tableDownload = "";
    this.modalCls = "modal fade chart-modal" + props.classId;
    this.tableCls = "table-responsive table-area table" + props.classId;
    /*if($(".chart"+props.classId).html()){
            this.updateChart();
        }*/
    this.chartData = "";

    this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2 xs-mb-20";
  }
  
  componentWillUnmount(){
    if(Object.keys(this.props.data).length != 0)
      this.props.dispatch(clearC3Date())
    if(Object.keys(this.props.cloudImgResp).length !=0)
      this.props.dispatch(clearCloudImgResp())
  }

  componentDidUpdate(){
    let elem = document.getElementById("cloudImage")!=undefined?document.getElementById("cloudImage").parentElement:""
    elem!=""?elem.scrollIntoView(true):""
  }

  openZoomChart(flag) {
    this.props.dispatch(showZoomChart(flag, this.props.classId));
  }
  openChartData(flag) {
    this.props.dispatch(showChartData(flag, this.props.classId))
  }
  showStatisticalInfo() {
    renderC3ChartInfo(this.props.chartInfo)
  }
  getChartElement() {
    if (this.props.classId == '_side') {
      return $(".chart", this.element);
    } else if (this.props.widthPercent) {
      return $(".chart" + this.props.classId, this.element);
    }
    return $(".chart" + this.props.classId, this.element);
  }

  closeModal() { //closing the modal
    $(".chart-modal" + this.props.classId).modal('hide');
  }
  showModal() { // showing the modal

    $(".chart-modal" + this.props.classId).modal({keyboard: true, show: true});
  }

  componentWillMount() {

    if (this.props.classId == '_side') {
      this.classId = "chart";
    } else
    if (this.props.widthPercent) {
      this.classId = "chart" + this.props.classId;
    }

  }
  componentDidMount() {
    //alert("did");
    $(".chart" + this.props.classId).empty();
    //this.updateChart();
    $('.chart-data-icon').css('visibility', 'hidden');

  }

  downloadSVG(){
      downloadSVGAsPNG("chartDownload"+this.props.classId)
  }
  /*downloadSVG() {
    //This is code to remove background black color in chart and ticks adjustment
    var nodeList = document.querySelector(".chart" + this.props.classId + ">svg").querySelectorAll('.c3-chart .c3-chart-lines path');
    var nodeList2 = document.querySelector(".chart" + this.props.classId + ">svg").querySelectorAll('.c3-axis path');
    var line_graph = Array.from(nodeList);
    var x_and_y = Array.from(nodeList2); //.concat(Array.from(nodeList2));
    line_graph.forEach(function(element) {
      element.style.fill = "none";
    });
    x_and_y.forEach(function(element) {
      element.style.fill = "none";
      element.style.stroke = "black";
    });
    saveSvgAsPng(document.querySelector(".chart" + this.props.classId + ">svg"), "chart.png", {
      backgroundColor: "white",
      height: "450"
    });

  }*/

  updateChart(){
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
      {//removing logic for pie formatting >>this.props.yformat == '.4f' ? data.pie.label.format = d3.format('.4f'):data.pie.label.format = d3.format('.2s');//If the y-format from API is .4f then making format for measure is .4f only, otherwise making it to .2s}
      }else
      //below changed from 2s to 'this.props.yformat'.
      this.props.yformat == '.4f' ? data.axis.y.tick.format = d3.format('.4f'):data.axis.y.tick.format = d3.format(this.props.yformat);//If the y-format from API is .4f then making format for measure is .4f only, otherwise making it to .2s

      if (data.tooltip && data.tooltip.format){
        if(data.data.columns[0][0] == "Count" || this.props.selectedL1 == "Prediction") // setting as Integer format for the charts coming under Overview and Prediction
        data.tooltip.format.value = d3.format('');
        else if(this.props.yformat == '.4f')//If .4f is coming from API then set tooltip format is also .4f
        data.tooltip.format.value = d3.format('.4f');
        else//set tooltip format as .2f for all the formats other than .4f
        data.tooltip.format.value = d3.format(this.props.yformat);// instead of '.2f', updated to pass yformat directly
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
          return xdata[x].substr(0, 8) + "...";
        } else {
          return xdata[x];
        }
      }

      data.tooltip.format.title = (d) =>{

        if(data.title.text === "Stock Performance Vs Sentiment Score" && Object.keys(this.props.selectedDate).length !=0 && d!=0 ){
          this.props.selectedDate.date === undefined ? this.props.dispatch(chartdate("date",xdata[d])) : ""
          if(xdata[d] != this.props.selectedDate.date){
            this.props.dispatch(chartdate("date",xdata[d]))
            this.props.dispatch(clearCloudImgResp());
            this.props.dispatch(setCloudImageLoader(false));
          }

          this.props.selectedDate.symbol === undefined ?this.props.dispatch(chartdate("symbol",$(".sb_navigation li>a.active")[0].title)):""

          if($(".sb_navigation li>a.active")[0].title != this.props.selectedDate.symbol){
            this.props.dispatch(chartdate("date",""))
            this.props.dispatch(clearCloudImgResp());
            this.props.dispatch(setCloudImageLoader(false));
            this.props.dispatch(chartdate("symbol",$(".sb_navigation li>a.active")[0].title))
          }
          if(Object.keys(this.props.cloudImgResp).length ===0 && !this.props.cloudImgFlag){
            this.props.dispatch(setCloudImageLoader(true));
            this.props.dispatch(fetchWordCloudImg(this.props.selectedDate));
          }
        }
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


    //Modify Chart Data for Download
    var chartDownloadData = jQuery.extend(true, {}, data);
    if(chartDownloadData.subchart != null){
        chartDownloadData.subchart.show=false;
    }
    if(chartDownloadData.axis&&chartDownloadData.axis.x){
        chartDownloadData.axis.x.extent = null;
        if(chartDownloadData.axis.x.tick){
        chartDownloadData.axis.x.tick.fit=true;
        //for scatter chart x axis correction
        if(chartDownloadData.data.type=="scatter")
        chartDownloadData.axis.x.tick.fit=false;
      }
    }
    chartDownloadData['bindto'] = document.querySelector(".chartDownload"+this.props.classId)
    let chartDownload = c3.generate(chartDownloadData);

    //this.props.dispatch(chartObjStore(chart));

    //------------ popup setup------------------------------------------------
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
  render() {
    window.onmouseover = function(event){
        if(event.target.tagName==="tspan" && event.target.parentElement.parentElement.getAttribute("class") === "tick" && isNaN(event.target.innerHTML)){
          let str = that.props.xdata
          let stockData = store.getState().signals.signalAnalysis.listOfNodes;
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
          }
          let tooltip = event.target.innerHTML
            if(str != undefined){
              let substr = event.target.innerHTML
              for(let i=0;i<str.length;i++){
                if(str[i].includes(substr.slice(0,substr.length-3))){
                  tooltip = str[i]
                }
              }
            }else{
              if(event.target.parentElement.children.length>1){
                let ar=[]
                for(let i=0;i<(event.target.parentElement.children).length;i++){
                  ar.push((event.target.parentElement.children)[i].innerHTML)
                }
                tooltip = ar.join(" ")
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
    var that = this;
    if (this.props.classId != '_side' && !this.props.widthPercent) {
      this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2  xs-mb-20";
      this.modalCls = "modal fade chart-modal" + this.props.classId;
      this.tableCls = "table-responsive table-area table" + this.props.classId;
    }
   var chartDownloadCls = "chartDownload"+this.props.classId;
    $(function() {
      that.updateChart();
      if (that.props.classId == '_side' || that.props.classId == '_profile') {
        $(".chart-data-icon").empty();

      };

    });

    if (that.props.tabledownload) {

      that.tableDownload = API + that.props.tabledownload;

    }
    return (
      <div className="chart-area">

          {(this.props.data.subchart!=null)?
            <span>
              <ReactTooltip place="bottom" className='customeTheme' effect="solid"/>
              <i class="btn btn-default btn-graph-info fa fa-info" data-tip="Move grey section to zoom and view different part of the chart"/>
            </span>
            :""
          }
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
          <div className="clearfix"></div>
          <div className={this.classId}></div>
         <div className={chartDownloadCls} style={{display:"none"}}></div>
          <div className="clearfix"></div>


        {/* chart data Popup */}
        <div id="" className={this.modalCls} role="dialog">
          <div className="modal-colored-header uploadData modal-dialog ">

            {/*Modal content*/}
            <ViewChartData tabledata={this.props.tabledata} tableCls={this.tableCls} classId={this.props.classId} tableDownload={this.tableDownload}/>
            <ViewChart classId={this.props.classId} click={this.downloadSVG} chartData={this.props.data}/>
          </div>
        </div>
        {this.props.data.title != null && this.props.data.title.text === "Stock Performance Vs Sentiment Score" &&
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
        }
      </div>

    );
  }

}
