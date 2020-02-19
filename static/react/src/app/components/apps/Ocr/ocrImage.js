import React from 'react';
import { Button } from "react-bootstrap";
import { saveImagePageFlag } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { store } from '../../../store';

@connect((store) => {
  return {
    imagePath: store.ocr.imagePath,
  };
})

export class OcrImage extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var imgPath = this.props.imagePath;
    var imgObj = new Image();
    imgObj.src = imgPath;
    imgObj.onload = () => {
      // c.height= imgObj.height;
      // c.width= imgObj.width;
      canvas.height = 800;
      canvas.width = 700;
      ctx.drawImage(imgObj, 0, 0, 700, 800);
    };
    $('[data-toggle="popover"]').popover({
      placement: 'top'
    });
  }
  handleCoords = (event) => {
    let canvasElem = document.getElementById("myCanvas");
    var ctx = canvasElem.getContext("2d");
    let canvasrect = canvasElem.getBoundingClientRect();
    let canvasX = event.clientX - canvasrect.left;
    let canvasY = event.clientY - canvasrect.top;
    console.log("Coordinate x: " + canvasX, "Coordinate y: " + canvasY);
    // ctx.beginPath();
    // ctx.rect(x, y, 100, 50);
    // ctx.stroke();
    let canvasBack = document.getElementById("popDiv");
    let rect = canvasBack.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top - 40;
    var popOver = document.getElementById("popoverOcr");
    popOver.setAttribute("style", `position: absolute; left: ${x}px ;top:  ${y}px;display: block; z-index:99`);

  }
  handleImagePageFlag = () => {
    this.props.dispatch(saveImagePageFlag(false));
  }
  closePopOver = () => {
    document.getElementById("popoverOcr").style.display = 'none';
  }
  zoomOut=()=>{

  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6 ocrImgDiv">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div style={{ overflowX: 'auto' }}>
                <div className="ocrImgTitle">Original</div>
                <img style={{ height: 800, width: 700 }}
                  id="originalOcrImg"
                  src="https://madvisor-dev.marlabsai.com/media/ocrData/ocr.jpeg"
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div style={{ overflowX: 'auto' }} id="popDiv">
                <div className="ocrImgTitle">OCR
                <span className="ocrZoom" onClick={this.zoomOut}><i class="fa fa-minus"></i></span>
                <span className="ocrZoom"><i class="fa fa-plus"></i></span>
                </div>
                <canvas
                  onClick={this.handleCoords}
                  id="myCanvas"
                  className="ocrCanvas"
                ></canvas>
                <div className="ocrbgDiv"></div>
                <div class="popover fade top in" role="tooltip" id="popoverOcr" style={{ display: 'none' }}>
                  <div class="arrow" style={{ left: '50%' }}></div>
                  <h3 class="popover-title">Replace Text
                <span onClick={this.closePopOver} style={{ float: 'right', cursor: 'pointer' }}><i class="fa fa-close"></i></span>
                  </h3>
                  <div class="popover-content">
                    <div className="row">
                      <div className="col-sm-10">
                        <input type="text" />
                      </div>
                      <div className="col-sm-2" style={{ paddingLeft: 0 }}>
                        <button ><i class="fa fa-check"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <Link to="/apps/ocr-mq44ewz7bp/project/"><Button bsStyle="primary" onClick={this.handleImagePageFlag} style={{ margin: 20 }}><i class="fa fa-close"></i> close</Button></Link>
        </div>
      </div>
    )
  }
}