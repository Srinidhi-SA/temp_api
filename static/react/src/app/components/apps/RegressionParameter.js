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
        metricSelected:store.apps.metricSelected,
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
        setTimeout(function(){ $('.single').multiselect('destroy'); }, 0);
       
    }
    componentDidMount(){
        $(".learningCls").prop("disabled",true);
        $(".disNum").prop("disabled",false);
        $(".beta1").prop("disabled",false);

        $(".learningClsInit").prop("disabled",false);
        $(".earlyStop").prop("disabled",false);
        $(".multi").prop("disabled",false);
        $(".powerT").prop("disabled",true);
        $(".fractionCls").prop("disabled",true);
        $(".nesterovsCls").prop("disabled",true);
        $(".momentumCls").prop("disabled",true);

    }

    componentDidUpdate(){
        var that = this;
        if(this.props.parameterData.paramType == "list" && this.props.type == "TuningParameter")
        {
            $(this.eleSel).multiselect({
                onChange: function(option, checked, select) {
                    that.props.dispatch(updateAlgorithmData(that.props.algorithmSlug,that.props.parameterData.name,$(option).val(),that.props.type));
                },
                onDropdownHide: function(event) {
                if(this.getSelected().length == 0)
                    event.target.parentElement.parentElement.lastElementChild.innerHTML = "Please select at least one";
                },
                onDropdownShow: function(event) {
                    event.target.parentElement.parentElement.lastElementChild.innerHTML = "";
                }
            });
        }
    }
    changeFoldCheck(min,max,e){
        if(e.target.value < min || e.target.value > max){
            e.target.parentElement.lastElementChild.innerHTML = "Valid Range is "+min+"-"+ max
        }else if(!Number.isInteger(parseFloat(e.target.value))){
            e.target.parentElement.lastElementChild.innerHTML = "Decimals are not allowed"
        } else e.target.parentElement.lastElementChild.innerHTML = ""
    }
    changeSliderValueFromText(e) {
        if (isNaN(e.target.value))
            alert("please enter a valid number")
        else {
            // e.target.parentElement.lastElementChild.innerHTML="";
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
        switch(e.target.value){
            case "sgd":
                $(".learningCls").prop("disabled",false);
                $(".disNum").prop("disabled",true);
                $(".beta1").prop("disabled",true);
                $(".learningClsInit").prop("disabled",false);
                $(".earlyStop").prop("disabled",false);
                $(".powerT").prop("disabled",false);
                $(".shuffleCls").prop("disabled",false);
                $(".epsilonCls").prop("disabled",true);
                $(".epsilonCls .slider-horizontal").addClass("epsilonDisable");
                $(".iterationCls").prop("disabled",false);
                $(".iterationCls .slider-horizontal").removeClass("epsilonDisable");
                $(".nesterovsCls").prop("disabled",false);
                $(".momentumCls").prop("disabled",false);
                break;
            case "adam":
                $(".disNum").prop("disabled",false);
                $(".beta1").prop("disabled",false);
                $(".learningCls").prop("disabled",true);
                $(".learningClsInit").prop("disabled",false);
                $(".earlyStop").prop("disabled",false);
                $(".powerT").prop("disabled",true);
                $(".shuffleCls").prop("disabled",false);
                $(".epsilonCls").prop("disabled",false);
                $(".epsilonCls .slider-horizontal").removeClass("epsilonDisable");
                $(".iterationCls").prop("disabled",false);
                $(".iterationCls .slider-horizontal").removeClass("epsilonDisable");
                $(".nesterovsCls").prop("disabled",true);
                $(".momentumCls").prop("disabled",true);
                break;
            case "lbfgs":
                $(".learningCls").prop("disabled",true);
                $(".disNum").prop("disabled",true);
                $(".beta1").prop("disabled",true);
                $(".learningClsInit").prop("disabled",true);
                $(".earlyStop").prop("disabled",true);
                $(".powerT").prop("disabled",true);
                $(".shuffleCls").prop("disabled",true);
                $(".epsilonCls").prop("disabled",true);
                $(".epsilonCls .slider-horizontal").addClass("epsilonDisable");
                $(".iterationCls").prop("disabled",true);
                $(".iterationCls .slider-horizontal").addClass("epsilonDisable");
                $(".nesterovsCls").prop("disabled",true);
                $(".momentumCls").prop("disabled",true);
                break;
            default : "";
        }
        if(e.target.className=="form-control single earlyStop" && e.target.value == "true"){
            $(".fractionCls").prop("disabled",false);
        }
        else if(e.target.className=="form-control single earlyStop" && e.target.value == "false"){
            $(".fractionCls").prop("disabled",true);
        }
        else if($('.earlyStop').val() == "true" && (e.target.value == "sgd" || e.target.value == "adam") ){
            $(".fractionCls").prop("disabled",false);
        }
        else if($('.earlyStop').val() == "true" && (e.target.value == "lbfgs") ){
            $(".fractionCls").prop("disabled",true);
        }
        console.log(e.target.value);
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    checkChangeTextboxValue(min,max,expectedDataType,e){
        var validateResult = {"iserror":false,"errmsg":""};
        validateResult = this.validateTextboxValue(e.target.value,min,max,expectedDataType,e);
        if(validateResult && validateResult.iserror){
            e.target.parentElement.lastElementChild.innerHTML=validateResult.errmsg;
            //e.target.focus();
        }
        this.setState({
          defaultVal: e.target.value
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
    }
    changeTextboxValue(e){
        ($(".momentumCls").val())>=0.1?$(".nesterovsCls").prop("disabled",false):$(".nesterovsCls").prop("disabled",true)
        if(e.target.parentElement.lastElementChild != null)
          e.target.parentElement.lastElementChild.innerHTML="";
        this.setState({
            defaultVal: e.target.value
        });
        this.props.dispatch(updateAlgorithmData(this.props.algorithmSlug,this.props.parameterData.name,e.target.value,this.props.type));
        var numbers = /^[0-9\s]*$/;
        if(($(".hiddenLayerCls").val()) < 0){
            document.getElementById("error").innerHTML="negative value not allowed";
        }
        else if(!numbers.test($(".hiddenLayerCls").val())){
            document.getElementById("error").innerHTML="only number allowed";
         }
         else if($(".hiddenLayerCls").val() == ""){
            document.getElementById("error").innerHTML="mandatory field";
        }
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
            // case "tuple":
            //     switch(parameterData.name){
            //         case"hidden_layer_sizes":
            //         var cls= "form-control single hiddenLayerCls"
            //         break;
            //     }

            case "list":
                switch(parameterData.name){
                    case"learning_rate":
                        var cls= "form-control single learningCls"
                        break;
                    case"early_stopping":
                        cls = "form-control single earlyStop";
                        break;
                    case"shuffle":
                        cls = "form-control single shuffleCls";
                        break;
                    case"nesterovs_momentum":
                        cls = "form-control single nesterovsCls";
                        break;
                    default:
                        cls= "form-control single";
                }

                var optionsTemp =[];
                //optionsTemp.push(<option value={parameterData.displayName} disabled="true">{parameterData.displayName}</option>);
                let options = parameterData.defaultValue;
                let mName = this.props.metricSelected.name;
                let mDispName = this.props.metricSelected.displayName;
                let mselected = this.props.metricSelected.selected;
                if(tune){
                    switch(parameterData.displayName){
                        case"Activation":
                            var rowCls = "activation";
                            break;
                        case"Solver Used":
                            rowCls = "solverGrid";
                            break;
                        case"Learning Rate":
                            rowCls = "learningGrid";
                            break;
                        case"Shuffle":
                            rowCls = "shuffleGrid";
                            break;
                        case "Verbose":
                            rowCls = "verboseGrid";
                            break;
                        default:
                            rowCls = "row";
                    }  

                    var cls="form-control multi"
                    var selectedValue =[];
                    for (var prop in options) {
                        if(options[prop].selected)
                            selectedValue.push(options[prop].name)

                            if(this.props.parameterData.defaultValue.map(val=>val)[0].displayName=="adam"){//to run below switch conditon  only for ANN, #1363      
                        switch(parameterData.name){
                            case"solver":
                    if((options.map(i=>i)[2].selected && parameterData.defaultValue.map(i=>i)[2].displayName=="sgd")&&
                           (options.map(i=>i)[1].selected && parameterData.defaultValue.map(i=>i)[1].displayName=="lbfgs")&&
                           (options.map(i=>i)[0].selected && parameterData.defaultValue.map(i=>i)[0].displayName=="adam")){ //sgd
                        $(".disNum").prop("disabled",false);
                        $(".beta1").prop("disabled",false);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",false);
                        $(".learningGrid .multiselect").prop("disabled",false);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",false);
                        $(".momentumCls").prop("disabled",false);
                        
                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        if(document.querySelector(".learningGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "Please Select at least one";
                        }else document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";  
                    
                    }
                    else if((options.map(i=>i)[2].selected && parameterData.defaultValue.map(i=>i)[2].displayName=="sgd")&&
                            (options.map(i=>i)[1].selected && parameterData.defaultValue.map(i=>i)[1].displayName=="lbfgs")){ //sgd
                        $(".disNum").prop("disabled",true);
                        $(".beta1").prop("disabled",true);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",false);
                        $(".learningGrid .multiselect").prop("disabled",false);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",true);
                        $(".momentumCls").prop("disabled",false);
                        
                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        if(document.querySelector(".learningGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "Please Select at least one";
                        }else document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";  

                    }
                    else if((options.map(i=>i)[0].selected && parameterData.defaultValue.map(i=>i)[0].displayName=="adam")&&
                            (options.map(i=>i)[1].selected && parameterData.defaultValue.map(i=>i)[1].displayName=="lbfgs")){ //sgd
                        $(".disNum").prop("disabled",false);
                        $(".beta1").prop("disabled",false);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",true);
                        $(".learningGrid .multiselect").prop("disabled",true);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",false);
                        $(".momentumCls").prop("disabled",true);

                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";

                    }
                    else if((options.map(i=>i)[0].selected && parameterData.defaultValue.map(i=>i)[0].displayName=="adam")&&
                            (options.map(i=>i)[2].selected && parameterData.defaultValue.map(i=>i)[2].displayName=="sgd")){ //sgd
                        $(".disNum").prop("disabled",false);
                        $(".beta1").prop("disabled",false);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",false);
                        $(".learningGrid .multiselect").prop("disabled",false);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",false);
                        $(".momentumCls").prop("disabled",false);
                        
                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        if(document.querySelector(".learningGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "Please Select at least one";
                        }else document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";  
                        
                    }
                        else if(options.map(i=>i)[1].selected && parameterData.defaultValue.map(i=>i)[1].displayName=="lbfgs"){ //lbfgs
                        $(".learningGrid .multiselect").prop("disabled",true); 
                        $(".disNum").prop("disabled",true);
                        $(".beta1").prop("disabled",true);
                        $(".learningClsInit").prop("disabled",true);
                        $(".powerT").prop("disabled",true);
                        $(".shuffleGrid .multiselect").prop("disabled",true);
                        $(".iterationGrid").prop("disabled",true);
                        $(".epsilonGrid").prop("disabled",true);
                        $(".momentumCls").prop("disabled",true);
                        
                        document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";
                  }
                    else if(options.map(i=>i)[0].selected && parameterData.defaultValue.map(i=>i)[0].displayName=="adam"){ //adam
                        $(".disNum").prop("disabled",false);
                        $(".beta1").prop("disabled",false);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",true);
                        $(".learningGrid .multiselect").prop("disabled",true);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",false);
                        $(".momentumCls").prop("disabled",true);
                        
                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";  
                    }
                    else if(options.map(i=>i)[2].selected && parameterData.defaultValue.map(i=>i)[2].displayName=="sgd"){ //sgd
                        $(".disNum").prop("disabled",true);
                        $(".beta1").prop("disabled",true);
                        $(".learningClsInit").prop("disabled",false);
                        $(".powerT").prop("disabled",false);
                        $(".learningGrid .multiselect").prop("disabled",false);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",true);
                        $(".momentumCls").prop("disabled",false);

                        if(document.querySelector(".shuffleGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "Please Select at least one";                          
                        }else document.getElementsByClassName("shuffleGrid")[0].lastChild.innerText = "";                            
                        
                        if(document.querySelector(".learningGrid .for_multiselect").innerText == "None selected"){
                            document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "Please Select at least one";
                        }else document.getElementsByClassName("learningGrid")[0].lastChild.innerText = "";  
                        
                    }              
                    else{
                        $(".disNum").prop("disabled",false);
                        $(".beta1").prop("disabled",false);
                        $(".learningClsInit").prop("disabled",false);
                        $(".earlyStop").prop("disabled",false);
                        $(".powerT").prop("disabled",false);
                        // $(".learningGrid .for_multiselect").removeClass("disableGrid");
                        $(".learningGrid .multiselect").prop("disabled",false);
                        $(".shuffleGrid .multiselect").prop("disabled",false);
                        $(".iterationGrid").prop("disabled",false);
                        $(".epsilonGrid").prop("disabled",false);
                        $(".momentumCls").prop("disabled",false);
                    }
                    break;
                    default:
                       "";
             }
            }

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
                   <div className= {"row" + " " + rowCls}>
                  <div className="col-md-6 for_multiselect">
                 <select ref={(el) => { this.eleSel = el }} className={cls} onChange={this.selecthandleChange.bind(this)} multiple={tune?"multiple":false}>
                 {optionsTemp}
                 {/* <option value={mName} selected={mselected}>{mDispName}</option> */}
                 </select>
				</div>
                  <div className="clearfix"></div>
                  {tune ?<div className="col-md-6 check-multiselect text-danger">{(selectedValue.length == 0)?"Please select at least one":""}</div>:""}
                  {/*{(tune && selectedValue.length == 0)?<div className="col-md-6 check-multiselect text-danger">Please select at least one</div>:""}*/}
                </div>
               );
                break;
            
            case "number":
                if(parameterData.uiElemType == "textBox"){
                    switch(parameterData.displayName){
                        case"Beta 1":
                        var  classN= "form-control beta1";
                        break;
                        case"Beta 2":
                        var  classN= "form-control disNum";
                        break;
                        case"Learning Rate Initialize":
                         classN= "form-control learningClsInit";
                        break;
                        case "Power T":
                        classN = "form-control powerT" ;
                        break;
                        case"Validation Fraction":
                        var  classN= "form-control fractionCls"; 
                        break;
                        case"Momentum":
                        var  classN= "form-control momentumCls"; 
                        break;
                        case"Alpha":
                        var type= "text";
                        classN= "form-control alphaCls";
                        break;
                        case"Batch Size":
                        var type= "text";
                        classN= "form-control batchCls";
                        break;
                        case"Hidden Layer Size":
                        var type= "text";
                        classN= "form-control hiddenCls";
                        break;
                        default:
                        classN= "form-control";
                        var type= "number";

                    }                  
                    return (
                         <div className="row">
                        <div className="col-md-2">
                            <input type={type} className={classN} onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} />
                            <div className="clearfix"></div>
                                <div className="range-validate text-danger"></div>
                        </div>
                        </div>
                       );
                }
                else if(parameterData.uiElemType == "slider"){
                    if(tune){
                        switch(parameterData.displayName){
                            case"Epsilon":
                        var sliderclassN= "form-control epsilonGrid";
                        break;
                        case"No of Iteration":
                           sliderclassN= "form-control iterationGrid";
                        break;
                        case"Maximum Solver Iterations":
                        if(parameterData.defaultValue==200)
                           sliderclassN= "form-control maxSolverGrid";
                           else 
                           sliderclassN="form-control";
                        break;
                        case"Convergence tolerance of iterations(e^-n)":
                        if(parameterData.neural)
                            sliderclassN= "form-control convergGrid";
                            else 
                            sliderclassN= "form-control";

                        break;
                        default:
                           sliderclassN="form-control";
                        }
                        return(
                            <div className="row">                            
                            <div className="col-md-12">
                                <div className="row">
                                <div className="col-md-2">
                                    <div className="clr-alt4 gray-box">
                                    {this.state.min}
                                    </div></div>
                                <div className="col-md-2"><div className="clr-alt4 gray-box"> {this.state.max}</div></div>
                                <div className="col-md-6">
                                    <input type="text" className={sliderclassN} value={this.state.defaultVal} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,parameterData.expectedDataType)} onChange={this.changeTextboxValue.bind(this)} placeholder={(this.state.min<1 && this.state.max==1)?"e.g. 0.5-0.7, 0.4, 1":"e.g. 3-10, 10-400, 10"} />
                                <div className="clearfix"></div>
                                <div className="range-validate text-danger"></div>
                                </div>
                                </div>
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
                    if(parameterData.expectedDataType)
                    
                    var dataTypes = parameterData.expectedDataType;
                    else
                    var dataTypes = ["int"];
                    switch(parameterData.displayName){
                        case"Epsilon":
                        var cls= "col-xs-10 epsilonCls";
                        var sliderTextCls="form-control inputWidth epsilonCls"
                    
                        break;
                        case"No of Iteration":
                        var  cls= "col-xs-10 iterationCls";
                        var sliderTextCls="form-control inputWidth iterationCls"

                        break;
                        default:
                        var cls = "col-xs-10";
                        var sliderTextCls="form-control inputWidth"

                        break;
                    }

           
                    return (
                            <div className="row">                            
                                <div className="col-md-6 col-sm-2">

                                    <div className="col-xs-1 clr-alt4">{this.state.min}</div>
                                    <div className={cls}>
                                        <ReactBootstrapSlider value={this.state.defaultVal} triggerSlideEvent="true" change={this.changeSliderValue.bind(this)} step={step} max={this.state.max} min={this.state.min}/>
                                    </div>
                                    <div className="col-xs-1 clr-alt4"> {this.state.max}</div>
                            
                            </div>
                            <div className="col-md-4 col-sm-4"><input type="number" onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } min = {this.state.min} max = {this.state.max} className={sliderTextCls} value={this.state.defaultVal} onChange={this.changeSliderValueFromText.bind(this)} onInput={this.changeFoldCheck.bind(this,this.state.min,this.state.max)} onBlur={this.checkChangeTextboxValue.bind(this,this.state.min,this.state.max,dataTypes)}/>
                           {/* #1361 added onKeyDown to prevent e */}
                            <div className="clearfix"></div>
                            <div className="range-validate text-danger"></div>
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
                switch(parameterData.name){
                    case"hidden_layer_sizes":
                    var defaultCls= "form-control single hiddenLayerCls"
                    break;
                    default:
                    defaultCls= "form-control"


                }
                return (
                    <div className="row">
                    <div className="col-md-6">
                    <input type="text" className={defaultCls} value={this.state.defaultVal} onChange={this.changeTextboxValue.bind(this)}/>
                    <div className="text-danger range-validate" id="error"></div>
                    </div>
                    </div>
                );

            }

       
    }
    render() {
        let parameterData = this.props.parameterData;
        let tune = this.props.isTuning;
        const parameterElements = this.renderParameterData(parameterData,tune);
        return (
                <div class="col-md-6">
                {parameterElements}
                </div>
        );

    }
    
    validateTextboxValue(textboxVal,min,max,type,e){
        const regex = /^\s*([0-9]\d*(\.\d+)?)\s*-\s*([0-9]\d*(\.\d+)?)\s*$/;
        var numbers = /^(0|[1-9]\d*)(\.\d+)?$/;
        var letter = /[a-zA-Z]/;
        // if(!($('.fractionCls').val()== undefined)){
        if(this.props.algorithmData[4].hyperParameterSetting[0].selected == false){
         if(e.target.classList[1]=="fractionCls" && !numbers.test($('.fractionCls').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
         }
       }
       if(this.props.algorithmData[4].hyperParameterSetting[0].selected == true){
        if(e.target.classList[1]=="maxSolverGrid" && letter.test($('.maxSolverGrid').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="convergGrid" && letter.test($('.convergGrid').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="epsilonGrid" && letter.test($('.epsilonGrid').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="iterationGrid" && letter.test($('.iterationGrid').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }

       }
     if(e.target.classList[1]=="learningClsInit" && !numbers.test($('.learningClsInit').val())){
          return {"iserror":true,"errmsg":"only numbers allowed"};
       }
       else if(e.target.classList[1]=="alphaCls" && !numbers.test($('.alphaCls').val())){
        return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="momentumCls" &&!numbers.test($('.momentumCls').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="beta1" && !numbers.test($('.beta1').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="disNum" && !numbers.test($('.disNum').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="hiddenCls" && letter.test($('.hiddenCls').val())){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        else if(e.target.classList[1]=="hiddenCls" && ($('.hiddenCls').val()=="")){
            return {"iserror":true,"errmsg":"only numbers allowed"};
        }
        

        const parts = textboxVal.split(/,|\u3001/);
        for (let i = 0; i < parts.length; ++i)
        {
            const match = parts[i].match(regex);
            if (match) {
                var checkType = this.checkType(match[1],type,min,max);
                if(checkType.iserror == true)
                return {"iserror":true,"errmsg":checkType.errmsg};
                var checkType2 = this.checkType(match[3],type);
                if(checkType2.iserror == true)
                return {"iserror":true,"errmsg":checkType2.errmsg};                
                if (!this.isPositiveInteger(match[1]) && match[1] !== '')
                return {"iserror":true,"errmsg":"Invalid Range"};
                else if (!this.isPositiveInteger(match[3]) && match[3] !== '')
                return {"iserror":true,"errmsg":"Invalid Range"};
                const from = match[1] ? parseFloat(match[1], 10) : min;
                const to = match[3] ? parseFloat(match[3], 10) : max;
                if (from > to || from < min || from > max) //ex:grid search 10-400 "check for both values range"
                return {"iserror":true,"errmsg":"Valid Range is "+min+"-"+max};
                if (to > max || to < min || to > max)//ex:grid search  10-400 "if right value is more then range"
                return {"iserror":true,"errmsg":"Valid Range is "+min+"-"+max};
            }
            else{
                if(this.props.parameterData.name != "max_leaf_nodes"){
                    var isSingleNumber = parts[i].split(/-|\u3001/);
                    if(isSingleNumber.length > 1)
                    return {"iserror":true,"errmsg":"Valid Range is "+min+"-"+max};
                    if(this.props.parameterData.displayName == "Random Seed" && ((parts[i]^0) != parts[i]))
                    return {"iserror":true,"errmsg":"Decimals are not allowed"};
                    if (!this.isPositiveInteger(parts[i]) && type.indexOf(null) < 0)
                    return {"iserror":true,"errmsg":"Valid Range is "+min+"-"+max};
                    const singleNumber = parseFloat(parts[i], 10);
                    // if ((singleNumber > max || singleNumber < min ) && type.indexOf(null) < 0)
                    if ((singleNumber > max || singleNumber < min )) /* type.indexOf(null) breaking the validation */
                    return {"iserror":true,"errmsg":"Valid Range is "+min+"-"+max};
                    //1310
                    var checkType = this.checkType(parts[i],type,min,max);
                    if(checkType.iserror == true)
                    return {"iserror":true,"errmsg":checkType.errmsg};
                }else{
                    var isSingleNumber = parts[i].split(/-|\u3001/);
                    if((parts[i]^0) != parts[i])
                        return {"iserror":true,"errmsg":"Decimals are not allowed"};
                    if(parts[i] <= 0)
                        return {"iserror":true,"errmsg":"Value should be greater than zero"};
                }
            }
        }
    }
    isPositiveInteger(value) {
        return (parseInt(value), 10) >= 0;
    }
    isInteger(toTest) {
        const numericExp = /^\s*[0-9]+\s*$/;
        return numericExp.test(toTest);
    }
    checkType(val,type,min,max){
        if(val === min || val === max)
        {
            return {"iserror":false,"errmsg":""};
        }
        else{
            var allowedTypes = "";
            var wrongCount = 0;
            var that = this;
            if(!this.props.algorithmData[4]){
            $.each(type,function(k,v){
                if(v == "float"){
                    (k == 0)?allowedTypes = "Decimals" : allowedTypes+= ", Decimals";
                    if(val % 1 == 0)
                    wrongCount++;
                }
                else if(v == "int"){
                    (k == 0)?allowedTypes = "Numbers" : allowedTypes+= ", Numbers";
                    if(val % 1 != 0 || parseInt(val.toString().split(".")[1])==0)
                    wrongCount++;
                }
                else if(v == null && val != null){
                    type.splice(k,1);
                    that.checkType(val,type,min,max);
                }
            });
        }
            if(wrongCount != 0 && wrongCount == type.length)
            return {"iserror":true,"errmsg":"Only "+allowedTypes+" are allowed"};
            else
            return {"iserror":false,"errmsg":""};
            
        }
        
    }
}
