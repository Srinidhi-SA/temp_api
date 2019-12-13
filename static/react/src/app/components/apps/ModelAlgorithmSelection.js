import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tabs,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import {createModel,getRegressionAppAlgorithmData,setDefaultAutomatic,updateAlgorithmData,checkAtleastOneSelected,saveParameterTuning,changeHyperParameterType} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview} from "../../actions/dataActions";
import {RegressionParameter} from "./RegressionParameter";
import {STATIC_URL} from "../../helpers/env.js";
import {statusMessages} from "../../helpers/helper";
import { TensorFlow } from "./TensorFlow";

@connect((store) => {
    return {login_response: store.login.login_response,
        dataPreview: store.datasets.dataPreview,
        modelTargetVariable:store.apps.modelTargetVariable,
        selectedAlg:store.apps.selectedAlg,
        scoreSummaryFlag:store.apps.scoreSummaryFlag,
        currentAppId:store.apps.currentAppId,
        automaticAlgorithmData:store.apps.regression_algorithm_data,
        manualAlgorithmData:store.apps.regression_algorithm_data_manual,
        isAutomatic:store.apps.regression_isAutomatic,
        apps_regression_modelName:store.apps.apps_regression_modelName,
        currentAppDetails:store.apps.currentAppDetails,
        modelSummaryFlag:store.apps.modelSummaryFlag,
    };
})

