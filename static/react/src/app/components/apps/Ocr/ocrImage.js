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
    this.state = {
      text: "",
      imageDetail: "",
    }
  }

  componentDidMount() {
    var OriginalImg = document.getElementById("originalOcrImg");
    OriginalImg.src = "https://madvisor-dev.marlabsai.com/media/ocrData/Invoice_page_i0CBBXq.jpg";
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var OcrImg = document.getElementById("ocrImg");
    // var imgPath = this.props.imagePath;
    // var imgObj = new Image();
    // imgObj.src = imgPath;
    OcrImg.src = this.props.imagePath;
    OcrImg.onload = () => {
      // canvas.height = '800';
      // canvas.width = '700';
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
    this.extractText(canvasX, canvasY);
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
    $("#originalImgDiv div").attr("id", "scrollOriginal");
    $("#ocrScroll div").attr("id", "scrollOcr");
    document.getElementById("scrollOriginal").scrollLeft = e.target.scrollLeft;
    document.getElementById("scrollOcr").scrollLeft = e.target.scrollLeft;
  }

  getHeader = (token) => {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  }

  extractText = (x, y) => {
    document.getElementById("ocrText").value = "";
    var slug = "img-uw2ii50xd9";
    return fetch(API + '/ocr/ocrimage/get_word/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": slug, "x": x, "y": y })
    }).then(response => response.json())
      .then(data => {
        this.setState({ imageDetail: data })
        this.setState({ text: data.word })
        document.getElementById("ocrText").value = this.state.text;
      });
    // .catch(function (error) {
    //   bootbox.alert("coordinates are not correct")
    // });


  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <button class="btn btn-warning pull-right" data-toggle="modal" data-target="#modal_badscan">
              <i class="fa fa-info-circle"></i> Bad Scan
            </button>
            <div class="form-group pull-right ocr_highlightblock">
              <label class="control-label xs-mb-0" for="select_confidence">Highlight fields with confidence less than &nbsp;&nbsp;</label>
              <select class="form-control inline-block 1-100" id="select_confidence">
                <option value="1">10</option>
                <option value="2">20</option>
                <option value="3">30</option>
                <option value="4">40</option>
                <option value="5">50</option>
                <option value="6">60</option>
                <option value="7">70</option>
                <option value="8">80</option>
                <option value="9">90</option>
                <option value="10">100</option>
              </select>
            </div>
          </div>
          <div className="col-sm-6">
            <div style={{ backgroundColor: '#fff', padding: 15 }}>
              <div className="ocrImgTitle">Original</div>
              <Scrollbars style={{ height: 850 }} id="originalImgDiv" onScroll={this.imageScroll}>
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
                <div class="arrow" style={{ left: '91%' }}></div>
                <h3 class="popover-title">Replace Text
                <span onClick={this.closePopOver} style={{ float: 'right', cursor: 'pointer' }}><i class="fa fa-close"></i></span>
                </h3>
                <div class="popover-content">
                  <div className="row">
                    <div className="col-sm-9" style={{ paddingRight: 5 }}>
                      <input type="text" id="ocrText" placeholder="Enter text.." />
                    </div>
                    <div className="col-sm-3" style={{ paddingLeft: 0 }}>
                      <button onClick={this.extractText} ><i class="fa fa-check"></i></button>
                      <button className="dropdown-toggle" data-toggle="dropdown" aria-expanded="true" style={{ marginLeft: 2 }}>
                        <i class="fa fa-sort-down" style={{ fontSize: 15 }}></i>
                      </button>
                      <ul class="dropdown-menu" style={{ left: -110 }}>
                        <li><a href="javascript::" class="btn btn-block"><i class="fa fa-ban"></i> Not Clear</a></li>
                        <li><a class="btn btn-block"><i class="fa fa-external-link"></i> Properties</a></li>
                      </ul>
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

        <div class="modal fade" id="modal_badscan" tabindex="-1" role="dialog" aria-labelledby="modal_badscan_modalTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Send feedback to the team</h4>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="txt_bscan">Tell us how would we improve?</label>
                  <input type="text" class="form-control" id="txt_bscan" placeholder="Enter text" />
                  <p>For technical support, please contact info@madvisor-dev.marlabs.com</p>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Submit</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }

  componentWillUnmount = () => {
    this.props.dispatch(saveImagePageFlag(false));
  }

}