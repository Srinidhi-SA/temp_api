import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import ReactDOM from 'react-dom';
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import store from "../../store";
import {selectedAnalysisList,resetSelectedVariables,unselectAllPossibleAnalysis,getDataSetPreview} from "../../actions/dataActions";
import {openCreateSignalModal,closeCreateSignalModal,updateCsLoaderValue} from "../../actions/createSignalActions";
import {createSignal,setPossibleAnalysisList,emptySignalAnalysis,advanceSettingsModal} from "../../actions/signalActions";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {CreateSignalLoader} from "../common/CreateSignalLoader";
import {openCsLoaderModal,closeCsLoaderModal} from "../../actions/createSignalActions";
import {AdvanceSettings} from "./AdvanceSettings";
import LinkedStateMixin from 'react-addons-linked-state-mixin';

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
        selectedSignal: store.signals.signalAnalysis,
        getVarType: store.signals.getVarType,
        dataSetTimeDimensions:store.datasets.dataSetTimeDimensions,
        selectedVariablesCount: store.datasets.selectedVariablesCount,
        dataSetAnalysisList:store.datasets.dataSetAnalysisList,
    };
})

export class VariableSelection extends React.Component {
    constructor(props) {
        super(props);
        
        console.log("preview data check");
        this.signalFlag =true;
        this.possibleTrend = null;
        this.prevSelectedVar = null;
        
        props.dispatch(emptySignalAnalysis());
    } 
    
    handleAnlysisList(e){
        this.props.dispatch(selectedAnalysisList(e))
        
    }
    openAdvanceSettingsModal(){
    	this.child.openAdvanceSettingsModal();
    }
    createSignal(event){
        event.preventDefault();
        console.log(this.props);
        this.signalFlag = false;
        this.props.dispatch(updateCsLoaderValue(10))
        this.props.dispatch(openCsLoaderModal())
        let analysisList =[],config={}, postData={};
        config['possibleAnalysis'] = this.props.selectedAnalysis;
        config['measures'] =this.props.selectedMeasures;
        config['dimension'] =this.props.selectedDimensions;
        config['timeDimension'] =this.props.selectedTimeDimensions;
        postData["name"]=$("#createSname").val();
        postData["type"]=$('#signalVariableList option:selected').val();
        postData["target_column"]=$('#signalVariableList option:selected').text();
        postData["config"]=config;
        postData["dataset"]=this.props.dataPreview.slug;
        console.log(postData);
        
        this.props.dispatch(createSignal(postData));
    }
    
    setPossibleList(e){
        this.props.dispatch(setPossibleAnalysisList(e.target.value));
    }
    componentWillMount(){
        if (this.props.dataPreview == null) {
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
        }
    }
    componentDidMount(){
        var that = this;
        $(function(){
            that.props.dispatch(setPossibleAnalysisList($('#signalVariableList option:selected').val()));
        });
        
    }
    componentWillUpdate(){
        console.log("trend disbale check:::: ");
        if(this.props.dataSetTimeDimensions.length == 0){
            $('#analysisList input[type="checkbox"]').last().attr("disabled", true);
        }else{
            $('#analysisList input[type="checkbox"]').last().attr("disabled", false);
        }
    }
    componentDidUpdate(){
        var that = this;
        $(function(){
            that.props.dispatch(setPossibleAnalysisList($('#signalVariableList option:selected').val()));
        });
        
    }
    render(){
        var that= this;
        if(!$.isEmptyObject(this.props.selectedSignal) && !that.signalFlag){
            console.log("move from variable selection page");
            console.log(this.props.selectedSignal)
            $('body').pleaseWait('stop');
            let _link = "/signals/"+this.props.selectedSignal.slug;
            return(<Redirect to={_link}/>)
            ;
        }
        
        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        let renderPossibleAnalysis = null, renderSubList=null;
        if(dataPrev){
            const metaData = dataPrev.meta_data.columnData;
            if(metaData){
                renderSelectBox = metaData.map((metaItem,metaIndex) =>{
                    if(metaItem.columnType !="datetime" && !metaItem.ignoreSuggestionFlag && !metaItem.dateSuggestionFlag){
                        return(
                                <option key={metaIndex}  value={metaItem.columnType}>{metaItem.name}</option>
                        );
                    }
                })
            }else{
                renderSelectBox = <option>No Variables</option>
            }
            
            //AnalysisList
            let possibleAnalysis = this.props.dataSetAnalysisList.analysis;
            if(possibleAnalysis){
            	
            	 renderSubList = possibleAnalysis.map((metaItem,metaIndex) =>{
                     let id = "chk_analysis"+ metaIndex;
                     return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.displayName} checked={metaItem.status} onChange={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.displayName}</label></div>);
                     
                 });
            	
            }
            
