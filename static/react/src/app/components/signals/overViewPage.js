import React from "react";
import {Redirect, Link, NavLink} from "react-router-dom";
import {
  getFirstCard,
  fetchCard,
  fetchNodeFromTree,
  getPrevNext,
  getLastCardOfTree
} from "../../helpers/processStory";
import {connect} from "react-redux";
import {isEmpty, subTreeSetting, getUserDetailsOrRestart} from "../../helpers/helper";
import {Card} from "./Card";
import store from "../../store";
import {getSignalAnalysis, updateselectedL1} from "../../actions/signalActions";
import {STATIC_URL,API} from "../../helpers/env.js"
import Slider from "react-slick";
import {getRoboDataset, getStockAnalysis,getScoreSummaryInCSV,uploadStockAnalysisFlag, setLoaderFlagAction} from "../../actions/appActions";
import {hideDataPreview} from "../../actions/dataActions";
import {AppsStockDataPreview} from "../apps/AppsStockDataPreview";
import { chartdate } from "../../actions/chartActions";
import SignalPrediction from "./SignalPrediction";

@connect((store) => {
  return {signal: store.signals.signalAnalysis, urlPrefix: store.signals.urlPrefix, customerDataset_slug: store.apps.customerDataset_slug};
})

export class OverViewPage extends React.Component {
  constructor(props) {
    super(props);
    this.nextRedirect = null;
    this.showSubTree = false;
    this.l1Name = "";
    this.state={
      showStockSenceDataPreview:false,
      loading:true
    }
  }

