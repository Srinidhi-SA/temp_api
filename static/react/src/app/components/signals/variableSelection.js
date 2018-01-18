import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import store from "../../store";
import {selectedAnalysisList,resetSelectedVariables,unselectAllPossibleAnalysis,getDataSetPreview,setDimensionSubLevels,selectAllAnalysisList,updateSelectAllAnlysis,saveAdvanceSettings,checkAllAnalysisSelected} from "../../actions/dataActions";
import {openCreateSignalModal,closeCreateSignalModal,updateCsLoaderValue} from "../../actions/createSignalActions";
import {createSignal,setPossibleAnalysisList,emptySignalAnalysis,advanceSettingsModal,checkIfDateTimeIsSelected,checkIfTrendIsSelected,updateCategoricalVariables,createcustomAnalysisDetails,checkAnalysisIsChecked,changeSelectedVariableType,hideTargetVariable,handleTargetSelection} from "../../actions/signalActions";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {CreateSignalLoader} from "../common/CreateSignalLoader";
import {openCsLoaderModal,closeCsLoaderModal} from "../../actions/createSignalActions";
import {AdvanceSettings} from "./AdvanceSettings";
import {SET_VARIABLE} from "../../helpers/helper";


var selectedVariables = {measures:[],dimensions:[],date:null};  // pass selectedVariables to config

@connect((store) => {
    return {login_response: store.login.login_response,
        newSignalShowModal: store.signals.newSignalShowModal,
        dataList: store.datasets.dataList,
        dataPreview: store.datasets.dataPreview,
        selectedMeasures:store.datasets.selectedMeasures,
        selectedDimensions:store.datasets.selectedDimensions,
        selectedTimeDimensions:store.datasets.selectedTimeDimensions,
        selectedAnalysis:store.datasets.selectedAnalysis,
        signalData: store.signals.signalData,
        selectedSignal: store.signals.selectedSignal,
        selectedSignalAnalysis: store.signals.signalAnalysis,
        getVarType: store.signals.getVarType,
        getVarText: store.signals.getVarText,
        selVarSlug:store.signals.selVarSlug,
        dataSetTimeDimensions:store.datasets.dataSetTimeDimensions,
        selectedVariablesCount: store.datasets.selectedVariablesCount,
        dataSetAnalysisList:store.datasets.dataSetAnalysisList,
        //selectedTrendSub:store.datasets.selectedTrendSub,
        dataSetAnalysisList:store.datasets.dataSetAnalysisList,
        dimensionSubLevel:store.datasets.dimensionSubLevel,
        dataSetSelectAllAnalysis:store.datasets.dataSetSelectAllAnalysis,

    };
})

/*		selectedDimensionSubLevels:store.datasets.selectedDimensionSubLevels,
		selectedTrendSub:store.datasets.selectedTrendSub,
		dataSetAnalysisListForLevels:store.datasets.dataSetAnalysisListForLevels,*/


export class VariableSelection extends React.Component {
    constructor(props) {
        super(props);

        console.log("preview data check");
        this.signalFlag =true;
        this.possibleTrend = null;
        this.prevSelectedVar = null;
        this.props.dispatch(emptySignalAnalysis());


    }

