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
    };
})

export class ViewChart extends React.Component {
    
    constructor(props){
        super(props);
    }
    openCloseZoomChart(flag){
        this.props.dispatch(showZoomChart(flag));
    }
    render() {
        var data = document.querySelector(".chart" + this.props.classId + ">svg")
       
        if(document.querySelector(".chart" + this.props.classId + ">svg")){
            //This is code to remove background black color in chart and ticks adjustment
            var nodeList = document.querySelector(".chart" + this.props.classId + ">svg").querySelectorAll('.c3-chart .c3-chart-lines path');
            //var nodeList1 = document.querySelector(".chart"+this.props.classId +">svg").querySelectorAll('.c3 line');
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
            svgAsPngUri(document.querySelector(".chart" + this.props.classId + ">svg"), {}, function(uri) {
               console.log("PNG")
               $("#idChart").attr("src",uri);
              });
        }
        return (
                <div id="viewC3Chart">
                <Modal show={store.getState().signals.viewChartFlag} backdrop="static" onHide={this.openCloseZoomChart.bind(this,false)} dialogClassName="modal-colored-header">
                <Modal.Header closeButton>
                <h3 className="modal-title">View Chart</h3>
                </Modal.Header>
                <Modal.Body>
    <Scrollbars style={{ height: 400 }} 
    className="thumb-horizontal" >
                <div className="row">
                <div className="col-md-12 text-center">
         
               <img src="" id="idChart" />
                </div>
            
                </div>
                 </Scrollbars>
                </Modal.Body>
                <Modal.Footer>
                <Button className="btn btn-primary md-close" onClick={this.openCloseZoomChart.bind(this,false)}>Close</Button>
                </Modal.Footer>
                </Modal>
                </div>
        );
    }
    
}