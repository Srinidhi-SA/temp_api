import React from 'react';
import { Button } from "react-bootstrap";
import { saveImagePageFlag } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { API } from "../../../helpers/env";
import { getUserDetailsOrRestart } from "../../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';
import { store } from '../../../store';

@connect((store) => {
  return {
    imagePath: store.ocr.imagePath,
  };
})

export class OcrImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { text: "test", }
  }

  componentWillUnmount(){
    this.props.dispatch(saveImagePageFlag(false));
  }
  componentDidMount() {
    var OriginalImg = document.getElementById("originalOcrImg");
    OriginalImg.src = "https://madvisor-dev.marlabsai.com/media/ocrData/ocr.jpeg";
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var OcrImg = document.getElementById("ocrImg");
    // var imgPath = this.props.imagePath;
    // var imgObj = new Image();
    // imgObj.src = imgPath;
    console.log(this.props.imagePath);
    OcrImg.src = this.props.imagePath;
    OcrImg.onload = () => {
      // canvas.height = '800';
      // canvas.width = '700';
      // console.log(OcrImg.style.height);
      // canvas.height= OcrImg.style.height;
      // canvas.width= OcrImg.style.width;
      ctx.drawImage(OcrImg, 0, 0, 700, 800);
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
    this.updateText(canvasX, canvasY);
    // ctx.beginPath();
    // ctx.rect(x, y, 100, 50);
    // ctx.stroke();
    let canvasBack = document.getElementById("ocrScroll");
    let rect = canvasBack.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top - 40;
    var popOver = document.getElementById("popoverOcr");
    popOver.setAttribute("style", `position: absolute; left: ${x}px ;top:  ${y}px;display: block; z-index:99`);

  }
  handleImagePageFlag = () => {
    window.history.go(-1)
  }
  closePopOver = () => {
    document.getElementById("popoverOcr").style.display = 'none';
  }
  // zoomIn=()=>{
  //   var img = document.getElementById("myCanvas");
  //   var currWidth = img.clientWidth;
  //   if(currWidth >= 1500) return false;
  //    else{
  //       img.style.width = (currWidth + 100) + "px";
  //   } 
  // }
  // zoomOut=()=>{
  //   var img = document.getElementById("originalOcrImg");
  //   var currWidth = img.clientWidth;
  //   if(currWidth <= 700) return false;
  //    else{
  //       img.style.width = (currWidth - 100) + "px";
  //   } 
  // }
  imageScroll = (e) => {
    $("#originalImgDiv div").attr("id", "scrollId");
    document.getElementById("scrollId").scrollLeft = e.target.scrollLeft;
  }

  getHeader = (token) => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  }

  updateText = (x, y) => {
    return fetch(API + '/ocr/ocrimage/get_word/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": "img-uw2ii50xd9", "x": x, "y": y })
    }).then(response => response.json())
      .then(data => this.setState({ updateText: data }));
    // .catch(function (error) {
    //   bootbox.alert("coordinates are not correct")
    // });


  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div className="ocrImgTitle">Original</div>
              <Scrollbars style={{ height: 850 }} id="originalImgDiv">
                <div>
                  <img style={{ height: 800, width: 700 }}
                    id="originalOcrImg"
                  />
                </div>
              </Scrollbars>
            </div>
          </div>
          <div className="col-sm-6">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div className="ocrImgTitle">OCR</div>
              <Scrollbars id="ocrScroll" style={{ height: 850 }} onScroll={this.imageScroll}>
                <div id="popDiv">
                  {/* <span className="ocrZoom" onClick={this.zoomOut}><i class="fa fa-minus"></i></span>
                <span className="ocrZoom" onClick={this.zoomIn}><i class="fa fa-plus"></i></span>
                 */}
                  <canvas
                    onClick={this.handleCoords}
                    id="myCanvas"
                    className="ocrCanvas"
                    height="800"
                    width="700"
                  ></canvas>
                  <img style={{ height: 800, width: 700, display: 'none' }}
                    id="ocrImg"
                  />
                </div>
              </Scrollbars>
              <div class="popover fade top in" role="tooltip" id="popoverOcr" style={{ display: 'none' }}>
                <div class="arrow" style={{ left: '50%' }}></div>
                <h3 class="popover-title">Replace Text
                <span onClick={this.closePopOver} style={{ float: 'right', cursor: 'pointer' }}><i class="fa fa-close"></i></span>
                </h3>
                <div class="popover-content">
                  <div className="row">
                    <div className="col-sm-10">
                      <input type="text" value={this.state.text} />
                    </div>
                    <div className="col-sm-2" style={{ paddingLeft: 0 }}>
                      <button onClick={this.updateText} ><i class="fa fa-check"></i></button>
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

  componentWillUnmount = () => {
    this.props.dispatch(saveImagePageFlag(false));
  }

}