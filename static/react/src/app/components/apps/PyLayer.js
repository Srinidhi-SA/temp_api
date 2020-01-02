import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {statusMessages} from  "../../helpers/helper"
import { RegressionParameter } from "./RegressionParameter";
import {Button} from "react-bootstrap";
import { setPyTorchLayer, updateAlgorithmData, pytorchValidateFlag, deletePyTorchLayer } from "../../actions/appActions";
import { ReactBootstrapSlider } from "react-bootstrap-slider";

@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        pyTorchLayer:store.apps.pyTorchLayer,
        idLayer:store.apps.idLayer,
    }
})

export class PyLayer extends React.Component {
    constructor(props){
        super(props);
    }

    deleteLayer(layerNumber){
        let newIdArray = this.props.idLayer.filter(function (items) {
            return items != layerNumber
        });
        this.props.dispatch(deletePyTorchLayer(layerNumber,newIdArray));
    }

    selectHandleChange(parameterData,e){
        let layerArry = this.props.idNum;
        if(parameterData.name === "activation" || parameterData.name === "batchnormalization" || parameterData.name === "dropout"){
            let layerDt = this.props.pyTorchLayer[layerArry];
            if(layerDt[parameterData.name].name != e.target.value){
                layerDt[parameterData.name] = {"name":"None"}
            }
            layerDt[parameterData.name].name = e.target.value;
            let defValArr = parameterData.defaultValue.filter(i=>(i.displayName===e.target.value))[0];
            if(defValArr != undefined)
                if(defValArr.parameters != null)
                    defValArr.parameters.map(idx=>{
                        if(idx.name === "add_bias_kv" || idx.name === "add_zero_attn" || idx.name === "bias" || idx.name === "head_bias" || idx.name === "affine" || idx.name === "track_running_stats"){
                            let subDefaultVal = idx.defaultValue.filter(sel=>sel.selected)[0];
                            let defVal = layerDt[parameterData.name];
                            if(subDefaultVal === undefined){
                                subDefaultVal = "false";
                                defVal[idx.name] = subDefaultVal;
                            }   
                            else
                                defVal[idx.name] = subDefaultVal.name;
                        }else{
                            let defVal = layerDt[parameterData.name];
                            defVal[idx.name] = idx.defaultValue;
                        }
                    });
            this.props.dispatch(setPyTorchLayer(parseInt(layerArry),layerDt,parameterData.name))
        }else{
            let newLyrVal = this.props.pyTorchLayer[layerArry];
            newLyrVal[parameterData.name] = e.target.value;
            let defValArr = parameterData.defaultValue.filter(i=>(i.name===e.target.value))[0];
            if(parameterData.name != "bias"){
                defValArr.parameters.map(idx=>{
                    let defVal = layerDt[parameterData.name];
                    defVal[idx.name] = idx.defaultValue;
                });
            }
            this.props.dispatch(setPyTorchLayer(parseInt(layerArry),newLyrVal))
        }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));

    }

    changeTextBoxValue(parameterData,e){
        let name = parameterData.name;
        let val = e.target.value;
        if(!Number.isInteger(parseFloat(val)) ){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(val === ""){
            e.target.parentElement.lastElementChild.innerHTML = "Enter value"
        }
        else if(val<=0){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be greater than 0"
        }
        else{
            e.target.parentElement.lastElementChild.innerHTML = ""
        }
        if(!this.props.pytorchValidateFlag){
            let layerArry = this.props.idNum
            let newLyrVal = this.props.pyTorchLayer[layerArry];
            newLyrVal[parameterData.name] = val;
            this.props.dispatch(setPyTorchLayer(parseInt(layerArry),newLyrVal))
        }
    }
    setChangeLayerSubParams(subparameterData,defaultParamName,e){
        this.props.dispatch(pytorchValidateFlag(true));
            e.target.parentElement.lastElementChild.innerHTML = ""
            let layerArry = this.props.idNum
            let newsubLyrVal = this.props.pyTorchLayer[layerArry];
            newsubLyrVal[defaultParamName][subparameterData.name] = e.target.value;
            this.props.dispatch(setPyTorchLayer(parseInt(layerArry),newsubLyrVal));
    }
    setLayerSubParams(subparameterData,defaultParamName,e){
        let name = subparameterData.name;
        let val = e.target.value;
        if(name === "alpha" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "lambd" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "min_val" && (val>1 || val<-1) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "max_val" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "negative_slope" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "embed_dim" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "num_heads" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "kdim" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "vdim" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "init" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "lower" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "upper" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "beta" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "threshold" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "num_features" && (!(Number.isInteger(parseFloat(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "eps" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "momentum" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "p" && (val<0 || val>1 || val === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else{
            this.props.dispatch(pytorchValidateFlag(true));
            e.target.parentElement.lastElementChild.innerHTML = ""
            let layerArry = this.props.idNum
            let newsubLyrVal = this.props.pyTorchLayer[layerArry];
            newsubLyrVal[defaultParamName][subparameterData.name] = parseFloat(e.target.value);
            this.props.dispatch(setPyTorchLayer(parseInt(layerArry),newsubLyrVal));
        }
    }

    getsubParams(item,defaultParamName){
        let arr1 = []
        for(var i=0;i<item.length;i++){
            switch(item[i].uiElemType){
                case "textBox":
                    var mandateField = ["alpha","lambd","min_val","max_val","negative_slope","dropout","kdim","vdim","init","lower","upper","beta","threshold","threshold","value","div_value","eps","momentum","num_features"];
                    arr1.push(
                        <div class="row mb-20">
                            <label className={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                            <label className ="col-md-4">{item[i].description}</label>
                            <div className="col-md-1">
                                <input type="number" class="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item[i].defaultValue} onChange={this.setLayerSubParams.bind(this,item[i],defaultParamName)}/>
                                <div className="error"></div>
                            </div>
                        </div>
                    );
                    break;
                case "checkbox":
                        var options = item[i].defaultValue.map(i=>i.name)
                        var mandateField = ["bias","add_bias_kv","add_zero_attn","head_bias","track_running_stats","affine"];
                        var selectedValue = ""
                        var optionsTemp = []
                        optionsTemp.push(<option value="None">--select--</option>)
                        options.map(k => {
                            optionsTemp.push(<option value={k} > {k}</option>)
                        })
                        arr1.push(
                            <div class="row mb-20">
                                <label className={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                <label className="col-md-4">{item[i].description}</label>
                                <div className = "col-md-3">
                                    <select className="form-control" ref={(el) => { this.eleSel = el }} onChange={this.setChangeLayerSubParams.bind(this,item[i],defaultParamName)}>
                                        {optionsTemp}
                                    </select>
                                    <div className="error"></div>
                                </div>
                            </div>
                        );
                    break;
                case "slider":
                    var mandateField =["num_parameters","p"]
                    arr1.push(
                        <div class="row mb-20">
                            <label className={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                            <label className="col-md-4">{item[i].description}</label>
                                <div className="col-md-1">
                                    <input type="number" className="form-control p" defaultValue={item[i].defaultValue} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } onChange={this.setLayerSubParams.bind(this,item[i],defaultParamName)}/>
                                    <div className="error"></div>
                                </div>
                        </div>
                    );
                    break;
                default:
                    arr1.push(
                        <div className="row mb-20">
                            <label className="col-md-2">{item[i].displayName}</label>
                            <label className="col-md-4">{item[i].description}</label>
                        </div>
                    )
                    break;

            }
        }
        return arr1;
    }
    
    renderPyTorchData(parameterData){
        let lyr = this.props.idNum
        switch (parameterData.paramType) {
            case "list":
                var options = parameterData.defaultValue
                var mandateField= ["Bias"]
                var selectedValue = ""
                var optionsTemp =[];
                optionsTemp.push(<option value="None">--Select--</option>)
                for (var prop in options) {
                    if(options[prop].selected){
                        selectedValue = options[prop].name;
                    }else if(parameterData.name === "activation"){
                        selectedValue = this.props.pyTorchLayer[lyr].activation.name
                    }else if(parameterData.name === "batchnormalization"){
                        selectedValue = this.props.pyTorchLayer[lyr].batchnormalization.name
                    }else if(parameterData.name === "dropout"){
                        selectedValue = this.props.pyTorchLayer[lyr].dropout.name
                    }
                    optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div>
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label className = "col-md-4">{parameterData.description}</label>
                            <div className = "col-md-3">
                                <select ref={(el) => { this.eleSel = el }} className="form-control" onChange={this.selectHandleChange.bind(this,parameterData)} >
                                    {optionsTemp}
                                </select>
                                <div className = "error"></div>
                            </div>
                        </div>
                        {(selectedValue != "None" && selectedValue != "" && selectedValue != "undefined" && selectedValue != "bias" )?
                                parameterData.displayName === "dropout"?
                                    <div> {this.getsubParams((options.filter(i=>i.name===selectedValue)[0].parameters),parameterData.name)} </div>
                                :
                                options.filter(i=>i.name === selectedValue)[0].parameters === null?"":
                                    <div> {this.getsubParams((options.filter(i=>i.name===selectedValue)[0].parameters),parameterData.name)} </div>
                                :""
                            }
                        <div className = "clearfix"></div>
                    </div>
                   );
                break;
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    var mandateField = ["Input Units","Output Units","Dropout"]
                    switch(parameterData.displayName){
                        case "Input Units":
                            var type = "number";
                            var classN= "form-control input_unit";
                            break;
                        case "Output Units":
                            var type = "number";
                            var classN= "form-control output_unit";
                            break;
                        default:
                            classN= "form-control";
                            var type= "number";
                            break;
                    }
                    return (
                        <div className="row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label className = "col-md-4">{parameterData.description}</label>
                            <div className = "col-md-1">
                                <input type={type} className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={parameterData.defaultValue} onChange={this.changeTextBoxValue.bind(this,parameterData)} /*disabled={((parameterData.displayName === "Input Units") && (this.props.id === 1))?true:false} *//>
                                <div className = "error"></div>
                            </div>
                            <div class = "clearfix"></div> 
                        </div>
                    );
                }else if(parameterData.uiElemType == "slider"){
                    var mandateField = ["dropout"]
                    return(
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label className = "col-md-4">{parameterData.description}</label>
                                <div className="col-md-1">
                                    <input type="number" className="form-control" defaultValue={parameterData.defaultVal} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } onChange={this.changeTextBoxValue.bind(this,parameterData)}/>
                                    <div className="error"></div>
                                </div>
                            <div class="clearfix"></div> 
                        </div>
                                
                    );
                }
                break;
            default:
                return (
                    <div className = "row mb-20">
                        <label className="col-md-4">{parameterData.displayName}</label>
                        <label className="col-md-4">{parameterData.description}</label>
                        <div className="error"></div>
                    </div>
                );
        }
    }
    render() {
        var cls =`row layerPanel ${this.props.idNum}`
        var clsId = `layer${this.props.idNum}`
        let renderPyTorchLayer = this.props.parameterData.parameters.filter(i=>i.displayName === "Layer")[0].defaultValue[0].parameters.map((layerData,index)=>{
                if(layerData.display){
                    const lyr = this.renderPyTorchData(layerData);
                    var formClassName =`form-group row ${layerData.name}`
                    return(
                        <div className = {formClassName}>
                            {lyr}
                        </div>
                    );
                }
            });
        return (
            <div class={cls} id={clsId} style={{'marginRight':'3%'}}>
                <div class="layer">
                    <div class="layerHeader" id={this.props.idNum}>
                        Linear Layer {this.props.idNum}
                        <i className="fa fa-chevron-up" type="button" data-toggle="collapse" data-target={`#collapseExample${this.props.idNum}`} aria-expanded="true" aria-controls={`collapseExample${this.props.idNum}`} />
                        {(this.props.idLayer.length === this.props.idNum)?
                            <i className="fa fa-trash pull-right" type="button" onClick={this.deleteLayer.bind(this,this.props.idNum)}/>
                            :""
                        }
                    </div>
                    <div className="collapse in" id={`collapseExample${this.props.idNum}`}>
                        <div className="card card-body">
                            <div class="layerBody" style={{'paddingLeft':'15px'}}>
                                {renderPyTorchLayer}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}