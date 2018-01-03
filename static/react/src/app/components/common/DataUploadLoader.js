import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {Modal, Button} from "react-bootstrap";
import {openDULoaderPopup, closeDULoaderPopup} from "../../actions/dataActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {STATIC_URL} from "../../helpers/env";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataList: store.datasets.dataList,
    dataPreview: store.datasets.dataPreview,
    dataUploadLoaderModal: store.datasets.dataUploadLoaderModal,
    dULoaderValue: store.datasets.dULoaderValue,
    dataLoaderText: store.datasets.dataLoaderText,
    showHideData: store.signals.showHideData

  };
})

export class DataUploadLoader extends React.Component {
  constructor() {
    super();
  }
  openModelPopup() {
    this.props.dispatch(openDULoaderPopup())
  }
  closeModelPopup() {
    this.props.dispatch(closeDULoaderPopup())
  }
  render() {
    let img_src = STATIC_URL + "assets/images/brain_loading.gif"
    //let checked=!this.props.showHideData
    return (
      <div id="dULoader">
        <Modal show={store.getState().datasets.dataUploadLoaderModal} backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <div className="panel">
                  <div className="panel-body no-border">
                    <h4 className="text-center"><br/>
                      <img src={img_src}/><br/>
                      <br/> {store.getState().datasets.dataLoaderText}
                    </h4><br/>

                    <div className="p_bar_body">
                      <progress className="prg_bar" value={store.getState().datasets.dULoaderValue} max={95}></progress>
                      <div className="progress-value">
                        <h3>{store.getState().datasets.dULoaderValue}
                          %</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          {(this.props.showHideData)
            ? (
              <Modal.Footer>
                <div>
                  <Link to="/data" style={{
                    paddingRight: "10px"
                  }} onClick={this.closeModelPopup.bind(this)}>
                    <Button onClick={this.closeModelPopup.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to="/data" onClick={this.closeModelPopup.bind(this)}>
                    <Button bsStyle="primary" onClick={this.closeModelPopup.bind(this)}>Hide</Button>
                  </Link>
                </div>
              </Modal.Footer>
            )
            : (
              <div></div>
            )
}

        </Modal>
      </div>
    );
  }
}