    handleAnlysisList(e){
        this.props.dispatch(selectedAnalysisList(e));
        this.props.dispatch(saveAdvanceSettings());
        this.props.dispatch(checkAllAnalysisSelected())
    }
    handleAllAnlysis(evt){
        this.props.dispatch(updateSelectAllAnlysis(evt.target.checked));
        this.props.dispatch(selectAllAnalysisList(evt.target.checked));

    }
    openAdvanceSettingsModal(){
        this.props.dispatch(advanceSettingsModal(true));
    }
    createSignal(event){
        event.preventDefault();
        var isAnalysisChecked = checkAnalysisIsChecked();
        //this.props.dispatch(handleTargetSelection());
        if($('#signalVariableList option:selected').val() == ""){
            bootbox.alert("Please select a variable to analyze...");
            return false;
        }
        if(!isAnalysisChecked){
            bootbox.alert("Please select atleast one analysis to Proceed..");
            return false;
        }

        var trendIsChecked = checkIfTrendIsSelected();
        var dateTimeIsSelected = checkIfDateTimeIsSelected();
        if(dateTimeIsSelected == undefined && trendIsChecked == true){
            bootbox.alert("Please select one of the date dimensions.");
            return false;
        }
        //check if no variable selected
        /*if(this.props.selectedTimeDimensions===undefined){
            if(this.props.selectedMeasures.length+this.props.selectedDimensions.length==0){
                bootbox.alert("Please select atleast one variable.")
                return false
            }
        }else{
            if(this.props.selectedMeasures.length+this.props.selectedDimensions.length+this.props.selectedTimeDimensions.length==0){
                bootbox.alert("Please select atleast one variable.")
                return false
            }
        }*/

        console.log("while creating signal")
        console.log(this.props);
        this.signalFlag = false;
        this.props.dispatch(updateCsLoaderValue(0))
        this.props.dispatch(openCsLoaderModal());
        //let customDetails = createcustomAnalysisDetails();
        let analysisList =[],config={}, postData={};
       /* config['possibleAnalysis'] = this.props.selectedAnalysis;
        config['measures'] =store.getState().datasets.selectedMeasures;
        config['dimension'] =store.getState().datasets.selectedDimensions;
        config['timeDimension'] =this.props.selectedTimeDimensions;
        config['customAnalysisDetails'] = customDetails["customAnalysisDetails"];
        config['polarity']=customDetails["polarity"];
        config['uidColumn']=customDetails["uidColumn"];
        postData["name"]=$("#createSname").val();
        postData["type"]=this.props.getVarType;
        postData["target_column"]=$('#signalVariableList option:selected').text();
        postData["config"]=config;

        postData["dataset"]=this.props.dataPreview.slug;*/

        config['variableSelection'] = store.getState().datasets.dataPreview.meta_data.uiMetaData.varibaleSelectionArray

        if(this.props.getVarType.toLowerCase() == "measure"){

            postData['advanced_settings'] = this.props.dataSetAnalysisList.measures;

        }else if(this.props.getVarType.toLowerCase() == "dimension"){
            postData['advanced_settings'] = this.props.dataSetAnalysisList.dimensions;
            this.props.dataSetAnalysisList.dimensions.targetLevels.push(this.props.dimensionSubLevel);

        }
        postData["config"]=config;
        postData["dataset"]=this.props.dataPreview.slug;
        postData["name"]=$("#createSname").val();
        console.log(postData);
       this.props.dispatch(createSignal(postData));
    }

    setPossibleList(event){
        this.props.dispatch(hideTargetVariable(event));
        this.props.dispatch(setPossibleAnalysisList(event));
        this.props.dispatch(updateSelectAllAnlysis(false));
        this.props.dispatch(selectAllAnalysisList(false));

    }

    componentWillMount(){
        if (this.props.dataPreview == null) {
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
        }
        this.props.dispatch(closeCsLoaderModal())
    }

    componentDidMount(){
        var that = this;

        /*$(function(){
			//alert($('#signalVariableList option:selected').val());
			that.props.dispatch(setPossibleAnalysisList(event));
		});*/
    }

