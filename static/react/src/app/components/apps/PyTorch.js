import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {PyLayer} from "./PyLayer";
import { updateAlgorithmData } from "../../actions/appActions";

@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        pyTorchLayer:store.apps.pyTorchLayer,
        dataPreview:store.datasets.dataPreview,
    }
})

export class PyTorch extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            addLayer : false,
            idLayer : [],
            noOfRows : this.props.dataPreview.meta_data.scriptMetaData.metaData.filter(rows=>rows.name=="noOfRows").map(i=>i.value)[0]
        }
    }

    handleAddLayer(){
        const newLayer = this.state.idLayer.length + 1
        this.setState({
            addLayer:true,
            idLayer:this.state.idLayer.concat([newLayer])
        });
    }

    addSubParam(parameterData,e){
        if(parameterData.name === "loss"){
            let subLyr = "Nothing";
            subLyr = parameterData.defaultValue.filter(i=>i.name === e.target.value)[0].parameters.map(subParamData=>{
                if(subParamData.display){
                    const lossparams = this.renderPyTorchData(subParamData);
                    return(
                        <div>
                            <label class="col-md-2 control-label read">{subParamData.displayName}</label>
                            <label class="col-md-4 control-label read">{subParamData.description}</label>
                            {lossparams}
                            <div class="clearfix"></div>
                        </div>
    
                    );
                }
            })
        }
    }

    selectHandleChange(parameterData,e){
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    changeTextboxValue(parameterData,e){
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    getsubParams(item) {
        // var arr = item.defaultValue.map(j=>j.displayName);
        // var options = arr.map(k => {
        //     return <option value={k} > {k}</option>
        // })
        // return <select className="form-control"> {options} </select>
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
                var optionsTemp = []
                for (var prop in options) {
                    if(options[prop].selected)
                        selectedValue = options[prop].name;
                    optionsTemp.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div className= {"row"}>
                        <div className="col-md-3">
                            <select ref={(el) => { this.eleSel = el }} className={cls} onChange={this.selectHandleChange.bind(this,parameterData)}>
                                {optionsTemp}
                            </select>
                        </div>
                        <div>
                            {(selectedValue != "none" && selectedValue != "Linear" && selectedValue != "")?
                            this.getsubParams(options)
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
                        case "Number of Epochs":
                            var type = "number";
                            classN = "form-control epochsCls"
                            break;
                        default:
                            classN= "form-control";
                            var type= "number";
                            break;
                    }
                    return (
                        <div className="col-md-1">
                            <input type={type} className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={parameterData.defaultValue} onChange={this.changeTextboxValue.bind(this,parameterData)} min="0" max="100"/* onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} *//>
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
                                <input type="text" className="form-control" defaultValue={parameterData.defaultVal} /*onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)}*/ onChange={this.changeTextboxValue.bind(this,parameterData)} />
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
                            <input type="text" className="form-control" defaultValue={parameterData.defaultValue} onChange={this.changeTextboxValue.bind(this,parameterData)}/>
                        </div>
                    </div>
                );
                break;
            default:
                var defaultCls= "form-control"
                return (
                    <div className="col-md-6">
                        <input type="text" className={defaultCls} value={parameterData.defaultValue} onChange={this.changeTextboxValue.bind(this,parameterData)}/>
                        <div className="text-danger range-validate" id="error"></div>
                    </div>
                );
        }
    }
    render() {
        let randomNum = Math.random().toString(36).substr(2,8);
        let pyTorchSubParams = null;
        let pyTochData = this.props.parameterData;
        let pyTochSlug = this.props.parameterData.algorithmSlug;
        let renderPyTorchContent = pyTochData.parameters.map((pydata,index) =>{
            if(pydata.display){
                const pyTorchparams = this.renderPyTorchData(pydata);
                let formName = "form-group "+pydata.name
                return(
                    <div class={formName}>
                        {pydata.displayName === "Layer"?
                        <Button className="pull-right" onClick={this.handleAddLayer.bind(this)}>Add</Button>
                        :""}
                        <label class="col-md-2 control-label read">{pydata.displayName}</label>
                        <label class="col-md-4 control-label read">{pydata.description}</label>
                        {pyTorchparams}
                        <div class="clearfix"></div>
                    </div>

                );
            }
        });
        return (
            <div className="col-md-12">
                <div className="row mb-20">
                    <div class="form-group">
                        <div>
                            {renderPyTorchContent}
                        </div>
                        </div>
                        {this.state.idLayer.map(layer=>
                            <div class="panel-body box-shadow">
                                <PyLayer key={layer} id={layer} parameterData={this.props.parameterData}/>
                            </div>
                        )}
                </div>
          </div>
        );

    }
}