import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";

import { Scrollbars } from 'react-custom-scrollbars';

import {decimalPlaces} from "../../helpers/helper";
import ReactBootstrapSlider from 'react-bootstrap-slider'
import {updateAlgorithmData} from "../../actions/appActions";
import Multiselect from 'react-bootstrap-multiselect-fix';
var data = null,
yformat = null,
cardData = {};

@connect((store) => {
    return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
        chartObject: store.chartObject.chartObj,
        algorithmData:store.apps.regression_algorithm_data,
    };
})

export class RegressionParameter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            min: 0,
            max: 5,
            defaultVal:this.props.parameterData.defaultValue,
            dimentionList: {},
            curdimention: [],
            selectedDimention: []
        };
    }
    componentDidMount() {
        $("#manualBlock_111").addClass("dispnone");
        $("#automaticBlock_111").removeClass("dispnone");
          
    }
    changeSliderValueFromText(e) {
    if (isNaN(e.target.value))
      alert("please enter a valid number")
    else {
      this.setState({
        defaultVal: e.target.value
      })
      //this.state.curmin = Number(e.target.value)
    //  console.log(e.target.value)
     // $("#saveButton").removeClass('btn-alt4')
      //$("#saveButton").addClass('btn-primary')
     // $("#saveButton").removeAttr('disabled')
    }
  }
   changeSliderValue(e) {
    //alert("coming")
    this.setState({
        defaultVal: e.target.value
      });
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value));
      //let updateAlgorithmData = this.props.updateSlider(e.target.value);
  }
  updateSlider(val){
      let algorithmData = $.grep((store.getState().apps.regression_algorithm_data.ALGORITHM_SETTING),function(key,val){
          return(val.algorithmSlug == this.props.algorithmSlug);
      });
      console.log(algorithmData);
  }
  checkSelection(e){
      console.log(e.target.value);
  }
  selecthandleChange(e){
      console.log(e.target.value);
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value));
  }
    renderParameterData(parameterData){
     
            let randomNum = Math.random().toString(36).substr(2,8);
            switch (parameterData.paramType) {
            case "list":
            var optionsTemp =[];
            //optionsTemp.push(<option value={parameterData.displayName} disabled="true">{parameterData.displayName}</option>);
            let options = parameterData.defaultValue;
            for (var prop in options) {
                optionsTemp.push(<option key={prop} className={prop} value={options[prop].name} selected={options[prop].selected}>{options[prop].displayName}</option>);
            }
               return(
                   <div>
                  
                 <select  class="form-control" onChange={this.selecthandleChange.bind(this)}>
                 {optionsTemp}
                 </select>
				
                  
                </div>
               );
                break;
            case "number":
                    this.state.min=0;
                    this.state.max=5;
                let precision = decimalPlaces(this.state.max);
                let step = (1 / Math.pow(10, precision));
                return (
                        <div>
                        <span className="small_box"><input type="number" min = {this.state.min} max = {this.state.max} className="form-control" value={this.state.defaultVal} onChange={this.changeSliderValueFromText.bind(this)} />
                        </span>
                        <span className="small_box_contol">
                        <ReactBootstrapSlider value={this.state.defaultVal} triggerSlideEvent="true" change={this.changeSliderValue.bind(this)} step={step} max={this.state.max} min={this.state.min} tooltip="hide"/>
                        </span>
                        </div>
                       );
            
           break;

            }

       
    }
    render() {
        console.log("card is called!!!! with data:----");
        let parameterData = this.props.parameterData;
        const parameterElements = this.renderParameterData(parameterData);
        return (
                <div class="col-md-4">
                {parameterElements}
                </div>
        );

    }
}
