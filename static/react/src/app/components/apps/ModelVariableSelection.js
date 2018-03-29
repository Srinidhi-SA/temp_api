import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {updateTrainAndTest,createModel,updateSelectedVariable,showLevelCountsForTarget,updateTargetLevel,saveSelectedValuesForModel,updateRegressionTechnique,updateCrossValidationValue,getAppDetails,reSetRegressionVariables} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview,showAllVariables} from "../../actions/dataActions";
import {hideTargetVariable} from "../../actions/signalActions";
import {statusMessages} from "../../helpers/helper";

@connect((store) => {
    return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
        trainValue:store.apps.trainValue,testValue:store.apps.testValue,
        modelSummaryFlag:store.apps.modelSummaryFlag,
        modelSlug:store.apps.modelSlug,
        targetLevelCounts:store.apps.targetLevelCounts,
        currentAppDetails:store.apps.currentAppDetails,
        regression_selectedTechnique:store.apps.regression_selectedTechnique,
        regression_crossvalidationvalue:store.apps.regression_crossvalidationvalue,
    };
})

export class ModelVariableSelection extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        //It will trigger when refresh happens on url
        this.props.dispatch(getAppDetails(this.props.match.params.AppId));
        if(this.props.dataPreview == null){
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
        }
        this.props.dispatch(reSetRegressionVariables());
        this.props.dispatch(updateTrainAndTest(50));
        this.props.dispatch(updateTargetLevel(null));
        if(this.props.dataPreview != null)
        this.props.dispatch(showAllVariables(this.props.dataPreview,this.props.match.params.slug));
    }
    handleRangeSlider(e){
        this.props.dispatch(updateTrainAndTest(e.target.value))
    }
    createModel(event){
        event.preventDefault();
        if($('#createModelAnalysisList option:selected').val() == ""){
            let msg= statusMessages("warning","Please select a variable to analyze...","small_mascot");
              bootbox.alert(msg);
            return false;
        }
		
		if(store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
		this.props.dispatch(saveSelectedValuesForModel($("#createModelName").val(),$("#createModelAnalysisList").val(),$("#createModelLevelCount").val()));
            let regressionProccedUrl = this.props.match.url+'/Proceed';
            this.props.history.push(regressionProccedUrl);
        }
        else
        this.props.dispatch(createModel($("#createModelName").val(),$("#createModelAnalysisList").val(),$("#createModelLevelCount").val()))
    }
    setPossibleList(event){
        this.props.dispatch(showLevelCountsForTarget(event))
        this.props.dispatch(hideTargetVariable(event));
        this.props.dispatch(updateSelectedVariable(event));
    }
        handleOptionChange(e){
        this.props.dispatch(updateRegressionTechnique(e.target.value));
        //this.setState({ selectedTechnique: e.target.value});
    }
    changecrossValidationValue(e){
        this.props.dispatch(updateCrossValidationValue(e.target.value));
        //this.setState({ crossvalidationvalue: e.target.value});
    }
    render() {
        console.log("Create Model Variable Selection  is called##########3");
       let custom_word1 = "";
       let custom_word2 = "";
       var modelValidation = "";
       var buttonName = "Create Model";
        if(store.getState().apps.modelSummaryFlag){
            let _link = "/apps/"+store.getState().apps.currentAppDetails.slug+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        let renderLevelCountSelectBox = null;
        if(dataPrev && store.getState().apps.currentAppDetails != null ){
            const metaData = dataPrev.meta_data.uiMetaData.varibaleSelectionArray;
            if(metaData){
                renderSelectBox =  <select className="form-control" onChange={this.setPossibleList.bind(this)} id="createModelAnalysisList">
                    <option value=""></option>
                {store.getState().apps.currentAppDetails.app_type == "REGRESSION" ?
                    metaData.map((metaItem,metaIndex) =>{
                        if(metaItem.columnType =="measure" && !metaItem.dateSuggestionFlag && !metaItem.uidCol){
                            return(<option key={metaItem.slug}  name={metaItem.slug}  value={metaItem.columnType}>{metaItem.name}</option>)
                        }
                    }):
                    metaData.map((metaItem,metaIndex) =>{
                        if(metaItem.columnType !="measure" && metaItem.columnType !="datetime" && !metaItem.dateSuggestionFlag && !metaItem.uidCol){
                            return(<option key={metaItem.slug}  name={metaItem.slug}  value={metaItem.columnType}>{metaItem.name}</option>)
                        }
                    })
                }
                </select>
            }else{
                renderSelectBox = <option>No Variables</option>
            }
            if(this.props.targetLevelCounts != null){
                renderLevelCountSelectBox =  <select className="form-control" id="createModelLevelCount">
                    <option value=""></option>
                {this.props.targetLevelCounts.map((item,index) =>{
                   
                        return(<option key={item}  name={item}  value={item}>{item}</option>)
                }
                )}
                </select>
            }
        }
        if(this.props.currentAppDetails != null){
            custom_word1 = this.props.currentAppDetails.custom_word1;
            custom_word2 = this.props.currentAppDetails.custom_word2;

             if(store.getState().apps.currentAppDetails.app_type == "REGRESSION"){
                 buttonName = "Proceed";
                       modelValidation = <div className="col-lg-8">
                            <h4>Model Validation</h4>
                            <div class="xs-pb-10">
                            <div class="ma-radio inline"><input type="radio" class="timeDimension" name="modalValidation" id="crossValidation" value="crossValidation" onChange={this.handleOptionChange.bind(this)} checked={store.getState().apps.regression_selectedTechnique == "crossValidation"}/><label for="crossValidation">Cross Validation</label></div>
                                <div class="ma-radio inline"><input type="radio" class="timeDimension" name="modalValidation" id="trainTestValidation" value="trainTestValidation" onChange={this.handleOptionChange.bind(this)} checked={store.getState().apps.regression_selectedTechnique == "trainTestValidation"}/><label for="trainTestValidation">Train Test Validation</label></div>
                            </div>
                            {store.getState().apps.regression_selectedTechnique == "crossValidation" ?
                                <div class="form-group">
                                    <label class="col-lg-2 xs-pt-10" for="noOffolds">No of Folds :</label>
                                    <div class="col-lg-10">
                                        <input type="number" name="" class="form-control" required={true} id="noOffolds" onChange={this.changecrossValidationValue.bind(this)} value={store.getState().apps.regression_crossvalidationvalue}/>
                                    </div>
                                </div>:
                                <div id="range">
                                    <div id="rangeLeftSpan" >Train <span id="trainPercent">{store.getState().apps.trainValue}</span></div>
                                    <input type="range" id="rangeElement"  onChange={this.handleRangeSlider.bind(this)}  min={50} defaultValue={50} />
                                    <div id="rangeRightSpan" ><span id="testPercent">{store.getState().apps.testValue}</span> Test </div>
                                </div>
                            }
                        </div>
             }
                        else{
                             buttonName = "Create Model";
                        modelValidation = <div className="col-lg-8">
                            <div id="range" >
                                <div id="rangeLeftSpan" >Train <span id="trainPercent">{store.getState().apps.trainValue}</span></div>
                                <input type="range" id="rangeElement"  onChange={this.handleRangeSlider.bind(this)}  min={50} defaultValue={50} />
                                <div id="rangeRightSpan" ><span id="testPercent">{store.getState().apps.testValue}</span> Test </div>
                            </div>
                        </div>
                    }
        }
        return(
                <div className="side-body">
                <div className="page-head">
                <div className="row">
                <div className="col-md-8">
                <h3 class="xs-mt-0 text-capitalize">Variable Selection</h3>
                </div>
                </div>
                <div className="clearfix"></div>
                </div>
                <div className="main-content">

                <div className="panel panel-default box-shadow">
                <div className="panel-body">
                <Form onSubmit={this.createModel.bind(this)}>
                <FormGroup role="form">
                
                 <div className="row">

                <div className="form-group hidden">
                <label className="col-lg-4"><h4>I want to predict {custom_word1}</h4></label>
                </div>
                </div>
                
                <div className="row">

                <div className="form-group">
                <label className="col-lg-2 xs-pt-10">I want to predict :</label>
                <div className="col-lg-4"> {renderSelectBox}</div>
                </div>
                 {/*<!-- /.col-lg-4 -->*/}
                </div>
                {(this.props.targetLevelCounts != null)? ( <div className="row xs-mb-20">
                    <div className="form-group">
                    <label className="col-lg-2 xs-pt-10">Choose Value for {custom_word2}</label>
                    <div className="col-lg-4"> {renderLevelCountSelectBox}</div>
                    </div>
                     {/*<!-- /.col-lg-4 -->*/}
                    </div>) : (<div></div>)
                    
                }
             
                <DataVariableSelection match={this.props.match}/>
                <div className="row">
                    {modelValidation}
                 </div>
                 <div class="row">      
                <div className="col-lg-4 col-lg-offset-8">
                <div className="form-group">
                <input type="text" name="createModelName" required={true} id="createModelName" className="form-control input-sm" placeholder="Create Model Name" />
                    </div>
                </div>
                </div>
                <div className="row">
                <div className="col-lg-12 text-right">
                <Button type="submit" bsStyle="primary">{buttonName}</Button>
                </div>
                </div>
                </FormGroup>
                </Form>
                </div>
                </div>
                </div>
                <AppsLoader match={this.props.match}/>
                </div>
        );
        
    }
}
