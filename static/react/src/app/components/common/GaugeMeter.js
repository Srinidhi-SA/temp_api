import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateCircularChartRows} from "../../helpers/helper";
import ReactSpeedometer from "../../local_modules/react-d3-speedometer-enabled-decimals";

export class GaugeMeter extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var data = this.props.jsonData;
   console.log("checking GaugeMeter element");
   return (
          <div className="gauageMeter">
        	    <ReactSpeedometer
        	        minValue={data.min}
        	        maxValue={data.max}
        	        value={data.value}
        	    segments={data.segments}
        	        needleColor="#333"
        	        endColor="#005662"
        	         startColor="#0fc4b5"
        	    />
        	</div>
       );
  }
}
