import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {showZoomChart} from "../../actions/signalActions";
import renderHTML from 'react-render-html';
import { Scrollbars } from 'react-custom-scrollbars';


@connect((store) => {
    return {login_response: store.login.login_response,
        signal: store.signals.signalAnalysis,
        viewChartFlag:store.signals.viewChartFlag,
        viewChartClassId:store.signals.chartClassId,
    };
})

export class ViewChart extends React.Component {

    constructor(props){
        super(props);
    }
    openCloseZoomChart(flag){
        this.props.dispatch(showZoomChart(flag,""));
    }


    componentDidUpdate(){
        var chartData = this.props.chartData;
        if(chartData.subchart != null){
            chartData.subchart.show=true;
        }
        //chartData.axis.x.extent = null;
       // chartData.size.height = 450;
       // chartData.size.width = 2000;
       var extent=null
        var imgDetails = "c3ChartScroll"+this.props.classId;
        chartData['bindto'] = document.querySelector("."+imgDetails)
        let chart = c3.generate(chartData);

        if(chartData.subchart != null){
            chartData.subchart.show=false;
        }
        if(chartData.axis&&chartData.axis.x){
          extent=chartData.axis.x.extent
        chartData.axis.x.extent = null;
      }
       // chartData.size.height = 450;
       // chartData.size.width = 2000;
        chartData['bindto'] = document.querySelector(".c3ChartDownload"+this.props.classId)
        chart = c3.generate(chartData);
        if(chartData.subchart != null){
            chartData.subchart.show=true;
        }
        if(chartData.axis&&chartData.axis.x){
          chartData.axis.x.extent=extent
      }
    }
    shouldComponentUpdate(){

        if(store.getState().signals.chartClassId == this.props.classId)
        return true;
        else if(store.getState().signals.chartClassId == "")return true;
        else return false;
       // return true;
    }
    downloadSVGAsPNG() {
        //This is code to remove background black color in chart and ticks adjustment
      var nodeList = document.querySelector(".c3ChartDownload"+this.props.classId + ">svg").querySelectorAll('.c3-chart .c3-chart-lines path');
      var nodeList2 = document.querySelector(".c3ChartDownload"+this.props.classId+ ">svg").querySelectorAll('.c3-axis path');
      var line_graph = Array.from(nodeList);
      var x_and_y = Array.from(nodeList2); //.concat(Array.from(nodeList2));
      line_graph.forEach(function(element) {
        element.style.fill = "none";
      });
      x_and_y.forEach(function(element) {
        element.style.fill = "none";
        element.style.stroke = "black";
      });
      saveSvgAsPng(document.querySelector(".c3ChartDownload"+this.props.classId + ">svg"), "chart.png", {
        backgroundColor: "white",
        height: "500"
      });

    }
    render() {

      var imgDetails = "c3ChartScroll"+this.props.classId;
      var downloadDtls="c3ChartDownload"+this.props.classId;

        return (
                <div id="viewC3Chart">
                <Modal show={store.getState().signals.viewChartFlag} backdrop="static" onHide={this.openCloseZoomChart.bind(this,false)} dialogClassName="modal-colored-header modal-lg">
                <Modal.Header closeButton>
                <h3 className="modal-title">View Chart</h3>
                </Modal.Header>
                <Modal.Body>
    <Scrollbars className="thumb-horizontal" style={{width:850, minHeight:350,maxheight:500 }}  >


                <div className={imgDetails}>


                </div>
                <div className = {downloadDtls} style={{display:"none"}}></div>



                 </Scrollbars>
                </Modal.Body>
                <Modal.Footer>
                <Button bsStyle="primary" onClick={this.downloadSVGAsPNG.bind(this)}>Download as PNG</Button>
                </Modal.Footer>
                </Modal>
                </div>
        );
    }

}
