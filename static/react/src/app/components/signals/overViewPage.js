import React from "react";
import {Redirect, Link, NavLink} from "react-router-dom";
import Breadcrumb from 'react-breadcrumb';
import {
  resTree,
  searchTree,
  getFirstCard,
  fetchCard,
  fetchNodeFromTree,
  getPrevNext,
  getLastCardOfTree
} from "../../helpers/processStory";
import {connect} from "react-redux";
import {isEmpty, subTreeSetting, getUserDetailsOrRestart} from "../../helpers/helper";
import {MainHeader} from "../../components/common/MainHeader";
import {Card} from "./Card";
import store from "../../store";
import {getSignalAnalysis, setSideCardListFlag, updateselectedL1} from "../../actions/signalActions";
import {STATIC_URL} from "../../helpers/env.js"
import Slider from "react-slick";
import {getRoboDataset, getStockAnalysis} from "../../actions/appActions";
import {hideDataPreview} from "../../actions/dataActions";

//import {SignalAnalysisPage} from "./signals/SignalAnalysisPage";
//let showSubTree=false;

@connect((store) => {
  return {signal: store.signals.signalAnalysis, urlPrefix: store.signals.urlPrefix, customerDataset_slug: store.apps.customerDataset_slug};
})

export class OverViewPage extends React.Component {

  constructor(props) {
    super(props);
    this.nextRedirect = null;
    this.showSubTree = false;
    this.l1Name = ""

  }

