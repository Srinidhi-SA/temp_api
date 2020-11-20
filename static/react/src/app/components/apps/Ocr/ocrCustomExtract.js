import React from 'react';
import { saveImagePageFlag, updateOcrImage, clearImageDetails, closeFlag, setProjectTabLoaderFlag, tabActiveVal } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { API } from "../../../helpers/env";
import { getUserDetailsOrRestart, statusMessages } from "../../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';
import { STATIC_URL } from '../../../helpers/env';
import { store } from '../../../store';
import ReactTooltip from 'react-tooltip';

@connect((store) => {
  return {
    ocrImgPath: store.ocr.ocrImgPath,
    originalImgPath: store.ocr.originalImgPath,
    imageSlug: store.ocr.imageSlug,
    ocrImgHeight: store.ocr.ocrImgHeight,
    ocrImgWidth: store.ocr.ocrImgWidth,
  };
})

export class OcrCustomExtract extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      drag: false,
      rect: {},
      endX: "",
      endY: "",
      dragText: "",
      imageDetails: "",
    }
  }

  componentDidMount() {
    var canvas = document.getElementById("ocrCanvas");
    var ctx = canvas.getContext("2d");
    var OcrImg = document.getElementById("customImg");
    OcrImg.onload = () => {
      ctx.canvas.height = this.props.ocrImgHeight;
      ctx.canvas.width = this.props.ocrImgWidth;
      ctx.drawImage(OcrImg, 0, 0, this.props.ocrImgWidth, this.props.ocrImgHeight);
    };
    canvas.addEventListener('mousedown', this.mouseDown, false);
    canvas.addEventListener('mouseup', this.mouseUp, false);
    canvas.addEventListener('mousemove', this.mouseMove, false);
  }

  mouseDown = (e) => {
    var canvas = document.getElementById("ocrCanvas");
    let canvasrect = canvas.getBoundingClientRect();
    this.state.rect.startX = e.clientX - canvasrect.left;
    this.state.rect.startY = e.clientY - canvasrect.top;
    this.setState({ drag: true });
  }

  mouseUp = (e) => {
    this.setState({ drag: false });
    var OcrImg = document.getElementById("customImg");
    let canvas = document.getElementById("ocrCanvas");
    let canvasrect = canvas.getBoundingClientRect();
    var ctx = canvas.getContext("2d");
    let canvasX = event.clientX - canvasrect.left;
    let canvasY = event.clientY - canvasrect.top;
    this.setState({ endX: canvasX, endY: canvasY });
    let p1 = [];
    p1.push(this.state.rect.startX, this.state.rect.startY);
    let p2 = [];
    p2.push(this.state.endX, this.state.endY);
    var offset = $("#customScroll").offset();
    var X1 = (e.pageX - offset.left);
    var Y1 = (e.pageY - offset.top);
    var dialog = document.getElementById("labelDialog");
    if (p1.toString() != p2.toString()) {
      dialog.setAttribute("style", `position: absolute; left: ${X1}px ;top:  ${Y1}px;display: block; z-index:99`);
      this.getTextLabel(p1, p2);
    }
    else if(p1.toString() === p2.toString()){
      ctx.clearRect(0, 0, this.props.ocrImgWidth, this.props.ocrImgHeight);
      ctx.drawImage(OcrImg, 0, 0, this.props.ocrImgWidth, this.props.ocrImgHeight);
      document.getElementById("labelDialog").style.display = 'none';
    }
  }

  mouseMove = (e) => {
    var OcrImg = document.getElementById("customImg");
    var canvas = document.getElementById("ocrCanvas");
    let canvasrect = canvas.getBoundingClientRect();
    var ctx = canvas.getContext("2d");
    if (this.state.drag) {
      ctx.clearRect(0, 0, this.props.ocrImgWidth, this.props.ocrImgHeight);
      ctx.drawImage(OcrImg, 0, 0, this.props.ocrImgWidth, this.props.ocrImgHeight);
      this.state.rect.w = (e.clientX - canvasrect.left) - this.state.rect.startX;
      this.state.rect.h = (e.clientY - canvasrect.top) - this.state.rect.startY;
      ctx.strokeStyle = '#2a93ff';
      // ctx.fillStyle = 'yellow';
      // ctx.fill();
      ctx.strokeRect(this.state.rect.startX, this.state.rect.startY, this.state.rect.w, this.state.rect.h);
    }
  }

  closeDialog = () => {
    document.getElementById("labelDialog").style.display = 'none';
  }

  getHeader = (token) => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json',
    }
  }

  getTextLabel = (p1, p2) => {
    return fetch(API + '/ocr/ocrimage/get_word_custom/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": this.props.imageSlug, "p1": p1, "p3": p2 })
    }).then(response => response.json())
      .then(data => {
        this.setState({ imageDetails: data, dragText: data.data });
        document.getElementById("loader").classList.remove("loader_ITE")
        document.getElementById("dragText").value = this.state.dragText;
      });
  }
  render() {
    return (
      <div className="row">
        <div className="col-sm-6">
          <div style={{ backgroundColor: '#fff', padding: 15 }}>
            <Scrollbars style={{ height: 700 }} id="customScroll">
              <canvas
                onClick={this.handleCoords}
                id="ocrCanvas"
              ></canvas>

              <img style={{ display: 'none' }}
                id="customImg"
                src={this.props.ocrImgPath}
              />
            </Scrollbars>
          </div>

          <div class="popover fade top in" role="tooltip" id="labelDialog" style={{ display: 'none' }}>
            <span onClick={this.closeDialog} style={{ float: 'right', cursor: 'pointer', color: '#3a988c', paddingRight: 10, paddingTop: 5 }}><i class="fa fa-close"></i></span>
            <div class="popover-content">
              <div id="loader"></div>
              <div className="row">
                <div className="col-sm-12">
                  <div class="form-group">
                    <label for="projectName" class="form-label">Text</label>
                    <Scrollbars style={{ height: 95 }} >
                    <textarea rows="4" className="form-control" type="text" id="dragText" style={{fontSize:14}}/>
                    </Scrollbars>
                  </div>
                </div>
                <div className="col-sm-12">
                  <div class="form-group">
                    <label for="projectType" class="form-label">Label</label>
                    <select id="projectType" class="form-control">
                      <option>Name</option>
                      <option>Address</option>
                      <option>Contact</option>
                      <option>Age</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-12">
                  <button className="btn-primary" style={{padding:'5px 10px',float:'right',border:'none'}}>SAVE</button>
                </div>
                <div className="col-sm-12" id="successMsg" style={{ paddingTop: 5, color: '#ff8c00' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



}