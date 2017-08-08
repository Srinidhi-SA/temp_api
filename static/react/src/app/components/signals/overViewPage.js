import React from "react";
import {Redirect, Link, NavLink} from "react-router-dom";
import Breadcrumb from 'react-breadcrumb';

import {
  resTree,
  searchTree,
  getFirstCard,
  fetchCard,
  fetchNodeFromTree,
  getPrevNext
} from "../../helpers/processStory";
import {isEmpty} from "../../helpers/helper";
import {MainHeader} from "../../components/common/MainHeader";
import {Card} from "./Card";

//import {SignalAnalysisPage} from "./signals/SignalAnalysisPage";
let showSubTree=false;
let output = {
  "listOfNodes": [
    {
      "listOfNodes": [],
      "listOfCards": [
        {
          "cardType": "executivesummary",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "overview",
          "slug": "overview"
        }
      ],
      "name": "overview",
      "slug": "overview"
    }, {
      "listOfNodes": [],
      "listOfCards": [
        {
          "cardType": "normal",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }, {
              CardType: "html",
              data: "<p> The CHURN STATUS variable has only two values, i.e. Active and Churn. Active is the <b>largest</b> with 3,893 observations, whereas Churn is the <b>smallest</b> with just 1,107 observations.<p>"
            }, {
              CardType: "html",
              data: "<div className='clearfix'></div><p> The CHURN STATUS variable has only two values, i.e. Active and Churn. Active is the <b>largest</b> with 3,893 observations, whereas Churn is the <b>smallest</b> with just 1,107 observations.<p>"
            }
          ],
          "name": "trend1",
          "slug": "trend1"
        }, {
          "cardType": "normal",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "trend2",
          "slug": "trend2"
        }, {
          "cardType": "normal",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "trend3",
          "slug": "trend3"
        }
      ],
      "name": "trend",
      "slug": "trend"
    }, {
      "listOfNodes": [
        {
          "listOfNodes": [],
          "listOfCards": [
            {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "c3Chart",
                  data: {
                    "bar": {
                      "width": 50
                    },
                    "point": null,
                    "color": {
                      "pattern": [
                        "#00AEB3",
                        "#f47b16",
                        "#7c5bbb",
                        "#dd2e1f",
                        "#00a0dc",
                        "#efb920",
                        "#e2247f",
                        "#7cb82f",
                        "#86898c"
                      ]
                    },
                    "tooltip": {
                      "show": true
                    },
                    "padding": {
                      "top": 40
                    },
                    "grid": {
                      "y": {
                        "show": true
                      },
                      "x": {
                        "show": true
                      }
                    },
                    "subchart": null,
                    "axis": {
                      "y": {
                        "tick": {
                          "outer": false,
                          "format": "m"
                        },
                        "label": {
                          "text": "",
                          "position": "outer-middle"
                        }
                      },
                      "x": {
                        "height": 71.21320343559643,
                        "tick": {
                          "rotate": -45,
                          "multiline": false,
                          "fit": false
                        },
                        "type": "category",
                        "label": {
                          "text": "",
                          "position": "outer-center"
                        }
                      }
                    },
                    "data": {
                      "x": "x",
                      "type": "bar",
                      "columns": [
                        [
                          "x", "Active", "Churn"
                        ],
                        ["y", 3893, 1107]
                      ]
                    },
                    "legend": {
                      "show": false
                    },
                    "size": {
                      "height": 340
                    }
                  }
                }
              ],
              "name": "performance1",
              "slug": "performance1"
            }, {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance2",
              "slug": "performance2"
            }, {
              "cardType": "Nornormalmal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance3",
              "slug": "performance3"
            }
          ],
          "name": "AverageNumber1",
          "slug": "AverageNumber1"
        }, {
          "listOfNodes": [],
          "listOfCards": [
            {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance1 of AverageNumber2",
              "slug": "performance1"
            }, {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance2 of AverageNumber2",
              "slug": "performance2"
            }, {
              "cardType": "Nornormalmal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance3 of AverageNumber2",
              "slug": "performance3"
            }
          ],
          "name": "AverageNumber2",
          "slug": "AverageNumber2"
        }, {
          "listOfNodes": [],
          "listOfCards": [
            {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance1 of AverageNumber3",
              "slug": "performance1"
            }, {
              "cardType": "normal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance2 of AverageNumber3",
              "slug": "performance2"
            }, {
              "cardType": "Nornormalmal",
              "cardData": [
                {
                  CardType: "html",
                  data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
                }
              ],
              "name": "performance3 of AverageNumber3",
              "slug": "performance3"
            }
          ],
          "name": "AverageNumber3",
          "slug": "AverageNumber3"
        }
      ],
      "listOfCards": [
        {
          "cardType": "normal",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "PerformanceOverview",
          "slug": "performanceOverview"
        }
      ],
      "name": "performance",
      "slug": "performance"
    }, {
      "listOfNodes": [],
      "listOfCards": [
        {
          "cardType": "summary",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "summary",
          "slug": "summary"
        }, {
          "cardType": "executivesummary",
          "cardData": [
            {
              CardType: "html",
              data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
            }
          ],
          "name": "overview",
          "slug": "overview"
        }
      ],
      "name": "influences",
      "slug": "influences"
    }
  ],
  "listOfCards": [
    {
      "cardType": "summary",
      "cardData": {
        "noOfMeasures": 10,
        "quotesHtml": "Sales had a phenomenal growth during Jan-Dec need to be coming from api",
        "summaryHtml": "summary with HTML <b>tags</b> ex: mAdvisor has analyzed the dataset and it contains<b> 17</b> variables and <b>1500</b> observations. Of these <b>6</b> variables are omitted, since these are not fit for the analysis. The consolidated dataset has 1 measure and 10 dimensions. Please click next to find the insights from our distribution analysis of <b>status</b> factoring the other variables",
        "noOfDimensions": 8
      },
      "name": "summary",
      "slug": "summary"
    }
  ],
  "name": "SignalsRoot",
  "slug": "Signals"
};

