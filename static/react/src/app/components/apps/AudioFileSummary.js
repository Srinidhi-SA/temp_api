import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {} from "../../actions/appActions";
import {C3Chart} from "../c3Chart";
import renderHTML from 'react-render-html';
import HeatMap from '../../helpers/heatmap';


@connect((store) => {
	return {login_response: store.login.login_response,
	};
})

export class AppsLoader extends React.Component {
  constructor(){
    super();
  }

  render() {
   return (
		   <div className="side-body">
           <div className="main-content">
           Audio File Summary.....
         </div>
       </div>
       );
  }
}
