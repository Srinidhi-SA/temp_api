import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"
import { RegressionParameter } from "./RegressionParameter";

@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
    }
})

export class PyTorch extends React.Component {
    constructor(props){
        super(props);
    }
    renderPyTorchData(parameterData,tune){
        switch (parameterData.paramType) {
            case "list":
                switch(parameterData.name){
                    default:
                       var cls= "form-control single";
                }
                var options = parameterData.defaultValue
                var selectedValue = ""
                var optionsTemp =[];
                for (var prop in options) {
                    if(options[prop].selected)
                        selectedValue = options[prop].name;
                    optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div className= {"row"}>
                        <div className="col-md-3">
                            <select ref={(el) => { this.eleSel = el }} className={"form-control single"} /*onConChange={this.selecthandleChange.bind(this)} multiple={false}*/>
                                {optionsTemp}
                            </select>
                        </div>
                    </div>
                   );
                break;
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    switch(parameterData.displayName){
                        case "Batch Size":
                            var classN= "form-control batchCls";
                            break;
                        case "Number of Epochs":
                            classN = "form-control epochsCls"
                            break;
                        default:
                            classN= "form-control";
                            var type= "number";
                            break;
                    }
                    return (
                        <div className="row">
                            <div className="col-md-2">
                                <input type={type} className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } /*value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} *//>
                                <div className="clearfix"></div>
                                <div className="range-validate text-danger"></div>
                            </div>
                        </div>
                    );
                }
                break;
            case "textbox":
                return (
                    <div className="row">
                        <div className="col-md-6">
                            <input type="text" className="form-control" /*value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}*//>
                        </div>
                    </div>
                );
            default:
                defaultCls= "form-control"
                return (
                    <div className="row">
                    <div className="col-md-6">
                    <input type="text" className={defaultCls} /*value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}*//>
                    <div className="text-danger range-validate" id="error"></div>
                    </div>
                    </div>
                );
        }
    }
    render() {
        let pyTochData = this.props.algorithmData.filter(i=>i.algorithmName === "PyTorch")[0];
        let renderPyTorchContent = pyTochData.parameters.map((pydata,index) =>{
            if(pydata.display){
                const pyTorchparams = this.renderPyTorchData(pydata);
                return(
                    <div class="form-group">
                        <label class="col-md-2 control-label read">{pydata.displayName}</label>
                        <label class="col-md-4 control-label read">{pydata.description}</label>
                        {pyTorchparams}
                        {/* <RegressionParameter parameterData={pydata} algorithmSlug={pyTochData.algorithmSlug} /> */}
                    <div class="clearfix"></div> 
                    </div>

                );
            }
        });
        return (
            <div className="col-md-12">
                <div className="row mb-20">
                    <div class="form-group">
                        {renderPyTorchContent}
                    </div>
                </div>
          </div>
        );

    }
}
