import React from "react";
import {connect} from "react-redux";
import {c3Functions} from "../helpers/c3.functions";
import {Scrollbars} from 'react-custom-scrollbars';
import {API} from "../helpers/env";
import {renderC3ChartInfo} from "../helpers/helper";
import store from "../store";
import {ViewChart} from "./common/ViewChart";
import {showZoomChart} from "../actions/signalActions";

@connect((store) => {
  return {sideCardListFlag: store.signals.sideCardListFlag};
})

//var data= {}, toolData = [], toolLegend=[], chartDiv =null;
export class C3Chart extends React.Component {
  constructor(props) {

    super(props);
    console.log("yformat55555555555555");
    //this.data ={};
    //this.toolData = [];
    //this.toolLegend =[];
    //this.chartDiv = null;
    this.tableDownload = "";
    this.modalCls = "modal fade chart-modal" + props.classId;
    this.tableCls = "table-responsive table-area table" + props.classId;
    /*if($(".chart"+props.classId).html()){
            this.updateChart();
        }*/
    this.chartData = "";

    this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2 xs-mb-20";
  }

  openZoomChart(flag){
      this.props.dispatch(showZoomChart(flag,this.props.classId));
  }

  showStatisticalInfo(){
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
    } else if (this.props.widthPercent) {
      this.classId = "chart" + this.props.classId;
    }

  }
  componentDidMount() {
    //alert("did");
    $(".chart" + this.props.classId).empty();
    //this.updateChart();
    $('.chart-data-icon').css('visibility', 'hidden');

  }

  downloadSVG() {
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

  }

  updateChart() {
    var that = this;
    let data = this.props.data;
    if (this.props.sideChart) {
      console.log(data);
      data['size'] = {
        height: 230
      }
    }
    if (this.props.yformat) {
      if (data.data.type == "donut") {
        console.log("in donut")
        let formats = ['.2s', '$', '$,.2s', '.2f'];
        if (formats.indexOf(this.props.yformat) >= 0) {
          data.donut.label.format = d3.format(this.props.yformat);
        } else {
          data.donut.label.format = d3.format('');
        }
      } else if (data.data.type == "pie") {
        console.log("in pie")
        let formats = ['.2s', '$', '$,.2s', '.2f'];
        if (formats.indexOf(this.props.yformat) >= 0) {
          data.pie.label.format = d3.format(this.props.yformat);
        } else {
          data.pie.label.format = d3.format('');
        }

      } else {
        let formats = ['.2s', '$', '$,.2s', '.2f'];
        if (formats.indexOf(this.props.yformat) >= 0) {
          data.axis.y.tick.format = d3.format(this.props.yformat);
        } else {
          data.axis.y.tick.format = d3.format('');
        }

      }
    }

    if (this.props.y2format) {
      let formats = ['.2s', '$', '$,.2s', '.2f'];
      if (formats.indexOf(this.props.y2format) >= 0) {
        data.axis.y2.tick.format = d3.format(this.props.y2format);
      } else {
        data.axis.y2.tick.format = d3.format('');
      }

    }
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

      //window.tooltipFunc = data.tooltip.contents;

      data.tooltip.contents = c3Functions.set_tooltip;

      //console.log(data.tooltip.contents);
    }

    if (this.props.xdata) {
      let xdata = this.props.xdata;
      //console.log(this.props.xdata);
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

    if (data.data.type == "donut") {
      console.log("in donut tooltip")
      let formats = ['.2s', '$', '$,.2s', '.2f'];
      //  data.tooltip.format.title = function (d) { return 'Data ' + d; };
      if (formats.indexOf(data.tooltip.format.value) >= 0) {

        data.tooltip.format.value = function(value, ratio, id) {
          var format = id === 'data1'
            ? d3.format(',')
            : d3.format(data.tooltip.format.value);
          return format(value);
        }
      } else {
        data.tooltip.format.value = d3.format('');
      }
    }

    if (data.data.type == "pie") {
      console.log("in pie tooltip")
      let formats = ['.2s', '$', '$,.2s', '.2f'];
      //  data.tooltip.format.title = function (d) { return 'Data ' + d; };
      if (data.tooltip && data.tooltip.format) {
        if (formats.indexOf(data.tooltip.format.value) >= 0) {
          data.tooltip.format.value = function(value, ratio, id) {
            var format = id === 'data1'
              ? d3.format(',')
              : d3.format(data.tooltip.format.value);
            return format(value);
          }
        } else {
          data.tooltip.format.value = d3.format('');
        }
      }
    }
    this.chartData = data;
    data['bindto'] = this.getChartElement().get(0); // binding chart to html element
    console.log(data);

    let chart = c3.generate(data);
    chart.destroy();

    chart = setTimeout(function() {
      return c3.generate(data);
    }, 100);
    //c3.generate(data);

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
      //console.log(collength);
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

    //-----popup setup end------------------------------------------------

  }

  render() {
    var that = this;
    console.log(this.props);
    if (this.props.classId != '_side' && !this.props.widthPercent) {
      this.classId = "chart" + this.props.classId + " ct col-md-7 col-md-offset-2  xs-mb-20";
      this.modalCls = "modal fade chart-modal" + this.props.classId;
      this.tableCls = "table-responsive table-area table" + this.props.classId;
    }

    $(function() {

      // alert("render");
      that.updateChart();
      if (that.props.classId == '_side' || that.props.classId == '_profile') {
        $(".chart-data-icon").empty();

      }
      //alert(API + that.props.tabledownload);
      // $("#cddownload").attr("href", API + that.props.tabledownload);

    });

    if (that.props.tabledownload) {

      that.tableDownload = API + that.props.tabledownload;

    }
    //var classId = "chart"+this.props.classId + " ct col-md-8 col-md-offset-2 col-sm-8 col-sm-offset-2 xs-mb-20";

    return (
      <div className="chart-area">

        {/*<div className="row">
    <div className="chart-data-icon col-md-7 col-md-offset-2  xs-mb-20">

     </div>
     <div className="clearfix"></div>
</div>*/}
    <div className="row">
        <div className="chart-data-icon col-md-8 col-md-offset-2 xs-p-0 xs-mb-20">

                    <div class="btn-group pull-right">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i className="fa fa-more-img" aria-hidden="true" ></i></button>
                    <ul role="menu" class="dropdown-menu dropdown-menu-right">
                   {this.props.chartInfo.length > 0 ? <li>
                           <a href="javascript:;" onClick={this.showStatisticalInfo.bind(this)}><i class="fa fa-info-circle" aria-hidden="true"></i> Statistical Info</a>
                           </li>:""}
                    <li>
                    <a href="javascript:;" onClick={this.openZoomChart.bind(this,true)}><i class="fa fa-search-plus" aria-hidden="true"></i> Zoom Chart</a>
                    </li>
                    <li>
                    <a href="javascript:;" onClick={this.downloadSVG.bind(this)}><i class="fa fa-picture-o" aria-hidden="true"></i> Download as PNG</a>
                    </li>
                    <li>
                    <a href="javascript:;" onClick={this.showModal.bind(this)}><i class="fa fa-eye" aria-hidden="true"></i> View Chart Data</a>
                    </li>
                    <li>
                    <a href={this.tableDownload}><i class="fa fa-cloud-download" aria-hidden="true"></i> Download Chart Data</a>
                    </li>
                    </ul>
                    </div>


         </div>

           <div className="clearfix"></div>
           <div className={this.classId}></div>
           <div className="clearfix"></div>

     </div>
           {/* chart data Popup */}
           <div id="" className={this.modalCls} role="dialog">
           <div className="modal-colored-header uploadData modal-dialog ">

           {/*Modal content*/}
            <div className="modal-content chart-data-popup">
                <div class="modal-header">

                <button type='button' onClick={this.closeModal.bind(this)} className='close'  data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
                <h3 class="modal-title">Chart Data</h3>
                </div>

                <div className="modal-body chart-data-modal-body">
                    <div className="row" >
                    <div className="col-md-12">
                    <div className={this.tableCls} style={{backgroundColor:"white"}}>
                    <Scrollbars style={{ height: 300 }} renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{display:"none"}}/>}
        renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{display:"none"}}/>}>
                    <table className='table chart-table'>
                    </table>
                    {/*<div class="form-group col-md-7;">*/}
                    </Scrollbars>
                    </div>
                    </div>
                    </div>

                </div>

                <div class="modal-footer">
                {/*<button className="btn btn-primary" onClick={this.downloadSVG.bind(this)}><i class="fa fa-picture-o" aria-hidden="true"></i>  Download Chart</button> &nbsp;*/}
                <a href={this.tableDownload} id="cddownload" className="btn btn-primary" download ><i className="fa fa-cloud-download"></i> Download Chart Data</a>
                </div>

           </div>
          </div>
          <ViewChart classId={this.props.classId} click={this.downloadSVG}  chartData={this.props.data} />
         </div>

 </div>

      );
  }

}
