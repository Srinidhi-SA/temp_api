import React from "react";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import ReactDOM from 'react-dom';
import {push} from "react-router-redux";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import store from "../../store";
import {selectedAnalysisList,resetSelectedVariables,unselectAllPossibleAnalysis,getDataSetPreview,setDimensionSubLevels,selectAllAnalysisList} from "../../actions/dataActions";
import {openCreateSignalModal,closeCreateSignalModal,updateCsLoaderValue} from "../../actions/createSignalActions";
import {createSignal,setPossibleAnalysisList,emptySignalAnalysis,advanceSettingsModal} from "../../actions/signalActions";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {CreateSignalLoader} from "../common/CreateSignalLoader";
import {openCsLoaderModal,closeCsLoaderModal} from "../../actions/createSignalActions";
import {AdvanceSettings} from "./AdvanceSettings";


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
        dataSetTimeDimensions:store.datasets.dataSetTimeDimensions,
        selectedVariablesCount: store.datasets.selectedVariablesCount,
        dataSetAnalysisList:store.datasets.dataSetAnalysisList,
		//selectedTrendSub:store.datasets.selectedTrendSub,
		dataSetAnalysisList:store.datasets.dataSetAnalysisList,
		dimensionSubLevel:store.datasets.dimensionSubLevel,

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


        props.dispatch(emptySignalAnalysis());


    }

    handleAnlysisList(e){
        this.props.dispatch(selectedAnalysisList(e))

    }
	 handleAllAnlysis(e){
      this.props.dispatch(selectAllAnalysisList(e))

  }
    openAdvanceSettingsModal(){
    	this.child.openAdvanceSettingsModal();
    }
    createSignal(event){
        event.preventDefault();
		if($('#signalVariableList option:selected').val() != ""){
        console.log("while creating signal")
        console.log(this.props);
       this.signalFlag = false;
       this.props.dispatch(updateCsLoaderValue(3))
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

       // console.log(postData);
       // po
	   if(this.props.getVarType.toLowerCase() == "measure"){
		  // postData['trend-sub'] = this.props.selectedTrendSub;
		   postData['advanced_settings'] = this.props.dataSetAnalysisList.measures;

	   }else if(this.props.getVarType.toLowerCase() == "dimension"){
		   //postData['trend-sub'] = this.props.selectedTrendSub;
		   postData['advanced_settings'] = this.props.dataSetAnalysisList.dimensions;
		   this.props.dataSetAnalysisList.dimensions.targetLevels.push(this.props.dimensionSubLevel);
		   //postData['dimension-sub-level'] = this.props.dimensionSubLevel;

	   }
	   console.log(postData);
        this.props.dispatch(createSignal(postData));
		}else{
			
			alert("Please select a variable to analyze...")
		}
    }

    setPossibleList(e){

        this.props.dispatch(setPossibleAnalysisList(e.target.value,$('#signalVariableList option:selected').text()));
    }

    componentWillMount(){
        if (this.props.dataPreview == null) {
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
        }
    }

    componentDidMount(){
        var that = this;

        $(function(){
			//alert($('#signalVariableList option:selected').val());
            that.props.dispatch(setPossibleAnalysisList($('#signalVariableList option:selected').val(),$('#signalVariableList option:selected').text()));
	  });
    }

    componentWillUpdate(){
        console.log("trend disbale check:::: ");
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
       $(function(){
           that.props.dispatch(setPossibleAnalysisList($('#signalVariableList option:selected').val(),$('#signalVariableList option:selected').text()));
        });

	     if(!this.props.getVarType){
			$("#allAnalysis").prop("disabled",true);
			$("#advance-setting-link").hide();
		 }else{
			 $("#allAnalysis").prop("disabled",false);
			 $("#advance-setting-link").show();
		 }

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



	if(that.props.getVarText && that.props.getVarType){ //getting selected dimension's sub levels

		if(that.props.getVarType == "dimension"){
			let columnData = store.getState().datasets.dataPreview.meta_data.columnData;
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

		   that.props.dispatch(setDimensionSubLevels(subLevels));

		}else{

			 that.props.dispatch(setDimensionSubLevels(null));
		} // end of if dimension - code to setup sub level in popup

	}


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
      /*  if(this.props.dataSetTimeDimensions.length == 0){
            $('#analysisList input[type="checkbox"]').last().attr("disabled", true);
        }else{
            $('#analysisList input[type="checkbox"]').last().attr("disabled", false);
        }*/
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
				<option value=""></option>
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
				<div className="ma-checkbox inline"><input id="allAnalysis" type="checkbox" className="allAnalysis" onClick={this.handleAllAnlysis.bind(this)}  /><label htmlFor="allAnalysis">Select All</label></div>
                {renderSubList}
                <div className="pull-right cursor">
				<a className="cursor" id="advance-setting-link" onClick={this.openAdvanceSettingsModal.bind(this)}>Advanced Settings</a>
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
