import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import {DecisionTree} from "../decisionTree";
import {CardHtml} from "./CardHtml";
import {CardTable} from "../common/CardTable";
import {PredictionDropDown} from "../common/predictionDropdown";
//import Tree from 'react-d3-tree';
import {ReactD3} from "../reactD3";
import { Scrollbars } from 'react-custom-scrollbars';
//import Tree from 'react-tree-graph';

import $ from "jquery";


var data = null,
  yformat = null,
  cardData = {};
/*let d3data = {
    name: 'Parent',
    children: [{
        name: 'Child One'
    }, {
        name: 'Child Two'
    }]
};*/

const myTreeData = [
  {
    name: 'Top Level',

    children: [
      {
        name: 'Level 2: A',
		children: [
			  {
				name: 'Level 2: A',

			  },
			  {
				name: 'Level 2: B',
			  },
			],

      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
  chartObject: store.chartObject.chartObj};
})

export class Card extends React.Component {
  constructor() {
    super();

   }
//
  render() {
    console.log("card is called!!!! with data:----");
    cardData = this.props.cardData;
    //console.log(cardData);

    const cardElements = cardData.map((story, i) => {
    	let randomNum = Math.random().toString(36).substr(2,8);
      switch (story.dataType) {
        case "html":

          return (<CardHtml key = {i} htmlElement={story.data} type={story.dataType}/>);
          break;
        case "c3Chart":
        //console.log("checking chart data:::::");
          if(!$.isEmptyObject(story.data)){
           return (<div key={i}><C3Chart classId={randomNum} data={story.data.chart_c3} yformat={story.data.yformat} y2format={story.data.y2format} guage={story.data.gauge_format} tooltip={story.data.tooltip_c3} tabledata={story.data.table_c3} tabledownload={story.data.download_url} xdata={story.data.xdata}/><div className="clearfix"/></div>);
           }
          break;
          case "tree":
		  	//console.log("checking tree data");
            return ( <DecisionTree key={i} treeData={story.data}/>);
          break;
        case "table":
        return (<div className="table-style"><CardTable key = {i} jsonData={story.data} type={story.dataType}/></div>);
            break;
		case "dropdown":
            return (<PredictionDropDown key = {i} jsonData={story.data} type={story.dataType}/>);
            break;
      }

    });
    return (
      <div>
          {cardElements}
      </div>
    );

  }
}
