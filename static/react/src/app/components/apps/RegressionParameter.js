import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";

import { Scrollbars } from 'react-custom-scrollbars';

import {decimalPlaces} from "../../helpers/helper";
import ReactBootstrapSlider from 'react-bootstrap-slider';
import {updateAlgorithmData} from "../../actions/appActions";

@connect((store) => {
    return {login_response: store.login.login_response, signal: store.signals.signalAnalysis,
        chartObject: store.chartObject.chartObj,
        algorithmData:store.apps.regression_algorithm_data,
        isAutomatic:store.apps.regression_isAutomatic,
        automaticAlgorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
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

    componentWillReceiveProps(nextProps) {
        if (this.props.parameterData.acceptedValue !== nextProps.parameterData.acceptedValue && nextProps.parameterData.acceptedValue == null) {
            this.setState({
            defaultVal:this.props.parameterData.defaultValue,
            });
        }
        if (this.props.tuneName != "none" && nextProps.tuneName != "none" && this.props.tuneName !== nextProps.tuneName && this.props.parameterData.paramType == "list" && this.props.type == "TuningParameter")
        setTimeout(function(){ $('.multi').multiselect('refresh'); }, 0);
    }

   
    componentWillMount(){
        $(".single").multiselect('destroy');
        
    }
    componentDidUpdate(){
        var that = this;
        if(this.props.parameterData.paramType == "list" && this.props.type == "TuningParameter")
        {
            
        $(this.eleSel).multiselect({
            onChange: function(option, checked, select) {
            that.props.dispatch(updateAlgorithmData(that.props.algorithmSlug,that.props.parameterData.name,$(option).val(),that.props.type));
           }
        });
        }
    }
    changeSliderValueFromText(e) {
        if (isNaN(e.target.value))
            alert("please enter a valid number")
        else {
            this.setState({
            defaultVal: e.target.value
            })
            this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
        }
    }
    changeSliderValue(e) {
        this.setState({
        defaultVal: e.target.value
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    selecthandleChange(e){
        console.log(e.target.value);
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    checkChangeTextboxValue(min,max,e){
        var validateResult = {"iserror":false,"errmsg":""};
        validateResult = this.validateTextboxValue(e.target.value,min,max);
        if(validateResult && validateResult.iserror){
            e.target.parentElement.nextElementSibling.innerHTML=validateResult.errmsg;
            e.target.focus();
        }
        this.setState({
        defaultVal: e.target.value
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    changeTextboxValue(e){
        if(e.target.parentElement.nextElementSibling != null)
        e.target.parentElement.nextElementSibling.innerHTML="";
        this.setState({
        defaultVal: e.target.value
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    handleCheckboxEvents(e){
        this.setState({
        defaultVal: e.target.checked
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.checked,this.props.type));
    }
    renderParameterData(parameterData,tune){
     
            let randomNum = Math.random().toString(36).substr(2,8);
            switch (parameterData.paramType) {
            case "list":
            var optionsTemp =[];
            var cls = "form-control single";
            //optionsTemp.push(<option value={parameterData.displayName} disabled="true">{parameterData.displayName}</option>);
            let options = parameterData.defaultValue;
            if(tune){
                cls = "form-control multi";
                var selectedValue =[];
               for (var prop in options) {
                if(options[prop].selected)
                selectedValue.push(options[prop].name)
                optionsTemp.push(<option key={prop} className={prop} value={options[prop].name} selected={options[prop].selected?"selected":""}>{options[prop].displayName}</option>);
            } 
            }
            else{
                var selectedValue="";
            for (var prop in options) {
                if(options[prop].selected)
                selectedValue = options[prop].name;
                optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
            }
            }
               return(
                   <div className="row">
                  <div className="col-md-6">
                 <select ref={(el) => { this.eleSel = el }} className={cls} onChange={this.selecthandleChange.bind(this)} value={selectedValue} multiple={tune?"multiple":false}>
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
                            <input type="number" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}/>
                        </div>
                        </div>
                       );
                }
                else if(parameterData.uiElemType == "slider"){
                    if(tune){
                        return(
                            <div className="row">                            
                            <div className="col-md-12 col-sm-2">
                                <div className="col-xs-1 clr-alt4">{this.state.min}</div>
                                <div className="col-xs-1 xs-ml-10 clr-alt4"> {this.state.max}</div>
                                <div className="col-md-6">
                                    <input type="text" className="form-control" value={this.state.defaultVal} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max)} onChange={this.changeTextboxValue.bind(this)} placeholder="e.g. 1-3, 4, 5-10"/>
                                </div>
                                <div className="col-xs-3 text-danger"></div>
                            </div>
                            </div>
                        );
                    }
                    else{
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
                                
                                    <div className="col-xs-1 clr-alt4">{this.state.min}</div>
                                    <div className="col-xs-10">
                                    <ReactBootstrapSlider value={this.state.defaultVal} triggerSlideEvent="true" change={this.changeSliderValue.bind(this)} step={step} max={this.state.max} min={this.state.min}/>
                                    </div>
                                    <div className="col-xs-1 clr-alt4"> {this.state.max}</div>
                                 
                            </div>
                            <div className="col-md-2 col-sm-2"><input type="number" min = {this.state.min} max = {this.state.max} className="form-control" value={this.state.defaultVal} onChange={this.changeSliderValueFromText.bind(this)}/>
                            </div>
                            </div>
                        );
                    }
                }
            
            break;
            case "textbox":
                 return (
                     <div className="row">
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}/>
                        </div>
                        </div>
                       );
            break;
            case "boolean":
           var chkBox = this.props.uniqueTag+this.props.parameterData.name;
         
                 return ( 
                        <div className="ma-checkbox inline"><input  type="checkbox" id={chkBox} name={chkBox} onChange={this.handleCheckboxEvents.bind(this)} checked={this.state.defaultVal}/><label htmlFor={chkBox}>&nbsp;</label>
                        </div> 

                       );
            
            break;
            default:
                return (
                    <div className="row">
                    <div className="col-md-6">
                    <input type="text" className="form-control" value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}/>
                    </div>
                    </div>
                );

            }

       
    }
    render() {
        console.log("card is called!!!! with data:----");
        let parameterData = this.props.parameterData;
        let tune = this.props.isTuning;
        const parameterElements = this.renderParameterData(parameterData,tune);
        return (
                <div class="col-md-6">
                {parameterElements}
                </div>
        );

    }
    
    validateTextboxValue(textboxVal,min,max){
        const regex = /^\s*([0-9]*)\s*-\s*([0-9]*)\s*$/;
        const parts = textboxVal.split(/,|\u3001/);
        for (let i = 0; i < parts.length; ++i)
        {
            const match = parts[i].match(regex);
            if (match) {
                if (!this.isPositiveInteger(match[1]) && match[1] !== '')
                return {"iserror":true,"errmsg":"Invalid Range"};
                else if (!this.isPositiveInteger(match[2]) && match[2] !== '')
                return {"iserror":true,"errmsg":"Invalid Range"};
                const from = match[1] ? parseInt(match[1], 10) : min;
                const to = match[2] ? parseInt(match[2], 10) : max;
                if (from > to || from < min || from > max)
                return {"iserror":true,"errmsg":"Invalid Range"};
                if (to > max || to < min || to > max)
                return {"iserror":true,"errmsg":"Invalid Range"};
            }
            else{
                if (!this.isPositiveInteger(parts[i]))
                return {"iserror":true,"errmsg":"Invalid Range"};
                const singleNumber = parseInt(parts[i], 10);
                if (singleNumber > max || singleNumber < min)
                return {"iserror":true,"errmsg":"Invalid Range"};
            }
        }
    }
    isPositiveInteger(value) {
        return parseInt(value, 10) >= 0;
    }
    isInteger(toTest) {
        nu
        const numericExp = /^\s*[0-9]+\s*$/;
        return numericExp.test(toTest);
    }
}