            // possible analysis list -------------------------------------
            {/* let possibleAnalysis = dataPrev.meta_data.possibleAnalysis.target_variable;
            // possible analysis options -----
            if(possibleAnalysis){
                if(that.prevSelectedVar != that.props.getVarType){
                    $(".possibleAnalysis").prop("checked",false);
                    that.props.dispatch(unselectAllPossibleAnalysis());
                }
                if(that.props.getVarType == "dimension"){
                    that.prevSelectedVar ="dimension";
                    renderSubList = possibleAnalysis.dimension.map((metaItem,metaIndex) =>{
                        let id = "chk_analysis"+ metaIndex;
                        let trendId = metaIndex +1;
                        that.possibleTrend = "chk_analysis"+trendId;
                        
                        return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} onChange={this.handleAnlysisList.bind(this)}  /><label htmlFor={id}>{metaItem.display}</label></div>);
                        
                    });
                }else if(that.props.getVarType ==  "measure"){
                    that.prevSelectedVar = "measure";
                    renderSubList = possibleAnalysis.measure.map((metaItem,metaIndex) =>{
                        let id = "chk_analysis"+ metaIndex;
                        let trendId = metaIndex +1;
                        that.possibleTrend = "chk_analysis"+trendId;
                        return(<div key={metaIndex} className="ma-checkbox inline"><input id={id} type="checkbox" className="possibleAnalysis" value={metaItem.name} onChange={this.handleAnlysisList.bind(this)} /><label htmlFor={id}>{metaItem.display}</label></div>);
                        
                    });
                    
                }
                
                renderPossibleAnalysis= (function(){
                    return( <div >
                                 {renderSubList}
                                <div  className="ma-checkbox inline"><input id={that.possibleTrend} type="checkbox" className="possibleAnalysis" value="Trend" onChange={that.handleAnlysisList.bind(that)} /><label htmlFor={that.possibleTrend}>Trend</label></div>
                              </div>
                );
            })();
                
            }else{
                renderPossibleAnalysis = <div>No Variables</div>
            }
            */}
        }
        if(this.props.dataSetTimeDimensions.length == 0){
            $('#analysisList input[type="checkbox"]').last().attr("disabled", true);
        }else{
            $('#analysisList input[type="checkbox"]').last().attr("disabled", false);
        }
        // end of possible analysis list ------------------------------------
        return (
                <div className="side-body">
                <div className="main-content">
                <div className="panel panel-default">
                <div className="panel-body">
                <Form onSubmit={this.createSignal.bind(this)}>
                <FormGroup role="form">
                <div className="row">
                <label className="col-lg-2" for="signalVariableList">I want to analyze</label>
                <div className="col-lg-4">
                <div className="htmlForm-group">
                <select className="form-control" id="signalVariableList" onChange={this.setPossibleList.bind(this)}>
                {renderSelectBox}
                </select>
                </div>
                </div>{/*<!-- /.col-lg-4 -->*/}
                
                </div>{/*<!-- /.row -->*/}
                <br/>
                {/*  adding selection component */}
                <DataVariableSelection/>
                <AdvanceSettings  onRef={ref => (this.child = ref)}  />
                {/*---------end of selection component----------------------*/}
                <div className="row">
                <div className="col-md-12">
                <div className="panel panel-alt4 panel-borders">
                <div className="panel-heading text-center">Type of Signals</div>
                <div className="panel-body text-center" id="analysisList" >
                {renderSubList}
                <div className="pull-right cursor">
				<a className="cursor" onClick={this.openAdvanceSettingsModal.bind(this)}>Advanced Settings</a>
				</div>
                </div>
                
                </div>
                </div>
                </div>
                <div className="row">
                <div className="col-lg-4 col-lg-offset-8">
                <div className="htmlForm-group">
                <input type="text" name="createSname" id="createSname"  required={true} className="form-control input-sm" placeholder="Enter a signal name"/>
                    </div>
                </div>{/*<!-- /.col-lg-4 -->*/}
                </div>
                <hr/>
                <div className="row">
                <div className="col-md-12 text-right">
                <button type="submit" className="btn btn-primary">CREATE SIGNAL</button>
                </div>
                </div>
                </FormGroup>
                </Form>
                
                </div>
                </div>
                <CreateSignalLoader />
               
                </div>
                </div>
                
        )
    }
    
}
