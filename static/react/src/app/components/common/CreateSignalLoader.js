import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal, Button} from "react-bootstrap";
import {openCsLoaderModal, closeCsLoaderModal} from "../../actions/createSignalActions";
import {hideDataPreview} from "../../actions/dataActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {isEmpty, DYNAMICLOADERINTERVAL, getUserDetailsOrRestart, handleJobProcessing} from "../../helpers/helper";
import {clearCreateSignalInterval} from "../../actions/signalActions";
import {STATIC_URL} from "../../helpers/env";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    createSignalLoaderModal: store.signals.createSignalLoaderModal,
    createSignalLoaderValue: store.signals.createSignalLoaderValue,
    loaderText: store.signals.loaderText,
    signalData: store.signals.signalData,
    showHide: store.signals.showHide
  };
})

export class CreateSignalLoader extends React.Component {
  constructor(props) {
    super(props);
  }
  openModelPopup() {
    this.props.dispatch(openCsLoaderModal())
  }
  closeModelPopup() {
    this.props.dispatch(closeCsLoaderModal());
    this.props.dispatch(hideDataPreview());
    clearCreateSignalInterval();
    //this.props.dispatch(getList(getUserDetailsOrRestart.get().userToken, 1));
  }
  cancelSignalProcessing() {
    this.props.dispatch(closeCsLoaderModal());
    this.props.dispatch(hideDataPreview());
    clearCreateSignalInterval();
    handleJobProcessing(this.props.signalData.slug);
  }
  render() {
    var that = this;
    if (this.props.signalData != null) {
      setTimeout(function() {
        if (that.props.signalData.hasOwnProperty("proceed_for_loading") && !that.props.signalData.proceed_for_loading) {
          that.props.history.push("/signals");
        }
      }, DYNAMICLOADERINTERVAL)
    }

    let imgsrc_url = STATIC_URL + "assets/images/brain_loading.gif"
    //let checked=!this.props.showHide
    return (
      <div id="createSignalLoader">

        <Modal show={store.getState().signals.createSignalLoaderModal} backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">

          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <div className="panel">
                  <div className="panel-body no-border">
                    <h4 className="text-center"><br/>
                      <img src={imgsrc_url}/><br/>
                      <br/> {store.getState().signals.loaderText}
                    </h4><br/>

                    <div className="p_bar_body">
                      <progress className="prg_bar" value={store.getState().signals.createSignalLoaderValue} max={95}></progress>
                      <div className="progress-value">
                        <h3>{store.getState().signals.createSignalLoaderValue}
                          %</h3>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          {(this.props.showHide)
            ? (
              <Modal.Footer>
                <div>
                  <Link to="/signals" style={{
                    paddingRight: "10px"
                  }} onClick={this.cancelSignalProcessing.bind(this)}>
                    <Button onClick={this.closeModelPopup.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to="/signals" onClick={this.closeModelPopup.bind(this)}>
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
