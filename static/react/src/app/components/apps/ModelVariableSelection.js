import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import {DataVariableSelection} from "../data/DataVariableSelection";
import {updateTrainAndTest,createModel,updateSelectedVariable,showLevelCountsForTarget} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview} from "../../actions/dataActions";
import {hideTargetVariable} from "../../actions/signalActions";

@connect((store) => {
    return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
        trainValue:store.apps.trainValue,testValue:store.apps.testValue,
        modelSummaryFlag:store.apps.modelSummaryFlag,
        modelSlug:store.apps.modelSlug,
        targetLevelCounts:store.apps.targetLevelCounts,
        currentAppDetails:store.apps.currentAppDetails,
    };
})

export class ModelVariableSelection extends React.Component {
    constructor(props) {
        super(props);

    }
    componentWillMount() {
        //It will trigger when refresh happens on url
        if(this.props.dataPreview == null){
            this.props.dispatch(getDataSetPreview(this.props.match.params.slug));
        }
        this.props.dispatch(updateTrainAndTest(50))
    }
    handleRangeSlider(e){
        this.props.dispatch(updateTrainAndTest(e.target.value))
    }
    createModel(event){
        event.preventDefault();
        this.props.dispatch(createModel($("#createModelName").val(),$("#createModelAnalysisList").val()))
    }
    setPossibleList(event){
        this.props.dispatch(showLevelCountsForTarget(event))
        this.props.dispatch(hideTargetVariable(event));
        this.props.dispatch(updateSelectedVariable(event));
    }
    render() {
        console.log("Create Model Variable Selection  is called##########3");
       let custom_word1 = "";
       let custom_word2 = "";
        if(store.getState().apps.modelSummaryFlag){
            let _link = "/apps/"+store.getState().apps.currentAppId+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        let renderLevelCountSelectBox = null;
        if(dataPrev){
            const metaData = dataPrev.meta_data.uiMetaData.varibaleSelectionArray;
            if(metaData){
                renderSelectBox =  <select className="form-control" onChange={this.setPossibleList.bind(this)} id="createModelAnalysisList">
                    <option value=""></option>
                {metaData.map((metaItem,metaIndex) =>{
                    if(metaItem.columnType !="datetime" && !metaItem.dateSuggestionFlag){
                        return(<option key={metaItem.slug}  name={metaItem.slug}  value={metaItem.columnType}>{metaItem.name}</option>)
                    }
                }
                )}
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
            custom_word2 = this.props.currentAppDetails.custom_word2
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

                <div className="form-group">
                <label className="col-lg-4"><h4>I want to predict {custom_word1}</h4></label>
                </div>
                </div>
                
                <div className="row">

                <div className="form-group">
                <label className="col-lg-2">Select Target Variable :</label>
                <div className="col-lg-4"> {renderSelectBox}</div>
                </div>
                 {/*<!-- /.col-lg-4 -->*/}
                </div>
                {(this.props.targetLevelCounts != null)? ( <div className="row xs-mt-10">
                    <div className="form-group">
                    <label className="col-lg-2">Choose Value for {custom_word2}</label>
                    <div className="col-lg-4"> {renderLevelCountSelectBox}</div>
                    </div>
                     {/*<!-- /.col-lg-4 -->*/}
                    </div>) : (<div></div>)
                    
                }
             
                <DataVariableSelection/>
                <div className="row">
                <div className="col-lg-8">
                <div id="range" >
                <div id="rangeLeftSpan" >Train <span id="trainPercent">{store.getState().apps.trainValue}</span></div>
                <input type="range" id="rangeElement"  onChange={this.handleRangeSlider.bind(this)}  min={50} defaultValue={50} />
                <div id="rangeRightSpan" ><span id="testPercent">{store.getState().apps.testValue}</span> Test </div>
                </div>
                </div>
                <div className="col-lg-4">
                <div className="form-group">
                <input type="text" name="createModelName" required={true} id="createModelName" className="form-control input-sm" placeholder="Create Model Name" />
                    </div>
                </div>{/*<!-- /.col-lg-4 -->*/}
                </div>
                <div className="row">
                <div className="col-lg-12 text-right">
                <Button type="submit" bsStyle="primary">Create Model</Button>
                </div>
                </div>
                </FormGroup>
                </Form>
                </div>
                </div>
                </div>
                <AppsLoader/>
                </div>
        );
    }
}