  setSideListFlag(e) {
    this.props.dispatch(setSideCardListFlag(e.target.className));
  }
  //componentWillReceiveProps(nextProps) {}
  componentWillMount() {

    if (isEmpty(this.props.signal)) {
      if (this.props.match.url.indexOf("apps-robo") != -1) {
        this.props.dispatch(getRoboDataset(this.props.match.params.slug));
      } else if (this.props.match.url.indexOf("apps-stock") != -1) {
        this.props.dispatch(getStockAnalysis(this.props.match.params.slug));
      } else {
        this.props.dispatch(getSignalAnalysis(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
      }
    }
  }
  componentDidMount() {
    // var that = this;
    // if (this.showSubTree) {
    //   $(".sb_navigation").show();
    //   this.showSubTree = false;
    //   let classname = ".sb_navigation #myTab i.mAd_icons.ic_perf ~ span"
    //   if (this.props.match.params.l1 == "Influncers")
    //     ".sb_navigation #myTab i.mAd_icons.ic_measure ~ span"
    //   $(classname).each(function() {
    //     if ($(this).attr('id') == that.props.match.params.l2) {
    //       $(this).parent().addClass('active');
    //     } else {
    //       $(this).parent().removeClass('active');
    //     }
    //   });
    // } else {
    //   $(".sb_navigation").hide();
    // }

    // if ($(".list-group").children().length == 1) {
    //   $('.row-offcanvas-left').addClass('active');
    //   $('.sdbar_switch i').removeClass('sw_on');
    //   $('.sdbar_switch i').addClass('sw_off');
    // }

  }

  toggleSideList() {
    //alert($('.row-offcanvas').attr('class'));
    $('.row-offcanvas').toggleClass('active');
    if ($('.row-offcanvas-left').hasClass('active')) {
      $('.sdbar_switch i').removeClass('sw_on');
      $('.sdbar_switch i').addClass('sw_off');
    } else {
      $('.sdbar_switch i').addClass('sw_on');
      $('.sdbar_switch i').removeClass('sw_off');
    };
  }

  prevNext(path) {
    //  //console.log(path);
    let currentSuffix = path.location.pathname;

    var delimiter = "/";
    var tokens = currentSuffix.split(delimiter).slice(3);
    currentSuffix = tokens.join(delimiter);
    //console.log("currentSuffix is ...." + currentSuffix);
    let expectedURL = getPrevNext(this.props.signal, currentSuffix);
    //console.log(expectedURL);
    return expectedURL;
  }

  redirectPush(url) {
    //console.log(url);
    /*let urlSplit = this.props.location.pathname.split("/");
	let nextSubSlug = this.nextSubTabSlug.split("/");
	//alert(urlSplit[4]);
	//alert(this.curSubTabSlug);
	if((urlSplit[4]!= nextSubSlug[4]) && urlSplit[5]){
		let chkActive = $(".sb_navigation li>a.active").parent().next();
		//console.log(chkActive.attr("class"));
		if(chkActive.attr("class").indexOf("slick-active")< 0){
		$(".slick-next").click();
		}
	}*/
    this.props.history.push(url);
  }

  /*updateSubTreeClass(){
		   //alert("working");
       $(".sb_navigation #myTab i.mAd_icons.ic_perf ~ span").each(function(){
        //console.log($(this).html() +" == "+ that.props.match.params.l2);
        if($(this).attr('id') == that.props.match.params.l2){
          $(this).parent().addClass('active');
        }else{
          $(this).parent().removeClass('active');
        }
       });

}*/

  setScrollActive() {
    var that = this;
    $(function() {
      let index = $(".sb_navigation li>a.active").parent().index();
      that.refs.slider.slickGoTo(index);
    });
  }

  closeDocumentMode() {
    console.log("closing document mode")
    this.props.dispatch(hideDataPreview());
    this.props.history.push("/signals");
  }

  render() {

    console.log("overviewPage is called!!");
    console.log(this.props);
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
      speed: 500,
      slidesToShow: 6,
      slidesToScroll: 1
      //swipeToSlide: true
    };

    if (isEmpty(this.props.signal)) {

      return (
        <div className="side-body">
          {/*<MainHeader/>*/}
          <div className="page-head">
            <div class="row">
              <div class="col-md-12">
                {/*<Breadcrumb path={[
                  {
                    path: that.urlPrefix,
                    label: breadcrumb_label
                  }, {
                    path: that.urlPrefix + this.props.signal.slug,
                    label: this.props.match.params.slug
                  }
                ]}/>*/}
              </div>
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

      let urlSplit = this.props.location.pathname.split("/");
      //console.log(urlSplit);

      //subTreeSetting(urlSplit.length, 6, that.props.match.params.l2,".sb_navigation #subTab i.mAd_icons.ic_measure ~ span"); // setting of subtree and active classes

      let selectedSignal = storyName;
      //let this.props.signal = resTree();
      //console.log(this.props.signal);
      let tabList = null;
      let varList = null;
      let cardList = null;
      let card = null;
      let params = this.props.match.params;

      tabList = [];
      //load level 1 , this will be loaded in all calls!!
      if (this.props.signal.listOfNodes && this.props.signal.listOfNodes.length != 0) {

        tabList = this.props.signal.listOfNodes.map((tab, i) => {
          let selectedLink = that.urlPrefix + "/" + params.slug + "/" + tab.slug;
          let classname1 = "mAd_icons tab_" + tab.name.toLowerCase();
          ////console.log(classname1);
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

      //check first time load!!
      if (Object.keys(params).length < 3) {

        card = getFirstCard(this.props.signal, params.l1);
        //console.log("card after process is:");
        //console.log(card);
        let cardLink = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + card.slug;
        return (<Redirect to={cardLink}/>);
      } else {
        //node with listOfCards is selected..
        card = fetchCard(params, this.props.signal);
        if (params.l3 && params.l3 == "$") {
          let cardLink = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + params.l2 + "/" + card.slug;
          return (<Redirect to={cardLink}/>);
        }

      }

      console.log("l1Name is:");
      //check for level 2
      console.log(params.l1);
      var l1Name = params.l1;
      if (params.l1) {
        var selectedNodeFromLevel1 = fetchNodeFromTree(params.l1, this.props.signal);
        l1Name = selectedNodeFromLevel1.name;
        this.l1Name = l1Name
        if (!isEmpty(selectedNodeFromLevel1) && selectedNodeFromLevel1.listOfNodes.length > 0) {
          varList = selectedNodeFromLevel1.listOfNodes.map((letiable, i) => {
            let selectedl2Link = that.urlPrefix + "/" + params.slug + "/" + selectedNodeFromLevel1.slug + "/" + letiable.slug + "/$";
            let l2Class = "mAd_icons ic_perf"
            if (l1Name == "Influencers")
              l2Class = "mAd_icons ic_measure"
            return (
              <li key={i}>
                <NavLink to={selectedl2Link} title={letiable.name}>
                  <i className={l2Class}></i>
                  <span id={letiable.slug}>{letiable.name}</span>
                </NavLink>
              </li>
            )
          });
          //console.log("varList is .....");
          //console.log(varList);
          that.showSubTree = true;
        }
      }

      let selectedNode = null;
      let selectedNode_slug = null;
      let selectedURL = ""
      if (Object.keys(params).length == 3) {
        selectedNode_slug = params.l1;
        selectedURL = that.urlPrefix + "/" + params.slug + "/" + params.l1;
      } else {
        selectedNode_slug = params.l2;
        selectedURL = that.urlPrefix + "/" + params.slug + "/" + params.l1 + "/" + params.l2;
      }
      //console.log("selectedNode_slug is: " + selectedNode_slug);
      selectedNode = fetchNodeFromTree(selectedNode_slug, this.props.signal);
      cardList = selectedNode.listOfCards.map((card, i) => {
        let selectedLink = selectedURL + "/" + card.slug;
        return (
          <NavLink to={selectedLink} key={i} className="list-group-item" title={card.name}>
            <i className="fa fa-bar-chart"></i>
            <span>{card.name}</span>
          </NavLink>
        )
      });
      let documentModeLink = "";
      if (that.urlPrefix.indexOf("signals") != -1) {
        documentModeLink = "/signaldocumentMode/" + this.props.match.params.slug;
      } else if (that.urlPrefix.indexOf("stock") != -1) {
        documentModeLink = "/apps-stock-advisor"
      } else {
        documentModeLink = "/apps-robo-document-mode/" + this.props.match.params.slug;
      }

      let expectedURL = this.prevNext(this.props);
      console.log("expected url.....")
      console.log(expectedURL)
      let prevURL = that.urlPrefix + "/" + this.props.match.params.slug + "/" + expectedURL.prev;
      let nextURL = that.urlPrefix + "/" + this.props.match.params.slug + "/" + expectedURL.next;
      this.nextRedirect = nextURL;
      //handler when previous is null
      if (expectedURL.prev == null) {
        if (this.props.signal.listOfCards.length > 0) {
          if (expectedURL.prev == this.props.signal.listOfCards[0].slug) {
            prevURL = that.urlPrefix + "/" + this.props.match.params.slug;
          }
        } else {
          prevURL = that.urlPrefix;
        }
      } else {
        if (this.props.signal.listOfCards.length > 0) {
          if (expectedURL.prev == this.props.signal.listOfCards[0].slug) {
            prevURL = that.urlPrefix + "/" + this.props.match.params.slug;
          }
        } else {
          prevURL = that.urlPrefix;
        }
      }
      /* else if (expectedURL.next == null) {
    	  nextURL = documentModeLink;
      }*/

      //for sigma release below code is written seperately, later we have to merge this with above if else
      if (expectedURL.next == null) {
        nextURL = documentModeLink;
      }

      let lastcard = getLastCardOfTree(this.props.signal);
      //console.log("last card is::::");
      //console.log(lastcard);
      //console.log(documentModeLink);

      //console.log("l1name is ...." + selectedSignal);
      ////console.log(card);

      if (!isEmpty(selectedNodeFromLevel1) && selectedNodeFromLevel1.listOfNodes.length > 0) {
        if (varList.length > 6)
          this.setScrollActive();
        }

      let nameLink = that.urlPrefix + "/" + this.props.match.params.slug;
      if (that.urlPrefix == "/apps-robo") {
        nameLink = that.urlPrefix + "-list" + "/" + this.props.match.params.slug + "/customer" + "/data/" + store.getState().apps.customerDataset_slug;
      } else if (that.urlPrefix == "/apps-stock-advisor") {
        nameLink = that.urlPrefix + "/" + this.props.match.params.slug + "/" + params.l1;
      }
      //to fix trend line colour issue:

      this.props.dispatch(updateselectedL1(l1Name))

      let classname=".sb_navigation #subTab i.mAd_icons.ic_perf ~ span"
      if(l1Name=="Influencers")
        classname=".sb_navigation #subTab i.mAd_icons.ic_measure ~ span"
      subTreeSetting(urlSplit.length, 6, that.props.match.params.l2,classname); // setting of subtree and active classes

      return (
        <div>
          <div className="side-body">
            {/* Page Title and Breadcrumbs */}
            <div className="page-head hidden">
              <div class="row">
                <div class="col-md-12">
                  <Breadcrumb path={[
                    {
                      path: that.urlPrefix,
                      label: breadcrumb_label
                    }, {
                      path: nameLink,
                      label: storyName
                    }, {
                      path: that.urlPrefix + "/" + this.props.match.params.slug + '/' + this.props.match.params.l1,
                      label: l1Name
                    }
                  ]}/>
                </div>
                {/*  <div class="col-md-8">
                <h2>{l1Name}</h2>
              </div> */}
              </div>
              <div class="clearfix"></div>
            </div>
            {/* Page Content Area */}
            <div className="main-content">

              {/* Copy from here */}

              <div className="row">
                <div className="col-md-12">
                  <div className="panel panel-mAd">
                    <div className="panel-heading">

                      <h3 className="xs-mt-0">{storyName}

                        <div className="btn-toolbar pull-right">
                          <div className="btn-group">
                            {/*<button type="button" className="btn btn-default" disabled="true" title="Card mode"><i className="fa fa-print"></i></button>*/}
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

                            {/*<Link className="continue" to={that.urlPrefix}>*/}
                            <button type="button" className="btn btn-default" onClick={this.closeDocumentMode.bind(this)}>
                              <i class="zmdi zmdi-hc-lg zmdi-close"></i>
                            </button>
                            {/*</Link>*/}

					</div>
					</div>
					  </h3>

                      <div className="clearfix"></div>
                    </div>

                    <div className="panel-body no-border">
                      <div className="card full-width-tabs">
                        <ul className="nav nav-tabs" id="guide-tabs" role="tablist">
                          {tabList}</ul>

                        {/* Tab panes */}
                        <div className="tab-content">
                          <div className="sb_navigation">
                            <div className="row">
                              <div className="col-xs-12" id="subTab">
                                <Slider ref='slider' {...settings}>{varList}</Slider>
                              </div>

                              <div className="clearfix"></div>
                            </div>

                          </div>

                          <div className="content_scroll container-fluid">
                            <div className="row row-offcanvas row-offcanvas-left">

                              {/*/span*/}
                              <div className="col-xs-12 col-sm-9 content ov_card_boxes">
                                <Card cardData={card.cardData} cardWidth={card.cardWidth}/>
                              </div>
                              {/*/span*/}

                              <div className="col-xs-6 col-sm-3 sidebar-offcanvas" id="sidebar" role="navigation">
                                <div className="side_panel">
                                  <a href="javascript:void(0);" onClick={this.toggleSideList.bind(this)} data-toggle="offcanvas" className="sdbar_switch">
                                    <i className="mAd_icons sw_on" onClick={this.setSideListFlag.bind(this)}></i>
                                  </a>
                                  <div className="panel panel-primary">
                                    <div className="panel-heading">
                                      <span className="title">

                                        <i className="fa fa-list-ul"></i>
                                        List of Analysis

                                      </span>
                                    </div>
                                    <div className="panel-body no-border">
                                      <div className="list-group">
                                        {cardList}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="clearfix"></div>
                            </div>
                            {/*/row*/}

                          </div>
                          {/* /.container */}

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

              {/* Till this end copy the above code */}

            </div>
            {/* /.Page Content Area */}

          </div>
        </div>
      );
    }
  }
}
