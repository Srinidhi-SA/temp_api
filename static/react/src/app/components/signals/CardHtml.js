import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import $ from "jquery";

export class CardHtml extends React.Component {
  constructor(){
    super();
  }
  componentDidMount() {
      HeatMap("heat-table-map");
  }
  render() {
   var element = this.props.htmlElement;
   console.log("checking html element");
   console.log(element);
      return(
        <div>
         {renderHTML(element)}
         </div>
    );

  }
}
