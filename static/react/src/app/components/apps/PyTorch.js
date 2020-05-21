import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import store from "../../store";
import {Button} from "react-bootstrap";
import {PyLayer} from "./PyLayer";
import { updateAlgorithmData, setPyTorchSubParams, setPyTorchLayer, pytorchValidateFlag, clearPyTorchValues, setIdLayer } from "../../actions/appActions";
import {statusMessages} from  "../../helpers/helper"
@connect((store)=>{
    return{
        algorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        dataPreview:store.datasets.dataPreview,
        datasetRow: store.datasets.dataPreview.meta_data.uiMetaData.metaDataUI[0].value,
        pyTorchSubParams:store.apps.pyTorchSubParams,
        pyTorchLayer:store.apps.pyTorchLayer,
        idLayer: store.apps.idLayer,
        editmodelFlag:store.datasets.editmodelFlag,
        modelEditconfig: store.datasets.modelEditconfig,
    }
})

export class PyTorch extends React.Component {
    constructor(props){
        super(props);
    }

    componentWillMount(){
        if(this.props.editmodelFlag){
            this.savePyTorchParams();
            this.savePyTorchLayerParams();
        }
        if(Object.keys(store.getState().apps.pyTorchSubParams).length === 0){
            var subParamDt = { "loss": {"loss":"None"}, "optimizer": {"optimizer":"None"}, "regularizer":{"regularizer":"None"}, "batch_size": 100, "number_of_epochs": 10 }
            this.props.dispatch(setPyTorchSubParams(subParamDt));
        }
    }

    savePyTorchParams(){
        let params = this.props.modelEditconfig.config.config.ALGORITHM_SETTING.filter(i=>i.algorithmName==="Neural Network (PyTorch)")[0].nnptc_parameters[0];
        let subParamDt = { "loss": params.loss, "optimizer": params.optimizer, "regularizer":params.regularizer, "batch_size": params.batch_size, "number_of_epochs": params.number_of_epochs }
        this.props.dispatch(setPyTorchSubParams(subParamDt));
    }

    savePyTorchLayerParams(){
        let params = this.props.modelEditconfig.config.config.ALGORITHM_SETTING.filter(i=>i.algorithmName==="Neural Network (PyTorch)")[0].nnptc_parameters[0];
        let layersLen = Object.keys(params.hidden_layer_info).length;
        for(var i=0;i<layersLen;i++){
            this.props.dispatch(setIdLayer(parseInt(Object.keys(params.hidden_layer_info)[i])));
        }
        for(var i=1;i<=layersLen;i++){
            let lyrDt = {   
                "layer":params.hidden_layer_info[i].layer,
                "activation": params.hidden_layer_info[i].activation, 
                "dropout": params.hidden_layer_info[i].dropout,
                "batchnormalization": params.hidden_layer_info[i].batchnormalization, 
                "units_ip": params.hidden_layer_info[i].units_ip,
                "units_op": params.hidden_layer_info[i].units_op,
                "bias_init": params.hidden_layer_info[i].bias_init,
                "weight_init":params.hidden_layer_info[i].weight_init,
                "weight_constraint":params.hidden_layer_info[i].weight_constraint,
            }
            this.props.dispatch(setPyTorchLayer(parseInt(i),lyrDt));
        }
    }

    handleAddLayer(){
        let lastLayerId = 0;
        if(Object.keys(this.props.pyTorchLayer).length != 0){
            let lr = Object.keys(this.props.pyTorchLayer)
            lastLayerId = lr[lr.length-1];
        }
        let layer = parseInt(lastLayerId)+1
        if(layer>1){
            var unitsIp = parseInt(this.props.pyTorchLayer[layer-1].units_op);
        }else{
            var unitsIp = "None"
        }
        let lyrDt = {   "layer":"Linear", 
                        "activation": {"name":"None"}, 
                        "dropout": {"name":"None","p":"None"}, 
                        "batchnormalization": {"name":"None"}, 
                        "units_ip": unitsIp,
                        "units_op": "None", 
                        "bias_init": {"name":"None"},
                        "weight_init": {"name":"None"},
                        "weight_constraint":{"constraint":"None"}
                    }
        this.props.dispatch(setPyTorchLayer(parseInt(layer),lyrDt));
        this.props.dispatch(setIdLayer(parseInt(layer)));
    }

