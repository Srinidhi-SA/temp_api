import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Modal,Button} from "react-bootstrap";
import {showZoomChart} from "../../actions/signalActions";


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
        return (
                <div id="viewC3Chart">
                <Modal show={store.getState().signals.viewChartFlag} backdrop="static" onHide={this.openCloseZoomChart.bind(this,false)} dialogClassName="modal-colored-header">
                <Modal.Body>
                <div className="row">
                <div className="col-md-12">
                <div className="panel">
                <div className="panel-body">
                <p>Text</p>
                </div>
                </div>
                </div>
                </div>
                </Modal.Body>
                
                </Modal>
                </div>
        );
    }
    
}