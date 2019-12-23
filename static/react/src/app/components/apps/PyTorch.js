import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {PyLayer} from "./PyLayer";
import { updateAlgorithmData, setPyTorchSubParams, setPyTorchLayer, pytorchValidateFlag, clearPyTorchValues } from "../../actions/appActions";
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
        this.props.dispatch(clearPyTorchValues());
        let subParamDt = { "loss": {"loss":"none"}, "optimizer": {"optimizer":"none"}, "batch_size": 100, "number_of_epochs": 10 }
        this.props.dispatch(setPyTorchSubParams(subParamDt));
    }
    componentDidMount(){
        this.props.dispatch(updateAlgorithmData(this.props.algorithmData[6].algorithmSlug,"batch_size",100,this.props.type));
        this.props.dispatch(updateAlgorithmData(this.props.algorithmData[6].algorithmSlug,"number_of_epochs",20,this.props.type));

    }

    handleAddLayer(){
        let layer = Object.keys(this.props.pyTorchLayer).length+1
        let lyrDt = {"layer":"linear", "activation": {"name":"none"}, "dropout": {"name":"none","p":"none"}, "batchnormalisation": {"name":"none"}, "units_ip": "none","units_op": "none", "bias": "none" }
        this.props.dispatch(setPyTorchLayer(parseInt(layer),lyrDt));
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
        else if( ($(".reduction")[0] != undefined) && ($(".reduction option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select reduction.", "small_mascot"));
        }
        else if( ($(".blank")[0] != undefined) && ($(".blank")[0].value === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter blank value", "small_mascot"));
        }
        else if( ($(".log_input")[0] != undefined) && ($(".log_input option:selected").text().includes("--Select"))){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select log_input.", "small_mascot"));
        }
        else if( ($(".full")[0] != undefined) && ($(".full option:selected").text().includes("--Select"))){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select log_input.", "small_mascot"));
        }
        else if( ($(".eps")[0] != undefined) && ($(".eps")[0].value === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter eps value", "small_mascot"));
        }
        else if( ($(".rho")[0] != undefined) && ($(".rho")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter rho value", "small_mascot"));
        }
        else if( ($(".lr")[0] != undefined) && ($(".lr")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lr value", "small_mascot"));
        }
        else if( ($(".weight_decay")[0] != undefined) && ($(".weight_decay")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter weight_decay value", "small_mascot"));
        }
        else if( ($(".lr_decay")[0] != undefined) && ($(".lr_decay")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lr_decay value", "small_mascot"));
        }
        else if( ($(".amsgrad")[0] != undefined) && ($(".amsgrad option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select amsgrad.", "small_mascot"));
        }
        else if( ($(".lambd")[0] != undefined) && ($(".lambd")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lambd value", "small_mascot"));
        }
        else if( ($(".t0")[0] != undefined) && ($(".t0")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter t0 value", "small_mascot"));
        }
        else if( ($(".history_size")[0] != undefined) && ($(".history_size")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter history_size value", "small_mascot"));
        }
        else if( ($(".line_search_fn")[0] != undefined) && ($(".line_search_fn option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select line_search_fn.", "small_mascot"));
        }
        else if($(".Optimizer option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Optimizer.", "small_mascot"));
        }
        else if (Object.keys(this.props.pyTorchLayer).length != 0){ 
            if($(".input_unit")[0].value === "" || $(".input_unit")[0].value === undefined){
                this.props.dispatch(pytorchValidateFlag(false));
                bootbox.alert(statusMessages("warning", "Please enter input units for layer.", "small_mascot"));
            }
            else if($(".output_unit")[0].value === "" || $(".output_unit")[0].value === undefined){
                bootbox.alert(statusMessages("warning", "Please enter output units for layer.", "small_mascot"));
                this.props.dispatch(pytorchValidateFlag(false));
            }
            else if(!$(".dropout option:selected").text().includes("--Select--")){
                if($(".p")[0].value === "" || $(".p")[0].value === undefined){
                    this.props.dispatch(pytorchValidateFlag(false));
                    bootbox.alert(statusMessages("warning", "Please enter p value for dropout.", "small_mascot"));
                }else{
                    this.props.dispatch(pytorchValidateFlag(true));
                }
            }
            else if($(".bias option:selected").text().includes("--Select--")){
                this.props.dispatch(pytorchValidateFlag(false));
                bootbox.alert(statusMessages("warning", "Please select bias for layer.", "small_mascot"));
            }
            else{
                this.props.dispatch(pytorchValidateFlag(true));
            }
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

            if(e.target.value != "none"){
                let defValArr = parameterData.defaultValue.filter(i=>(i.displayName===e.target.value))[0];
                defValArr.parameters.map(idx=>{
                    if(idx.name === "zero_infinity" || idx.name === "full" || idx.name === "log_input" || idx.name === "amsgrad" || idx.name === "line_search_fn" || idx.name === "centered" || idx.name === "nesterov"){
                        let subDefaultVal = idx.defaultValue.filter(sel=>sel.selected)[0];
                        let defVal = subParamDt[parameterData.name];
                        if(subDefaultVal === undefined){
                            subDefaultVal = "false";
                            defVal[idx.name] = subDefaultVal;
                        }
                        else
                            defVal[idx.name] = subDefaultVal.name;
                    }else{
                        let defVal = subParamDt[parameterData.name];
                        defVal[idx.name] = idx.defaultValue;
                    }
                });
            }
            this.props.dispatch(setPyTorchSubParams(subParamDt));
        }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    changeTextboxValue(parameterData,e){
      let name = parameterData.name;
      let val = e.target.value === "--Select--"? null:e.target.value;
      if(name == "number_of_epochs" && val<1){
        e.target.parentElement.lastElementChild.innerHTML = "value range is 1 to infinity"
      }
      else if(name=="batch_size" && (val < 0 ) || (val > this.props.datasetRow-1) ){
        e.target.parentElement.lastElementChild.innerHTML = `value range is 1 to ${this.props.datasetRow-1}`
      }
        else {
            e.target.parentElement.lastElementChild.innerHTML = ""
            this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,parseInt(e.target.value),this.props.type));
        }
    if(parameterData.name === "batch_size" || parameterData.name === "number_of_epochs"){
            let subParamArry = this.props.pyTorchSubParams;
            subParamArry[parameterData.name] = parseInt(e.target.value);
            this.props.dispatch(setPyTorchSubParams(subParamArry));
    }
    }

    setChangeSubValues(data,parameterData,e){
        let name = data.name;
        let val = e.target.value;
        if(name === "blank"){
            if(val < 0 || val > 100){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerHTML = "value range is 1 to 100"
            }else if(!Number.isInteger(parseInt(val))){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerHTML = "value should be a positive interger"
            }else{
                this.props.dispatch(pytorchValidateFlag(true));
                let subParamArry = this.props.pyTorchSubParams;
                let selectedPar = subParamArry["loss"];
                selectedPar[data.name] = parseInt(e.target.value);
                this.props.dispatch(setPyTorchSubParams(subParamArry));
            }
        }
        else if(name === "ignore_index" && (!Number.isInteger(parseInt(val)) || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive interger"
        }
        else if(name === "eps" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "rho" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "lr" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "weight_decay" && (val>0.1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 0.1"
        }
        else if(name === "lr_decay" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "lambd" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "alpha" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "t0" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "max_iter" && (!(Number.isInteger(parseInt(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "max_eval" && (!(Number.isInteger(parseInt(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "tolerance_grad" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "tolerance_change" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "history_size" && (!(Number.isInteger(parseInt(val))) || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value should be a positive integer"
        }
        else if(name === "momentum" && (val>1 || val<0) || val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
        }
        else if(name === "betas"){
            if(val === ""){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerHTML = "Enter value"
            }else if(val>1 || val<0){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerHTML = "value range is 0 to 1"
            }else if(e.target.className.includes("beta1")){
                if(this.props.pyTorchSubParams["optimizer"]["betas"][1] < val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerHTML = "value of beta1 should be lesser than beta2"
                }else{
                    e.target.parentElement.lastElementChild.innerHTML = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    let subParamArry = this.props.pyTorchSubParams;
                    let selectedPar = subParamArry["optimizer"];
                    selectedPar["betas"][0] = e.target.value;
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }else if(e.target.className.includes("beta2")){
                if(this.props.pyTorchSubParams["optimizer"]["betas"][0] > val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerHTML = "value of beta2 should be greater than beta2"
                }else{
                    e.target.parentElement.lastElementChild.innerHTML = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    let subParamArry = this.props.pyTorchSubParams;
                    let selectedPar = subParamArry["optimizer"];
                    selectedPar["betas"][1] = e.target.value;
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }
        }
        else{
            e.target.parentElement.lastElementChild.innerHTML = ""
            if(parameterData === "loss"){
                this.props.dispatch(pytorchValidateFlag(true));
                let subParamArry = this.props.pyTorchSubParams;
                let selectedPar = subParamArry["loss"];
                if(data.name != "reduction" || data.name != "zero_infinity" || data.name != "log_input" || data.name != "full"){
                    selectedPar[data.name] = parseFloat(e.target.value);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }else{
                    selectedPar[data.name] = e.target.value;
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }else if(parameterData === "optimizer"){
                this.props.dispatch(pytorchValidateFlag(true));
                let subParamArry = this.props.pyTorchSubParams;
                let selectedPar = subParamArry["optimizer"];
                    if(data.name != "amsgrad" || data.name != "line_search_fn" || data.name!="nesterov" ||data.name != "centered"){
                        selectedPar[data.name] = parseFloat(e.target.value);
                        this.props.dispatch(setPyTorchSubParams(subParamArry));
                    }
                    else{
                        selectedPar[data.name] = e.target.value;
                        this.props.dispatch(setPyTorchSubParams(subParamArry));
                    }
            }else{
                this.props.dispatch(pytorchValidateFlag(true));
                let subParamArry = this.props.pyTorchSubParams;
                subParamArry[data.name] = parseFloat(e.target.value);
                this.props.dispatch(setPyTorchSubParams(subParamArry));
            }
        }
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

    getsubParams(item,parameterData) {
        var arr1 = [];
        for(var i=0;i<item.length;i++){
            switch(item[i].uiElemType){
                case "textBox":
                    switch(item[i].name){
                        case "betas":
                                var mandateField = [""];
                                    arr1.push(
                                        <div className = "row mb-20">
                                            <label className={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                            <label className = "col-md-4">{item[i].description}</label>
                                            <div>
                                                <div className ="col-md-1">
                                                    <label>beta1</label>
                                                    <input type="number" className ="form-control betas beta1" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault()} defaultValue="0.9" onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                                    <div className ="error"></div>
                                                </div>
                                                <div class="col-md-1">
                                                    <label>beta2</label>
                                                    <input type="number" class="form-control betas beta2" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault()} defaultValue="0.99" onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                                    <div class="error"></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                break;
                        default :
                                var mandateField = ["alpha","momentum","blank","eps","rho","lr","weight_decay","lr_decay","lambd","t0"]
                                arr1.push(
                                    <div className = "row mb-20">
                                        <label className = {mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                        <label className = "col-md-4">{item[i].description}</label>
                                        <div className = "col-md-1">
                                            <input type ="number" className = {`form-control ${item[i].displayName}`} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={item[i].defaultValue} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                            <div className = "error"></div>
                                        </div>
                                        <div className="clearfix"></div>
                                    </div>
                                );
                            break;
                    }
                    break;
                case "checkbox":
                    switch(item[i].name){
                        case "reduction":
                            var mandateField = ["reduction","centered"]
                                var options = item[i].valueRange
                                var selectedValue = ""
                                var optionsTemp = []
                                optionsTemp.push(<option value="none">--Select--</option>)
                                options.map(k => {
                                    optionsTemp.push(<option value={k} > {k}</option>)
                                })
                                arr1.push(
                                        <div className = "row mb-20">
                                            <label className = {mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                            <label className = "col-md-4">{item[i].description}</label>
                                            <div className = "col-md-3">
                                                <select className = {`form-control ${item[i].displayName}`} ref={(el) => { this.eleSel = el }} onChange={this.setSubValues.bind(this,item[i],parameterData)}>
                                                    {optionsTemp}
                                                </select>
                                                <div className = "error"></div>
                                            </div>
                                        </div>
                                    );
                            break;
                        default:
                                var options = item[i].defaultValue.map(i=>i.name)
                                var mandateField = ["log_input","full","amsgrad","line_search_fn","zero_infinity"];
                                var optionsTemp = []
                                optionsTemp.push(<option value="none">--Select--</option>)
                                options.map(k => {
                                    optionsTemp.push(<option value={k} > {k}</option>)
                                })
                                arr1.push(
                                        <div className = "row mb-20">
                                        <label className ={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                        <label className = "col-md-4">{item[i].description}</label>
                                        <div className = "col-md-3">
                                            <select className = {`form-control ${item[i].displayName}`}  ref={(el) => { this.eleSel = el }} onChange={this.setSubValues.bind(this,item[i],parameterData)}>
                                                {optionsTemp}
                                            </select>
                                            <div className = "error"></div>
                                        </div>
                                        <div className ="clearfix"></div>
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
                var mandateField= ["Loss","Optimizer"];
                var selectedValue = "";
                var optionsTemp = []
                parameterData.displayName != "Layer" && optionsTemp.push(<option value="none">--Select--</option>)
                for (var prop in options) {
                    if(options[prop].selected)
                        selectedValue = options[prop].name;
                    optionsTemp.push(<option key={prop} className={prop} defaultValue={options[prop].name}>{options[prop].displayName}</option>);
                }
                
                return(
                    <div>
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label className = "col-md-4">{parameterData.description}</label>
                            <div class = "col-md-3">
                                <select ref={(el) => { this.eleSel = el }} className= {`form-control ${parameterData.displayName}`} onChange={this.selectHandleChange.bind(this,parameterData)}>
                                    {optionsTemp}
                                </select>
                            </div>
                            {parameterData.displayName === "Layer"?
                                <div style={{cursor:'pointer',display:'inline-block','margin-left':'100px'}} onClick={this.handleClick.bind(this)}>
                                    <span className = "addLayer">
                                        <i className = "fa fa-plus" style={{color:'#fff'}}></i>
                                    </span>
                                    <span className ="addLayerTxt">Add Layer</span>
                                </div>
                            :""}
                        </div>
                        {selectedValue === "Linear"?
                                <div className='panel-wrapper'>
                                    {this.state.idLayer.map(layer=>
                                        <PyLayer key = {layer} id={layer} parameterData={this.props.parameterData}/>
                                    )}
                                </div>
                            : ""}
                            {(selectedValue != "Linear" && selectedValue != "" && selectedValue != undefined )?
                                this.props.pyTorchSubParams[parameterData.name][parameterData.name] === "none"?""
                                    :<div>
                                        {this.getsubParams((options.filter(i=>i.name===selectedValue)[0].parameters),parameterData.name)}
                                    </div>
                                :""
                            }
                        <div className = "clearfix"></div>
                    </div>                    
                   );
                break;
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    let mandateField = ["Batch Size","Number of Epochs"];
                    switch(parameterData.displayName){
                        case "Batch Size":
                            var classN = "form-control batchCls";
                            break;
                        case "Number of Epochs":
                            classN = "form-control epochsCls"
                            break;
                        default:
                            classN = "form-control";
                            var type = "number";
                            break;
                    }
                    return (
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label class = "col-md-4">{parameterData.description}</label>
                            <div class = "col-md-1">
                                <input type = "number" className = {classN} onKeyDown = { (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue = {parameterData.displayName ==="Batch Size"? this.props.datasetRow -1 : parameterData.defaultValue} onChange={this.changeTextboxValue.bind(this,parameterData)}/>
                                <div className = "error"></div>
                            </div>
                            <div className = "clearfix"></div>
                        </div>
                    );
                }
                break;
            default:
                return (
                    <div className="row mb-20">
                        <label className = "col-md-2">{parameterData.displayName}</label>
                        <label className = "col-md-4">{parameterData.description}</label>                                
                    </div>
                );
        }
    }
    render() {
        let pyTochData = this.props.parameterData;
        let renderPyTorchContent = pyTochData.parameters.map((pydata,index) =>{
            if(pydata.display){
                const pyTorchparams = this.renderPyTorchData(pydata);
                var formClassName =`row ${pydata.name}`
                return(
                    <div className = {formClassName}>
                        {pyTorchparams}
                    </div>

                );
            }
        });
        return (
            <div className = "col-md-12">
                <div className = "row mb-20">
                    <div className = "form-group row">
                        {renderPyTorchContent}
                    </div>
                </div>
          </div>
        );

    }
}