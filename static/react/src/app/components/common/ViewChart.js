import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {showZoomChart} from "../../actions/signalActions";
import renderHTML from 'react-render-html';
import { Scrollbars } from 'react-custom-scrollbars';
import {downloadSVGAsPNG} from '../../helpers/helper';

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
        var chartDataDownload = jQuery.extend(true, {}, chartData);
        //View chart code
        if(chartData.subchart != null){
            chartData.subchart.show=true;

        }

        var imgDetails = "c3ChartScroll"+this.props.classId;
        chartData['bindto'] = document.querySelector("."+imgDetails)
        let chart = c3.generate(chartData);
        //chart.zoom.enable(true);

        //Download Chart
        if(chartDataDownload.subchart != null){
            chartDataDownload.subchart.show=false;
        }
        if(chartDataDownload.axis&&chartDataDownload.axis.x){
            chartDataDownload.axis.x.extent = null;
            if(chartDataDownload.axis.x.tick)
            chartDataDownload.axis.x.tick.fit=true;
        }
        chartDataDownload['bindto'] = document.querySelector(".c3ChartDownload"+this.props.classId)
        let chartDownload = c3.generate(chartDataDownload);




    }
    shouldComponentUpdate(){

        if(store.getState().signals.chartClassId == this.props.classId)
            return true;
        else if(store.getState().signals.chartClassId == "")return true;
        else return false;
        // return true;
    }

    downloadSVGAsPNG(classId){
        downloadSVGAsPNG(classId)
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
                <Button bsStyle="primary" onClick={this.downloadSVGAsPNG.bind(this,downloadDtls)}>Download as PNG</Button>
                </Modal.Footer>
                </Modal>
                </div>
        );
    }

}
