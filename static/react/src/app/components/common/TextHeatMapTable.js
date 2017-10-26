import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeatMapHeaders,generateHeatMapRows,generateTextHeatMapRows} from "../../helpers/helper";

export class TextHeatMapTable extends React.Component {
  constructor(){
    super();
  }
  
  componentDidMount(){
	  HeatMap("heat-table-map");
  }
 
  render() {
   var data = this.props.tableData;
   var tableTitle ="";
   if(this.props.tableData.topHeader){
   tableTitle = this.props.tableData.topHeader;
   }
   HeatMap("heat-table-map");
   console.log("checking heatmap text  table element");
   var headerComponents = generateHeatMapHeaders(data);
   var rowComponents = generateTextHeatMapRows(data);
   return (
          <div>
           <table className="table table-bordered heat-table-map">
               <thead>{headerComponents}</thead>
               <tbody>{rowComponents}</tbody>
           </table>
		   <div className="text-center">{tableTitle}</div>
		   </div>
       );
  }
}
