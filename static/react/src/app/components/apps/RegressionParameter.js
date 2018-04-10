import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";

import { Scrollbars } from 'react-custom-scrollbars';

import {decimalPlaces} from "../../helpers/helper";
import ReactBootstrapSlider from 'react-bootstrap-slider'
import {updateAlgorithmData} from "../../actions/appActions";

@connect((store) => {
    return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
        chartObject: store.chartObject.chartObj,
        algorithmData:store.apps.regression_algorithm_data,
        isAutomatic:store.apps.regression_isAutomatic,
    };
})

export class RegressionParameter extends React.Component {
    constructor(props) {
        super(props);
        if(this.props.parameterData.paramType == "number")
        this.state = {
            min: this.props.parameterData.valueRange[0],
            max: this.props.parameterData.valueRange[1],
            defaultVal:this.props.parameterData.defaultValue,
        };
        else
        this.state = {
            defaultVal:this.props.parameterData.defaultValue,
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
    }
  }
   changeSliderValue(e) {
    this.setState({
        defaultVal: e.target.value
      });
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value));
  }
  selecthandleChange(e){
      console.log(e.target.value);
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value));
  }
  changeTextboxValue(e){
      console.log(e.target.value);
      this.setState({
        defaultVal: e.target.value
      });
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value));
  }
  handleCheckboxEvents(e){
       this.setState({
        defaultVal: e.target.checked
      });
      this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.checked));
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
                   <div className="row">
                  <div className="col-md-6">
                 <select  class="form-control" onChange={this.selecthandleChange.bind(this)} disabled={store.getState().apps.regression_isAutomatic == 1}>
                 {optionsTemp}
                 </select>
				</div>
                  
                </div>
               );
                break;
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    return (
                         <div className="row">
                        <div className="col-md-6">
                            <input type="number" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)} disabled={store.getState().apps.regression_isAutomatic == 1}/>
                        </div>
                        </div>
                       );
                }
                else if(parameterData.uiElemType == "slider"){
                    let diff = this.state.max - this.state.min;
                    if(diff <= 1)
                    var step = 0.1;
                    else{
                    let precision = decimalPlaces(this.state.max);
                    var step = (1 / Math.pow(10, precision));
                    }
                    return (
                            <div className="row">                            
                            <div className="col-md-8 col-sm-2">
                                
                                    <div className="col-xs-1">{this.state.min}</div>
                                    <div className="col-xs-10">
                                    <ReactBootstrapSlider value={this.state.defaultVal} triggerSlideEvent="true" change={this.changeSliderValue.bind(this)} step={step} max={this.state.max} min={this.state.min} tooltip="hide" disabled={store.getState().apps.regression_isAutomatic == 1?"disabled":""}/>
                                    </div>
                                    <div className="col-xs-1"> {this.state.max}</div>
                                 
                            </div>
                            <div className="col-md-2 col-sm-2"><input type="number" min = {this.state.min} max = {this.state.max} className="form-control" value={this.state.defaultVal} onChange={this.changeSliderValueFromText.bind(this)} disabled={store.getState().apps.regression_isAutomatic == 1}/>
                            </div>
                            </div>
                        );
                }
            
            break;
            case "textbox":
                 return (
                     <div className="row">
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)} disabled={store.getState().apps.regression_isAutomatic == 1}/>
                        </div>
                        </div>
                       );
            break;
            case "boolean":
           
           var chkBox = this.props.uniqueTag+this.props.parameterData.name;
         
                 return ( 
                        <div className="ma-checkbox inline"><input  type="checkbox" id={chkBox} name={chkBox} onChange={this.handleCheckboxEvents.bind(this)} checked={this.state.defaultVal} disabled={store.getState().apps.regression_isAutomatic == 1}/><label htmlFor={chkBox}>&nbsp;</label>
                        </div> 

                       );
            
            break;
            default:
                return (
                    <div className="row">
                    <div className="col-md-6">
                    <input type="text" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)} disabled={store.getState().apps.regression_isAutomatic == 1}/>
                    </div>
                    </div>
                );

            }

       
    }
    render() {
        console.log("card is called!!!! with data:----");
        let parameterData = this.props.parameterData;
        const parameterElements = this.renderParameterData(parameterData);
        return (
                <div class="col-md-8">
                {parameterElements}
                </div>
        );

    }
}
