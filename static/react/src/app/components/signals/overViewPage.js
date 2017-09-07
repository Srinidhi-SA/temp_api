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
import {isEmpty,subTreeSetting} from "../../helpers/helper";
import {MainHeader} from "../../components/common/MainHeader";
import {Card} from "./Card";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {STATIC_URL} from "../../helpers/env.js"
import Slider from "react-slick"






//import {SignalAnalysisPage} from "./signals/SignalAnalysisPage";
//let showSubTree=false;


@connect((store) => {
  return {signal:store.signals.signalAnalysis};
})

export class OverViewPage extends React.Component {
  constructor() {
    super();
	this.nextRedirect = null;
	this.showSubTree=false;

  }

  componentWillReceiveProps(nextProps) {

}
componentWillMount() {
  if(isEmpty(this.props.signal)){
  this.props.dispatch(getSignalAnalysis(sessionStorage.userToken, this.props.match.params.slug));
  }
}
  componentDidMount(){
    // alert(showSubTree);

    var that = this;
    // alert(showSubTree);
    if(this.showSubTree){
       $(".sb_navigation").show();
       this.showSubTree = false;
       $(".sb_navigation #myTab i.mAd_icons.ic_perf ~ span").each(function(){
        console.log($(this).html() +" == "+ that.props.match.params.l2);
        if($(this).attr('id') == that.props.match.params.l2){
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

/*	$('[data-toggle=offcanvas]').click(function () {

    $('.row-offcanvas').toggleClass('active');
	if ($('.row-offcanvas-left').hasClass('active')){
		$('.sdbar_switch i').removeClass('sw_on');
		$('.sdbar_switch i').addClass('sw_off');
    } else {
		$('.sdbar_switch i').addClass('sw_on');
		$('.sdbar_switch i').removeClass('sw_off');
	};
  });*/

  if($(".list-group").children().length == 1){
	    $('.row-offcanvas-left').addClass('active');
		$('.sdbar_switch i').removeClass('sw_on');
		$('.sdbar_switch i').addClass('sw_off');
    }

  }

toggleSideList(){
	    $('.row-offcanvas').toggleClass('active');
	if ($('.row-offcanvas-left').hasClass('active')){
		$('.sdbar_switch i').removeClass('sw_on');
		$('.sdbar_switch i').addClass('sw_off');
    } else {
		$('.sdbar_switch i').addClass('sw_on');
		$('.sdbar_switch i').removeClass('sw_off');
	};
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

  redirectPush(url){
	  console.log(url);
	  this.props.history.push(url);
  }


/*updateSubTreeClass(){
		   //alert("working");
       $(".sb_navigation #myTab i.mAd_icons.ic_perf ~ span").each(function(){
        console.log($(this).html() +" == "+ that.props.match.params.l2);
        if($(this).attr('id') == that.props.match.params.l2){
          $(this).parent().addClass('active');
        }else{
          $(this).parent().removeClass('active');
        }
       });

}*/
render() {

    console.log("overviewPage is called!!");
    console.log(this.props);

	var settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 6,
      slidesToScroll: 1
	  //swipeToSlide: true
    };
    if(isEmpty(this.props.signal)){

      return(
        <div className="side-body">
        {/*<MainHeader/>*/}
        <div className="page-head">
          <div class="row">
            <div class="col-md-12">
            <Breadcrumb path={[{
                path: '/signals',
                label: 'Signals'
              },
              {
                path:'/signals'+this.props.signal.name,
                label: this.props.match.params.slug
              }
            ]}/>
            </div>
            <div class="col-md-8">
              <h2>{this.props.signal.name}</h2>
            </div>
            </div>
          <div class="clearfix"></div>
        </div>
          <div className="main-content">
          <img id = "loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
          </div>
          </div>
      );
    }else{

	 var that = this;

	  let urlSplit = this.props.location.pathname.split("/");
	  console.log(urlSplit);

	  subTreeSetting(urlSplit.length,6,that.props.match.params.l2); // setting of subtree and active classes


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
                <span id={letiable.slug}>{letiable.name}</span>
              </NavLink>
            </li>
          )
        });
        console.log("varList is .....");
        console.log(varList);
        that.showSubTree = true;
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
        <NavLink to={selectedLink} key={i} className="list-group-item"><i className="fa fa-bar-chart"></i> {card.name}</NavLink>
      )
    });

    let documentModeLink = "/signaldocumentMode/"+this.props.match.params.slug;
    let expectedURL = this.prevNext(this.props);

    let prevURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.prev;
    let nextURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.next;
	this.nextRedirect = nextURL;
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

                        <button type="button" className="btn btn-default" disabled = "true" title="Card mode">
                          <i className="pe-7s-display2 pe-lg"></i>
                        </button>
                        <Link className="tabs-control right grp_legends_green continue" to={{
                      pathname: documentModeLink,
                      state: { lastVar: lastcard.slug }
                      }}>
                        <button type="button" className="btn btn-default" title="Document mode">
                          <i className="pe-7s-news-paper pe-lg"></i>
                        </button>
                        </Link>
						 <Link className="tabs-control right grp_legends_green continue" to="/signals">
                        <button type="button" className="btn btn-default">
                          <i className="pe-7s-close pe-lg"></i>
                        </button>
						</Link>
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
                            <div className="col-xs-12">
                                                         
                               
                                   <Slider {...settings}>{varList}</Slider>
                              
                              
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
                                <a href="javascript:void(0);" data-toggle="offcanvas" onClick={this.toggleSideList.bind(this)} className="sdbar_switch">
                                  <i className="mAd_icons sw_on"></i>
                                </a>
                                <div className="panel panel-primary">
                                  <div className="panel-heading">
                                    <span className="title">

                                      <i className="fa fa-list-ul"></i> List of Analysis

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
                        <Link onClick={this.redirectPush.bind(this)} className="tabs-control right grp_legends_green continue" to={{
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
}
