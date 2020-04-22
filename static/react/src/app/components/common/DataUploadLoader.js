import React from "react";
import {connect} from "react-redux";
import {Redirect, Link} from "react-router-dom";
import store from "../../store";
import {Modal, Button} from "react-bootstrap";
import {openDULoaderPopup, hideDULoaderPopup,hideDataPreview} from "../../actions/dataActions";
import {clearDatasetPreview} from  "../../actions/dataUploadActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {STATIC_URL} from "../../helpers/env";
import {handleJobProcessing} from "../../helpers/helper";

@connect((store) => {
  return {
    login_response: store.login.login_response,
    dataList: store.datasets.dataList,
    dataPreview: store.datasets.dataPreview,
    dataUploadLoaderModal: store.datasets.dataUploadLoaderModal,
    dULoaderValue: store.datasets.dULoaderValue,
    dataLoaderText: store.datasets.dataLoaderText,
    showHideData: store.dataUpload.showHideData,
    selectedDataSet:store.datasets.selectedDataSet,
    dataLoadedText:store.datasets.dataLoadedText
  };
})

export class DataUploadLoader extends React.Component {
  constructor() {
    super();
  }

  componentWillUpdate(){
    if(this.props.dataUploadLoaderModal){
      if(store.getState().datasets.dULoaderValue<=0 && store.getState().datasets.dataLoaderText!="" && store.getState().datasets.dataLoadedText.length===0){
        document.getElementById("loadingMsgs").innerHTML = store.getState().datasets.dataLoaderText
      }
      else if(store.getState().datasets.dULoaderValue>=0 && store.getState().datasets.dataLoaderText!="" && store.getState().datasets.dataLoadedText.length!=0){
        var loaderText = store.getState().datasets.dataLoaderText
        var array = Object.values(store.getState().datasets.dataLoadedText)
        var x = document.getElementById("loadingMsgs");
        var x1 = document.getElementById("loadingMsgs1");
        var x2 = document.getElementById("loadingMsgs2");
        
        let pos = array.indexOf(loaderText)
        if(pos<3){
          x.innerHTML = "Step 1"+ ": " + array[0];
          x1.innerHTML ="Step 2"+ ": " + array[1];
          x2.innerHTML ="Step 3"+ ": " + array[2];
        }
        else if(pos>array.length-3){
          x.innerHTML = "Step "+ (array.length-1) +": " + array[array.length-1];
          x1.innerHTML ="Step "+ (array.length-2) +": " + array[array.length-2];
          x2.innerHTML ="Step "+ (array.length-3) +": " + array[array.length-3];
        }
        else{
          x.innerHTML = "Step " + (pos-1) + ": " + array[pos-1];
          x1.innerHTML ="Step " + pos + ": " + array[pos];
          x2.innerHTML ="Step " + (pos+1) + ": " + array[pos+1];
        }
      }
    }
  }
  
  openModelPopup() {
    this.props.dispatch(openDULoaderPopup());
  }
  closeModelPopup() {
    this.props.dispatch(hideDULoaderPopup());
    clearDatasetPreview();
    this.props.dispatch(hideDataPreview());
  }
  cancelDataUpload() {
      this.props.dispatch(hideDULoaderPopup());
      this.props.dispatch(handleJobProcessing(this.props.selectedDataSet));
      this.props.dispatch(hideDataPreview());
      clearDatasetPreview();
    }

  render() {
    let img_src = STATIC_URL + "assets/images/Processing_mAdvisor.gif"
    //let checked=!this.props.showHideData
	$('#text-carousel').carousel();
    return (
      <div id="dULoader">
        <Modal show={store.getState().datasets.dataUploadLoaderModal} backdrop="static" onHide={this.closeModelPopup.bind(this)} dialogClassName="modal-colored-header">
          <Modal.Body style={{marginBottom:"0"}}>
            <div className="row">
              <div className="col-md-12">
                <div className="panel xs-mb-0 modal_bg_processing">
                  <div className="panel-body no-border xs-p-0">

					<div id="text-carousel" class="carousel slide" data-ride="carousel">

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

	<img src={img_src} className="img-responsive"/>


					<div className="modal_stepsBlock xs-p-10">
					<div className="row">
						<div className="col-sm-9">
							<p><b>mAdvisor evaluating your data set</b></p>

                                <div class="modal-steps" id="loadingMsgs">
                                Please wait while preparing data...
                                </div>
                                <div class="modal-steps active" id="loadingMsgs1">
                                </div>
                                <div class="modal-steps" id="loadingMsgs2">
                                </div>

								{/* <ul class="modal-steps hidden">
										<li>----</li>
									<li class="active">
                    {store.getState().datasets.dataLoaderText}
                  </li>
										<li>----</li>
								</ul> */}

						</div>
						<div className="col-sm-3 text-center">
							{store.getState().datasets.dULoaderValue >= 0?<h2 className="text-white">{store.getState().datasets.dULoaderValue}%</h2>:<h5 style={{display:"block", textAlign: "center" }} className="loaderValue">In Progress</h5>}
						</div>
					</div>
					</div>


				{store.getState().datasets.dULoaderValue >= 0?<div className="p_bar_body hidden">
                      <progress className="prg_bar" value={store.getState().datasets.dULoaderValue} max={95}></progress>

                      {/*<div className="progress-value">
                        <h3>{store.getState().datasets.dULoaderValue}
                          %</h3>
                      </div>*/}

                    </div>:""}
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
                  }} >
                    <Button onClick={this.cancelDataUpload.bind(this)}>Cancel</Button>
                  </Link>
                  <Link to="/data">
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
