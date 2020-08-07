import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {Modal, Button} from "react-bootstrap";
import {showChartData} from "../../actions/signalActions";
import renderHTML from 'react-render-html';
import {Scrollbars} from 'react-custom-scrollbars';

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis, 
      viewChartDataFlag: store.signals.viewChartDataFlag, chartDataClassId: store.signals.chartDataClassId};
})

export class ViewChartData extends React.Component {

  constructor(props) {
    super(props);
  }
  openCloseChartData(flag) {
    this.props.dispatch(showChartData(flag, ""));
  }
  shouldComponentUpdate(){   
      if(store.getState().signals.chartDataClassId == this.props.classId) 
      return true;
      else if(store.getState().signals.chartDataClassId == "")return true;
      else return false;
  }
  render() {
    let tabledata=<div/>
    if (this.props.tabledata) {
       tabledata = this.props.tabledata;
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

    }
    var tableClass = "table chart-table"
    return (
      <div id="viewChartData">
        <Modal show={this.props.viewChartDataFlag} backdrop="static" onHide={this.openCloseChartData.bind(this, false)} dialogClassName="modal-colored-header uploadData modal-dialog">
          <Modal.Header closeButton>
            <h3 className="modal-title">Chart Data</h3>
          </Modal.Header>
          <Modal.Body>
              <div className={this.props.tableCls} style={{
                backgroundColor: "white"
              }}>
                <Scrollbars style={{
                  height: 300
                }} renderTrackHorizontal={props => <div {...props} className="track-horizontal" style={{
                  display: "none"
                }}/>} renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" style={{
                  display: "none"
                }}/>}>
                  <table className={tableClass}>{
                    (this.props.tabledata)?renderHTML(tablehtml):""}</table>
                </Scrollbars>
              </div>


          </Modal.Body>
          <Modal.Footer>
            <a href={this.props.tableDownload} id="cddownload" className="btn btn-primary" download>
              <i className="fa fa-cloud-download"></i>
              &nbsp;Download Chart Data</a>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}
