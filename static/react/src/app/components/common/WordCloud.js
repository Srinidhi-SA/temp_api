import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import renderHTML from 'react-render-html';
import D3WordCloud from 'react-d3-cloud';



export class WordCloud extends React.Component {
  constructor(){
    super();
  }
 
  render() {
	let data =  this.props.jsonData;
	  const fontSizeMapper = word => Math.log2(word.value) * 5;
	  const rotate = word => word.value % 45;
   return (
          <div className="text-center">
          <D3WordCloud
          data={data}
          fontSizeMapper={fontSizeMapper}
          rotate={rotate}
          />
        	</div>
       );
  }
}