    componentWillUpdate(){
        console.log("Advancesettings disbale check:::: ");
        /*  if(this.props.dataSetTimeDimensions.length == 0){
            $('#analysisList input[type="checkbox"]').last().attr("disabled", true);
        }else{
            $('#analysisList input[type="checkbox"]').last().attr("disabled", false);
        }*/
        if(!this.props.getVarType){
            $("#allAnalysis").prop("disabled",true);
            $("#advance-setting-link").hide();
        }else{
            $("#allAnalysis").prop("disabled",false);
            $("#advance-setting-link").show();
        }
    }
    componentDidUpdate(){
        var that = this;
        /*$(function(){
			that.props.dispatch(setPossibleAnalysisList(event));
		});*/

        if(!this.props.getVarType){
            $("#allAnalysis").prop("disabled",true);
            $("#advance-setting-link").hide();
        }else{
            $("#allAnalysis").prop("disabled",false);
            $("#advance-setting-link").show();
        }

    }
    handleCategoricalChk(event){
        this.props.dispatch(updateCategoricalVariables(this.props.selVarSlug,this.props.getVarText,SET_VARIABLE,event));
        this.props.dispatch(changeSelectedVariableType(this.props.selVarSlug,this.props.getVarText,SET_VARIABLE,event))
    }
    renderAnalysisList(analysisList){
        let list =  analysisList.map((metaItem,metaIndex) =>{
            let id = "chk_analysis"+ metaIndex;
            return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} checked={metaItem.status} onClick={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>);

        });
        return list;
    }
    render(){
        var that= this;
       /* if(that.props.getVarText && that.props.getVarType){ //getting selected dimension's sub levels

            if(that.props.getVarType == "dimension"){
                let columnData = store.getState().datasets.dataPreview.meta_data.scriptMetaData.columnData;
                let subLevelsDimension = [];

                for (let item of columnData) {
                    if(item.name.trim()== that.props.getVarText.trim()){
                        let columnStats = item.columnStats;
                        for (let subItem of columnStats) {
                            if(subItem.name == "LevelCount"){
                                subLevelsDimension = Object.keys(subItem.value);
                                break;
                            }
                        }
                        break;
                    }
                } // end of main for loop
                let subLevels = subLevelsDimension.map(function(item,index){
                    let tmpObj = {};
                    tmpObj[item] = false;
                    return tmpObj;
                });

                //that.props.dispatch(setDimensionSubLevels(subLevels));

            }else{

                //that.props.dispatch(setDimensionSubLevels(null));
            } // end of if dimension - code to setup sub level in popup

        }*/


        if(!$.isEmptyObject(this.props.selectedSignalAnalysis) && !that.signalFlag){
            console.log("move from variable selection page");
            console.log(this.props.selectedSignal)
            $('body').pleaseWait('stop');
            let _link = "/signals/"+this.props.selectedSignal;
            return(<Redirect to={_link}/>)
            ;
        }

        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        let renderPossibleAnalysis = null, renderSubList=null;
        if(dataPrev){
            const metaData = dataPrev.meta_data.uiMetaData.varibaleSelectionArray;
            if(metaData){
                renderSelectBox = metaData.map((metaItem,metaIndex) =>{
                    if(metaItem.columnType !="datetime" && !metaItem.dateSuggestionFlag){
                        return(
                                <option key={metaItem.slug}  name={metaItem.slug}   value={metaItem.columnType}>{metaItem.name}</option>
                        );
                    }
                })
            }else{
                renderSelectBox = <option>No Variables</option>
            }



            //AnalysisList
            let possibleAnalysis = store.getState().datasets.dataSetAnalysisList;
            if(!$.isEmptyObject(possibleAnalysis)){
                if(that.props.getVarType == "dimension"){
                    possibleAnalysis = possibleAnalysis.dimensions.analysis;
                    console.log("dimensions possible analysis list");
                    renderSubList = this.renderAnalysisList(possibleAnalysis);
                }else if(that.props.getVarType == "measure"){
                    possibleAnalysis = possibleAnalysis.measures.analysis;
                    console.log("measures possible analysis list");
                    console.log(possibleAnalysis);
                    renderSubList = this.renderAnalysisList(possibleAnalysis);
                }


            }
        }

        return (
                <div className="side-body">
                <div className="main-content">

                <div className="panel panel-default">
                <div className="panel-body no-border">
                <Form onSubmit={this.createSignal.bind(this)}>
                <FormGroup role="form">
                <div className="row">
                <div className="col-lg-2"><label for="signalVariableList">I want to analyze </label></div>
                <div className="col-lg-4">
                <div className="htmlForm-group">
                <select className="form-control" id="signalVariableList"  onChange={this.setPossibleList.bind(this)}>
                <option value=""></option>
                {renderSelectBox}
                </select>
                </div>
                </div>
                <div className="col-lg-4">
                <div className="ma-checkbox inline treatAsCategorical hidden" ><input id="idCategoricalVar" type="checkbox" onClick={this.handleCategoricalChk.bind(this)}/><label htmlFor="idCategoricalVar">Treat as categorical variable</label></div>
                </div>

                {/*<!-- /.col-lg-4 -->*/}

                </div>{/*<!-- /.row -->*/}
                <br/>
                {/*  adding selection component */}
                <DataVariableSelection/>
                <AdvanceSettings   />
                {/*---------end of selection component----------------------*/}
                <div className="row">
                <div className="col-md-12">
                <div className="panel panel-alt4">
                <div className="panel-heading text-center">Type of Signals</div>
                <div className="panel-body text-center" id="analysisList" >
                <div className="ma-checkbox inline"><input id="allAnalysis" type="checkbox" className="allAnalysis" checked={store.getState().datasets.dataSetSelectAllAnalysis} onClick={this.handleAllAnlysis.bind(this)}  /><label htmlFor="allAnalysis">Select All</label></div>
                {renderSubList}
                <div className="pull-right cursor">
                <a className="cursor" id="advance-setting-link" onClick={this.openAdvanceSettingsModal.bind(this)}>Advanced Settings</a>
                </div>
                </div>

                </div>
                </div>
                </div>
                <div className="row">
                <div className="col-lg-6 col-lg-offset-6">

                <div className="form-inline text-right">
                <div class="form-group">
                <label className="sr-only">Signal Name</label>
                <div className="htmlForm-group lg-pr-10">
                <input type="text" name="createSname" id="createSname"  required={true} className="form-control input-sm" placeholder="Enter a signal name"/>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">CREATE SIGNAL</button>
                </div>

                </div>{/*<!-- /.col-lg-4 -->*/}
                </div>

                </FormGroup>
                </Form>

                </div>
                </div>
                <CreateSignalLoader history={this.props.history} />

                </div>
                </div>

        )
    }

}