    handleClick(){
        if ($(".loss_pt option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Loss.", "small_mascot"));
        }
        else if( ($(".blank_pt")[0] != undefined) && ($(".blank_pt")[0].value === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter blank value", "small_mascot"));
        }
        else if( ($(".reduction_pt")[0] != undefined) && ($(".reduction_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select reduction.", "small_mascot"));
        }
        else if( ($(".zero_infinity_pt")[0] != undefined) && ($(".zero_infinity_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select zero_infinity.", "small_mascot"));
        }
        else if( ($(".log_input_pt")[0] != undefined) && ($(".log_input_pt option:selected").text().includes("--Select--"))){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select log_input.", "small_mascot"));
        }
        else if( ($(".full_pt")[0] != undefined) && ($(".full_pt option:selected").text().includes("--Select--"))){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select full.", "small_mascot"));
        }
        else if( ($(".rho_pt")[0] != undefined) && ($(".rho_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter rho value", "small_mascot"));
        }
        else if( ($(".lr_pt")[0] != undefined) && ($(".lr_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lr value", "small_mascot"));
        }
        else if( ($(".lr_decay_pt")[0] != undefined) && ($(".lr_decay_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lr_decay value", "small_mascot"));
        }
        else if( ($(".weight_decay_pt")[0] != undefined) && ($(".weight_decay_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter weight_decay value", "small_mascot"));
        }
        else if( ($(".eps_pt")[0] != undefined) && ($(".eps_pt")[0].value === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter eps value", "small_mascot"));
        }
        else if( ($(".max_iter_pt")[0] != undefined) && ($(".max_iter_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter max_iter value", "small_mascot"));
        }
        else if( ($(".max_eval_pt")[0] != undefined) && ($(".max_eval_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter max_eval value", "small_mascot"));
        }
        else if( ($(".tolerance_grad_pt")[0] != undefined) && ($(".tolerance_grad_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter tolerance_grad value", "small_mascot"));
        }
        else if( ($(".tolerance_change_pt")[0] != undefined) && ($(".tolerance_change_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter tolerance_change value", "small_mascot"));
        }
        else if( ($(".dampening_pt")[0] != undefined) && ($(".dampening_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter dampening value", "small_mascot"));
        }
        else if( ($(".amsgrad_pt")[0] != undefined) && ($(".amsgrad_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select amsgrad.", "small_mascot"));
        }
        else if( ($(".nesterov_pt")[0] != undefined) && ($(".nesterov_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select nesterov.", "small_mascot"));
        }
        else if( ($(".lambd_pt")[0] != undefined) && ($(".lambd_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter lambd value", "small_mascot"));
        }
        else if( ($(".momentum_pt")[0] != undefined) && ( ($(".momentum_pt")[0].value === "") || ($(".momentum_pt")[0].value <=0) ) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter momentum value greater than 0", "small_mascot"));
        }
        else if( ($(".alpha_pt")[0] != undefined) && ($(".alpha_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter alpha value", "small_mascot"));
        }
        else if( ($(".t0_pt")[0] != undefined) && ($(".t0_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter t0 value", "small_mascot"));
        }
        else if( ($(".history_size_pt")[0] != undefined) && ($(".history_size_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter history_size value", "small_mascot"));
        }
        else if( ($(".line_search_fn_pt")[0] != undefined) && ($(".line_search_fn_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select line_search_fn.", "small_mascot"));
        }
        else if( ($(".centered_pt")[0] != undefined) && ($(".centered_pt option:selected").text().includes("--Select--")) ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select centered.", "small_mascot"));
        }
        else if($(".optimizer_pt option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Optimizer.", "small_mascot"));
        }
        else if( ($(".betas1_pt")[0] != undefined) && ($(".betas1_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter beta1 value", "small_mascot"));
        }
        else if( ($(".betas2_pt")[0] != undefined) && ($(".betas2_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter beta2 value", "small_mascot"));
        }
        else if( ($(".eta1_pt")[0] != undefined) && ($(".eta1_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter eta1 value", "small_mascot"));
        }
        else if( ($(".eta2_pt")[0] != undefined) && ($(".eta2_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter eta2 value", "small_mascot"));
        }
        else if( ($(".step_sizes1_pt")[0] != undefined) && ($(".step_sizes1_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter step_sizes1 value", "small_mascot"));
        }
        else if( ($(".step_sizes2_pt")[0] != undefined) && ($(".step_sizes2_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter step_sizes2 value", "small_mascot"));
        }
        else if ($(".regularizer_pt option:selected").text().includes("--Select--")){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please select Regularizer.", "small_mascot"));
        }
        else if( ($(".l1_decay_pt")[0] != undefined) && ($(".l1_decay_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter l1_decay value", "small_mascot"));
        }
        else if( ($(".l2_decay_pt")[0] != undefined) && ($(".l2_decay_pt")[0].value === "") ){
            this.props.dispatch(pytorchValidateFlag(false));
            bootbox.alert(statusMessages("warning", "Please enter l2_decay value", "small_mascot"));
        }
        else if (Object.keys(this.props.pyTorchLayer).length != 0){
            for(let i=0;i<this.props.idLayer.length;i++){
                if($(".input_unit_pt")[i].value === "" || $(".input_unit_pt")[i].value === undefined){
                    this.props.dispatch(pytorchValidateFlag(false));
                    bootbox.alert(statusMessages("warning", "Please enter input units for layer.", "small_mascot"));
                    return false;
                }
                else if($(".output_unit_pt")[i].value === "" || $(".output_unit_pt")[i].value === undefined){
                    bootbox.alert(statusMessages("warning", "Please enter output units for layer.", "small_mascot"));
                    this.props.dispatch(pytorchValidateFlag(false));
                    return false;
                }
                else if($(".bias_init_pt option:selected").text().includes("--Select--")){
                    this.props.dispatch(pytorchValidateFlag(false));
                    bootbox.alert(statusMessages("warning", "Please select bias_init for layer.", "small_mascot"));
                    return false;
                }
                else if($(".weight_init_pt option:selected").text().includes("--Select--")){
                    this.props.dispatch(pytorchValidateFlag(false));
                    bootbox.alert(statusMessages("warning", "Please select weight_init for layer.", "small_mascot"));
                    return false;
                }
                else if(!$(".dropout_pt option:selected").text().includes("--Select--")){
                    if($(".p_pt")[0].value === "" || $(".p_pt")[0].value === undefined){
                        this.props.dispatch(pytorchValidateFlag(false));
                        bootbox.alert(statusMessages("warning", "Please enter p value for dropout.", "small_mascot"));
                        return false;
                    }else{
                        this.props.dispatch(pytorchValidateFlag(true));
                    }
                }
                else
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
        if(parameterData.name === "loss" || parameterData.name === "optimizer" || parameterData.name === "regularizer"){
            let subParamDt = this.props.pyTorchSubParams;
            if(parameterData.name === "loss"){
                subParamDt[parameterData.name] = {"loss":"None"}
                this.props.dispatch(pytorchValidateFlag(false));
            }
            else if(parameterData.name === "regularizer"){
                subParamDt[parameterData.name] = {"regularizer":"None"}
                this.props.dispatch(pytorchValidateFlag(false));
            }
            else {
                subParamDt[parameterData.name] = {"optimizer":"None"}
                this.props.dispatch(pytorchValidateFlag(false));
            }
            let subParam = subParamDt[parameterData.name];
            subParam[parameterData.name] = e.target.value;

            if(e.target.value != "None"){
                let defValArr = parameterData.defaultValue.filter(i=>(i.displayName===e.target.value))[0];
                defValArr.parameters.map(idx=>{
                    if(idx.name === "zero_infinity" || idx.name === "full" || idx.name === "log_input" || idx.name === "amsgrad" || idx.name === "line_search_fn" || idx.name === "centered" || idx.name === "nesterov"){
                        let subDefaultVal = idx.defaultValue.filter(sel=>sel.selected)[0];
                        let defVal = subParamDt[parameterData.name];
                        if(subDefaultVal === undefined){
                            subDefaultVal = "None";
                            defVal[idx.name] = subDefaultVal;
                        }
                        else
                            defVal[idx.name] = subDefaultVal.displayName;
                    }else{
                        let defVal = subParamDt[parameterData.name];
                        defVal[idx.name] = idx.defaultValue;
                    }
                    this.props.dispatch(pytorchValidateFlag(true));
                });
            }
            this.props.dispatch(setPyTorchSubParams(subParamDt));
        }
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,e.target.value,this.props.type));
    }

