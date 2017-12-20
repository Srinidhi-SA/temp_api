import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import { Scrollbars } from 'react-custom-scrollbars';

export class NormalHideColumn extends React.Component {
  constructor(props){
    super(props);
  }
 generateHeaders(table) {
      var cols = table.tableData.map(function(rowData,i){
          var colLength = rowData.length;
        if(i== 0){
            return rowData.map(function(colData,j) {
                   
                      if(j == colLength-1)  return<th class="hidden">{colData}</th>;
                      else return<th key={j}>{colData}</th>;
                 });
        }
      })
    return cols;
  }
  generateNormalTableRows(table) {
     var tbodyData = table.tableData.map(function(rowData,i){
         var colLength = rowData.length;
         if(i != 0){
             var rows = rowData.map(function(colData,j) {
                 if(j == 0 || j == 1)
                    return<td key={j}>{colData}</td>;
                  if(j == colLength-1)
                    return<td key={j} class="hidden">{colData}</td>; 
                    else
                     return<td key={j}>{colData}</td>;
                });
             return<tr key={i}>{rows}</tr>;
         }
       })
     return tbodyData;
     }
 
  render() {
   var data = this.props.tableData;
   var className = "table topPredictions table-bordered"
   
   var headerComponents = this.generateHeaders(data);
   var rowComponents = this.generateNormalTableRows(data);
   return (
           <div>
           <table className={className}>
               <thead><tr>{headerComponents}</tr></thead>
               <tbody>{rowComponents}</tbody>
           </table>
           </div>
       );
  }
}
