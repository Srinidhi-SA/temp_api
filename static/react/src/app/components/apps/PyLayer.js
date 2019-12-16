import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"
import { RegressionParameter } from "./RegressionParameter";
import {Button} from "react-bootstrap";
import { setPyTorchLayer } from "../../actions/appActions";

@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        pyTorchLayer:store.apps.pyTorchLayer,
    }
})

export class PyLayer extends React.Component {
    constructor(props){
        super(props);
    }

    componentWillMount(){
        let layer = "layer"+ ((this.props.id)-1);
        let lyrDt = { "activation": "none", "dropout": "none", "batch": "none", "unit": "none", "bias": "none" }
        this.props.dispatch(setPyTorchLayer(layer,lyrDt));
    }
    
    renderPyTorchData(parameterData){
        switch (parameterData.paramType) {
            case "list":
                switch(parameterData.displayName){
                    case "Layer":
                        var cls = "form-control single layer";
                        break;
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
                            <select ref={(el) => { this.eleSel = el }} className={cls} /*onChange={this.selecthandleChange.bind(this)} */>
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
                            var type = "number";
                            var classN= "form-control batchCls";
                            break;
                        default:
                            classN= "form-control";
                            var type= "number";
                            break;
                    }
                    return (
                        <div className="col-md-1">
                            <input type={type} className={classN} /*onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() }*/ value={parameterData.defaultValue} /*onChange={this.changeTextboxValue.bind(this)} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} *//>
                            <div className="clearfix"></div>
                            <div className="range-validate text-danger"></div>
                        </div>
                    );
                }else if(parameterData.uiElemType == "slider"){
                    return(
                        <div className="row">                            
                        <div className="col-md-6">
                            <div className="row">
                            <div className="col-md-2">
                                <div className="clr-alt4 gray-box">{parameterData.valueRange[0]}</div>
                            </div>
                            <div className="col-md-2">
                                <div className="clr-alt4 gray-box">{parameterData.valueRange[1]}</div>
                            </div>
                            <div className="col-md-2">
                                <input type="text" className="form-control" value={parameterData.defaultVal} /*onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} onChange={this.changeTextboxValue.bind(this)} placeholder={(this.state.min<1 && this.state.max==1)?"e.g. 0.5-0.7, 0.4, 1":"e.g. 3-10, 10-400, 10"}*/ />
                            <div className="clearfix"></div>
                            <div className="range-validate text-danger"></div>
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                }
                break;
            case "textbox":
                return (
                    <div className="row">
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={parameterData.defaultValue} /*onChange={this.changeTextboxValue.bind(this)}*//>
                        </div>
                    </div>
                );
                break;
            default:
                var defaultCls= "form-control"
                return (
                    <div className="col-md-6">
                        <input type="text" className={defaultCls} value={parameterData.defaultValue} /*onChange={this.changeTextboxValue.bind(this)}*//>
                        <div className="text-danger range-validate" id="error"></div>
                    </div>
                );
        }
    }
    render() {
        let randomNum = Math.random().toString(36).substr(2,8);
        let renderPyTorchLayer = this.props.parameterData.parameters.filter(i=>i.displayName === "Layer")[0].defaultValue[0].parameters.map((layerData,index)=>{
                if(layerData.display){
                    const lyr = this.renderPyTorchData(layerData);
                    return(
                        <div class="form-group">
                            <label class="col-md-2 control-label read">{layerData.displayName}</label>
                            <label class="col-md-4 control-label read">{layerData.description}</label>
                            {lyr}
                            <div class="clearfix"></div> 
                        </div>
                    );
                }
            });
        return (
            <div className="col-md-12">
                <div className="row mb-20">
                    <div class="form-group" id={this.props.id}>
                        Layer {this.props.id}
                        {renderPyTorchLayer}
                    </div>
                </div>
          </div>
        );

    }
}