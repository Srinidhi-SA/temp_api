import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import {CardHtml} from "./CardHtml";
var data = null,
  yformat = null,
  cardData = {};

@connect((store) => {
  return {login_response: store.login.login_response, signal: store.signals.signalAnalysis};
})

export class Card extends React.Component {
  constructor() {
    super();


  //  cardData = [
      // {
      //   dataType: "html",
      //   data: '<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered heat-table-map table-responsive" ><thead> <tr class="heatMapHeader"><th class="first">Head</th><th class="first">Active</th><th class="first">Churn</th> </tr></thead><tbody> <tr class="stats-row"><td  class="stats-title">Active</td><td>34%</td><td>58%</td></tr><tr class="stats-row"><td  class="stats-title">Churn</td><td>13%</td><td>88%</td></tr></tbody></table>'
      // }, {
      //   dataType: "html",
      //   data: "<p> The CHURN STATUS variable has only two values, i.e. Active and Churn. Active is the <b>largest</b> with 3,893 observations, whereas Churn is the <b>smallest</b> with just 1,107 observations.<p>"
      // }, {
      //   dataType: "c3Chart",
      //   data: {
      //     "bar": {
      //       "width": 50
      //     },
      //     "point": null,
      //     "color": {
      //       "pattern": [
      //         "#00AEB3",
      //         "#f47b16",
      //         "#7c5bbb",
      //         "#dd2e1f",
      //         "#00a0dc",
      //         "#efb920",
      //         "#e2247f",
      //         "#7cb82f",
      //         "#86898c"
      //       ]
      //     },
      //     "tooltip": {
      //       "show": true
      //     },
      //     "padding": {
      //       "top": 40
      //     },
      //     "grid": {
      //       "y": {
      //         "show": true
      //       },
      //       "x": {
      //         "show": true
      //       }
      //     },
      //     "subchart": null,
      //     "axis": {
      //       "y": {
      //         "tick": {
      //           "outer": false,
      //           "format": "m"
      //         },
      //         "label": {
      //           "text": "",
      //           "position": "outer-middle"
      //         }
      //       },
      //       "x": {
      //         "height": 71.21320343559643,
      //         "tick": {
      //           "rotate": -45,
      //           "multiline": false,
      //           "fit": false
      //         },
      //         "type": "category",
      //         "label": {
      //           "text": "",
      //           "position": "outer-center"
      //         }
      //       }
      //     },
      //     "data": {
      //       "x": "x",
      //       "type": "bar",
      //       "columns": [
      //         [
      //           "x", "Active", "Churn"
      //         ],
      //         ["y", 3893, 1107]
      //       ]
      //     },
      //     "legend": {
  //           "show": false
  //         },
  //         "size": {
  //           "height": 340
  //         }
  //       }
  //     }, {
  //       dataType: "html",
  //       data: "<div className='clearfix'></div><p> The CHURN STATUS variable has only two values, i.e. Active and Churn. Active is the <b>largest</b> with 3,893 observations, whereas Churn is the <b>smallest</b> with just 1,107 observations.<p>"
  //     }
  //   ]
  // }
  // componentWillMount() {
  //   //alert("id:" + this.props.errandId);
  //   console.log(store.getState().signals.signalAnalysis);
  // //  this.props.dispatch(getSignalAnalysis(sessionStorage.userToken, this.props.match.params.slug));
  //
   }

  render() {
    console.log(this.props);
    console.log("card is called!!!! with data:----");
    cardData = this.props.cardData;
    console.log(cardData);
    const cardElements = cardData.map((story, i) => {
       console.log(story);
      switch (story.dataType) {
        case "html":
          return (<CardHtml key = {i} htmlElement={story.data} type={story.dataType}/>);
          break;
        case "c3Chart":
          return (<C3Chart key = {i} data={story.data} yformat={"m"}/>);
          break;
      }

    });

    return (
      <div className="side-body">
        <div className="main-content">
          {cardElements}
        </div>
      </div>
    );

  }
}