export class OverViewPage extends React.Component {
  constructor() {
    super();
  }

  componentDidMount(){
    // alert(showSubTree);
    if(showSubTree){
       $(".sb_navigation").show();
       showSubTree = false;
     }
    else{
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
    let expectedURL = getPrevNext(output, currentSuffix);
    console.log(expectedURL);
    return expectedURL;
  }
  render() {
    console.log("overviewPage is called!!");
    console.log(this.props);

    //let output = resTree();
    console.log(output);
    let tabList = null;
    let varList = null;
    let cardList = null;
    let card = null;
    let params = this.props.match.params;

    //load level 1 , this will be loaded in all calls!!
    tabList = output.listOfNodes.map((tab, i) => {
      let selectedLink = "/signals/" + params.slug + "/" + tab.slug;
      let classname1 = "mAd_icons tab_" + tab.name;
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
      card = getFirstCard(output, params.l1);
      console.log("card after process is:");
      console.log(card);
      let cardLink = "/signals/" + params.slug + "/" + params.l1 + "/" + card.slug;
      return (<Redirect to={cardLink}/>);
    } else {
      //node with listOfCards is selected..
      card = fetchCard(params, output);
      if (params.l3 && params.l3 == "$") {
        let cardLink = "/signals/" + params.slug + "/" + params.l1 + "/" + params.l2 + "/" + card.slug;
        return (<Redirect to ={cardLink}/>);
      }

    }

    console.log("card finally searched is:");
    console.log(card);
    //check for level 2
    console.log(params.l1);

    if (params.l1) {
      let selectedNodeFromLevel1 = fetchNodeFromTree(params.l1, output);
      if (!isEmpty(selectedNodeFromLevel1) && selectedNodeFromLevel1.listOfNodes.length > 0) {
        varList = selectedNodeFromLevel1.listOfNodes.map((letiable, i) => {
          let selectedl2Link = "/signals/" + params.slug + "/" + selectedNodeFromLevel1.slug + "/" + letiable.slug + "/$";
          return (
            <li key={i}>
              <NavLink activeClassName="active" to={selectedl2Link}>
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
    selectedNode = fetchNodeFromTree(selectedNode_slug, output);
    cardList = selectedNode.listOfCards.map((card, i) => {
      let selectedLink = selectedURL + "/" + card.slug;
      return (
        <NavLink to={selectedLink} key={i} className="list-group-item">{card.name}</NavLink>
      )
    });

    let expectedURL = this.prevNext(this.props);

    let prevURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.prev;
    let nextURL = "/signals/"+this.props.match.params.slug+"/"+expectedURL.next;
  if(expectedURL.prev=="summary"){
    prevURL = "/signals/"+this.props.match.params.slug;
  }else if(expectedURL.next==null){
    nextURL = "/signals";
  }


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
                  label: this.props.match.params.slug
                },
                {path:'/signals/'+this.props.match.params.slug+'/'+this.props.match.params.l1,
              label:this.props.match.params.l1}
              ]}/>
              </div>
              <div class="col-md-8">
                <h2>TODO: need to fill this</h2>
              </div>
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
                    <div className="btn-toolbar pull-right">
                      <div className="btn-group btn-space">
                        <button type="button" className="btn btn-default">
                          <i className="fa fa-file-pdf-o"></i>
                        </button>
                        <button type="button" className="btn btn-default">
                          <i className="fa fa-print"></i>
                        </button>
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
                              <Card cardData={card}/>
                              <p>
                                {card.name}
                              </p>
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
                        <Link className="tabs-control right grp_legends_green continue" to={nextURL}>
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
