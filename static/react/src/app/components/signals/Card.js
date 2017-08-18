import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import {DecisionTree} from "../decisionTree";
import {CardHtml} from "./CardHtml";
import {DecisionTreeTable} from "../common/decisionTreeTable";
var data = null,
  yformat = null,
  cardData = {};

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis};
})

export class Card extends React.Component {
  constructor() {
    super();

   }

  render() {
    console.log(this.props);
    console.log("card is called!!!! with data:----");
    cardData = this.props.cardData;
    console.log(cardData);
    const cardElements = cardData.map((story, i) => {
      //  console.log(JSON.stringify(story));
      switch (story.dataType) {
        case "html":
          return (<CardHtml key = {i} htmlElement={story.data} type={story.dataType}/>);
          break;
        case "c3Chart":
        console.log("checking chart data:::::");
          if(!$.isEmptyObject(story.data)){
           return (<div key={i}><C3Chart classId={i} data={story.data.chart_c3} yformat={story.data.yformat} y2format={story.data.y2format} tooltip={story.data.tooltip_c3}/><div className="clearfix"/></div>);
           }
          break;
          case "table":
            if(story.data.tableType =="decisionTreeTable"){
            return (<DecisionTreeTable key = {i} htmlElement={story.data.tableData} type={story.dataType}/>);
            }
          break;
          case "tree":
            return (<div>Decision Tree</div>);
          break;
      }

    });
//
// console.log("cardelement is:");
// console.log(cardElements);
    return (
      <div className="xs-p-50 for-docs">

          {cardElements}

      </div>
    );

  }
}
