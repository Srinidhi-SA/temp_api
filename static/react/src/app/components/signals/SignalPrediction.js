import React from "react";
import connect from "react-redux/lib/connect/connect";
import { Redirect } from "react-router-dom";
import Link from "react-router-dom/Link";
import NavLink from "react-router-dom/NavLink";
import Slider from "react-slick";
import { Card } from "./Card";
import { hideDataPreview } from "../../actions/dataActions";
import { fetchPrevNext, getLastCardOfTree, getPrevNext } from "../../helpers/processStory";
import { modifyMaxDepth3, modifyMaxDepth4, modifyMaxDepth5, modifyMaxDepthConfig, saveMaxDepthValues } from "../../actions/signalActions";

@connect((store)=>{
  return{
    signal: store.signals.signalAnalysis, 
  }
})

export default class SignalPrediction extends React.Component{
  constructor(props){
    super(props);
    this.nextRedirectPred = null;
  }

  componentDidUpdate(){
    var that = this;
    $(function() {
      let index = $(".sb_navigation li>a.active").parent().index();
      if(index!=-1){
        if(index>5)
          that.refs.slider.slickGoTo(index-5);
        else
          that.refs.slider.slickGoTo(0);
        }
    });
  }

  closeDocumentMode() {
    this.props.dispatch(hideDataPreview()); 
    window.location.pathname = "/signals"
  }

  fetchMaxDepthCard(node){
    return node.listOfCards[0];
  }

  prevNext(path,sigData) {
    let currentSuffix = path;
    var tokens = currentSuffix.split("/").slice(3);
    currentSuffix = tokens.join("/");
    let expectedURL = getPrevNext(sigData, currentSuffix);
    return expectedURL;
  }

  render(){
    let varList = [], varArray = [];
    var settings = {dots: false,infinite: false,speed: 5,slidesToShow: 6,slidesToScroll: 1,className:"overViewSlider"};
    let ovProps = this.props.ovProps;
    let params = ovProps.match.params;
    let tabList = [];
    let predNodes = this.props.signal.listOfNodes.filter(i=>i.name==="Prediction")[0];
    let card = null;
    let cardLink = ""
    let cardId = ""

    if (this.props.signal.listOfNodes && this.props.signal.listOfNodes.length != 0) {
      tabList = this.props.signal.listOfNodes.map((tab, i) => {
        let selectedLink = ""
        if(tab.name === "Prediction"){
          selectedLink = ovProps.urlPrefix + "/" + params.slug + "/" + tab.slug + "/" + "slug_maxdepth3" ;
        }else{
          selectedLink = ovProps.urlPrefix + "/" + params.slug + "/" + tab.slug;
        }
        let classname1 = "mAd_icons tab_" + tab.name.toLowerCase();
        return (
          <li key={i}>
          <NavLink to={selectedLink}>
              <i className={classname1}></i>
              <span>{tab.name}</span>
            </NavLink>
          </li>
        )
      });
    }

    // if(Object.keys(params).length<3){
    //   continue
    // }else{
      for(let i=0;i<Object.keys(predNodes).length;i++){
        if(Object.keys(predNodes)[i].includes("Depth Of Tree")){
          varArray = predNodes[Object.keys(predNodes)[i]].listOfCards.map((variable) => {
            let selectedl2Link = ovProps.urlPrefix + "/" + params.slug + "/" + predNodes.slug + "/" + predNodes[Object.keys(predNodes)[i]].slug ;
            let l2Class = "mAd_icons ic_perf"
            return (
              <li key={i}>
                <NavLink to={selectedl2Link} title={variable.name}>
                  <i className={l2Class}></i>
                  <span id={predNodes[Object.keys(predNodes)[i]].slug}>{Object.keys(predNodes)[i]}</span>
                </NavLink>
              </li>
            )
          });
          varList.push(varArray[0]);
        }
      }
    // }


    if(Object.keys(params).length <= 3) {
      for(let i=0;i<Object.keys(predNodes).length;i++){
        if(predNodes[Object.keys(predNodes)[i]].listOfCards!=undefined && predNodes[Object.keys(predNodes)[i]].slug === params.l2){
          card = this.fetchMaxDepthCard(predNodes[Object.keys(predNodes)[i]]);
          card.cardData.filter(i=>i.data.tableType==="popupDecisionTreeTable")[0].data["name"] = Object.keys(predNodes)[i];
          cardLink = ovProps.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + predNodes[Object.keys(predNodes)[i]].slug;
        }
      }
    }
    let lastcard = getLastCardOfTree(this.props.signal)
    let documentModeLink = "";
    if (ovProps.urlPrefix.indexOf("signals") != -1) {
      documentModeLink = "/signaldocumentMode/" + ovProps.match.params.slug;
    }

    let expectedURL_P = this.prevNext(window.location.pathname,this.props.signal);
    let prevUrl_P = ovProps.urlPrefix+"/"+ovProps.match.params.slug+"/"+expectedURL_P.prev;
    let nextUrl_N = ovProps.urlPrefix+"/"+ovProps.match.params.slug+"/"+expectedURL_P.next;
    this.nextRedirectPred = nextUrl_N;

    return(
      <div className="side-body">		 
      <div className="page-head overViewHead">
        <div class="col-md-12">
        <h3 className="xs-mt-0 xs-mb-0"> {this.props.signal.name}
          <div className="btn-toolbar pull-right">
            <div className="btn-group summaryIcons">
              <button type="button" className="btn btn-default" disabled="true" title="Card mode">
                <i class="zmdi zmdi-hc-lg zmdi-view-carousel"></i>
              </button>
              <Link className="btn btn-default continue" to={{
                pathname:documentModeLink,
                state:{
                  lastVar : lastcard.slug
                }
              }} title="Document mode">
                <i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
              </Link>
              <button type="button" className="btn btn-default" onClick={this.closeDocumentMode.bind(this)}>
                <i class="zmdi zmdi-hc-lg zmdi-close"></i>
              </button>
            </div>
          </div>
        </h3>
        </div>
        <div class="clearfix"></div>
      </div>
      <div className="main-content">
        <div className="row">
          <div className="col-md-12">
            <div className="clearfix"></div>
            <div className="panel panel-mAd box-shadow" data-wow-duration="1s" data-wow-delay="1s" style={{marginTop:"55px"}}>
              <div className="panel-heading"></div>
                <div className="panel-body no-border">
                  <div className="card full-width-tabs">
                    <ul className="nav nav-tabs" id="guide-tabs" role="tablist">
                      {tabList}
                    </ul>
                    <div className="tab-content">
                      { varList!=null &&
                      <div className="sb_navigation">
                        <div id="subTab" style={{paddingTop:"15px"}}>
                        <Slider ref='slider' {...settings}>{varList}</Slider>
                        </div>
                        <div className="clearfix"></div>
                      </div>}
                      <div className="content_scroll container-fluid">
                        <div className="row">
                          <div className="col-xs-12 content ov_card_boxes">
                            <Card cardData={card.cardData} cardWidth={card.cardWidth} cardId={cardId} />
                          </div>
                          <div className="clearfix"></div>
                        </div>
                      </div>
                      <Link className="tabs-control left grp_legends_green back" to={prevUrl_P}>
                        <span className="fa fa-chevron-left"></span>
                      </Link>
                      <Link /*onClick={this.redirectPredPush.bind(nextUrl_N)}*/ className="tabs-control right grp_legends_green continue" to={{
                        pathname:nextUrl_N,
                        state:{
                          lastVar:lastcard.slug
                        }
                      }}>
                        <span className="fa fa-chevron-right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}