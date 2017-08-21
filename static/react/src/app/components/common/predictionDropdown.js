import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import store from "../../store";
import {showPredictions} from "../../actions/signalActions";
import renderHTML from 'react-render-html';

@connect((store) => {
  return { selPrediction: store.signals.selectedPrediction};
})

export class PredictionDropDown extends React.Component {
  constructor(){
    super();
  }
  
  componentDidMount(){
	// var sel =$('#prediction_dropdown').val());
	// this.props.dispatch(showPredictions(sel));
	console.log(this.props.selPrediction);
	  
  }
  componentWillMount(){
	  var sel= null;
	  var data = this.props.jsonData;
	  console.log("----");
	  console.log(data);
	   for (var prop in data) {
           sel= prop;
		   break;
       }
	 this.props.dispatch(showPredictions(sel));  
	  
  }
  
 checkSelection(e){
	 console.log("change predictive dropdown");
	  var sel =$('#prediction_dropdown').val();
	 this.props.dispatch(showPredictions(sel));
 }
 
  render() {
   var data = this.props.jsonData;
   var optionsTemp =[], desc=""; // ulHead ="";
   console.log("prediction dropdown component");
   for (var prop in data) {
        optionsTemp.push(<option key={prop} className={prop} value={prop}>{prop}</option>);
    }
	if(this.props.selPrediction){
		
		for (var prop in data) {
			if(prop == this.props.selPrediction){
				//ulHead =  prop;
				data[prop].forEach(function(item){
				 //desc+='<li>'+data[prop]+'</li>';
				 desc+='<li>'+item+'</li>';
				});
				 break;
			}
           
      }
	}

  
  
   
   return (
           <div>
		    <select id="prediction_dropdown" name="selectbasic" class="form-control" onChange={this.checkSelection.bind(this)}>
				{optionsTemp}
				</select>
			<div className="prediction_li">	
			<br/>
			<ul>
			  {renderHTML(desc)}
			</ul>
			</div>
		   
		   </div>
       );
  }
}
