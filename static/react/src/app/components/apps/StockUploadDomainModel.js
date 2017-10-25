import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {
  Modal,
  Button,
  Tab,
  Row,
  Col,
  Nav,
  NavItem,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import Dropzone from 'react-dropzone'
import store from "../../store";
import $ from "jquery";
import {STATIC_URL} from "../../helpers/env";
import {capitalizeArray} from "../../helpers/helper.js";
import {updateUploadStockPopup,uploadStockFiles,triggerStockAnalysis,uploadStockFile} from "../../actions/appActions";

@connect((store) => {
  return {login_response: store.login.login_response,
		 			stockUploadDomainModal: store.apps.stockUploadDomainModal,
					stockUploadDomainFiles: store.apps.stockUploadDomainFiles,
					conceptList: store.apps.conceptList,
					stockSlug:store.apps.stockSlug,};
})

export class StockUploadDomainModel extends React.Component {

  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }

  updateUploadStockPopup(flag) {
    this.props.dispatch(updateUploadStockPopup(flag))
  }
  onDrop(files) {
    this.props.dispatch(uploadStockFiles(files))
  }

	triggerStockAnalysis(){
			this.props.dispatch(uploadStockFile(store.getState().apps.stockSlug))
		}

  render() {
    var fileName = "";
    var fileSize = "";
    if (this.props.stockUploadDomainFiles[0]) {
      fileName = this.props.stockUploadDomainFiles[0].name;
      fileSize = this.props.stockUploadDomainFiles[0].size;
		}
		let conceptRs = this.props.conceptList
    let concepts = Object.keys(conceptRs)
    var imgLink = STATIC_URL + "assets/images/m_carIcon.png"
    const conceptList = concepts.map((concept, i) => {
        let subconcepts = capitalizeArray(conceptRs[concept])
      subconcepts = subconcepts.join(", ")
      return (
        <div className="col-md-4 top20 list-boxes" key={i}>
          <div className="rep_block newCardStyle" name={concept}>
            <div className="card-header"></div>
            <div className="card-center-tile">
              <div className="row">
                <div className="col-xs-9">
                  <h4 className="title newCardTitle">
                    {concept}
                  </h4>
                </div>
                <div className="col-xs-3">
                  <img src={imgLink} className="img-responsive" alt="LOADING"/>
                 {/* <i class="fa fa-bullseye fa-4x" aria-hidden="true" style={{color:"rgba(128, 128, 128, 0.78)"}}></i>*/}
                </div>
              </div>
            </div>
            <div className="card-footer">
			<div className="xs-pt-10"></div>
              {/*<div className="left_div">
								<span className="footerTitle"></span>{story.username}
								<span className="footerTitle">{dateFormat(story.created_at, "mmm d,yyyy HH:MM")}</span>
							</div>*/}

              <div>
                {/*<!-- Popover Content link -->*/}
                <OverlayTrigger trigger="click" rootClose placement="right" overlay={< Popover id = "popover-trigger-focus" > <h4>Sub-Concepts:</h4><br/><p>{subconcepts}</p> < /Popover>}>
                  <a>
                  View Sub-Concepts
                    {/*<i className="ci pe-7s-info pe-2x"></i>*/}
                  </a>
                </OverlayTrigger>

              </div>
              {/*popover*/}

            </div>
          </div>
        </div>
      )
    });

    return (

      <div id="uploadDomainModel" role="dialog" className="modal fade modal-colored-header">
        <Modal show={store.getState().apps.stockUploadDomainModal} onHide={this.updateUploadStockPopup.bind(this, false)} dialogClassName="modal-colored-header modal-lg uploadData">
          <Modal.Header closeButton>
            <h3 className="modal-title">Concepts for Stock Performance Analysis</h3>
          </Modal.Header>
          <Modal.Body>
		  <div className="xs-p-20">
            <div className="row">
              <div className="col-md-12">
                <div className="xs-pt-20"></div>
                {/*<div className="stockDropzone">
					<Dropzone id={1} onDrop={this.onDrop} accept=".csv" >
					<p>Try dropping some files here, or click to select files to upload.</p>
					</Dropzone>
					<aside>
			          <ul className={fileName != "" ? "list-unstyled bullets_primary":"list-unstyled"}>
			            	<li>{fileName}{fileName != "" ? " - ":""}{fileSize}{fileName != "" ? " bytes ":""}</li>
			          </ul>
			        </aside>
					</div>*/}
                {conceptList}
              </div>
              {/*  <div className="col-md-2 xs-pt-20">
					<Button>Upload</Button>
					</div> */}
            </div>
          </div>
		  </Modal.Body>
          <Modal.Footer>
            {/*<Button onClick={this.updateUploadStockPopup.bind(this,false)}>Close</Button>*/}
           <Button bsStyle="primary" onClick={this.triggerStockAnalysis.bind(this,false)}>Analyse</Button>
          </Modal.Footer>
        </Modal>
      </div>


    )
  }
}
