import React from 'react';
import { Button } from "react-bootstrap";
import { saveImagePageFlag, updateOcrImage, clearImageDetails } from '../../../actions/ocrActions';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
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
    ocrDocList: store.ocr.OcrRevwrDocsList,
    imageTaskId: store.ocr.imageTaskId,
    feedback: "",
    projectName: store.ocr.selected_project_name,
    reviewerName: store.ocr.selected_reviewer_name,
    selected_image_name: store.ocr.selected_image_name,
    is_closed: store.ocr.is_closed,
  };
})

export class OcrImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      text: "",
      imageDetail: "",
      heightLightVal: "10",
      zoom: "Reset",
      x: "",
      y: "",
    }
  }

  componentDidMount() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var OcrImg = document.getElementById("ocrImg");
    // var imgPath = this.props.imagePath;
    // var imgObj = new Image();
    // imgObj.src = imgPath;
    // OcrImg.src = this.props.ocrImgPath;
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
    if(!this.props.is_closed){
    document.getElementById("successMsg").innerText = " ";
    let canvasElem = document.getElementById("myCanvas");
    var ctx = canvasElem.getContext("2d");
    let canvasrect = canvasElem.getBoundingClientRect();
    let canvasX = event.clientX - canvasrect.left;
    let canvasY = event.clientY - canvasrect.top;
    // console.log("Coordinate x: " + canvasX, "Coordinate y: " + canvasY);
    // ctx.beginPath();
    // ctx.rect(x, y, 100, 50);
    // ctx.stroke();
    if (this.state.zoom == "Reset") {
      this.setState({x:canvasX, y:canvasY});
      this.extractText(canvasX, canvasY);
    }
    else if (this.state.zoom == "110%") {
      var xaxis = canvasX / 1.10;
      var yaxis = canvasY / 1.10;
      this.setState({x:xaxis, y:yaxis});
      this.extractText(xaxis, yaxis);
    }
    else if (this.state.zoom == "125%") {
      var xaxis = canvasX / 1.25;
      var yaxis = canvasY / 1.25;
      this.setState({x:xaxis, y:yaxis});
      this.extractText(xaxis, yaxis);
    }
    else if (this.state.zoom == "150%") {
      var xaxis = canvasX / 1.50;
      var yaxis = canvasY / 1.50;
      this.setState({x:xaxis, y:yaxis});
      this.extractText(xaxis, yaxis);
    }
    let canvasBack = document.getElementById("ocrScroll");
    let rect = canvasBack.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top - 40;
    var popOver = document.getElementById("popoverOcr");
    popOver.setAttribute("style", `position: absolute; left: ${x}px ;top:  ${y}px;display: block; z-index:99`);
  }
  else{
    bootbox.alert("This document is submitted for review so editing is restricted");   
  }
  }
  handleMarkComplete = () => {
    //window.history.go(-1)
    let id = this.props.imageTaskId;
    var data = new FormData();
    data.append("status", "reviewed");
    data.append("remark", "good");
    return fetch(API + '/ocrflow/tasks/' + id + '/', {
      method: 'post',
      headers: this.getHeaderWithoutContent(getUserDetailsOrRestart.get().userToken),
      body: data
    }).then(response => response.json())
      .then(data => {
        if (data.submitted === true) {
          this.finalAnalysis();
          bootbox.alert(statusMessages("success", "Changes have been successfully saved. Thank you for reviewing the document.", "small_mascot"));
        }
      });
  }
  handleBadScan = () => {
    //window.history.go(-1)
    let feedbackID = this.props.imageTaskId;
    var data = new FormData();
    data.append("bad_scan", this.state.feedback);
    return fetch(API + '/ocrflow/tasks/feedback/?feedbackId=' + feedbackID, {
      method: 'post',
      headers: this.getHeaderWithoutContent(getUserDetailsOrRestart.get().userToken),
      body: data
    }).then(response => response.json())
      .then(data => {
        if (data.submitted === true) {
          bootbox.alert(statusMessages("success", "Feedback submitted.", "small_mascot"));
        }
      });
  }
  finalAnalysis = () => {
    return fetch(API + '/ocr/ocrimage/final_analysis/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ 'slug': this.props.imageSlug })
    }).then(response => response.json());
  }

  closePopOver = () => {
    document.getElementById("popoverOcr").style.display = 'none';
  }
  zoomIn = () => {
    var img = document.getElementById("myCanvas");
    var originalimg = document.getElementById("originalOcrImg");
    if (this.state.zoom == "Reset") {
      img.style.width = 700 + "px";
      img.style.height = 800 + "px";
      originalimg.style.width = 700 + "px";
      originalimg.style.height = 800 + "px";
    }
    else if (this.state.zoom == "110%") {
      img.style.width = 770 + "px";
      img.style.height = 880 + "px";
      originalimg.style.width = 770 + "px";
      originalimg.style.height = 880 + "px";
    }
    else if (this.state.zoom == "125%") {
      img.style.width = 875 + "px";
      img.style.height = 1000 + "px";
      originalimg.style.width = 875 + "px";
      originalimg.style.height = 1000 + "px";
    }
    else if (this.state.zoom == "150%") {
      img.style.width = 1050 + "px";
      img.style.height = 1200 + "px";
      originalimg.style.width = 1050 + "px";
      originalimg.style.height = 1200 + "px";
    }
  }
  // zoomOut=()=>{
  //   var img = document.getElementById("myCanvas");
  //   var currWidth = img.clientWidth;
  //   if(currWidth <= 700) return false;
  //    else{
  //       img.style.width = (currWidth - 100) + "px";
  //       img.style.height= (currLength - 100) + "px";
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
      'Content-Type': 'application/json',
    }
  }

  getHeaderWithoutContent = (token) => {
    return {
      'Authorization': token,
    }
  }

  extractText = (x, y) => {
    document.getElementById("loader").classList.add("loader_ITE");
    return fetch(API + '/ocr/ocrimage/get_word/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": this.props.imageSlug, "x": x, "y": y })
    }).then(response => response.json())
      .then(data => {
        this.setState({ imageDetail: data, text: data.word });
        document.getElementById("loader").classList.remove("loader_ITE")
        document.getElementById("ocrText").value = this.state.text;
      });
    // .catch(function (error) {
    //   bootbox.alert("coordinates are not correct")
    // });
  }

  updateText = () => {
    document.getElementById("loader").classList.add("loader_ITE")
    let index = this.state.imageDetail.index;
    return fetch(API + '/ocr/ocrimage/update_word/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": this.props.imageSlug, "x": this.state.x, "y": this.state.y, "word": this.state.text })
    }).then(response => response.json())
      .then(data => {
        if (data.message === "SUCCESS") {
          this.props.dispatch(updateOcrImage(data.generated_image));
          setTimeout(() => {
            document.getElementById("loader").classList.remove("loader_ITE");
            document.getElementById("successMsg").innerText = "Updated successfully.";
          }, 3000);
          //document.getElementById("popoverOcr").style.display = 'none';
        }
      });

  }
  notClear = () => {
    document.getElementById("loader").classList.add("loader_ITE")
    let index = this.state.imageDetail.index;
    return fetch(API + '/ocr/ocrimage/not_clear/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": this.props.imageSlug, "index": index, "word": this.state.text })
    }).then(response => response.json())
      .then(data => {
        if (data.marked === true) {
          document.getElementById("loader").classList.remove("loader_ITE");
          document.getElementById("successMsg").innerText = "Not clear marked.";
        }
      });

  }

  hightlightField = () => {
    document.getElementById("confidence_loader").classList.add("loader_ITE_confidence")
    return fetch(API + '/ocr/ocrimage/confidence_filter/', {
      method: 'post',
      headers: this.getHeader(getUserDetailsOrRestart.get().userToken),
      body: JSON.stringify({ "slug": this.props.imageSlug, "filter": Number(this.state.heightLightVal) / 100, })
    }).then(response => response.json())
      .then(data => {
        if (data.message === "SUCCESS") {
          this.props.dispatch(updateOcrImage(data.generated_image));
          setTimeout(() => {
            document.getElementById("confidence_loader").classList.remove("loader_ITE_confidence")
          }, 2000);
        }
      });
  }

  handleText = (e) => {
    this.setState({ text: e.target.value });
    document.getElementById("successMsg").innerText = " ";
  }

  handleImageLoad = () => {
    document.getElementById("originalOcrImg").style.display = "block";
    document.getElementsByClassName("oLoader")[0].style.display = "none"
  }
  render() {
    let mark_text = this.props.is_closed!= true ? "Mark as complete" : "Completed";
    return (
      <div>
        <div className="row">
          <div class="col-sm-6">
            {window.location.href.includes("reviewer") ?  (<ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/reviewer/"><i class="fa fa-arrow-circle-left"></i> Reviewers</a></li>
              {((getUserDetailsOrRestart.get().userRole == "Admin") || (getUserDetailsOrRestart.get().userRole == "Superuser")) ?
              <li class="breadcrumb-item active"><a onClick={() => history.go(-1)} href="#">{this.props.reviewerName}</a></li>:""}
              <li class="breadcrumb-item active"><a style={{'cursor': 'default'}} >{this.props.selected_image_name}</a></li>
            </ol>)
              : (<ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/apps/ocr-mq44ewz7bp/project/"><i class="fa fa-arrow-circle-left"></i> Projects</a></li>
                <li class="breadcrumb-item active"><a onClick={() => history.go(-1)} href="#">{this.props.projectName}</a></li>
                <li class="breadcrumb-item active"><a style={{'cursor': 'default'}}> {this.props.selected_image_name}</a></li>
              </ol>)
            }
          </div>
          <div className="col-sm-6">
            <div class="form-group pull-right ocr_highlightblock" style={{ cursor: 'pointer' }}>
              <label class="control-label xs-mb-0" for="select_confidence" onClick={this.hightlightField}>Highlight fields with confidence less than</label>
              <select class="form-control inline-block 1-100" id="select_confidence" onChange={(e) => this.setState({ heightLightVal: e.target.value }, this.hightlightField)}>
 
                <option value="100">10</option>
                <option value="90">20</option>
                <option value="80">30</option>
                <option value="70">40</option>
                <option value="60">50</option>
                <option value="50">60</option>
                <option value="40">70</option>
                <option value="30">80</option>
                <option value="20">90</option>
                <option value="10">100</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div style={{ backgroundColor: '#fff', padding: 15 }}>
            <div className="ocrImgTitle">Original</div>
            <Scrollbars style={{ height: 820 }} id="originalImgDiv" onScroll={this.imageScroll}>
              <div>
                <img style={{ height: 800, width: 700, display: 'none' }}
                  src={this.props.originalImgPath}
                  id="originalOcrImg"
                  onLoad={(e) => this.handleImageLoad(e)}
                />
                <img className="oLoader" id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"} />
              </div>
            </Scrollbars>
          </div>
        </div>
        <div className="col-sm-6">
          <div style={{ backgroundColor: '#fff', padding: 15 }}>
            <div className="ocrImgTitle">OCR</div>
            <ul className="export" style={{ float: 'right' }} >
              <li className="dropdown">
                <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                  <span style={{ paddingRight: 10 }}>
                    <i className="fa fa-search-plus" style={{ fontSize: 15 }}></i>  Zoom
                      </span>
                  <b className="caret"></b>
                </a>
                <ul className="dropdown-menu" style={{ left: 9 }} onClick={(e) => this.setState({ zoom: e.target.text }, this.zoomIn)}>
                  <li><a role="tab" data-toggle="tab">110%</a></li>
                  <li><a role="tab" data-toggle="tab">125%</a></li>
                  <li><a role="tab" data-toggle="tab">150%</a></li>
                  <li><a role="tab" data-toggle="tab">Reset</a></li>
                </ul>
              </li>
            </ul>
            <div id="confidence_loader"></div>
            <Scrollbars id="ocrScroll" style={{ height: 820 }} onScroll={this.imageScroll}>
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
                  src={this.props.ocrImgPath}
                />
                {this.props.ocrImgPath == "" &&
                  <img id="loading" style={{ position: 'absolute', top: 0 }} src={STATIC_URL + "assets/images/Preloader_2.gif"} />
                }

              </div>
            </Scrollbars>
            <div class="popover fade top in" role="tooltip" id="popoverOcr" style={{ display: 'none' }}>
              <div class="arrow" style={{ left: '91%' }}></div>
              <h3 class="popover-title">Edit
                <span onClick={this.closePopOver} style={{ float: 'right', cursor: 'pointer' }}><i class="fa fa-close"></i></span>
              </h3>
              <div class="popover-content">
                <div id="loader"></div>
                <div className="row">
                  <div className="col-sm-9" style={{ paddingRight: 5 }}>
                    <input type="text" id="ocrText" placeholder="Enter text.." onChange={this.handleText} />
                  </div>
                  <div className="col-sm-3" style={{ paddingLeft: 0 }}>
                    <button onClick={this.updateText} ><i class="fa fa-check"></i></button>
                    <button className="dropdown-toggle" data-toggle="dropdown" aria-expanded="true" style={{ marginLeft: 2 }}>
                      <i class="fa fa-sort-down" style={{ fontSize: 15 }}></i>
                    </button>
                    <ul class="dropdown-menu" style={{ left: -110 }}>
                      <li><a href="javascript::" class="btn btn-block" onClick={this.notClear}><i class="fa fa-ban"></i> Not Clear</a></li>
                      <li><a class="btn btn-block"><i class="fa fa-external-link"></i> Properties</a></li>
                    </ul>
                  </div>
                  <div className="col-sm-12" id="successMsg" style={{ paddingTop: 5, color: '#ff8c00' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div className="row">
          {(getUserDetailsOrRestart.get().userRole == "ReviewerL1" || getUserDetailsOrRestart.get().userRole == "ReviewerL2") && this.props.is_closed != true ?
            <div class="col-sm-12 text-right" style={{ marginTop: '3%' }}>
              <ReactTooltip place="top" type="light" />
              <button class="btn btn-warning" data-toggle="modal" data-target="#modal_badscan" data-tip="Tell us if you are not happy with the output">
                <i class="fa fa-info-circle"></i> Bad Scan
          </button>
              <button class="btn btn-primary" onClick={this.handleMarkComplete}><i class="fa fa-check-circle"></i> &nbsp; {mark_text}</button>
            </div>
            :
            <div class="col-sm-12 text-right" style={{ marginTop: '3%' }}>
              <button class="btn btn-warning" disabled>
                <i class="fa fa-info-circle"></i> Bad Scan
              </button>
              <button class="btn btn-primary" disabled><i class="fa fa-check-circle"></i> &nbsp; {mark_text}</button>
            </div>
          }
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
                  <input type="text" class="form-control" id="txt_bscan" placeholder="Enter text" onChange={(e) => this.setState({ feedback: e.target.value })} />
                  <p>For technical support, please contact info@madvisor-dev.marlabs.com</p>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onClick={this.handleBadScan} data-dismiss="modal">Submit</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }

  componentWillUnmount = () => {
    this.props.dispatch(saveImagePageFlag(false));
    this.props.dispatch(clearImageDetails());
  }

}