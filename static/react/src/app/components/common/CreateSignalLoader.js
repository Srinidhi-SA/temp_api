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
	signalLoadedText: store.signals.signalLoadedText
  };
})

export class CreateSignalLoader extends React.Component {
  constructor(props) {
    super(props);
  }


	componentWillUpdate(){
            var getText = [];
            if((this.props.createSignalLoaderValue < 0) && (Object.keys(this.props.signalLoadedText).length <= 0) ){
                $("#loadingMsgs1").empty()
                $("#loadingMsgs2").empty()
            }
            else if((this.props.createSignalLoaderValue >= 0) && (Object.keys(this.props.signalLoadedText).length > 0) && (document.getElementById("loadingMsgs1") != null) && (document.getElementById("loadingMsgs1").innerText === "")){
                getText = Object.values(this.props.signalLoadedText)
                this.makeULSig(getText);
            }
    }





  openModelPopup() {
    this.props.dispatch(openCsLoaderModal())
  }
  closeModelPopup() {
    this.props.dispatch(closeCsLoaderModal());
    this.props.dispatch(hideDataPreview());
    clearCreateSignalInterval();
  }
  cancelSignalProcessing() {
    this.props.dispatch(closeCsLoaderModal());
    this.props.dispatch(hideDataPreview());
    clearCreateSignalInterval();
    this.props.dispatch(handleJobProcessing(this.props.signalData.slug));
  }
  makeULSig(array) {
				var x = document.getElementById("loadingMsgs");
        var x1 = document.getElementById("loadingMsgs1");
        var x2 = document.getElementById("loadingMsgs2");
        var myTimer;
        for (var i = 1; i < array.length-5; i++) {
            (function(i) {
                myTimer = setTimeout(function() {
                    x.innerHTML = "Step " + i + ": " + array[i];
                    x1.innerHTML ="Step " + (i+1) + ": " + array[i+1];
                    x2.innerHTML ="Step " + (i+2) + ": " + array[i+2];
                }, 4000 * i);
            })(i);
        }
				for(var i=array.length-5;i<array.length;i++){
					x.innerHTML = 'Please wait while analysing...';
					x1.innerHTML ='';
					x2.innerHTML ='';
				}
}
    render() {
        var that = this;
        if(this.props.signalData != null){
            setTimeout(function() {
                if(that.props.signalData.hasOwnProperty("proceed_for_loading") && !that.props.signalData.proceed_for_loading){
                    that.props.history.push("/signals");
                }
            },DYNAMICLOADERINTERVAL)}

        let imgsrc_url=STATIC_URL+"assets/images/Processing_mAdvisor.gif"
		$('#text-carousel').carousel();
        return (
                <div id="createSignalLoader">

                <Modal show={store.getState().signals.createSignalLoaderModal}  backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">

                <Modal.Body style={{marginBottom:"0"}}>


				<div className="row">
              <div className="col-md-12">
                <div className="panel xs-mb-0 modal_bg_processing">
                  <div className="panel-body no-border xs-p-0">

				<div id="text-carousel" class="carousel slide vertical" data-ride="carousel">

				<div class="row">
				<div class="col-xs-offset-1 col-xs-10">
				<div class="carousel-inner">
				<div class="item active">
				<div class="carousel-content">
					<h4 className="text-center">
					mAdvisor - Data scientist in a box
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					One click AutoML solution
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Automated AI and Machine Learning Techniques with zero manual intervention
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					User friendly interface for Business users with one click solution
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Advanced feature engineering options in analyst mode
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Build predictive models and deploy them for real-time prediction on unseen data
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Suitable for datasets of any size
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Gives you best results from multiple models
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Expandable and scalable adoption of new use cases
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					APD helps users to analyze and create data stories from large volumes of data
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Uses statistical techniques and machine learning algorithms to identify patterns within data sets
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Get insights and conclusive analysis in natural language
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Responsive visualization layer help to create intuitive analysis and bring data to life
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Import dataset from various sources and channels like, Local file system,  MySQL, MSSQL, SAP HANA, HDFS and S3
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Customer portfolio analysis using Robo-Advisor
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Insights about stock price using news article contents in Stock-Sense
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					mAdvisor Narratives for BI - automated insights engine extension for BI platforms such as Qlik Sense, Tableau, Power BI
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Narratives for BI - Translates data from charts and visualization into meaningful summaries
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Flexible deployment options - both cloud and on-premise deployments available
				</h4>
				</div>
				</div>
				<div class="item">
				<div class="carousel-content">
				   <h4 className="text-center">
					Login using your organization credentials
				</h4>
				</div>
				</div>

				</div>
				</div>
				</div>


				</div>

		<img src={imgsrc_url} className="img-responsive"/>


					<div className="modal_stepsBlock xs-p-10">
					<div className="row">
						<div className="col-sm-9">
							<p><b>mAdvisor evaluating your data set</b></p>
							<div class="modal-steps" id="loadingMsgs">
								Please wait while analysing...
							</div>
							<div class="modal-steps active" id="loadingMsgs1">
							</div>
							<div class="modal-steps" id="loadingMsgs2">
							</div>
								{/* <ul class="modal-steps"> */}
									{/*	<li>----</li>*/}
									{/* <li class="active">{store.getState().signals.loaderText}</li> */}
									{/*	<li>----</li>*/}
								{/* </ul> */}

						</div>
						<div className="col-sm-3 text-center">
							{store.getState().signals.createSignalLoaderValue >= 0?<h2 className="text-white">{store.getState().signals.createSignalLoaderValue}%</h2>:<h5 style={{display:"block", textAlign: "center" }} className="loaderValue">In Progress</h5>}

						</div>
					</div>
					</div>


                    {store.getState().signals.createSignalLoaderValue >= 0?<div className="p_bar_body hidden">
                      <progress className="prg_bar" value={store.getState().signals.createSignalLoaderValue} max={95}></progress>

                      {/*<div className="progress-value">
                        <h3>{store.getState().signals.createSignalLoaderValue}
                          %</h3>
                      </div>*/}

                    </div>:""}
                  </div>
                </div>
              </div>
            </div>










          </Modal.Body>
              <Modal.Footer>
                <div>
                  <Link to="/signals" style={{
                    paddingRight: "10px"
                  }} onClick={this.cancelSignalProcessing.bind(this)}>
                    <Button onClick={this.cancelSignalProcessing.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to="/signals" onClick={this.closeModelPopup.bind(this)}>
                    <Button bsStyle="primary" >Hide</Button>
                  </Link>
                </div>
              </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
