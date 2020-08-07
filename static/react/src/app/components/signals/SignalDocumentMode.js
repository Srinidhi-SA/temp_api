import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import store from "../../store";
import Breadcrumb from 'react-breadcrumb';
import {Card} from "./Card";
import {STATIC_URL,API} from "../../helpers/env.js";
import {getSignalAnalysis} from "../../actions/signalActions";
import {isEmpty, subTreeSetting,getUserDetailsOrRestart} from "../../helpers/helper";
import {hideDataPreview} from "../../actions/dataActions";
import {getAppsScoreSummary,getScoreSummaryInCSV} from "../../actions/appActions";


@connect((store) => {
  return {signal: store.signals.signalAnalysis};
})

export class SignalDocumentMode extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {
    if (isEmpty(this.props.signal)) {
      if (this.props.match.url.indexOf("apps-regression") != -1) {
        this.props.dispatch(getAppsScoreSummary(this.props.match.params.slug));
      }
      else {
        this.props.dispatch(getSignalAnalysis(getUserDetailsOrRestart.get().userToken, this.props.match.params.slug));
      }
    }
  }

  print() {
    window.print();
  }

  searchTree(_Node, cardLists, lastVar) {
    if (_Node.listOfCards.length!=0&&_Node.listOfCards[_Node.listOfCards.length - 1].slug == lastVar) {
      cardLists.push(_Node.listOfCards);
      return cardLists;
    } else {
      var i;
      var result = null;
      cardLists.push(_Node.listOfCards);
      for (i = 0; i < _Node.listOfNodes.length; i++) {
        result = this.searchTree(_Node.listOfNodes[i], cardLists, lastVar);
      }
      return result;
    }
  }

  closeDocumentMode(){
    this.props.dispatch(hideDataPreview());
    if(this.props.match.url.indexOf("apps-regression") != -1)
    this.props.history.push("/apps-regression/scores")
    else
    this.props.history.push("/signals");
  }
  gotoScoreData(){
      this.props.dispatch(getScoreSummaryInCSV(store.getState().apps.scoreSlug))
  }
  render() {
    let regression_app=false
    if(this.props.match.url.indexOf("apps-regression") != -1)
    regression_app=true

    let cardList = [];
    if (!isEmpty(this.props.signal)) {
      let lastCard = this.props.history.location.state.lastVar;
      cardList = this.searchTree(this.props.signal, cardList, lastCard);
      let docObj = [];
      for (let card of cardList) {
        for (let _card of card) {
          docObj.push(_card);
        }
      }
      if(!regression_app)
      docObj.splice(0, 1);

      let objs = [];
      docObj.map(function(item, i) {
        let len = item.cardData.length;

        for (var i = 0; i < len; i++) {
          objs.push(item.cardData[i]);

        }

      })
      let firstOverviewSlug = this.props.signal.listOfNodes[0].slug;
      let cardModeLink = "/signals/" + this.props.match.params.slug + "/" + firstOverviewSlug;
      if(regression_app){
      var scoreDownloadURL=API+'/api/get_score_data_and_return_top_n/?url='+store.getState().apps.scoreSlug+'&download_csv=true&count=100'
      var scoreDataLink = "/apps/regression-app-6u8ybu4vdr/analyst/scores/"+store.getState().apps.scoreSlug+"/dataPreview";
      }
      if (objs) {
        return (
          <div>
            <div className="side-body" id="side-body">
              <div className="page-head">
                <div class="row">
                  <div class="col-md-12">
                  </div>
                </div>
                <div class="clearfix"></div>
              </div>
              <div className="main-content">
                <div className="row">
                  <div className="col-md-12">
					
					<h3 className="xs-mt-0">{this.props.signal.name}
							<div className="btn-toolbar pull-right">
								<div className="btn-group">
								<button type="button" className="btn btn-default" onClick={this.print.bind(this)} title="Print Document"><i className="fa fa-print"></i></button>
								<Link className="btn btn-default continue" to={cardModeLink} title="Card mode">
								<i class="zmdi zmdi-hc-lg zmdi-view-carousel"></i>
								</Link>
								<button type="button" className="btn btn-default" disabled="true" title="Document Mode">
								<i class="zmdi zmdi-hc-lg zmdi-view-web"></i>
								</button>
								<button type="button" className="btn btn-default" onClick = {this.closeDocumentMode.bind(this)}>
								<i class="zmdi zmdi-hc-lg zmdi-close"></i>
								</button>
								</div>
							</div>
						</h3>

                        <div className="clearfix"></div>
					
                    <div className="panel panel-mAd box-shadow">                      

                      <div className="panel-body no-border documentModeSpacing">
                        <Card cardData={objs}/>
                        <div className="col-md-12 text-right">
                        {(regression_app)?<div>
                        <Link to={scoreDataLink} onClick={this.gotoScoreData.bind(this)} className="btn btn-primary xs-pr-10">View Scored Data</Link>
                        <a  href={scoreDownloadURL} id="download" className="btn btn-primary" download>Download Score</a></div>:""}
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
    } else {

      return (
        <div className="side-body">
          <div className="page-head">
            <div class="row">
              <div class="col-md-12">
              </div>
              <div class="col-md-8">
                <h2>{this.props.signal.name}</h2>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
          <div className="main-content">
            <img id="loading" src={STATIC_URL + "assets/images/Preloader_2.gif"}/>
          </div>
        </div>
      );
    }
  }
}
