import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeatMapHeaders,generateHeatMapRows} from "../../helpers/helper";

export class HeatMapTable extends React.Component {
  constructor(){
    super();
  }
  
  componentDidMount(){
	  HeatMap("heat-table-map");
  }
 
  render() {
   var data = this.props.tableData;
   console.log("checking circular chart tabletable element");
   var headerComponents = generateHeatMapHeaders(data);
   var rowComponents = generateHeatMapRows(data);
   return (
           <table className="table table-bordered heat-table-map">
               <thead>{headerComponents}</thead>
               <tbody>{rowComponents}</tbody>
           </table>
       );
  }
}
