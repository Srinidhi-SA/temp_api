import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateCircularChartRows} from "../../helpers/helper";

export class CircularChartTable extends React.Component {
  constructor(){
    super();
  }
 //Used in Model Summary
  render() {
   var data = this.props.tableData;
   console.log("checking circular chart tabletable element");
   var headerComponents = generateHeaders(data);
   var rowComponents = generateCircularChartRows(data);
   return (
           <table className="table table_borderless">
               <thead>{headerComponents}</thead>
               <tbody>{rowComponents}</tbody>
           </table>
       );
  }
}
