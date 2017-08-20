import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';
import {generateHeaders,generateCircularChartRows} from "../../helpers/helper";
var dateFormat = require('dateformat');

export class DetailOverlay extends React.Component {
  constructor(){
    super();
  }
 
  render() {
   var details = this.props.details;
   console.log("In overlay element");
   console.log(this.props.details)
   return (
		   <div>
           <h4>Created By :
             <span className="text-primary">{sessionStorage.userName}</span>
           </h4>
           <h5>Updated on :
             <mark>{dateFormat(details.updated_on, "mmmm d,yyyy h:MM")}</mark>
           </h5>
           <hr className="hr-popover"/>
           <p>
             Data Set : {details.dataset}<br/>
             Variable selected : <br/>
             Variable type : </p>
           <hr className="hr-popover"/>
           <h4 className="text-primary">Analysis List</h4>
           <ul className="list-unstyled">
             <li>
               <i className="fa fa-check"></i>
               12</li>
           </ul>
           <div className="clearfix"></div>
         </div>
       );
  }
}
