import React from "react";
import {MainHeader} from "../common/MainHeader";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import store from "../../store";
import {Modal,Button,Tab,Row,Col,Nav,NavItem,Form,FormGroup,FormControl} from "react-bootstrap";
import {createModel,getRegressionAppAlgorithmData,setDefaultAutomatic,updateAlgorithmData,checkAtleastOneSelected} from "../../actions/appActions";
import {AppsLoader} from "../common/AppsLoader";
import {getDataSetPreview} from "../../actions/dataActions";
import {RegressionParameter} from "./RegressionParameter";
import {STATIC_URL} from "../../helpers/env.js";
import {statusMessages} from "../../helpers/helper";

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
    }
    componentWillMount() {
        //It will trigger when refresh happens on url
        if(this.props.apps_regression_modelName == "" || this.props.currentAppDetails == null){
            window.history.go(-1);
        }
        this.props.dispatch(getRegressionAppAlgorithmData(this.props.match.params.slug,this.props.currentAppDetails.app_type));
        
    }
    componentDidMount() {
        $("#manualBlock_111").addClass("dispnone");
        $("#automaticBlock_111").removeClass("dispnone");
          
    }
    createModel(event){
        event.preventDefault();
        let isSelected = checkAtleastOneSelected();
        if(isSelected == false){
            let msg= statusMessages("warning","Please select atleast one algorithm...","small_mascot");
            bootbox.alert(msg);
            return false;
        }
        this.props.dispatch(createModel(store.getState().apps.apps_regression_modelName,store.getState().apps.apps_regression_targetType,store.getState().apps.apps_regression_levelCount));
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
    render() {
        if(store.getState().apps.modelSummaryFlag){
            let _link = "/apps/"+store.getState().apps.currentAppDetails.slug+'/models/'+store.getState().apps.modelSlug;
            return(<Redirect to={_link}/>);
        }
        var algorithmData = this.props.automaticAlgorithmData;
        if (!$.isEmptyObject(algorithmData)){
       var automaticData = algorithmData.map((data,Index) =>{
           var collapseId = "collapse-auto"+Index;
           var collapse = "#collapse-auto"+Index;
        var automaticDataParams = data.parameters.map((params,paramIndex) =>{
            var automaticKey = "automatic"+paramIndex;
                                                        if(params.display == true){
                                                            return(
                                                                    <div class="form-group">
                                                                        <label class="col-md-3 control-label read">{params.displayName}</label>  
                                                                        <RegressionParameter key={automaticKey} uniqueTag={automaticKey} parameterData={params} algorithmSlug={data.algorithmSlug}/>
                                                                    </div>
                                                                );
                                                            }
                                                        });
                       return(
                                <div class="panel panel-default">
                                    <div class="panel-heading">					
                                        <h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion8" href={collapse}><i class="fa fa-angle-down"></i> {data.algorithmName}</a></h4>					
                                    </div>
                                    <div id={collapseId} class="panel-collapse collapse in">
                                        <div class="panel-body">
                                            <div class="container-fluid">
                                                <form class="form-horizontal">
                                                    <div class="row">
                                                    {automaticDataParams}
                                                       			
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                         );
                    });
        var manualAlgorithmData = this.props.manualAlgorithmData;
        var manualData = manualAlgorithmData.map((data,Index) =>{
           var collapseId = "collapse-manual"+Index;
           var collapse = "#collapse-manual"+Index;
        var manualDataParams = data.parameters.map((params,paramIndex) =>{
            var manualKey = "manual"+paramIndex;
                                                         if(params.display == true){
                                                            return(
                                                                    <div class="form-group">
                                                                        <label class="col-md-3 control-label read">{params.displayName}</label>  
                                                                        <RegressionParameter key={manualKey} uniqueTag={manualKey} parameterData={params} algorithmSlug={data.algorithmSlug}/>
                                                                    </div>
                                                            );
                                                         }
                                                        });
                       return(
                                <div className="panel panel-default">
                                    <div className="panel-heading">	

                                    <div className="checkbox">
                                    <div className="ma-checkbox inline">
                                    <input type="checkbox" checked={data.selected} id={collapse} onChange={this.changeAlgorithmSelection.bind(this,data)}/><label for={collapse}>&nbsp;</label>
                                    </div>
                                    </div>

                                    <label data-toggle="collapse" data-parent="#accordion9" data-target={collapse} aria-expanded="false" aria-controls={collapseId} title="Edit Parameter"  class="btn btn-space btn-default btn-xs">
                                    <i className="fa fa-pencil-square-o"></i>
                                    </label>
                                    {data.algorithmName}

                                    </div>
                                    <div id={collapseId} className="panel-collapse collapse in">
                                        <div className="panel-body">
                                            <div className="container-fluid">
                                                <form className="form-horizontal">
                                                    <div className="row">
                                                    {manualDataParams}
                                                       			
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                         );
                    });
        return(
                <div className="side-body">
                    <div className="page-head">
                        <div className="row">
                            <div className="col-md-8">
                                <h3 class="xs-mt-0 text-capitalize">Algorithm Selection</h3>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                    <div className="main-content">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="panel box-shadow">
                                    <div class="panel-body no-border xs-p-20">
                                        <div class="ma-radio inline">
                                            <input type="radio" name="alg_selectionauto" id="radAuto" checked={store.getState().apps.regression_isAutomatic=='1'} value="1" onChange={this.handleOptionChange.bind(this)} /><label for="radAuto">Automatic</label>
                                        </div>
                                        <div class="ma-radio inline">
                                            <input type="radio" name="alg_selectionauto" id="radManu" value="0" onChange={this.handleOptionChange.bind(this)} /><label for="radManu">Manual</label>
                                        </div>
                                        <div class="clearfix"></div>
                                     <div class="automaticBlock" id="automaticBlock_111">
                                            <div id="accordion8" class="panel-group accordion accordion-color">
                                            {automaticData}
                                            </div>
                                        </div> 
                                        <div class="manualBlock" id="manualBlock_111">
                                            <div id="accordion9" class="panel-group accordion accordion-color">
                                            {manualData}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 text-right">
                                <Button type="button" bsStyle="primary" onClick={this.createModel.bind(this)}>Create Model</Button>
                            </div>
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
}