  componentWillMount() {
    if (isEmpty(this.props.signal)) {
      if (this.props.match.url.indexOf("apps-robo") != -1) {
        this.props.dispatch(getRoboDataset(this.props.match.params.slug));
      } else if (this.props.match.url.indexOf("apps-stock") != -1) {
        this.props.dispatch(getStockAnalysis(this.props.match.params.slug));
      }
      else {
        this.props.dispatch(getSignalAnalysis(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
      }
    }
  }
  componentDidMount() {
     this.setTime = setTimeout(() => { 
      this.setState({ loading: false });       
    }, 0);  
  }
  componentDidUpdate(){
  if(this.props.match.params.l1.includes("prediction")){
    this.props.dispatch(updateselectedL1("Prediction"))
  }else{
    this.props.dispatch(updateselectedL1(this.l1Name))
  }
  if(!this.props.match.params.l1.includes("prediction")){
    var that = this;
    $(function() {
      let index = $(".sb_navigation li>a.active").parent().index();
      if(index!=-1){
      if(index>5)
      that.refs.slider.slickGoTo(index-5);
      else {
        that.refs.slider.slickGoTo(0);
      }}
    });
  }
}
  componentWillUnmount = () => {            
    clearTimeout(this.setTime);    
    this.props.dispatch(setLoaderFlagAction(true))  
}; 


  prevNext(path,sigData) {
    let currentSuffix = path;
    var delimiter = "/";
    var tokens = currentSuffix.split(delimiter).slice(3);
    currentSuffix = tokens.join(delimiter);
    let expectedURL = getPrevNext(sigData, currentSuffix);
    return expectedURL;
  }
  redirectPush(url) {
    this.props.history.push(url);
  }
  showStockSenceDataPreview(){
    this.setState({showStockSenceDataPreview:!this.state.showStockSenceDataPreview})
  }
  closeDocumentMode() {
    this.props.dispatch(hideDataPreview()); 
    if(this.props.match.url.indexOf("apps-robo") != -1)
      this.props.history.push("/apps-robo")
    else if (this.props.match.url.indexOf("apps-stock") != -1){
      this.props.dispatch(uploadStockAnalysisFlag(false))
      this.props.history.push("/apps-stock-advisor")
    }else
      window.location.pathname = "/signals"
  }
  gotoScoreData(){
    this.props.dispatch(getScoreSummaryInCSV(store.getState().apps.scoreSlug))
  }

  render() {
    var that = this;
    that.urlPrefix = "/signals";
    let breadcrumb_label = "Signals";
    let storyName = ""
    if (this.props.urlPrefix) {
      that.urlPrefix = this.props.urlPrefix;
      storyName = this.props.signal.name;
      if (this.props.urlPrefix != "/signals") {
        breadcrumb_label = that.urlPrefix;
        storyName = this.props.signal.name
      }
    }

    var settings = {
      dots: false,
      infinite: false,
      speed: 5,
      slidesToShow: 6,
      slidesToScroll: 1,
      className:"overViewSlider",
    };
    const { loading } = this.state;
    if(loading && isEmpty(this.props.signal)) { // if your component doesn't have to wait for an async action, remove this block 
      return (
        <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
      );
    }else{
      if(isEmpty(this.props.signal)) {
        return (
          <div className="side-body">
            <div className="page-head">
              <div class="row">
                <div class="col-md-12"></div>
                <div class="col-md-8">
                  <h2>{storyName}</h2>
                </div>
              </div>
              <div class="clearfix"></div>
            </div>
            <div className="main-content">
              <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
            </div>
          </div>
        );
      } else {
        let regression_app=false;
        let stock_sense_app = false;
        if(that.urlPrefix.indexOf("/apps-stock-advisor") != -1)
          stock_sense_app=true;
        if ((stock_sense_app) && !this.props.match.params.l1) {
          var url=that.urlPrefix+"/"+this.props.match.params.slug+"/"+this.props.signal.listOfNodes[0].slug
         return(<Redirect to ={url}/>)
        }
        
        let urlSplit = this.props.location.pathname.split("/");
        let tabList = null;
        let varList = null;
        let cardList = null;
        let card = null;
        let node = null
        let params = this.props.match.params;
        this.props.dispatch(chartdate("slug",this.props.match.params.slug))
        tabList = [];
        if (this.props.signal.listOfNodes && this.props.signal.listOfNodes.length != 0) {
          tabList = this.props.signal.listOfNodes.map((tab, i) => {
            let selectedLink = ""
            if(tab.name === "Prediction" && tab.listOfCards===undefined){
              selectedLink = that.urlPrefix + "/" + params.slug + "/" + tab.slug + "/" + "slug_maxdepth3";
            }else{
              selectedLink = that.urlPrefix + "/" + params.slug + "/" + tab.slug;
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
        var cloneSigData = JSON.parse(JSON.stringify(this.props.signal));

        if(params.l1.includes("prediction") && this.props.signal.listOfNodes.filter(i=>i.name==="Prediction")[0]["Depth Of Tree 3"]!=undefined){
          let predictionTab = ""
          predictionTab = <SignalPrediction ovProps={this.props}/>
          return predictionTab;
        }else{
          if(this.props.signal.listOfNodes.filter(i=>i.name==="Prediction")!=undefined && this.props.signal.listOfNodes.filter(i=>i.name==="Prediction")[0]["Depth Of Tree 3"]!=undefined){
            let dt = cloneSigData.listOfNodes.filter(i=>i.name!="Prediction")
            cloneSigData.listOfNodes = dt
          }

        if (Object.keys(params).length < 3) {
          card = getFirstCard(cloneSigData, params.l1);
          let cardLink = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + card.slug;
          node  = fetchNodeFromTree(params.l1, cloneSigData)
          if(node.listOfCards.length==0){
            if(node.listOfNodes.length>0){
              let level2 = node.listOfNodes[0].slug
              cardLink = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/"+ level2+"/"+ card.slug
            }
          }
          return (<Redirect to={cardLink}/>);
        }else {
          card = fetchCard(params, cloneSigData);
          if (params.l3 && params.l3 == "$") {
            let cardLink = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + params.l2 + "/" + card.slug;
            return (<Redirect to={cardLink}/>);
          }
        }

        var l1Name = params.l1;
        if (params.l1) {
          var selectedNodeFromLevel1 = fetchNodeFromTree(params.l1, cloneSigData);
          l1Name = selectedNodeFromLevel1.name;
          this.l1Name = l1Name
          if (!isEmpty(selectedNodeFromLevel1) && selectedNodeFromLevel1.listOfNodes.length > 0) {
            varList = selectedNodeFromLevel1.listOfNodes.map((variable, i) => {
              let selectedl2Link = that.urlPrefix + "/" + params.slug + "/" + selectedNodeFromLevel1.slug + "/" + variable.slug + "/$";
              let l2Class = "mAd_icons ic_perf"
              if (l1Name == "Influencers")
                l2Class = "mAd_icons ic_measure"
              return (
                <li key={i}>
                  <NavLink to={selectedl2Link} title={variable.name}>
                    <i className={l2Class}></i>
                    <span id={variable.slug}>{variable.name}</span>
                  </NavLink>
                </li>
              )
            });
            that.showSubTree = true;
          }
        }

        let selectedNode = null;
        let selectedNode_slug = null;
        let selectedURL = ""
        let hideListOfAnalysis = true;
        if (Object.keys(params).length == 3) {
          selectedNode_slug = params.l1;
          selectedURL = that.urlPrefix + "/" + params.slug + "/" + params.l1;
        } else {
          selectedNode_slug = params.l2;
          selectedURL = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + params.l2;
        }
       
        selectedNode = fetchNodeFromTree(selectedNode_slug, cloneSigData);
        if(selectedNode.listOfCards.length!=1) {
          hideListOfAnalysis = false;
          cardList = selectedNode.listOfCards.map((card, i) => {
            let selectedLink = selectedURL + "/" + card.slug;
            return (
              <li key={i}><NavLink to={selectedLink} key={i} className="list-group-item" title={card.name}>
                <i className="fa fa-bar-chart"></i>
                <span>{card.name}</span>
              </NavLink></li>
            )
          });
        }
        let documentModeLink = "";
        if (that.urlPrefix.indexOf("signals") != -1) {
          documentModeLink = "/signaldocumentMode/" + this.props.match.params.slug;
        } else if (that.urlPrefix.indexOf("stock") != -1) {
          documentModeLink = "/apps-stock-document-mode/"+this.props.match.params.slug;
        } else {
          documentModeLink = "/apps-robo-document-mode/" + this.props.match.params.slug;
        }

        let expectedURL = this.prevNext(this.props.location.pathname,this.props.signal);
        let prevURL = that.urlPrefix + "/" + this.props.match.params.slug + "/" + expectedURL.prev;
        let nextURL = that.urlPrefix + "/" + this.props.match.params.slug + "/" + expectedURL.next;
        this.nextRedirect = nextURL;
     
        if (expectedURL.prev == null) {
          if (cloneSigData.listOfCards.length > 0) {
            if (cloneSigData.listOfCards[0].slug) {
              prevURL = that.urlPrefix + "/" + this.props.match.params.slug;
            }
          }else {
            prevURL = that.urlPrefix;
          }
        } else {
          if (cloneSigData.listOfCards.length > 0) {
            if (expectedURL.prev == cloneSigData.listOfCards[0].slug) {
              prevURL = that.urlPrefix + "/" + this.props.match.params.slug;
            }
          }else {
            if(!regression_app && !stock_sense_app)
            prevURL = that.urlPrefix;
          }
        }
      
        if (expectedURL.next == null) {
          nextURL = documentModeLink;
        }

        let lastcard = getLastCardOfTree(cloneSigData);
        let nameLink = that.urlPrefix + "/" + this.props.match.params.slug;
        if (that.urlPrefix == "/apps-robo") {
          nameLink = that.urlPrefix + "-list" + "/" + this.props.match.params.slug + "/customer" + "/data/" + store.getState().apps.customerDataset_slug;
        } else if (that.urlPrefix == "/apps-stock-advisor") {
          nameLink = that.urlPrefix + "/" + this.props.match.params.slug + "/" + params.l1;
        }

        let classname=".sb_navigation #subTab i.mAd_icons.ic_perf ~ span"
        if(l1Name=="Influencers")
          classname=".sb_navigation #subTab i.mAd_icons.ic_measure ~ span"
        subTreeSetting(urlSplit.length, 6, that.props.match.params.l2,classname); // setting of subtree and active classes
        return (
          <div>
            {this.state.showStockSenceDataPreview?
            <AppsStockDataPreview  history={this.props.history} match={this.props.match} showPreview={true} updatePreviewState={this.showStockSenceDataPreview.bind(this)}/>
            :
            <div className="side-body">		 
              <div className="page-head overViewHead">
                <div class="col-md-12">
                  <h3 className="xs-mt-0 xs-mb-0"> {storyName}
                    <div className="btn-toolbar pull-right">
                      <div className="btn-group summaryIcons">
                        <div className={"btn btn-default sticky-container hidden-xs " +(hideListOfAnalysis?"hidden":"")} id="sticky-container">
                          <button type="button" data-toggle="dropdown" class="btn btn-primary btn-round btn-xs" title="List of Analysis">
                            <i class="fa fa-list-ul"></i>
                          </button>
                          <ul role="menu" class="dropdown-menu">
                            {cardList}
                          </ul>
                        </div>
                        {(this.props.match.url.indexOf('/apps-stock-advisor') >= 0) &&
                          <button type="button" className="btn btn-default" onClick={this.showStockSenceDataPreview.bind(this)} title="Show Data Preview">
                            <i class="zmdi zmdi-hc-lg zmdi-grid"></i>
                        </button>}
                        <button type="button" className="btn btn-default" disabled="true" title="Card mode">
                          <i class="zmdi zmdi-hc-lg zmdi-view-carousel"></i>
                        </button>
                        <Link className="btn btn-default continue" to={{
                          pathname: documentModeLink,
                            state: {
                              lastVar: lastcard.slug
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
                                      <Card cardData={card.cardData} cardWidth={card.cardWidth}/>
                                  </div>
                                  <div className="clearfix"></div>
                                </div>
                              </div>
                              <Link className="tabs-control left grp_legends_green back" to={prevURL}>
                                <span className="fa fa-chevron-left"></span>
                              </Link>
                              <Link onClick={this.redirectPush.bind(this)} className="tabs-control right grp_legends_green continue" to={{
                                pathname: nextURL,
                                state: {
                                  lastVar: card.slug
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
            }
          </div>
        );
      }
    }
  }
}
}
