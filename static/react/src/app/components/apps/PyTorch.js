import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {PyLayer} from "./PyLayer";
import { updateAlgorithmData, setPyTorchSubParams, setPyTorchLayer, pytorchValidateFlag } from "../../actions/appActions";
import {statusMessages} from  "../../helpers/helper"
@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        pyTorchLayer:store.apps.pyTorchLayer,
        dataPreview:store.datasets.dataPreview,
        datasetRow: store.datasets.dataPreview.meta_data.uiMetaData.metaDataUI[0].value,
        pyTorchSubParams:store.apps.pyTorchSubParams,
    }
})

export class PyTorch extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            addLayer : false,
            idLayer : [],
        }
    }

    componentWillMount(){
        let subParamDt = { "loss": {"loss":"none"}, "optimizer": {"optimizer":"none"}, "batch_size": this.props.datasetRow-1, "number_of_epochs": 100 }
        this.props.dispatch(setPyTorchSubParams(subParamDt));
    }

    handleAddLayer(){
        let layer = Object.keys(this.props.pyTorchLayer).length+1
        let lyrDt = { "activation": {"name":"none"}, "dropout": "none", "batchnormalisation": {"name":"none"}, "units_ip": "none","units_op": "none", "bias": "none" }
        this.props.dispatch(setPyTorchLayer(layer,lyrDt));
        const newLayer = this.state.idLayer.length + 1
        this.setState({
            addLayer:true,
            idLayer:this.state.idLayer.concat([newLayer])
        });
    }

    handleClick(){
        if ($(".Loss option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Loss.", "small_mascot"));
        }
        else if($(".Optimizer option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Optimizer.", "small_mascot"));
        }
        else{
            this.props.dispatch(pytorchValidateFlag(true));
       }

        if(store.getState().datasets.pytorchValidateFlag){
            this.handleAddLayer();
            }
    }

    selectHandleChange(parameterData,e){
        if(parameterData.name === "loss" || parameterData.name === "optimizer"){
            let subParamDt = this.props.pyTorchSubParams;
            if(parameterData.name === "loss")
                subParamDt[parameterData.name] = {"loss":"none"}
            else 
                subParamDt[parameterData.name] = {"optimizer":"none"}
            let subParam = subParamDt[parameterData.name];
            subParam[parameterData.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamDt));
        }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    changeTextboxValue(parameterData,e){
      let name = parameterData.name;
      let val = e.target.value === "--Select--"? null:e.target.value;
      if(name=="number_of_epochs" && val<1){
      e.target.parentElement.lastElementChild.innerHTML = "value range is 1 to infinity"
      }
      else if(name=="batch_size" && (val < 0 ) || (val > this.props.datasetRow-1)){
        e.target.parentElement.lastElementChild.innerHTML = `value range is 1 to ${this.props.datasetRow-1}`
      }
      else{
        e.target.parentElement.lastElementChild.innerHTML = "" 
      }
      if(parameterData.name === "batch_size" || parameterData.name === "number_of_epochs"){
            let subParamArry = this.props.pyTorchSubParams;
            subParamArry[parameterData.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
      }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    setSubValues(data,parameterData,e){
        if(parameterData === "loss"){
            let subParamArry = this.props.pyTorchSubParams;
            let selectedPar = subParamArry["loss"];
            selectedPar[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else if(parameterData === "optimizer"){
            let subParamArry = this.props.pyTorchSubParams;
            let selectedPar = subParamArry["optimizer"];
            selectedPar[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else{
            let subParamArry = this.props.pyTorchSubParams;
            subParamArry[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }
    }

    setChangeSubValues(data,parameterData,e){
        if(parameterData === "loss"){
            let subParamArry = this.props.pyTorchSubParams;
            let selectedPar = subParamArry["loss"];
            selectedPar[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else if(parameterData === "optimizer"){
            let subParamArry = this.props.pyTorchSubParams;
            let selectedPar = subParamArry["optimizer"];
            selectedPar[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else{
            let subParamArry = this.props.pyTorchSubParams;
            subParamArry[data.name] = e.target.value;
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }
    }

    getsubParams(item,parameterData) {
        var arr1 = [];
        var arr2 = [];
        for(var i=0;i<item.length;i++){
            switch(item[i].uiElemType){
                case "textBox":
                        arr1.push(
                            <div class="form-group row">
                                <label class="col-md-2">{item[i].displayName}</label>
                                <label class="col-md-4">{item[i].description}</label>
                                <div class="col-md-1">
                                    <input type="number" class="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item[i].defaultValue} min="0" max="100" onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                </div>
                            </div>
                        );
                    break;
                case "checkbox":
                    switch(item[i].name){
                        case "reduction":
                                var options = item[i].valueRange
                                var selectedValue = ""
                                var optionsTemp = []
                                optionsTemp.push(<option value="none">--Select--</option>)
                                options.map(k => {
                                    optionsTemp.push(<option value={k} > {k}</option>)
                                })
                                arr1.push(<div class="form-group row">
                                            <label class="col-md-2">{item[i].displayName}</label>
                                            <label class="col-md-4">{item[i].description}</label>
                                            <div class = "col-md-3">
                                                <select class="form-control" ref={(el) => { this.eleSel = el }} onChange={this.setSubValues.bind(this,item[i],parameterData)}>
                                                    {optionsTemp}
                                                </select>
                                            </div>
                                        </div>
                                        );
                            break;
                            case "betas":
                                    arr1.push(
                                        <div class="form-group row">
                                            <label class="col-md-2">{item[i].displayName}</label>
                                            <label class="col-md-4">{item[i].description}</label>
                                            <div>
                                                <div class="col-md-1">
                                                    <input type="number" class="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue="0.9" min="0" max="1" onChange={this.setSubValues.bind(this,item[i],parameterData)}/>
                                                </div>
                                                <div class="col-md-1">
                                                    <input type="number" class="form-control" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue="0.99" min="0" max="1" onChange={this.setSubValues.bind(this,item[i],parameterData)}/>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                break;
                        default:
                                var options = item[i].defaultValue.map(i=>i.name)
                                var selectedValue = ""
                                var optionsTemp = []
                                optionsTemp.push(<option value="none">--Select--</option>)
                                options.map(k => {
                                    optionsTemp.push(<option value={k} > {k}</option>)
                                })
                                arr1.push(<div class="form-group row">
                                            <label class="col-md-2">{item[i].displayName}</label>
                                            <label class="col-md-4">{item[i].description}</label>
                                            <div class = "col-md-3">
                                                <select class="form-control" ref={(el) => { this.eleSel = el }} onChange={this.setSubValues.bind(this,item[i],parameterData)}>
                                                    {optionsTemp}
                                                </select>
                                            </div>
                                        </div>
                                        );
                        break;
                    }
                break;
            }
        }
        return arr1;
      }
    
    renderPyTorchData(parameterData){
        switch (parameterData.paramType) {
            case "list":
                var options = parameterData.defaultValue
                var mandateField= ["Loss","Optimizer"]
                var selectedValue = ""
                var optionsTemp = []
                parameterData.displayName!= "Layer" && optionsTemp.push(<option value="none">--Select--</option>)
                for (var prop in options) {
                    if(options[prop].selected)
                        selectedValue = options[prop].name;
                    optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div>
                    <div>
                        {parameterData.displayName === "Layer"?
                        <div style={{cursor:'pointer',display:'inline-block','margin-left': '100px'}} onClick={this.handleClick.bind(this)}>
                            <span className="addLayer">
                                <i className="fa fa-plus" style={{color: '#fff'}}></i>
                            </span>
                            <span className="addLayerTxt">Add Layer</span>
                        </div>
                        :""}
                        <label className={mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                        <label class="col-md-4 control-label read">{parameterData.description}</label>
                        <div class = "col-md-3">
                            <select ref={(el) => { this.eleSel = el }} className= {`form-control ${parameterData.displayName}`} onChange={this.selectHandleChange.bind(this,parameterData)}>
                                {optionsTemp}
                            </select>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                    <div>
                        {(selectedValue != "Linear" && selectedValue != "" && selectedValue != undefined )?
                            <div className = "col-md-12">
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
                            var classN = "form-control batchCls";
                            var min = parameterData.valueRange[0];
                            var max = parameterData.valueRange[1];
                            break;
                        case "Number of Epochs":
                            classN = "form-control epochsCls"
                            min = 0;
                            max = Number.POSITIVE_INFINITY;
                            break;
                        default:
                            classN= "form-control";
                            var type= "number";
                            break;
                    }
                    return (
                        <div>
                            <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                            <label class="col-md-4 control-label read">{parameterData.description}</label>
                            <div class="col-md-1">
                                <input type="number" className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={parameterData.displayName ==="Batch Size"? this.props.datasetRow -1 : parameterData.defaultValue} onChange={this.changeTextboxValue.bind(this,parameterData)}/>
                                <div className="error"></div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="range-validate text-danger"></div>
                        </div>
                    );
                }
                break;
            default:
                var defaultCls= "form-control"
                return (
                    <div className="col-md-6">
                        <label class="col-md-2 control-label read">{parameterData.displayName}</label>
                        <label class="col-md-4 control-label read">{parameterData.description}</label>                                
                    </div>
                );
        }
    }
    render() {
        let pyTochData = this.props.parameterData;
        let renderPyTorchContent = pyTochData.parameters.map((pydata,index) =>{
            if(pydata.display){
                const pyTorchparams = this.renderPyTorchData(pydata);
                var formClassName =`form-group ${pydata.name}`
                return(
                    <div class={formClassName}>
                        {pyTorchparams}
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
                    <div className='panel-wrapper'>
                        {this.state.idLayer.map(layer=>
                            <PyLayer key={layer} id={layer} parameterData={this.props.parameterData}/>
                        )}
                    </div>
                </div>
          </div>
        );

    }
}