import React from 'react';
import { Button } from "react-bootstrap";
import { saveImagePageFlag } from '../../actions/ocrActions';
import { connect } from "react-redux";
import { store } from '../../store'

@connect((store) => {
  return {
  };
})

export class OcrImage extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var imgPath = "https://madvisor-dev.marlabsai.com/media/ocrData/ocr.jpeg";
    var imgObj = new Image();
    imgObj.src = imgPath;
    imgObj.onload = () => {
      // c.height= imgObj.height;
      // c.width= imgObj.width;
      canvas.height = 700;
      canvas.width = 660;
      ctx.drawImage(imgObj, 0, 0, 660, 700);
    };
    $('[data-toggle="popover"]').popover({
      placement: 'top'
    });
  }
  handleCoords = (event) => {
    let elem = document.getElementById("myCanvas");
    var ctx = elem.getContext("2d");
    let rect = elem.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let pointX = x - 179;
    let pointY = y - 25;
    console.log("Coordinate x: " + x, "Coordinate y: " + y);
    console.log("Coordinate x: " + pointX, "Coordinate y: " + pointY);
    // ctx.beginPath();
    // ctx.rect(x, y, 100, 50);
    // ctx.stroke();

    var popOver = document.getElementById("popoverOcr");
    popOver.setAttribute("style", `position: absolute; left: ${x}px ;top:  ${y}px;display: block; z-index:99`);

  }
  handleImagePageFlag = () => {
    this.props.dispatch(saveImagePageFlag(false));
  }
  closePopOver = () => {
    document.getElementById("popoverOcr").style.display = 'none';
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-5 ocrImgDiv">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div className="ocrImgTitle">Original</div>
              <img
                id="originalOcrImg"
                src="https://i.picsum.photos/id/993/500/500.jpg"
              />
            </div>
          </div>
          <div className="col-sm-7">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div className="ocrImgTitle">OCR</div>
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
        <div className="row">
          <Button bsStyle="primary" onClick={this.handleImagePageFlag} style={{ margin: 20 }}><i class="fa fa-close"></i> close</Button>
        </div>
      </div>
    )
  }
}