export class ModelAlgorithmSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showParameterTuning:false
        };
    }
    componentWillMount() {
        if(this.props.apps_regression_modelName == "" || this.props.currentAppDetails == null){
            window.history.go(-1);
        }
    }
    componentDidMount() {
        $("#manualBlock_111").addClass("dispnone");
        $("#automaticBlock_111").removeClass("dispnone");

    }

    createModel(event){
        Notification.requestPermission();
            var isContinueRange = this.checkRangeValidation();
            var isContinueMulticheck = this.checkMultiSelectValidation();
            if(!isContinueRange || !isContinueMulticheck){
             if(document.getElementsByClassName("InterceptGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Fit Intercept...","small_mascot");
                    bootbox.alert(msg);
                    $(".InterceptGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                }else if(document.getElementsByClassName("solverGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Solver Used...","small_mascot");
                    bootbox.alert(msg);
                    $(".solverGrid .multiselect").addClass("regParamFocus");

                    return false;   
                }else if(document.getElementsByClassName("criterionGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Criterion...","small_mascot");
                    bootbox.alert(msg);
                    $(".criterionGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                }else if(document.getElementsByClassName("bootstrapGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Bootstrap Sampling...","small_mascot");
                    bootbox.alert(msg);
                    $(".bootstrapGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                }else if(document.getElementsByClassName("boosterGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Booster Function...","small_mascot");
                    bootbox.alert(msg);
                    $(".boosterGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                }else if(document.getElementsByClassName("treeGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Tree Construction Algorithm...","small_mascot");
                    bootbox.alert(msg);
                    $(".treeGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                } else if(document.getElementsByClassName("activation")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Activation...","small_mascot");
                    bootbox.alert(msg);
                    $(".activation .multiselect").addClass("regParamFocus");
                    return false;
                }else if(document.getElementsByClassName("shuffleGrid")[0].innerHTML.includes("None selected") && (document.getElementsByClassName("solverGrid")[0].innerText.includes("adam") || document.getElementsByClassName("solverGrid")[0].innerText.includes("sgd") ) ){
                    let msg= statusMessages("warning","Please select Shuffle...","small_mascot");
                    bootbox.alert(msg);
                    $(".shuffleGrid .multiselect").addClass("regParamFocus");

                    return false;
                }else if((document.getElementsByClassName("learningGrid")[0].innerHTML.includes("None selected")) && (document.getElementsByClassName("solverGrid")[0].innerText.includes("sgd"))){
                    let msg= statusMessages("warning","Please select Learning Rate...","small_mascot");
                    bootbox.alert(msg);
                    $(".learningGrid .multiselect").addClass("regParamFocus");

                    return false;
                }else if(document.getElementsByClassName("batchGrid")[0].innerHTML.includes("None selected")){
                    let msg= statusMessages("warning","Please select Batch Size...","small_mascot");
                    bootbox.alert(msg);
                    $(".batchGrid .multiselect").addClass("regParamFocus");
                    
                    return false;
                }

               
                let msg= statusMessages("warning","Please resolve errors...","small_mascot");
                bootbox.alert(msg);
                return false;

            
            }
            else{
            this.props.dispatch(createModel(store.getState().apps.apps_regression_modelName,store.getState().apps.apps_regression_targetType,store.getState().apps.apps_regression_levelCount,store.getState().datasets.dataPreview.slug,"analyst"));
            }

    }
    handleOptionChange(e){
        if(e.target.value == 1){
         $("#automaticBlock_111").removeClass("dispnone");
          $("#manualBlock_111").addClass("dispnone");
        }
        else
        {
            $("#automaticBlock_111").addClass("dispnone");
          $("#manualBlock_111").removeClass("dispnone");
        }
        this.props.dispatch(setDefaultAutomatic(e.target.value));
    }
    changeAlgorithmSelection(data){
        console.log(data);
        this.props.dispatch(updateAlgorithmData(data.algorithmSlug));
    }
    changeParameter(){
        this.props.dispatch(saveParameterTuning());
    }
    changeHyperParameterType(slug,e){
        this.props.dispatch(changeHyperParameterType(slug,e.target.value));
        if(e.target.value="none"){
            $(".learningGrid .for_multiselect").removeClass("disableGrid");
        }
    }

    handleBack=()=>{
        const appId = this.props.match.params.AppId;
        const slug = this.props.match.params.slug;
        this.props.history.replace(`/apps/${appId}/analyst/models/data/${slug}/createModel/algorithmSelection`);

      }

    render() {
        if(store.getState().apps.modelSummaryFlag){ 
            var modeSelected= store.getState().apps.analystModeSelectedFlag?'/analyst' :'/autoML'
            let _link = "/apps/"+store.getState().apps.currentAppDetails.slug+modeSelected+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
        var algorithmData = this.props.manualAlgorithmData;
        var algoClass = (this.props.currentAppId == 13) ? "col-md-3" : "col-md-algo";
        if (!$.isEmptyObject(algorithmData)){
            var pageData = "";
                var buttonName = "Create Model";
                var pageTitle = "Parameter Tuning";
                var label= document.getElementsByClassName("active")[1];
                var minmaxLabel= (label=== undefined) ? "linear" : label.innerText 
               
                var pageData = algorithmData.map((data,Index) =>{
                    var hyperParameterTypes = [];
                    var selectedValue = "";
                    var hyperparameterOptionsData = "";
                    var algorithmPath = "algorithmData["+Index+"]";
                    var options = data.hyperParameterSetting;
                        for (var prop in options) {
                            if(options[prop].selected){
                                selectedValue = options[prop].name;
                                if(options[prop].params != null && options[prop].params.length >0){
                                    var hyperparameterOptions = options[prop].params;
                                    hyperparameterOptionsData = hyperparameterOptions.map((param,index) =>{
                                        if(param.display){
                                            return(

                                                    <div class="form-group">
                                                        <label class="col-md-3 control-label read">{param.displayName}</label>
                                                        <RegressionParameter parameterData={param} tuneName={selectedValue} algorithmSlug={data.algorithmSlug} type="TuningOption"/>
                                                    <div class="clearfix"></div>
                                                    </div>

                                            );
                                        }
                                    });
                                }
                            }
                            hyperParameterTypes.push(<option key={prop} className={prop} value={options[prop].name}>{options[prop].displayName}</option>);
                        }
                    var algorithmParameters = data.parameters;
                    if(selectedValue != "none"){
                        var parametersData = algorithmParameters.map((params,Index) =>{
                            if(params.hyperpatameterTuningCandidate && params.display){
                                return(

                                        <div class="form-group">
                                            <label class="col-md-2 control-label read">{params.displayName}</label>
                                            <label class="col-md-4 control-label read">{params.description}</label>
                                            <RegressionParameter parameterData={params} tuneName={selectedValue} algorithmSlug={data.algorithmSlug} isTuning={true} type="TuningParameter"/>
                                        <div class="clearfix"></div>
                                        </div>

                                );
                            }
                        });
                    }
                    else
                    {
                        var parametersData = algorithmParameters.map((params,Index) =>{
                            if(params.display){
                                return(

                                    <div class="form-group">
                                        <label class="col-md-2 control-label read">{params.displayName}</label>
                                        <label class="col-md-4 control-label read">{params.description}</label>
                                        <RegressionParameter parameterData={params} tuneName={selectedValue} algorithmSlug={data.algorithmSlug} type="NonTuningParameter"/>
                                    <div class="clearfix"></div>
                                    </div>

                                );
                            }
                        });
                    }
                    if(data.selected == true)
                    {
                        return(
                            <Tab eventKey={data.algorithmSlug} title={data.algorithmName}>
                                <FormGroup role="form">
                                {data.algorithmName === "TensorFlow"?
                                <TensorFlow data/>
                                :data.algorithmName === "PyTorch"?
                                <PyTorch data/>:
                                (
								 <div className="xs-mt-20">
                                    <div className="form-group">
                                    <label class="col-md-3 control-label">Hyperparameter Tuning :</label>
                                    <div className="col-md-3">
                                        <select  class="form-control hyperTune" onChange={this.changeHyperParameterType.bind(this,data.algorithmSlug)} value={selectedValue}>
                                        {hyperParameterTypes}
                                        </select>
                                    </div>
                                    <div class="clearfix"></div>
                                    </div>
                                 </div>)}
                                 {(data.algorithmName === "TensorFlow") || (data.algorithmName === "PyTorch")?"":
                                 (<span>
                                <div>{hyperparameterOptionsData}</div>
                                <div>
                                    <div className="col-md-12">
                                    {selectedValue != "none"?
                                    <h5 className="text-info xs-mb-20">You can provide the intervals or options that we use for optimization using hyperparameter tuning.</h5>
                                    :<h5 className="text-info xs-mb-20">The parameter specifications below are recommended by mAdvisor.  You can still go ahead and tune any of them.</h5>}
                                    </div>
                                 </div>
                                 </span>)}
                                {selectedValue != "none" && (minmaxLabel != "LINEAR REGRESSION")?
                                <div className="maxminLabel">
                                     <label class="col-md-6 control-label read"></label>
                                     <label class="col-md-1 control-label read text-center">
                                            <b>Min</b>
                                    </label>
                                     <label class="col-md-1 control-label read text-center">
                                         <b>Max</b>
                                    </label>
                                     <label class="col-md-4 control-label read"><b><span>Enter values in one or multiple intervals</span></b></label>
                                </div>:""}
                                
                                <div>{(data.algorithmName === "TensorFlow") || (data.algorithmName === "PyTorch")?"":parametersData}</div>
								</FormGroup>
                            </Tab>
                        );
                    }

                });
            // }

        return(
                <div className="side-body">
                    <div className="page-head">

                                <h3 class="xs-mt-0 text-capitalize">{pageTitle}</h3>

                    </div>
                    <div className="main-content">
                          <div className="panel panel-mAd xs-p-20 box-shadow">
                                {/* {this.state.showParameterTuning == false ?
                                <div>
                                    <div className="panel-heading xs-ml-0 xs-mb-10">
                                        Please use the following learning algorithms for prediction
                                    </div>
                                    <div className="panel-body no-border">
									<div className="row algSelection xs-mb-20">
                                     {pageData}
									 </div>
                                     </div>
                                </div>:


                            } */}
                               <Tabs  id="algosel" onSelect={this.changeParameter.bind(this)} className="tab-container">
                                {pageData}
                                </Tabs>
							<div className="clearfix"></div>
                            <div>
                            <Button onClick={this.handleBack} bsStyle="primary"><i class="fa fa-angle-double-left"></i> Back</Button>
                            <Button type="button" bsStyle="primary xs-pl-20 xs-pr-20" style={{float:'right'}} onClick={this.createModel.bind(this)}>{buttonName} <i class="fa fa-angle-double-right"></i></Button>
                            </div>
							<div className="clearfix"></div>
                         </div>
                    </div>
                    <AppsLoader match={this.props.match}/>
                </div>
        );
    }
    else{
        return (
                 <div className="side-body">
                    <div className="page-head">
                    </div>
                    <div className="main-content">
                      <img id="loading" src={ STATIC_URL + "assets/images/Preloader_2.gif" } />
                    </div>
                  </div>
                );
    }
    }
    checkRangeValidation(){
        var isGo = true;
        $('.range-validate').each(function(){
            if($(this)[0].innerHTML != "")
            isGo =false;
        });
        return isGo;
    }
    checkMultiSelectValidation(){
        var isGo = true;
        $('.check-multiselect').each(function(){
            if($(this)[0].innerHTML != "")
            isGo =false;
        });
        return isGo;
    }
}
