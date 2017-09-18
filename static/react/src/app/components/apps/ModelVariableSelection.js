import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";

import {C3Chart} from "../c3Chart";
import ReactDOM from 'react-dom';
import {DataVariableSelection} from "../data/DataVariableSelection";
import {updateTrainAndTest,createModel} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview} from "../../actions/dataActions";

@connect((store) => {
    return {login_response: store.login.login_response, dataPreview: store.datasets.dataPreview,
        trainValue:store.apps.trainValue,testValue:store.apps.testValue,
        modelSummaryFlag:store.apps.modelSummaryFlag,
        modelSlug:store.apps.modelSlug,
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
    }
    handleRangeSlider(e){
        this.props.dispatch(updateTrainAndTest(e))
    }
    createModel(event){
        event.preventDefault();
        this.props.dispatch(createModel($("#createModelName").val(),$("#createModelAnalysisList").val()))
    }
    render() {
        console.log("Create Model Variable Selection  is called##########3");
        {/* */}
        if(store.getState().apps.modelSummaryFlag){
            let _link = "/apps/"+store.getState().apps.currentAppId+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
        let dataPrev = store.getState().datasets.dataPreview;
        let renderSelectBox = null;
        if(dataPrev){
            const metaData = dataPrev.meta_data.columnData;
            if(metaData){
                renderSelectBox =  <select className="form-control" id="createModelAnalysisList">
                {metaData.map((metaItem,metaIndex) =>{
                    if(metaItem.columnType !="datetime" && !metaItem.ignoreSuggestionFlag && !metaItem.dateSuggestionFlag){
                        return(<option key={metaIndex} value={metaItem.name}>{metaItem.name}</option>)
                    }
                }
                )}
                </select>
            }else{
                renderSelectBox = <option>No Variables</option>
            }
        }
        return(
                <div className="side-body">
                <div className="page-head">
                <div className="row">
                <div className="col-md-8">
                <h2>Variable Selection</h2>
                </div>
                </div>
                <div className="clearfix"></div>
                </div>
                <div className="main-content">
                <div className="panel panel-default">
                <div className="panel-body">    
                <Form onSubmit={this.createModel.bind(this)}>
                <FormGroup role="form">
                <div className="row">			          
                <div className="col-lg-12">
                <div className="form-group">
                <div className="col-lg-2"><label>I want to analyse</label></div>
                <div className="col-lg-4"> {renderSelectBox}</div>
                </div>
                </div>{/*<!-- /.col-lg-4 -->*/}
                </div>
                
                <DataVariableSelection/>
                <div className="row">
                <div className="col-lg-8">
                <div id="range" >
                <div id="rangeLeftSpan" >Train <span id="trainPercent">{store.getState().apps.trainValue}</span></div>
                <input type="range" id="rangeElement"  onChange={this.handleRangeSlider.bind(this)} min={50} />
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
                <div className="col-lg-2 col-lg-offset-10">
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
