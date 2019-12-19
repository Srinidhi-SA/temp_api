import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"
import { RegressionParameter } from "./RegressionParameter";
import {Button} from "react-bootstrap";
import { setPyTorchLayer, updateAlgorithmData } from "../../actions/appActions";
import { ReactBootstrapSlider } from "react-bootstrap-slider";

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
        // let lyrDt = { "activation": {"name":"none"}, "dropout": "none", "batchnormalisation": {"name":"none"}, "units_ip": "none","units_op": "none", "bias": "none" }
        // this.props.dispatch(setPyTorchLayer(1,lyrDt));
    }

    selectHandleChange(parameterData,e){
        let layerArry = this.props.id;
        if(parameterData.name === "activation" || parameterData.name === "batchnormalisation"){
            let layerDt = this.props.pyTorchLayer[layerArry];
            if(layerDt[parameterData.name].name != e.target.value){
                layerDt[parameterData.name] = {"name":"none"}
            }
            layerDt[parameterData.name].name = e.target.value;
            this.props.dispatch(setPyTorchLayer(layerArry,layerDt,parameterData.name))
        }else{
            let newLyrVal = this.props.pyTorchLayer[layerArry];
            newLyrVal[parameterData.name] = e.target.value;
            this.props.dispatch(setPyTorchLayer(layerArry,newLyrVal))
        }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));

    }

    changeTextBoxValue(parameterData,e){
        let layerArry = this.props.id
        let newLyrVal = this.props.pyTorchLayer[layerArry];
        newLyrVal[parameterData.name] = e.target.value;
        this.props.dispatch(setPyTorchLayer(layerArry,newLyrVal))
    }

    setLayerSubParams(subparameterData,defaultParamName,e){
        let layerArry = this.props.id
        let newsubLyrVal = this.props.pyTorchLayer[layerArry];
        newsubLyrVal[defaultParamName][subparameterData.name] = e.target.value;
        this.props.dispatch(setPyTorchLayer(layerArry,newsubLyrVal));
    }

    changeSliderValue(parameterData,e) {
        let layerArry = this.props.id
        let newLyrVal = this.props.pyTorchLayer[layerArry];
        newLyrVal[parameterData.name] = e.target.value;
        this.props.dispatch(setPyTorchLayer(layerArry,newLyrVal));
    }
    getsubParams(item,defaultParamName){
        let arr1 = []
        for(var i=0;i<item.length;i++){
            switch(item[i].uiElemType){
                case "textBox":
                    arr1.push(
                        <div class="row mb-20">
                            <label class="col-md-2">{item[i].displayName}</label>
                            <label class="col-md-4">{item[i].description}</label>
                            <div class="col-md-1">
                                <input type="number" class="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item[i].defaultValue} min="0" max="100" onChange={this.setLayerSubParams.bind(this,item[i],defaultParamName)}/>
                            </div>
                        </div>
                    );
                    break;
                case "checkbox":
                        var options = item[i].defaultValue.map(i=>i.name)
                        var selectedValue = ""
                        var optionsTemp = []
                        optionsTemp.push(<option value="none">--select--</option>)
                        options.map(k => {
                            optionsTemp.push(<option value={k} > {k}</option>)
                        })
                        arr1.push(
                            <div class="row mb-20">
                                <label class="col-md-2">{item[i].displayName}</label>
                                <label class="col-md-4">{item[i].description}</label>
                                <div class = "col-md-3">
                                    <select class="form-control" ref={(el) => { this.eleSel = el }} onChange={this.setLayerSubParams.bind(this,item[i],defaultParamName)}>
                                        {optionsTemp}
                                    </select>
                                </div>
                            </div>
                        );
                    break;
                case "slider":
                    arr1.push(
                        <div class="row mb-20">
                            <label class="col-md-2 control-label read">{item[i].displayName}</label>
                            <label class="col-md-4 control-label read">{item[i].description}</label>
                                <div className="col-md-1">
                                    <input type="number" className="form-control" value={item[i].defaultValue} min={item[i].valueRange[0]} max={item[i].valueRange[1]} onChange={this.setLayerSubParams.bind(this,item[i],defaultParamName)}/>
                                    <div className="clearfix"></div>
                                </div>
                        </div>
                    );
                    break;
                default:
                    arr1.push(
                        <div class="row mb-20">
                            <label class="col-md-2 control-label read">{item[i].displayName}</label>
                            <label class="col-md-4 control-label read">{item[i].description}</label>
                        </div>
                    )
                    break;

            }
        }
        return arr1;
    }
    
    renderPyTorchData(parameterData){
        let lyr = this.props.id
        switch (parameterData.paramType) {
            case "list":
                var options = parameterData.defaultValue
                var selectedValue = ""
                var optionsTemp =[];
                optionsTemp.push(<option>--Select--</option>);
                for (var prop in options) {
                    if(options[prop].selected){
                        selectedValue = options[prop].name;
                    }else if(parameterData.name === "activation"){
                        selectedValue = this.props.pyTorchLayer[lyr].activation.name
                    }else if(parameterData.name === "batchnormalisation"){
                        selectedValue = this.props.pyTorchLayer[lyr].batchnormalisation.name
                    }
                    optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div>
                        <div class="row mb-20">
                            <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                            <label class="col-md-4 control-label read">{parameterData.description}</label>
                            <div className="col-md-3">
                                <select ref={(el) => { this.eleSel = el }} className="form-control" onChange={this.selectHandleChange.bind(this,parameterData)} >
                                    {optionsTemp}
                                </select>
                            </div>
                            <div class="clearfix"></div> 
                        </div>
                        <div>
                            {(selectedValue != "none" && selectedValue != "" && selectedValue != "undefined" && selectedValue != "bias" )?
                                <div>
                                    {this.getsubParams((options.filter(i=>i.name===selectedValue)[0].parameters),parameterData.name)}
                                </div>
                            :""}
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
                        <div class="row mb-20">
                            <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                            <label class="col-md-4 control-label read">{parameterData.description}</label>
                            <div className="col-md-1">
                                <input type={type} className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } value={parameterData.defaultValue} onChange={this.changeTextBoxValue.bind(this,parameterData)} /*onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} *//>
                            </div>
                            <div class="clearfix"></div> 
                        </div>
                    );
                }else if(parameterData.uiElemType == "slider"){
                    return(
                        <div class="row mb-20">
                            <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                            <label class="col-md-4 control-label read">{parameterData.description}</label>
                                <div className="col-md-1">
                                    <input type="number" className="form-control" value={parameterData.defaultVal} min={parameterData.valueRange[0]} max={parameterData.valueRange[1]} onChange={this.changeTextBoxValue.bind(this,parameterData)} />
                                    <div className="clearfix"></div>
                                </div>
                            <div class="clearfix"></div> 
                        </div>
                                
                    );
                }
                break;
            case "textbox":
                return (
                    <div className="row">
                        <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                        <label class="col-md-4 control-label read">{parameterData.description}</label>
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={parameterData.defaultValue} onChange={this.changeTextBoxValue.bind(this,parameterData)}/>
                        </div>
                    </div>
                );
                break;
            default:
                var defaultCls= "form-control"
                return (
                    <div className="col-md-6">
                        <input type="text" className={defaultCls} value={parameterData.defaultValue} onChange={this.changeTextBoxValue.bind(this,parameterData)}/>
                        <div className="text-danger range-validate" id="error"></div>
                    </div>
                );
        }
    }
    render() {
        var cls =`row layerPanel ${this.props.id}`
        let renderPyTorchLayer = this.props.parameterData.parameters.filter(i=>i.displayName === "Layer")[0].defaultValue[0].parameters.map((layerData,index)=>{
                if(layerData.display){
                    const lyr = this.renderPyTorchData(layerData);
                    return(
                        <div>
                            {lyr}
                        </div>
                    );
                }
            });
        return (
            <div class={cls}>
                <div class="layer">
                    <div class="layerHeader" id={this.props.id}>
                        Layer {this.props.id}
                        <i className="fa fa-chevron-up" type="button" data-toggle="collapse" data-target={`#collapseExample${this.props.id}`} aria-expanded="true" aria-controls={`collapseExample${this.props.id}`}>
                        </i>
                    </div>
                    <div className="collapse in" id={`collapseExample${this.props.id}`}>
                        <div className="card card-body">
                            <div class="layerBody">
                                {renderPyTorchLayer}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}