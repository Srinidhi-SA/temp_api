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

export class NormalTable extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var data = this.props.tableData;
   var className = "table table-bordered"
   if(this.props.classId) 
   className = className+" "+"toggleOff"+" "+"hidden";
   console.log("checking normal tabletable element");
   var headerComponents = generateHeaders(data);
   var rowComponents = generateNormalTableRows(data);
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
