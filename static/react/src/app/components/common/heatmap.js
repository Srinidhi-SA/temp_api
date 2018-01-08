import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {getSignalAnalysis} from "../../actions/signalActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeatMapHeaders,generateHeatMapRows} from "../../helpers/helper";
import { Scrollbars } from 'react-custom-scrollbars';

export class HeatMapTable extends React.Component {
  constructor(){
    super();
  }

  componentDidMount(){
	  HeatMap("heat-table-map");
  }

  render() {
   var data = this.props.tableData;
   var tableTitle ="";
   var className = "table table-bordered heat-table-map"
       if(this.props.classId)
    className = className+" "+this.props.classId;
   if(this.props.tableData.topHeader){
   tableTitle = this.props.tableData.topHeader;
   }
   HeatMap("heat-table-map");
   console.log("checking circular chart tabletable element");
   var headerComponents = generateHeatMapHeaders(data);
   var rowComponents = generateHeatMapRows(data);
   return (
          <div className={this.props.classId}>
          <Scrollbars autoHeight autoHeightMin={100} autoHeightMax={800}>
           <table className={className}>
               <thead>{headerComponents}</thead>
               <tbody>{rowComponents}</tbody>
           </table>
           </Scrollbars>
		   <div className="text-center">{tableTitle}</div>

		   </div>
       );
  }
}