    changeTextboxValue(parameterData,e){
      let name = parameterData.name;
      let val = e.target.value === "--Select--"? null:e.target.value;
      if(name == "number_of_epochs" && (val<1 || val==="")){
        e.target.parentElement.lastElementChild.innerText = "value range is 1 to infinity"
        this.props.dispatch(pytorchValidateFlag(false));
      }
      else if(name === "number_of_epochs" && (!Number.isInteger(parseFloat(val))) ){
        e.target.parentElement.lastElementChild.innerText = "Decimals not allowed"
        this.props.dispatch(pytorchValidateFlag(false));
      }
      else if(name=="batch_size" && ( val<0 || val>this.props.datasetRow-1 || val==="") ){
        e.target.parentElement.lastElementChild.innerText = `value range is 1 to ${this.props.datasetRow-1}`
        this.props.dispatch(pytorchValidateFlag(false));
      }
      else if(name === "batch_size" && (!Number.isInteger(parseFloat(val))) ){
        e.target.parentElement.lastElementChild.innerText = "Decimals not allowed"
        this.props.dispatch(pytorchValidateFlag(false));
      }
    else {
        e.target.parentElement.lastElementChild.innerText = ""
        this.props.dispatch(updateAlgorithmData(this.props.parameterData.algorithmSlug,parameterData.name,parseInt(e.target.value),this.props.type));
        this.props.dispatch(pytorchValidateFlag(true));
        let subParamArry = this.props.pyTorchSubParams;
        subParamArry[parameterData.name] = parseInt(e.target.value);
        this.props.dispatch(setPyTorchSubParams(subParamArry));
    }
    }

