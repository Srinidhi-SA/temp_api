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
import {isEmpty} from "../../helpers/helper";
import {MainHeader} from "../../components/common/MainHeader";
import {Card} from "./Card";
import store from "../../store";




//import {SignalAnalysisPage} from "./signals/SignalAnalysisPage";
let showSubTree=false;


@connect((store) => {
  return {signal:store.signals.signalAnalysis};
})

export class OverViewPage extends React.Component {
  constructor() {
    super();
  }

  componentDidMount(){
    // alert(showSubTree);
    var that = this;
    // alert(showSubTree);
    if(showSubTree){
       $(".sb_navigation").show();
       showSubTree = false;
       $(".sb_navigation #myTab i.mAd_icons.ic_perf ~ span").each(function(){

        if($(this).html() == that.props.match.params.l2){
          $(this).parent().addClass('active');
        }else{
          $(this).parent().removeClass('active');
        }
       });
     }
    else{
    //  console.log($(".sb_navigation").html());
       $(".sb_navigation").hide();
     }
    }


prevNext(path) {
    console.log(path);
    let currentSuffix = path.location.pathname;

    var delimiter = "/";
    var tokens = currentSuffix.split(delimiter).slice(3);
    currentSuffix = tokens.join(delimiter);
    console.log("currentSuffix is ...." + currentSuffix);
    let expectedURL = getPrevNext(this.props.signal, currentSuffix);
    console.log(expectedURL);
    return expectedURL;
  }

render() {

    console.log("overviewPage is called!!");
    console.log(this.props);
    let selectedSignal = this.props.signal.name;
    //let this.props.signal = resTree();
    console.log(this.props.signal);
    let tabList = null;
    let varList = null;
    let cardList = null;
    let card = null;
    let params = this.props.match.params;

    //load level 1 , this will be loaded in all calls!!
    tabList = this.props.signal.listOfNodes.map((tab, i) => {
      let selectedLink = "/signals/" + params.slug + "/" + tab.slug;
      let classname1 = "mAd_icons tab_" + tab.name.toLowerCase();
      //console.log(classname1);
      return (
        <li key={i}>
          <NavLink to={selectedLink}>
            <i className={classname1}></i>
            <span>{tab.name}</span>
          </NavLink>
        </li>
      )
    });

    //check first time load!!
    if (Object.keys(params).length < 3) {
      card = getFirstCard(this.props.signal, params.l1);
      console.log("card after process is:");
      console.log(card);
      let cardLink = "/signals/" + params.slug + "/" + params.l1 + "/" + card.slug;
      return (<Redirect to={cardLink}/>);
    } else {
      //node with listOfCards is selected..
      card = fetchCard(params, this.props.signal);
      if (params.l3 && params.l3 == "$") {
        let cardLink = "/signals/" + params.slug + "/" + params.l1 + "/" + params.l2 + "/" + card.slug;
        return (<Redirect to ={cardLink}/>);
      }

    }

    console.log("card finally searched is:");
    console.log(card);
    //check for level 2
    console.log(params.l1);
 var l1Name = params.l1;
    if (params.l1) {
      let selectedNodeFromLevel1 = fetchNodeFromTree(params.l1, this.props.signal);
      l1Name = selectedNodeFromLevel1.name;
      if (!isEmpty(selectedNodeFromLevel1) && selectedNodeFromLevel1.listOfNodes.length > 0) {
        varList = selectedNodeFromLevel1.listOfNodes.map((letiable, i) => {
          let selectedl2Link = "/signals/" + params.slug + "/" + selectedNodeFromLevel1.slug + "/" + letiable.slug + "/$";
          return (
            <li key={i}>
              <NavLink to={selectedl2Link}>
                <i className="mAd_icons ic_perf"></i>
                <span>{letiable.name}</span>
              </NavLink>
            </li>
          )
        });
        console.log("varList is .....");
        console.log(varList);
        showSubTree = true;
      }
    }
    let selectedNode = null;
    let selectedNode_slug = null;
    let selectedURL = ""
    if (Object.keys(params).length == 3) {
      selectedNode_slug = params.l1;
      selectedURL = "/signals/" + params.slug + "/" + params.l1;
    } else {
      selectedNode_slug = params.l2;
      selectedURL = "/signals/" + params.slug + "/" + params.l1 + "/" + params.l2;
    }
    console.log("selectedNode_slug is: " + selectedNode_slug);
    selectedNode = fetchNodeFromTree(selectedNode_slug, this.props.signal);
    cardList = selectedNode.listOfCards.map((card, i) => {
      let selectedLink = selectedURL + "/" + card.slug;
      return (
        <NavLink to={selectedLink} key={i} className="list-group-item">{card.name}</NavLink>
      )
    });

    let documentModeLink = "/signaldocumentMode/"+this.props.match.params.slug;
    let expectedURL = this.prevNext(this.props);

    let prevURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.prev;
    let nextURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.next;
  if(expectedURL.prev==this.props.signal.listOfCards[0].slug){
    prevURL = "/signals/"+this.props.match.params.slug;
  }else if(expectedURL.next==null){
    nextURL = documentModeLink;
  }

let lastcard = getLastCardOfTree(this.props.signal);
console.log("last card is::::");
console.log(lastcard);
console.log(documentModeLink);


console.log("l1name is ...."+selectedSignal);
//console.log(card);
    return (
      <div>
        <div className="side-body">
          {/* Page Title and Breadcrumbs */}
          <div className="page-head">
            <div class="row">
              <div class="col-md-12">
              <Breadcrumb path={[{
                  path: '/signals',
                  label: 'Signals'
                },
                {
                  path:'/signals/'+this.props.match.params.slug,
                  label: selectedSignal
                },
                {
                  path:'/signals/'+this.props.match.params.slug+'/'+this.props.match.params.l1,
                  label:l1Name
                }
              ]}
              />
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
					<h2 class="pull-left">{l1Name}</h2>
                    <div className="btn-toolbar pull-right">
                      <div className="btn-group btn-space">

                        <button type="button" className="btn btn-default" disabled = "true">
                          <i className="fa fa-file-pdf-o"></i>
                        </button>
                        <Link className="tabs-control right grp_legends_green continue" to={{
                      pathname: documentModeLink,
                      state: { lastVar: lastcard.slug }
                      }}>
                        <button type="button" className="btn btn-default">
                          <i className="fa fa-print"></i>
                        </button>
                        </Link>
                        <button type="button" className="btn btn-default">
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                    </div>
                    <div className="clearfix"></div>
                  </div>
                  <div className="panel-body">
                    <div className="card full-width-tabs">
                      <ul className="nav nav-tabs" id="guide-tabs" role="tablist">
                        {tabList}</ul>

                      {/* Tab panes */}
                      <div className="tab-content">
                        <div className="sb_navigation">
                          <div className="row">
                            <div className="col-xs-11">
                              <div className="scroller scroller-left">
                                <i className="glyphicon glyphicon-chevron-left"></i>
                              </div>
                              <div className="scroller scroller-right">
                                <i className="glyphicon glyphicon-chevron-right"></i>
                              </div>
                              <div className="wrapper">
                                <ul className="nav nav-tabs list" id="myTab">
                                  {varList}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="content_scroll container-fluid">
                          <div className="row row-offcanvas row-offcanvas-left">

                            {/*/span*/}
                            <div className="col-xs-12 col-sm-9 content">
                              <Card cardData={card.cardData}/>
                            </div>
                            {/*/span*/}

                            <div className="col-xs-6 col-sm-3 sidebar-offcanvas" id="sidebar" role="navigation">
                              <div className="side_panel">
                                <a href="javscript:;" data-toggle="offcanvas" className="sdbar_switch">
                                  <i className="mAd_icons sw_on"></i>
                                </a>
                                <div className="panel panel-primary">
                                  <div className="panel-heading">
                                    <span className="title">
                                      <i className="mAd_icons ic_perf active"></i>
                                      Measure 1
                                    </span>
                                  </div>
                                  <div className="panel-body">
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
                        <Link className="tabs-control right grp_legends_green continue" to={{
                      pathname: nextURL,
                      state: { lastVar: card.slug }
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
