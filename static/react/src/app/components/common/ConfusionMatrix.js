import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateRows} from "../../helpers/helper";

export class ConfusionMatrix extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var data = this.props.tableData;
   console.log("checking confusion matrix table element");
   var headerComponents = generateHeaders(data);
   var rowComponents = generateRows(data);
   return (
           <table className="table table-bordered apps_table_style">
               <thead>{headerComponents}</thead>
               <tbody>{rowComponents}</tbody>
           </table>
       );
  }
}