    setChangeSubValues(data,parameterData,e){
        let checkWeight = /((\d*)?\.?\d+)+(\s*,\s*((\d*)?\.?\d+))/ ;
        var commaLetters= /^[0-9\,.\s]+$/;
        let name = data.name;
        let val = e.target.value;
        let subParamArry = this.props.pyTorchSubParams;
        if(name === "blank"){
            if(val < 1 || val > 100){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "value range is 1 to 100"
            }else if(!Number.isInteger(parseFloat(val))){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "Decimals not allowed"
            }else{
                e.target.parentElement.lastElementChild.innerText = ""
                this.props.dispatch(pytorchValidateFlag(true));
                let selectedPar = subParamArry["loss"];
                selectedPar[data.name] = parseInt(val);
                this.props.dispatch(setPyTorchSubParams(subParamArry));
            }
        }
        else if(name === "weight" && val === ""){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Enter value"
        }
        else if(name === "weight" && !commaLetters.test(val)){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Numbers only"
        }
        else if(name === "weight" && !checkWeight.test(val)){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "format should be 0.3,1.7"
        }else if(name === "weight" && (val.split(",")).length > 2){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Please enter only two values"
        }
        else if(name === "ignore_index" && (val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Enter a positive integer"
        }
        else if(name === "eps" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "rho" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "lr" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "weight_decay" && (val>0.1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 0.1"
        }
        else if(name === "lr_decay" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "lambd" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "alpha" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "t0" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "max_iter" && (val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Enter a positive integer"
        }
        else if(name === "max_eval" && (val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Enter a positive integer"
        }
        else if(name === "tolerance_grad" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "tolerance_change" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "history_size" && (val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Enter a positive integer"
        }
        else if(name === "momentum" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "dampening" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if( (name === "ignore_index" || name === "max_iter" || name === "max_eval" || name === "history_size") && !Number.isInteger(parseFloat(val)) ){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "Decimals not allowed"
        }
        else if(data.name === "nesterov" && val === "True" && ($(".dampening_pt")[0].value != 0) && ($(".momentum_pt")[0].value <= 0)){
            document.getElementsByClassName("momentum_pt")[0].nextSibling.innerText = "Value should be greater than zero"
            document.getElementsByClassName("dampening_pt")[0].nextSibling.innerText = "Please make dampening zero"
        }
        else if(data.name === "nesterov" && val === "True" && ($(".momentum_pt")[0].value <= 0)){
            document.getElementsByClassName("momentum_pt")[0].nextSibling.innerText = "Value should be greater than zero"
        }
        else if(data.name === "nesterov" && val === "True" && ($(".dampening_pt")[0].value != 0)){
            document.getElementsByClassName("dampening_pt")[0].nextSibling.innerText = "Please make dampening zero"
        }
        else if(data.name === "nesterov" && (val === "False" || val === "None")){
            document.getElementsByClassName("momentum_pt")[0].nextSibling.innerText = ""
            document.getElementsByClassName("dampening_pt")[0].nextSibling.innerText = ""
        }
        else if(data.name === "momentum" && parseFloat(val) <= 0 && $(".nesterov_pt")[0].value === "True"){
            document.getElementsByClassName("momentum_pt")[0].nextSibling.innerText = "Value should be greater than zero"
        }
        else if(data.name === "dampening" && parseFloat(val) != 0 && $(".nesterov_pt")[0].value === "True"){
            document.getElementsByClassName("dampening_pt")[0].nextSibling.innerText = "Please make dampening zero"
        }
        else if(name === "l1_decay" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "l2_decay" && (val>1 || val<0 || val === "")){
            this.props.dispatch(pytorchValidateFlag(false));
            e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
        }
        else if(name === "betas"){
            let selectedPar = subParamArry["optimizer"];
            if(val === ""){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "Enter value"
            }else if(val>1 || val<0){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
            }else if(e.target.className.includes("betas1")){
                if(this.props.pyTorchSubParams["optimizer"]["betas"][1] < val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of beta1 should be lesser than beta2"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["betas"][0] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }else if(e.target.className.includes("betas2")){
                if(this.props.pyTorchSubParams["optimizer"]["betas"][0] > val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of beta2 should be greater than beta1"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["betas"][1] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }
        }else if(name === "eta"){
            let selectedPar = subParamArry["optimizer"];
            if(val === ""){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "Enter value"
            }else if(val>1 || val<0){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
            }else if(e.target.className.includes("eta1")){
                if(this.props.pyTorchSubParams["optimizer"]["eta"][1] < val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of eta1 should be lesser than eta2"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["eta"][0] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }else if(e.target.className.includes("eta2")){
                if(this.props.pyTorchSubParams["optimizer"]["eta"][0] > val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of eta2 should be greater than eta1"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["eta"][1] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }
        }else if(name === "step_sizes"){
            let selectedPar = subParamArry["optimizer"];
            if(val === ""){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "Enter value"
            }else if(val>1 || val<0){
                this.props.dispatch(pytorchValidateFlag(false));
                e.target.parentElement.lastElementChild.innerText = "value range is 0 to 1"
            }else if(e.target.className.includes("step_sizes1")){
                if(this.props.pyTorchSubParams["optimizer"]["step_sizes"][1] < val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of step_sizes1 should be lesser than step_sizes2"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["step_sizes"][0] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }else if(e.target.className.includes("step_sizes2")){
                if(this.props.pyTorchSubParams["optimizer"]["step_sizes"][0] > val ){
                    this.props.dispatch(pytorchValidateFlag(false));
                    e.target.parentElement.lastElementChild.innerText = "value of step_sizes2 should be greater than step_sizes1"
                }else{
                    e.target.parentElement.lastElementChild.innerText = ""
                    this.props.dispatch(pytorchValidateFlag(true));
                    selectedPar["step_sizes"][1] = parseFloat(val);
                    this.props.dispatch(setPyTorchSubParams(subParamArry));
                }
            }
        }
        else if(parameterData === "loss"){
            e.target.parentElement.lastElementChild.innerText = ""
            this.props.dispatch(pytorchValidateFlag(true));
            let selectedPar = subParamArry["loss"];
            if(data.name === "reduction" || data.name === "zero_infinity" || data.name === "log_input" || data.name === "full")
                selectedPar[data.name] = val;
            else if(data.name === "weight"){
                let duplVal = val.split(",");
                    let tensorVal = [];
                    for(var i=0;i<duplVal.length;i++){
                        duplVal[i]!= ""?tensorVal.push(parseFloat(duplVal[i])):""
                    }
                    tensorVal.reduce((a,b)=>a+b,0) > 2 ?
                    e.target.parentElement.lastElementChild.innerText = "Sum of list should be less than 2"
                    : selectedPar[data.name] = tensorVal;

            }
            else selectedPar[data.name] = parseFloat(val);
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else if(parameterData === "optimizer"){
            e.target.parentElement.lastElementChild.innerText = ""
            this.props.dispatch(pytorchValidateFlag(true));
            let selectedPar = subParamArry["optimizer"];
            if(data.name === "amsgrad" || data.name === "line_search_fn" || data.name==="nesterov" ||data.name === "centered")
                selectedPar[data.name] = val;
            else selectedPar[data.name] = parseFloat(val);
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else if(parameterData === "regularizer"){
            e.target.parentElement.lastElementChild.innerText = ""
            this.props.dispatch(pytorchValidateFlag(true));
            let selectedPar = subParamArry["regularizer"];
            selectedPar[data.name] = parseFloat(val);
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }else{
            e.target.parentElement.lastElementChild.innerText = ""
            this.props.dispatch(pytorchValidateFlag(true));
            subParamArry[data.name] = parseFloat(val);
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }
        if(subParamArry["optimizer"].optimizer != "None" && data.name==="l2_decay"){
            $(".weight_decay_pt")[0].value = e.target.value;
            let selectedPar = subParamArry["optimizer"];
            selectedPar.weight_decay = parseFloat(e.target.value)
            this.props.dispatch(setPyTorchSubParams(subParamArry));
        }
    }

    getsubParams(item,parameterData) {
        var arr1 = [];
        for(var i=0;i<item.length;i++){
            switch(item[i].uiElemType){
                case "textBox":
                    var mandateField = ["betas","eta","step_sizes"];

                    switch(item[i].name){
                        case "betas":
                        case "eta":
                        case "step_sizes":
                            arr1.push(
                                <div className = "row mb-20">
                                    <label className={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                    <label className = "col-md-4">{item[i].description}</label>
                                    <div className ="col-md-1">
                                    <label>{item[i].displayName}1</label>
                                        <input type="number" key={`form-control ${item[i].name}1_pt`} className ={`form-control ${item[i].name}1_pt`} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault()} defaultValue={store.getState().apps.pyTorchSubParams[parameterData][item[1].name][0]} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                        <div key={`${item[i].name}1_pt`} className ="error_pt"></div>
                                    </div>
                                    <div class="col-md-1">
                                        <label>{item[i].displayName}2</label>
                                        <input type="number" key={`form-control ${item[i].name}2_pt`} className={`form-control ${item[i].name}2_pt`} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault()} defaultValue={store.getState().apps.pyTorchSubParams[parameterData][item[1].name][1]} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                        <div key={`${item[i].name}2_pt`} className="error_pt"></div>
                                    </div>
                                </div>
                            );
                        break;
                        case "weight":
                                arr1.push(
                                    <div className = "row mb-20">
                                        <label className = "col-md-2">{item[i].displayName}</label>
                                        <label className = "col-md-4">{item[i].description}</label>
                                        <div className = "col-md-3">
                                            <input type ="text" key={`form-control ${item[i].name}_pt`} className = {`form-control ${item[i].name}_pt`} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={store.getState().apps.pyTorchSubParams.loss.weight != undefined?store.getState().apps.pyTorchSubParams.loss.weight.join():""} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}/>
                                            <div key={`form-control ${item[i].name}1_pt`} className = "error_pt"></div>
                                        </div>
                                    </div>
                                );
                            break;
                        break;
                        default :
                            if(item[i].name === "weight_decay" && store.getState().apps.pyTorchSubParams["regularizer"].regularizer != "None"){
                                var defVal = store.getState().apps.pyTorchSubParams["regularizer"].l2_decay
                                var disable = store.getState().apps.pyTorchSubParams["regularizer"].regularizer === "l2_regularizer"?true:false
                            }
                            else if(store.getState().apps.pyTorchSubParams[parameterData] === undefined){
                                var defVal = ""
                            }
                            else{
                                var defVal = store.getState().apps.pyTorchSubParams[parameterData][item[i].name];
                            }
                            var mandateField = ["alpha","momentum","blank","eps","rho","lr","weight_decay","lr_decay","lambd","t0","max_iter","max_eval","tolerance_grad","tolerance_change","dampening","l1_decay","l2_decay"]
                                arr1.push(
                                    <div className = "row mb-20">
                                        <label className = {mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                        <label className = "col-md-4">{item[i].description}</label>
                                        <div className = "col-md-1">
                                            <input type ="number" key={`form-control ${item[i].name}_pt`} className = {`form-control ${item[i].name}_pt`} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue={defVal} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)} disabled={disable}/>
                                            <div key={`form-control ${item[i].name}1_pt`} className = "error_pt"></div>
                                        </div>
                                    </div>
                                );
                            break;
                    }
                    break;
                case "checkbox":
                    switch(item[i].name){
                        case "reduction":
                            var mandateField = ["reduction"]
                                var options = item[i].valueRange
                                var selectedValue = ""
                                var optionsTemp = []
                                optionsTemp.push(<option value="None">--Select--</option>)
                                options.map(k => {
                                    if(k === store.getState().apps.pyTorchSubParams[parameterData][item[i].name])
                                        selectedValue = true;
                                    else selectedValue = false;
                                    optionsTemp.push(<option value={k} selected={selectedValue}> {k}</option>)
                                })
                                arr1.push(
                                        <div className = "row mb-20">
                                            <label className = {mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                            <label className = "col-md-4">{item[i].description}</label>
                                            <div className = "col-md-3">
                                                <select key = {`form-control ${item[i].name}_pt`} className = {`form-control ${item[i].name}_pt`} ref={(el) => { this.eleSel = el }} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}>
                                                    {optionsTemp}
                                                </select>
                                                <div key = {`${item[i].name}_pt`} className = "error_pt"></div>
                                            </div>
                                        </div>
                                    );
                            break;
                        default:
                                var options = item[i].defaultValue.map(i=> {return{name:i.displayName,selected:i.selected}} )
                                var mandateField = ["log_input","full","amsgrad","line_search_fn","zero_infinity","centered","nesterov"];
                                var optionsTemp = []
                                optionsTemp.push(<option value="None">--Select--</option>)
                                var selectedValue = ""
                                selectedValue = store.getState().apps.pyTorchSubParams[parameterData][item[i].name]
                                var sel = ""
                                options.map(k => {
                                    if(k.name === selectedValue)
                                        sel = true
                                    else
                                        sel = false
                                    optionsTemp.push(<option value={k.name} selected={sel}> {k.name}</option>)
                                })
                                arr1.push(
                                    <div className = "row mb-20">
                                        <label className ={mandateField.includes(item[i].displayName)? "col-md-2 mandate" : "col-md-2"}>{item[i].displayName}</label>
                                        <label className = "col-md-4">{item[i].description}</label>
                                        <div className = "col-md-3">
                                            <select key = {`form-control ${item[i].name}_pt`} className = {`form-control ${item[i].name}_pt`}  ref={(el) => { this.eleSel = el }} onChange={this.setChangeSubValues.bind(this,item[i],parameterData)}>
                                                {optionsTemp}
                                            </select>
                                            <div key = {`${item[i].name}_pt`} className = "error_pt"></div>
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
                var mandateField= ["Loss","Optimizer","regularizer"];
                var selectedValue = "";
                var optionsTemp = []
                parameterData.displayName != "Layer" && optionsTemp.push(<option value="None">--Select--</option>)
                for (var prop in options) {
                    if(options[prop].selected)
                        selectedValue = options[prop].name;
                    optionsTemp.push(<option key={prop} className={prop} defaultValue={options[prop].name} selected={options[prop].selected}>{options[prop].displayName}</option>);
                }
                let selParam = store.getState().apps.pyTorchSubParams
                return(
                    <div>
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label className = "col-md-4">{parameterData.description}</label>
                            <div class = "col-md-3">
                                <select ref={(el) => { this.eleSel = el }} key= {`form-control ${parameterData.name}_pt`} className= {`form-control ${parameterData.name}_pt`} onChange={this.selectHandleChange.bind(this,parameterData)}>
                                    {optionsTemp}
                                </select>
                            </div>
                            {parameterData.displayName === "Layer"?
                                <div style={{cursor:'pointer',display:'inline-block','marginLeft':'100px'}} onClick={this.handleClick.bind(this)}>
                                    <span className = "addLayer">
                                        <i className = "fa fa-plus" style={{color:'#fff'}}></i>
                                    </span>
                                    <span className ="addLayerTxt">Add Layer</span>
                                </div>
                            :""}
                        </div>
                        {selectedValue === "Linear"?
                                <div className='panel-wrapper'>
                                    {store.getState().apps.idLayer.map(layer=>
                                        <PyLayer key = {layer} idNum={layer} parameterData={this.props.parameterData}/>
                                    )}
                                </div>
                            : ""}
                            {(selectedValue != "Linear" && selectedValue != "" && selectedValue != undefined )?
                                selParam[parameterData.name][parameterData.name] === "None"?""
                                    :
                                this.getsubParams((options.filter(i=>i.name===selectedValue)[0].parameters),parameterData.name)
                                    
                                :""
                            }
                        </div>
                   );
                break;
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    let mandateField = ["Batch Size","Number of Epochs"];
                    return (
                        <div className = "row mb-20">
                            <label className = {mandateField.includes(parameterData.displayName)? "col-md-2 mandate" : "col-md-2"}>{parameterData.displayName}</label>
                            <label class = "col-md-4">{parameterData.description}</label>
                            <div class = "col-md-1">
                                <input type = "number" key= {`form-control ${parameterData.name}_pt`} className = {`form-control ${parameterData.name}_pt`} onKeyDown = { (evt) => evt.key === 'e' && evt.preventDefault() } defaultValue = {store.getState().apps.pyTorchSubParams[parameterData.name]} onChange={this.changeTextboxValue.bind(this,parameterData)}/>
                                <div key= {`${parameterData.name}_pt`} className = "error_pt"></div>
                            </div>
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
                return pyTorchparams;
            }
        });
        return (
            <div className = "col-md-12">
                {renderPyTorchContent}
            </div>
        );

    }
}