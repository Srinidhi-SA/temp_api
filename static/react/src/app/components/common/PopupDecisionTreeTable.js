import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateNormalTableRows} from "../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';

export class PopupDecisionTreeTable extends React.Component {
  constructor(){
    super();
    this.showDecisionTreePopup = this.showDecisionTreePopup.bind(this);
  }
  showDecisionTreePopup(evt){
     bootbox.alert(evt.target.name);
  }
generateDecisionTreeRows(table) {
    var that = this;
      var tbodyData = table.tableData.map(function(rowData,i){
          if(i != 0){
              var rows = rowData.map(function(colData,j) {
                   if(j == 0)
                      return<td key={j} className="cursor" onClick={that.showDecisionTreePopup}><a name={colData}>{colData.slice(0, 80)}...</a></td>;
                      else
                         return  <td key={j}>{colData}</td>    
              });
              return<tr key={i}>{rows}</tr>;
          }
        })
      return tbodyData;
      }
  render() {
   var data = this.props.tableData;
   var className = "table table-bordered"
   if(this.props.classId) 
   className = className+" "+"toggleOff"+" "+"hidden";
   console.log("checking normal tabletable element");
   var headerComponents = generateHeaders(data);
   var rowComponents = this.generateDecisionTreeRows(data);
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
