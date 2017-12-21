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
   console.log(data)
   var headerComponents = generateHeaders(data);
   var rowComponents = generateRows(data);
   return (
           <div className="table-style">
           <table className="table table-bordered apps_table_style">
               <thead><tr>
				<th colSpan={data.tableData.length+3} class="text-center">Actual</th>
				</tr></thead>
               <tbody><tr><th rowSpan={data.tableData.length} class="left_highlilght">Predicted</th>
				{headerComponents}</tr>{rowComponents}</tbody>
           </table>
           </div>
       );
  }
}
